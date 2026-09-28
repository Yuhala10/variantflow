import Papa from 'papaparse';
import { generateCartesianMatrix, generateVariantId } from '../variant/generateVariants';

export type ColumnRole = 'title' | 'sku' | 'price' | 'option' | 'ignore';

export interface ColumnMapping {
    role: ColumnRole;
    /** Option name when role is "option". */
    optionName?: string;
    /** How the suggestion was made, shown to the user. */
    source?: 'header' | 'content' | 'manual';
}

export interface ParsedCsv {
    headers: string[];
    rows: Record<string, string>[];
}

export interface ImportedCatalog {
    productTitle: string;
    options: Array<{ name: string; values: string[] }>;
    basePrice: number;
    overrides: Record<string, { sku?: string; price?: number }>;
    /** Generated combinations that are not in the file. */
    excluded: string[];
    /** `rows` counts the selected product's rows only; `products` is how many products the file lists. */
    stats: { rows: number; imported: number; skipped: number; variants: number; droppedOptions: string[]; products: number };
}

// Shopify allows three options per product; extra option columns are reported, not imported.
export const MAX_IMPORT_OPTIONS = 3;

const HEADER_ALIASES: Record<Exclude<ColumnRole, 'ignore' | 'option'>, string[]> = {
    title: ['title', 'product title', 'product name', 'product', 'name', 'item name', 'titre', 'nom', 'nom du produit', 'produit', 'designation', 'désignation'],
    sku: ['sku', 'variant sku', 'item sku', 'product code', 'item code', 'code', 'reference', 'référence', 'ref', 'réf', 'code article', 'article'],
    price: ['price', 'unit price', 'retail price', 'sale price', 'regular price', 'amount', 'cost', 'prix', 'prix unitaire', 'prix de vente', 'tarif', 'montant'],
};

const OPTION_ALIASES: Record<string, string[]> = {
    Size: ['size', 'sizes', 'variant size', 'taille', 'tailles', 'pointure'],
    Color: ['color', 'colour', 'colors', 'variant color', 'couleur', 'couleurs', 'coloris'],
    Material: ['material', 'fabric', 'composition', 'matière', 'matiere', 'tissu'],
    Style: ['style', 'model', 'modèle', 'modele', 'variant', 'variante'],
};

const IGNORED_HEADERS = ['category', 'collection', 'department', 'catégorie', 'categorie', 'description', 'image', 'barcode', 'ean', 'upc', 'vendor', 'brand', 'marque', 'stock', 'quantity', 'quantité', 'weight', 'poids'];

const SIZE_WORDS = new Set(['xxs', 'xs', 's', 'm', 'l', 'xl', 'xxl', '2xl', 'xxxl', '3xl', 'small', 'medium', 'large', 'petit', 'moyen', 'grand']);
const COLOR_WORDS = new Set([
    'black', 'white', 'red', 'blue', 'green', 'yellow', 'grey', 'gray', 'navy', 'pink', 'purple', 'orange', 'brown', 'beige', 'sand', 'olive', 'cream', 'khaki',
    'noir', 'blanc', 'rouge', 'bleu', 'vert', 'jaune', 'gris', 'rose', 'violet', 'marron', 'crème', 'creme', 'kaki', 'marine',
]);

// A number optionally wrapped in a currency symbol or code: "$19.99", "59,90 €", "USD 19", "15000 FCFA".
const PRICE_PATTERN = /^(?:[$€£¥₦]|usd|eur|gbp|cad|xaf|xof|fcfa|cfa)?\s?\d[\d\s.,]*\s?(?:[$€£¥₦]|usd|eur|gbp|cad|xaf|xof|fcfa|cfa)?$/i;

const normalizeHeader = (value: string) => value.trim().toLowerCase().replace(/[_\-.]+/g, ' ').replace(/\s+/g, ' ');

export function parseCsv(text: string): ParsedCsv {
    const parsed = Papa.parse<Record<string, string>>(text.trim(), { header: true, skipEmptyLines: 'greedy', transformHeader: (header) => header.trim() });
    const headers = (parsed.meta.fields ?? []).filter(Boolean);
    const rows = (parsed.data ?? []).map((row) => {
        const clean: Record<string, string> = {};
        headers.forEach((header) => { clean[header] = String(row[header] ?? ''); });
        return clean;
    }).filter((row) => Object.values(row).some((value) => value.trim()));
    return { headers, rows };
}

/** Parses "$20.00", "20,00 €", "1 299,90" or "USD 19" into a number. */
export function parsePrice(raw: string): number | null {
    let value = raw.replace(/[^\d.,-]/g, '');
    if (!value) return null;
    if (value.includes(',') && value.includes('.')) {
        value = value.lastIndexOf(',') > value.lastIndexOf('.') ? value.replace(/\./g, '').replace(',', '.') : value.replace(/,/g, '');
    } else if (value.includes(',')) {
        value = /,\d{1,2}$/.test(value) ? value.replace(',', '.') : value.replace(/,/g, '');
    }
    const number = parseFloat(value);
    return Number.isFinite(number) ? Math.round(number * 100) / 100 : null;
}

const matchHeader = (header: string): ColumnMapping | null => {
    const normalized = normalizeHeader(header);
    for (const [role, aliases] of Object.entries(HEADER_ALIASES)) {
        if (aliases.includes(normalized)) return { role: role as ColumnRole, source: 'header' };
    }
    for (const [optionName, aliases] of Object.entries(OPTION_ALIASES)) {
        if (aliases.includes(normalized)) return { role: 'option', optionName, source: 'header' };
    }
    // Looser "contains" match, e.g. "Retail Price (USD)" or "Colour family".
    for (const [role, aliases] of Object.entries(HEADER_ALIASES)) {
        if (aliases.some((alias) => alias.length > 3 && normalized.includes(alias))) return { role: role as ColumnRole, source: 'header' };
    }
    for (const [optionName, aliases] of Object.entries(OPTION_ALIASES)) {
        if (aliases.some((alias) => alias.length > 3 && normalized.includes(alias))) return { role: 'option', optionName, source: 'header' };
    }
    if (IGNORED_HEADERS.some((ignored) => normalized.includes(ignored))) return { role: 'ignore', source: 'header' };
    return null;
};

const inferFromContent = (header: string, rows: Record<string, string>[]): ColumnMapping | null => {
    const values = rows.map((row) => row[header]?.trim() ?? '').filter(Boolean);
    if (values.length === 0) return null;
    const distinct = new Set(values.map((value) => value.toLowerCase()));
    const share = (predicate: (value: string) => boolean) => values.filter(predicate).length / values.length;

    if (share((value) => PRICE_PATTERN.test(value) && parsePrice(value) !== null) > 0.9) {
        return { role: 'price', source: 'content' };
    }
    if (share((value) => SIZE_WORDS.has(value.toLowerCase()) || /^\d{2}$/.test(value)) > 0.8) {
        return { role: 'option', optionName: 'Size', source: 'content' };
    }
    if (share((value) => COLOR_WORDS.has(value.toLowerCase())) > 0.7) {
        return { role: 'option', optionName: 'Color', source: 'content' };
    }
    if (distinct.size === values.length && share((value) => /^[A-Za-z0-9][A-Za-z0-9_-]{2,}$/.test(value) && /\d/.test(value)) > 0.9) {
        return { role: 'sku', source: 'content' };
    }
    if (distinct.size <= 3 && values.length > 3 && share((value) => value.length > 12) > 0.8) {
        return { role: 'title', source: 'content' };
    }
    if (distinct.size >= 2 && distinct.size <= 25 && distinct.size < values.length * 0.8) {
        return { role: 'option', optionName: header.trim(), source: 'content' };
    }
    return null;
};

/**
 * Suggests a role for every column.
 * - Pro: header names (English and French aliases).
 * - Scale ("smart"): header names first, then the column's actual values.
 */
export function suggestMapping({ headers, rows }: ParsedCsv, smart: boolean): Record<string, ColumnMapping> {
    const mapping: Record<string, ColumnMapping> = {};
    const taken = new Set<string>();

    headers.forEach((header) => {
        let suggestion = matchHeader(header) ?? (smart ? inferFromContent(header, rows) : null) ?? { role: 'ignore' as const };
        // Title, SKU and price may only be mapped once; later duplicates are ignored.
        if (suggestion.role !== 'option' && suggestion.role !== 'ignore') {
            if (taken.has(suggestion.role)) suggestion = { role: 'ignore' };
            else taken.add(suggestion.role);
        }
        if (suggestion.role === 'option') {
            const name = suggestion.optionName ?? header;
            if (taken.has(`option:${name.toLowerCase()}`)) suggestion = { role: 'ignore' };
            else taken.add(`option:${name.toLowerCase()}`);
        }
        mapping[header] = suggestion;
    });

    return mapping;
}

/** Pro: basic cleanup — trims, collapses whitespace, removes underscores and stray quotes. */
export const cleanValue = (value: string) => value.replace(/^["']+|["']+$/g, '').replace(/_+/g, ' ').replace(/\s+/g, ' ').trim();

const SIZE_CANONICAL: Record<string, string> = {
    'xx small': 'XXS', 'xxs': 'XXS', 'x small': 'XS', 'extra small': 'XS', 'xs': 'XS',
    'small': 'S', 'sm': 'S', 's': 'S', 'petit': 'S',
    'medium': 'M', 'med': 'M', 'm': 'M', 'moyen': 'M',
    'large': 'L', 'lg': 'L', 'l': 'L', 'grand': 'L',
    'x large': 'XL', 'extra large': 'XL', 'xl': 'XL',
    'xx large': 'XXL', '2xl': 'XXL', 'xxl': 'XXL', '2x': 'XXL',
    'xxx large': 'XXXL', '3xl': 'XXXL', 'xxxl': 'XXXL', '3x': 'XXXL',
};

const titleCase = (value: string) => value.toLowerCase().replace(/(^|[\s/-])(\p{L})/gu, (_, separator: string, letter: string) => separator + letter.toUpperCase());

/** Scale: full normalization — cleanup plus canonical sizes and consistent capitalization. */
export function normalizeValue(value: string, optionName: string) {
    const cleaned = cleanValue(value).replace(/-/g, ' ').replace(/\s+/g, ' ').trim();
    const key = cleaned.toLowerCase();
    if (/size|taille/i.test(optionName) && SIZE_CANONICAL[key]) return SIZE_CANONICAL[key];
    if (/^[A-Z0-9]{1,4}$/.test(cleaned)) return cleaned;
    return titleCase(cleaned);
}

const titleColumnOf = (mapping: Record<string, ColumnMapping>) => Object.entries(mapping).find(([, column]) => column.role === 'title')?.[0];

/**
 * Supplier sheets often list several products. Returns each distinct product title with its row
 * count, in file order, so the merchant can import one product at a time.
 */
export function listProducts(rows: Record<string, string>[], mapping: Record<string, ColumnMapping>): Array<{ title: string; rows: number }> {
    const titleColumn = titleColumnOf(mapping);
    if (!titleColumn) return [];
    const counts = new Map<string, { title: string; rows: number }>();
    rows.forEach((row) => {
        const title = cleanValue(row[titleColumn] ?? '');
        if (!title) return;
        const key = title.toLowerCase();
        const entry = counts.get(key);
        if (entry) entry.rows += 1;
        else counts.set(key, { title, rows: 1 });
    });
    return [...counts.values()];
}

/**
 * Automatic choice: split the file by product only when titles repeat (several rows per product).
 * When every row has its own title ("Tee Red S", "Tee Red M"…) the titles describe variants, so keep all rows.
 */
export function resolveProduct(products: Array<{ title: string; rows: number }>, product?: string | null): string | undefined {
    if (product === null) return undefined;
    if (product !== undefined) return products.find((entry) => entry.title.toLowerCase() === product.trim().toLowerCase())?.title;
    return products.length > 1 && products.some((entry) => entry.rows > 1) ? products[0].title : undefined;
}

export function buildCatalogFromRows(
    allRows: Record<string, string>[],
    mapping: Record<string, ColumnMapping>,
    { clean, normalize, product }: {
        clean: boolean;
        normalize: boolean;
        /** Product title to import, null for every row as one product, or undefined to decide automatically. */
        product?: string | null;
    },
): ImportedCatalog {
    const entries = Object.entries(mapping);
    const titleColumn = titleColumnOf(mapping);
    const skuColumn = entries.find(([, column]) => column.role === 'sku')?.[0];
    const priceColumn = entries.find(([, column]) => column.role === 'price')?.[0];
    const optionColumns = entries
        .filter(([, column]) => column.role === 'option')
        .map(([header, column]) => ({ header, name: (column.optionName || header).trim() }))
        .filter((column) => column.name);
    const usedOptions = optionColumns.slice(0, MAX_IMPORT_OPTIONS);
    const droppedOptions = optionColumns.slice(MAX_IMPORT_OPTIONS).map((column) => column.name);

    // Rows without a title (continuation rows) belong to the product above them, as in Shopify's own CSVs.
    const products = listProducts(allRows, mapping);
    const selected = resolveProduct(products, product);
    let currentTitle = '';
    const rows = titleColumn && selected
        ? allRows.filter((row) => {
            const title = cleanValue(row[titleColumn] ?? '');
            if (title) currentTitle = title;
            return currentTitle.toLowerCase() === selected.toLowerCase();
        })
        : allRows;

    const prepare = (value: string, optionName: string) => (normalize ? normalizeValue(value, optionName) : clean ? cleanValue(value) : value.trim());

    // The first spelling of a value wins, so "Red" and "red" become one value and every row keeps its SKU and price.
    const valuesByOption = new Map<string, Map<string, string>>(usedOptions.map((column) => [column.name, new Map()]));
    const parsedRows: Array<{ attributes: Record<string, string>; sku?: string; price: number | null }> = [];
    let skipped = 0;

    rows.forEach((row) => {
        const raw = usedOptions.map((column) => ({ name: column.name, value: prepare(row[column.header] ?? '', column.name) }));
        if (!usedOptions.length || raw.some((entry) => !entry.value)) {
            skipped += 1;
            return;
        }
        const attributes: Record<string, string> = {};
        raw.forEach(({ name, value }) => {
            const known = valuesByOption.get(name)!;
            const key = value.toLowerCase();
            if (!known.has(key)) known.set(key, value);
            attributes[name] = known.get(key)!;
        });
        const price = priceColumn ? parsePrice(row[priceColumn] ?? '') : null;
        const skuRaw = skuColumn ? (clean || normalize ? cleanValue(row[skuColumn] ?? '') : (row[skuColumn] ?? '').trim()) : '';
        parsedRows.push({ attributes, sku: skuRaw ? skuRaw.replace(/\s+/g, '-').toUpperCase() : undefined, price });
    });

    const seen = new Set<string>();
    const unique = parsedRows.filter((row) => {
        const id = generateVariantId(row.attributes);
        if (seen.has(id)) { skipped += 1; return false; }
        seen.add(id);
        return true;
    });

    // The most common price becomes the base price; other rows keep their own price as an override.
    const counts = new Map<number, number>();
    unique.forEach((row) => { if (row.price !== null) counts.set(row.price, (counts.get(row.price) ?? 0) + 1); });
    const basePrice = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0] - b[0])[0]?.[0] ?? 0;

    const overrides: ImportedCatalog['overrides'] = {};
    unique.forEach((row) => {
        const override: { sku?: string; price?: number } = {};
        if (row.sku) override.sku = row.sku;
        if (row.price !== null && row.price !== basePrice) override.price = row.price;
        if (Object.keys(override).length) overrides[generateVariantId(row.attributes)] = override;
    });

    const options = usedOptions.map((column) => ({ name: column.name, values: [...(valuesByOption.get(column.name)?.values() ?? [])] }));
    // Combinations the supplier does not sell are hidden rather than invented.
    const excluded = options.length
        ? generateCartesianMatrix(options.map((option, index) => ({ id: String(index), ...option })))
            .map(generateVariantId)
            .filter((id) => !seen.has(id))
        : [];

    return {
        productTitle: selected ?? products[0]?.title ?? '',
        options,
        basePrice,
        overrides,
        excluded,
        stats: { rows: rows.length, imported: seen.size, skipped, variants: seen.size, droppedOptions, products: products.length },
    };
}
