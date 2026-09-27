'use client';

import React, { useMemo, useRef, useState } from 'react';
import { FileUp, Loader2, Lock, RotateCcw, Sparkles, Wand2 } from 'lucide-react';
import { useProductStore } from '../../store/productStore';
import { buildCatalogFromRows, parseCsv, suggestMapping, type ColumnMapping, type ColumnRole, type ImportedCatalog, type ParsedCsv } from '../../domain/import/importCatalog';
import { useI18n } from '../i18n/i18n-provider';
import { cn } from '../../lib/utils';

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const ROLES: ColumnRole[] = ['option', 'title', 'sku', 'price', 'ignore'];

interface ImportPanelProps {
    onUpgrade: () => void;
    /** Meters the rows on the server and applies the catalog; resolves true on success. */
    onImport: (catalog: ImportedCatalog, rows: number) => Promise<boolean>;
    onError: (message: string) => void;
}

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

export function ImportPanel({ onUpgrade, onImport, onError }: ImportPanelProps) {
    const { t, formatNumber, locale } = useI18n();
    const copy = t.workspace.tools;
    const { entitlements } = useProductStore((state) => state.access);
    const fileRef = useRef<HTMLInputElement>(null);
    const [csvText, setCsvText] = useState('');
    const [parsed, setParsed] = useState<ParsedCsv | null>(null);
    const [mapping, setMapping] = useState<Record<string, ColumnMapping>>({});
    const [clean, setClean] = useState(true);
    const [normalize, setNormalize] = useState(false);
    const [importing, setImporting] = useState(false);

    const smart = entitlements.canUseAiMapping;
    const canNormalize = entitlements.canNormalizeSuppliers;

    const preview = useMemo(
        () => (parsed ? buildCatalogFromRows(parsed.rows, mapping, { clean: clean && entitlements.canTransformCatalog, normalize: normalize && canNormalize }) : null),
        [parsed, mapping, clean, normalize, entitlements.canTransformCatalog, canNormalize],
    );

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

    const analyze = (text: string) => {
        const result = parseCsv(text);
        if (result.headers.length === 0 || result.rows.length === 0) {
            onError(copy.parseError);
            return;
        }
        setParsed(result);
        setMapping(suggestMapping(result, smart));
        setNormalize(canNormalize);
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
        analyze(text);
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
        setParsed(null);
        setMapping({});
        setCsvText('');
    };

    const runImport = async () => {
        if (!parsed || !preview || preview.options.length === 0) return;
        setImporting(true);
        const ok = await onImport(preview, parsed.rows.length);
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

            {!parsed ? (
                <div className="space-y-3">
                    <input ref={fileRef} type="file" accept=".csv,text/csv,text/plain" onChange={onFile} className="sr-only" id="supplier-csv-file" />
                    <label htmlFor="supplier-csv-file" className="flex min-h-24 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-line-strong bg-canvas/60 p-4 text-center transition-colors hover:border-brand/50 hover:bg-brand-soft/30">
                        <FileUp className="h-5 w-5 text-brand" />
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
                    <button type="button" onClick={() => analyze(csvText)} disabled={!csvText.trim()} className="btn btn-primary btn-sm">
                        <Sparkles /> {copy.analyze}
                    </button>
                </div>
            ) : (
                <div className="animate-rise space-y-4">
                    <div className="flex items-center justify-between gap-3">
                        <p className="text-sm text-ink-2">{copy.rowsDetected({ rows: formatNumber(parsed.rows.length), columns: parsed.headers.length })}</p>
                        <button type="button" onClick={reset} className="btn btn-ghost btn-sm"><RotateCcw /> {copy.startOver}</button>
                    </div>

                    <div>
                        <p className="mb-2 text-xs font-semibold text-ink-3">{copy.mappingTitle}</p>
                        <ul className="space-y-2">
                            {parsed.headers.map((header) => {
                                const column = mapping[header] ?? { role: 'ignore' };
                                const sample = parsed.rows.find((row) => row[header]?.trim())?.[header]?.trim();
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

                    {preview && (
                        <div className="rounded-xl border border-line bg-canvas/60 p-4">
                            <p className="mb-2 text-xs font-semibold text-ink-3">{copy.previewTitle}</p>
                            {preview.options.length === 0 ? (
                                <p className="text-sm text-warn">{copy.noOptions}</p>
                            ) : (
                                <div className="space-y-2.5">
                                    {preview.productTitle && <p className="text-[15px] font-semibold text-ink">{preview.productTitle}</p>}
                                    {preview.options.map((option) => (
                                        <div key={option.name}>
                                            <p className="text-xs font-medium text-ink-3">{option.name}</p>
                                            <div className="mt-1 flex flex-wrap gap-1.5">
                                                {option.values.slice(0, 12).map((value) => <span key={value} className="chip bg-surface text-ink-2 ring-1 ring-line">{value}</span>)}
                                                {option.values.length > 12 && <span className="chip text-ink-3">+{option.values.length - 12}</span>}
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
                    )}

                    <p className="text-xs text-ink-3">{copy.replaceWarning}</p>
                    <button type="button" onClick={runImport} disabled={importing || !preview || preview.options.length === 0} className="btn btn-primary w-full">
                        {importing ? <Loader2 className="animate-spin" /> : <Wand2 />}
                        {copy.importButton({ rows: formatNumber(parsed.rows.length) })}
                    </button>
                </div>
            )}
        </div>
    );
}
