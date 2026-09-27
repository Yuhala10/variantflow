import Link from 'next/link';
import { ArrowRight, FileSpreadsheet, Layers, Tags } from 'lucide-react';
import { pageMetadata } from '../../../../lib/seo';
import { localePath } from '../../../../lib/i18n';
import { resolveLocale, type LocaleParams } from '../../../../lib/i18n/server';

export async function generateMetadata({ params }: LocaleParams) {
    const { locale, t } = await resolveLocale(params);
    return pageMetadata(locale, { title: t.seo.getStarted.title, description: t.seo.getStarted.description, path: '/app' });
}

const STEP_ICONS = [Layers, Tags, FileSpreadsheet];

export default async function GetStartedPage({ params }: LocaleParams) {
    const { locale, t } = await resolveLocale(params);
    const copy = t.getStarted;

    return (
        <section className="relative overflow-hidden">
            <div className="grid-backdrop pointer-events-none absolute inset-0 -z-10" />
            <div className="container-page grid items-center gap-12 py-16 md:py-24 lg:grid-cols-2">
                <div className="animate-rise space-y-7">
                    <p className="eyebrow">{copy.eyebrow}</p>
                    <h1 className="text-4xl font-semibold leading-[1.05] tracking-[-0.03em] text-ink sm:text-6xl">
                        {copy.titleBefore} <span className="font-display font-normal italic text-brand">{copy.titleAccent}</span>
                    </h1>
                    <p className="max-w-lg text-lg leading-relaxed text-ink-2">{copy.subtitle}</p>
                    <div className="flex flex-col gap-3 sm:flex-row">
                        <Link href={localePath(locale, '/workspace')} className="btn btn-primary btn-lg">{copy.enter} <ArrowRight /></Link>
                        <Link href={localePath(locale, '/auth?mode=signup')} className="btn btn-secondary btn-lg">{copy.create}</Link>
                    </div>
                </div>

                <ol className="card animate-rise divide-y divide-line p-2 [animation-delay:120ms]">
                    {copy.steps.map(({ title, text }, index) => {
                        const Icon = STEP_ICONS[index] ?? Layers;
                        return (
                            <li key={title} className="flex gap-4 p-5">
                                <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand-ink">
                                    <Icon className="h-5 w-5" aria-hidden="true" />
                                </span>
                                <div>
                                    <p className="text-xs font-medium text-ink-3">{copy.step({ n: index + 1 })}</p>
                                    <h2 className="text-base font-semibold text-ink">{title}</h2>
                                    <p className="mt-1 text-sm text-ink-2">{text}</p>
                                </div>
                            </li>
                        );
                    })}
                </ol>
            </div>
        </section>
    );
}
