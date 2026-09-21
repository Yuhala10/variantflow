import { create } from 'zustand';
import { OptionGroup, InternalVariant, PriceModifierRule, SkuTemplateConfig, SubscriptionTier } from '../types';
import { generateCartesianMatrix, generateVariantId } from '../domain/variant/generateVariants';
import { computeSkuFromTemplate } from '../domain/sku/generateSku';
import { computeVariantPrice } from '../domain/pricing/calculatePrice';

const SUBSCRIPTION_STORAGE_KEY = 'variantflow.subscription.v1';

const readStoredSubscription = () => {
    if (typeof window === 'undefined') return null;

    try {
        const raw = window.localStorage.getItem(SUBSCRIPTION_STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
};

const persistSubscription = (subscriptionTier: SubscriptionTier, rowRunsUsed: number, rowRunsMax: number) => {
    if (typeof window === 'undefined') return;

    const payload = { subscriptionTier, rowRunsUsed, rowRunsMax };
    window.localStorage.setItem(SUBSCRIPTION_STORAGE_KEY, JSON.stringify(payload));
};

interface ProductCatalogState {
    subscriptionTier: SubscriptionTier;
    rowRunsUsed: number;
    rowRunsMax: number;
    productTitle: string;
    options: OptionGroup[];
    skuConfig: SkuTemplateConfig;
    basePrice: number;
    priceRules: PriceModifierRule[];
    variants: InternalVariant[];
    overrides: Record<string, { sku?: string; price?: number }>;

    setProductTitle: (title: string) => void;
    setBasePrice: (price: number) => void;
    addOptionGroup: (name: string) => void;
    updateOptionGroup: (id: string, name: string, values: string[]) => void;
    removeOptionGroup: (id: string) => void;
    setSkuTemplate: (pattern: string) => void;
    addPriceRule: (targetValue: string, modifier: number) => void;
    removePriceRule: (id: string) => void;
    updateRowOverride: (variantId: string, field: 'sku' | 'price', value: string | number) => void;
    recompileCatalogMatrix: () => void;
    setSubscriptionState: (tier: SubscriptionTier, used: number, max: number) => void;
    getCatalogSnapshot: () => CatalogSnapshot;
    hydrateCatalog: (catalog: Partial<CatalogSnapshot>) => void;
}

export interface CatalogSnapshot {
    productTitle: string;
    options: OptionGroup[];
    skuConfig: SkuTemplateConfig;
    basePrice: number;
    priceRules: PriceModifierRule[];
    overrides: Record<string, { sku?: string; price?: number }>;
}

const storedSubscription = readStoredSubscription();

export const useProductStore = create<ProductCatalogState>((set, get) => ({
    subscriptionTier: storedSubscription?.subscriptionTier ?? 'FREE',
    rowRunsUsed: storedSubscription?.rowRunsUsed ?? 0,
    rowRunsMax: storedSubscription?.rowRunsMax ?? 50,
    productTitle: '',
    options: [],
    skuConfig: { pattern: '' },
    basePrice: 0,
    priceRules: [],
    variants: [],
    overrides: {},

    setProductTitle: (title) => set({ productTitle: title }),
    setBasePrice: (price) => { set({ basePrice: price }); get().recompileCatalogMatrix(); },

    addOptionGroup: (name) => {
        set((state) => ({
            options: [...state.options, { id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(), name, values: ['New Value'] }]
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

    setSubscriptionState: (tier, used, max) => {
        set({ subscriptionTier: tier, rowRunsUsed: used, rowRunsMax: max });
        persistSubscription(tier, used, max);
    },

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
