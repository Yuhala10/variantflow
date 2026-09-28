import { OptionGroup } from '../../types';
import { generateCartesianMatrix, generateVariantId } from './generateVariants';

export type RowOverrides = Record<string, { sku?: string; price?: number }>;

const escapeRegExp = (value: string) => value.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');

interface RenameInput {
    /** Options with the renamed option still carrying its previous name. */
    options: OptionGroup[];
    overrides: RowOverrides;
    excluded: string[];
    skuPattern: string;
}

/**
 * Row edits, hidden rows and SKU tokens are all keyed by option name. When an option is renamed,
 * carry them over to the new name so nothing the merchant typed is silently lost.
 */
export function migrateOptionRename({ options, overrides, excluded, skuPattern }: RenameInput, fromName: string, toName: string) {
    const from = fromName.trim();
    const to = toName.trim();
    if (!from || !to || from === to) return { overrides, excluded, skuPattern };

    const idMap = new Map<string, string>();
    generateCartesianMatrix(options).forEach((combo) => {
        if (!(from in combo)) return;
        const renamed = { ...combo };
        renamed[to] = renamed[from];
        delete renamed[from];
        idMap.set(generateVariantId(combo), generateVariantId(renamed));
    });

    const nextOverrides: RowOverrides = {};
    Object.entries(overrides).forEach(([id, value]) => { nextOverrides[idMap.get(id) ?? id] = value; });

    const tokenRegex = new RegExp(`\\{\\s*${escapeRegExp(from)}\\s*\\}`, 'gi');
    return {
        overrides: nextOverrides,
        excluded: excluded.map((id) => idMap.get(id) ?? id),
        skuPattern: skuPattern.replace(tokenRegex, `{${to.toUpperCase()}}`),
    };
}
