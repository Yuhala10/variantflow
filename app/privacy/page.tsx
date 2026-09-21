'use client';

import Link from 'next/link';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#f7f1ea] px-4 py-10 text-[#2d241d]">
      <div className="mx-auto max-w-4xl rounded-[2rem] border border-[#e8dcc8] bg-[#fffdfb] p-6 shadow-[0_22px_50px_rgba(72,55,39,0.08)] md:p-10">
        <Link href="/app" className="inline-flex items-center gap-2 rounded-full border border-[#e8dcc8] bg-[#fffdfb] px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-[#5f5246] hover:text-[#2d241d]">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to app
        </Link>

        <div className="mt-8 space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#eaf4ef] border border-[#cfe2d9] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#225246]">
            <ShieldCheck className="w-3.5 h-3.5" /> Privacy policy
          </div>

          <h1 className="text-3xl font-black tracking-tight text-[#2d241d]">Privacy and data handling</h1>

          <div className="space-y-4 text-sm leading-relaxed text-[#5f5246]">
            <p>VariantFlow processes catalog data locally in the browser for product generation and export preparation. We do not inherently store your product catalog in a remote database unless a future backend integration is enabled.</p>
            <p>Payment-related data is used only to confirm plan activation and support the subscription process. We do not sell or rent user information to third parties.</p>
            <p>We use reasonable technical and organizational safeguards to protect transaction and account information. However, no internet-connected system can guarantee absolute security.</p>
            <p>Users may request clarification or raise a complaint regarding billing, access, or data handling by using the in-app complaint form or contacting the system owner directly.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
