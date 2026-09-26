import { CheckCircle2 } from 'lucide-react';

const COLORS = ['Black', 'Sand', 'Olive'];
const SIZES = ['S', 'M', 'L', 'XL'];
const ROWS = [
    ['Black', 'S', 'TSH-BLACK-S', '24.00'],
    ['Black', 'M', 'TSH-BLACK-M', '24.00'],
    ['Black', 'XL', 'TSH-BLACK-XL', '26.00'],
    ['Sand', 'S', 'TSH-SAND-S', '24.00'],
    ['Sand', 'L', 'TSH-SAND-L', '24.00'],
    ['Olive', 'XL', 'TSH-OLIVE-XL', '26.00'],
];

/** Static, decorative illustration of the workspace for the hero. */
export function ProductPreview() {
    return (
        <div aria-hidden="true" className="relative select-none">
            <div className="absolute -inset-x-10 -inset-y-8 -z-10 rounded-[3rem] bg-[radial-gradient(60%_60%_at_50%_40%,color-mix(in_oklab,var(--brand)_18%,transparent),transparent)] blur-2xl" />
            <div className="overflow-hidden rounded-[1.25rem] border border-line bg-surface shadow-xl">
                <div className="flex items-center gap-2 border-b border-line bg-surface-2/70 px-4 py-3">
                    <span className="h-2.5 w-2.5 rounded-full bg-line-strong" />
                    <span className="h-2.5 w-2.5 rounded-full bg-line-strong" />
                    <span className="h-2.5 w-2.5 rounded-full bg-line-strong" />
                    <span className="ml-3 truncate text-xs font-medium text-ink-3">Heavyweight Tee · 12 variants</span>
                </div>

                <div className="grid sm:grid-cols-[13rem_1fr]">
                    <div className="hidden space-y-4 border-r border-line p-4 sm:block">
                        <div>
                            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-3">Color</p>
                            <div className="flex flex-wrap gap-1.5">
                                {COLORS.map((color) => <span key={color} className="chip bg-surface-2 text-ink-2">{color}</span>)}
                            </div>
                        </div>
                        <div>
                            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-3">Size</p>
                            <div className="flex flex-wrap gap-1.5">
                                {SIZES.map((size) => <span key={size} className="chip bg-surface-2 text-ink-2">{size}</span>)}
                            </div>
                        </div>
                        <div>
                            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-3">SKU pattern</p>
                            <span className="kbd block truncate py-1.5">TSH-{'{COLOR}'}-{'{SIZE}'}</span>
                        </div>
                        <div>
                            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-3">Price rule</p>
                            <span className="chip bg-brand-soft text-brand-ink">XL · +$2.00</span>
                        </div>
                    </div>

                    <div className="min-w-0">
                        <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-success">
                                <CheckCircle2 className="h-3.5 w-3.5" /> All variants valid
                            </span>
                            <span className="rounded-lg bg-brand px-2.5 py-1.5 text-[11px] font-semibold text-on-brand">Export CSV</span>
                        </div>
                        <table className="w-full text-left text-xs">
                            <thead className="text-[11px] uppercase tracking-[0.06em] text-ink-3">
                                <tr className="border-b border-line">
                                    <th className="px-4 py-2.5 font-semibold">Color</th>
                                    <th className="px-2 py-2.5 font-semibold">Size</th>
                                    <th className="px-2 py-2.5 font-semibold">SKU</th>
                                    <th className="px-4 py-2.5 text-right font-semibold">Price</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-line">
                                {ROWS.map(([color, size, sku, price], index) => (
                                    <tr key={sku} className="animate-rise" style={{ animationDelay: `${300 + index * 70}ms` }}>
                                        <td className="px-4 py-2.5 font-medium text-ink">{color}</td>
                                        <td className="px-2 py-2.5 text-ink-2">{size}</td>
                                        <td className="px-2 py-2.5 font-mono text-[11px] text-ink-2">{sku}</td>
                                        <td className="px-4 py-2.5 text-right font-medium tabular-nums text-ink">${price}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
