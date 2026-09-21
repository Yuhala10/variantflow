'use client';

import Link from 'next/link';
import { ArrowLeft, FileText } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#f7f1ea] px-4 py-10 text-[#2d241d]">
      <div className="mx-auto max-w-4xl rounded-[2rem] border border-[#e8dcc8] bg-[#fffdfb] p-6 shadow-[0_22px_50px_rgba(72,55,39,0.08)] md:p-10">
        <Link href="/app" className="inline-flex items-center gap-2 rounded-full border border-[#e8dcc8] bg-[#fffdfb] px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-[#5f5246] hover:text-[#2d241d]">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to app
        </Link>

        <div className="mt-8 space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#f5efe8] border border-[#eadcc5] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#5f5246]">
            <FileText className="w-3.5 h-3.5" /> Terms of service
          </div>

          <h1 className="text-3xl font-black tracking-tight text-[#2d241d]">Terms and service conditions</h1>

          <div className="space-y-4 text-sm leading-relaxed text-[#5f5246]">
            <p>VariantFlow provides software tools for product catalog generation, validation, and CSV export support. Access to premium features is subject to the selected plan and successful payment confirmation.</p>
            <p>Users are responsible for ensuring the legality, accuracy, and compliance of the data they upload, generate, or export through the platform.</p>
            <p>Payments made via USDT/TRC20 are processed as a direct wallet transfer model for the current product version. The platform may verify payment confirmation manually or through a connected gateway in a future production deployment.</p>
            <p>All features are provided on an “as-is” basis. Existing functionality may change as the product evolves, and users should not rely on any promise beyond the currently active plan and feature set.</p>
            <p>Users should report disputes, billing concerns, or product issues promptly through the in-app complaint form or direct contact channel.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
