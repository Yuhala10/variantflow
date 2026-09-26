import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '../../../lib/supabase/server';
import { getAccountAccess } from '../../../lib/entitlements.server';

export async function GET() {
    const supabase = await createSupabaseServerClient();
    if (!supabase) return NextResponse.json({ error: 'Cloud account is not configured yet.' }, { status: 503 });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Sign in before loading your account.' }, { status: 401 });

    try {
        const access = await getAccountAccess(supabase, user);
        return NextResponse.json(
            { user: { id: user.id, email: user.email }, access },
            { headers: { 'Cache-Control': 'private, no-store' } },
        );
    } catch {
        return NextResponse.json({ error: 'Unable to load account entitlements.' }, { status: 500 });
    }
}
