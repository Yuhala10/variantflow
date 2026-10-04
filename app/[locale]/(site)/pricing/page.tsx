import Link from 'next/link';
import { Check, Minus } from 'lucide-react';
import { Breadcrumbs } from '../../../../components/site/breadcrumbs';
import { PlanCards } from '../../../../components/site/plan-cards';
import { FaqList } from '../../../../components/site/faq-list';
import { CtaBand } from '../../../../components/site/cta-band';
import { JsonLd, breadcrumbSchema, faqSchema, pageMetadata, softwareApplicationSchema } from '../../../../lib/seo';
import { localePath } from '../../../../lib/i18n';
import { resolveLocale, type LocaleParams } from '../../../../lib/i18n/server';
import { getMarketing } from '../../../../lib/content/marketing';
import type { SubscriptionTier } from '../../../../types';

export async function generateMetadata({ params }: LocaleParams) {
    const { locale, t } = await resolveLocale(params);
    return pageMetadata(locale, { title: t.seo.pricing.title, description: t.seo.pricing.description, path: '/pricing' });
}

const TIERS: SubscriptionTier[] = ['FREE', 'PRO', 'SCALE'];

export default async function PricingPage({ params }: LocaleParams) {
    const { locale, t } = await resolveLocale(params);
    const m = getMarketing(locale);
    const href = (path: string) => localePath(locale, path);

    return (
        <>
            <JsonLd data={[
                softwareApplicationSchema(locale),
                faqSchema(t.faq.pricing, locale),
                breadcrumbSchema(locale, [{ name: t.seo.breadcrumbHome, path: '/' }, { name: t.nav.pricing, path: '/pricing' }]),
            ]} />

            <section className="relative isolate overflow-hidden">
                <div className="aurora" />
                <div className="container-page animate-rise pb-16 pt-10 md:pt-14">
                    <Breadcrumbs label={m.labels.breadcrumb} items={[{ name: t.seo.breadcrumbHome, href: href('/') }, { name: t.nav.pricing }]} />
                    <div className="text-center">
                        <p className="eyebrow">{t.pricingPage.eyebrow}</p>
                        <h1 className="display mx-auto mt-5 max-w-3xl text-[2.6rem] sm:text-7xl">
                            {t.pricingPage.titleBefore} <span className="text-gradient">{t.pricingPage.titleAccent}</span>
                        </h1>
                        <p className="lead mx-auto mt-6 max-w-xl">{t.pricingPage.subtitle}</p>
                    </div>
                </div>
            </section>

            <section aria-label={t.pricingPage.plansLabel} className="container-page pb-20">
                <PlanCards locale={locale} headingLevel="h2" />
                <p className="mt-4 text-center text-sm text-ink-3">
                    {t.pricingPage.note}{' '}
                    <Link href={href('/how-to-pay')} className="link">{t.pricingPage.noteLink}</Link>.
                </p>
            </section>

            {/* Detailed comparison */}
            <section aria-labelledby="compare-plans" className="section border-t border-line bg-surface">
                <div className="container-page">
                    <h2 id="compare-plans" className="reveal h2 text-center">{m.pricing.compareTitle}</h2>
                    <div className="reveal scroll-thin mt-12 overflow-x-auto rounded-[1.5rem] border border-line">
                        <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
                            <thead>
                                <tr className="bg-surface-2/70">
                                    <th scope="col" className="px-6 py-4 font-semibold text-ink-2">{m.pricing.feature}</th>
                                    {TIERS.map((tier) => (
                                        <th key={tier} scope="col" className="px-6 py-4 text-center font-display text-base font-bold text-ink">{t.plans[tier].name}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {m.pricing.rows.map((row) => (
                                    <tr key={row.label} className="border-t border-line transition-colors hover:bg-surface-2/40">
                                        <th scope="row" className="px-6 py-4 font-medium text-ink">{row.label}</th>
                                        {row.values.map((value, index) => (
                                            <td key={TIERS[index]} className="px-6 py-4 text-center text-ink-2">
                                                {typeof value === 'string' ? (
                                                    <span className="font-semibold tabular-nums text-ink">{value}</span>
                                                ) : value ? (
                                                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-brand-soft text-brand">
                                                        <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden="true" />
                                                        <span className="sr-only">{m.pricing.included}</span>
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex text-ink-3">
                                                        <Minus className="h-4 w-4" aria-hidden="true" />
                                                        <span className="sr-only">{m.pricing.notIncluded}</span>
                                                    </span>
                                                )}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            <section aria-labelledby="pricing-faq" className="section">
                <div className="container-page grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
                    <div className="reveal">
                        <p className="eyebrow">{t.pricingPage.faqEyebrow}</p>
                        <h2 id="pricing-faq" className="h2 mt-5">{t.pricingPage.faqTitle}</h2>
                    </div>
                    <div className="reveal"><FaqList items={t.faq.pricing} /></div>
                </div>
            </section>

            <CtaBand
                title={t.home.ctaTitleBefore}
                accent={t.home.ctaTitleAccent}
                after={t.home.ctaTitleAfter}
                subtitle={t.home.ctaSubtitle}
                button={t.home.ctaButton}
                href={href('/workspace')}
            />
        </>
    );
}
