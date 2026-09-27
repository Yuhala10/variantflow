import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '../../../lib/supabase/server';
import { getAccountAccess } from '../../../lib/entitlements.server';
import { currentMonthStart, getMonthlyRowRuns } from '../../../lib/usage.server';
import { apiError } from '../../../lib/api-errors';

export async function GET() {
    const supabase = await createSupabaseServerClient();
    if (!supabase) return apiError('not-configured', 503, 'Cloud account is not configured yet.');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return apiError('unauthorized', 401, 'Sign in before loading your account.');

    try {
        const [access, rowRunsUsed] = await Promise.all([getAccountAccess(supabase, user), getMonthlyRowRuns(supabase, user.id)]);
        return NextResponse.json(
            { user: { id: user.id, email: user.email }, access, usage: { rowRunsUsed, monthStart: currentMonthStart() } },
            { headers: { 'Cache-Control': 'private, no-store' } },
        );
    } catch {
        return apiError('plan-check-failed', 500, 'Unable to load account entitlements.');
    }
}
