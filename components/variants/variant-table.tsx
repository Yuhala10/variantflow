'use client';

import React, { useMemo, useState } from 'react';
import { AlertCircle, Grid3x3, RotateCcw } from 'lucide-react';
import { useProductStore } from '../../store/productStore';
import { validateProductData } from '../../domain/validation/validateProduct';
import { InternalVariant } from '../../types';
import { cn } from '../../lib/utils';

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
    const overridden = field === 'sku' ? variant.isSkuOverridden : variant.isPriceOverridden;
    const label = field === 'sku' ? 'SKU' : 'Price';

    return (
        <div className="relative flex items-center">
            {field === 'price' && <span className="pointer-events-none absolute left-2.5 text-xs text-ink-3">$</span>}
            <input
                type={field === 'sku' ? 'text' : 'number'}
                inputMode={field === 'price' ? 'decimal' : undefined}
                step={field === 'price' ? '0.01' : undefined}
                value={field === 'sku' ? variant.sku : variant.price}
                spellCheck={false}
                aria-label={`${label} for ${Object.values(variant.attributes).join(' / ')}`}
                aria-invalid={hasError || undefined}
                onChange={(event) => onChange(variant.id, field, field === 'sku' ? event.target.value : parseFloat(event.target.value) || 0)}
                className={cn(
                    'field field-sm tabular-nums',
                    field === 'sku' ? 'font-mono uppercase' : 'pl-6',
                    overridden && 'pr-8',
                    compact && 'min-h-10',
                    hasError && '!border-danger/60 !bg-danger-soft/40',
                    overridden && !hasError && '!border-gold/50 !bg-gold-soft/50',
                )}
            />
            {overridden && (
                <button
                    type="button"
                    onClick={() => onReset(variant.id, field)}
                    title={`Reset ${label.toLowerCase()} to the rule-based value`}
                    aria-label={`Reset ${label.toLowerCase()}`}
                    className="absolute right-1 inline-flex h-7 w-7 items-center justify-center rounded-md text-gold transition-colors hover:bg-gold-soft"
                >
                    <RotateCcw className="h-3.5 w-3.5" />
                </button>
            )}
        </div>
    );
}

export const VariantTable: React.FC = () => {
    const { productTitle, options, variants, updateRowOverride, clearRowOverride } = useProductStore();
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
        return (
            <div className="card flex min-h-80 flex-col items-center justify-center p-8 text-center">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-soft text-brand-ink">
                    <Grid3x3 className="h-6 w-6" />
                </span>
                <h3 className="mt-4 text-base font-semibold text-ink">No variants yet</h3>
                <p className="mt-1 max-w-xs text-sm text-ink-2">Add an option with at least one value and every combination will appear here.</p>
            </div>
        );
    }

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
                            <th scope="col" className="w-64 border-b border-line px-3 py-3 font-semibold">SKU</th>
                            <th scope="col" className="w-36 border-b border-line px-3 py-3 pr-4 font-semibold">Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        {visible.map((row, index) => {
                            const rowErrors = errorsByRow.get(row.id);
                            return (
                                <tr key={row.id} className={cn('group transition-colors', rowErrors ? 'bg-danger-soft/30' : 'hover:bg-canvas/70')}>
                                    <td className="border-b border-line px-4 py-2 font-mono text-xs text-ink-3">
                                        {rowErrors ? <AlertCircle className="h-4 w-4 text-danger" aria-label="Row has issues" /> : index + 1}
                                    </td>
                                    {headers.map((header) => (
                                        <td key={header} className="border-b border-line px-3 py-2 font-medium text-ink">{row.attributes[header] || '—'}</td>
                                    ))}
                                    <td className="border-b border-line px-3 py-2">
                                        <VariantField variant={row} field="sku" hasError={!!rowErrors?.has('sku')} onChange={updateRowOverride} onReset={clearRowOverride} />
                                    </td>
                                    <td className="border-b border-line px-3 py-2 pr-4">
                                        <VariantField variant={row} field="price" hasError={!!rowErrors?.has('price')} onChange={updateRowOverride} onReset={clearRowOverride} />
                                    </td>
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
                                <span className="shrink-0 font-mono text-xs text-ink-3">
                                    {rowErrors ? <AlertCircle className="h-4 w-4 text-danger" aria-label="Row has issues" /> : `#${index + 1}`}
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
                    Showing {visible.length.toLocaleString()} of {variants.length.toLocaleString()} variants
                    <span className="hidden sm:inline"> · <span className="text-gold">Gold</span> fields were edited by hand</span>
                </span>
                {remaining > 0 && (
                    <button type="button" onClick={() => setVisibleCount((count) => count + PAGE_SIZE)} className="btn btn-secondary btn-sm">
                        Show {Math.min(PAGE_SIZE, remaining)} more
                    </button>
                )}
            </div>
        </div>
    );
};
