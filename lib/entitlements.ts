import { AccessRole, AccountAccess, EntitlementSet, SubscriptionTier } from '../types';

// Single source of truth for what each plan unlocks. Server routes enforce these;
// the browser only uses them to decide what to show.
const TIER_ENTITLEMENTS: Record<SubscriptionTier, EntitlementSet> = {
    FREE: {
        canExportCsv: true,
        canUseAdvancedValidation: false,
        canUseSkuRules: true,
        canUsePricingRules: true,
        canSaveTemplates: false,
        canImportCsv: false,
        canNormalizeSuppliers: false,
        canUseAiMapping: false,
        canTransformCatalog: false,
        canUseMultiPlatformExport: false,
        maxProjects: 1,
        maxVariantsPerProject: 50,
        // Free is limited per export (50 variants), not per month.
        monthlyRowRuns: null,
    },
    PRO: {
        canExportCsv: true,
        canUseAdvancedValidation: true,
        canUseSkuRules: true,
        canUsePricingRules: true,
        canSaveTemplates: true,
        canImportCsv: true,
        // Pro gets supplier data cleanup (canTransformCatalog); full normalization is Scale-only.
        canNormalizeSuppliers: false,
        canUseAiMapping: false,
        canTransformCatalog: true,
        canUseMultiPlatformExport: false,
        maxProjects: null,
        maxVariantsPerProject: null,
        monthlyRowRuns: 2000,
    },
    SCALE: {
        canExportCsv: true,
        canUseAdvancedValidation: true,
        canUseSkuRules: true,
        canUsePricingRules: true,
        canSaveTemplates: true,
        canImportCsv: true,
        canNormalizeSuppliers: true,
        canUseAiMapping: true,
        canTransformCatalog: true,
        canUseMultiPlatformExport: true,
        maxProjects: null,
        maxVariantsPerProject: null,
        monthlyRowRuns: 15000,
    },
};

const UNRESTRICTED: EntitlementSet = {
    canExportCsv: true,
    canUseAdvancedValidation: true,
    canUseSkuRules: true,
    canUsePricingRules: true,
    canSaveTemplates: true,
    canImportCsv: true,
    canNormalizeSuppliers: true,
    canUseAiMapping: true,
    canTransformCatalog: true,
    canUseMultiPlatformExport: true,
    maxProjects: null,
    maxVariantsPerProject: null,
    monthlyRowRuns: null,
};

export const isSubscriptionTier = (value: unknown): value is SubscriptionTier =>
    value === 'FREE' || value === 'PRO' || value === 'SCALE';

export const isAccessRole = (value: unknown): value is AccessRole => value === 'owner' || value === 'admin';

interface SubscriptionRow {
    tier?: unknown;
    status?: unknown;
    current_period_end?: string | null;
}

export function resolveAccountAccess(subscription: SubscriptionRow | null, role: unknown, now = new Date()): AccountAccess {
    const accessRole = isAccessRole(role) ? role : null;
    const storedTier = isSubscriptionTier(subscription?.tier) ? subscription.tier : 'FREE';
    const periodEnd = subscription?.current_period_end ?? null;
    // Subscriptions created before period tracking have no end date and stay active.
    const notExpired = !periodEnd || new Date(periodEnd).getTime() > now.getTime();
    const subscriptionActive = (subscription?.status ?? 'active') === 'active' && notExpired;
    const tier = subscriptionActive ? storedTier : 'FREE';

    return {
        tier,
        role: accessRole,
        subscriptionActive,
        currentPeriodEnd: periodEnd,
        entitlements: accessRole ? UNRESTRICTED : TIER_ENTITLEMENTS[tier],
    };
}

export const FREE_ACCESS: AccountAccess = resolveAccountAccess(null, null);

export const isWithinLimit = (limit: number | null, value: number) => limit === null || value <= limit;
