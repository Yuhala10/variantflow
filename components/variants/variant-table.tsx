'use client';

import React from 'react';
import { useProductStore } from '../../store/productStore';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Input } from '../ui/input';
import { AlertCircle } from 'lucide-react';
import { validateProductData } from '../../domain/validation/validateProduct';

export const VariantTable: React.FC = () => {
    const { productTitle, options, variants, updateRowOverride } = useProductStore();

    const activeValidationErrors = validateProductData({ productTitle, options, variants });

    if (variants.length === 0) {
        return (
            <div className="h-64 rounded-xl border border-dashed border-slate-200 bg-white flex flex-col items-center justify-center text-center p-6">
                <p className="text-xs font-medium text-slate-400 italic">
                    No variant combinations compiled yet. Add option categories to compute matrix grid.
                </p>
            </div>
        );
    }

    const visibleHeaders = options.filter(opt => opt.name.trim() !== '' && opt.values.length > 0).map(o => o.name);

    return (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col h-full">
            <div className="overflow-x-auto">
                <Table className="w-full text-left border-collapse min-w-max">
                    <TableHeader className="bg-slate-50 border-b border-slate-200">
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="w-12 text-xxs font-bold uppercase tracking-wider text-slate-400 py-3.5 px-4">#</TableHead>
                            {visibleHeaders.map((header) => (
                                <TableHead key={header} className="text-xxs font-bold uppercase tracking-wider text-slate-500 py-3.5 px-4">
                                    {header}
                                </TableHead>
                            ))}
                            <TableHead className="w-56 text-xxs font-bold uppercase tracking-wider text-slate-500 py-3.5 px-4">Variant SKU</TableHead>
                            <TableHead className="w-36 text-xxs font-bold uppercase tracking-wider text-slate-500 py-3.5 px-4">Price (\$)</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                        {variants.map((row, index) => {
                            const rowHasErrors = activeValidationErrors.some(err => err.rowId === row.id);

                            return (
                                <TableRow
                                    key={row.id}
                                    className={`transition-colors ${rowHasErrors ? 'bg-rose-50/30 hover:bg-rose-50/50' : 'hover:bg-slate-50/50'}`}
                                >
                                    <TableCell className="py-3 px-4 text-[10px] font-mono text-slate-400">{index + 1}</TableCell>

                                    {visibleHeaders.map((header) => (
                                        <TableCell key={header} className="py-3 px-4 font-semibold text-slate-900">
                                            {row.attributes[header] || '-'}
                                        </TableCell>
                                    ))}

                                    <TableCell className="py-2 px-3 relative">
                                        <div className="flex items-center gap-1.5 w-full">
                                            <Input
                                                type="text"
                                                value={row.sku}
                                                onChange={(e) => updateRowOverride(row.id, 'sku', e.target.value)}
                                                className={`h-8 font-mono text-xxs uppercase shadow-none rounded-md px-2 focus-visible:ring-1 focus-visible:ring-slate-900 transition-all ${row.isSkuOverridden
                                                        ? 'bg-amber-50/40 border-amber-300 text-amber-900 font-semibold'
                                                        : 'bg-slate-50/60 border-slate-200 text-slate-700'
                                                    }`}
                                            />
                                            {rowHasErrors && activeValidationErrors.some(e => e.rowId === row.id && e.field === 'sku') && (
                                                <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                                            )}
                                        </div>
                                    </TableCell>

                                    <TableCell className="py-2 px-3">
                                        <div className="flex items-center gap-1.5 w-full">
                                            <Input
                                                type="number"
                                                step="0.01"
                                                value={row.price}
                                                onChange={(e) => updateRowOverride(row.id, 'price', parseFloat(e.target.value) || 0)}
                                                className={`h-8 text-xxs shadow-none rounded-md px-2 focus-visible:ring-1 focus-visible:ring-slate-900 transition-all ${row.isPriceOverridden
                                                        ? 'bg-amber-50/40 border-amber-300 text-amber-900 font-semibold'
                                                        : 'bg-slate-50/60 border-slate-200 text-slate-700'
                                                    }`}
                                            />
                                            {rowHasErrors && activeValidationErrors.some(e => e.rowId === row.id && e.field === 'price') && (
                                                <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};
