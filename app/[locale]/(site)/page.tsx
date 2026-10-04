import Link from 'next/link';
import { ArrowRight, BookOpen, Check, X } from 'lucide-react';
import { HeroDemo } from '../../../components/site/hero-demo';
import { FEATURE_META, FeatureVisual } from '../../../components/site/feature-visual';
import { PlanCards } from '../../../components/site/plan-cards';
import { FaqList } from '../../../components/site/faq-list';
import { CtaBand } from '../../../components/site/cta-band';
import { JsonLd, faqSchema, howToSchema, itemListSchema, pageMetadata, softwareApplicationSchema } from '../../../lib/seo';
import { localePath } from '../../../lib/i18n';
import { GUIDE_KEYS, guidePath, landingPath, type LandingKey } from '../../../lib/i18n/routes';
import { resolveLocale, type LocaleParams } from '../../../lib/i18n/server';
import { getMarketing } from '../../../lib/content/marketing';
import { getGuide } from '../../../lib/content/guides';
import { cn } from '../../../lib/utils';

export async function generateMetadata({ params }: LocaleParams) {
    const { locale, t } = await resolveLocale(params);
    return pageMetadata(locale, { title: t.seo.home.title, description: t.seo.home.description, path: '/', absoluteTitle: true });
}

// The six home features, in dictionary order, and the landing page each one links to.
const FEATURE_KEYS: LandingKey[] = ['variant-generator', 'sku-generator', 'pricing-rules', 'validation', 'shopify-csv', 'supplier-import'];
// Display order and width in the bento grid (the export card closes the grid, full width).
const BENTO: Array<{ index: number; span: string; wide?: boolean }> = [
    { index: 0, span: 'lg:col-span-3' },
    { index: 1, span: 'lg:col-span-3' },
    { index: 2, span: 'lg:col-span-2' },
    { index: 3, span: 'lg:col-span-2' },
    { index: 5, span: 'lg:col-span-2' },
    { index: 4, span: 'lg:col-span-6', wide: true },
];

export default async function HomePage({ params }: LocaleParams) {
    const { locale, t } = await resolveLocale(params);
    const m = getMarketing(locale);
    const href = (path: string) => localePath(locale, path);
    const money = (amount: string) => t.preview.money({ amount });

    return (
        <>
            <JsonLd data={[
                softwareApplicationSchema(locale),
                faqSchema(t.faq.home, locale),
                howToSchema(locale, t.workflowSchemaName, t.workflow),
                itemListSchema(t.home.featuresTitle, FEATURE_KEYS.map((key, index) => ({ name: t.home.features[index].title, url: href(landingPath(key, locale)) }))),
            ]} />

            {/* Hero */}
            <section className="relative isolate overflow-hidden">
                <div className="aurora" />
                <div className="grid-backdrop pointer-events-none absolute inset-0 -z-10 opacity-70" />
                <div className="container-page grid items-center gap-16 pb-24 pt-10 md:pt-16 lg:grid-cols-[1fr_1.06fr] lg:gap-12 lg:pb-32">
                    <div className="animate-rise">
                        <h1>
                            <span className="mb-6 flex">
                                <span className="eyebrow"><span className="h-1.5 w-1.5 rounded-full bg-brand" /> {m.home.kicker}</span>
                            </span>
                            <span className="display block text-[2.9rem] sm:text-7xl lg:text-[4.6rem]">
                                {m.home.headline} <span className="text-gradient">{m.home.headlineAccent}</span>
                            </span>
                        </h1>
                        <p className="lead mt-6 max-w-xl">{t.home.subtitle}</p>
                        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                            <Link href={href('/workspace')} className="btn btn-primary btn-lg">{t.home.ctaPrimary} <ArrowRight /></Link>
                            <Link href={href('/#how-it-works')} className="btn btn-secondary btn-lg">{t.home.ctaSecondary}</Link>
                        </div>
                        <ul className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-sm text-ink-2">
                            {t.home.trust.map((item) => (
                                <li key={item} className="inline-flex items-center gap-1.5">
                                    <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-success-soft text-success"><Check className="h-2.5 w-2.5" strokeWidth={3.5} /></span> {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="animate-rise [animation-delay:160ms]">
                        <HeroDemo
                            labels={{
                                productTitle: t.preview.window,
                                options: t.workspace.options.options,
                                color: t.preview.color,
                                size: t.preview.size,
                                colors: t.preview.colors,
                                skuPattern: t.preview.skuPattern,
                                pattern: t.preview.pattern,
                                priceRule: t.preview.priceRule,
                                priceRuleValue: `XL · +${money(locale === 'fr' ? '2,00' : '2.00')}`,
                                checking: m.home.demoChecking,
                                allValid: t.preview.allValid,
                                exportCsv: t.preview.exportCsv,
                                sku: t.preview.sku,
                                price: t.preview.price,
                                rows: t.preview.rows,
                                prices: t.preview.rows.map((row) => money(row[3])),
                                exported: t.workspace.notices.downloaded({ count: 12, format: t.workspace.exportMenu.formats.shopify.name }),
                            }}
                        />
                    </div>
                </div>

                {/* Platforms and facts */}
                <div className="container-page pb-20">
                    <div className="reveal card grid divide-y divide-line overflow-hidden sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
                        {m.home.facts.map((fact) => (
                            <div key={fact.label} className="flex items-baseline gap-3 px-6 py-5 sm:block sm:py-7">
                                <p className="text-gradient font-display text-4xl font-extrabold tracking-[-0.04em] sm:text-5xl">{fact.value}</p>
                                <p className="text-sm text-ink-2 sm:mt-1.5">{fact.label}</p>
                            </div>
                        ))}
                    </div>
                    <p className="mt-6 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-sm text-ink-3">
                        {m.home.worksWith}
                        {m.home.platforms.map((platform) => <span key={platform} className="chip border border-line bg-surface text-ink-2 shadow-xs">{platform}</span>)}
                    </p>
                </div>
            </section>

            {/* Features */}
            <section id="features" aria-labelledby="features-title" className="section border-t border-line bg-surface">
                <div className="container-page">
                    <div className="reveal mx-auto max-w-2xl text-center">
                        <p className="eyebrow">{t.home.featuresEyebrow}</p>
                        <h2 id="features-title" className="h2 mt-5">{t.home.featuresTitle}</h2>
                        <p className="lead mt-4">{t.home.featuresSubtitle}</p>
                    </div>
                    <div className="mt-14 grid gap-5 lg:grid-cols-6">
                        {BENTO.map(({ index, span, wide }) => {
                            const key = FEATURE_KEYS[index];
                            const { icon: Icon, tint } = FEATURE_META[key];
                            const feature = t.home.features[index];
                            return (
                                <article key={key} className={cn('reveal card card-hover group flex overflow-hidden', tint, span, wide ? 'flex-col lg:flex-row' : 'flex-col')}>
                                    <div className={cn('flex items-center justify-center bg-[color-mix(in_oklab,var(--tint-bg)_65%,var(--surface))] p-6', wide ? 'min-h-40 lg:w-1/2' : 'min-h-52')}>
                                        <FeatureVisual kind={key} locale={locale} />
                                    </div>
                                    <div className={cn('flex flex-1 flex-col p-6 sm:p-7', wide && 'lg:justify-center')}>
                                        <span className="icon-tile mb-4 h-10 w-10 rounded-xl"><Icon className="h-5 w-5" aria-hidden="true" /></span>
                                        <h3 className="text-lg font-bold text-ink">{feature.title}</h3>
                                        <p className="mt-2 text-[15px] leading-relaxed text-ink-2">{feature.text}</p>
                                        <Link href={href(landingPath(key, locale))} className="link mt-4 inline-flex items-center gap-1.5 self-start text-sm">
                                            {m.home.bento.learnMore}<span className="sr-only">: {feature.title}</span> <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                                        </Link>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Before / after */}
            <section aria-labelledby="compare-title" className="section relative isolate overflow-hidden">
                <div className="container-page">
                    <div className="reveal max-w-2xl">
                        <p className="eyebrow">{m.home.compare.eyebrow}</p>
                        <h2 id="compare-title" className="h2 mt-5">{m.home.compare.title}</h2>
                        <p className="lead mt-4">{m.home.compare.subtitle}</p>
                    </div>
                    <div className="mt-12 grid gap-5 lg:grid-cols-2">
                        <div className="reveal rounded-[1.75rem] border border-dashed border-line-strong bg-surface-2/50 p-7 sm:p-9">
                            <h3 className="text-lg font-bold text-ink-2">{m.home.compare.beforeTitle}</h3>
                            <ul className="mt-6 space-y-4">
                                {m.home.compare.before.map((item) => (
                                    <li key={item} className="flex items-start gap-3 text-[15px] text-ink-3">
                                        <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-danger-soft text-danger"><X className="h-3 w-3" strokeWidth={3} aria-hidden="true" /></span>
                                        <span className="line-through decoration-line-strong">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="reveal ring-gradient rounded-[1.75rem] p-7 shadow-[0_30px_70px_-34px_color-mix(in_oklab,var(--brand)_60%,transparent)] sm:p-9">
                            <h3 className="text-lg font-bold text-ink">{m.home.compare.afterTitle}</h3>
                            <ul className="mt-6 space-y-4">
                                {m.home.compare.after.map((item) => (
                                    <li key={item} className="flex items-start gap-3 text-[15px] font-medium text-ink">
                                        <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success text-surface"><Check className="h-3 w-3" strokeWidth={3} aria-hidden="true" /></span>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* How it works */}
            <section id="how-it-works" aria-labelledby="how-title" className="section border-t border-line bg-surface">
                <div className="container-page">
                    <div className="reveal mx-auto max-w-2xl text-center">
                        <p className="eyebrow">{t.home.howEyebrow}</p>
                        <h2 id="how-title" className="h2 mt-5">{t.home.howTitle}</h2>
                    </div>
                    <ol className="relative mt-14 grid gap-5 md:grid-cols-3">
                        <div aria-hidden="true" className="bg-gradient-brand absolute left-[16%] right-[16%] top-11 hidden h-px opacity-40 md:block" />
                        {t.workflow.map((step, index) => (
                            <li key={step.title} className="reveal card relative p-7 sm:p-8">
                                <span className="bg-gradient-brand inline-flex h-11 w-11 items-center justify-center rounded-2xl font-display text-lg font-extrabold text-white shadow-md">{index + 1}</span>
                                <h3 className="mt-6 text-xl font-bold text-ink">{step.title}</h3>
                                <p className="mt-2.5 text-[15px] leading-relaxed text-ink-2">{step.text}</p>
                            </li>
                        ))}
                    </ol>
                </div>
            </section>

            {/* Pricing */}
            <section id="pricing" aria-labelledby="pricing-title" className="section relative isolate overflow-hidden">
                <div className="container-page">
                    <div className="reveal mx-auto max-w-2xl text-center">
                        <p className="eyebrow">{t.home.pricingEyebrow}</p>
                        <h2 id="pricing-title" className="h2 mt-5">{t.home.pricingTitle}</h2>
                        <p className="lead mt-4">{t.home.pricingSubtitle}</p>
                    </div>
                    <div className="mt-16"><PlanCards locale={locale} /></div>
                </div>
            </section>

            {/* Guides */}
            <section aria-labelledby="guides-title" className="section border-t border-line bg-surface">
                <div className="container-page">
                    <div className="reveal flex flex-wrap items-end justify-between gap-6">
                        <div className="max-w-2xl">
                            <p className="eyebrow">{m.home.guides.eyebrow}</p>
                            <h2 id="guides-title" className="h2 mt-5">{m.home.guides.title}</h2>
                            <p className="lead mt-4">{m.home.guides.subtitle}</p>
                        </div>
                        <Link href={href('/guides')} className="btn btn-secondary">{m.home.guides.all} <ArrowRight /></Link>
                    </div>
                    <div className="mt-12 grid gap-5 md:grid-cols-3">
                        {GUIDE_KEYS.map((key) => {
                            const guide = getGuide(locale, key);
                            return (
                                <Link key={key} href={href(guidePath(key, locale))} className="reveal card card-hover group flex flex-col p-7">
                                    <span className="icon-tile tint-iris"><BookOpen className="h-5 w-5" aria-hidden="true" /></span>
                                    <h3 className="mt-5 text-lg font-bold leading-snug text-ink">{guide.title}</h3>
                                    <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-2">{guide.description}</p>
                                    <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand">
                                        {m.labels.readGuide} <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                                    </span>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section id="faq" aria-labelledby="faq-title" className="section">
                <div className="container-page grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
                    <div className="reveal lg:sticky lg:top-28 lg:self-start">
                        <p className="eyebrow">{t.home.faqEyebrow}</p>
                        <h2 id="faq-title" className="h2 mt-5">{t.home.faqTitle}</h2>
                        <p className="lead mt-4">{t.home.faqSubtitle}</p>
                    </div>
                    <div className="reveal"><FaqList items={t.faq.home} /></div>
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
