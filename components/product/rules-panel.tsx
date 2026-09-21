'use client';

import React, { useState } from 'react';
import { useProductStore } from '../../store/productStore';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Plus, Sliders, DollarSign, Cpu } from 'lucide-react';

export const RulesPanel: React.FC = () => {
    const {
        skuConfig,
        setSkuTemplate,
        basePrice,
        setBasePrice,
        priceRules,
        addPriceRule,
        removePriceRule,
    } = useProductStore();

    const [ruleAttr, setRuleAttr] = useState('');
    const [ruleMod, setRuleMod] = useState('');

    const handleAddPriceRule = (e: React.FormEvent) => {
        e.preventDefault();
        const parsedMod = parseFloat(ruleMod);
        if (!ruleAttr.trim() || Number.isNaN(parsedMod)) return;
        addPriceRule(ruleAttr.trim(), parsedMod);
        setRuleAttr('');
        setRuleMod('');
    };

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-slate-500" />
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        SKU Template Pattern
                    </label>
                </div>
                <Input
                    type="text"
                    value={skuConfig.pattern}
                    onChange={(e) => setSkuTemplate(e.target.value)}
                    placeholder="e.g., TSH-{COLOR}-{SIZE}"
                    className="h-11 border-slate-200 font-mono tracking-wide text-xs focus-visible:ring-1 focus-visible:ring-slate-900 bg-white shadow-none uppercase"
                />
                <p className="text-[10px] text-slate-400 leading-normal px-0.5">
                    Token variables mapped automatically inside curly braces. Match option names case-insensitively, for example <code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-600 font-mono">{'{COLOR}'}</code>.
                </p>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-4">
                <div className="flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-slate-500" />
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Base Matrix Price ($)
                    </label>
                </div>
                <Input
                    type="number"
                    step="0.01"
                    value={basePrice || ''}
                    onChange={(e) => setBasePrice(parseFloat(e.target.value) || 0)}
                    className="h-11 border-slate-200 text-sm font-medium focus-visible:ring-1 focus-visible:ring-slate-900 bg-white shadow-none"
                />

                <div className="space-y-3 pt-2">
                    <div className="flex items-center gap-1.5">
                        <Sliders className="w-3.5 h-3.5 text-slate-500" />
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                            Cost Modifier Rules
                        </h4>
                    </div>

                    {priceRules.length === 0 ? (
                        <div className="text-[11px] text-slate-400 italic bg-slate-50/50 rounded-xl p-3 border border-dashed border-slate-200 text-center">
                            No conditional price modifications active.
                        </div>
                    ) : (
                        <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                            {priceRules.map((rule) => (
                                <div
                                    key={rule.id}
                                    className="flex items-center justify-between text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium text-slate-700"
                                >
                                    <span>
                                        When attribute matches{' '}
                                        <strong className="text-slate-900 font-semibold bg-white border px-1.5 py-0.5 rounded shadow-sm">
                                            {rule.targetValue}
                                        </strong>
                                    </span>
                                    <div className="flex items-center gap-3">
                                        <span className={rule.modifier >= 0 ? 'text-emerald-600' : 'text-rose-600 font-medium'}>
                                            {rule.modifier >= 0 ? `+$${rule.modifier.toFixed(2)}` : `-$${Math.abs(rule.modifier).toFixed(2)}`}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => removePriceRule(rule.id)}
                                            className="text-slate-400 hover:text-rose-600 transition-colors text-[10px]"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <form onSubmit={handleAddPriceRule} className="flex gap-2 pt-1">
                        <Input
                            type="text"
                            placeholder="e.g., XL"
                            value={ruleAttr}
                            onChange={(e) => setRuleAttr(e.target.value)}
                            className="h-9 w-1/2 border-slate-200 bg-white text-xs shadow-none rounded-lg focus-visible:ring-1 focus-visible:ring-slate-900"
                        />
                        <Input
                            type="number"
                            step="0.01"
                            placeholder="+$2.00"
                            value={ruleMod}
                            onChange={(e) => setRuleMod(e.target.value)}
                            className="h-9 w-5/12 border-slate-200 bg-white text-xs shadow-none rounded-lg focus-visible:ring-1 focus-visible:ring-slate-900"
                        />
                        <Button
                            type="submit"
                            size="icon"
                            className="h-9 w-9 bg-slate-950 hover:bg-slate-800 text-white rounded-lg flex items-center justify-center transition-colors shadow-sm"
                        >
                            <Plus className="w-4 h-4" />
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
};
