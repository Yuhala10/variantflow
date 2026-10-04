'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowRight, Menu, X } from 'lucide-react';
import { Logo } from '../brand/logo';
import { useI18n } from '../i18n/i18n-provider';
import { LanguageSwitcher } from '../i18n/language-switcher';
import { ThemeSwitch, ThemeToggle } from '../theme/theme-toggle';
import { cn } from '../../lib/utils';

export function SiteHeader({ guidesLabel }: { guidesLabel: string }) {
    const { t, href } = useI18n();
    const pathname = usePathname();
    const [open, setOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    const links = [
        { href: href('/#features'), label: t.nav.features },
        { href: href('/#how-it-works'), label: t.nav.howItWorks },
        { href: href('/pricing'), label: t.nav.pricing },
        { href: href('/guides'), label: guidesLabel },
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
                'safe-top sticky top-0 z-50 border-b transition-[background-color,border-color] duration-300',
                scrolled || open ? 'glass border-line' : 'border-transparent',
            )}
        >
            <nav aria-label={t.nav.label} className="container-page flex h-16 items-center justify-between gap-4">
                <Logo href={href('/')} />

                <ul className="hidden items-center gap-0.5 rounded-full border border-line bg-surface/70 p-1 shadow-xs backdrop-blur lg:flex">
                    {links.map((link) => {
                        const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
                        return (
                            <li key={link.href}>
                                <Link
                                    href={link.href}
                                    className={cn(
                                        'inline-flex min-h-9 items-center rounded-full px-3.5 text-sm font-medium transition-colors',
                                        active ? 'bg-surface-2 text-ink' : 'text-ink-2 hover:text-ink',
                                    )}
                                >
                                    {link.label}
                                </Link>
                            </li>
                        );
                    })}
                </ul>

                <div className="hidden items-center gap-1 lg:flex">
                    <ThemeToggle />
                    <LanguageSwitcher compact />
                    <Link href={href('/auth')} className="btn btn-ghost btn-sm">{t.common.signIn}</Link>
                    <Link href={href('/workspace')} className="btn btn-primary btn-sm ml-1">
                        {t.common.startFree} <ArrowRight />
                    </Link>
                </div>

                <div className="flex items-center gap-0.5 lg:hidden">
                    <ThemeToggle />
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
                            <Link href={link.href} onClick={() => setOpen(false)} className="flex min-h-13 items-center rounded-2xl px-4 font-display text-xl font-bold text-ink hover:bg-surface-2">
                                {link.label}
                            </Link>
                        </li>
                    ))}
                </ul>
                <div className="container-page grid gap-3 border-t border-line py-5">
                    <Link href={href('/workspace')} onClick={() => setOpen(false)} className="btn btn-primary btn-lg w-full">{t.common.startFree} <ArrowRight /></Link>
                    <Link href={href('/auth')} onClick={() => setOpen(false)} className="btn btn-secondary btn-lg w-full">{t.common.signIn}</Link>
                    <div className="flex items-center justify-between pt-2">
                        <span className="text-sm text-ink-3">{t.common.theme.label}</span>
                        <ThemeSwitch />
                    </div>
                </div>
            </div>
        </header>
    );
}
