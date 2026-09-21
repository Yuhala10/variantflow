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
    maxProjects: number;
    maxVariantsPerProject: number;
    monthlyRowRuns: number;
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

export interface MerchantBillingState {
    currentTier: SubscriptionTier;
    rowRunsUsed: number;
    rowRunsMax: number;
    activeInvoice: any;
}

export const BILLING_PLANS: Record<SubscriptionTier, PricingPlan> = {
    FREE: {
        id: 'FREE',
        name: 'Free Starter',
        priceUsdt: 0,
        rowRunLimit: 50,
        description: 'Perfect for exploring the variant compilation loop.',
        features: [
            { text: '1 Active Catalog Project', included: true },
            { text: 'Generate Variant Matrices (Up to 50)', included: true },
            { text: 'Core SKU & Pricing Rules Engine', included: true },
            { text: 'Basic Real-time Data Validation', included: true },
            { text: 'Shopify CSV File Exporting (up to 50 variants)', included: true },
            { text: 'Advanced Catalog Cleanup Pipelines', included: false }
        ]
    },
    PRO: {
        id: 'PRO',
        name: 'Professional Merchant',
        priceUsdt: 19,
        rowRunLimit: 2000,
        description: 'For growing brands expanding their active storefront catalogs.',
        features: [
            { text: 'Unlimited Active Matrix Projects', included: true },
            { text: 'Unlimited Variant Generation rows', included: true },
            { text: 'Full Shopify CSV Export Access', included: true },
            { text: 'Advanced Structural Validation Logs', included: true },
            { text: '2,000 Verified Row-Runs per Month', included: true },
            { text: 'CSV Import, Auto-Mapping & Column Cleanup', included: true }
        ]
    },
    SCALE: {
        id: 'SCALE',
        name: 'Scale Pipeline Operator',
        priceUsdt: 49,
        rowRunLimit: 15000,
        description: 'Built for high-volume dropshippers and multi-store operations.',
        features: [
            { text: 'Everything included in the PRO package', included: true },
            { text: '15,000 Verified Row-Runs per Month', included: true },
            { text: 'Supplier Catalog Normalization Engine', included: true },
            { text: 'Smart assisted column schema mapping', included: true },
            { text: 'Multi-Platform Engine Exporters', included: true }
        ]
    }
};
