import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '../../../../lib/supabase/server';
import { getAccountAccess } from '../../../../lib/entitlements.server';
import { isWithinLimit } from '../../../../lib/entitlements';
import { consumeRowRuns } from '../../../../lib/usage.server';
import { apiError } from '../../../../lib/api-errors';
import { blockingIssues, validateProductData } from '../../../../domain/validation/validateProduct';
import { EXPORT_PLATFORMS, isExportPlatform } from '../../../../exporters';
import { slugify } from '../../../../exporters/csv';
import type { CatalogExportInput } from '../../../../exporters/shopify/csvAdapter';

export async function POST(request: NextRequest, { params }: { params: Promise<{ platform: string }> }) {
    const { platform } = await params;
    if (!isExportPlatform(platform)) return apiError('not-found', 404, 'Unknown export format.');

    const supabase = await createSupabaseServerClient();
    if (!supabase) return apiError('not-configured', 503, 'Cloud export is not configured yet.');

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) return apiError('unauthorized', 401, 'Sign in before exporting.');

    const catalog = await request.json().catch(() => null) as CatalogExportInput | null;
    if (!catalog || typeof catalog.productTitle !== 'string' || !Array.isArray(catalog.options) || !Array.isArray(catalog.variants)) {
        return apiError('invalid-payload', 400, 'The catalog payload is incomplete.');
    }

    let access;
    try {
        access = await getAccountAccess(supabase, user);
    } catch {
        return apiError('plan-check-failed', 500, 'Unable to confirm your plan. Please try again.');
    }

    const { entitlements } = access;
    const format = EXPORT_PLATFORMS[platform];
    if (!entitlements.canExportCsv) return apiError('export-locked', 403, 'Your plan does not include CSV export.');
    if (format.multiPlatform && !entitlements.canUseMultiPlatformExport) {
        return apiError('platform-locked', 403, 'Multi-platform exporters are included in the Scale plan.');
    }
    if (!isWithinLimit(entitlements.maxVariantsPerProject, catalog.variants.length)) {
        return apiError('variant-limit', 403, `Your plan exports up to ${entitlements.maxVariantsPerProject} variants.`, { limit: entitlements.maxVariantsPerProject });
    }

    const validationErrors = blockingIssues(validateProductData({ productTitle: catalog.productTitle, options: catalog.options, variants: catalog.variants }));
    if (validationErrors.length > 0) {
        return apiError('validation-failed', 422, 'Fix catalog validation errors before exporting.', { validationErrors });
    }

    // Metering happens last, so failed exports never consume row-runs.
    const usage = await consumeRowRuns(user.id, catalog.variants.length, entitlements.monthlyRowRuns);
    if (!usage.allowed) {
        return usage.reason === 'limit'
            ? apiError('row-runs-exhausted', 429, 'You have used all row-runs for this month.', { used: usage.used, limit: entitlements.monthlyRowRuns })
            : apiError('usage-unavailable', 503, 'Usage tracking is temporarily unavailable.');
    }

    const csv = format.convert(catalog);
    const fileName = `${slugify(catalog.productTitle, 'variantflow').replace(/-/g, '_')}_${format.fileSuffix}.csv`;

    // A byte-order mark makes Excel show accents correctly, but Shopify and WooCommerce expect plain UTF-8.
    return new NextResponse(platform === 'universal' ? `﻿${csv}` : csv, {
        headers: {
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': `attachment; filename="${fileName}"`,
            'Cache-Control': 'private, no-store',
            'X-Row-Runs-Used': String(usage.used),
        },
    });
}
