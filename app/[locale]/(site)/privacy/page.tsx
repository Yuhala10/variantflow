import { LegalPage } from '../../../../components/site/legal-page';
import { JsonLd, breadcrumbSchema, pageMetadata } from '../../../../lib/seo';
import { resolveLocale, type LocaleParams } from '../../../../lib/i18n/server';

export async function generateMetadata({ params }: LocaleParams) {
    const { locale, t } = await resolveLocale(params);
    return pageMetadata(locale, { title: t.seo.privacy.title, description: t.seo.privacy.description, path: '/privacy' });
}

export default async function PrivacyPage({ params }: LocaleParams) {
    const { locale, t } = await resolveLocale(params);
    return (
        <LegalPage locale={locale} title={t.legal.privacy.title} sections={t.legal.privacy.sections}>
            <JsonLd data={breadcrumbSchema(locale, [{ name: t.seo.breadcrumbHome, path: '/' }, { name: t.footer.privacy, path: '/privacy' }])} />
        </LegalPage>
    );
}
