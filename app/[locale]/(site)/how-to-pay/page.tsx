import Link from 'next/link';
import { AlertTriangle, ArrowRight, CheckCircle2, Mail, Smartphone, Wallet } from 'lucide-react';
import { JsonLd, breadcrumbSchema, howToSchema, pageMetadata } from '../../../../lib/seo';
import { localePath } from '../../../../lib/i18n';
import { resolveLocale, type LocaleParams } from '../../../../lib/i18n/server';

export async function generateMetadata({ params }: LocaleParams) {
    const { locale, t } = await resolveLocale(params);
    return pageMetadata(locale, { title: t.seo.howToPay.title, description: t.seo.howToPay.description, path: '/how-to-pay' });
}

const NEED_ICONS = [Wallet, Mail, Smartphone];

export default async function HowToPayPage({ params }: LocaleParams) {
    const { locale, t } = await resolveLocale(params);
    const copy = t.howToPay;

    return (
        <>
            <JsonLd data={[
                howToSchema(locale, copy.schemaName, copy.steps),
                breadcrumbSchema(locale, [{ name: t.seo.breadcrumbHome, path: '/' }, { name: t.footer.howToPay, path: '/how-to-pay' }]),
            ]} />

            <section className="relative isolate overflow-hidden">
                <div className="aurora" />
                <div className="container-page animate-rise pb-14 pt-12 md:pt-16">
                <p className="eyebrow">{copy.eyebrow}</p>
                <h1 className="display mt-5 max-w-3xl text-[2.5rem] sm:text-6xl">
                    {copy.titleBefore} <span className="text-gradient">{copy.titleAccent}</span> {copy.titleAfter}
                </h1>
                <p className="lead mt-6 max-w-2xl">{copy.subtitle}</p>
                </div>
            </section>

            <section aria-label={copy.stepsLabel} className="container-page">
                <ol className="grid gap-5 md:grid-cols-3">
                    {copy.steps.map((step, index) => (
                        <li key={step.title} className="reveal card card-hover p-7 sm:p-8">
                            <span className="bg-gradient-brand inline-flex h-11 w-11 items-center justify-center rounded-2xl font-display text-lg font-extrabold text-white shadow-md">{index + 1}</span>
                            <h2 className="mt-6 text-xl font-bold text-ink">{step.title}</h2>
                            <p className="mt-2 text-sm leading-relaxed text-ink-2">{step.text}</p>
                        </li>
                    ))}
                </ol>
            </section>

            <section className="container-page grid gap-5 py-16 lg:grid-cols-[1fr_1.1fr]">
                <div className="reveal card p-7 sm:p-8">
                    <h2 className="text-xl font-bold text-ink">{copy.needsTitle}</h2>
                    <ul className="mt-5 space-y-4">
                        {copy.needs.map(({ title, text }, index) => {
                            const Icon = NEED_ICONS[index] ?? Wallet;
                            return (
                                <li key={title} className="flex gap-4">
                                    <span className="icon-tile tint-iris"><Icon className="h-5 w-5" aria-hidden="true" /></span>
                                    <div>
                                        <h3 className="text-[15px] font-semibold text-ink">{title}</h3>
                                        <p className="mt-0.5 text-sm leading-relaxed text-ink-2">{text}</p>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                    <p className="mt-6 rounded-xl border border-line bg-surface-2 p-4 text-sm leading-relaxed text-ink-2">{copy.safety}</p>
                </div>

                <div className="reveal card p-7 sm:p-8">
                    <h2 className="flex items-center gap-2 text-xl font-bold text-ink">
                        <AlertTriangle className="h-5 w-5 text-warn" aria-hidden="true" /> {copy.beforeTitle}
                    </h2>
                    <ul className="mt-5 space-y-4">
                        {copy.notes.map((note) => (
                            <li key={note} className="flex gap-3 text-[15px] leading-relaxed text-ink-2">
                                <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-brand" aria-hidden="true" /> {note}
                            </li>
                        ))}
                    </ul>
                    <div className="mt-7 flex flex-col gap-3 border-t border-line pt-6 sm:flex-row">
                        <Link href={localePath(locale, '/workspace')} className="btn btn-primary">{t.common.openWorkspace} <ArrowRight /></Link>
                        <Link href={localePath(locale, '/pricing')} className="btn btn-secondary">{copy.comparePlans}</Link>
                    </div>
                </div>
            </section>
        </>
    );
}
