import Link from 'next/link';
import { Logo } from '../brand/logo';
import { LanguageSwitcher } from '../i18n/language-switcher';
import { getDictionary, localePath, type Locale } from '../../lib/i18n';

export function SiteFooter({ locale }: { locale: Locale }) {
    const t = getDictionary(locale);
    const href = (path: string) => localePath(locale, path);

    const columns = [
        {
            title: t.footer.product,
            links: [
                { href: href('/workspace'), label: t.footer.workspace },
                { href: href('/#features'), label: t.nav.features },
                { href: href('/pricing'), label: t.nav.pricing },
            ],
        },
        {
            title: t.footer.help,
            links: [
                { href: href('/#how-it-works'), label: t.nav.howItWorks },
                { href: href('/how-to-pay'), label: t.footer.howToPay },
                { href: href('/#faq'), label: t.footer.faq },
            ],
        },
        {
            title: t.footer.legal,
            links: [
                { href: href('/privacy'), label: t.footer.privacy },
                { href: href('/terms'), label: t.footer.terms },
            ],
        },
    ];

    return (
        <footer className="safe-bottom border-t border-line bg-surface">
            <div className="container-page grid gap-10 py-14 md:grid-cols-[1.4fr_repeat(3,1fr)]">
                <div className="max-w-xs space-y-4">
                    <Logo href={href('/')} />
                    <p className="text-sm leading-relaxed text-ink-2">{t.footer.tagline}</p>
                    <LanguageSwitcher className="-ml-3" />
                </div>
                {columns.map((column) => (
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
                <p className="container-page py-6 text-xs text-ink-3">{t.footer.rights({ year: new Date().getFullYear() })}</p>
            </div>
        </footer>
    );
}
