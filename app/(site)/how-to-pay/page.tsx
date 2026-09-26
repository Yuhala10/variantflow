import Link from 'next/link';
import { AlertTriangle, ArrowRight, CheckCircle2, Mail, Smartphone, Wallet } from 'lucide-react';
import { JsonLd, breadcrumbSchema, howToSchema, pageMetadata } from '../../../lib/seo';

export const metadata = pageMetadata({
    title: 'How to Pay with USDT (TRC20)',
    description: 'Upgrade VariantFlow to Pro or Scale with USDT on the TRON network in three simple steps. Your plan activates automatically once the payment is confirmed.',
    path: '/how-to-pay',
});

const NEEDS = [
    { icon: Wallet, title: 'A wallet with USDT on TRON', text: 'Trust Wallet, TronLink, Binance, OKX or any wallet that supports TRC20.' },
    { icon: Mail, title: 'Your VariantFlow email', text: 'Enter it on the payment page so the plan reaches the right account.' },
    { icon: Smartphone, title: 'About two minutes', text: 'Most TRON payments confirm in under a minute.' },
];

const STEPS = [
    {
        title: 'Choose your plan',
        text: 'Open the workspace, tap Upgrade and pick Pro or Scale. You will be taken to a secure payment page with the exact amount.',
    },
    {
        title: 'Send USDT on TRON',
        text: 'On the payment page, scan the QR code or copy the address into your wallet and send the exact amount shown.',
    },
    {
        title: 'Your plan unlocks',
        text: 'As soon as the network confirms the payment, your plan activates automatically for 30 days. Refresh the workspace to see it.',
    },
];

const NOTES = [
    'Only send USDT on the TRON (TRC20) network. Do not use ERC-20, BEP-20 or other networks — those funds cannot be recovered.',
    'Send the exact amount shown on the payment page. A smaller amount will not activate your plan.',
    'Pay with the same email address you use to sign in, so the payment is matched to your account automatically.',
];

export default function HowToPayPage() {
    return (
        <>
            <JsonLd data={[
                howToSchema('How to pay for VariantFlow with USDT (TRC20)', STEPS),
                breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'How to pay', path: '/how-to-pay' }]),
            ]} />

            <section className="container-page animate-rise pb-12 pt-14 md:pt-20">
                <p className="eyebrow">Payments</p>
                <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-[-0.03em] text-ink sm:text-5xl">
                    Upgrade in three <span className="font-display font-normal italic text-brand">simple</span> steps
                </h1>
                <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-2">
                    VariantFlow accepts USDT on the TRON network — fast, low-fee and supported by every major mobile and desktop wallet.
                </p>
            </section>

            <section aria-label="Steps" className="container-page">
                <ol className="grid gap-5 md:grid-cols-3">
                    {STEPS.map((step, index) => (
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
                    <h2 className="text-lg font-semibold text-ink">What you&apos;ll need</h2>
                    <ul className="mt-5 space-y-4">
                        {NEEDS.map(({ icon: Icon, title, text }) => (
                            <li key={title} className="flex gap-4">
                                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand-ink"><Icon className="h-5 w-5" aria-hidden="true" /></span>
                                <div>
                                    <h3 className="text-[15px] font-semibold text-ink">{title}</h3>
                                    <p className="mt-0.5 text-sm leading-relaxed text-ink-2">{text}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                    <p className="mt-6 rounded-xl border border-line bg-surface-2 p-4 text-sm leading-relaxed text-ink-2">
                        The payment address and QR code are shown on the secure payment page for your order. Never send funds to an address from anywhere else.
                    </p>
                </div>

                <div className="card p-7">
                    <h2 className="flex items-center gap-2 text-lg font-semibold text-ink">
                        <AlertTriangle className="h-5 w-5 text-warn" aria-hidden="true" /> Before you send
                    </h2>
                    <ul className="mt-5 space-y-4">
                        {NOTES.map((note) => (
                            <li key={note} className="flex gap-3 text-[15px] leading-relaxed text-ink-2">
                                <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-brand" aria-hidden="true" /> {note}
                            </li>
                        ))}
                    </ul>
                    <div className="mt-7 flex flex-col gap-3 border-t border-line pt-6 sm:flex-row">
                        <Link href="/workspace" className="btn btn-primary">Open workspace <ArrowRight /></Link>
                        <Link href="/pricing" className="btn btn-secondary">Compare plans</Link>
                    </div>
                </div>
            </section>
        </>
    );
}
