import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { getSupabaseConfig } from './lib/supabase/config';
import { LOCALE_COOKIE, defaultLocale, isLocale, localePath, type Locale } from './lib/i18n/config';

const ONE_YEAR = 60 * 60 * 24 * 365;
const BOT_PATTERN = /bot|crawler|spider|crawling|facebookexternalhit|slurp|bingpreview|embedly|whatsapp|telegram/i;

/** True when the browser's first-choice language is French. */
const prefersFrench = (header: string | null) => {
    const first = header?.split(',')[0]?.trim().toLowerCase() ?? '';
    return first.startsWith('fr');
};

export async function proxy(request: NextRequest) {
    const { pathname, search } = request.nextUrl;

    // The default language never carries a prefix: /en/pricing → /pricing (one canonical URL).
    if (pathname === `/${defaultLocale}` || pathname.startsWith(`/${defaultLocale}/`)) {
        const url = request.nextUrl.clone();
        url.pathname = pathname.slice(defaultLocale.length + 1) || '/';
        return NextResponse.redirect(url, 308);
    }

    const segment = pathname.split('/')[1];
    const prefixed = isLocale(segment) && segment !== defaultLocale;
    const locale: Locale = prefixed ? (segment as Locale) : defaultLocale;
    const barePath = prefixed ? pathname.slice(segment.length + 1) || '/' : pathname;

    // Unprefixed request: honour a saved preference, or a French browser on first visit (never for crawlers).
    if (!prefixed) {
        const saved = request.cookies.get(LOCALE_COOKIE)?.value;
        const isBot = BOT_PATTERN.test(request.headers.get('user-agent') ?? '');
        const wantsFrench = saved === 'fr' || (!saved && !isBot && prefersFrench(request.headers.get('accept-language')));
        if (wantsFrench) {
            const url = request.nextUrl.clone();
            url.pathname = localePath('fr', pathname);
            const redirect = NextResponse.redirect(url, 307);
            redirect.cookies.set(LOCALE_COOKIE, 'fr', { path: '/', maxAge: ONE_YEAR, sameSite: 'lax' });
            redirect.headers.set('Vary', 'Accept-Language, Cookie');
            return redirect;
        }
    }

    // English pages live under app/[locale] too, so unprefixed paths are rewritten internally to /en/….
    const makeResponse = () => (prefixed
        ? NextResponse.next({ request })
        : NextResponse.rewrite(new URL(`/${defaultLocale}${pathname}${search}`, request.url), { request }));

    let response = makeResponse();

    if (barePath === '/workspace' || barePath.startsWith('/workspace/')) {
        const config = getSupabaseConfig();
        if (config) {
            const supabase = createServerClient(config.url, config.anonKey, {
                cookies: {
                    getAll() {
                        return request.cookies.getAll();
                    },
                    setAll(cookiesToSet) {
                        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
                        response = makeResponse();
                        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
                    },
                },
            });

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                const loginUrl = request.nextUrl.clone();
                loginUrl.pathname = localePath(locale, '/auth');
                loginUrl.search = `?next=${encodeURIComponent(pathname)}`;
                return NextResponse.redirect(loginUrl);
            }
        }
    }

    return response;
}

export const config = {
    // Everything except API routes, Next internals and root-level metadata files.
    matcher: ['/((?!api/|_next/|icon\\.svg|apple-icon|logo\\.png|manifest\\.webmanifest|robots\\.txt|sitemap\\.xml|favicon\\.ico).*)'],
};
