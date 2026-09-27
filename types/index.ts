import { z } from 'zod';

export type SubscriptionTier = 'FREE' | 'PRO' | 'SCALE';

/** Structural plan data. Names, descriptions and feature lists are translated in lib/i18n/dictionaries. */
export interface PricingPlan {
    id: SubscriptionTier;
    priceUsdt: number;
    /** Monthly row-run allowance; null means no monthly cap. */
    rowRunLimit: number | null;
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

export interface AccountUsage {
    /** Row-runs consumed this calendar month (UTC). */
    rowRunsUsed: number;
    monthStart: string;
}

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
    /** Stable identifier used to show the message in the user's language. */
    code: ValidationCode;
    params?: Record<string, string | number>;
    /** English fallback, used in logs and API responses. */
    message: string;
}

export type ValidationCode =
    | 'title-missing'
    | 'option-name-empty'
    | 'option-name-duplicate'
    | 'option-values-empty'
    | 'option-value-duplicate'
    | 'variant-duplicate'
    | 'variant-missing-values'
    | 'variant-unexpected-options'
    | 'sku-missing'
    | 'sku-invalid'
    | 'sku-duplicate'
    | 'price-invalid'
    | 'price-negative'
    // Advanced checks (Pro and Scale)
    | 'title-too-long'
    | 'value-whitespace'
    | 'value-casing'
    | 'sku-too-long'
    | 'price-zero'
    | 'price-outlier'
    | 'shopify-variant-limit';

export const BILLING_PLANS: Record<SubscriptionTier, PricingPlan> = {
    FREE: { id: 'FREE', priceUsdt: 0, rowRunLimit: null },
    PRO: { id: 'PRO', priceUsdt: 19, rowRunLimit: 2000 },
    SCALE: { id: 'SCALE', priceUsdt: 49, rowRunLimit: 15000 },
};
