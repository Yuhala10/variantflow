import 'server-only';
import { notFound } from 'next/navigation';
import { getDictionary, isLocale, type Locale } from './index';

/** Resolves the `[locale]` route param for pages, 404ing on anything unsupported. */
export async function resolveLocale(params: Promise<{ locale: string }>): Promise<{ locale: Locale; t: ReturnType<typeof getDictionary> }> {
    const { locale } = await params;
    if (!isLocale(locale)) notFound();
    return { locale, t: getDictionary(locale) };
}

export type LocaleParams = { params: Promise<{ locale: string }> };
