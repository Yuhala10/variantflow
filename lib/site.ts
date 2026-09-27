const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://variantflow.app';

// Language-specific copy (descriptions, keywords) lives in lib/i18n/dictionaries.
export const siteConfig = {
    name: 'VariantFlow',
    url: rawSiteUrl.replace(/\/+$/, ''),
    themeColor: { light: '#f7f4ee', dark: '#0d1210' },
} as const;

export const absoluteUrl = (path = '/') => `${siteConfig.url}${path.startsWith('/') ? path : `/${path}`}`;
