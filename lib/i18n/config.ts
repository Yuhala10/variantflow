export const locales = ['en', 'fr'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';
export const LOCALE_COOKIE = 'vf_locale';

export const isLocale = (value: unknown): value is Locale => typeof value === 'string' && (locales as readonly string[]).includes(value);

export const htmlLang: Record<Locale, string> = { en: 'en', fr: 'fr' };
export const ogLocale: Record<Locale, string> = { en: 'en_US', fr: 'fr_FR' };
export const intlLocale: Record<Locale, string> = { en: 'en-US', fr: 'fr-FR' };

/**
 * Builds a locale-aware path. English is served without a prefix (the canonical URLs),
 * French under /fr. Hashes and query strings are preserved: "/#faq" → "/fr#faq".
 */
export function localePath(locale: Locale, path = '/') {
    if (locale === defaultLocale) return path;
    const splitAt = path.search(/[?#]/);
    const pathname = splitAt === -1 ? path : path.slice(0, splitAt);
    const suffix = splitAt === -1 ? '' : path.slice(splitAt);
    return `/${locale}${pathname === '/' ? '' : pathname}${suffix}`;
}

/** Removes a locale prefix: "/fr/pricing" → "/pricing", "/fr" → "/". */
export function stripLocale(pathname: string) {
    for (const locale of locales) {
        if (locale === defaultLocale) continue;
        if (pathname === `/${locale}`) return '/';
        if (pathname.startsWith(`/${locale}/`)) return pathname.slice(locale.length + 1);
    }
    return pathname;
}

export function localeFromPathname(pathname: string): Locale {
    const first = pathname.split('/')[1];
    return isLocale(first) ? first : defaultLocale;
}
