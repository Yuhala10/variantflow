import { ImageResponse } from 'next/og';
import { OgMark } from '../lib/og-mark';

export const alt = 'VariantFlow — generate Shopify product variants, SKUs and CSV exports in minutes';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const ROWS = [
    ['Black', 'M', 'TSH-BLACK-M', '$24.00'],
    ['Black', 'XL', 'TSH-BLACK-XL', '$26.00'],
    ['Sand', 'L', 'TSH-SAND-L', '$24.00'],
    ['Olive', 'S', 'TSH-OLIVE-S', '$24.00'],
];

export default function OpengraphImage() {
    return new ImageResponse(
        (
            <div style={{ width: '100%', height: '100%', display: 'flex', background: '#f7f4ee', padding: 72, fontFamily: 'sans-serif' }}>
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: 560 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <OgMark size={56} radius={16} />
                        <span style={{ fontSize: 32, fontWeight: 700, color: '#1a1916', letterSpacing: -0.5 }}>VariantFlow</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        <span style={{ fontSize: 64, fontWeight: 700, color: '#1a1916', lineHeight: 1.05, letterSpacing: -2 }}>
                            Every product variant, perfectly organized.
                        </span>
                        <span style={{ fontSize: 26, color: '#57524a', lineHeight: 1.4 }}>
                            Variants, SKUs, pricing rules and Shopify-ready CSV exports — in minutes.
                        </span>
                    </div>
                    <span style={{ fontSize: 22, color: '#1f5b4a', fontWeight: 600 }}>variantflow.app</span>
                </div>
                <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'flex-end' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', width: 460, background: '#ffffff', borderRadius: 24, border: '1px solid #e6dfd2', boxShadow: '0 30px 60px -20px rgba(60,45,20,0.25)', overflow: 'hidden' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid #e6dfd2' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 18, fontWeight: 600, color: '#25704f' }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="#e5f2eb" /><path d="m8 12.5 2.5 2.5L16 9.5" stroke="#25704f" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                All variants valid
                            </span>
                            <span style={{ fontSize: 16, fontWeight: 600, color: '#ffffff', background: '#1f5b4a', padding: '8px 14px', borderRadius: 10 }}>Export CSV</span>
                        </div>
                        {ROWS.map(([color, sizeLabel, sku, price]) => (
                            <div key={sku} style={{ display: 'flex', alignItems: 'center', padding: '18px 24px', borderBottom: '1px solid #f0ebe1', fontSize: 18 }}>
                                <span style={{ width: 90, color: '#1a1916', fontWeight: 600 }}>{color}</span>
                                <span style={{ width: 50, color: '#57524a' }}>{sizeLabel}</span>
                                <span style={{ flex: 1, color: '#57524a', fontFamily: 'monospace' }}>{sku}</span>
                                <span style={{ color: '#1a1916', fontWeight: 600 }}>{price}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        ),
        size,
    );
}
