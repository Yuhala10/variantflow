import { describe, expect, it } from 'vitest';
import { generateCartesianMatrix, generateVariantId } from '../domain/variant/generateVariants';
import { migrateOptionRename } from '../domain/variant/catalogOps';

const size = { id: 'a', name: 'Size', values: ['S', 'M'] };
const color = { id: 'b', name: 'Color', values: ['Red', 'Blue'] };

describe('generateCartesianMatrix', () => {
    it('builds every combination', () => {
        expect(generateCartesianMatrix([size, color])).toHaveLength(4);
    });

    it('ignores unnamed options, blank values and duplicates', () => {
        const rows = generateCartesianMatrix([{ id: 'x', name: '  ', values: ['A'] }, { id: 'y', name: ' Size ', values: ['S', ' S ', ''] }]);
        expect(rows).toEqual([{ Size: 'S' }]);
    });

    it('produces ids independent of option order', () => {
        expect(generateVariantId({ Size: 'S', Color: 'Red' })).toBe(generateVariantId({ Color: 'Red', Size: 'S' }));
    });
});

describe('migrateOptionRename', () => {
    const redS = generateVariantId({ Size: 'S', Color: 'Red' });
    const input = { options: [size, color], overrides: { [redS]: { sku: 'X1', price: 9 } }, excluded: [redS], skuPattern: 'TS-{size}-{COLOR}' };

    it('moves row edits, hidden rows and SKU tokens to the new name', () => {
        const result = migrateOptionRename(input, 'Size', 'Taille');
        const renamed = generateVariantId({ Taille: 'S', Color: 'Red' });
        expect(result.overrides).toEqual({ [renamed]: { sku: 'X1', price: 9 } });
        expect(result.excluded).toEqual([renamed]);
        expect(result.skuPattern).toBe('TS-{TAILLE}-{COLOR}');
    });

    it('does nothing for blank or unchanged names', () => {
        expect(migrateOptionRename(input, 'Size', '  ').overrides).toBe(input.overrides);
        expect(migrateOptionRename(input, 'Size', 'Size').overrides).toBe(input.overrides);
    });
});
