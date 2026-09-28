import { InternalVariant, OptionGroup, PriceModifierRule, SkuTemplateConfig } from '../../types';
import { activeOptionGroups, slugify, toCsv } from '../csv';

export interface CatalogExportInput {
    productTitle: string;
    options: OptionGroup[];
    skuConfig: SkuTemplateConfig;
    basePrice: number;
    priceRules: PriceModifierRule[];
    variants: InternalVariant[];
}

export function convertCatalogToShopifyCsv(catalog: CatalogExportInput): string {

    const headers = [
        'Handle', 'Title', 'Body (HTML)', 'Vendor', 'Standard Product Type', 'Custom Product Type', 'Tags', 'Published',
        'Option1 Name', 'Option1 Value', 'Option2 Name', 'Option2 Value', 'Option3 Name', 'Option3 Value',
        'Variant SKU', 'Variant Grams', 'Variant Inventory Tracker', 'Variant Inventory Qty', 'Variant Inventory Policy',
        'Variant Fulfillment Service', 'Variant Price', 'Variant Compare At Price', 'Variant Requires Shipping',
        'Variant Taxable', 'Variant Barcode', 'Image Src', 'Image Position', 'Image Alt Text', 'Gift Card',
        'SEO Title', 'SEO Description', 'Google Shopping / Google Product Category', 'Variant Image', 'Status'
    ];

    // slugify strips accents, so "Chaussure été" becomes "chaussure-ete" rather than "chaussure-t".
    const handle = slugify(catalog.productTitle, 'product-handle');

    // Trimmed names match the variant attribute keys, so " Size " still exports its values.
    const optionGroups = activeOptionGroups(catalog);

    const rows = catalog.variants.map((variant, index) => {
        const opt1Name = optionGroups[0]?.name || '';
        const opt1Value = variant.attributes[opt1Name] || '';

        const opt2Name = optionGroups[1]?.name || '';
        const opt2Value = variant.attributes[opt2Name] || '';

        const opt3Name = optionGroups[2]?.name || '';
        const opt3Value = variant.attributes[opt3Name] || '';

        const columns = [
            handle,
            index === 0 ? catalog.productTitle.trim() : '',
            '',
            // Left empty so Shopify uses the merchant's own store name, never ours.
            '',
            '', '', '', 'True',
            opt1Name, opt1Value,
            opt2Name, opt2Value,
            opt3Name, opt3Value,
            variant.sku,
            '0', '', '', 'deny', 'manual',
            variant.price.toFixed(2),
            '', 'True', 'True', '', '', '', '', 'False',
            '', '', '', '', 'active'
        ];

        return columns;
    });

    return toCsv([headers, ...rows]);
}
