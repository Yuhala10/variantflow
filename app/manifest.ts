import type { MetadataRoute } from 'next';
import { siteConfig } from '../lib/site';
import { getDictionary } from '../lib/i18n';

// The manifest is shared by both languages; English is the default.
export default function manifest(): MetadataRoute.Manifest {
    const t = getDictionary('en');
    return {
        name: t.meta.manifestName,
        short_name: siteConfig.name,
        description: t.meta.shortDescription,
        start_url: '/workspace',
        scope: '/',
        display: 'standalone',
        orientation: 'any',
        background_color: siteConfig.themeColor.light,
        theme_color: siteConfig.themeColor.light,
        categories: ['business', 'productivity', 'shopping'],
        icons: [
            { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
            { src: '/logo.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
            { src: '/logo.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
    };
}
