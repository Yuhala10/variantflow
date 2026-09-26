import Link from 'next/link';
import { ArrowRight, Check, Minus } from 'lucide-react';
import { BILLING_PLANS } from '../../types';
import { cn } from '../../lib/utils';

const RECOMMENDED = 'PRO';

export function PlanCards({ headingLevel = 'h3' }: { headingLevel?: 'h2' | 'h3' }) {
    const Heading = headingLevel;

    return (
        <div className="grid items-stretch gap-5 lg:grid-cols-3">
            {Object.values(BILLING_PLANS).map((plan) => {
                const recommended = plan.id === RECOMMENDED;
                return (
                    <article
                        key={plan.id}
                        className={cn(
                            'relative flex flex-col rounded-[1.375rem] border p-7 transition-shadow duration-300',
                            recommended
                                ? 'border-brand/40 bg-surface shadow-xl ring-1 ring-brand/15'
                                : 'border-line bg-surface shadow-sm hover:shadow-md',
                        )}
                    >
                        {recommended && (
                            <span className="chip absolute -top-3 left-7 bg-brand text-on-brand shadow-sm">Most popular</span>
                        )}
                        <Heading className="text-lg font-semibold text-ink">{plan.name}</Heading>
                        <p className="mt-1.5 min-h-[2.75rem] text-sm leading-relaxed text-ink-2">{plan.description}</p>

                        <p className="mt-6 flex items-baseline gap-1.5">
                            <span className="text-4xl font-semibold tracking-tight text-ink">${plan.priceUsdt}</span>
                            <span className="text-sm text-ink-3">{plan.priceUsdt === 0 ? 'forever' : 'USDT / month'}</span>
                        </p>

                        <Link
                            href="/workspace"
                            className={cn('btn btn-lg mt-6 w-full', recommended ? 'btn-primary' : 'btn-secondary')}
                        >
                            {plan.priceUsdt === 0 ? 'Start for free' : `Get ${plan.name}`} <ArrowRight />
                        </Link>

                        <ul className="mt-7 space-y-3 border-t border-line pt-6">
                            {plan.features.map((feature) => (
                                <li key={feature.text} className="flex items-start gap-3 text-sm">
                                    {feature.included ? (
                                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" aria-hidden="true" />
                                    ) : (
                                        <Minus className="mt-0.5 h-4 w-4 shrink-0 text-ink-3" aria-hidden="true" />
                                    )}
                                    <span className={feature.included ? 'text-ink-2' : 'text-ink-3'}>
                                        {feature.text}
                                        {!feature.included && <span className="sr-only"> (not included)</span>}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </article>
                );
            })}
        </div>
    );
}
