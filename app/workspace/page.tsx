'use client';

import React, { useEffect, useState } from 'react';
import { useProductStore } from '../../store/productStore';
import { OptionsBuilder } from '../../components/product/options-builder';
import { RulesPanel } from '../../components/product/rules-panel';
import { CatalogToolsPanel } from '../../components/product/catalog-tools-panel';
import { VariantTable } from '../../components/variants/variant-table';
import { WorkspaceLayout } from '../../components/layout-shell-wrapper';
import { validateProductData } from '../../domain/validation/validateProduct';
import { convertToShopifyCsv } from '../../exporters/shopify/csvAdapter';
import { createSupabaseBrowserClient } from '../../lib/supabase/client';
import { isSupabaseConfigured } from '../../lib/supabase/config';
import { AlertTriangle, CheckCircle } from 'lucide-react';

function WorkspaceLoading() {
    return (
        <main className="min-h-screen bg-[#174d3d] flex items-center justify-center px-6 text-white">
            <div className="flex flex-col items-center gap-5 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-[1.75rem] bg-[#f4eadb] text-2xl font-black tracking-tight text-[#174d3d] shadow-[0_20px_50px_rgba(0,0,0,0.18)] animate-pulse">VF</div>
                <div>
                    <p className="text-lg font-black tracking-tight">Opening your workspace</p>
                    <p className="mt-1 text-xs font-medium text-[#c9e3d7]">Preparing your product compiler...</p>
                </div>
                <div className="h-1.5 w-32 overflow-hidden rounded-full bg-[#2d6755]">
                    <div className="h-full w-1/2 animate-[loading_1.2s_ease-in-out_infinite] rounded-full bg-[#f4eadb]" />
                </div>
            </div>
        </main>
    );
}

export default function WorkspacePage() {
    const store = useProductStore();
    const [mounted, setMounted] = useState(false);
    const [cloudProjectId, setCloudProjectId] = useState<string | null>(null);
    const [cloudReady, setCloudReady] = useState(false);

    useEffect(() => {
        let cancelled = false;

        const prepareWorkspace = async () => {
            store.recompileCatalogMatrix();

            if (isSupabaseConfigured() && createSupabaseBrowserClient()) {
                const [accountResponse, projectsResponse] = await Promise.all([
                    fetch('/api/account'),
                    fetch('/api/projects'),
                ]);

                if (accountResponse.ok) {
                    const account = await accountResponse.json();
                    const tier = account.subscription?.tier;
                    if (tier === 'PRO' || tier === 'SCALE') {
                        store.setSubscriptionState(tier, 0, tier === 'PRO' ? 2000 : 15000);
                    }
                }

                if (projectsResponse.ok) {
                    const projectsPayload = await projectsResponse.json();
                    const project = projectsPayload.projects?.[0];
                    if (project?.catalog) {
                        store.hydrateCatalog(project.catalog);
                        setCloudProjectId(project.id);
                    }
                }
                if (!cancelled) setCloudReady(true);
            }

            const timer = window.setTimeout(() => {
                if (!cancelled) setMounted(true);
            }, 650);
            return () => window.clearTimeout(timer);
        };

        void prepareWorkspace();
        return () => { cancelled = true; };
    }, []);

    useEffect(() => {
        if (!cloudReady) return;

        let saveTimer: number | undefined;
        const unsubscribe = useProductStore.subscribe((state) => {
            window.clearTimeout(saveTimer);
            saveTimer = window.setTimeout(async () => {
                const body = { name: state.productTitle || 'Untitled catalog', catalog: state.getCatalogSnapshot() };
                const response = await fetch('/api/projects', {
                    method: cloudProjectId ? 'PUT' : 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(cloudProjectId ? { id: cloudProjectId, ...body } : body),
                });
                if (!cloudProjectId && response.ok) {
                    const payload = await response.json();
                    setCloudProjectId(payload.project?.id ?? null);
                }
            }, 700);
        });

        return () => {
            window.clearTimeout(saveTimer);
            unsubscribe();
        };
    }, [cloudReady, cloudProjectId]);

    if (!mounted) return <WorkspaceLoading />;

    const catalogFlags = validateProductData({
        productTitle: store.productTitle,
        options: store.options,
        variants: store.variants
    });
    const totalIssueCount = catalogFlags.length;
    const isPassingValidation = totalIssueCount === 0;
    const isEmptyWorkspace = !store.productTitle.trim() && store.options.length === 0;

    const handleTriggerExport = async () => {
        if (!isPassingValidation) {
            alert('Cannot export file. Please resolve all active validation flags inside your workspace first.');
            return;
        }

        const supabase = createSupabaseBrowserClient();
        if (supabase) {
            const response = await fetch('/api/export/shopify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productTitle: store.productTitle,
                    options: store.options,
                    skuConfig: store.skuConfig,
                    basePrice: store.basePrice,
                    priceRules: store.priceRules,
                    variants: store.variants,
                }),
            });

            if (!response.ok) {
                const error = await response.json().catch(() => null);
                alert(error?.error || 'The secure export could not be completed.');
                return;
            }

            const secureCsv = await response.blob();
            const secureDownloadUrl = URL.createObjectURL(secureCsv);
            const secureAnchor = document.createElement('a');
            secureAnchor.href = secureDownloadUrl;
            secureAnchor.download = `variantflow_export_${store.productTitle.toLowerCase().replace(/\s+/g, '_')}.csv`;
            document.body.appendChild(secureAnchor);
            secureAnchor.click();
            document.body.removeChild(secureAnchor);
            URL.revokeObjectURL(secureDownloadUrl);
            return;
        }

        const outputCsvBuffer = convertToShopifyCsv();
        const dataBlob = new Blob([outputCsvBuffer], { type: 'text/csv;charset=utf-8;' });
        const dynamicDownloadUrl = URL.createObjectURL(dataBlob);
        const operationalAnchorLink = document.createElement('a');
        operationalAnchorLink.href = dynamicDownloadUrl;
        operationalAnchorLink.download = `variantflow_export_${store.productTitle.toLowerCase().replace(/\s+/g, '_')}.csv`;
        document.body.appendChild(operationalAnchorLink);
        operationalAnchorLink.click();
        document.body.removeChild(operationalAnchorLink);
        URL.revokeObjectURL(dynamicDownloadUrl);
    };

    return (
        <WorkspaceLayout
            billingState={{ currentTier: store.subscriptionTier, rowRunsUsed: store.rowRunsUsed, rowRunsMax: store.rowRunsMax, activeInvoice: null }}
            variantCount={store.variants.length}
            onUpgradeSuccess={(tier) => store.setSubscriptionState(tier, 0, tier === 'PRO' ? 2000 : 15000)}
            onTriggerExport={handleTriggerExport}
        >
            <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-3">
                <div className="space-y-6 lg:col-span-1">
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
                        <div className="mb-4 flex items-center gap-2"><span className="flex h-5 w-5 items-center justify-center rounded-md bg-slate-950 text-[10px] font-bold text-white">1</span><h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">Product Core Configuration</h2></div>
                        <OptionsBuilder />
                    </div>
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
                        <div className="mb-4 flex items-center gap-2"><span className="flex h-5 w-5 items-center justify-center rounded-md bg-slate-950 text-[10px] font-bold text-white">2</span><h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">Automation & Pricing Rules</h2></div>
                        <RulesPanel />
                    </div>
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm"><CatalogToolsPanel /></div>
                </div>

                <div className="flex h-full flex-col space-y-6 lg:col-span-2">
                    <div className={`flex items-start gap-3 rounded-xl border p-4 transition-colors ${isPassingValidation ? 'border-emerald-200 bg-emerald-50/50 text-emerald-900' : 'border-amber-200 bg-amber-50/60 text-amber-900'}`}>
                        {isPassingValidation ? <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" /> : <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />}
                        <div className="space-y-1"><h4 className="text-xs font-bold uppercase tracking-wider">{isPassingValidation ? 'Matrix Compiled Successfully' : isEmptyWorkspace ? 'Start your catalog' : `Validation needs attention (${totalIssueCount})`}</h4>{isPassingValidation ? <p className="text-xxs leading-normal opacity-80">All variant options look structured and correct. Your catalog is ready to export.</p> : isEmptyWorkspace ? <p className="text-xxs leading-normal opacity-80">Add a product title and option categories on the left to generate your first variants.</p> : <ul className="list-inside list-disc space-y-0.5 text-xxs font-medium leading-relaxed">{catalogFlags.slice(0, 2).map((error) => <li key={error.id}>{error.message}</li>)}{totalIssueCount > 2 && <li className="font-bold text-amber-700">...and {totalIssueCount - 2} more validation errors.</li>}</ul>}</div>
                    </div>
                    <div className="flex-1"><VariantTable /></div>
                </div>
            </div>
        </WorkspaceLayout>
    );
}