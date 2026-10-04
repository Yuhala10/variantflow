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
const TINTS = ['tint-iris', 'tint-violet', 'tint-sky'];

export default async function GetStartedPage({ params }: LocaleParams) {
    const { locale, t } = await resolveLocale(params);
    const copy = t.getStarted;

    return (
        <section className="relative isolate overflow-hidden">
            <div className="aurora" />
            <div className="container-page grid items-center gap-12 py-16 md:py-24 lg:grid-cols-2">
                <div className="animate-rise space-y-7">
                    <p className="eyebrow">{copy.eyebrow}</p>
                    <h1 className="display text-[2.6rem] sm:text-7xl">
                        {copy.titleBefore} <span className="text-gradient">{copy.titleAccent}</span>
                    </h1>
                    <p className="lead max-w-lg">{copy.subtitle}</p>
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
                                <span className={`icon-tile ${TINTS[index] ?? "tint-iris"}`}>
                                    <Icon className="h-5 w-5" aria-hidden="true" />
                                </span>
                                <div>
                                    <p className="text-xs font-medium text-ink-3">{copy.step({ n: index + 1 })}</p>
                                    <h2 className="text-lg font-bold text-ink">{title}</h2>
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
