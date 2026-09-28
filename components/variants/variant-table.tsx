'use client';

import React, { useMemo, useState } from 'react';
import { AlertCircle, Grid3x3, RotateCcw, Undo2, X } from 'lucide-react';
import { useProductStore } from '../../store/productStore';
import { validateProductData } from '../../domain/validation/validateProduct';
import { InternalVariant } from '../../types';
import { cn } from '../../lib/utils';
import { useI18n } from '../i18n/i18n-provider';
import { DecimalInput } from '../ui/decimal-input';

const PAGE_SIZE = 100;

type Field = 'sku' | 'price';

interface CellProps {
    variant: InternalVariant;
    field: Field;
    hasError: boolean;
    onChange: (variantId: string, field: Field, value: string | number) => void;
    onReset: (variantId: string, field: Field) => void;
    compact?: boolean;
}

function VariantField({ variant, field, hasError, onChange, onReset, compact }: CellProps) {
    const { t } = useI18n();
    const copy = t.workspace.table;
    const overridden = field === 'sku' ? variant.isSkuOverridden : variant.isPriceOverridden;
    const label = field === 'sku' ? copy.sku : copy.price;
    const ariaLabel = copy.fieldFor({ field: label, variant: Object.values(variant.attributes).join(' / ') });
    const className = cn(
        'field field-sm tabular-nums',
        field === 'sku' ? 'font-mono uppercase' : 'pl-6',
        overridden && 'pr-8',
        compact && 'min-h-10',
        hasError && '!border-danger/60 !bg-danger-soft/40',
        overridden && !hasError && '!border-gold/50 !bg-gold-soft/50',
    );

    return (
        <div className="relative flex items-center">
            {field === 'price' && <span className="pointer-events-none absolute left-2.5 text-xs text-ink-3">{t.workspace.rules.currency}</span>}
            {field === 'sku' ? (
                <input
                    type="text"
                    value={variant.sku}
                    spellCheck={false}
                    autoComplete="off"
                    aria-label={ariaLabel}
                    aria-invalid={hasError || undefined}
                    onChange={(event) => onChange(variant.id, field, event.target.value)}
                    className={className}
                />
            ) : (
                <DecimalInput
                    value={variant.price}
                    aria-label={ariaLabel}
                    aria-invalid={hasError || undefined}
                    onValueChange={(value) => onChange(variant.id, field, value)}
                    className={className}
                />
            )}
            {overridden && (
                <button
                    type="button"
                    onClick={() => onReset(variant.id, field)}
                    title={copy.resetTitle({ field: label })}
                    aria-label={copy.reset({ field: label })}
                    className="absolute right-1 inline-flex h-7 w-7 items-center justify-center rounded-md text-gold transition-colors hover:bg-gold-soft"
                >
                    <RotateCcw className="h-3.5 w-3.5" />
                </button>
            )}
        </div>
    );
}

export const VariantTable: React.FC = () => {
    const { t, formatNumber } = useI18n();
    const copy = t.workspace.table;
    const { productTitle, options, variants, hiddenCount, updateRowOverride, clearRowOverride, excludeVariant, restoreAllVariants } = useProductStore();
    const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

    const errorsByRow = useMemo(() => {
        const map = new Map<string, Set<string>>();
        validateProductData({ productTitle, options, variants }).forEach((error) => {
            if (!error.rowId) return;
            if (!map.has(error.rowId)) map.set(error.rowId, new Set());
            map.get(error.rowId)!.add(error.field);
        });
        return map;
    }, [productTitle, options, variants]);

    if (variants.length === 0) {
        const allHidden = hiddenCount > 0;
        return (
            <div className="card flex min-h-80 flex-col items-center justify-center p-8 text-center">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-soft text-brand-ink">
                    <Grid3x3 className="h-6 w-6" />
                </span>
                <h3 className="mt-4 text-base font-semibold text-ink">{allHidden ? copy.allHiddenTitle : copy.emptyTitle}</h3>
                <p className="mt-1 max-w-xs text-sm text-ink-2">{allHidden ? copy.allHiddenText : copy.emptyText}</p>
                {allHidden && <button type="button" onClick={restoreAllVariants} className="btn btn-secondary btn-sm mt-4"><Undo2 /> {copy.restoreAll}</button>}
            </div>
        );
    }

    const removeButton = (row: InternalVariant) => (
        <button
            type="button"
            onClick={() => excludeVariant(row.id)}
            aria-label={copy.removeRow({ variant: Object.values(row.attributes).join(' / ') })}
            title={copy.removeRow({ variant: Object.values(row.attributes).join(' / ') })}
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-ink-3 transition-colors hover:bg-danger-soft hover:text-danger"
        >
            <X className="h-4 w-4" />
        </button>
    );

    const headers = options.filter((option) => option.name.trim() !== '' && option.values.some((value) => value.trim())).map((option) => option.name.trim());
    const visible = variants.slice(0, visibleCount);
    const remaining = variants.length - visible.length;

    return (
        <div className="card overflow-hidden">
            {/* Desktop / tablet table */}
            <div className="scroll-thin hidden max-h-[calc(100dvh-17rem)] overflow-auto md:block">
                <table className="w-full min-w-max border-separate border-spacing-0 text-left text-sm">
                    <thead className="sticky top-0 z-10 bg-surface/95 backdrop-blur">
                        <tr className="text-xs font-semibold text-ink-3">
                            <th scope="col" className="w-12 border-b border-line px-4 py-3 font-semibold">#</th>
                            {headers.map((header) => (
                                <th key={header} scope="col" className="border-b border-line px-3 py-3 font-semibold">{header}</th>
                            ))}
                            <th scope="col" className="w-64 border-b border-line px-3 py-3 font-semibold">{copy.sku}</th>
                            <th scope="col" className="w-36 border-b border-line px-3 py-3 font-semibold">{copy.price}</th>
                            <th scope="col" className="w-12 border-b border-line py-3 pr-3"><span className="sr-only">{copy.restoreAll}</span></th>
                        </tr>
                    </thead>
                    <tbody>
                        {visible.map((row, index) => {
                            const rowErrors = errorsByRow.get(row.id);
                            return (
                                <tr key={row.id} className={cn('group transition-colors', rowErrors ? 'bg-danger-soft/30' : 'hover:bg-canvas/70')}>
                                    <td className="border-b border-line px-4 py-2 font-mono text-xs text-ink-3">
                                        {rowErrors ? <AlertCircle className="h-4 w-4 text-danger" aria-label={copy.rowIssues} /> : index + 1}
                                    </td>
                                    {headers.map((header) => (
                                        <td key={header} className="border-b border-line px-3 py-2 font-medium text-ink">{row.attributes[header] || '—'}</td>
                                    ))}
                                    <td className="border-b border-line px-3 py-2">
                                        <VariantField variant={row} field="sku" hasError={!!rowErrors?.has('sku')} onChange={updateRowOverride} onReset={clearRowOverride} />
                                    </td>
                                    <td className="border-b border-line px-3 py-2">
                                        <VariantField variant={row} field="price" hasError={!!rowErrors?.has('price')} onChange={updateRowOverride} onReset={clearRowOverride} />
                                    </td>
                                    <td className="border-b border-line py-2 pr-3">{removeButton(row)}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Mobile cards */}
            <ul className="divide-y divide-line md:hidden">
                {visible.map((row, index) => {
                    const rowErrors = errorsByRow.get(row.id);
                    return (
                        <li key={row.id} className={cn('p-4', rowErrors && 'bg-danger-soft/30')}>
                            <div className="mb-2.5 flex items-center justify-between gap-3">
                                <p className="min-w-0 truncate text-[15px] font-semibold text-ink">
                                    {headers.map((header) => row.attributes[header]).filter(Boolean).join(' / ')}
                                </p>
                                <span className="flex shrink-0 items-center gap-1 font-mono text-xs text-ink-3">
                                    {rowErrors ? <AlertCircle className="h-4 w-4 text-danger" aria-label={copy.rowIssues} /> : `#${index + 1}`}
                                    {removeButton(row)}
                                </span>
                            </div>
                            <div className="grid grid-cols-[1fr_7.5rem] gap-2">
                                <VariantField compact variant={row} field="sku" hasError={!!rowErrors?.has('sku')} onChange={updateRowOverride} onReset={clearRowOverride} />
                                <VariantField compact variant={row} field="price" hasError={!!rowErrors?.has('price')} onChange={updateRowOverride} onReset={clearRowOverride} />
                            </div>
                        </li>
                    );
                })}
            </ul>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line bg-surface-2/40 px-4 py-3 text-xs text-ink-3">
                <span>
                    {copy.showing({ shown: formatNumber(visible.length), total: formatNumber(variants.length) })}
                    <span className="hidden sm:inline"> · {copy.editedHint}</span>
                    {hiddenCount > 0 && (
                        <>
                            {' · '}{copy.hidden({ count: formatNumber(hiddenCount) })}{' '}
                            <button type="button" onClick={restoreAllVariants} className="font-semibold text-brand hover:underline">{copy.restoreAll}</button>
                        </>
                    )}
                </span>
                {remaining > 0 && (
                    <button type="button" onClick={() => setVisibleCount((count) => count + PAGE_SIZE)} className="btn btn-secondary btn-sm">
                        {copy.showMore({ count: Math.min(PAGE_SIZE, remaining) })}
                    </button>
                )}
            </div>
        </div>
    );
};
