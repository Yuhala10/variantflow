const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://variantflow.app';

export const siteConfig = {
    name: 'VariantFlow',
    url: rawSiteUrl.replace(/\/+$/, ''),
    tagline: 'Product variants, SKUs and Shopify CSVs — done in minutes.',
    description:
        'VariantFlow generates every product variant from your options, builds consistent SKUs, applies pricing rules, validates each row and exports a Shopify-ready CSV in minutes.',
    shortDescription: 'Shopify variant generator, SKU builder and CSV exporter.',
    keywords: [
        'shopify variant generator',
        'shopify csv export',
        'product variant generator',
        'sku generator',
        'bulk sku generator',
        'shopify product import csv',
        'variant matrix builder',
        'product options combinations',
        'catalog validation',
        'ecommerce pricing rules',
        'shopify bulk product upload',
        'dropshipping catalog tool',
    ],
    locale: 'en_US',
    themeColor: { light: '#f7f4ee', dark: '#0d1210' },
} as const;

export const absoluteUrl = (path = '/') => `${siteConfig.url}${path.startsWith('/') ? path : `/${path}`}`;
