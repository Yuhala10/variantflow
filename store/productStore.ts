import { create } from 'zustand';
import { AccountAccess, OptionGroup, InternalVariant, PriceModifierRule, SkuTemplateConfig } from '../types';
import { FREE_ACCESS } from '../lib/entitlements';
import { generateCartesianMatrix, generateVariantId } from '../domain/variant/generateVariants';
import { migrateOptionRename } from '../domain/variant/catalogOps';
import { computeSkuFromTemplate } from '../domain/sku/generateSku';
import { computeVariantPrice } from '../domain/pricing/calculatePrice';

// Plans used to be cached here and trusted on load; access now always comes from /api/account.
const LEGACY_SUBSCRIPTION_STORAGE_KEY = 'variantflow.subscription.v1';

if (typeof window !== 'undefined') {
    try { window.localStorage.removeItem(LEGACY_SUBSCRIPTION_STORAGE_KEY); } catch { /* storage unavailable */ }
}

const newId = () => (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2));

/** The last non-empty name of each option, so a rename survives the field being cleared mid-edit. */
const keyNamesFor = (options: OptionGroup[]) =>
    Object.fromEntries(options.filter((option) => option.name.trim()).map((option) => [option.id, option.name.trim()]));

interface ProductCatalogState {
    access: AccountAccess;
    productTitle: string;
    options: OptionGroup[];
    skuConfig: SkuTemplateConfig;
    basePrice: number;
    priceRules: PriceModifierRule[];
    variants: InternalVariant[];
    overrides: Record<string, { sku?: string; price?: number }>;
    /** Variant ids of combinations the merchant does not sell (removed rows). */
    excluded: string[];
    /** How many generated combinations are currently hidden by `excluded`. */
    hiddenCount: number;
    optionKeyNames: Record<string, string>;

    setProductTitle: (title: string) => void;
    setBasePrice: (price: number) => void;
    addOptionGroup: (name: string, values?: string[]) => void;
    updateOptionGroup: (id: string, name: string, values: string[]) => void;
    removeOptionGroup: (id: string) => void;
    setSkuTemplate: (pattern: string) => void;
    addPriceRule: (targetValue: string, modifier: number) => void;
    removePriceRule: (id: string) => void;
    updateRowOverride: (variantId: string, field: 'sku' | 'price', value: string | number) => void;
    clearRowOverride: (variantId: string, field: 'sku' | 'price') => void;
    excludeVariant: (variantId: string) => void;
    restoreAllVariants: () => void;
    recompileCatalogMatrix: () => void;
    setAccess: (access: AccountAccess) => void;
    getCatalogSnapshot: () => CatalogSnapshot;
    hydrateCatalog: (catalog: Partial<CatalogSnapshot>) => void;
    /** Replaces the whole catalog (switching projects, imports); missing fields reset to empty. */
    replaceCatalog: (catalog: Partial<CatalogSnapshot>) => void;
}

export interface CatalogSnapshot {
    productTitle: string;
    options: OptionGroup[];
    skuConfig: SkuTemplateConfig;
    basePrice: number;
    priceRules: PriceModifierRule[];
    overrides: Record<string, { sku?: string; price?: number }>;
    /** Optional so catalogs saved before rows could be removed still load. */
    excluded?: string[];
}

export const useProductStore = create<ProductCatalogState>((set, get) => ({
    access: FREE_ACCESS,
    productTitle: '',
    options: [],
    skuConfig: { pattern: '' },
    basePrice: 0,
    priceRules: [],
    variants: [],
    overrides: {},
    excluded: [],
    hiddenCount: 0,
    optionKeyNames: {},

    setProductTitle: (title) => set({ productTitle: title }),
    setBasePrice: (price) => { set({ basePrice: Number.isFinite(price) ? price : 0 }); get().recompileCatalogMatrix(); },

    addOptionGroup: (name, values = []) => {
        const id = newId();
        set((state) => ({
            options: [...state.options, { id, name, values }],
            optionKeyNames: name.trim() ? { ...state.optionKeyNames, [id]: name.trim() } : state.optionKeyNames,
        }));
        get().recompileCatalogMatrix();
    },

    updateOptionGroup: (id, name, values) => {
        set((state) => {
            const options = state.options.map((opt) => (opt.id === id ? { ...opt, name, values } : opt));
            const previousName = state.optionKeyNames[id];
            const nextName = name.trim();
            const clashes = options.some((opt) => opt.id !== id && opt.name.trim().toLowerCase() === nextName.toLowerCase());
            if (!nextName || clashes || !previousName || previousName === nextName) {
                return { options, optionKeyNames: nextName && !clashes ? { ...state.optionKeyNames, [id]: nextName } : state.optionKeyNames };
            }
            const migrated = migrateOptionRename(
                {
                    options: options.map((opt) => (opt.id === id ? { ...opt, name: previousName } : opt)),
                    overrides: state.overrides,
                    excluded: state.excluded,
                    skuPattern: state.skuConfig.pattern,
                },
                previousName,
                nextName,
            );
            return {
                options,
                overrides: migrated.overrides,
                excluded: migrated.excluded,
                skuConfig: { pattern: migrated.skuPattern },
                optionKeyNames: { ...state.optionKeyNames, [id]: nextName },
            };
        });
        get().recompileCatalogMatrix();
    },

    removeOptionGroup: (id) => {
        set((state) => {
            const optionKeyNames = { ...state.optionKeyNames };
            delete optionKeyNames[id];
            return { options: state.options.filter((opt) => opt.id !== id), optionKeyNames };
        });
        get().recompileCatalogMatrix();
    },

    setSkuTemplate: (pattern) => { set({ skuConfig: { pattern } }); get().recompileCatalogMatrix(); },

    addPriceRule: (targetValue, modifier) => {
        set((state) => ({ priceRules: [...state.priceRules, { id: newId(), targetValue, modifier }] }));
        get().recompileCatalogMatrix();
    },

    removePriceRule: (id) => {
        set((state) => ({ priceRules: state.priceRules.filter((r) => r.id !== id) }));
        get().recompileCatalogMatrix();
    },

    updateRowOverride: (variantId, field, value) => {
        // SKUs are shown in capitals, so store them that way: the export must match what the merchant sees.
        const next = field === 'sku' ? String(value).toUpperCase() : Number.isFinite(Number(value)) ? Number(value) : 0;
        set((state) => ({
            overrides: {
                ...state.overrides,
                [variantId]: { ...state.overrides[variantId], [field]: next }
            }
        }));
        get().recompileCatalogMatrix();
    },

    clearRowOverride: (variantId, field) => {
        set((state) => {
            const rest = { ...state.overrides[variantId] };
            delete rest[field];
            const overrides = { ...state.overrides };
            if (Object.keys(rest).length) overrides[variantId] = rest;
            else delete overrides[variantId];
            return { overrides };
        });
        get().recompileCatalogMatrix();
    },

    excludeVariant: (variantId) => {
        set((state) => (state.excluded.includes(variantId) ? {} : { excluded: [...state.excluded, variantId] }));
        get().recompileCatalogMatrix();
    },

    restoreAllVariants: () => {
        set({ excluded: [] });
        get().recompileCatalogMatrix();
    },

    setAccess: (access) => set({ access }),

    getCatalogSnapshot: () => {
        const { productTitle, options, skuConfig, basePrice, priceRules, overrides, excluded } = get();
        return { productTitle, options, skuConfig, basePrice, priceRules, overrides, excluded };
    },

    hydrateCatalog: (catalog) => {
        set((state) => {
            const options = catalog.options ?? state.options;
            return {
                productTitle: catalog.productTitle ?? state.productTitle,
                options,
                skuConfig: catalog.skuConfig ?? state.skuConfig,
                basePrice: catalog.basePrice ?? state.basePrice,
                priceRules: catalog.priceRules ?? state.priceRules,
                overrides: catalog.overrides ?? state.overrides,
                excluded: catalog.excluded ?? state.excluded,
                optionKeyNames: keyNamesFor(options),
            };
        });
        get().recompileCatalogMatrix();
    },

    replaceCatalog: (catalog) => {
        const options = catalog.options ?? [];
        set({
            productTitle: catalog.productTitle ?? '',
            options,
            skuConfig: catalog.skuConfig ?? { pattern: '' },
            basePrice: catalog.basePrice ?? 0,
            priceRules: catalog.priceRules ?? [],
            overrides: catalog.overrides ?? {},
            excluded: catalog.excluded ?? [],
            optionKeyNames: keyNamesFor(options),
        });
        get().recompileCatalogMatrix();
    },

    recompileCatalogMatrix: () => {
        const { options, skuConfig, basePrice, priceRules, overrides, excluded } = get();
        const hidden = new Set(excluded);
        let hiddenCount = 0;
        const compiledVariants: InternalVariant[] = [];

        generateCartesianMatrix(options).forEach((combo) => {
            const variantId = generateVariantId(combo);
            if (hidden.has(variantId)) {
                hiddenCount += 1;
                return;
            }
            const rowOverride = overrides[variantId];

            let finalSku = computeSkuFromTemplate(skuConfig.pattern, combo);
            let finalPrice = computeVariantPrice(basePrice, priceRules, combo);

            let isSkuOverridden = false;
            let isPriceOverridden = false;

            if (rowOverride) {
                if (rowOverride.sku !== undefined) { finalSku = rowOverride.sku; isSkuOverridden = true; }
                if (rowOverride.price !== undefined) { finalPrice = rowOverride.price; isPriceOverridden = true; }
            }

            compiledVariants.push({ id: variantId, attributes: combo, sku: finalSku, price: finalPrice, isSkuOverridden, isPriceOverridden });
        });

        set({ variants: compiledVariants, hiddenCount });
    }
}));
