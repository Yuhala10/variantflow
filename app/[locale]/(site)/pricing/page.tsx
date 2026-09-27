import Link from 'next/link';
import { PlanCards } from '../../../../components/site/plan-cards';
import { FaqList } from '../../../../components/site/faq-list';
import { JsonLd, breadcrumbSchema, faqSchema, pageMetadata, softwareApplicationSchema } from '../../../../lib/seo';
import { localePath } from '../../../../lib/i18n';
import { resolveLocale, type LocaleParams } from '../../../../lib/i18n/server';

export async function generateMetadata({ params }: LocaleParams) {
    const { locale, t } = await resolveLocale(params);
    return pageMetadata(locale, { title: t.seo.pricing.title, description: t.seo.pricing.description, path: '/pricing' });
}

export default async function PricingPage({ params }: LocaleParams) {
    const { locale, t } = await resolveLocale(params);

    return (
        <>
            <JsonLd data={[
                softwareApplicationSchema(locale),
                faqSchema(t.faq.pricing, locale),
                breadcrumbSchema(locale, [{ name: t.seo.breadcrumbHome, path: '/' }, { name: t.nav.pricing, path: '/pricing' }]),
            ]} />

            <section className="relative overflow-hidden">
                <div className="grid-backdrop pointer-events-none absolute inset-0 -z-10" />
                <div className="container-page animate-rise pb-14 pt-14 text-center md:pt-20">
                    <p className="eyebrow">{t.pricingPage.eyebrow}</p>
                    <h1 className="mx-auto mt-3 max-w-3xl text-4xl font-semibold tracking-[-0.03em] text-ink sm:text-6xl">
                        {t.pricingPage.titleBefore} <span className="font-display font-normal italic text-brand">{t.pricingPage.titleAccent}</span>
                    </h1>
                    <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-ink-2">{t.pricingPage.subtitle}</p>
                </div>
            </section>

            <section aria-label={t.pricingPage.plansLabel} className="container-page pb-20">
                <PlanCards locale={locale} headingLevel="h2" />
                <p className="mt-4 text-center text-sm text-ink-3">
                    {t.pricingPage.note}{' '}
                    <Link href={localePath(locale, '/how-to-pay')} className="font-medium text-brand underline-offset-4 hover:underline">{t.pricingPage.noteLink}</Link>.
                </p>
            </section>

            <section aria-labelledby="pricing-faq" className="border-t border-line bg-surface py-20">
                <div className="container-page grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
                    <div>
                        <p className="eyebrow">{t.pricingPage.faqEyebrow}</p>
                        <h2 id="pricing-faq" className="mt-3 text-3xl font-semibold tracking-tight text-ink">{t.pricingPage.faqTitle}</h2>
                    </div>
                    <FaqList items={t.faq.pricing} />
                </div>
            </section>
        </>
    );
}
