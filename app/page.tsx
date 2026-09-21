'use client';

import React from 'react';
import Link from 'next/link';
import { Layers, Cpu, DollarSign, ShieldCheck, ArrowRight, Table, Wallet } from 'lucide-react';

export default function PublicHomepage() {
  return (
    <div className="min-h-screen bg-[#f7f1ea] flex flex-col font-sans selection:bg-[#dfeee6] selection:text-[#1f3a34]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'VariantFlow',
            applicationCategory: 'BusinessApplication',
            operatingSystem: 'Web',
            description: 'Build product variants, generate SKUs, apply pricing rules, validate catalog data, and export Shopify-ready CSV files.',
            url: 'https://variantflow.app',
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'USD',
              description: 'Free plan for generating and exporting up to 50 product variants.',
            },
          }),
        }}
      />
      <header className="bg-[#fffdfb]/90 border-b border-[#e8dcc8] sticky top-0 z-50 backdrop-blur-sm">
        <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#2e5f52] flex items-center justify-center text-white font-bold text-xs shadow-sm">V</div>
            <span className="font-bold text-[#2f261f] tracking-tight text-sm">VariantFlow</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/how-to-pay" className="hidden items-center gap-1.5 rounded-xl border border-[#d8c8b5] bg-[#fffdfb] px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-[#5f5246] transition-colors hover:border-[#2e5f52] hover:text-[#2e5f52] sm:inline-flex">
              <Wallet className="h-3.5 w-3.5" /> How to pay
            </Link>
            <Link href="/app" className="bg-[#2e5f52] hover:bg-[#254d43] text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-[0_10px_25px_rgba(46,95,82,0.2)]">
              Launch Workspace
            </Link>
          </div>
        </nav>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-20 md:py-28 space-y-24">
        <section className="max-w-3xl space-y-6">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-[#2c241d] leading-[1.12]">
            Build product variants in minutes — not spreadsheets.
          </h1>
          <p className="text-base md:text-lg text-[#5f5246] leading-relaxed max-w-2xl">
            Generate complex option matrices, design rule-based SKU tokens, automate pricing modifications, validate catalog integrity, and export Shopify-ready CSV files in one clean workflow.
          </p>
          <div className="pt-4 flex flex-wrap gap-4">
            <Link href="/app" className="bg-[#2e5f52] hover:bg-[#254d43] text-white font-semibold text-sm px-6 py-3.5 rounded-xl shadow-[0_12px_28px_rgba(46,95,82,0.22)] transition-all transform hover:-translate-y-0.5 flex items-center gap-2 group">
              Open Free Grid Compiler <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pt-12 border-t border-[#e8dcc8]">
          <div className="space-y-2 rounded-2xl border border-[#eadec2] bg-[#fffdfb] p-4 shadow-[0_10px_25px_rgba(74,57,38,0.04)]">
            <div className="w-8 h-8 rounded-lg bg-[#edf5ef] flex items-center justify-center text-[#2c5d4d] mb-3"><Layers className="w-4 h-4" /></div>
            <h2 className="text-sm font-bold text-[#2d241d] uppercase tracking-wider">Cartesian Variations</h2>
            <p className="text-xs text-[#5f5246] leading-relaxed font-medium">
              Create every valid product combination from your product options and turn complex catalogs into a clean, reviewable variant matrix.
            </p>
          </div>

          <div className="space-y-2 rounded-2xl border border-[#eadec2] bg-[#fffdfb] p-4 shadow-[0_10px_25px_rgba(74,57,38,0.04)]">
            <div className="w-8 h-8 rounded-lg bg-[#edf5ef] flex items-center justify-center text-[#2c5d4d] mb-3"><Cpu className="w-4 h-4" /></div>
            <h2 className="text-sm font-bold text-[#2d241d] uppercase tracking-wider">Dynamic SKU Templates</h2>
            <p className="text-xs text-[#5f5246] leading-relaxed font-medium">
              Define patterns like <code className="bg-[#f4efe7] border px-1 rounded text-[#2c5d4d] font-mono text-[10px]">TSH-{`{COLOR}`}-{`{SIZE}`}</code> and generate unique SKUs for every row without duplicates.
            </p>
          </div>

          <div className="space-y-2 rounded-2xl border border-[#eadec2] bg-[#fffdfb] p-4 shadow-[0_10px_25px_rgba(74,57,38,0.04)]">
            <div className="w-8 h-8 rounded-lg bg-[#f8efe0] flex items-center justify-center text-[#8a5a2b] mb-3"><DollarSign className="w-4 h-4" /></div>
            <h2 className="text-sm font-bold text-[#2d241d] uppercase tracking-wider">Pricing Rules</h2>
            <p className="text-xs text-[#5f5246] leading-relaxed font-medium">
              Add base pricing and attribute-based modifiers such as XL +$2 or Polyester +$3, then calculate the final row price automatically.
            </p>
          </div>

          <div className="space-y-2 rounded-2xl border border-[#eadec2] bg-[#fffdfb] p-4 shadow-[0_10px_25px_rgba(74,57,38,0.04)]">
            <div className="w-8 h-8 rounded-lg bg-[#ecf5f0] flex items-center justify-center text-[#2c5d4d] mb-3"><ShieldCheck className="w-4 h-4" /></div>
            <h2 className="text-sm font-bold text-[#2d241d] uppercase tracking-wider">Validation Layer</h2>
            <p className="text-xs text-[#5f5246] leading-relaxed font-medium">
              Catch duplicate combinations, invalid SKUs, missing prices, malformed rows, and inconsistent option data before you export.
            </p>
          </div>
        </section>

        <section className="bg-[#fffdfb] border border-[#eadec2] rounded-[1.5rem] p-8 space-y-6 shadow-[0_18px_35px_rgba(67,49,35,0.05)]">
          <div className="flex items-center gap-2"><Table className="w-4 h-4 text-[#7a695d]" /> <span className="text-xs font-bold uppercase tracking-wider text-[#806d5d]">Why VariantFlow?</span></div>
          <h2 className="text-xl font-bold text-[#2d241d] max-w-xl">A clean internal product-compiler built for real merchant workflows.</h2>
          <p className="text-xs text-[#5f5246] leading-relaxed font-medium">
            VariantFlow keeps your product structure in one platform-independent model, then converts that data into a Shopify-ready CSV when validation passes. It is designed to feel professional, fast, and clear from the first product idea to the final export.
          </p>
        </section>

        <section className="space-y-6 pt-12 border-t border-[#e8dcc8]">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#7a695d]">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs font-medium text-[#473c34]">
            <div className="space-y-1.5 rounded-2xl border border-[#eadec2] bg-[#fffdfb] p-4">
              <h3 className="font-bold text-[#2d241d] text-sm">Does this overwrite existing Shopify products?</h3>
              <p className="text-[#5f5246] leading-relaxed">No. The app creates a verified CSV file that you import into Shopify in your own way.</p>
            </div>
            <div className="space-y-1.5 rounded-2xl border border-[#eadec2] bg-[#fffdfb] p-4">
              <h3 className="font-bold text-[#2d241d] text-sm">Is my catalog kept local?</h3>
              <p className="text-[#5f5246] leading-relaxed">Yes. The variant engine works client-side so the core workflow stays fast and private.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-[#fffdfb] border-t border-[#e8dcc8] py-8 text-center text-[10px] font-bold text-[#8b7b6d] uppercase tracking-widest">
        © {new Date().getFullYear()} VariantFlow. All rights reserved.
      </footer>
    </div>
  );
}
