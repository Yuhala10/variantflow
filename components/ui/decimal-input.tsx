'use client';

import { useState, type InputHTMLAttributes } from 'react';
import { isPartialDecimal, parseDecimal } from '../../lib/number';

interface DecimalInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type'> {
    value: number;
    onValueChange: (value: number) => void;
    /** Show an empty field instead of "0" (for optional amounts such as a base price). */
    blankZero?: boolean;
}

const display = (value: number, blankZero?: boolean) => (blankZero && value === 0 ? '' : String(value));

/**
 * A money field that keeps the text being typed ("0", "0.", "19,9") instead of snapping to a number
 * after every keystroke, which made values like 0.50 impossible to enter.
 */
export function DecimalInput({ value, onValueChange, blankZero, onBlur, ...rest }: DecimalInputProps) {
    const [draft, setDraft] = useState(() => display(value, blankZero));
    const [shown, setShown] = useState(value);
    // The value changed elsewhere (reset, rule, project switch): show it unless the draft already means it.
    if (value !== shown) {
        setShown(value);
        if ((parseDecimal(draft) ?? 0) !== value) setDraft(display(value, blankZero));
    }

    return (
        <input
            {...rest}
            type="text"
            inputMode="decimal"
            autoComplete="off"
            value={draft}
            onChange={(event) => {
                const text = event.target.value;
                if (!isPartialDecimal(text)) return;
                setDraft(text);
                const parsed = parseDecimal(text) ?? 0;
                setShown(parsed);
                if (parsed !== value) onValueChange(parsed);
            }}
            onBlur={(event) => {
                setDraft(display(value, blankZero));
                onBlur?.(event);
            }}
        />
    );
}
