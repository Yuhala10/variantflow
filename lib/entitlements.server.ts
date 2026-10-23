import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import { resolveAccountAccess } from './entitlements';
import { createSupabaseAdminClient } from './supabase/admin';

/**
 * Loads a signed-in user's plan and role and resolves what they may use.
 *
 * The caller has already verified the session, so `user.id` is trusted. Plans and roles are
 * read with the service role, scoped to that one user: access must never depend on table
 * grants for signed-in users, which can be changed from the Supabase dashboard (a revoked
 * SELECT on `subscriptions` once made every account look signed out and hid owner access).
 */
export async function getAccountAccess(supabase: SupabaseClient, user: { id: string }) {
    const db = createSupabaseAdminClient() ?? supabase;
    const [subscriptionResult, roleResult] = await Promise.all([
        db.from('subscriptions').select('tier, status, current_period_end').eq('user_id', user.id).maybeSingle(),
        db.from('user_roles').select('role').eq('user_id', user.id).maybeSingle(),
    ]);

    if (subscriptionResult.error) {
        console.error('Unable to load subscription:', subscriptionResult.error.message);
        throw new Error('Unable to load subscription.');
    }
    // A missing user_roles table must not lock users out; they just get no role. Log it so it is visible.
    if (roleResult.error) console.error('Unable to load role:', roleResult.error.message);
    const role = roleResult.error ? null : roleResult.data?.role;

    return resolveAccountAccess(subscriptionResult.data, role);
}
