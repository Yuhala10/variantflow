import Link from 'next/link';
import { ArrowRight, CheckCircle2, FileSpreadsheet, Layers3, Sparkles, Wallet } from 'lucide-react';

export default function WorkspaceIntroductionPage() {
    return (
        <main className="min-h-screen bg-[#174d3d] px-5 py-8 text-[#f4eadb] sm:px-8 lg:px-12">
            <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl flex-col">
                <header className="flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f4eadb] text-sm font-black text-[#174d3d]">VF</span><span className="text-sm font-bold tracking-wide">VariantFlow</span></Link>
                    <Link href="/pricing" className="text-xs font-bold text-[#c9e3d7] transition-colors hover:text-white">View plans</Link>
                </header>

                <section className="grid flex-1 items-center gap-12 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-20">
                    <div className="space-y-7">
                        <div className="inline-flex items-center gap-2 rounded-full border border-[#4d806b] bg-[#205a48] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#d9efe4]"><Sparkles className="h-3.5 w-3.5" /> Your catalog, in flow</div>
                        <h1 className="max-w-3xl text-4xl font-black leading-[1.05] tracking-tight sm:text-6xl">Turn product ideas into store-ready variants.</h1>
                        <p className="max-w-xl text-base leading-relaxed text-[#c9e3d7] sm:text-lg">VariantFlow gives you one calm workflow for building product options, generating SKUs, applying pricing logic, checking every row, and exporting a clean Shopify CSV.</p>
                        <div className="flex flex-wrap items-center gap-3">
                            <Link href="/workspace" className="group inline-flex items-center gap-3 rounded-xl bg-[#f4eadb] px-5 py-3.5 text-sm font-bold text-[#174d3d] shadow-[0_16px_32px_rgba(0,0,0,0.16)] transition-transform hover:-translate-y-0.5">Enter workspace <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></Link>
                            <Link href="/how-to-pay" className="inline-flex items-center gap-2 rounded-xl border border-[#6d9b88] bg-[#205a48] px-5 py-3.5 text-sm font-bold text-[#f4eadb] transition-colors hover:border-[#c9e3d7] hover:bg-[#2b6955]"><Wallet className="h-4 w-4" /> How to pay</Link>
                        </div>
                    </div>

                    <div className="rounded-[2rem] border border-[#4d806b] bg-[#205a48] p-5 shadow-[0_24px_60px_rgba(0,0,0,0.16)] sm:p-7">
                        <p className="mb-5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#a9d2c0]">The VariantFlow method</p>
                        <div className="space-y-4">
                            {[
                                [Layers3, 'Shape your catalog', 'Set product options like size, color, material, and any custom choice.'],
                                [Sparkles, 'Automate the details', 'Create SKU patterns and pricing rules that stay consistent across every combination.'],
                                [FileSpreadsheet, 'Ship with confidence', 'Review validation results, then export a ready-to-import Shopify CSV.'],
                            ].map(([Icon, title, text]) => {
                                const StepIcon = Icon as typeof Layers3;
                                return <div key={title as string} className="flex gap-4 rounded-2xl border border-[#4d806b]/70 bg-[#174d3d]/45 p-4"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f4eadb] text-[#174d3d]"><StepIcon className="h-4 w-4" /></span><div><h2 className="text-sm font-bold text-white">{title as string}</h2><p className="mt-1 text-xs leading-relaxed text-[#c9e3d7]">{text as string}</p></div></div>;
                            })}
                        </div>
                        <div className="mt-6 flex items-center gap-2 border-t border-[#4d806b] pt-5 text-xs font-semibold text-[#c9e3d7]"><CheckCircle2 className="h-4 w-4 text-[#b9ddc9]" /> Start free with up to 50 variants</div>
                    </div>
                </section>
            </div>
        </main>
    );
}
