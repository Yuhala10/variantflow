import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createSupabaseAdminClient } from './supabase/admin';

export const currentMonthStart = () => {
    const now = new Date();
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString().slice(0, 10);
};

/** Row-runs used this month, read with the signed-in user's own client (RLS: own rows only). */
export async function getMonthlyRowRuns(supabase: SupabaseClient, userId: string) {
    const { data } = await supabase
        .from('usage_monthly')
        .select('row_runs')
        .eq('user_id', userId)
        .eq('month_start', currentMonthStart())
        .maybeSingle();
    return data?.row_runs ?? 0;
}

export type ConsumeResult = { allowed: true; used: number } | { allowed: false; used: number; reason: 'limit' | 'unavailable' };

/** Atomically records row-runs, refusing if the monthly limit (null = unlimited) would be exceeded. */
export async function consumeRowRuns(userId: string, rows: number, limit: number | null): Promise<ConsumeResult> {
    const admin = createSupabaseAdminClient();
    if (!admin) {
        // Without the service key usage cannot be recorded; only unlimited accounts may proceed.
        return limit === null ? { allowed: true, used: 0 } : { allowed: false, used: 0, reason: 'unavailable' };
    }

    const { data, error } = await admin.rpc('consume_row_runs', { p_user_id: userId, p_rows: rows, p_limit: limit });
    const result = Array.isArray(data) ? data[0] : data;
    if (error || !result) {
        // Fail open: a metering outage (or migration 003 not yet applied) must never block paying customers.
        console.error('Row-run metering unavailable:', error?.message);
        return { allowed: true, used: 0 };
    }
    return result.allowed ? { allowed: true, used: result.used } : { allowed: false, used: result.used, reason: 'limit' };
}
