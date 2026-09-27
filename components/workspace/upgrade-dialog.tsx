'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Dialog } from '@base-ui/react/dialog';
import { ArrowUpRight, Check, Loader2, RefreshCw, X } from 'lucide-react';
import { BILLING_PLANS, SubscriptionTier } from '../../types';
import { useI18n } from '../i18n/i18n-provider';
import { cn } from '../../lib/utils';

interface UpgradeDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onRefreshAccess: () => Promise<boolean>;
    onError: (message: string) => void;
}

const PAID_TIERS: SubscriptionTier[] = ['PRO', 'SCALE'];

export function UpgradeDialog({ open, onOpenChange, onRefreshAccess, onError }: UpgradeDialogProps) {
    const { t, href, locale } = useI18n();
    const copy = t.workspace.upgradeDialog;
    const [selectedTier, setSelectedTier] = useState<SubscriptionTier>('PRO');
    const [checkoutOpened, setCheckoutOpened] = useState(false);
    const [busy, setBusy] = useState<'checkout' | 'refresh' | null>(null);
    const plan = BILLING_PLANS[selectedTier];
    const money = (amount: number) => (locale === 'fr' ? `${amount} $` : `$${amount}`);

    const startCheckout = async () => {
        const paymentLink = selectedTier === 'PRO' ? process.env.NEXT_PUBLIC_PAYMENTO_PRO_LINK : process.env.NEXT_PUBLIC_PAYMENTO_SCALE_LINK;

        if (paymentLink) {
            window.open(paymentLink, '_blank', 'noopener,noreferrer');
            setCheckoutOpened(true);
            return;
        }

        setBusy('checkout');
        try {
            const response = await fetch('/api/paymento/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tier: selectedTier }),
            });
            const payload = await response.json().catch(() => null);
            if (!response.ok) throw new Error();
            if (payload?.checkoutUrl) {
                window.open(payload.checkoutUrl, '_blank', 'noopener,noreferrer');
                setCheckoutOpened(true);
            }
        } catch {
            onError(copy.unavailable);
        } finally {
            setBusy(null);
        }
    };

    const refresh = async () => {
        setBusy('refresh');
        const upgraded = await onRefreshAccess();
        setBusy(null);
        if (upgraded) onOpenChange(false);
        else onError(copy.notReceived);
    };

    return (
        <Dialog.Root open={open} onOpenChange={(value) => onOpenChange(value)}>
            <Dialog.Portal>
                <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/30 backdrop-blur-[2px] transition-opacity duration-300 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
                <Dialog.Popup
                    className={cn(
                        'safe-bottom fixed z-50 flex max-h-[92dvh] w-full flex-col overflow-hidden bg-surface text-ink shadow-xl outline-none',
                        'inset-x-0 bottom-0 rounded-t-[1.5rem] border-t border-line',
                        'sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:w-[calc(100%-2rem)] sm:max-w-2xl sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-[1.5rem] sm:border',
                        'transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
                        'data-[starting-style]:translate-y-full data-[ending-style]:translate-y-full',
                        'sm:data-[starting-style]:-translate-y-[46%] sm:data-[starting-style]:opacity-0 sm:data-[ending-style]:-translate-y-[46%] sm:data-[ending-style]:opacity-0',
                    )}
                >
                    <div className="mx-auto mt-2.5 h-1 w-10 shrink-0 rounded-full bg-line-strong sm:hidden" aria-hidden="true" />
                    <div className="flex items-start justify-between gap-4 px-6 pb-2 pt-5 sm:px-7 sm:pt-7">
                        <div>
                            <Dialog.Title className="text-xl font-semibold tracking-tight text-ink">{copy.title}</Dialog.Title>
                            <Dialog.Description className="mt-1 text-sm text-ink-2">{copy.description}</Dialog.Description>
                        </div>
                        <Dialog.Close aria-label={t.common.close} className="btn btn-ghost btn-icon btn-sm -mr-2 -mt-1 shrink-0"><X /></Dialog.Close>
                    </div>

                    <div className="scroll-thin overflow-y-auto px-6 pb-6 pt-4 sm:px-7 sm:pb-7">
                        <div role="radiogroup" aria-label={copy.planLabel} className="grid gap-3 sm:grid-cols-2">
                            {PAID_TIERS.map((tierId) => {
                                const selected = selectedTier === tierId;
                                return (
                                    <button
                                        key={tierId}
                                        type="button"
                                        role="radio"
                                        aria-checked={selected}
                                        onClick={() => { setSelectedTier(tierId); setCheckoutOpened(false); }}
                                        className={cn('relative rounded-2xl border p-5 text-left transition-all duration-200', selected ? 'border-brand bg-brand-soft/60 shadow-md ring-1 ring-brand' : 'border-line bg-surface hover:border-line-strong')}
                                    >
                                        <span className="flex items-center justify-between">
                                            <span className="text-base font-semibold text-ink">{t.plans[tierId].name}</span>
                                            <span className={cn('inline-flex h-5 w-5 items-center justify-center rounded-full border transition-colors', selected ? 'border-brand bg-brand text-on-brand' : 'border-line-strong')}>
                                                {selected && <Check className="h-3 w-3" />}
                                            </span>
                                        </span>
                                        <span className="mt-3 flex items-baseline gap-1">
                                            <span className="text-3xl font-semibold tracking-tight text-ink">{money(BILLING_PLANS[tierId].priceUsdt)}</span>
                                            <span className="text-sm text-ink-3">{t.common.perMonth}</span>
                                        </span>
                                        <span className="mt-2 block text-sm leading-relaxed text-ink-2">{t.plans[tierId].description}</span>
                                    </button>
                                );
                            })}
                        </div>

                        <ul className="mt-5 grid gap-2.5 rounded-2xl bg-surface-2/60 p-5 sm:grid-cols-2">
                            {t.plans[selectedTier].features.filter((feature) => feature.included).map((feature) => (
                                <li key={feature.text} className="flex items-start gap-2.5 text-sm text-ink-2">
                                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" aria-hidden="true" /> {feature.text}
                                </li>
                            ))}
                        </ul>

                        <div className="mt-6 space-y-3">
                            <button type="button" onClick={startCheckout} disabled={busy !== null} className="btn btn-primary btn-lg w-full whitespace-normal">
                                {busy === 'checkout' ? <Loader2 className="animate-spin" /> : <ArrowUpRight />}
                                {copy.continue({ price: plan.priceUsdt })}
                            </button>
                            {checkoutOpened && (
                                <button type="button" onClick={refresh} disabled={busy !== null} className="btn btn-secondary btn-lg animate-rise w-full">
                                    {busy === 'refresh' ? <Loader2 className="animate-spin" /> : <RefreshCw />}
                                    {copy.refresh}
                                </button>
                            )}
                            <p className="text-center text-xs leading-relaxed text-ink-3">
                                {copy.note}{' '}
                                <Link href={href('/how-to-pay')} target="_blank" className="font-medium text-brand underline-offset-2 hover:underline">{copy.howLink}</Link>
                            </p>
                        </div>
                    </div>
                </Dialog.Popup>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
