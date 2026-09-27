import { convertCatalogToShopifyCsv, type CatalogExportInput } from './shopify/csvAdapter';
import { convertCatalogToWooCommerceCsv } from './woocommerce/csvAdapter';
import { convertCatalogToUniversalCsv } from './universal/csvAdapter';

export type ExportPlatform = 'shopify' | 'woocommerce' | 'universal';

export const EXPORT_PLATFORMS: Record<ExportPlatform, { convert: (catalog: CatalogExportInput) => string; fileSuffix: string; multiPlatform: boolean }> = {
    shopify: { convert: convertCatalogToShopifyCsv, fileSuffix: 'shopify', multiPlatform: false },
    woocommerce: { convert: convertCatalogToWooCommerceCsv, fileSuffix: 'woocommerce', multiPlatform: true },
    universal: { convert: convertCatalogToUniversalCsv, fileSuffix: 'universal', multiPlatform: true },
};

export const isExportPlatform = (value: unknown): value is ExportPlatform =>
    typeof value === 'string' && Object.prototype.hasOwnProperty.call(EXPORT_PLATFORMS, value);
