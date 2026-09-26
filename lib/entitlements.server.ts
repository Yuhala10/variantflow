import 'server-only';
import type { SupabaseClient, User } from '@supabase/supabase-js';
import { resolveAccountAccess } from './entitlements';

/** Loads a signed-in user's plan and role and resolves what they may use. */
export async function getAccountAccess(supabase: SupabaseClient, user: User) {
    const [subscriptionResult, roleResult] = await Promise.all([
        supabase.from('subscriptions').select('tier, status, current_period_end').eq('user_id', user.id).maybeSingle(),
        supabase.from('user_roles').select('role').eq('user_id', user.id).maybeSingle(),
    ]);

    if (subscriptionResult.error) throw new Error('Unable to load subscription.');
    // A missing user_roles table (migration not yet applied) must not lock users out; they just get no role.
    const role = roleResult.error ? null : roleResult.data?.role;

    return resolveAccountAccess(subscriptionResult.data, role);
}
