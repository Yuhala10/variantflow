import { useProductStore } from '../../store/productStore';
import { InternalVariant, OptionGroup, PriceModifierRule, SkuTemplateConfig } from '../../types';

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

    const handle = catalog.productTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-\$)/g, '') || 'product-handle';

    const optionGroups = catalog.options.filter(opt => opt.name.trim() !== '' && opt.values.length > 0);

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
            'VariantFlow Merchant',
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

        return columns
            .map(field => {
                const str = field ? field.toString() : '';
                if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                    return `"${str.replace(/"/g, '""')}"`;
                }
                return str;
            })
            .join(',');
    });

    return [headers.join(','), ...rows].join('\n');
}

export function convertToShopifyCsv(): string {
    const store = useProductStore.getState();

    return convertCatalogToShopifyCsv({
        productTitle: store.productTitle,
        options: store.options,
        skuConfig: store.skuConfig,
        basePrice: store.basePrice,
        priceRules: store.priceRules,
        variants: store.variants,
    });
}
