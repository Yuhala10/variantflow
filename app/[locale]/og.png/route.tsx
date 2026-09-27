import { ImageResponse } from 'next/og';
import { OgMark } from '../../../lib/og-mark';
import { getDictionary, isLocale, locales } from '../../../lib/i18n';

export const dynamic = 'force-static';
export const dynamicParams = false;

export function generateStaticParams() {
    return locales.map((locale) => ({ locale }));
}

const size = { width: 1200, height: 630 };

/** Localized 1200×630 social share image (served at /og.png and /fr/og.png). */
export async function GET(_request: Request, { params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = getDictionary(isLocale(locale) ? locale : 'en');
    const rows = t.preview.rows.slice(1, 5);

    return new ImageResponse(
        (
            <div style={{ width: '100%', height: '100%', display: 'flex', background: '#f7f4ee', padding: 72, fontFamily: 'sans-serif' }}>
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: 540 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <OgMark size={56} radius={16} />
                        <span style={{ fontSize: 32, fontWeight: 700, color: '#1a1916', letterSpacing: -0.5 }}>VariantFlow</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        <span style={{ fontSize: 60, fontWeight: 700, color: '#1a1916', lineHeight: 1.05, letterSpacing: -2 }}>{t.meta.ogHeadline}</span>
                        <span style={{ fontSize: 26, color: '#57524a', lineHeight: 1.4 }}>{t.meta.ogSubline}</span>
                    </div>
                    <span style={{ fontSize: 22, color: '#1f5b4a', fontWeight: 600 }}>variantflow.app</span>
                </div>
                <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'flex-end' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', width: 500, background: '#ffffff', borderRadius: 24, border: '1px solid #e6dfd2', boxShadow: '0 30px 60px -20px rgba(60,45,20,0.25)', overflow: 'hidden' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', gap: 12, borderBottom: '1px solid #e6dfd2' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 600, color: '#25704f', flexShrink: 1 }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="#e5f2eb" /><path d="m8 12.5 2.5 2.5L16 9.5" stroke="#25704f" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                {t.preview.allValid}
                            </span>
                            <span style={{ fontSize: 15, fontWeight: 600, color: '#ffffff', background: '#1f5b4a', padding: '8px 14px', borderRadius: 10, whiteSpace: 'nowrap', flexShrink: 0 }}>{t.preview.exportCsv}</span>
                        </div>
                        {rows.map(([color, sizeLabel, sku, price]) => (
                            <div key={sku} style={{ display: 'flex', alignItems: 'center', padding: '18px 24px', borderBottom: '1px solid #f0ebe1', fontSize: 18 }}>
                                <span style={{ width: 90, color: '#1a1916', fontWeight: 600 }}>{color}</span>
                                <span style={{ width: 50, color: '#57524a' }}>{sizeLabel}</span>
                                <span style={{ flex: 1, color: '#57524a', fontFamily: 'monospace' }}>{sku}</span>
                                <span style={{ color: '#1a1916', fontWeight: 600 }}>{t.preview.money({ amount: price })}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        ),
        size,
    );
}
