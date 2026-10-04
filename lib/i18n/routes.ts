import type { Locale } from './config';

/**
 * URL slugs for content pages, per language. French pages get French URLs
 * (/fr/generateur-de-sku) because the words in a URL help it rank for that language.
 */
export const LANDING_SLUGS = {
    'variant-generator': { en: 'shopify-variant-generator', fr: 'generateur-de-variantes-shopify' },
    'sku-generator': { en: 'sku-generator', fr: 'generateur-de-sku' },
    'shopify-csv': { en: 'shopify-product-csv-export', fr: 'export-csv-produits-shopify' },
    'woocommerce-csv': { en: 'woocommerce-variations-csv', fr: 'csv-variations-woocommerce' },
    'pricing-rules': { en: 'variant-pricing-rules', fr: 'regles-de-prix-des-variantes' },
    validation: { en: 'product-catalog-validation', fr: 'validation-de-catalogue-produits' },
    'supplier-import': { en: 'supplier-csv-import', fr: 'import-csv-fournisseur' },
} as const satisfies Record<string, Record<Locale, string>>;

export const GUIDE_SLUGS = {
    'shopify-csv-variants': { en: 'shopify-product-csv-with-variants', fr: 'csv-produits-shopify-avec-variantes' },
    'sku-naming': { en: 'sku-naming-guide', fr: 'guide-de-nommage-des-sku' },
    'shopify-variant-limits': { en: 'shopify-variant-limits', fr: 'limites-de-variantes-shopify' },
} as const satisfies Record<string, Record<Locale, string>>;

export type LandingKey = keyof typeof LANDING_SLUGS;
export type GuideKey = keyof typeof GUIDE_SLUGS;

export const LANDING_KEYS = Object.keys(LANDING_SLUGS) as LandingKey[];
export const GUIDE_KEYS = Object.keys(GUIDE_SLUGS) as GuideKey[];

/** Paths without the language prefix; wrap with localePath() to get the final URL. */
export const landingPath = (key: LandingKey, locale: Locale) => `/${LANDING_SLUGS[key][locale]}`;
export const guidePath = (key: GuideKey, locale: Locale) => `/guides/${GUIDE_SLUGS[key][locale]}`;

export const landingKeyFromSlug = (slug: string, locale: Locale) => LANDING_KEYS.find((key) => LANDING_SLUGS[key][locale] === slug);
export const guideKeyFromSlug = (slug: string, locale: Locale) => GUIDE_KEYS.find((key) => GUIDE_SLUGS[key][locale] === slug);

/** Converts a prefix-free path from one language to the same page in another. */
export function translatePath(barePath: string, from: Locale, to: Locale) {
    const [pathname, ...rest] = barePath.split(/(?=[?#])/);
    const suffix = rest.join('');
    const segments = pathname.split('/').filter(Boolean);

    if (segments.length === 1) {
        const key = landingKeyFromSlug(segments[0], from);
        if (key) return landingPath(key, to) + suffix;
    }
    if (segments.length === 2 && segments[0] === 'guides') {
        const key = guideKeyFromSlug(segments[1], from);
        if (key) return guidePath(key, to) + suffix;
    }
    return barePath;
}
