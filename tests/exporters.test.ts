import { describe, expect, it } from 'vitest';
import Papa from 'papaparse';
import { convertCatalogToShopifyCsv, type CatalogExportInput } from '../exporters/shopify/csvAdapter';
import { convertCatalogToWooCommerceCsv } from '../exporters/woocommerce/csvAdapter';
import { convertCatalogToUniversalCsv } from '../exporters/universal/csvAdapter';

const read = (csv: string) => Papa.parse<Record<string, string>>(csv, { header: true }).data;

const catalog: CatalogExportInput = {
    productTitle: 'Chaussure été, "Luxe"',
    options: [{ id: '1', name: ' Taille ', values: ['S', 'M'] }, { id: '2', name: 'Couleur', values: ['Rouge'] }],
    skuConfig: { pattern: '' },
    basePrice: 10,
    priceRules: [],
    variants: [
        { id: 'a', attributes: { Taille: 'S', Couleur: 'Rouge' }, sku: 'CH-S', price: 10, isSkuOverridden: false, isPriceOverridden: false },
        { id: 'b', attributes: { Taille: 'M', Couleur: 'Rouge' }, sku: 'CH-M', price: 12.5, isSkuOverridden: false, isPriceOverridden: false },
    ],
};

describe('Shopify export', () => {
    const rows = read(convertCatalogToShopifyCsv(catalog));

    it('writes one row per variant with a clean handle and the title once', () => {
        expect(rows).toHaveLength(2);
        expect(rows.map((row) => row.Handle)).toEqual(['chaussure-ete-luxe', 'chaussure-ete-luxe']);
        expect(rows[0].Title).toBe('Chaussure été, "Luxe"');
        expect(rows[1].Title).toBe('');
    });

    it('exports option values even when the option name has stray spaces', () => {
        expect(rows[0]).toMatchObject({ 'Option1 Name': 'Taille', 'Option1 Value': 'S', 'Option2 Name': 'Couleur', 'Option2 Value': 'Rouge' });
    });

    it('writes SKUs and prices with two decimals and leaves the vendor to the merchant', () => {
        expect(rows[1]).toMatchObject({ 'Variant SKU': 'CH-M', 'Variant Price': '12.50', Vendor: '' });
    });
});

describe('WooCommerce export', () => {
    const rows = read(convertCatalogToWooCommerceCsv(catalog));

    it('writes a variable parent followed by linked variations', () => {
        expect(rows[0]).toMatchObject({ Type: 'variable', 'Attribute 1 name': 'Taille', 'Attribute 1 value(s)': 'S, M' });
        expect(rows.slice(1).every((row) => row.Type === 'variation' && row.Parent === rows[0].SKU)).toBe(true);
        expect(rows[2]).toMatchObject({ SKU: 'CH-M', 'Regular price': '12.50', 'Attribute 1 value(s)': 'M' });
    });
});

describe('Universal export', () => {
    it('writes one flat row per variant', () => {
        const rows = read(convertCatalogToUniversalCsv(catalog));
        expect(rows[1]).toMatchObject({ 'Variant Title': 'M / Rouge', Taille: 'M', Couleur: 'Rouge', SKU: 'CH-M', Price: '12.50' });
    });
});
