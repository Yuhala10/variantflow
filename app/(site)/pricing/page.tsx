import Link from 'next/link';
import { PlanCards } from '../../../components/site/plan-cards';
import { FaqList } from '../../../components/site/faq-list';
import { PRICING_FAQ } from '../../../lib/content';
import { JsonLd, breadcrumbSchema, faqSchema, pageMetadata, softwareApplicationSchema } from '../../../lib/seo';

export const metadata = pageMetadata({
    title: 'Pricing — Free, Pro & Scale Plans',
    description: 'Start free with up to 50 variants per export. Upgrade to Pro ($19/mo) or Scale ($49/mo) for unlimited variants, CSV import, column mapping and supplier cleanup.',
    path: '/pricing',
});

export default function PricingPage() {
    return (
        <>
            <JsonLd data={[
                softwareApplicationSchema(),
                faqSchema(PRICING_FAQ),
                breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Pricing', path: '/pricing' }]),
            ]} />

            <section className="relative overflow-hidden">
                <div className="grid-backdrop pointer-events-none absolute inset-0 -z-10" />
                <div className="container-page animate-rise pb-14 pt-14 text-center md:pt-20">
                    <p className="eyebrow">Pricing</p>
                    <h1 className="mx-auto mt-3 max-w-3xl text-4xl font-semibold tracking-[-0.03em] text-ink sm:text-6xl">
                        Simple plans that grow <span className="font-display font-normal italic text-brand">with you</span>
                    </h1>
                    <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-ink-2">
                        Start free and upgrade only when your catalog needs more. Every plan includes the full variant, SKU and validation workflow.
                    </p>
                </div>
            </section>

            <section aria-label="Plans" className="container-page pb-20">
                <PlanCards headingLevel="h2" />
                <p className="mt-8 text-center text-sm text-ink-3">
                    Paid plans are billed monthly in USDT (TRC20). <Link href="/how-to-pay" className="font-medium text-brand underline-offset-4 hover:underline">See how payment works</Link>.
                </p>
            </section>

            <section aria-labelledby="pricing-faq" className="border-t border-line bg-surface py-20">
                <div className="container-page grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
                    <div>
                        <p className="eyebrow">Billing FAQ</p>
                        <h2 id="pricing-faq" className="mt-3 text-3xl font-semibold tracking-tight text-ink">Billing questions</h2>
                    </div>
                    <FaqList items={PRICING_FAQ} />
                </div>
            </section>
        </>
    );
}
