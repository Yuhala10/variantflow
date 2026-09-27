'use client';

import Link from 'next/link';
import { useCallback, useRef, useState } from 'react';
import { ChevronDown, CreditCard, Home, Languages, LogOut, UserRound } from 'lucide-react';
import { createSupabaseBrowserClient } from '../../lib/supabase/client';
import { localePath, stripLocale } from '../../lib/i18n';
import { AccountAccess } from '../../types';
import { useI18n } from '../i18n/i18n-provider';
import { rememberLocale } from '../i18n/language-switcher';
import { PlanBadge } from './plan-badge';
import { useDismiss } from './use-dismiss';

export function AccountMenu({ email, access, onUpgrade }: { email: string | null; access: AccountAccess; onUpgrade: () => void }) {
    const { t, href, locale, formatDate } = useI18n();
    const copy = t.workspace.account;
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const close = useCallback(() => setOpen(false), []);
    useDismiss(ref, open, close);

    if (!email) {
        return <Link href={`${href('/auth')}?next=${encodeURIComponent(href('/workspace'))}`} className="btn btn-secondary btn-sm"><UserRound /> {t.common.signIn}</Link>;
    }

    const signOut = async () => {
        await createSupabaseBrowserClient()?.auth.signOut();
        // A full reload clears the signed-out user's catalog from memory.
        window.location.assign(href('/'));
    };

    const otherLocale = locale === 'en' ? 'fr' : 'en';
    const switchLanguage = () => {
        rememberLocale(otherLocale);
        // Full navigation so the saved catalog reloads in the new language layout.
        window.location.assign(localePath(otherLocale, stripLocale(window.location.pathname)));
    };

    const isFree = !access.role && access.tier === 'FREE';
    const itemClass = 'flex min-h-10 w-full items-center gap-3 rounded-lg px-3 text-sm text-ink-2 hover:bg-surface-2 hover:text-ink';

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                onClick={() => setOpen((value) => !value)}
                aria-expanded={open}
                aria-haspopup="menu"
                aria-label={copy.menu}
                className="flex min-h-10 items-center gap-1.5 rounded-full border border-line bg-surface p-1 pr-2 transition-colors hover:bg-surface-2"
            >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-brand-soft text-sm font-semibold text-brand-ink">{email.charAt(0).toUpperCase()}</span>
                <ChevronDown className={`h-4 w-4 text-ink-3 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
            </button>

            {open && (
                <div role="menu" className="animate-rise absolute right-0 top-[calc(100%+0.5rem)] z-50 w-72 overflow-hidden rounded-2xl border border-line bg-surface shadow-xl [animation-duration:0.25s]">
                    <div className="border-b border-line p-4">
                        <p className="truncate text-sm font-semibold text-ink">{email}</p>
                        <div className="mt-2"><PlanBadge access={access} /></div>
                        {access.currentPeriodEnd && !access.role && access.tier !== 'FREE' && (
                            <p className="mt-2 text-xs text-ink-3">{copy.renews({ date: formatDate(access.currentPeriodEnd) })}</p>
                        )}
                    </div>
                    <div className="p-1.5">
                        {isFree && (
                            <button type="button" role="menuitem" onClick={() => { setOpen(false); onUpgrade(); }} className="flex min-h-10 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium text-brand-ink hover:bg-brand-soft">
                                <CreditCard className="h-4 w-4" /> {copy.upgradePlan}
                            </button>
                        )}
                        <button type="button" role="menuitem" onClick={switchLanguage} className={itemClass}>
                            <Languages className="h-4 w-4" /> {t.common.languageNames[otherLocale]}
                        </button>
                        <Link href={href('/')} role="menuitem" className={itemClass}>
                            <Home className="h-4 w-4" /> {copy.homePage}
                        </Link>
                        <button type="button" role="menuitem" onClick={signOut} className={itemClass}>
                            <LogOut className="h-4 w-4" /> {copy.signOut}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
