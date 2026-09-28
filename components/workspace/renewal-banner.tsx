'use client';

import { useState } from 'react';
import { CalendarClock, RefreshCw, X } from 'lucide-react';
import type { RenewalState } from '../../lib/entitlements';
import { useI18n } from '../i18n/i18n-provider';
import { cn } from '../../lib/utils';

/** Payments never renew on their own, so this is the customer's only reminder before (or after) their plan ends. */
export function RenewalBanner({ state, onRenew }: { state: RenewalState; onRenew: () => void }) {
    const { t, formatDate } = useI18n();
    const copy = t.workspace.renewal;
    const [dismissed, setDismissed] = useState(false);
    if (dismissed) return null;

    const plan = t.plans[state.tier].name;
    const lapsed = state.kind === 'lapsed';
    const title = lapsed
        ? copy.lapsedTitle({ plan, date: formatDate(state.endedAt) })
        : copy.endingTitle({ plan, days: state.daysLeft });
    const text = lapsed ? copy.lapsedText : copy.endingText({ date: formatDate(state.endsAt) });

    return (
        <div role="status" className={cn('animate-rise flex flex-col gap-3 rounded-2xl border px-4 py-3.5 sm:flex-row sm:items-center', lapsed ? 'border-danger/30 bg-danger-soft' : 'border-warn/30 bg-warn-soft')}>
            <CalendarClock className={cn('hidden h-5 w-5 shrink-0 sm:block', lapsed ? 'text-danger' : 'text-warn')} aria-hidden="true" />
            <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink">{title}</p>
                <p className="text-sm text-ink-2">{text}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
                <button type="button" onClick={onRenew} className="btn btn-primary btn-sm">
                    <RefreshCw /> {lapsed ? copy.renew({ plan }) : copy.extend}
                </button>
                <button type="button" onClick={() => setDismissed(true)} aria-label={copy.dismiss} className="btn btn-ghost btn-icon btn-sm text-ink-3"><X /></button>
            </div>
        </div>
    );
}
