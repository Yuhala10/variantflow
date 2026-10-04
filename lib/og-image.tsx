import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';
import { OG, OgMark } from './og-mark';
import { siteHost } from './site';

export const OG_SIZE = { width: 1200, height: 630 };

// The brand's typeface (Plus Jakarta Sans, SIL Open Font License), read once.
// Supplying fonts replaces the generator's default, so both weights used below are loaded.
const font = (file: string) => readFile(join(process.cwd(), 'assets/fonts', file));
const boldFont = font('PlusJakartaSans-ExtraBold.ttf');
const mediumFont = font('PlusJakartaSans-Medium.ttf');

/** 1200×630 social share image: logo, a headline, one supporting line. */
export async function renderShareImage({ eyebrow, title, subtitle }: { eyebrow?: string; title: string; subtitle?: string }) {
    const titleSize = title.length > 60 ? 54 : title.length > 38 ? 64 : 76;

    return new ImageResponse(
        (
            <div style={{ width: '100%', height: '100%', display: 'flex', position: 'relative', background: OG.canvas, fontFamily: 'Jakarta', fontWeight: 500 }}>
                {/* Sunrise glow */}
                <div style={{ position: 'absolute', right: -180, top: -220, width: 720, height: 720, borderRadius: 720, backgroundImage: OG.sunrise, opacity: 0.28, display: 'flex' }} />
                <div style={{ position: 'absolute', left: -200, bottom: -320, width: 620, height: 620, borderRadius: 620, backgroundImage: OG.gradient, opacity: 0.16, display: 'flex' }} />

                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: '100%', padding: 72 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                        <OgMark size={60} radius={18} />
                        <span style={{ fontFamily: 'Jakarta', fontSize: 34, fontWeight: 800, color: OG.ink, letterSpacing: -0.5 }}>VariantFlow</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 22, maxWidth: 960 }}>
                        {eyebrow ? (
                            <div style={{ display: 'flex' }}>
                                <span style={{ fontSize: 22, fontWeight: 800, color: OG.brand, background: '#eeedff', padding: '8px 18px', borderRadius: 999, letterSpacing: 1 }}>{eyebrow.toUpperCase()}</span>
                            </div>
                        ) : null}
                        <span style={{ fontFamily: 'Jakarta', fontSize: titleSize, fontWeight: 800, color: OG.ink, lineHeight: 1.08, letterSpacing: -2 }}>{title}</span>
                        {subtitle ? <span style={{ fontSize: 28, color: OG.ink2, lineHeight: 1.4 }}>{subtitle}</span> : null}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 24, color: OG.brand, fontWeight: 800 }}>{siteHost}</span>
                        <div style={{ display: 'flex', width: 220, height: 8, borderRadius: 8, backgroundImage: OG.sunrise }} />
                    </div>
                </div>
            </div>
        ),
        {
            ...OG_SIZE,
            fonts: [
                { name: 'Jakarta', data: await mediumFont, weight: 500, style: 'normal' },
                { name: 'Jakarta', data: await boldFont, weight: 800, style: 'normal' },
            ],
        },
    );
}
