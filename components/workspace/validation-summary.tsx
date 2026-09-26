'use client';

import { useState } from 'react';
import { AlertTriangle, CheckCircle2, ChevronDown, Sparkles } from 'lucide-react';
import { ValidationError } from '../../types';
import { cn } from '../../lib/utils';

interface ValidationSummaryProps {
    issues: ValidationError[];
    isEmpty: boolean;
    variantCount: number;
    variantLimit: number | null;
    onUpgrade: () => void;
    canUpgrade: boolean;
}

export function ValidationSummary({ issues, isEmpty, variantCount, variantLimit, onUpgrade, canUpgrade }: ValidationSummaryProps) {
    const [expanded, setExpanded] = useState(false);
    const overLimit = variantLimit !== null && variantCount > variantLimit;
    const usage = variantLimit ? Math.min(100, (variantCount / variantLimit) * 100) : 0;

    const stats = [
        { label: 'Variants', value: variantCount.toLocaleString() },
        { label: 'Issues', value: issues.length.toString(), tone: issues.length ? 'text-warn' : 'text-success' },
        { label: 'Export limit', value: variantLimit === null ? 'Unlimited' : variantLimit.toLocaleString() },
    ];

    return (
        <div className="space-y-4">
            <dl className="grid grid-cols-3 gap-3">
                {stats.map((stat) => (
                    <div key={stat.label} className="card px-4 py-3.5">
                        <dt className="text-xs text-ink-3">{stat.label}</dt>
                        <dd className={cn('mt-1 text-xl font-semibold tabular-nums tracking-tight text-ink', stat.tone)}>{stat.value}</dd>
                    </div>
                ))}
            </dl>

            {variantLimit !== null && (
                <div className={cn('card px-4 py-3.5', overLimit && 'border-danger/40')}>
                    <div className="flex items-center justify-between gap-3 text-sm">
                        <span className={overLimit ? 'font-medium text-danger' : 'text-ink-2'}>
                            {overLimit ? `${variantCount} variants — over the ${variantLimit} limit for export` : `${variantCount} of ${variantLimit} variants used`}
                        </span>
                        {canUpgrade && (
                            <button type="button" onClick={onUpgrade} className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-brand hover:underline">
                                <Sparkles className="h-3.5 w-3.5" /> Go unlimited
                            </button>
                        )}
                    </div>
                    <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-surface-3" role="progressbar" aria-valuenow={variantCount} aria-valuemin={0} aria-valuemax={variantLimit} aria-label="Variant limit usage">
                        <div className={cn('h-full rounded-full transition-[width] duration-500', overLimit ? 'bg-danger' : usage > 80 ? 'bg-warn' : 'bg-brand')} style={{ width: `${usage}%` }} />
                    </div>
                </div>
            )}

            <div
                className={cn(
                    'rounded-2xl border px-4 py-3.5 transition-colors',
                    isEmpty ? 'border-line bg-surface' : issues.length ? 'border-warn/30 bg-warn-soft' : 'border-success/30 bg-success-soft',
                )}
            >
                <button
                    type="button"
                    disabled={!issues.length || isEmpty}
                    onClick={() => setExpanded((value) => !value)}
                    aria-expanded={expanded}
                    className="flex w-full items-center gap-3 text-left"
                >
                    {isEmpty || issues.length
                        ? <AlertTriangle className={cn('h-5 w-5 shrink-0', isEmpty ? 'text-ink-3' : 'text-warn')} />
                        : <CheckCircle2 className="h-5 w-5 shrink-0 text-success" />}
                    <span className="flex-1">
                        <span className="block text-sm font-semibold text-ink">
                            {isEmpty ? 'Start your catalog' : issues.length ? `${issues.length} ${issues.length === 1 ? 'issue needs' : 'issues need'} attention` : 'Ready to export'}
                        </span>
                        <span className="block text-sm text-ink-2">
                            {isEmpty ? 'Add a product title and at least one option.' : issues.length ? 'Fix these before exporting.' : 'Every variant looks correct.'}
                        </span>
                    </span>
                    {!!issues.length && !isEmpty && <ChevronDown className={cn('h-4 w-4 shrink-0 text-ink-3 transition-transform duration-200', expanded && 'rotate-180')} />}
                </button>
                {expanded && !isEmpty && (
                    <ul className="scroll-thin animate-fade mt-3 max-h-48 space-y-1.5 overflow-y-auto border-t border-warn/20 pt-3">
                        {issues.map((issue) => (
                            <li key={issue.id} className="flex gap-2 text-sm text-ink-2">
                                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-warn" /> {issue.message}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
