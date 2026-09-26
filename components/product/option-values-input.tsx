'use client';

import { KeyboardEvent, useState } from 'react';
import { X } from 'lucide-react';

interface OptionValuesInputProps {
    id: string;
    values: string[];
    onChange: (values: string[]) => void;
    autoFocus?: boolean;
    optionName: string;
}

/** Type a value and press Enter or comma to add it. Pasting a comma- or line-separated list adds them all. */
export function OptionValuesInput({ id, values, onChange, autoFocus, optionName }: OptionValuesInputProps) {
    const [draft, setDraft] = useState('');

    const commit = (raw: string) => {
        const parts = raw.split(/[,\n]/).map((part) => part.trim()).filter(Boolean);
        if (!parts.length) {
            setDraft('');
            return;
        }
        const next = [...values];
        parts.forEach((part) => {
            if (!next.some((value) => value.toLowerCase() === part.toLowerCase())) next.push(part);
        });
        onChange(next);
        setDraft('');
    };

    const remove = (index: number) => onChange(values.filter((_, i) => i !== index));

    const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter' || event.key === ',') {
            event.preventDefault();
            commit(draft);
        } else if (event.key === 'Backspace' && !draft && values.length) {
            remove(values.length - 1);
        }
    };

    return (
        <div className="field flex min-h-11 flex-wrap items-center gap-1.5 p-1.5 focus-within:border-brand focus-within:shadow-[0_0_0_4px_color-mix(in_oklab,var(--brand)_16%,transparent)]">
            {values.map((value, index) => (
                <span key={`${value}-${index}`} className="animate-fade inline-flex items-center gap-1 rounded-lg bg-surface-2 py-1 pl-2.5 pr-1 text-[13px] font-medium text-ink">
                    {value}
                    <button
                        type="button"
                        onClick={() => remove(index)}
                        aria-label={`Remove ${value} from ${optionName || 'option'}`}
                        className="inline-flex h-6 w-6 items-center justify-center rounded-md text-ink-3 transition-colors hover:bg-surface-3 hover:text-ink"
                    >
                        <X className="h-3.5 w-3.5" />
                    </button>
                </span>
            ))}
            <input
                id={id}
                value={draft}
                autoFocus={autoFocus}
                enterKeyHint="enter"
                onChange={(event) => {
                    const value = event.target.value;
                    if (value.includes(',')) commit(value);
                    else setDraft(value);
                }}
                onKeyDown={onKeyDown}
                onBlur={() => commit(draft)}
                onPaste={(event) => {
                    const text = event.clipboardData.getData('text');
                    if (/[,\n]/.test(text)) {
                        event.preventDefault();
                        commit(`${draft},${text}`);
                    }
                }}
                placeholder={values.length ? 'Add value…' : 'Type a value, press Enter'}
                aria-label={`Values for ${optionName || 'option'}`}
                className="min-w-[8rem] flex-1 bg-transparent px-1.5 py-1 text-sm text-ink outline-none placeholder:text-ink-3"
            />
        </div>
    );
}
