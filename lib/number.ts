/** Accepts what people actually type for money: "19.90", "19,90", " 5 ", "-2". Returns null when it is not a number. */
export function parseDecimal(text: string): number | null {
    const value = text.trim().replace(/\s+/g, '').replace(',', '.');
    if (!/^-?(\d+\.?\d*|\.\d+)$/.test(value)) return null;
    const number = Number(value);
    return Number.isFinite(number) ? Math.round(number * 100) / 100 : null;
}

/** True while a value is still being typed ("", "-", "12.", "0,"), so the input can keep showing it. */
export const isPartialDecimal = (text: string) => /^-?\d*[.,]?\d*$/.test(text.trim().replace(/\s+/g, ''));
