import type { MetadataRoute } from 'next';
import { absoluteUrl } from '../lib/site';

// Bump when page content meaningfully changes, so crawlers see an accurate lastModified.
const CONTENT_UPDATED = new Date('2026-09-26');

const PAGES: Array<{ path: string; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency']; priority: number }> = [
  { path: '/', changeFrequency: 'weekly', priority: 1 },
  { path: '/pricing', changeFrequency: 'monthly', priority: 0.9 },
  { path: '/how-to-pay', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/app', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/privacy', changeFrequency: 'yearly', priority: 0.3 },
  { path: '/terms', changeFrequency: 'yearly', priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return PAGES.map((page) => ({
    url: absoluteUrl(page.path),
    lastModified: CONTENT_UPDATED,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
    ...(page.path === '/' && { images: [absoluteUrl('/opengraph-image')] }),
  }));
}
