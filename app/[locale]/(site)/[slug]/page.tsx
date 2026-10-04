import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { Breadcrumbs } from '../../../../components/site/breadcrumbs';
import { FEATURE_META, FeatureVisual } from '../../../../components/site/feature-visual';
import { FaqList } from '../../../../components/site/faq-list';
import { CtaBand } from '../../../../components/site/cta-band';
import { JsonLd, breadcrumbSchema, faqSchema, howToSchema, pageMetadata, webPageSchema } from '../../../../lib/seo';
import { getDictionary, isLocale, localePath, locales, type Locale } from '../../../../lib/i18n';
import { LANDING_KEYS, LANDING_SLUGS, landingKeyFromSlug, landingPath, type LandingKey } from '../../../../lib/i18n/routes';
import { getLanding } from '../../../../lib/content/landing';
import { getMarketing } from '../../../../lib/content/marketing';
import { cn } from '../../../../lib/utils';

type Params = { params: Promise<{ locale: string; slug: string }> };

// Only the known feature pages exist; anything else is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
    return locales.flatMap((locale) => LANDING_KEYS.map((key) => ({ locale, slug: LANDING_SLUGS[key][locale] })));
}

async function resolve(params: Params['params']): Promise<{ locale: Locale; key: LandingKey }> {
    const { locale, slug } = await params;
    if (!isLocale(locale)) notFound();
    const key = landingKeyFromSlug(slug, locale);
    if (!key) notFound();
    return { locale, key };
}

const pathsFor = (key: LandingKey) => Object.fromEntries(locales.map((locale) => [locale, landingPath(key, locale)])) as Record<Locale, string>;

export async function generateMetadata({ params }: Params) {
    const { locale, key } = await resolve(params);
    const page = getLanding(locale, key);
    return pageMetadata(locale, {
        title: page.title,
        description: page.description,
        path: landingPath(key, locale),
        paths: pathsFor(key),
        absoluteTitle: true,
        ogImage: `/og/${key}`,
    });
}

export default async function LandingPage({ params }: Params) {
    const { locale, key } = await resolve(params);
    const t = getDictionary(locale);
    const m = getMarketing(locale);
    const page = getLanding(locale, key);
    const { icon: Icon, tint } = FEATURE_META[key];
    const href = (path: string) => localePath(locale, path);
    const path = landingPath(key, locale);
    const related = LANDING_KEYS.filter((other) => other !== key).slice(0, 6);

    return (
        <>
            <JsonLd data={[
                webPageSchema(locale, { name: page.title, description: page.description, path }),
                faqSchema(page.faq, locale),
                howToSchema(locale, `${page.h1} ${page.h1Accent}`, page.steps),
                breadcrumbSchema(locale, [{ name: t.seo.breadcrumbHome, path: '/' }, { name: page.nav, path }]),
            ]} />

            {/* Hero */}
            <section className={cn('relative isolate overflow-hidden', tint)}>
                <div className="aurora" />
                <div className="container-page grid items-center gap-12 pb-20 pt-10 md:pt-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14 lg:pb-28">
                    <div className="animate-rise">
                        <Breadcrumbs label={m.labels.breadcrumb} items={[{ name: t.seo.breadcrumbHome, href: href('/') }, { name: page.nav }]} />
                        <p className="eyebrow"><Icon className="h-3.5 w-3.5" aria-hidden="true" /> {page.eyebrow}</p>
                        <h1 className="display mt-5 text-[2.5rem] sm:text-6xl lg:text-[3.9rem]">
                            {page.h1} <span className="text-gradient">{page.h1Accent}</span>
                        </h1>
                        <p className="lead mt-6 max-w-xl">{page.intro}</p>
                        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                            <Link href={href('/workspace')} className="btn btn-primary btn-lg">{page.cta} <ArrowRight /></Link>
                            <Link href={href('/pricing')} className="btn btn-secondary btn-lg">{t.nav.pricing}</Link>
                        </div>
                    </div>
                    <div className="animate-rise [animation-delay:150ms]">
                        <div className="card relative flex min-h-72 items-center justify-center overflow-hidden bg-[color-mix(in_oklab,var(--tint-bg)_60%,var(--surface))] p-8 shadow-xl sm:min-h-80">
                            <div className="scale-110 sm:scale-125"><FeatureVisual kind={key} locale={locale} /></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Benefits */}
            <section aria-label={m.labels.features} className="section border-t border-line bg-surface">
                <div className="container-page grid gap-5 md:grid-cols-3">
                    {page.benefits.map((benefit, index) => (
                        <article key={benefit.title} className={cn('reveal card card-hover p-7 sm:p-8', tint)}>
                            <span className="icon-tile font-display text-base font-extrabold">{index + 1}</span>
                            <h2 className="mt-5 text-xl font-bold text-ink">{benefit.title}</h2>
                            <p className="mt-2.5 text-[15px] leading-relaxed text-ink-2">{benefit.text}</p>
                        </article>
                    ))}
                </div>
            </section>

            {/* Steps */}
            <section aria-labelledby="steps-title" className="section">
                <div className="container-page">
                    <div className="reveal max-w-2xl">
                        <p className="eyebrow">{m.labels.howItWorks}</p>
                        <h2 id="steps-title" className="h2 mt-5">{t.home.howTitle}</h2>
                    </div>
                    <ol className="relative mt-12 grid gap-5 md:grid-cols-3">
                        <div aria-hidden="true" className="bg-gradient-brand absolute left-[16%] right-[16%] top-11 hidden h-px opacity-40 md:block" />
                        {page.steps.map((step, index) => (
                            <li key={step.title} className="reveal card relative p-7 sm:p-8">
                                <span className="bg-gradient-brand inline-flex h-11 w-11 items-center justify-center rounded-2xl font-display text-lg font-extrabold text-white shadow-md">{index + 1}</span>
                                <h3 className="mt-6 text-xl font-bold text-ink">{step.title}</h3>
                                <p className="mt-2.5 text-[15px] leading-relaxed text-ink-2">{step.text}</p>
                            </li>
                        ))}
                    </ol>
                </div>
            </section>

            {/* FAQ */}
            <section aria-labelledby="faq-title" className="section border-t border-line bg-surface">
                <div className="container-page grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
                    <div className="reveal">
                        <p className="eyebrow">{t.home.faqEyebrow}</p>
                        <h2 id="faq-title" className="h2 mt-5">{m.labels.faq}</h2>
                    </div>
                    <div className="reveal"><FaqList items={page.faq} /></div>
                </div>
            </section>

            {/* Related features */}
            <section aria-labelledby="related-title" className="section">
                <div className="container-page">
                    <h2 id="related-title" className="reveal h2">{m.labels.related}</h2>
                    <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {related.map((other) => {
                            const meta = FEATURE_META[other];
                            const copy = getLanding(locale, other);
                            return (
                                <li key={other} className="reveal">
                                    <Link href={href(landingPath(other, locale))} className={cn('card card-hover group flex h-full items-start gap-4 p-5', meta.tint)}>
                                        <span className="icon-tile"><meta.icon className="h-5 w-5" aria-hidden="true" /></span>
                                        <span className="min-w-0">
                                            <span className="flex items-center gap-1.5 font-semibold text-ink">
                                                {copy.nav} <ArrowRight className="h-3.5 w-3.5 text-ink-3 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-brand" />
                                            </span>
                                            <span className="mt-1 line-clamp-2 block text-sm leading-relaxed text-ink-2">{copy.intro}</span>
                                        </span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </section>

            <CtaBand
                title={t.home.ctaTitleBefore}
                accent={t.home.ctaTitleAccent}
                after={t.home.ctaTitleAfter}
                subtitle={t.home.ctaSubtitle}
                button={page.cta}
                href={href('/workspace')}
            />
        </>
    );
}
