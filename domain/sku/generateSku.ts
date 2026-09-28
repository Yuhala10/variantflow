import { AttributeMap } from '../../types';

const escapeRegExp = (value: string) => value.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');

// Letters that do not decompose into an ASCII base letter plus an accent.
const SPECIAL_LETTERS: Record<string, string> = { ß: 'SS', Æ: 'AE', æ: 'AE', Œ: 'OE', œ: 'OE', Ø: 'O', ø: 'O', Ł: 'L', ł: 'L', Đ: 'D', đ: 'D', Þ: 'TH', þ: 'TH' };

/**
 * Builds a SKU from a pattern such as "TS-{SIZE}-{COLOR}".
 * Accents are transliterated ("Écarlate" → "ECARLATE") and any other character becomes a
 * separator ("10.5" → "10-5"), so distinct values never collapse into the same SKU.
 */
export function computeSkuFromTemplate(pattern: string, attributes: AttributeMap): string {
    let sku = pattern;

    Object.entries(attributes).forEach(([optionName, optionValue]) => {
        const tokenRegex = new RegExp(`\\{\\s*${escapeRegExp(optionName.trim())}\\s*\\}`, 'gi');
        sku = sku.replace(tokenRegex, () => optionValue.trim());
    });

    return sku
        .replace(/\{[^}]*\}/g, '')
        .replace(/[ßÆæŒœØøŁłĐđÞþ]/g, (letter) => SPECIAL_LETTERS[letter] ?? letter)
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .toUpperCase()
        .replace(/[^A-Z0-9_-]+/g, '-')
        .replace(/-{2,}/g, '-')
        .replace(/^[-_]+|[-_]+$/g, '');
}
