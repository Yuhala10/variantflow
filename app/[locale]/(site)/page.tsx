import Link from 'next/link';
import { ArrowRight, Check, DollarSign, FileSpreadsheet, Layers, ScanSearch, Tags, UploadCloud } from 'lucide-react';
import { ProductPreview } from '../../../components/site/product-preview';
import { PlanCards } from '../../../components/site/plan-cards';
import { FaqList } from '../../../components/site/faq-list';
import { JsonLd, faqSchema, howToSchema, pageMetadata, softwareApplicationSchema } from '../../../lib/seo';
import { localePath } from '../../../lib/i18n';
import { resolveLocale, type LocaleParams } from '../../../lib/i18n/server';

export async function generateMetadata({ params }: LocaleParams) {
    const { locale, t } = await resolveLocale(params);
    return pageMetadata(locale, { title: t.seo.home.title, description: t.seo.home.description, path: '/', absoluteTitle: true });
}

const FEATURE_ICONS = [Layers, Tags, DollarSign, ScanSearch, FileSpreadsheet, UploadCloud];

export default async function HomePage({ params }: LocaleParams) {
    const { locale, t } = await resolveLocale(params);
    const href = (path: string) => localePath(locale, path);

    return (
        <>
            <JsonLd data={[softwareApplicationSchema(locale), faqSchema(t.faq.home, locale), howToSchema(locale, t.workflowSchemaName, t.workflow)]} />

            {/* Hero */}
            <section className="relative overflow-hidden">
                <div className="grid-backdrop pointer-events-none absolute inset-0 -z-10" />
                <div className="container-page grid items-center gap-14 pb-20 pt-12 md:pt-20 lg:grid-cols-[1fr_1.05fr] lg:gap-16 lg:pb-28">
                    <div className="animate-rise space-y-7">
                        <span className="chip border border-line bg-surface text-ink-2 shadow-xs">
                            <span className="h-1.5 w-1.5 rounded-full bg-brand" /> {t.home.badge}
                        </span>
                        <h1 className="text-[2.5rem] font-semibold leading-[1.05] tracking-[-0.035em] text-ink sm:text-6xl lg:text-[4rem]">
                            {t.home.titleBefore}{' '}
                            <span className="font-display text-[1.08em] font-normal italic tracking-[-0.01em] text-brand">{t.home.titleAccent}</span>{' '}
                            {t.home.titleAfter}
                        </h1>
                        <p className="max-w-xl text-lg leading-relaxed text-ink-2">{t.home.subtitle}</p>
                        <div className="flex flex-col gap-3 sm:flex-row">
                            <Link href={href('/workspace')} className="btn btn-primary btn-lg">{t.home.ctaPrimary} <ArrowRight /></Link>
                            <Link href={href('/#how-it-works')} className="btn btn-secondary btn-lg">{t.home.ctaSecondary}</Link>
                        </div>
                        <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-ink-3">
                            {t.home.trust.map((item) => (
                                <li key={item} className="inline-flex items-center gap-1.5"><Check className="h-4 w-4 text-brand" /> {item}</li>
                            ))}
                        </ul>
                    </div>
                    <div className="animate-rise [animation-delay:150ms]">
                        <ProductPreview locale={locale} />
                    </div>
                </div>
            </section>

            {/* Features */}
            <section id="features" aria-labelledby="features-title" className="border-t border-line bg-surface py-20 lg:py-28">
                <div className="container-page">
                    <div className="mx-auto max-w-2xl text-center">
                        <p className="eyebrow">{t.home.featuresEyebrow}</p>
                        <h2 id="features-title" className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">{t.home.featuresTitle}</h2>
                        <p className="mt-4 text-lg leading-relaxed text-ink-2">{t.home.featuresSubtitle}</p>
                    </div>
                    <div className="mt-14 grid gap-px overflow-hidden rounded-[1.375rem] border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
                        {t.home.features.map(({ title, text }, index) => {
                            const Icon = FEATURE_ICONS[index] ?? Layers;
                            return (
                                <article key={title} className="group bg-surface p-7 transition-colors hover:bg-canvas">
                                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-brand-ink transition-transform duration-300 group-hover:-translate-y-0.5">
                                        <Icon className="h-5 w-5" aria-hidden="true" />
                                    </span>
                                    <h3 className="mt-5 text-base font-semibold text-ink">{title}</h3>
                                    <p className="mt-2 text-sm leading-relaxed text-ink-2">{text}</p>
                                </article>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* How it works */}
            <section id="how-it-works" aria-labelledby="how-title" className="py-20 lg:py-28">
                <div className="container-page">
                    <div className="max-w-2xl">
                        <p className="eyebrow">{t.home.howEyebrow}</p>
                        <h2 id="how-title" className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">{t.home.howTitle}</h2>
                    </div>
                    <ol className="mt-12 grid gap-5 md:grid-cols-3">
                        {t.workflow.map((step, index) => (
                            <li key={step.title} className="card relative p-7">
                                <span className="font-display text-5xl italic leading-none text-brand/80">{index + 1}</span>
                                <h3 className="mt-5 text-lg font-semibold text-ink">{step.title}</h3>
                                <p className="mt-2 text-sm leading-relaxed text-ink-2">{step.text}</p>
                            </li>
                        ))}
                    </ol>
                </div>
            </section>

            {/* Pricing */}
            <section id="pricing" aria-labelledby="pricing-title" className="border-t border-line bg-surface py-20 lg:py-28">
                <div className="container-page">
                    <div className="mx-auto max-w-2xl text-center">
                        <p className="eyebrow">{t.home.pricingEyebrow}</p>
                        <h2 id="pricing-title" className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">{t.home.pricingTitle}</h2>
                        <p className="mt-4 text-lg leading-relaxed text-ink-2">{t.home.pricingSubtitle}</p>
                    </div>
                    <div className="mt-14"><PlanCards locale={locale} /></div>
                </div>
            </section>

            {/* FAQ */}
            <section id="faq" aria-labelledby="faq-title" className="py-20 lg:py-28">
                <div className="container-page grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
                    <div>
                        <p className="eyebrow">{t.home.faqEyebrow}</p>
                        <h2 id="faq-title" className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">{t.home.faqTitle}</h2>
                        <p className="mt-4 text-ink-2">{t.home.faqSubtitle}</p>
                    </div>
                    <FaqList items={t.faq.home} />
                </div>
            </section>

            {/* Final CTA */}
            <section className="pb-20 lg:pb-28">
                <div className="container-page">
                    <div className="relative overflow-hidden rounded-[1.75rem] bg-brand px-7 py-14 text-center text-on-brand shadow-xl sm:px-12 sm:py-20">
                        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_80%_at_50%_0%,rgb(255_255_255/0.16),transparent)]" />
                        <h2 className="relative mx-auto max-w-2xl text-3xl font-semibold tracking-tight sm:text-5xl">
                            {t.home.ctaTitleBefore} <span className="font-display font-normal italic">{t.home.ctaTitleAccent}</span> {t.home.ctaTitleAfter}
                        </h2>
                        <p className="relative mx-auto mt-4 max-w-lg text-lg opacity-85">{t.home.ctaSubtitle}</p>
                        <Link href={href('/workspace')} className="btn btn-lg relative mt-8 bg-surface text-ink shadow-lg hover:bg-canvas">
                            {t.home.ctaButton} <ArrowRight />
                        </Link>
                    </div>
                </div>
            </section>
        </>
    );
}
