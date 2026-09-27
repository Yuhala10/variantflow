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

            <section className="container-page animate-rise pb-12 pt-14 md:pt-20">
                <p className="eyebrow">{copy.eyebrow}</p>
                <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-[-0.03em] text-ink sm:text-5xl">
                    {copy.titleBefore} <span className="font-display font-normal italic text-brand">{copy.titleAccent}</span> {copy.titleAfter}
                </h1>
                <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-2">{copy.subtitle}</p>
            </section>

            <section aria-label={copy.stepsLabel} className="container-page">
                <ol className="grid gap-5 md:grid-cols-3">
                    {copy.steps.map((step, index) => (
                        <li key={step.title} className="card p-7">
                            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-sm font-semibold text-on-brand">{index + 1}</span>
                            <h2 className="mt-5 text-lg font-semibold text-ink">{step.title}</h2>
                            <p className="mt-2 text-sm leading-relaxed text-ink-2">{step.text}</p>
                        </li>
                    ))}
                </ol>
            </section>

            <section className="container-page grid gap-5 py-16 lg:grid-cols-[1fr_1.1fr]">
                <div className="card p-7">
                    <h2 className="text-lg font-semibold text-ink">{copy.needsTitle}</h2>
                    <ul className="mt-5 space-y-4">
                        {copy.needs.map(({ title, text }, index) => {
                            const Icon = NEED_ICONS[index] ?? Wallet;
                            return (
                                <li key={title} className="flex gap-4">
                                    <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand-ink"><Icon className="h-5 w-5" aria-hidden="true" /></span>
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

                <div className="card p-7">
                    <h2 className="flex items-center gap-2 text-lg font-semibold text-ink">
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
