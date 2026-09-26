import Link from 'next/link';
import { Logo } from '../brand/logo';

const COLUMNS = [
    {
        title: 'Product',
        links: [
            { href: '/workspace', label: 'Workspace' },
            { href: '/#features', label: 'Features' },
            { href: '/pricing', label: 'Pricing' },
        ],
    },
    {
        title: 'Help',
        links: [
            { href: '/#how-it-works', label: 'How it works' },
            { href: '/how-to-pay', label: 'How to pay' },
            { href: '/#faq', label: 'FAQ' },
        ],
    },
    {
        title: 'Legal',
        links: [
            { href: '/privacy', label: 'Privacy' },
            { href: '/terms', label: 'Terms' },
        ],
    },
];

export function SiteFooter() {
    return (
        <footer className="safe-bottom border-t border-line bg-surface">
            <div className="container-page grid gap-10 py-14 md:grid-cols-[1.4fr_repeat(3,1fr)]">
                <div className="max-w-xs space-y-3">
                    <Logo />
                    <p className="text-sm leading-relaxed text-ink-2">
                        The fastest way to turn product options into clean, Shopify-ready variant catalogs.
                    </p>
                </div>
                {COLUMNS.map((column) => (
                    <nav key={column.title} aria-label={column.title} className="space-y-3">
                        <h2 className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-3">{column.title}</h2>
                        <ul className="space-y-2">
                            {column.links.map((link) => (
                                <li key={link.href}>
                                    <Link href={link.href} className="text-sm text-ink-2 transition-colors hover:text-ink">{link.label}</Link>
                                </li>
                            ))}
                        </ul>
                    </nav>
                ))}
            </div>
            <div className="border-t border-line">
                <p className="container-page py-6 text-xs text-ink-3">© {new Date().getFullYear()} VariantFlow. All rights reserved.</p>
            </div>
        </footer>
    );
}
