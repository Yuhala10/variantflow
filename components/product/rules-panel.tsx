'use client';

import React, { useMemo, useRef, useState } from 'react';
import { Plus, X } from 'lucide-react';
import { useProductStore } from '../../store/productStore';
import { useI18n } from '../i18n/i18n-provider';

export const RulesPanel: React.FC = () => {
    const { t, locale } = useI18n();
    const copy = t.workspace.rules;
    const formatModifier = (value: number) => {
        const amount = Math.abs(value).toFixed(2);
        return `${value >= 0 ? '+' : '−'}${locale === 'fr' ? `${amount.replace('.', ',')} $` : `$${amount}`}`;
    };
    const { options, variants, skuConfig, setSkuTemplate, basePrice, setBasePrice, priceRules, addPriceRule, removePriceRule } = useProductStore();
    const [ruleTarget, setRuleTarget] = useState('');
    const [ruleModifier, setRuleModifier] = useState('');
    const skuInputRef = useRef<HTMLInputElement>(null);

    const tokens = options.map((option) => option.name.trim()).filter(Boolean);
    const allValues = useMemo(
        () => [...new Set(options.flatMap((option) => option.values.map((value) => value.trim()).filter(Boolean)))],
        [options],
    );
    const previewSku = variants[0]?.sku;

    const insertToken = (token: string) => {
        const input = skuInputRef.current;
        const insert = `{${token.toUpperCase()}}`;
        const pattern = skuConfig.pattern;
        const start = input?.selectionStart ?? pattern.length;
        const end = input?.selectionEnd ?? pattern.length;
        const separator = start > 0 && !/[-_]$/.test(pattern.slice(0, start)) ? '-' : '';
        const next = `${pattern.slice(0, start)}${separator}${insert}${pattern.slice(end)}`;
        setSkuTemplate(next);
        requestAnimationFrame(() => {
            const caret = start + separator.length + insert.length;
            input?.focus();
            input?.setSelectionRange(caret, caret);
        });
    };

    const handleAddRule = (event: React.FormEvent) => {
        event.preventDefault();
        const modifier = parseFloat(ruleModifier);
        if (!ruleTarget.trim() || Number.isNaN(modifier)) return;
        addPriceRule(ruleTarget.trim(), modifier);
        setRuleTarget('');
        setRuleModifier('');
    };

    return (
        <div className="space-y-7">
            <div>
                <label htmlFor="sku-pattern" className="label">{copy.skuPattern}</label>
                <input
                    ref={skuInputRef}
                    id="sku-pattern"
                    type="text"
                    value={skuConfig.pattern}
                    onChange={(event) => setSkuTemplate(event.target.value)}
                    placeholder={copy.skuPlaceholder}
                    autoCapitalize="characters"
                    autoComplete="off"
                    spellCheck={false}
                    className="field font-mono text-sm uppercase tracking-wide"
                />
                {tokens.length > 0 && (
                    <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                        <span className="text-xs text-ink-3">{copy.insert}</span>
                        {tokens.map((token) => (
                            <button
                                key={token}
                                type="button"
                                onClick={() => insertToken(token)}
                                className="kbd min-h-8 px-2 transition-colors hover:border-brand/40 hover:bg-brand-soft"
                            >
                                {`{${token.toUpperCase()}}`}
                            </button>
                        ))}
                    </div>
                )}
                <p className="hint">
                    {previewSku
                        ? <>{copy.firstSku} <span className="font-mono font-medium text-ink-2">{previewSku}</span></>
                        : copy.skuHint}
                </p>
            </div>

            <div>
                <label htmlFor="base-price" className="label">{copy.basePrice}</label>
                <div className="relative">
                    <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-ink-3">{copy.currency}</span>
                    <input
                        id="base-price"
                        type="number"
                        inputMode="decimal"
                        step="0.01"
                        min="0"
                        value={basePrice || ''}
                        onChange={(event) => setBasePrice(parseFloat(event.target.value) || 0)}
                        placeholder="0.00"
                        className="field pl-7 tabular-nums"
                    />
                </div>
            </div>

            <div>
                <h3 className="label">{copy.adjustments}</h3>
                <p className="-mt-1 mb-3 text-xs text-ink-3">{copy.adjustmentsHint}</p>

                {priceRules.length > 0 && (
                    <ul className="mb-3 space-y-2">
                        {priceRules.map((rule) => (
                            <li key={rule.id} className="animate-rise flex items-center justify-between gap-3 rounded-xl border border-line bg-canvas/60 py-1.5 pl-3.5 pr-1.5 text-sm">
                                <span className="min-w-0 truncate text-ink-2">
                                    {copy.when} <span className="font-semibold text-ink">{rule.targetValue}</span>
                                </span>
                                <span className="flex items-center gap-1">
                                    <span className={`chip tabular-nums ${rule.modifier >= 0 ? 'bg-success-soft text-success' : 'bg-danger-soft text-danger'}`}>
                                        {formatModifier(rule.modifier)}
                                    </span>
                                    <button type="button" onClick={() => removePriceRule(rule.id)} aria-label={copy.removeRule({ value: rule.targetValue })} className="btn btn-ghost btn-icon btn-sm text-ink-3">
                                        <X />
                                    </button>
                                </span>
                            </li>
                        ))}
                    </ul>
                )}

                <form onSubmit={handleAddRule} className="grid grid-cols-[1fr_7rem_auto] gap-2">
                    <input
                        type="text"
                        list="price-rule-values"
                        placeholder={copy.valuePlaceholder}
                        aria-label={copy.valueLabel}
                        value={ruleTarget}
                        onChange={(event) => setRuleTarget(event.target.value)}
                        className="field min-w-0"
                    />
                    <datalist id="price-rule-values">
                        {allValues.map((value) => <option key={value} value={value} />)}
                    </datalist>
                    <input
                        type="number"
                        inputMode="decimal"
                        step="0.01"
                        placeholder="+2.00"
                        aria-label={copy.changeLabel}
                        value={ruleModifier}
                        onChange={(event) => setRuleModifier(event.target.value)}
                        className="field tabular-nums"
                    />
                    <button type="submit" aria-label={copy.addAdjustment} className="btn btn-secondary btn-icon min-h-11 w-11" disabled={!ruleTarget.trim() || !ruleModifier}>
                        <Plus />
                    </button>
                </form>
            </div>
        </div>
    );
};
