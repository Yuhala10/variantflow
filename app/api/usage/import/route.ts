import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '../../../../lib/supabase/server';
import { getAccountAccess } from '../../../../lib/entitlements.server';
import { consumeRowRuns } from '../../../../lib/usage.server';
import { apiError } from '../../../../lib/api-errors';

const MAX_IMPORT_ROWS = 20000;

/** Authorizes a supplier CSV import and meters its rows before the browser applies it. */
export async function POST(request: NextRequest) {
    const supabase = await createSupabaseServerClient();
    if (!supabase) return apiError('not-configured', 503, 'Cloud account is not configured yet.');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return apiError('unauthorized', 401, 'Sign in before importing.');

    const body = await request.json().catch(() => null);
    const rows = Number(body?.rows);
    if (!Number.isInteger(rows) || rows < 1 || rows > MAX_IMPORT_ROWS) {
        return apiError('invalid-payload', 400, `Imports must contain between 1 and ${MAX_IMPORT_ROWS} rows.`);
    }

    let access;
    try {
        access = await getAccountAccess(supabase, user);
    } catch {
        return apiError('plan-check-failed', 500, 'Unable to confirm your plan. Please try again.');
    }
    if (!access.entitlements.canImportCsv) return apiError('import-locked', 403, 'CSV import is included in Pro and Scale.');

    const usage = await consumeRowRuns(user.id, rows, access.entitlements.monthlyRowRuns);
    if (!usage.allowed) {
        return usage.reason === 'limit'
            ? apiError('row-runs-exhausted', 429, 'You have used all row-runs for this month.', { used: usage.used, limit: access.entitlements.monthlyRowRuns })
            : apiError('usage-unavailable', 503, 'Usage tracking is temporarily unavailable.');
    }

    return NextResponse.json({ ok: true, used: usage.used, limit: access.entitlements.monthlyRowRuns }, { headers: { 'Cache-Control': 'private, no-store' } });
}
