'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowRight, Menu, X } from 'lucide-react';
import { Logo } from '../brand/logo';
import { cn } from '../../lib/utils';

const NAV_LINKS = [
    { href: '/#features', label: 'Features' },
    { href: '/#how-it-works', label: 'How it works' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/how-to-pay', label: 'Payments' },
];

export function SiteHeader() {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

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
            <nav aria-label="Main" className="container-page flex h-16 items-center justify-between gap-4">
                <Logo />

                <ul className="hidden items-center gap-1 md:flex">
                    {NAV_LINKS.map((link) => (
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

                <div className="hidden items-center gap-2 md:flex">
                    <Link href="/auth" className="btn btn-ghost btn-sm">Sign in</Link>
                    <Link href="/workspace" className="btn btn-primary btn-sm">
                        Start free <ArrowRight />
                    </Link>
                </div>

                <button
                    type="button"
                    onClick={() => setOpen((value) => !value)}
                    aria-expanded={open}
                    aria-controls="mobile-menu"
                    aria-label={open ? 'Close menu' : 'Open menu'}
                    className="btn btn-ghost btn-icon -mr-2 md:hidden"
                >
                    {open ? <X /> : <Menu />}
                </button>
            </nav>

            <div
                id="mobile-menu"
                hidden={!open}
                className="safe-bottom h-[calc(100dvh-4rem-env(safe-area-inset-top))] overflow-y-auto border-t border-line bg-canvas md:hidden"
            >
                <ul className="container-page flex flex-col gap-1 py-4">
                    {NAV_LINKS.map((link, index) => (
                        <li key={link.href} className="animate-rise" style={{ animationDelay: `${index * 40}ms` }}>
                            <Link href={link.href} onClick={() => setOpen(false)} className="flex min-h-12 items-center rounded-xl px-3 text-lg font-medium text-ink hover:bg-surface-2">
                                {link.label}
                            </Link>
                        </li>
                    ))}
                </ul>
                <div className="container-page grid gap-3 border-t border-line py-5">
                    <Link href="/workspace" className="btn btn-primary btn-lg w-full">Start free <ArrowRight /></Link>
                    <Link href="/auth" className="btn btn-secondary btn-lg w-full">Sign in</Link>
                </div>
            </div>
        </header>
    );
}
