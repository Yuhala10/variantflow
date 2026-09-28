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

    // Expired, reused or malformed links: send people back to sign-in with a clear message instead of a silent bounce.
    // Password-reset links reopen the reset form; sign-up confirmations (often opened in another browser) ask to sign in.
    const isReset = next === localePath(locale, '/auth/reset');
    const linkFailed = () => NextResponse.redirect(new URL(`${localePath(locale, '/auth')}?error=${isReset ? 'link' : 'confirm'}`, requestUrl.origin));

    if (!supabase || !code || requestUrl.searchParams.has('error')) return linkFailed();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) return linkFailed();

    return NextResponse.redirect(new URL(next, requestUrl.origin));
}
