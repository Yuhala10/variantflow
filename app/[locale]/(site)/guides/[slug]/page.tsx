import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, Clock } from 'lucide-react';
import { Breadcrumbs } from '../../../../../components/site/breadcrumbs';
import { FEATURE_META } from '../../../../../components/site/feature-visual';
import { JsonLd, articleSchema, breadcrumbSchema, pageMetadata } from '../../../../../lib/seo';
import { getDictionary, intlLocale, isLocale, localePath, locales, type Locale } from '../../../../../lib/i18n';
import { GUIDE_KEYS, GUIDE_SLUGS, guideKeyFromSlug, guidePath, landingPath, type GuideKey } from '../../../../../lib/i18n/routes';
import { GUIDE_DATES, getGuide } from '../../../../../lib/content/guides';
import { getLanding } from '../../../../../lib/content/landing';
import { getMarketing } from '../../../../../lib/content/marketing';
import { cn } from '../../../../../lib/utils';

type Params = { params: Promise<{ locale: string; slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
    return locales.flatMap((locale) => GUIDE_KEYS.map((key) => ({ locale, slug: GUIDE_SLUGS[key][locale] })));
}

async function resolve(params: Params['params']): Promise<{ locale: Locale; key: GuideKey }> {
    const { locale, slug } = await params;
    if (!isLocale(locale)) notFound();
    const key = guideKeyFromSlug(slug, locale);
    if (!key) notFound();
    return { locale, key };
}

const pathsFor = (key: GuideKey) => Object.fromEntries(locales.map((locale) => [locale, guidePath(key, locale)])) as Record<Locale, string>;

export async function generateMetadata({ params }: Params) {
    const { locale, key } = await resolve(params);
    const guide = getGuide(locale, key);
    return pageMetadata(locale, {
        title: guide.title,
        description: guide.description,
        path: guidePath(key, locale),
        paths: pathsFor(key),
        ogImage: `/og/${key}`,
        article: GUIDE_DATES[key],
    });
}

export default async function GuidePage({ params }: Params) {
    const { locale, key } = await resolve(params);
    const t = getDictionary(locale);
    const m = getMarketing(locale);
    const guide = getGuide(locale, key);
    const dates = GUIDE_DATES[key];
    const href = (path: string) => localePath(locale, path);
    const path = guidePath(key, locale);
    const related = getLanding(locale, guide.related);
    const relatedMeta = FEATURE_META[guide.related];
    const updated = new Intl.DateTimeFormat(intlLocale[locale], { dateStyle: 'long' }).format(new Date(dates.modified));
    const others = GUIDE_KEYS.filter((other) => other !== key);

    return (
        <>
            <JsonLd data={[
                articleSchema(locale, { title: guide.title, description: guide.description, path, published: dates.published, modified: dates.modified, image: `/og/${key}` }),
                breadcrumbSchema(locale, [
                    { name: t.seo.breadcrumbHome, path: '/' },
                    { name: m.labels.guides, path: '/guides' },
                    { name: guide.title, path },
                ]),
            ]} />

            <article>
                <header className="relative isolate overflow-hidden">
                    <div className="aurora" />
                    <div className="container-page animate-rise max-w-6xl pb-12 pt-10 md:pt-14">
                        <div className="max-w-3xl">
                        <Breadcrumbs
                            label={m.labels.breadcrumb}
                            items={[{ name: t.seo.breadcrumbHome, href: href('/') }, { name: m.labels.guides, href: href('/guides') }, { name: guide.title }]}
                        />
                        <h1 className="display text-[2.25rem] sm:text-5xl lg:text-[3.4rem]">{guide.title}</h1>
                        <p className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-3">
                            <span className="inline-flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" aria-hidden="true" /> {m.labels.minutes(guide.minutes)}</span>
                            <time dateTime={dates.modified}>{m.labels.updated(updated)}</time>
                        </p>
                        <p className="lead mt-6">{guide.intro}</p>
                        </div>
                    </div>
                </header>

                <div className="container-page grid max-w-6xl gap-12 pb-24 lg:grid-cols-[1fr_17rem]">
                    <div className="prose-page min-w-0 max-w-3xl">
                        {guide.sections.map((section, index) => (
                            <section key={section.heading} id={`section-${index + 1}`} className="scroll-mt-24">
                                <h2 className={cn(index === 0 && '!mt-0')}>{section.heading}</h2>
                                {section.list && (section.list.ordered
                                    ? <ol>{section.list.items.map((item) => <li key={item}>{item}</li>)}</ol>
                                    : <ul>{section.list.items.map((item) => <li key={item}>{item}</li>)}</ul>)}
                                {section.paragraphs?.map((paragraph, paragraphIndex) => (
                                    <p key={paragraph} className={cn(section.list && paragraphIndex === 0 && 'mt-4')}>{paragraph}</p>
                                ))}
                            </section>
                        ))}

                        <aside className={cn('ring-gradient mt-12 flex flex-col gap-5 rounded-[1.5rem] p-6 sm:flex-row sm:items-center sm:p-7', relatedMeta.tint)}>
                            <span className="icon-tile"><relatedMeta.icon className="h-5 w-5" aria-hidden="true" /></span>
                            <div className="min-w-0 flex-1">
                                <p className="font-display text-lg font-bold text-ink">{m.labels.tryIt}</p>
                                <p className="mt-1 !text-sm !leading-relaxed text-ink-2">{related.intro}</p>
                            </div>
                            <Link href={href(landingPath(guide.related, locale))} className="btn btn-primary shrink-0">{related.nav} <ArrowRight /></Link>
                        </aside>
                    </div>

                    <aside className="hidden lg:block">
                        <nav aria-label={m.labels.onThisPage} className="sticky top-24 space-y-8">
                            <div>
                                <p className="mb-3 text-xs font-bold uppercase tracking-[0.08em] text-ink-3">{m.labels.onThisPage}</p>
                                <ul className="space-y-2.5 border-l border-line">
                                    {guide.sections.map((section, index) => (
                                        <li key={section.heading}>
                                            <a href={`#section-${index + 1}`} className="-ml-px block border-l border-transparent pl-4 text-sm leading-snug text-ink-2 transition-colors hover:border-brand hover:text-brand">{section.heading}</a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <p className="mb-3 text-xs font-bold uppercase tracking-[0.08em] text-ink-3">{m.labels.guides}</p>
                                <ul className="space-y-2.5">
                                    {others.map((other) => (
                                        <li key={other}>
                                            <Link href={href(guidePath(other, locale))} className="text-sm leading-snug text-ink-2 transition-colors hover:text-brand">{getGuide(locale, other).title}</Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </nav>
                    </aside>
                </div>
            </article>
        </>
    );
}
