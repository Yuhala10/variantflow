import { z } from 'zod';

export type SubscriptionTier = 'FREE' | 'PRO' | 'SCALE';

export interface PlanFeature {
    text: string;
    included: boolean;
}

export interface PricingPlan {
    id: SubscriptionTier;
    name: string;
    priceUsdt: number;
    rowRunLimit: number;
    description: string;
    features: PlanFeature[];
}

export interface EntitlementSet {
    canExportCsv: boolean;
    canUseAdvancedValidation: boolean;
    canUseSkuRules: boolean;
    canUsePricingRules: boolean;
    canSaveTemplates: boolean;
    canImportCsv: boolean;
    canNormalizeSuppliers: boolean;
    canUseAiMapping: boolean;
    canTransformCatalog: boolean;
    canUseMultiPlatformExport: boolean;
    /** null means unlimited. */
    maxProjects: number | null;
    maxVariantsPerProject: number | null;
    monthlyRowRuns: number | null;
}

export type AccessRole = 'owner' | 'admin';

/** Resolved on the server and sent to the browser; the browser only displays it. */
export interface AccountAccess {
    tier: SubscriptionTier;
    role: AccessRole | null;
    subscriptionActive: boolean;
    currentPeriodEnd: string | null;
    entitlements: EntitlementSet;
}

export interface OptionGroup {
    id: string;
    name: string;
    values: string[];
}

export interface AttributeMap {
    [optionName: string]: string;
}

export interface InternalVariant {
    id: string;
    attributes: AttributeMap;
    sku: string;
    price: number;
    isSkuOverridden: boolean;
    isPriceOverridden: boolean;
}

export interface PriceModifierRule {
    id: string;
    targetValue: string;
    modifier: number;
}

export interface SkuTemplateConfig {
    pattern: string;
}

export type ValidationErrorSeverity = 'error' | 'warning';

export interface ValidationError {
    id: string;
    rowId?: string;
    field: 'title' | 'option-name' | 'option-value' | 'sku' | 'price' | 'structure';
    severity: ValidationErrorSeverity;
    message: string;
}

export const BILLING_PLANS: Record<SubscriptionTier, PricingPlan> = {
    FREE: {
        id: 'FREE',
        name: 'Free',
        priceUsdt: 0,
        rowRunLimit: 50,
        description: 'Everything you need to build and export your first catalogs.',
        features: [
            { text: '1 saved catalog project', included: true },
            { text: 'Up to 50 variants per export', included: true },
            { text: 'SKU templates and pricing rules', included: true },
            { text: 'Real-time catalog validation', included: true },
            { text: 'Shopify CSV export', included: true },
            { text: 'CSV import and cleanup tools', included: false },
        ],
    },
    PRO: {
        id: 'PRO',
        name: 'Pro',
        priceUsdt: 19,
        rowRunLimit: 2000,
        description: 'For growing brands managing larger and more frequent catalogs.',
        features: [
            { text: 'Everything in Free', included: true },
            { text: 'Unlimited projects and variants', included: true },
            { text: 'CSV import with automatic column mapping', included: true },
            { text: 'Supplier data cleanup', included: true },
            { text: 'Advanced validation', included: true },
            { text: '2,000 row-runs per month', included: true },
        ],
    },
    SCALE: {
        id: 'SCALE',
        name: 'Scale',
        priceUsdt: 49,
        rowRunLimit: 15000,
        description: 'For high-volume dropshippers and multi-store operations.',
        features: [
            { text: 'Everything in Pro', included: true },
            { text: '15,000 row-runs per month', included: true },
            { text: 'Supplier catalog normalization', included: true },
            { text: 'Smart assisted column mapping', included: true },
            { text: 'Multi-platform exporters', included: true },
        ],
    },
};
