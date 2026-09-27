import type { CatalogExportInput } from '../shopify/csvAdapter';
import { activeOptionGroups, slugify, toCsv } from '../csv';

/**
 * A clean, platform-neutral spreadsheet (one row per variant) that imports easily into
 * Wix, Squarespace, BigCommerce, Etsy tools, marketplaces, ERPs or Google Sheets.
 */
export function convertCatalogToUniversalCsv(catalog: CatalogExportInput): string {
    const groups = activeOptionGroups(catalog);
    const title = catalog.productTitle.trim();
    const handle = slugify(title);

    const headers = ['Product ID', 'Product Title', 'Variant Title', ...groups.map((group) => group.name), 'SKU', 'Price'];
    const rows = catalog.variants.map((variant) => {
        const values = groups.map((group) => variant.attributes[group.name] ?? '');
        return [handle, title, values.filter(Boolean).join(' / '), ...values, variant.sku, variant.price.toFixed(2)];
    });

    return toCsv([headers, ...rows]);
}
