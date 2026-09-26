import Link from 'next/link';
import { ArrowRight, Check, DollarSign, FileSpreadsheet, Layers, ScanSearch, Tags, UploadCloud } from 'lucide-react';
import { ProductPreview } from '../../components/site/product-preview';
import { PlanCards } from '../../components/site/plan-cards';
import { FaqList } from '../../components/site/faq-list';
import { HOME_FAQ, WORKFLOW_STEPS } from '../../lib/content';
import { JsonLd, faqSchema, howToSchema, pageMetadata, softwareApplicationSchema } from '../../lib/seo';
import { siteConfig } from '../../lib/site';

export const metadata = pageMetadata({
    title: `${siteConfig.name} — Shopify Variant Generator, SKU Builder & CSV Export`,
    description: siteConfig.description,
    path: '/',
    absoluteTitle: true,
});

const FEATURES = [
    {
        icon: Layers,
        title: 'Every combination, instantly',
        text: 'List your options once. VariantFlow generates every size, color and material combination as a clean, reviewable matrix.',
    },
    {
        icon: Tags,
        title: 'SKUs that follow your rules',
        text: 'One pattern like TSH-{COLOR}-{SIZE} creates a unique, consistent SKU for every variant — duplicates are flagged automatically.',
    },
    {
        icon: DollarSign,
        title: 'Pricing rules, not formulas',
        text: 'Set a base price and add rules like “XL +$2”. Every variant is priced correctly, and any row can still be adjusted by hand.',
    },
    {
        icon: ScanSearch,
        title: 'Mistakes caught before import',
        text: 'Real-time validation checks for duplicate SKUs, empty values and missing prices so Shopify imports succeed the first time.',
    },
    {
        icon: FileSpreadsheet,
        title: 'Shopify-ready CSV',
        text: 'Export a file in Shopify’s exact product CSV format — handles, options, SKUs and prices all in the right columns.',
    },
    {
        icon: UploadCloud,
        title: 'Import supplier catalogs',
        text: 'Paste a supplier CSV and VariantFlow maps the columns and cleans messy values for you. Available on Pro and Scale.',
    },
];

export default function HomePage() {
    return (
        <>
            <JsonLd data={[softwareApplicationSchema(), faqSchema(HOME_FAQ), howToSchema('How to create Shopify product variants with VariantFlow', WORKFLOW_STEPS)]} />

            {/* Hero */}
            <section className="relative overflow-hidden">
                <div className="grid-backdrop pointer-events-none absolute inset-0 -z-10" />
                <div className="container-page grid items-center gap-14 pb-20 pt-12 md:pt-20 lg:grid-cols-[1fr_1.05fr] lg:gap-16 lg:pb-28">
                    <div className="animate-rise space-y-7">
                        <span className="chip border border-line bg-surface text-ink-2 shadow-xs">
                            <span className="h-1.5 w-1.5 rounded-full bg-brand" /> Built for Shopify merchants
                        </span>
                        <h1 className="text-[2.6rem] font-semibold leading-[1.04] tracking-[-0.035em] text-ink sm:text-6xl lg:text-[4.1rem]">
                            Every product variant,{' '}
                            <span className="font-display text-[1.08em] font-normal italic tracking-[-0.01em] text-brand">perfectly</span>{' '}
                            organized.
                        </h1>
                        <p className="max-w-xl text-lg leading-relaxed text-ink-2">
                            Turn sizes, colors and materials into a complete catalog with consistent SKUs, correct prices and a
                            Shopify-ready CSV — in minutes, not spreadsheets.
                        </p>
                        <div className="flex flex-col gap-3 sm:flex-row">
                            <Link href="/workspace" className="btn btn-primary btn-lg">Start building free <ArrowRight /></Link>
                            <Link href="/#how-it-works" className="btn btn-secondary btn-lg">See how it works</Link>
                        </div>
                        <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-ink-3">
                            {['Free up to 50 variants', 'No card required', 'Works on any device'].map((item) => (
                                <li key={item} className="inline-flex items-center gap-1.5"><Check className="h-4 w-4 text-brand" /> {item}</li>
                            ))}
                        </ul>
                    </div>
                    <div className="animate-rise [animation-delay:150ms]">
                        <ProductPreview />
                    </div>
                </div>
            </section>

            {/* Features */}
            <section id="features" aria-labelledby="features-title" className="border-t border-line bg-surface py-20 lg:py-28">
                <div className="container-page">
                    <div className="mx-auto max-w-2xl text-center">
                        <p className="eyebrow">Features</p>
                        <h2 id="features-title" className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                            One calm workflow for your whole catalog
                        </h2>
                        <p className="mt-4 text-lg leading-relaxed text-ink-2">
                            Replace fragile spreadsheets with a tool built specifically for product variants.
                        </p>
                    </div>
                    <div className="mt-14 grid gap-px overflow-hidden rounded-[1.375rem] border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
                        {FEATURES.map(({ icon: Icon, title, text }) => (
                            <article key={title} className="group bg-surface p-7 transition-colors hover:bg-canvas">
                                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-brand-ink transition-transform duration-300 group-hover:-translate-y-0.5">
                                    <Icon className="h-5 w-5" aria-hidden="true" />
                                </span>
                                <h3 className="mt-5 text-base font-semibold text-ink">{title}</h3>
                                <p className="mt-2 text-sm leading-relaxed text-ink-2">{text}</p>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            {/* How it works */}
            <section id="how-it-works" aria-labelledby="how-title" className="py-20 lg:py-28">
                <div className="container-page">
                    <div className="max-w-2xl">
                        <p className="eyebrow">How it works</p>
                        <h2 id="how-title" className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                            From idea to import in three steps
                        </h2>
                    </div>
                    <ol className="mt-12 grid gap-5 md:grid-cols-3">
                        {WORKFLOW_STEPS.map((step, index) => (
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
                        <p className="eyebrow">Pricing</p>
                        <h2 id="pricing-title" className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                            Start free. Upgrade when you grow.
                        </h2>
                        <p className="mt-4 text-lg leading-relaxed text-ink-2">Simple monthly plans. No contracts.</p>
                    </div>
                    <div className="mt-14"><PlanCards /></div>
                </div>
            </section>

            {/* FAQ */}
            <section id="faq" aria-labelledby="faq-title" className="py-20 lg:py-28">
                <div className="container-page grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
                    <div>
                        <p className="eyebrow">FAQ</p>
                        <h2 id="faq-title" className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">Questions, answered</h2>
                        <p className="mt-4 text-ink-2">Everything you need to know before building your first catalog.</p>
                    </div>
                    <FaqList items={HOME_FAQ} />
                </div>
            </section>

            {/* Final CTA */}
            <section className="pb-20 lg:pb-28">
                <div className="container-page">
                    <div className="relative overflow-hidden rounded-[1.75rem] bg-brand px-7 py-14 text-center text-on-brand shadow-xl sm:px-12 sm:py-20">
                        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_80%_at_50%_0%,rgb(255_255_255/0.16),transparent)]" />
                        <h2 className="relative mx-auto max-w-2xl text-3xl font-semibold tracking-tight sm:text-5xl">
                            Your next catalog is <span className="font-display font-normal italic">five minutes</span> away.
                        </h2>
                        <p className="relative mx-auto mt-4 max-w-lg text-lg opacity-85">Build it free today. No card, no setup, no spreadsheets.</p>
                        <Link href="/workspace" className="btn btn-lg relative mt-8 bg-surface text-ink shadow-lg hover:bg-canvas">
                            Open the workspace <ArrowRight />
                        </Link>
                    </div>
                </div>
            </section>
        </>
    );
}
