import { describe, expect, it } from 'vitest';
import { buildCatalogFromRows, listProducts, parseCsv, parsePrice, resolveProduct, suggestMapping } from '../domain/import/importCatalog';
import { generateVariantId } from '../domain/variant/generateVariants';

const importText = (text: string, options: { smart?: boolean; product?: string | null } = {}) => {
    const parsed = parseCsv(text);
    const mapping = suggestMapping(parsed, options.smart ?? false);
    return { parsed, mapping, catalog: buildCatalogFromRows(parsed.rows, mapping, { clean: true, normalize: false, product: options.product }) };
};

describe('parsePrice', () => {
    it.each([
        ['$20.00', 20], ['20,00 €', 20], ['1 299,90', 1299.9], ['1,299.90', 1299.9], ['USD 19', 19], ['15000 FCFA', 15000], ['', null],
    ])('parses %s', (raw, expected) => expect(parsePrice(raw)).toBe(expected));
});

describe('suggestMapping', () => {
    it('maps English and French headers', () => {
        const { mapping } = importText('Nom du produit,Taille,Couleur,Référence,Prix\nTee,S,Rouge,T1,10');
        expect(mapping['Nom du produit'].role).toBe('title');
        expect(mapping.Taille).toMatchObject({ role: 'option', optionName: 'Size' });
        expect(mapping.Couleur).toMatchObject({ role: 'option', optionName: 'Color' });
        expect(mapping['Référence'].role).toBe('sku');
        expect(mapping.Prix.role).toBe('price');
    });

    it('infers roles from content on Scale', () => {
        const { mapping } = importText('a,b,c\nS,Black,$10\nM,White,$10\nL,Black,$12', { smart: true });
        expect(mapping.a).toMatchObject({ role: 'option', optionName: 'Size' });
        expect(mapping.b).toMatchObject({ role: 'option', optionName: 'Color' });
        expect(mapping.c.role).toBe('price');
    });
});

describe('buildCatalogFromRows', () => {
    it('hides combinations the supplier does not sell instead of inventing them', () => {
        const { catalog } = importText('Title,Size,Color,SKU,Price\nTee,S,Red,T-S-R,10\nTee,M,Blue,T-M-B,12');
        expect(catalog.stats.variants).toBe(2);
        expect(catalog.excluded.sort()).toEqual([
            generateVariantId({ Size: 'M', Color: 'Red' }),
            generateVariantId({ Size: 'S', Color: 'Blue' }),
        ].sort());
    });

    it('keeps SKUs and prices for rows whose values differ only in case', () => {
        const { catalog } = importText('Title,Size,Color,SKU,Price\nTee,S,Red,A1,10\nTee,M,red,A2,15');
        expect(catalog.options.find((option) => option.name === 'Color')?.values).toEqual(['Red']);
        expect(catalog.overrides[generateVariantId({ Size: 'M', Color: 'Red' })]).toEqual({ sku: 'A2', price: 15 });
    });

    it('uses the most common price as the base price', () => {
        const { catalog } = importText('Size,Price\nS,10\nM,10\nL,14');
        expect(catalog.basePrice).toBe(10);
        expect(catalog.overrides[generateVariantId({ Size: 'L' })]).toEqual({ price: 14 });
    });

    it('does not collect values from skipped rows', () => {
        const { catalog } = importText('Size,Color\nS,Red\nM,\n,Blue');
        expect(catalog.options).toEqual([{ name: 'Size', values: ['S'] }, { name: 'Color', values: ['Red'] }]);
        expect(catalog.stats.skipped).toBe(2);
    });

    it('counts duplicate combinations as skipped', () => {
        const { catalog } = importText('Size\nS\ns\nM');
        expect(catalog.stats).toMatchObject({ imported: 2, skipped: 1, variants: 2 });
    });

    it('imports one product at a time from multi-product files', () => {
        const text = 'Title,Size,Price\nTee,S,10\nTee,M,10\nHoodie,S,30\nHoodie,M,30\nHoodie,L,32';
        const { parsed, mapping, catalog } = importText(text);
        expect(listProducts(parsed.rows, mapping)).toEqual([{ title: 'Tee', rows: 2 }, { title: 'Hoodie', rows: 3 }]);
        expect(catalog).toMatchObject({ productTitle: 'Tee', basePrice: 10 });
        expect(catalog.stats).toMatchObject({ rows: 2, variants: 2, products: 2 });

        const hoodie = buildCatalogFromRows(parsed.rows, mapping, { clean: true, normalize: false, product: 'hoodie' });
        expect(hoodie).toMatchObject({ productTitle: 'Hoodie', basePrice: 30 });
        expect(hoodie.stats.rows).toBe(3);
    });

    it('attaches untitled continuation rows to the product above', () => {
        const { catalog } = importText('Title,Size\nTee,S\n,M\nCap,S\nCap,M');
        expect(catalog.productTitle).toBe('Tee');
        expect(catalog.options[0].values).toEqual(['S', 'M']);
    });

    it('keeps every row when each row has its own title (variant-level names)', () => {
        const { parsed, mapping, catalog } = importText('Title,Size\nTee Red S,S\nTee Red M,M');
        expect(resolveProduct(listProducts(parsed.rows, mapping))).toBeUndefined();
        expect(catalog.stats.variants).toBe(2);
    });

    it('can merge a multi-product file into one product on request', () => {
        const { catalog } = importText('Title,Size\nTee,S\nTee,M\nCap,L\nCap,XL', { product: null });
        expect(catalog.stats.variants).toBe(4);
    });

    it('normalizes sizes and capitalization on Scale', () => {
        const parsed = parseCsv('Size,Color\nsmall,NAVY  blue\nx-large,navy blue');
        const catalog = buildCatalogFromRows(parsed.rows, suggestMapping(parsed, true), { clean: true, normalize: true });
        expect(catalog.options).toEqual([{ name: 'Size', values: ['S', 'XL'] }, { name: 'Color', values: ['Navy Blue'] }]);
    });

    it('reports option columns beyond Shopify’s three', () => {
        const { catalog } = importText('Size,Color,Material,Style\nS,Red,Cotton,Slim');
        expect(catalog.options).toHaveLength(3);
        expect(catalog.stats.droppedOptions).toEqual(['Style']);
    });
});
