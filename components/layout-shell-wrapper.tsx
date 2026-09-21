'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { SubscriptionTier, MerchantBillingState, BILLING_PLANS } from '../types';
import { Button } from './ui/button';
import { AccountControl } from './auth/account-control';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { ShieldCheck, Cpu, Zap, CheckCircle2, RefreshCw, Copy, Wallet, ArrowRight, Shield, House } from 'lucide-react';

interface WorkspaceLayoutProps {
    billingState: MerchantBillingState & { activeInvoice: any };
    variantCount: number;
    children: React.ReactNode;
    onUpgradeSuccess: (tier: SubscriptionTier) => void;
    onTriggerExport: () => void | Promise<void>;
}

export const WorkspaceLayout: React.FC<WorkspaceLayoutProps> = ({
    billingState,
    variantCount,
    children,
    onUpgradeSuccess,
    onTriggerExport
}) => {
    const [isBillingOpen, setIsBillingOpen] = useState(false);
    const [selectedTier, setSelectedTier] = useState<SubscriptionTier>('PRO');
    const [invoice, setInvoice] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [copySuccess, setCopySuccess] = useState(false);

    const setSubscriptionState = (tier: SubscriptionTier, used: number, max: number) => {
        if (typeof window !== 'undefined') {
            const payload = { subscriptionTier: tier, rowRunsUsed: used, rowRunsMax: max };
            window.localStorage.setItem('variantflow.subscription.v1', JSON.stringify(payload));
        }
    };

    const activeTier = billingState.currentTier;
    const isFree = activeTier === 'FREE';
    const overVariantLimit = isFree && variantCount > 50;

    useEffect(() => {
        let pollingInterval: NodeJS.Timeout;

        if (invoice && invoice.status === 'PENDING') {
            pollingInterval = setInterval(async () => {
                try {
                    const response = await fetch(`/api/paymento/status?id=${invoice.invoiceId}`);
                    const data = await response.json();

                    if (data.status === 'CONFIRMED') {
                        clearInterval(pollingInterval);
                        setInvoice(null);
                        setIsBillingOpen(false);
                        onUpgradeSuccess(selectedTier);
                    } else if (data.status === 'EXPIRED') {
                        clearInterval(pollingInterval);
                        setInvoice(null);
                        alert('PayMento transaction invoice window expired. Please initiate upgrade route again.');
                    }
                } catch (err) {
                    console.error('Ledger check failure:', err);
                }
            }, 5000);
        }

        return () => clearInterval(pollingInterval);
    }, [invoice, selectedTier, onUpgradeSuccess]);

    const handleCheckoutIntent = async () => {
        setLoading(true);
        try {
            const targetedPlan = BILLING_PLANS[selectedTier];
            const paymentLink = selectedTier === 'PRO'
                ? process.env.NEXT_PUBLIC_PAYMENTO_PRO_LINK
                : process.env.NEXT_PUBLIC_PAYMENTO_SCALE_LINK;

            if (paymentLink) {
                window.open(paymentLink, '_blank', 'noopener,noreferrer');
                setLoading(false);
                return;
            }

            const response = await fetch('/api/paymento/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tier: selectedTier, amount: targetedPlan.priceUsdt })
            });

            if (response.ok) {
                const invoiceData = await response.json();
                if (invoiceData.error) throw new Error(invoiceData.error);
                setInvoice(invoiceData);
                setLoading(false);
                return;
            }

            const errorPayload = await response.json().catch(() => null);
            throw new Error(errorPayload?.error || 'Payment service unavailable.');
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Payment service unavailable.');
        } finally {
            setLoading(false);
        }
    };

    const executeAddressCopy = (address: string) => {
        navigator.clipboard.writeText(address);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
    };

    return (
        <div className="min-h-screen bg-[#f7f1ea] flex flex-col font-sans antialiased text-[#2c241d] selection:bg-[#dfeee6] selection:text-[#1f3a34]">
            <header className="sticky top-0 z-40 flex min-h-20 flex-wrap items-center justify-between gap-3 border-b border-[#e8dcc8] bg-[#fffdfb]/90 px-4 py-3 shadow-[0_10px_30px_rgba(112,90,70,0.06)] backdrop-blur-sm sm:px-8">
                <div className="flex items-center gap-2">
                    <Link href="/app" aria-label="VariantFlow home" className="flex items-center">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#2e5f52] text-xs font-bold text-white shadow-sm">
                        VF
                    </div>
                    </Link>
                    <Link href="/" className="inline-flex items-center gap-1.5 rounded-xl border border-[#e8dcc8] bg-[#fffdfb] px-2.5 py-2 text-[10px] font-bold uppercase tracking-wider text-[#5f5246] transition-colors hover:border-[#bfdac8] hover:text-[#2e5f52]">
                        <House className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Back to home</span><span className="sm:hidden">Home</span>
                    </Link>
                </div>

                <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
                    <div className="flex items-center gap-3 bg-[#f5efe8] border border-[#eadcc5] px-3 py-2 rounded-2xl shadow-sm">
                        <div className="flex items-center gap-2">
                            <span title="No user account is connected in this version. The plan is stored only in this browser." className="text-[#7a695d] text-[10px] font-bold uppercase tracking-wider">Local plan</span>
                            <span className={`inline-flex items-center justify-center min-w-[52px] rounded-full px-2 py-1 text-[10px] font-black uppercase tracking-wide ${isFree ? 'bg-[#edf5ef] text-[#2a6355]' : 'bg-[#e8f3ef] text-[#1f5a4c]'}`}>
                                {activeTier}
                            </span>
                        </div>
                        <div className="h-4 w-px bg-[#e3d5c4]" />
                        {isFree ? (
                            <div
                                title="The current matrix is generated from your product options. Free exports support up to 50 variants."
                                className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-[#5f5246]"
                            >
                                <span className="text-[#7a695d]">Matrix</span>
                                <span className={overVariantLimit ? 'text-[#b65348] font-black' : 'text-[#2d241d]'}>{variantCount} variants</span>
                                <span className="text-[#b9a997]">•</span>
                                <span className="text-[#7a695d]">50 max/export</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#5f5246]">
                                <span>{billingState.rowRunsUsed}</span>
                                <span className="text-[#7a695d]">/ {billingState.rowRunsMax}</span>
                                <span className="text-[#7a695d]">Row-Runs</span>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        <AccountControl />
                        {isFree && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => { setInvoice(null); setIsBillingOpen(true); }}
                                className="h-9 px-4 text-xs font-bold border-[#bfdac8] text-[#224f43] bg-[#edf7f0] hover:bg-[#e0f2e7] hover:text-[#1a413d] transition-colors rounded-xl flex items-center gap-1.5 shadow-none"
                            >
                                <Zap className="w-3.5 h-3.5 fill-[#224f43]" /> Upgrade
                            </Button>
                        )}

                        <Button
                            size="sm"
                            onClick={onTriggerExport}
                            disabled={overVariantLimit}
                            className={`h-9 px-4 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${overVariantLimit
                                ? 'bg-[#efe7dd] border border-[#e3d5c4] text-[#8a7a68] cursor-not-allowed shadow-none hover:bg-[#efe7dd]'
                                    : 'bg-[#2e5f52] text-white hover:bg-[#254d43] shadow-[0_12px_25px_rgba(46,95,82,0.18)]'
                                }`}
                        >
                            Export Shopify CSV
                        </Button>
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-[1600px] w-full mx-auto p-8 space-y-6">
                {isFree && (
                    <div className={`border rounded-2xl p-4 flex items-start gap-3 text-xs leading-normal font-medium ${overVariantLimit
                        ? 'bg-[#fce9e6] border-[#efc1b8] text-[#7a3e32]'
                        : 'bg-[#f3efe7] border-[#e6d7bf] text-[#5f5246]'
                        }`}>
                        <ShieldCheck className={`w-4 h-4 mt-0.5 shrink-0 ${overVariantLimit ? 'text-[#b65348]' : 'text-[#4e7d6c]'}`} />
                        <div className="space-y-1">
                            <span className="font-bold block uppercase tracking-wider text-[11px] text-[#2f261f]">
                                {overVariantLimit ? 'Free Matrix Limit Reached' : 'Ready to build'}
                            </span>
                            <p className="opacity-90">
                                {overVariantLimit
                                    ? `Your current product matrix contains ${variantCount} variants, above the Free limit of 50. Reduce the option combinations or upgrade to continue exporting.`
                                    : 'Start by adding a product title and option categories. VariantFlow will generate the combinations and validate them before export. Free exports support up to 50 variants.'
                                }
                            </p>
                            <button
                                onClick={() => { setInvoice(null); setIsBillingOpen(true); }}
                                className="font-bold underline text-[#2c241d] hover:opacity-80 block text-xxs uppercase tracking-wider pt-0.5"
                            >
                                Upgrade active catalog project to Pro plan via PayMento →
                            </button>
                            <Link
                                href="/how-to-pay"
                                className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-[#d8c8b5] bg-[#fffdfb] px-2.5 py-1.5 text-xxs font-bold uppercase tracking-wider text-[#2e5f52] transition-colors hover:border-[#2e5f52]"
                            >
                                <Wallet className="h-3 w-3" /> How payment works
                            </Link>
                        </div>
                    </div>
                )}

                <div className="min-h-[calc(100vh-14rem)]">
                    {children}
                </div>
            </main>
            <footer className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 border-t border-[#e8dcc8] bg-[#fffdfb] px-6 py-5 text-[10px] font-bold uppercase tracking-wider text-[#7a695d]">
                <Link href="/how-to-pay" className="transition-colors hover:text-[#2e5f52]">How payment works</Link>
                <Link href="/privacy" className="transition-colors hover:text-[#2e5f52]">Privacy</Link>
                <Link href="/terms" className="transition-colors hover:text-[#2e5f52]">Terms</Link>
            </footer>
            <Dialog open={isBillingOpen} onOpenChange={setIsBillingOpen}>
                <DialogContent className="sm:max-w-2xl border-[#e8dcc8] bg-[#fffdfb] p-0 rounded-[1.5rem] overflow-hidden shadow-[0_24px_55px_rgba(72,55,39,0.12)] gap-0">
                    <DialogHeader className="p-6 border-b border-[#f0e5d9] bg-[#f7f1ea] flex flex-col gap-1">
                        <DialogTitle className="text-sm font-bold text-[#2d241d] uppercase tracking-widest flex items-center gap-1.5">
                            <Cpu className="w-4 h-4 text-[#2e5f52]" /> Account Plan Billing Routing Control
                        </DialogTitle>
                        <DialogDescription className="text-xxs text-[#7a695d] font-semibold uppercase tracking-wider">
                            Instant workspace entitlement activation over secure Tron block height ledgers.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="p-6 space-y-6">
                        {!invoice ? (
                            <>
                                <div className="grid grid-cols-2 gap-4">
                                    {(['PRO', 'SCALE'] as SubscriptionTier[]).map((tierId) => {
                                        const plan = BILLING_PLANS[tierId];
                                        return (
                                            <div
                                                key={tierId}
                                                onClick={() => setSelectedTier(tierId)}
                                                className={
                                                    selectedTier === tierId
                                                        ? "border-[#2e5f52] bg-[#edf7f0] shadow-[0_10px_25px_rgba(46,95,82,0.08)] border rounded-2xl p-5 cursor-pointer transition-all flex flex-col gap-2 relative"
                                                        : "border-[#eadcc5] bg-[#fffdfb] hover:border-[#d7c5a9] border rounded-2xl p-5 cursor-pointer transition-all flex flex-col gap-2 relative"
                                                }
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs font-bold text-[#2d241d] uppercase tracking-wider">{plan.name}</span>
                                                    {selectedTier === tierId && <CheckCircle2 className="w-4 h-4 text-[#2e5f52]" />}
                                                </div>
                                                <div className="flex items-baseline gap-1 mt-1">
                                                    <span className="text-2xl font-black tracking-tight text-[#2d241d]">\${plan.priceUsdt}</span>
                                                    <span className="text-[9px] font-bold text-[#7a695d] uppercase tracking-widest">USDT / MO</span>
                                                </div>
                                                <p className="text-[11px] text-[#5f5246] font-medium leading-normal mt-1">{plan.description}</p>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="bg-[#f7f1ea] border border-[#eadcc5] rounded-2xl p-4 space-y-2.5">
                                    <h4 className="text-xxs font-bold text-[#7a695d] uppercase tracking-widest">Included Account Entitlements</h4>
                                    <ul className="grid grid-cols-2 gap-x-6 gap-y-2 text-xxs font-semibold text-[#5f5246] uppercase tracking-wide">
                                        {BILLING_PLANS[selectedTier].features.map((feat, idx) => (
                                            <li key={idx} className="flex items-center gap-2">
                                                <span className={feat.included ? "text-[#2e5f52]" : "text-[#b9a997]"}>
                                                    {feat.included ? "✓" : "✕"}
                                                </span>
                                                <span className={feat.included ? "text-[#2d241d]" : "text-[#9a8779] line-through opacity-70"}>
                                                    {feat.text}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <Button
                                    onClick={handleCheckoutIntent}
                                    disabled={loading}
                                    className="w-full h-11 bg-[#2e5f52] text-white text-xs font-bold uppercase tracking-widest hover:bg-[#254d43] rounded-xl shadow-[0_12px_25px_rgba(46,95,82,0.2)] transition-colors"
                                >
                                    {loading ? "Routing PayMento Secure Tunnel..." : "Generate Invoice via TRC20"}
                                </Button>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-4 space-y-5 text-center">
                                <div className="p-3 bg-white border border-[#eadcc5] shadow-sm rounded-2xl">
                                    <img
                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(invoice.depositAddress)}`}
                                        alt="USDT TRON payment wallet QR code"
                                        className="w-36 h-36 object-contain block"
                                    />
                                </div>

                                <div className="w-full max-w-sm space-y-1.5 text-left">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#7a695d] block px-0.5">
                                        USDT TRON TRC20 Destination Address
                                    </span>
                                    <div className="flex items-center justify-between gap-3 bg-[#f7f1ea] border border-[#eadcc5] rounded-xl p-2.5 text-xxs font-mono font-medium text-[#2d241d] break-all select-all">
                                        <span>{invoice.depositAddress}</span>
                                        <button
                                            onClick={() => executeAddressCopy(invoice.depositAddress)}
                                            className="text-[#7a695d] hover:text-[#2d241d] transition-colors p-1"
                                        >
                                            {copySuccess ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="text-[11px] text-[#5f5246] font-medium leading-relaxed max-w-sm">
                                    Transfer exactly <strong className="text-[#2d241d] font-bold">{invoice.amountUsdt}.00 USDT</strong> over the network line. Your environment will uncap the minute the Tron block ledger hits validation state height.
                                </div>

                                <div className="flex items-center gap-2 text-xxs font-bold uppercase tracking-widest text-[#225246] bg-[#eaf4ef] border border-[#cfe2d9] rounded-full px-3 py-1 animate-pulse">
                                    <RefreshCw className="w-3 h-3 animate-spin" /> Awaiting block height tx confirmation...
                                </div>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};
