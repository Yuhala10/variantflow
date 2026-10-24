import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';

const SUBSCRIPTION_PERIOD_MS = 30 * 24 * 60 * 60 * 1000;

export interface PaidPlanInput {
    /** Unique per payment (Paymento event id, order id or token); makes every delivery idempotent. */
    key: string;
    tier: 'PRO' | 'SCALE';
    email: string | null;
    amountUsdt: number;
    transactionHash?: string | null;
    paymentToken?: string | null;
    source: 'payment_link' | 'payment_api';
    payload: unknown;
}

export type ActivationResult =
    | { status: 'activated'; tier: 'PRO' | 'SCALE' }
    | { status: 'already-processed' }
    | { status: 'unmatched' }
    | { status: 'retry'; reason: string };

/** Paying for the plan you already have extends it; a new plan starts a fresh 30 days. */
async function nextPeriodEnd(admin: SupabaseClient, userId: string, tier: string) {
    const { data } = await admin.from('subscriptions').select('tier, status, current_period_end').eq('user_id', userId).maybeSingle();
    const now = Date.now();
    const currentEnd = data?.current_period_end ? new Date(data.current_period_end).getTime() : 0;
    const extends_ = data?.tier === tier && data?.status === 'active' && currentEnd > now;
    return new Date((extends_ ? currentEnd : now) + SUBSCRIPTION_PERIOD_MS).toISOString();
}

/**
 * Records a verified payment and activates the plan, safely under retries and duplicates:
 * 1. The payment row is written first as `pending`, keyed by `key` (unique), so a second delivery
 *    or a concurrent one can never extend a plan twice.
 * 2. The period end is computed once and stored on the row, so a retry applies the same value.
 * 3. Only after the subscription is updated is the row marked `confirmed`.
 * A payment whose email matches no account stays `pending` with no user, for manual follow-up
 * (it is acknowledged, so Paymento does not retry it; a retry of an earlier failure links it if
 * the account exists by then).
 */
export async function activatePaidPlan(admin: SupabaseClient, input: PaidPlanInput): Promise<ActivationResult> {
    const { data: existing, error: lookupError } = await admin
        .from('payment_events')
        .select('id, status, user_id, payload')
        .eq('invoice_id', input.key)
        .maybeSingle();
    if (lookupError) return { status: 'retry', reason: `lookup failed: ${lookupError.message}` };
    if (existing?.status === 'confirmed') return { status: 'already-processed' };

    let userId: string | null = existing?.user_id ?? null;
    if (!userId && input.email) {
        const { data: profile } = await admin.from('profiles').select('id').eq('email', input.email).maybeSingle();
        userId = profile?.id ?? null;
    }

    const stored = (existing?.payload ?? {}) as { periodEnd?: string };
    let periodEnd = stored.periodEnd;

    if (!existing) {
        if (userId) periodEnd = await nextPeriodEnd(admin, userId, input.tier);
        const { error } = await admin.from('payment_events').insert({
            invoice_id: input.key,
            user_id: userId,
            tier: input.tier,
            amount_usdt: input.amountUsdt,
            transaction_hash: input.transactionHash ?? null,
            payment_token: input.paymentToken ?? null,
            status: 'pending',
            payload: { source: input.source, email: input.email, periodEnd: periodEnd ?? null, event: input.payload },
        });
        // 23505: a concurrent delivery of the same payment already holds the row.
        if (error?.code === '23505') return { status: 'already-processed' };
        if (error) return { status: 'retry', reason: `could not record payment: ${error.message}` };
    } else if (userId && !periodEnd) {
        periodEnd = await nextPeriodEnd(admin, userId, input.tier);
        const { error } = await admin.from('payment_events')
            .update({ user_id: userId, payload: { ...stored, periodEnd } })
            .eq('id', existing.id);
        if (error) return { status: 'retry', reason: `could not link payment: ${error.message}` };
    }

    if (!userId || !periodEnd) return { status: 'unmatched' };

    const { error: subscriptionError } = await admin.from('subscriptions').upsert({
        user_id: userId,
        tier: input.tier,
        status: 'active',
        current_period_end: periodEnd,
        updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });
    if (subscriptionError) return { status: 'retry', reason: `could not activate plan: ${subscriptionError.message}` };

    await admin.from('payment_events')
        .update({ status: 'confirmed', confirmed_at: new Date().toISOString(), user_id: userId })
        .eq('invoice_id', input.key);
    return { status: 'activated', tier: input.tier };
}
