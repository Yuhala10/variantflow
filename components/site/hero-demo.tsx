'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, Download, Loader2 } from 'lucide-react';

export interface HeroDemoLabels {
    productTitle: string;
    options: string;
    color: string;
    size: string;
    colors: string[];
    skuPattern: string;
    pattern: string;
    priceRule: string;
    priceRuleValue: string;
    checking: string;
    allValid: string;
    exportCsv: string;
    sku: string;
    price: string;
    rows: string[][];
    prices: string[];
    exported: string;
}

const SIZES = ['S', 'M', 'L', 'XL'];
const CYCLE_MS = 10500;

const at = (ms: number) => ({ animationDelay: `${ms}ms` });

/**
 * A looping, purely visual replay of the workspace: options go in, variants appear,
 * validation passes, the file exports. It runs no product logic.
 */
export function HeroDemo({ labels }: { labels: HeroDemoLabels }) {
    const [cycle, setCycle] = useState(0);

    useEffect(() => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        const timer = window.setInterval(() => {
            if (!document.hidden) setCycle((value) => value + 1);
        }, CYCLE_MS);
        return () => window.clearInterval(timer);
    }, []);

    return (
        <div aria-hidden="true" className="relative select-none">
            {/* Colored light behind the window */}
            <div className="absolute -inset-6 -z-10 rounded-[3rem] bg-[radial-gradient(60%_60%_at_30%_30%,color-mix(in_oklab,var(--g1)_30%,transparent),transparent),radial-gradient(55%_55%_at_80%_70%,color-mix(in_oklab,var(--g2)_24%,transparent),transparent),radial-gradient(50%_50%_at_60%_100%,color-mix(in_oklab,var(--g3)_22%,transparent),transparent)]" />

            <div key={cycle} className="overflow-hidden rounded-[1.5rem] border border-line bg-surface shadow-xl">
                <div className="flex items-center gap-2 border-b border-line bg-surface-2/60 px-4 py-3">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#ff6159]" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[#28c941]" />
                    <span className="animate-fade ml-3 truncate text-xs font-semibold text-ink-2" style={at(250)}>{labels.productTitle}</span>
                </div>

                <div className="grid sm:grid-cols-[12.5rem_1fr]">
                    {/* Inputs */}
                    <div className="hidden space-y-4 border-r border-line p-4 sm:block">
                        <div className="animate-rise" style={at(500)}>
                            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.08em] text-ink-3">{labels.color}</p>
                            <div className="flex flex-wrap gap-1.5">
                                {labels.colors.map((color, index) => (
                                    <span key={color} className="chip animate-pop bg-brand-soft text-brand-ink" style={at(700 + index * 160)}>{color}</span>
                                ))}
                            </div>
                        </div>
                        <div className="animate-rise" style={at(1250)}>
                            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.08em] text-ink-3">{labels.size}</p>
                            <div className="flex flex-wrap gap-1.5">
                                {SIZES.map((size, index) => (
                                    <span key={size} className="chip animate-pop bg-pink-soft text-pink" style={at(1450 + index * 140)}>{size}</span>
                                ))}
                            </div>
                        </div>
                        <div className="animate-rise" style={at(2150)}>
                            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.08em] text-ink-3">{labels.skuPattern}</p>
                            <span className="kbd block truncate rounded-lg py-1.5">{labels.pattern}</span>
                        </div>
                        <div className="animate-rise" style={at(2500)}>
                            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.08em] text-ink-3">{labels.priceRule}</p>
                            <span className="chip bg-warn-soft text-warn">{labels.priceRuleValue}</span>
                        </div>
                    </div>

                    {/* Result */}
                    <div className="min-w-0 pb-6">
                        <div className="flex h-[3.25rem] items-center justify-between gap-3 border-b border-line px-4">
                            <span className="relative h-5 min-w-0 flex-1 text-xs font-semibold">
                                <span className="absolute inset-0 flex items-center gap-1.5 text-ink-3 [animation:vanish_0.25s_ease-out_forwards]" style={at(4150)}>
                                    <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" /> <span className="truncate">{labels.checking}</span>
                                </span>
                                <span className="animate-pop absolute inset-0 flex origin-left items-center gap-1.5 text-success" style={at(4250)}>
                                    <CheckCircle2 className="h-4 w-4 shrink-0" /> <span className="truncate">{labels.allValid}</span>
                                </span>
                            </span>
                            <span className="relative shrink-0">
                                <span className="absolute inset-0 rounded-full bg-brand opacity-0 [animation:ring_1.2s_ease-out_2]" style={at(4900)} />
                                <span className="btn btn-primary btn-sm relative min-h-8 px-3 text-[11px]"><Download className="!h-3 !w-3" /> {labels.exportCsv}</span>
                            </span>
                        </div>
                        <table className="w-full text-left text-xs">
                            <thead className="text-[11px] uppercase tracking-[0.06em] text-ink-3">
                                <tr className="border-b border-line">
                                    <th className="px-4 py-2.5 font-bold">{labels.color}</th>
                                    <th className="px-2 py-2.5 font-bold">{labels.size}</th>
                                    <th className="px-2 py-2.5 font-bold">{labels.sku}</th>
                                    <th className="px-4 py-2.5 text-right font-bold">{labels.price}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-line">
                                {labels.rows.map(([color, size, sku], index) => (
                                    <tr key={sku} className="animate-rise" style={at(2900 + index * 170)}>
                                        <td className="px-4 py-2.5 font-semibold text-ink">{color}</td>
                                        <td className="px-2 py-2.5 text-ink-2">{size}</td>
                                        <td className="px-2 py-2.5 font-mono text-[11px] text-ink-2">{sku}</td>
                                        <td className="px-4 py-2.5 text-right font-semibold tabular-nums text-ink">{labels.prices[index]}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Export confirmation */}
            <div key={`toast-${cycle}`} className="animate-pop absolute -bottom-7 right-4 flex max-w-[calc(100%-2rem)] items-center gap-2.5 rounded-2xl border border-line bg-surface px-4 py-3 text-xs font-semibold text-ink shadow-lg sm:right-8" style={at(6100)}>
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-success-soft text-success"><CheckCircle2 className="h-4 w-4" /></span>
                <span className="truncate">{labels.exported}</span>
            </div>
        </div>
    );
}
