'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowRight, Menu, X } from 'lucide-react';
import { Logo } from '../brand/logo';
import { useI18n } from '../i18n/i18n-provider';
import { LanguageSwitcher } from '../i18n/language-switcher';
import { cn } from '../../lib/utils';

export function SiteHeader() {
    const { t, href } = useI18n();
    const pathname = usePathname();
    const [open, setOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    const links = [
        { href: href('/#features'), label: t.nav.features },
        { href: href('/#how-it-works'), label: t.nav.howItWorks },
        { href: href('/pricing'), label: t.nav.pricing },
        { href: href('/how-to-pay'), label: t.nav.payments },
    ];

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 8);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
        document.body.style.overflow = open ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [open]);

    return (
        <header
            className={cn(
                'safe-top sticky top-0 z-50 transition-[background-color,border-color,box-shadow] duration-300',
                scrolled || open ? 'border-b border-line bg-canvas/80 backdrop-blur-xl backdrop-saturate-150' : 'border-b border-transparent',
            )}
        >
            <nav aria-label={t.nav.label} className="container-page flex h-16 items-center justify-between gap-4">
                <Logo href={href('/')} />

                <ul className="hidden items-center gap-1 lg:flex">
                    {links.map((link) => (
                        <li key={link.href}>
                            <Link
                                href={link.href}
                                className={cn(
                                    'rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:text-ink',
                                    pathname === link.href ? 'text-ink' : 'text-ink-2',
                                )}
                            >
                                {link.label}
                            </Link>
                        </li>
                    ))}
                </ul>

                <div className="hidden items-center gap-1.5 lg:flex">
                    <LanguageSwitcher compact />
                    <Link href={href('/auth')} className="btn btn-ghost btn-sm">{t.common.signIn}</Link>
                    <Link href={href('/workspace')} className="btn btn-primary btn-sm">
                        {t.common.startFree} <ArrowRight />
                    </Link>
                </div>

                <div className="flex items-center gap-1 lg:hidden">
                    <LanguageSwitcher compact />
                    <button
                        type="button"
                        onClick={() => setOpen((value) => !value)}
                        aria-expanded={open}
                        aria-controls="mobile-menu"
                        aria-label={open ? t.nav.closeMenu : t.nav.openMenu}
                        className="btn btn-ghost btn-icon -mr-2"
                    >
                        {open ? <X /> : <Menu />}
                    </button>
                </div>
            </nav>

            <div
                id="mobile-menu"
                hidden={!open}
                className="safe-bottom h-[calc(100dvh-4rem-env(safe-area-inset-top))] overflow-y-auto border-t border-line bg-canvas lg:hidden"
            >
                <ul className="container-page flex flex-col gap-1 py-4">
                    {links.map((link, index) => (
                        <li key={link.href} className="animate-rise" style={{ animationDelay: `${index * 40}ms` }}>
                            <Link href={link.href} onClick={() => setOpen(false)} className="flex min-h-12 items-center rounded-xl px-3 text-lg font-medium text-ink hover:bg-surface-2">
                                {link.label}
                            </Link>
                        </li>
                    ))}
                </ul>
                <div className="container-page grid gap-3 border-t border-line py-5">
                    <Link href={href('/workspace')} onClick={() => setOpen(false)} className="btn btn-primary btn-lg w-full">{t.common.startFree} <ArrowRight /></Link>
                    <Link href={href('/auth')} onClick={() => setOpen(false)} className="btn btn-secondary btn-lg w-full">{t.common.signIn}</Link>
                </div>
            </div>
        </header>
    );
}
