import type { MetadataRoute } from 'next';
import { absoluteUrl } from '../lib/site';
import { htmlLang, localePath, locales } from '../lib/i18n/config';

// Bump when page content meaningfully changes, so crawlers see an accurate lastModified.
const CONTENT_UPDATED = new Date('2026-09-27');

const PAGES: Array<{ path: string; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency']; priority: number }> = [
  { path: '/', changeFrequency: 'weekly', priority: 1 },
  { path: '/pricing', changeFrequency: 'monthly', priority: 0.9 },
  { path: '/how-to-pay', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/app', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/privacy', changeFrequency: 'yearly', priority: 0.3 },
  { path: '/terms', changeFrequency: 'yearly', priority: 0.3 },
];

/** Every page in every language, each entry listing its hreflang alternates. */
export default function sitemap(): MetadataRoute.Sitemap {
  return PAGES.flatMap((page) => {
    const languages = Object.fromEntries(locales.map((locale) => [htmlLang[locale], absoluteUrl(localePath(locale, page.path))]));
    return locales.map((locale) => ({
      url: absoluteUrl(localePath(locale, page.path)),
      lastModified: CONTENT_UPDATED,
      changeFrequency: page.changeFrequency,
      priority: page.priority,
      alternates: { languages: { ...languages, 'x-default': absoluteUrl(page.path) } },
      ...(page.path === '/' && { images: [absoluteUrl(localePath(locale, '/og.png'))] }),
    }));
  });
}
