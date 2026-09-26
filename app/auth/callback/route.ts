import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '../../../lib/supabase/server';
import { safeRedirectPath } from '../../../lib/safe-redirect';

export async function GET(request: Request) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');
    const next = safeRedirectPath(requestUrl.searchParams.get('next'));
    const supabase = await createSupabaseServerClient();

    if (supabase && code) {
        await supabase.auth.exchangeCodeForSession(code);
    }

    return NextResponse.redirect(new URL(next, requestUrl.origin));
}
