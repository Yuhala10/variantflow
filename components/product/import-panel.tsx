'use client';

import React, { useEffect, useRef, useState } from 'react';
import { FileUp, Loader2, Lock, RotateCcw, Sparkles, Wand2 } from 'lucide-react';
import { useProductStore } from '../../store/productStore';
import type { ColumnMapping, ColumnRole, ImportedCatalog } from '../../domain/import/importCatalog';
import { translateCode } from '../../lib/i18n';
import { useI18n } from '../i18n/i18n-provider';
import { cn } from '../../lib/utils';

// Matches the server limit (Vercel accepts request bodies up to 4.5 MB).
const MAX_FILE_BYTES = 4 * 1024 * 1024;
const ROLES: ColumnRole[] = ['option', 'title', 'sku', 'price', 'ignore'];

/** What the workspace sends to the server to import the file. */
export interface ImportRequest {
    csv: string;
    mapping: Record<string, ColumnMapping>;
    clean: boolean;
    normalize: boolean;
}

interface Analysis {
    headers: string[];
    rowCount: number;
    samples: Record<string, string>;
}

interface Preview {
    productTitle: string;
    basePrice: number;
    stats: ImportedCatalog['stats'];
    options: Array<{ name: string; values: string[]; total: number }>;
}

interface ImportPanelProps {
    onUpgrade: () => void;
    /** Imports on the server and applies the catalog; resolves true on success. */
    onImport: (request: ImportRequest) => Promise<boolean>;
    onError: (message: string) => void;
}

const post = (url: string, body: unknown, signal?: AbortSignal) =>
    fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal });

function Toggle({ checked, onChange, label, hint, locked, lockLabel, onLocked }: { checked: boolean; onChange: (value: boolean) => void; label: string; hint: string; locked?: boolean; lockLabel?: string; onLocked?: () => void }) {
    return (
        <label className={cn('flex cursor-pointer items-start gap-3 rounded-xl border border-line bg-surface p-3', locked && 'opacity-80')}>
            <input
                type="checkbox"
                className="peer sr-only"
                checked={checked && !locked}
                onChange={(event) => (locked ? onLocked?.() : onChange(event.target.checked))}
            />
            <span aria-hidden="true" className="relative mt-0.5 inline-flex h-5 w-9 shrink-0 rounded-full bg-surface-3 transition-colors peer-checked:bg-brand peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-brand after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-surface after:shadow-sm after:transition-transform peer-checked:after:translate-x-4" />
            <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2 text-sm font-medium text-ink">
                    {label}
                    {locked && <span className="chip bg-gold-soft px-2 py-0.5 text-[11px] text-gold"><Lock className="h-2.5 w-2.5" /> {lockLabel}</span>}
                </span>
                <span className="block text-xs text-ink-3">{hint}</span>
            </span>
        </label>
    );
}

/**
 * Supplier CSV import. Reading the file, matching columns and building the catalog all happen on
 * the server; this component only shows the steps, so the import tools stay behind the plan check.
 */
export function ImportPanel({ onUpgrade, onImport, onError }: ImportPanelProps) {
    const { t, formatNumber, locale } = useI18n();
    const copy = t.workspace.tools;
    const { entitlements } = useProductStore((state) => state.access);
    const fileRef = useRef<HTMLInputElement>(null);
    const [csvText, setCsvText] = useState('');
    const [source, setSource] = useState<string | null>(null);
    const [analysis, setAnalysis] = useState<Analysis | null>(null);
    const [mapping, setMapping] = useState<Record<string, ColumnMapping>>({});
    const [clean, setClean] = useState(true);
    const [normalize, setNormalize] = useState(false);
    const [preview, setPreview] = useState<Preview | null>(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [importing, setImporting] = useState(false);

    const smart = entitlements.canUseAiMapping;
    const canNormalize = entitlements.canNormalizeSuppliers;

    // Refresh the server preview shortly after the mapping or options change.
    useEffect(() => {
        if (!source || !analysis) return;
        const controller = new AbortController();
        const timer = window.setTimeout(async () => {
            try {
                const response = await post('/api/import/preview', { csv: source, mapping, clean, normalize }, controller.signal);
                if (response.ok) setPreview((await response.json()).preview ?? null);
            } catch {
                // Aborted by a newer change, or offline; the last preview stays on screen.
            }
        }, 300);
        return () => {
            window.clearTimeout(timer);
            controller.abort();
        };
    }, [source, analysis, mapping, clean, normalize]);

    if (!entitlements.canImportCsv) {
        return (
            <div>
                <div className="mb-3 flex items-center justify-between gap-3">
                    <h3 className="text-[13px] font-semibold text-ink">{copy.importTitle}</h3>
                    <span className="chip bg-gold-soft text-gold"><Lock className="h-3 w-3" /> {copy.proBadge}</span>
                </div>
                <div className="rounded-xl border border-line bg-canvas/60 p-5">
                    <p className="text-sm leading-relaxed text-ink-2">{copy.lockedText}</p>
                    <button type="button" onClick={onUpgrade} className="btn btn-soft btn-sm mt-4"><Sparkles /> {copy.unlockPro}</button>
                </div>
            </div>
        );
    }

    const analyze = async (text: string) => {
        if (!text.trim()) return;
        if (text.length > MAX_FILE_BYTES) {
            onError(copy.parseError);
            return;
        }
        setAnalyzing(true);
        try {
            const response = await post('/api/import/analyze', { csv: text });
            const payload = await response.json().catch(() => null);
            if (!response.ok) {
                onError(payload?.code === 'invalid-payload' ? copy.parseError : translateCode(t.apiErrors, payload?.code, { limit: payload?.limit ?? '' }, copy.parseError));
                return;
            }
            setSource(text);
            setAnalysis({ headers: payload.headers, rowCount: payload.rowCount, samples: payload.samples ?? {} });
            setMapping(payload.mapping ?? {});
            setNormalize(canNormalize);
            setPreview(null);
        } catch {
            onError(t.workspace.notices.offline);
        } finally {
            setAnalyzing(false);
        }
    };

    const onFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        event.target.value = '';
        if (!file) return;
        if (file.size > MAX_FILE_BYTES) {
            onError(copy.parseError);
            return;
        }
        const text = await file.text();
        setCsvText(text);
        void analyze(text);
    };

    const updateColumn = (header: string, patch: Partial<ColumnMapping>) => {
        setMapping((current) => {
            const next = { ...current, [header]: { ...current[header], ...patch, source: 'manual' as const } };
            // Title, SKU and price can only be mapped to one column each.
            if (patch.role && patch.role !== 'option' && patch.role !== 'ignore') {
                Object.keys(next).forEach((key) => {
                    if (key !== header && next[key].role === patch.role) next[key] = { role: 'ignore', source: 'manual' };
                });
            }
            if (patch.role === 'option' && !next[header].optionName) next[header].optionName = header;
            return next;
        });
    };

    const reset = () => {
        setSource(null);
        setAnalysis(null);
        setPreview(null);
        setMapping({});
        setCsvText('');
    };

    const runImport = async () => {
        if (!source || !preview || preview.options.length === 0) return;
        setImporting(true);
        const ok = await onImport({ csv: source, mapping, clean, normalize });
        setImporting(false);
        if (ok) reset();
    };

    const money = (value: number) => (locale === 'fr' ? value.toFixed(2).replace('.', ',') : value.toFixed(2));

    return (
        <div>
            <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="text-[13px] font-semibold text-ink">{copy.importTitle}</h3>
                {smart && <span className="chip bg-brand-soft text-brand-ink"><Sparkles className="h-3 w-3" /> {copy.smartBadge}</span>}
            </div>

            {!analysis ? (
                <div className="space-y-3">
                    <input ref={fileRef} type="file" accept=".csv,text/csv,text/plain" onChange={onFile} className="sr-only" id="supplier-csv-file" disabled={analyzing} />
                    <label htmlFor="supplier-csv-file" className="flex min-h-24 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-line-strong bg-canvas/60 p-4 text-center transition-colors hover:border-brand/50 hover:bg-brand-soft/30">
                        {analyzing ? <Loader2 className="h-5 w-5 animate-spin text-brand" /> : <FileUp className="h-5 w-5 text-brand" />}
                        <span className="text-sm font-medium text-ink">{copy.upload}</span>
                        <span className="text-xs text-ink-3">{copy.or}</span>
                    </label>
                    <textarea
                        value={csvText}
                        onChange={(event) => setCsvText(event.target.value)}
                        rows={5}
                        aria-label={copy.pasteLabel}
                        spellCheck={false}
                        placeholder={copy.pastePlaceholder}
                        className="field scroll-thin resize-y font-mono text-[13px] leading-relaxed"
                    />
                    <button type="button" onClick={() => void analyze(csvText)} disabled={!csvText.trim() || analyzing} className="btn btn-primary btn-sm">
                        {analyzing ? <Loader2 className="animate-spin" /> : <Sparkles />} {copy.analyze}
                    </button>
                </div>
            ) : (
                <div className="animate-rise space-y-4">
                    <div className="flex items-center justify-between gap-3">
                        <p className="text-sm text-ink-2">{copy.rowsDetected({ rows: formatNumber(analysis.rowCount), columns: analysis.headers.length })}</p>
                        <button type="button" onClick={reset} className="btn btn-ghost btn-sm"><RotateCcw /> {copy.startOver}</button>
                    </div>

                    <div>
                        <p className="mb-2 text-xs font-semibold text-ink-3">{copy.mappingTitle}</p>
                        <ul className="space-y-2">
                            {analysis.headers.map((header) => {
                                const column = mapping[header] ?? { role: 'ignore' };
                                const sample = analysis.samples[header];
                                return (
                                    <li key={header} className={cn('rounded-xl border border-line p-3', column.role === 'ignore' ? 'bg-canvas/40' : 'bg-surface')}>
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-medium text-ink">{header}</p>
                                                {sample && <p className="truncate text-xs text-ink-3">{sample}</p>}
                                            </div>
                                            <select
                                                value={column.role}
                                                onChange={(event) => updateColumn(header, { role: event.target.value as ColumnRole })}
                                                aria-label={header}
                                                className="field field-sm w-36 shrink-0"
                                            >
                                                {ROLES.map((role) => <option key={role} value={role}>{copy.roles[role]}</option>)}
                                            </select>
                                        </div>
                                        {column.role === 'option' && (
                                            <input
                                                value={column.optionName ?? ''}
                                                onChange={(event) => updateColumn(header, { optionName: event.target.value })}
                                                aria-label={copy.optionNameLabel}
                                                placeholder={copy.optionNameLabel}
                                                className="field field-sm mt-2"
                                            />
                                        )}
                                        {column.source && column.source !== 'manual' && column.role !== 'ignore' && (
                                            <p className="mt-1.5 text-[11px] text-brand">{column.source === 'content' ? copy.fromContent : copy.fromHeader}</p>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    </div>

                    <div className="space-y-2">
                        {entitlements.canTransformCatalog && (
                            <Toggle checked={clean} onChange={setClean} label={copy.cleanToggle} hint={copy.cleanHint} />
                        )}
                        <Toggle
                            checked={normalize}
                            onChange={setNormalize}
                            label={copy.normalizeToggle}
                            hint={copy.normalizeHint}
                            locked={!canNormalize}
                            lockLabel={copy.scaleBadge}
                            onLocked={onUpgrade}
                        />
                    </div>

                    <div className="rounded-xl border border-line bg-canvas/60 p-4">
                        <p className="mb-2 text-xs font-semibold text-ink-3">{copy.previewTitle}</p>
                        {!preview ? (
                            <Loader2 className="h-4 w-4 animate-spin text-ink-3" aria-label={copy.previewTitle} />
                        ) : preview.options.length === 0 ? (
                            <p className="text-sm text-warn">{copy.noOptions}</p>
                        ) : (
                            <div className="space-y-2.5">
                                {preview.productTitle && <p className="text-[15px] font-semibold text-ink">{preview.productTitle}</p>}
                                {preview.options.map((option) => (
                                    <div key={option.name}>
                                        <p className="text-xs font-medium text-ink-3">{option.name}</p>
                                        <div className="mt-1 flex flex-wrap gap-1.5">
                                            {option.values.map((value) => <span key={value} className="chip bg-surface text-ink-2 ring-1 ring-line">{value}</span>)}
                                            {option.total > option.values.length && <span className="chip text-ink-3">+{option.total - option.values.length}</span>}
                                        </div>
                                    </div>
                                ))}
                                <p className="flex flex-wrap gap-x-3 gap-y-1 pt-1 text-xs text-ink-2">
                                    <span className="font-semibold text-ink">{copy.previewVariants({ count: formatNumber(preview.stats.variants) })}</span>
                                    <span>{copy.previewBase({ price: money(preview.basePrice) })}</span>
                                    <span>{copy.previewRows({ imported: formatNumber(preview.stats.imported), skipped: formatNumber(preview.stats.skipped) })}</span>
                                </p>
                                {preview.stats.droppedOptions.length > 0 && (
                                    <p className="text-xs text-warn">{copy.dropped({ names: preview.stats.droppedOptions.join(', ') })}</p>
                                )}
                            </div>
                        )}
                    </div>

                    <p className="text-xs text-ink-3">{copy.replaceWarning}</p>
                    <button type="button" onClick={runImport} disabled={importing || !preview || preview.options.length === 0} className="btn btn-primary w-full">
                        {importing ? <Loader2 className="animate-spin" /> : <Wand2 />}
                        {copy.importButton({ rows: formatNumber(analysis.rowCount) })}
                    </button>
                </div>
            )}
        </div>
    );
}
