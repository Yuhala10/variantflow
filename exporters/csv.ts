import type { CatalogExportInput } from './shopify/csvAdapter';

export const csvCell = (value: string | number | undefined | null) => {
    const str = value === undefined || value === null ? '' : String(value);
    return /[",\n\r]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
};

export const toCsv = (rows: Array<Array<string | number | undefined | null>>) => rows.map((row) => row.map(csvCell).join(',')).join('\n');

export const slugify = (value: string, fallback = 'product') =>
    value.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || fallback;

/** Option groups that actually contribute to variants, in display order. */
export const activeOptionGroups = (catalog: CatalogExportInput) =>
    catalog.options
        .map((option) => ({ ...option, name: option.name.trim(), values: option.values.map((value) => value.trim()).filter(Boolean) }))
        .filter((option) => option.name && option.values.length > 0);
