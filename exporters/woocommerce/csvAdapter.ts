import type { CatalogExportInput } from '../shopify/csvAdapter';
import { activeOptionGroups, slugify, toCsv } from '../csv';

/**
 * WooCommerce's built-in product CSV importer format: one "variable" parent row
 * followed by one "variation" row per variant, linked through the parent SKU.
 */
export function convertCatalogToWooCommerceCsv(catalog: CatalogExportInput): string {
    const groups = activeOptionGroups(catalog);
    const title = catalog.productTitle.trim();
    const parentSku = `${slugify(title).toUpperCase()}-PARENT`;

    const attributeHeaders = groups.flatMap((_, index) => [
        `Attribute ${index + 1} name`,
        `Attribute ${index + 1} value(s)`,
        `Attribute ${index + 1} visible`,
        `Attribute ${index + 1} global`,
    ]);

    const headers = ['Type', 'SKU', 'Name', 'Parent', 'Published', 'Visibility in catalog', 'Tax status', 'In stock?', 'Regular price', ...attributeHeaders];

    const parent = [
        'variable', parentSku, title, '', 1, 'visible', 'taxable', 1, '',
        ...groups.flatMap((group) => [group.name, group.values.join(', '), 1, 0]),
    ];

    const variations = catalog.variants.map((variant) => [
        'variation',
        variant.sku,
        `${title} - ${groups.map((group) => variant.attributes[group.name]).filter(Boolean).join(', ')}`,
        parentSku,
        1, 'visible', 'taxable', 1,
        variant.price.toFixed(2),
        ...groups.flatMap((group) => [group.name, variant.attributes[group.name] ?? '', '', 0]),
    ]);

    return toCsv([headers, parent, ...variations]);
}
