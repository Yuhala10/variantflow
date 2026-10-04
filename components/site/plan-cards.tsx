import Link from 'next/link';
import { ArrowRight, Check, Minus } from 'lucide-react';
import { BILLING_PLANS, SubscriptionTier } from '../../types';
import { getDictionary, localePath, type Locale } from '../../lib/i18n';
import { cn } from '../../lib/utils';

const RECOMMENDED: SubscriptionTier = 'PRO';
const TIERS: SubscriptionTier[] = ['FREE', 'PRO', 'SCALE'];

export function PlanCards({ locale, headingLevel = 'h3' }: { locale: Locale; headingLevel?: 'h2' | 'h3' }) {
    const Heading = headingLevel;
    const t = getDictionary(locale);

    return (
        <>
            <div className="grid items-stretch gap-5 lg:grid-cols-3">
                {TIERS.map((tier) => {
                    const plan = BILLING_PLANS[tier];
                    const copy = t.plans[tier];
                    const recommended = tier === RECOMMENDED;
                    return (
                        <article
                            key={tier}
                            className={cn(
                                'reveal relative flex flex-col rounded-[1.75rem] p-7 sm:p-8',
                                recommended
                                    ? 'ring-gradient shadow-[0_30px_70px_-30px_color-mix(in_oklab,var(--brand)_55%,transparent)] lg:-my-3 lg:py-11'
                                    : 'card card-hover',
                            )}
                        >
                            {recommended && <span className="chip bg-gradient-brand absolute -top-3 left-8 px-3 py-1 text-white shadow-md">{t.common.mostPopular}</span>}
                            <Heading className="text-xl font-bold text-ink">{copy.name}</Heading>
                            <p className="mt-1.5 min-h-[2.75rem] text-sm leading-relaxed text-ink-2">{copy.description}</p>

                            <p className="mt-6 flex items-baseline gap-1.5">
                                <span className="font-display text-5xl font-extrabold tracking-[-0.04em] text-ink">{locale === 'fr' ? `${plan.priceUsdt} $` : `$${plan.priceUsdt}`}</span>
                                <span className="text-sm text-ink-3">{plan.priceUsdt === 0 ? t.common.forever : t.common.perMonth}</span>
                            </p>

                            <Link href={localePath(locale, '/workspace')} className={cn('btn btn-lg mt-7 w-full', recommended ? 'btn-primary' : 'btn-secondary')}>
                                {copy.cta} <ArrowRight />
                            </Link>

                            <ul className="mt-8 space-y-3.5 border-t border-line pt-7">
                                {copy.features.map((feature) => (
                                    <li key={feature.text} className="flex items-start gap-3 text-sm">
                                        {feature.included ? (
                                            <span className="mt-0.5 inline-flex h-[1.125rem] w-[1.125rem] shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand" aria-hidden="true"><Check className="h-3 w-3" strokeWidth={3} /></span>
                                        ) : (
                                            <Minus className="mt-0.5 h-[1.125rem] w-[1.125rem] shrink-0 text-ink-3" aria-hidden="true" />
                                        )}
                                        <span className={feature.included ? 'text-ink-2' : 'text-ink-3'}>
                                            {feature.text}
                                            {!feature.included && <span className="sr-only"> {t.common.notIncluded}</span>}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </article>
                    );
                })}
            </div>
            <p className="mt-8 text-center text-xs text-ink-3">{t.plans.rowRunNote}</p>
        </>
    );
}
