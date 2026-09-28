import { beforeEach, describe, expect, it } from 'vitest';
import { useProductStore } from '../store/productStore';
import { generateVariantId } from '../domain/variant/generateVariants';

const store = () => useProductStore.getState();

describe('product store', () => {
    beforeEach(() => {
        store().replaceCatalog({
            productTitle: 'Tee',
            options: [{ id: 'size', name: 'Size', values: ['S', 'M'] }, { id: 'color', name: 'Color', values: ['Red', 'Blue'] }],
            skuConfig: { pattern: 'TEE-{SIZE}-{COLOR}' },
            basePrice: 20,
        });
    });

    it('compiles variants with SKUs and prices', () => {
        expect(store().variants).toHaveLength(4);
        expect(store().variants[0]).toMatchObject({ sku: 'TEE-S-RED', price: 20 });
    });

    it('keeps row edits when an option is renamed, even after clearing the name mid-edit', () => {
        const id = generateVariantId({ Size: 'S', Color: 'Red' });
        store().updateRowOverride(id, 'price', 25);
        store().updateOptionGroup('size', '', ['S', 'M']);
        store().updateOptionGroup('size', 'T', ['S', 'M']);
        store().updateOptionGroup('size', 'Taille', ['S', 'M']);
        const row = store().variants.find((variant) => variant.attributes.Taille === 'S' && variant.attributes.Color === 'Red');
        expect(row).toMatchObject({ price: 25, isPriceOverridden: true, sku: 'TEE-S-RED' });
        expect(store().skuConfig.pattern).toBe('TEE-{TAILLE}-{COLOR}');
    });

    it('does not migrate onto a name used by another option', () => {
        store().updateOptionGroup('size', 'Color', ['S', 'M']);
        expect(store().skuConfig.pattern).toBe('TEE-{SIZE}-{COLOR}');
    });

    it('stores SKU edits in capitals, as displayed', () => {
        const id = store().variants[0].id;
        store().updateRowOverride(id, 'sku', 'abc-1');
        expect(store().variants[0].sku).toBe('ABC-1');
    });

    it('removes and restores combinations, and saves them with the catalog', () => {
        const id = store().variants[1].id;
        store().excludeVariant(id);
        expect(store().variants).toHaveLength(3);
        expect(store().hiddenCount).toBe(1);
        expect(store().getCatalogSnapshot().excluded).toEqual([id]);
        store().restoreAllVariants();
        expect(store().variants).toHaveLength(4);
        expect(store().hiddenCount).toBe(0);
    });

    it('loads catalogs saved before rows could be removed', () => {
        store().replaceCatalog({ productTitle: 'Old', options: [{ id: 'o', name: 'Size', values: ['S'] }] });
        expect(store().excluded).toEqual([]);
        expect(store().variants).toHaveLength(1);
    });
});
