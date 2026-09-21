'use client';

import React from 'react';
import Link from 'next/link';
import { BILLING_PLANS } from '../../types';
import { CheckCircle2, ArrowLeft } from 'lucide-react';

export default function PricingPage() {
    return (
        <div className="min-h-screen bg-slate-50 font-sans selection:bg-indigo-100 selection:text-indigo-900 text-slate-900 py-20 px-6">
            <div className="max-w-4xl mx-auto space-y-12">
                <div className="space-y-4 text-center">
                    <Link href="/app" className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">
                        <ArrowLeft className="w-3.5 h-3.5" /> Back to compiler
                    </Link>
                    <h1 className="text-3xl font-black tracking-tight text-slate-950 uppercase">Transparent Execution Pricing</h1>
                    <p className="text-sm text-slate-500 max-w-md mx-auto font-medium">
                        Entitlement packages built around scale metrics, not artificial infrastructure locks.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
                    {Object.values(BILLING_PLANS).map((plan) => (
                        <div
                            key={plan.id}
                            className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-6"
                        >
                            <div className="space-y-4">
                                <div>
                                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">{plan.name}</h2>
                                    <p className="text-[11px] text-slate-400 font-semibold mt-1 leading-normal uppercase">{plan.description}</p>
                                </div>

                                <div className="flex items-baseline gap-1 pt-2">
                                    <span className="text-3xl font-black tracking-tighter text-slate-950">${plan.priceUsdt}</span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">USDT / MO</span>
                                </div>

                                <div className="h-px bg-slate-100 w-full" />

                                <ul className="space-y-2.5 text-xxs font-semibold uppercase tracking-wide text-slate-600">
                                    {plan.features.map((feat, idx) => (
                                        <li key={idx} className="flex items-center gap-2">
                                            <span className={feat.included ? 'text-indigo-600' : 'text-slate-300'}>
                                                {feat.included ? '✓' : '✕'}
                                            </span>
                                            <span className={feat.included ? 'text-slate-800' : 'selected line-through opacity-50 text-slate-400'}>
                                                {feat.text}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <Link
                                href="/app"
                                className="w-full text-center h-10 flex items-center justify-center bg-slate-950 text-white hover:bg-slate-800 text-xxs font-bold uppercase tracking-widest transition-colors rounded-xl shadow-sm"
                            >
                                Activate inside workspace
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
