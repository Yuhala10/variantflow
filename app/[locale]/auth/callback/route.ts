import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '../../../../lib/supabase/server';
import { safeRedirectPath } from '../../../../lib/safe-redirect';
import { isLocale, localePath } from '../../../../lib/i18n';

export async function GET(request: Request, { params }: { params: Promise<{ locale: string }> }) {
    const { locale: rawLocale } = await params;
    const locale = isLocale(rawLocale) ? rawLocale : 'en';
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');
    const next = safeRedirectPath(requestUrl.searchParams.get('next'), localePath(locale, '/workspace'));
    const supabase = await createSupabaseServerClient();

    if (supabase && code) {
        await supabase.auth.exchangeCodeForSession(code);
    }

    return NextResponse.redirect(new URL(next, requestUrl.origin));
}
