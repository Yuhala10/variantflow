import Link from 'next/link';
import { ArrowRight, FileSpreadsheet, Layers, Tags } from 'lucide-react';
import { pageMetadata } from '../../../lib/seo';

export const metadata = pageMetadata({
    title: 'Get Started',
    description: 'Create a free VariantFlow account and build your first Shopify variant catalog in minutes.',
    path: '/app',
});

const STEPS = [
    { icon: Layers, title: 'Shape your catalog', text: 'Add product options like size, color and material.' },
    { icon: Tags, title: 'Automate the details', text: 'Set one SKU pattern and a few pricing rules.' },
    { icon: FileSpreadsheet, title: 'Export with confidence', text: 'Validate every row, then download your Shopify CSV.' },
];

export default function GetStartedPage() {
    return (
        <section className="relative overflow-hidden">
            <div className="grid-backdrop pointer-events-none absolute inset-0 -z-10" />
            <div className="container-page grid items-center gap-12 py-16 md:py-24 lg:grid-cols-2">
                <div className="animate-rise space-y-7">
                    <p className="eyebrow">Get started</p>
                    <h1 className="text-4xl font-semibold leading-[1.05] tracking-[-0.03em] text-ink sm:text-6xl">
                        Your catalog, <span className="font-display font-normal italic text-brand">in flow.</span>
                    </h1>
                    <p className="max-w-lg text-lg leading-relaxed text-ink-2">
                        Sign in to save your catalogs to your account and pick up where you left off on any device. Free up to 50 variants.
                    </p>
                    <div className="flex flex-col gap-3 sm:flex-row">
                        <Link href="/workspace" className="btn btn-primary btn-lg">Enter workspace <ArrowRight /></Link>
                        <Link href="/auth?mode=signup" className="btn btn-secondary btn-lg">Create free account</Link>
                    </div>
                </div>

                <ol className="card animate-rise divide-y divide-line p-2 [animation-delay:120ms]">
                    {STEPS.map(({ icon: Icon, title, text }, index) => (
                        <li key={title} className="flex gap-4 p-5">
                            <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand-ink">
                                <Icon className="h-5 w-5" aria-hidden="true" />
                            </span>
                            <div>
                                <p className="text-xs font-medium text-ink-3">Step {index + 1}</p>
                                <h2 className="text-base font-semibold text-ink">{title}</h2>
                                <p className="mt-1 text-sm text-ink-2">{text}</p>
                            </div>
                        </li>
                    ))}
                </ol>
            </div>
        </section>
    );
}
