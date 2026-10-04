import { ArrowDown, ArrowRight, Check, CircleDollarSign, FileSpreadsheet, FileUp, Layers, ShieldCheck, Store, Tags } from 'lucide-react';
import { getDictionary, type Locale } from '../../lib/i18n';
import type { LandingKey } from '../../lib/i18n/routes';
import { getMarketing } from '../../lib/content/marketing';

/** Icon and accent color for each feature, shared by the home page, landing pages and footer. */
export const FEATURE_META: Record<LandingKey, { icon: typeof Layers; tint: string }> = {
    'variant-generator': { icon: Layers, tint: 'tint-iris' },
    'sku-generator': { icon: Tags, tint: 'tint-violet' },
    'pricing-rules': { icon: CircleDollarSign, tint: 'tint-amber' },
    validation: { icon: ShieldCheck, tint: 'tint-green' },
    'shopify-csv': { icon: FileSpreadsheet, tint: 'tint-sky' },
    'woocommerce-csv': { icon: Store, tint: 'tint-pink' },
    'supplier-import': { icon: FileUp, tint: 'tint-pink' },
};

const SIZES = ['S', 'M', 'L', 'XL'];
const pill = 'inline-flex items-center rounded-full bg-surface px-2.5 py-1 text-xs font-semibold text-ink shadow-xs ring-1 ring-line';

/**
 * Small, decorative illustration of one feature, drawn with real UI pieces.
 * Purely presentational: nothing here runs product logic.
 */
export function FeatureVisual({ kind, locale }: { kind: LandingKey; locale: Locale }) {
    const t = getDictionary(locale);
    const m = getMarketing(locale).home.bento;
    const money = (amount: string) => t.preview.money({ amount: locale === 'fr' ? amount.replace('.', ',') : amount });
    const [colorA, colorB, colorC] = t.preview.colors;
    const skuPrefix = t.preview.rows[0][2].split('-').slice(0, 2).join('-');

    if (kind === 'variant-generator') {
        return (
            <div aria-hidden="true" className="flex flex-col items-center gap-4">
                <div className="flex flex-wrap items-center justify-center gap-1.5">
                    {[colorA, colorB, colorC].map((color) => <span key={color} className={pill}>{color}</span>)}
                    <span className="px-1 text-sm font-semibold text-ink-3">×</span>
                    {SIZES.map((size) => <span key={size} className={pill}>{size}</span>)}
                </div>
                <div className="grid grid-cols-6 gap-1.5">
                    {Array.from({ length: 12 }, (_, index) => (
                        <span
                            key={index}
                            className="animate-pop h-7 w-7 rounded-lg"
                            style={{ animationDelay: `${index * 45}ms`, background: `color-mix(in oklab, var(--tint-fg) ${40 + (index % 4) * 20}%, var(--surface))` }}
                        />
                    ))}
                </div>
                <p className="text-sm font-medium text-ink-2">{m.formula} = <strong className="font-bold text-ink">{m.result}</strong></p>
            </div>
        );
    }

    if (kind === 'sku-generator') {
        return (
            <div aria-hidden="true" className="flex flex-col items-center gap-3">
                <span className="kbd rounded-xl bg-surface px-3 py-2 text-[13px] shadow-xs">{t.preview.pattern}</span>
                <ArrowDown className="h-4 w-4 text-[var(--tint-fg)]" />
                <div className="flex flex-wrap justify-center gap-1.5">
                    {SIZES.slice(0, 3).map((size, index) => (
                        <span key={size} className={`${pill} animate-rise font-mono text-[11px]`} style={{ animationDelay: `${index * 90}ms` }}>{skuPrefix}-{size}</span>
                    ))}
                </div>
            </div>
        );
    }

    if (kind === 'pricing-rules') {
        return (
            <div aria-hidden="true" className="w-full max-w-[15rem] space-y-2 text-sm">
                <div className="flex items-center justify-between rounded-xl bg-surface px-3.5 py-2.5 shadow-xs ring-1 ring-line">
                    <span className="text-ink-2">{m.basePrice}</span>
                    <span className="font-semibold tabular-nums text-ink">{money('24.00')}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-surface px-3.5 py-2.5 shadow-xs ring-1 ring-line">
                    <span className="font-semibold text-ink">XL</span>
                    <span className="chip bg-success-soft tabular-nums text-success">+{money('2.00')}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-[var(--tint-fg)] px-3.5 py-2.5 text-surface">
                    <span className="font-medium">{colorA} / XL</span>
                    <span className="font-bold tabular-nums">{money('26.00')}</span>
                </div>
            </div>
        );
    }

    if (kind === 'validation') {
        return (
            <div aria-hidden="true" className="w-full max-w-[15rem] space-y-2">
                {m.checks.map((check, index) => (
                    <div key={check} className="animate-rise flex items-center gap-2.5 rounded-xl bg-surface px-3 py-2.5 text-sm font-medium text-ink shadow-xs ring-1 ring-line" style={{ animationDelay: `${index * 110}ms` }}>
                        <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success text-surface"><Check className="h-3 w-3" strokeWidth={3} /></span>
                        {check}
                    </div>
                ))}
            </div>
        );
    }

    if (kind === 'supplier-import') {
        return (
            <div aria-hidden="true" className="flex items-center gap-3">
                <div className="space-y-1.5">
                    {m.messy.map((value) => <span key={value} className="block rounded-lg bg-surface/70 px-3 py-1.5 font-mono text-xs text-ink-3 line-through ring-1 ring-line">{value}</span>)}
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-[var(--tint-fg)]" />
                <div className="space-y-1.5">
                    {m.clean.map((value, index) => (
                        <span key={value} className="animate-rise block rounded-lg bg-surface px-3 py-1.5 text-xs font-semibold text-ink shadow-xs ring-1 ring-line" style={{ animationDelay: `${index * 110}ms` }}>{value}</span>
                    ))}
                </div>
            </div>
        );
    }

    // Export formats (Shopify and WooCommerce pages, and the wide home card)
    const formats = t.workspace.exportMenu.formats;
    const order = kind === 'woocommerce-csv' ? [formats.woocommerce, formats.shopify, formats.universal] : [formats.shopify, formats.woocommerce, formats.universal];
    return (
        <div aria-hidden="true" className="flex w-full flex-wrap justify-center gap-2.5">
            {order.map((format, index) => (
                <div key={format.name} className={`flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm shadow-xs ring-1 ${index === 0 ? 'bg-[var(--tint-fg)] font-semibold text-surface ring-transparent' : 'bg-surface font-medium text-ink ring-line'}`}>
                    <FileSpreadsheet className="h-4 w-4 shrink-0" />
                    {format.name}
                </div>
            ))}
        </div>
    );
}
