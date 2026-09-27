import { create } from 'zustand';
import { AccountAccess, OptionGroup, InternalVariant, PriceModifierRule, SkuTemplateConfig } from '../types';
import { FREE_ACCESS } from '../lib/entitlements';
import { generateCartesianMatrix, generateVariantId } from '../domain/variant/generateVariants';
import { computeSkuFromTemplate } from '../domain/sku/generateSku';
import { computeVariantPrice } from '../domain/pricing/calculatePrice';

// Plans used to be cached here and trusted on load; access now always comes from /api/account.
const LEGACY_SUBSCRIPTION_STORAGE_KEY = 'variantflow.subscription.v1';

if (typeof window !== 'undefined') {
    try { window.localStorage.removeItem(LEGACY_SUBSCRIPTION_STORAGE_KEY); } catch { /* storage unavailable */ }
}

interface ProductCatalogState {
    access: AccountAccess;
    productTitle: string;
    options: OptionGroup[];
    skuConfig: SkuTemplateConfig;
    basePrice: number;
    priceRules: PriceModifierRule[];
    variants: InternalVariant[];
    overrides: Record<string, { sku?: string; price?: number }>;

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

    setProductTitle: (title) => set({ productTitle: title }),
    setBasePrice: (price) => { set({ basePrice: price }); get().recompileCatalogMatrix(); },

    addOptionGroup: (name, values = []) => {
        set((state) => ({
            options: [...state.options, { id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(), name, values }]
        }));
        get().recompileCatalogMatrix();
    },

    updateOptionGroup: (id, name, values) => {
        set((state) => ({
            options: state.options.map((opt) => (opt.id === id ? { ...opt, name, values } : opt))
        }));
        get().recompileCatalogMatrix();
    },

    removeOptionGroup: (id) => {
        set((state) => ({ options: state.options.filter((opt) => opt.id !== id) }));
        get().recompileCatalogMatrix();
    },

    setSkuTemplate: (pattern) => { set({ skuConfig: { pattern } }); get().recompileCatalogMatrix(); },

    addPriceRule: (targetValue, modifier) => {
        set((state) => ({ priceRules: [...state.priceRules, { id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(), targetValue, modifier }] }));
        get().recompileCatalogMatrix();
    },

    removePriceRule: (id) => {
        set((state) => ({ priceRules: state.priceRules.filter((r) => r.id !== id) }));
        get().recompileCatalogMatrix();
    },

    updateRowOverride: (variantId, field, value) => {
        set((state) => ({
            overrides: {
                ...state.overrides,
                [variantId]: { ...state.overrides[variantId], [field]: value }
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

    setAccess: (access) => set({ access }),

    getCatalogSnapshot: () => {
        const { productTitle, options, skuConfig, basePrice, priceRules, overrides } = get();
        return { productTitle, options, skuConfig, basePrice, priceRules, overrides };
    },

    hydrateCatalog: (catalog) => {
        set((state) => ({
            productTitle: catalog.productTitle ?? state.productTitle,
            options: catalog.options ?? state.options,
            skuConfig: catalog.skuConfig ?? state.skuConfig,
            basePrice: catalog.basePrice ?? state.basePrice,
            priceRules: catalog.priceRules ?? state.priceRules,
            overrides: catalog.overrides ?? state.overrides,
        }));
        get().recompileCatalogMatrix();
    },

    replaceCatalog: (catalog) => {
        set({
            productTitle: catalog.productTitle ?? '',
            options: catalog.options ?? [],
            skuConfig: catalog.skuConfig ?? { pattern: '' },
            basePrice: catalog.basePrice ?? 0,
            priceRules: catalog.priceRules ?? [],
            overrides: catalog.overrides ?? {},
        });
        get().recompileCatalogMatrix();
    },

    recompileCatalogMatrix: () => {
        const { options, skuConfig, basePrice, priceRules, overrides } = get();
        const combinations = generateCartesianMatrix(options);

        const compiledVariants: InternalVariant[] = combinations.map((combo) => {
            const variantId = generateVariantId(combo);
            const rowOverride = overrides[variantId];

            let finalSku = computeSkuFromTemplate(skuConfig.pattern, combo);
            let finalPrice = computeVariantPrice(basePrice, priceRules, combo);

            let isSkuOverridden = false;
            let isPriceOverridden = false;

            if (rowOverride) {
                if (rowOverride.sku !== undefined) { finalSku = rowOverride.sku; isSkuOverridden = true; }
                if (rowOverride.price !== undefined) { finalPrice = rowOverride.price; isPriceOverridden = true; }
            }

            return { id: variantId, attributes: combo, sku: finalSku, price: finalPrice, isSkuOverridden, isPriceOverridden };
        });

        set({ variants: compiledVariants });
    }
}));
