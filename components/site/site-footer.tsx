import Link from 'next/link';
import { Logo } from '../brand/logo';
import { LanguageSwitcher } from '../i18n/language-switcher';
import { ThemeSwitch } from '../theme/theme-toggle';
import { getDictionary, localePath, type Locale } from '../../lib/i18n';
import { GUIDE_KEYS, LANDING_KEYS, guidePath, landingPath } from '../../lib/i18n/routes';
import { getLanding } from '../../lib/content/landing';
import { getGuide } from '../../lib/content/guides';
import { getMarketing } from '../../lib/content/marketing';

export function SiteFooter({ locale }: { locale: Locale }) {
    const t = getDictionary(locale);
    const m = getMarketing(locale);
    const href = (path: string) => localePath(locale, path);

    const columns = [
        {
            title: m.labels.features,
            links: LANDING_KEYS.map((key) => ({ href: href(landingPath(key, locale)), label: getLanding(locale, key).nav })),
        },
        {
            title: m.labels.guides,
            links: [
                ...GUIDE_KEYS.map((key) => ({ href: href(guidePath(key, locale)), label: getGuide(locale, key).title })),
                { href: href('/guides'), label: m.home.guides.all },
            ],
        },
        {
            title: t.footer.product,
            links: [
                { href: href('/workspace'), label: t.footer.workspace },
                { href: href('/pricing'), label: t.nav.pricing },
                { href: href('/how-to-pay'), label: t.footer.howToPay },
                { href: href('/#faq'), label: t.footer.faq },
                { href: href('/privacy'), label: t.footer.privacy },
                { href: href('/terms'), label: t.footer.terms },
            ],
        },
    ];

    return (
        <footer className="safe-bottom border-t border-line bg-surface">
            <div className="container-page grid gap-12 py-16 lg:grid-cols-[1.2fr_2.4fr]">
                <div className="max-w-xs space-y-5">
                    <Logo href={href('/')} />
                    <p className="text-sm leading-relaxed text-ink-2">{t.footer.tagline}</p>
                    <div className="flex flex-wrap items-center gap-2">
                        <ThemeSwitch />
                        <LanguageSwitcher className="border border-line" />
                    </div>
                </div>
                <div className="grid gap-10 sm:grid-cols-3">
                    {columns.map((column) => (
                        <nav key={column.title} aria-label={column.title} className="space-y-4">
                            <h2 className="font-sans text-xs font-bold uppercase tracking-[0.08em] text-ink-3">{column.title}</h2>
                            <ul className="space-y-2.5">
                                {column.links.map((link) => (
                                    <li key={link.href}>
                                        <Link href={link.href} className="text-sm leading-snug text-ink-2 transition-colors hover:text-brand">{link.label}</Link>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    ))}
                </div>
            </div>
            <div className="border-t border-line">
                <p className="container-page py-6 text-xs text-ink-3">{t.footer.rights({ year: new Date().getFullYear() })}</p>
            </div>
        </footer>
    );
}
