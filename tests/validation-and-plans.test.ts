import { describe, expect, it } from 'vitest';
import { blockingIssues, validateProductData } from '../domain/validation/validateProduct';
import { nextTier, renewalState, resolveAccountAccess } from '../lib/entitlements';
import { safeRedirectPath } from '../lib/safe-redirect';
import type { InternalVariant } from '../types';

const variant = (id: string, attributes: Record<string, string>, sku: string, price: number): InternalVariant =>
    ({ id, attributes, sku, price, isSkuOverridden: false, isPriceOverridden: false });

describe('validateProductData', () => {
    const options = [{ id: 'o', name: 'Size', values: ['S', 'M'] }];

    it('accepts a clean catalog', () => {
        const issues = validateProductData({ productTitle: 'Tee', options, variants: [variant('1', { Size: 'S' }, 'T-S', 10), variant('2', { Size: 'M' }, 'T-M', 10)] });
        expect(issues).toEqual([]);
    });

    it('blocks missing titles, missing or duplicate SKUs and negative prices', () => {
        const issues = validateProductData({ productTitle: ' ', options, variants: [variant('1', { Size: 'S' }, 'dup', 10), variant('2', { Size: 'M' }, 'DUP', -1)] });
        expect(blockingIssues(issues).map((issue) => issue.code).sort()).toEqual(['price-negative', 'sku-duplicate', 'title-missing']);
    });

    it('only reports advanced checks as non-blocking warnings', () => {
        const issues = validateProductData(
            { productTitle: 'Tee', options: [{ id: 'o', name: 'Size', values: ['small', 'LARGE'] }], variants: [variant('1', { Size: 'small' }, 'A', 0), variant('2', { Size: 'LARGE' }, 'B', 0)] },
            { advanced: true },
        );
        expect(issues.length).toBeGreaterThan(0);
        expect(blockingIssues(issues)).toEqual([]);
    });
});

describe('plans', () => {
    const now = new Date('2026-09-28T12:00:00Z');
    const inDays = (days: number) => new Date(now.getTime() + days * 864e5).toISOString();

    it('downgrades expired subscriptions to Free but remembers the paid plan', () => {
        const access = resolveAccountAccess({ tier: 'SCALE', status: 'active', current_period_end: inDays(-1) }, null, now);
        expect(access).toMatchObject({ tier: 'FREE', lastPaidTier: 'SCALE', subscriptionActive: false });
        expect(renewalState(access, now)).toMatchObject({ kind: 'lapsed', tier: 'SCALE' });
    });

    it('warns during the last week of a paid plan only', () => {
        expect(renewalState(resolveAccountAccess({ tier: 'PRO', status: 'active', current_period_end: inDays(20) }, null, now), now)).toBeNull();
        expect(renewalState(resolveAccountAccess({ tier: 'PRO', status: 'active', current_period_end: inDays(3) }, null, now), now)).toMatchObject({ kind: 'ending', daysLeft: 3 });
    });

    it('offers the next plan up, and nothing to owners', () => {
        expect(nextTier(resolveAccountAccess(null, null, now))).toBe('PRO');
        expect(nextTier(resolveAccountAccess({ tier: 'PRO' }, null, now))).toBe('SCALE');
        expect(nextTier(resolveAccountAccess({ tier: 'SCALE' }, null, now))).toBeNull();
        expect(nextTier(resolveAccountAccess(null, 'owner', now))).toBeNull();
    });

    it('gives owners every feature regardless of subscription', () => {
        expect(resolveAccountAccess(null, 'owner', now).entitlements).toMatchObject({ maxVariantsPerProject: null, canUseMultiPlatformExport: true });
    });
});

describe('safeRedirectPath', () => {
    it.each([['/fr/workspace', '/fr/workspace'], ['//evil.com', '/workspace'], ['https://evil.com', '/workspace'], ['/\\evil.com', '/workspace'], [null, '/workspace']])(
        'maps %s to %s', (input, expected) => expect(safeRedirectPath(input)).toBe(expected),
    );
});
