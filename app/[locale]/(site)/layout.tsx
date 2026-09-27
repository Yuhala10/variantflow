import { SiteHeader } from '../../../components/site/site-header';
import { SiteFooter } from '../../../components/site/site-footer';
import { resolveLocale, type LocaleParams } from '../../../lib/i18n/server';

export default async function SiteLayout({ children, params }: LocaleParams & { children: React.ReactNode }) {
    const { locale } = await resolveLocale(params);
    return (
        <div className="flex min-h-dvh flex-col">
            <SiteHeader />
            <main id="main" className="flex-1">{children}</main>
            <SiteFooter locale={locale} />
        </div>
    );
}
