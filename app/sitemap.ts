import type { MetadataRoute } from 'next';
import { absoluteUrl } from '../lib/site';
import { htmlLang, localePath, locales, type Locale } from '../lib/i18n/config';
import { GUIDE_KEYS, LANDING_KEYS, guidePath, landingPath } from '../lib/i18n/routes';
import { GUIDE_DATES } from '../lib/content/guides';

// Bump when page content meaningfully changes, so crawlers see an accurate lastModified.
const CONTENT_UPDATED = new Date('2026-10-04');

type Frequency = MetadataRoute.Sitemap[number]['changeFrequency'];
interface Page { paths: Record<Locale, string>; changeFrequency: Frequency; priority: number; lastModified?: Date; image?: string }

const same = (path: string) => Object.fromEntries(locales.map((locale) => [locale, path])) as Record<Locale, string>;
const translated = (build: (locale: Locale) => string) => Object.fromEntries(locales.map((locale) => [locale, build(locale)])) as Record<Locale, string>;

const PAGES: Page[] = [
  { paths: same('/'), changeFrequency: 'weekly', priority: 1, image: '/og.png' },
  { paths: same('/pricing'), changeFrequency: 'monthly', priority: 0.9 },
  ...LANDING_KEYS.map((key): Page => ({ paths: translated((locale) => landingPath(key, locale)), changeFrequency: 'monthly', priority: 0.8, image: `/og/${key}` })),
  { paths: same('/guides'), changeFrequency: 'weekly', priority: 0.7 },
  ...GUIDE_KEYS.map((key): Page => ({
    paths: translated((locale) => guidePath(key, locale)),
    changeFrequency: 'monthly',
    priority: 0.7,
    lastModified: new Date(GUIDE_DATES[key].modified),
    image: `/og/${key}`,
  })),
  { paths: same('/how-to-pay'), changeFrequency: 'monthly', priority: 0.5 },
  { paths: same('/app'), changeFrequency: 'monthly', priority: 0.5 },
  { paths: same('/privacy'), changeFrequency: 'yearly', priority: 0.3 },
  { paths: same('/terms'), changeFrequency: 'yearly', priority: 0.3 },
];

/** Every page in every language, each entry listing its hreflang alternates. */
export default function sitemap(): MetadataRoute.Sitemap {
  return PAGES.flatMap((page) => {
    const languages = Object.fromEntries(locales.map((locale) => [htmlLang[locale], absoluteUrl(localePath(locale, page.paths[locale]))]));
    return locales.map((locale) => ({
      url: absoluteUrl(localePath(locale, page.paths[locale])),
      lastModified: page.lastModified ?? CONTENT_UPDATED,
      changeFrequency: page.changeFrequency,
      priority: page.priority,
      alternates: { languages: { ...languages, 'x-default': absoluteUrl(localePath('en', page.paths.en)) } },
      ...(page.image && { images: [absoluteUrl(localePath(locale, page.image))] }),
    }));
  });
}
