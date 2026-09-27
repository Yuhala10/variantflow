'use client';

import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useProductStore } from '../../store/productStore';
import { OptionValuesInput } from './option-values-input';
import { useI18n } from '../i18n/i18n-provider';

// Shopify supports up to three options per product.
const MAX_OPTIONS = 3;

export const OptionsBuilder: React.FC = () => {
    const { t } = useI18n();
    const copy = t.workspace.options;
    const { productTitle, setProductTitle, options, addOptionGroup, updateOptionGroup, removeOptionGroup } = useProductStore();
    const [newGroupName, setNewGroupName] = useState('');
    const [lastAddedId, setLastAddedId] = useState<string | null>(null);

    const atLimit = options.length >= MAX_OPTIONS;
    const existingNames = new Set(options.map((option) => option.name.trim().toLowerCase()));
    const availablePresets = copy.presets.filter((preset) => !existingNames.has(preset.name.toLowerCase()));

    const addGroup = (name: string, values: string[] = []) => {
        addOptionGroup(name, values);
        const created = useProductStore.getState().options.at(-1);
        setLastAddedId(values.length ? null : created?.id ?? null);
    };

    const handleAddGroup = (event: React.FormEvent) => {
        event.preventDefault();
        if (!newGroupName.trim() || atLimit) return;
        addGroup(newGroupName.trim());
        setNewGroupName('');
    };

    return (
        <div className="space-y-6">
            <div>
                <label htmlFor="product-title" className="label">{copy.productTitle}</label>
                <input
                    id="product-title"
                    type="text"
                    value={productTitle}
                    onChange={(event) => setProductTitle(event.target.value)}
                    placeholder={copy.productTitlePlaceholder}
                    className="field"
                    autoComplete="off"
                />
            </div>

            <div>
                <div className="mb-3 flex items-baseline justify-between gap-3">
                    <h3 className="text-[13px] font-semibold text-ink">{copy.options}</h3>
                    <span className="text-xs text-ink-3">{copy.count({ count: options.length, max: MAX_OPTIONS })}</span>
                </div>

                {options.length === 0 && (
                    <p className="mb-3 rounded-xl border border-dashed border-line-strong bg-surface-2/50 px-4 py-5 text-center text-sm text-ink-3">
                        {copy.empty}
                    </p>
                )}

                <ul className="space-y-3">
                    {options.map((group) => (
                        <li key={group.id} className="animate-rise rounded-xl border border-line bg-canvas/60 p-3">
                            <div className="mb-2 flex items-center gap-2">
                                <input
                                    type="text"
                                    value={group.name}
                                    onChange={(event) => updateOptionGroup(group.id, event.target.value, group.values)}
                                    placeholder={copy.optionName}
                                    aria-label={copy.optionName}
                                    className="min-h-9 min-w-0 flex-1 rounded-lg border border-transparent bg-transparent px-2 text-sm font-semibold text-ink outline-none transition-colors hover:border-line focus:border-brand focus:bg-surface"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeOptionGroup(group.id)}
                                    aria-label={copy.removeOption({ name: group.name || copy.fallbackOption })}
                                    className="btn btn-ghost btn-icon btn-sm text-ink-3 hover:!bg-danger-soft hover:!text-danger"
                                >
                                    <Trash2 />
                                </button>
                            </div>
                            <OptionValuesInput
                                id={`values-${group.id}`}
                                optionName={group.name}
                                values={group.values}
                                autoFocus={group.id === lastAddedId}
                                onChange={(values) => updateOptionGroup(group.id, group.name, values)}
                            />
                        </li>
                    ))}
                </ul>

                {!atLimit && (
                    <>
                        <form onSubmit={handleAddGroup} className="mt-3 flex gap-2">
                            <input
                                type="text"
                                value={newGroupName}
                                onChange={(event) => setNewGroupName(event.target.value)}
                                placeholder={copy.newOptionPlaceholder}
                                aria-label={copy.newOptionLabel}
                                className="field"
                            />
                            <button type="submit" className="btn btn-secondary shrink-0" disabled={!newGroupName.trim()}>
                                <Plus /> {copy.add}
                            </button>
                        </form>
                        {availablePresets.length > 0 && (
                            <div className="mt-3 flex flex-wrap items-center gap-2">
                                <span className="text-xs text-ink-3">{copy.quickAdd}</span>
                                {availablePresets.map((preset) => (
                                    <button
                                        key={preset.name}
                                        type="button"
                                        onClick={() => addGroup(preset.name, preset.values)}
                                        className="chip border border-line bg-surface text-ink-2 transition-colors hover:border-brand/40 hover:text-brand-ink"
                                    >
                                        <Plus className="h-3 w-3" /> {preset.name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </>
                )}
                {atLimit && <p className="hint">{copy.limit}</p>}
            </div>
        </div>
    );
};
