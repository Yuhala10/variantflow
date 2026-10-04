import Link from 'next/link';
import { ArrowRight, BookOpen, Clock } from 'lucide-react';
import { Breadcrumbs } from '../../../../components/site/breadcrumbs';
import { JsonLd, breadcrumbSchema, itemListSchema, pageMetadata } from '../../../../lib/seo';
import { localePath } from '../../../../lib/i18n';
import { GUIDE_KEYS, guidePath } from '../../../../lib/i18n/routes';
import { resolveLocale, type LocaleParams } from '../../../../lib/i18n/server';
import { getGuide } from '../../../../lib/content/guides';
import { getMarketing } from '../../../../lib/content/marketing';

export async function generateMetadata({ params }: LocaleParams) {
    const { locale } = await resolveLocale(params);
    const m = getMarketing(locale);
    return pageMetadata(locale, { title: m.labels.guidesTitle, description: m.labels.guidesDescription, path: '/guides' });
}

export default async function GuidesPage({ params }: LocaleParams) {
    const { locale, t } = await resolveLocale(params);
    const m = getMarketing(locale);
    const href = (path: string) => localePath(locale, path);

    return (
        <>
            <JsonLd data={[
                breadcrumbSchema(locale, [{ name: t.seo.breadcrumbHome, path: '/' }, { name: m.labels.guides, path: '/guides' }]),
                itemListSchema(m.labels.guidesTitle, GUIDE_KEYS.map((key) => ({ name: getGuide(locale, key).title, url: href(guidePath(key, locale)) }))),
            ]} />

            <section className="relative isolate overflow-hidden">
                <div className="aurora" />
                <div className="container-page animate-rise pb-14 pt-10 md:pt-14">
                    <Breadcrumbs label={m.labels.breadcrumb} items={[{ name: t.seo.breadcrumbHome, href: href('/') }, { name: m.labels.guides }]} />
                    <p className="eyebrow"><BookOpen className="h-3.5 w-3.5" aria-hidden="true" /> {m.labels.guides}</p>
                    <h1 className="display mt-5 max-w-3xl text-[2.5rem] sm:text-6xl">{m.labels.guidesTitle}</h1>
                    <p className="lead mt-5 max-w-2xl">{m.labels.guidesIntro}</p>
                </div>
            </section>

            <section className="container-page pb-24">
                <ul className="grid gap-5 md:grid-cols-3">
                    {GUIDE_KEYS.map((key) => {
                        const guide = getGuide(locale, key);
                        return (
                            <li key={key} className="reveal">
                                <Link href={href(guidePath(key, locale))} className="card card-hover group flex h-full flex-col p-7">
                                    <span className="icon-tile tint-iris"><BookOpen className="h-5 w-5" aria-hidden="true" /></span>
                                    <h2 className="mt-5 text-xl font-bold leading-snug text-ink">{guide.title}</h2>
                                    <p className="mt-2.5 flex-1 text-[15px] leading-relaxed text-ink-2">{guide.description}</p>
                                    <span className="mt-6 flex items-center justify-between text-sm">
                                        <span className="inline-flex items-center gap-1.5 text-ink-3"><Clock className="h-3.5 w-3.5" aria-hidden="true" /> {m.labels.minutes(guide.minutes)}</span>
                                        <span className="inline-flex items-center gap-1.5 font-semibold text-brand">
                                            {m.labels.readGuide} <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                                        </span>
                                    </span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </section>
        </>
    );
}
