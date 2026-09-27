'use client';

import { useState } from 'react';
import { AlertTriangle, CheckCircle2, ChevronDown, Lightbulb, Sparkles } from 'lucide-react';
import { ValidationError } from '../../types';
import { translateCode } from '../../lib/i18n';
import { useI18n } from '../i18n/i18n-provider';
import { cn } from '../../lib/utils';

interface ValidationSummaryProps {
    errors: ValidationError[];
    warnings: ValidationError[];
    advancedEnabled: boolean;
    isEmpty: boolean;
    variantCount: number;
    variantLimit: number | null;
    rowRunsUsed: number;
    rowRunLimit: number | null;
    onUpgrade: () => void;
    canUpgrade: boolean;
}

function Meter({ value, max, label, danger }: { value: number; max: number; label: string; danger: boolean }) {
    const usage = Math.min(100, (value / max) * 100);
    return (
        <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-surface-3" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max} aria-label={label}>
            <div className={cn('h-full rounded-full transition-[width] duration-500', danger ? 'bg-danger' : usage > 80 ? 'bg-warn' : 'bg-brand')} style={{ width: `${usage}%` }} />
        </div>
    );
}

export function ValidationSummary(props: ValidationSummaryProps) {
    const { errors, warnings, advancedEnabled, isEmpty, variantCount, variantLimit, rowRunsUsed, rowRunLimit, onUpgrade, canUpgrade } = props;
    const { t, formatNumber } = useI18n();
    const copy = t.workspace.summary;
    const [expanded, setExpanded] = useState(false);
    const [showWarnings, setShowWarnings] = useState(false);
    const overLimit = variantLimit !== null && variantCount > variantLimit;
    const message = (issue: ValidationError) => translateCode(t.validation, issue.code, issue.params, issue.message);

    const stats = [
        { label: copy.variants, value: formatNumber(variantCount) },
        { label: copy.issues, value: formatNumber(errors.length), tone: errors.length ? 'text-warn' : 'text-success' },
        rowRunLimit !== null
            ? { label: copy.rowRuns, value: `${formatNumber(rowRunsUsed)}` }
            : { label: copy.exportLimit, value: variantLimit === null ? copy.unlimited : formatNumber(variantLimit) },
    ];

    return (
        <div className="space-y-4">
            <dl className="grid grid-cols-3 gap-3">
                {stats.map((stat) => (
                    <div key={stat.label} className="card min-w-0 px-4 py-3.5">
                        <dt className="truncate text-xs text-ink-3">{stat.label}</dt>
                        <dd className={cn('mt-1 truncate text-xl font-semibold tabular-nums tracking-tight text-ink', stat.tone)}>{stat.value}</dd>
                    </div>
                ))}
            </dl>

            {variantLimit !== null && (
                <div className={cn('card px-4 py-3.5', overLimit && 'border-danger/40')}>
                    <div className="flex items-center justify-between gap-3 text-sm">
                        <span className={overLimit ? 'font-medium text-danger' : 'text-ink-2'}>
                            {overLimit ? copy.overLimit({ count: formatNumber(variantCount), limit: variantLimit }) : copy.used({ count: formatNumber(variantCount), limit: variantLimit })}
                        </span>
                        {canUpgrade && (
                            <button type="button" onClick={onUpgrade} className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-brand hover:underline">
                                <Sparkles className="h-3.5 w-3.5" /> {copy.goUnlimited}
                            </button>
                        )}
                    </div>
                    <Meter value={variantCount} max={variantLimit} label={copy.exportLimit} danger={overLimit} />
                </div>
            )}

            {rowRunLimit !== null && (
                <div className="card px-4 py-3.5">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 text-sm">
                        <span className="text-ink-2">{copy.rowRunsUsed({ used: formatNumber(rowRunsUsed), limit: formatNumber(rowRunLimit) })}</span>
                        <span className="text-xs text-ink-3">{copy.rowRunsReset}</span>
                    </div>
                    <Meter value={rowRunsUsed} max={rowRunLimit} label={copy.rowRuns} danger={rowRunsUsed >= rowRunLimit} />
                </div>
            )}

            <div className={cn('rounded-2xl border px-4 py-3.5 transition-colors', isEmpty ? 'border-line bg-surface' : errors.length ? 'border-warn/30 bg-warn-soft' : 'border-success/30 bg-success-soft')}>
                <button type="button" disabled={!errors.length || isEmpty} onClick={() => setExpanded((value) => !value)} aria-expanded={expanded} className="flex w-full items-center gap-3 text-left">
                    {isEmpty || errors.length
                        ? <AlertTriangle className={cn('h-5 w-5 shrink-0', isEmpty ? 'text-ink-3' : 'text-warn')} />
                        : <CheckCircle2 className="h-5 w-5 shrink-0 text-success" />}
                    <span className="flex-1">
                        <span className="block text-sm font-semibold text-ink">
                            {isEmpty ? copy.startTitle : errors.length ? copy.issuesTitle({ count: errors.length }) : copy.readyTitle}
                        </span>
                        <span className="block text-sm text-ink-2">{isEmpty ? copy.startText : errors.length ? copy.issuesText : copy.readyText}</span>
                    </span>
                    {!!errors.length && !isEmpty && <ChevronDown className={cn('h-4 w-4 shrink-0 text-ink-3 transition-transform duration-200', expanded && 'rotate-180')} />}
                </button>
                {expanded && !isEmpty && (
                    <ul className="scroll-thin animate-fade mt-3 max-h-48 space-y-1.5 overflow-y-auto border-t border-warn/20 pt-3">
                        {errors.map((issue) => (
                            <li key={issue.id} className="flex gap-2 text-sm text-ink-2"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-warn" /> {message(issue)}</li>
                        ))}
                    </ul>
                )}
            </div>

            {!isEmpty && advancedEnabled && warnings.length > 0 && (
                <div className="rounded-2xl border border-line bg-surface px-4 py-3.5">
                    <button type="button" onClick={() => setShowWarnings((value) => !value)} aria-expanded={showWarnings} className="flex w-full items-center gap-3 text-left">
                        <Lightbulb className="h-5 w-5 shrink-0 text-gold" />
                        <span className="flex-1 text-sm font-medium text-ink">{copy.suggestions({ count: warnings.length })}</span>
                        <ChevronDown className={cn('h-4 w-4 shrink-0 text-ink-3 transition-transform duration-200', showWarnings && 'rotate-180')} />
                    </button>
                    {showWarnings && (
                        <ul className="scroll-thin animate-fade mt-3 max-h-48 space-y-1.5 overflow-y-auto border-t border-line pt-3">
                            {warnings.map((issue) => (
                                <li key={issue.id} className="flex gap-2 text-sm text-ink-2"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" /> {message(issue)}</li>
                            ))}
                        </ul>
                    )}
                </div>
            )}

            {!isEmpty && !advancedEnabled && canUpgrade && (
                <button type="button" onClick={onUpgrade} className="flex w-full items-center gap-3 rounded-2xl border border-dashed border-line-strong px-4 py-3 text-left text-sm text-ink-3 transition-colors hover:border-gold/50 hover:text-ink-2">
                    <Lightbulb className="h-4 w-4 shrink-0 text-gold" /> {copy.advancedLocked}
                </button>
            )}
        </div>
    );
}
