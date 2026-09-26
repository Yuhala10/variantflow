'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { ChevronDown, CreditCard, Home, LogOut, UserRound } from 'lucide-react';
import { createSupabaseBrowserClient } from '../../lib/supabase/client';
import { AccountAccess } from '../../types';
import { PlanBadge } from './plan-badge';

export function AccountMenu({ email, access, onUpgrade }: { email: string | null; access: AccountAccess; onUpgrade: () => void }) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        const close = (event: MouseEvent | KeyboardEvent) => {
            if (event instanceof KeyboardEvent ? event.key === 'Escape' : !ref.current?.contains(event.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', close);
        document.addEventListener('keydown', close);
        return () => {
            document.removeEventListener('mousedown', close);
            document.removeEventListener('keydown', close);
        };
    }, [open]);

    if (!email) {
        return <Link href="/auth?next=/workspace" className="btn btn-secondary btn-sm"><UserRound /> Sign in</Link>;
    }

    const signOut = async () => {
        await createSupabaseBrowserClient()?.auth.signOut();
        // A full reload clears the signed-out user's catalog from memory.
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination
        window.location.assign('/');
    };

    const isFree = !access.role && access.tier === 'FREE';
    const initial = email.charAt(0).toUpperCase();

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                onClick={() => setOpen((value) => !value)}
                aria-expanded={open}
                aria-haspopup="menu"
                aria-label="Account menu"
                className="flex min-h-10 items-center gap-1.5 rounded-full border border-line bg-surface p-1 pr-2 transition-colors hover:bg-surface-2"
            >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-brand-soft text-sm font-semibold text-brand-ink">{initial}</span>
                <ChevronDown className={`h-4 w-4 text-ink-3 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
            </button>

            {open && (
                <div role="menu" className="animate-rise absolute right-0 top-[calc(100%+0.5rem)] z-50 w-72 overflow-hidden rounded-2xl border border-line bg-surface shadow-xl [animation-duration:0.25s]">
                    <div className="border-b border-line p-4">
                        <p className="truncate text-sm font-semibold text-ink">{email}</p>
                        <div className="mt-2"><PlanBadge access={access} /></div>
                        {access.currentPeriodEnd && !access.role && access.tier !== 'FREE' && (
                            <p className="mt-2 text-xs text-ink-3">Renews by {new Date(access.currentPeriodEnd).toLocaleDateString()}</p>
                        )}
                    </div>
                    <div className="p-1.5">
                        {isFree && (
                            <button type="button" role="menuitem" onClick={() => { setOpen(false); onUpgrade(); }} className="flex min-h-10 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium text-brand-ink hover:bg-brand-soft">
                                <CreditCard className="h-4 w-4" /> Upgrade plan
                            </button>
                        )}
                        <Link href="/" role="menuitem" className="flex min-h-10 items-center gap-3 rounded-lg px-3 text-sm text-ink-2 hover:bg-surface-2 hover:text-ink">
                            <Home className="h-4 w-4" /> Home page
                        </Link>
                        <button type="button" role="menuitem" onClick={signOut} className="flex min-h-10 w-full items-center gap-3 rounded-lg px-3 text-sm text-ink-2 hover:bg-surface-2 hover:text-ink">
                            <LogOut className="h-4 w-4" /> Sign out
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
