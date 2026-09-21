import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '../../../lib/supabase/server';

export async function GET() {
    const supabase = await createSupabaseServerClient();
    if (!supabase) return NextResponse.json({ error: 'Cloud account is not configured yet.' }, { status: 503 });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Sign in before loading your account.' }, { status: 401 });

    const { data: subscription, error } = await supabase
        .from('subscriptions')
        .select('tier, status, current_period_end')
        .eq('user_id', user.id)
        .maybeSingle();

    if (error) return NextResponse.json({ error: 'Unable to load account entitlements.' }, { status: 500 });

    return NextResponse.json({
        user: { id: user.id, email: user.email },
        subscription: subscription ?? { tier: 'FREE', status: 'active', current_period_end: null },
    });
}
