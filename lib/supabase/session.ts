import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';

export interface SessionUser {
    id: string;
    email: string | null;
}

/**
 * Returns the signed-in user, or null.
 *
 * getClaims() verifies the session token's signature and expiry. This project signs tokens
 * with an asymmetric key (ES256), so the check runs locally against Supabase's published key
 * instead of a round trip to Supabase Auth on every request. Expired tokens are refreshed
 * (and the refreshed cookies written) before verification.
 */
export async function getSessionUser(supabase: SupabaseClient): Promise<SessionUser | null> {
    const { data, error } = await supabase.auth.getClaims();
    const claims = data?.claims;
    if (error || !claims?.sub) return null;
    return { id: claims.sub, email: typeof claims.email === 'string' ? claims.email : null };
}
