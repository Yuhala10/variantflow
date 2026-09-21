'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowLeft, Wallet, ShieldCheck, CheckCircle2, Copy, QrCode } from 'lucide-react';

export default function HowToPayPage() {
  const [copied, setCopied] = useState(false);
  const walletAddress = 'TQwzVg8aS7uJmGfD9K2yTw7kJmRUhZsYVn';

  const copyWalletAddress = async () => {
    await navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="min-h-screen bg-[#f7f1ea] px-4 py-10 text-[#2d241d]">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="flex items-center justify-between gap-3">
          <Link href="/app" className="inline-flex items-center gap-2 rounded-full border border-[#e8dcc8] bg-[#fffdfb] px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-[#5f5246] hover:text-[#2d241d]">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to workspace
          </Link>
        </div>

        <div className="rounded-[2rem] border border-[#e8dcc8] bg-[#fffdfb] p-6 shadow-[0_22px_50px_rgba(72,55,39,0.08)] md:p-10">
          <div className="mb-8 space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#eaf4ef] border border-[#cfe2d9] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#225246]">
              <Wallet className="w-3.5 h-3.5" /> How to pay
            </div>
            <h1 className="text-3xl font-black tracking-tight text-[#2d241d] md:text-5xl">Secure your plan in 3 simple steps</h1>
            <p className="max-w-2xl text-sm text-[#5f5246] leading-relaxed">
              VariantFlow currently accepts USDT on the TRON network. This keeps the payment quick, transparent, and compatible with mobile and desktop wallets.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-[#eadcc5] bg-[#f7f1ea] p-5">
              <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#2e5f52] text-sm font-black text-white">1</div>
              <h2 className="mb-2 text-sm font-bold uppercase tracking-wider text-[#2d241d]">Choose your plan</h2>
              <p className="text-sm text-[#5f5246] leading-relaxed">Open the upgrade modal and select PRO or SCALE. You will be given a wallet and exact amount to send.</p>
            </div>

            <div className="rounded-2xl border border-[#eadcc5] bg-[#f7f1ea] p-5">
              <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#2e5f52] text-sm font-black text-white">2</div>
              <h2 className="mb-2 text-sm font-bold uppercase tracking-wider text-[#2d241d]">Send exact USDT</h2>
              <p className="text-sm text-[#5f5246] leading-relaxed">Use the QR code or copy the address, then send the exact amount shown in the upgrade screen. Do not send a different token or a different network.</p>
            </div>

            <div className="rounded-2xl border border-[#eadcc5] bg-[#f7f1ea] p-5">
              <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#2e5f52] text-sm font-black text-white">3</div>
              <h2 className="mb-2 text-sm font-bold uppercase tracking-wider text-[#2d241d]">Confirm and unlock</h2>
              <p className="text-sm text-[#5f5246] leading-relaxed">Keep the upgrade window open while the payment is checked. Your plan activates after the payment status is confirmed.</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[2rem] border border-[#e8dcc8] bg-[#fffdfb] p-6 shadow-[0_20px_45px_rgba(72,55,39,0.05)]">
            <div className="mb-4 flex items-center gap-2">
              <QrCode className="w-4 h-4 text-[#2e5f52]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#5f5246]">Payment example</h3>
            </div>
            <div className="rounded-2xl border border-[#eadcc5] bg-[#f7f1ea] p-5 text-center">
              <div className="mx-auto flex h-40 w-40 items-center justify-center rounded-2xl border border-[#d8c3a7] bg-white p-2 shadow-sm">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(walletAddress)}`}
                  alt="USDT TRON payment wallet QR code"
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="mt-4 text-[11px] font-bold uppercase tracking-wider text-[#7a695d]">Wallet address</div>
              <div className="mt-2 flex items-center justify-between gap-2 rounded-xl border border-[#eadcc5] bg-white px-3 py-2 text-[11px] font-mono text-[#2d241d] break-all">
                <span>{walletAddress}</span>
                <button type="button" aria-label="Copy wallet address" onClick={copyWalletAddress} className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#f5efe8] text-[#2d241d]">
                  {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-[#2e5f52]" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-[#e8dcc8] bg-[#fffdfb] p-6 shadow-[0_20px_45px_rgba(72,55,39,0.05)]">
            <div className="mb-4 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#2e5f52]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#5f5246]">Important notes</h3>
            </div>
            <ul className="space-y-3 text-sm text-[#5f5246] leading-relaxed">
              <li className="flex gap-2"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-[#2e5f52]" />Use only USDT on TRON. Do not send ERC-20 or BNB Smart Chain.</li>
              <li className="flex gap-2"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-[#2e5f52]" />Send the exact amount shown in the invoice. Wrong amounts may delay plan activation.</li>
              <li className="flex gap-2"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-[#2e5f52]" />After payment, click the unlock button in the upgrade modal to receive your plan immediately.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
