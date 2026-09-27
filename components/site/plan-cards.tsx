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
                                'relative flex flex-col rounded-[1.375rem] border p-7 transition-shadow duration-300',
                                recommended ? 'border-brand/40 bg-surface shadow-xl ring-1 ring-brand/15' : 'border-line bg-surface shadow-sm hover:shadow-md',
                            )}
                        >
                            {recommended && <span className="chip absolute -top-3 left-7 bg-brand text-on-brand shadow-sm">{t.common.mostPopular}</span>}
                            <Heading className="text-lg font-semibold text-ink">{copy.name}</Heading>
                            <p className="mt-1.5 min-h-[2.75rem] text-sm leading-relaxed text-ink-2">{copy.description}</p>

                            <p className="mt-6 flex items-baseline gap-1.5">
                                <span className="text-4xl font-semibold tracking-tight text-ink">{locale === 'fr' ? `${plan.priceUsdt} $` : `$${plan.priceUsdt}`}</span>
                                <span className="text-sm text-ink-3">{plan.priceUsdt === 0 ? t.common.forever : t.common.perMonth}</span>
                            </p>

                            <Link href={localePath(locale, '/workspace')} className={cn('btn btn-lg mt-6 w-full', recommended ? 'btn-primary' : 'btn-secondary')}>
                                {copy.cta} <ArrowRight />
                            </Link>

                            <ul className="mt-7 space-y-3 border-t border-line pt-6">
                                {copy.features.map((feature) => (
                                    <li key={feature.text} className="flex items-start gap-3 text-sm">
                                        {feature.included
                                            ? <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" aria-hidden="true" />
                                            : <Minus className="mt-0.5 h-4 w-4 shrink-0 text-ink-3" aria-hidden="true" />}
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
            <p className="mt-6 text-center text-xs text-ink-3">{t.plans.rowRunNote}</p>
        </>
    );
}
