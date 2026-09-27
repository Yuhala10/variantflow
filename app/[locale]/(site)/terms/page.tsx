import { LegalPage } from '../../../../components/site/legal-page';
import { JsonLd, breadcrumbSchema, pageMetadata } from '../../../../lib/seo';
import { resolveLocale, type LocaleParams } from '../../../../lib/i18n/server';

export async function generateMetadata({ params }: LocaleParams) {
    const { locale, t } = await resolveLocale(params);
    return pageMetadata(locale, { title: t.seo.terms.title, description: t.seo.terms.description, path: '/terms' });
}

export default async function TermsPage({ params }: LocaleParams) {
    const { locale, t } = await resolveLocale(params);
    return (
        <LegalPage locale={locale} title={t.legal.terms.title} sections={t.legal.terms.sections}>
            <JsonLd data={breadcrumbSchema(locale, [{ name: t.seo.breadcrumbHome, path: '/' }, { name: t.footer.terms, path: '/terms' }])} />
        </LegalPage>
    );
}
