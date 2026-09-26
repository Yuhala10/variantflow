import type { MetadataRoute } from 'next';
import { siteConfig } from '../lib/site';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: `${siteConfig.name} — Variant & SKU Builder`,
        short_name: siteConfig.name,
        description: siteConfig.shortDescription,
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
