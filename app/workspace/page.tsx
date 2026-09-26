'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useProductStore } from '../../store/productStore';
import { OptionsBuilder } from '../../components/product/options-builder';
import { RulesPanel } from '../../components/product/rules-panel';
import { CatalogToolsPanel } from '../../components/product/catalog-tools-panel';
import { VariantTable } from '../../components/variants/variant-table';
import { WorkspaceHeader, SaveState } from '../../components/workspace/workspace-header';
import { ValidationSummary } from '../../components/workspace/validation-summary';
import { MobileTabs, WorkspaceTab } from '../../components/workspace/mobile-tabs';
import { UpgradeDialog } from '../../components/workspace/upgrade-dialog';
import { Notice, useNotice } from '../../components/workspace/notice';
import { LogoMark } from '../../components/brand/logo';
import { validateProductData } from '../../domain/validation/validateProduct';
import { convertToShopifyCsv } from '../../exporters/shopify/csvAdapter';
import { isSupabaseConfigured } from '../../lib/supabase/config';
import { isWithinLimit } from '../../lib/entitlements';
import { AccountAccess } from '../../types';
import { cn } from '../../lib/utils';

function WorkspaceLoading() {
    return (
        <main className="flex min-h-dvh items-center justify-center bg-canvas px-6">
            <div className="animate-fade flex flex-col items-center gap-5 text-center">
                <LogoMark className="h-14 w-14 rounded-2xl shadow-lg" />
                <div>
                    <p className="text-base font-semibold text-ink">Opening your workspace</p>
                    <p className="mt-1 text-sm text-ink-3">Loading your catalog…</p>
                </div>
                <div className="h-1 w-32 overflow-hidden rounded-full bg-surface-3">
                    <div className="animate-shimmer h-full w-1/2 rounded-full bg-brand" />
                </div>
            </div>
        </main>
    );
}

function Panel({ step, title, description, children, className }: { step: number; title: string; description: string; children: React.ReactNode; className?: string }) {
    return (
        <section aria-labelledby={`panel-${step}`} className={cn('card p-5 sm:p-6', className)}>
            <header className="mb-5 flex items-start gap-3">
                <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand text-xs font-semibold text-on-brand">{step}</span>
                <div>
                    <h2 id={`panel-${step}`} className="text-base font-semibold leading-7 text-ink">{title}</h2>
                    <p className="text-sm text-ink-3">{description}</p>
                </div>
            </header>
            {children}
        </section>
    );
}

const downloadCsv = (blob: Blob, title: string) => {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `variantflow_${title.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '') || 'export'}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
};

export default function WorkspacePage() {
    const store = useProductStore();
    const [ready, setReady] = useState(false);
    const [email, setEmail] = useState<string | null>(null);
    const [cloudReady, setCloudReady] = useState(false);
    const [saveState, setSaveState] = useState<SaveState>('idle');
    const [tab, setTab] = useState<WorkspaceTab>('build');
    const [upgradeOpen, setUpgradeOpen] = useState(false);
    const [exporting, setExporting] = useState(false);
    const { notice, show, dismiss } = useNotice();
    const projectIdRef = useRef<string | null>(null);
    const lastSavedRef = useRef('');

    const loadAccess = useCallback(async (): Promise<AccountAccess | null> => {
        const response = await fetch('/api/account', { cache: 'no-store' });
        if (!response.ok) return null;
        const account = await response.json();
        if (account.access) useProductStore.getState().setAccess(account.access);
        setEmail(account.user?.email ?? null);
        return account.access ?? null;
    }, []);

    useEffect(() => {
        let cancelled = false;

        const prepareWorkspace = async () => {
            const { recompileCatalogMatrix, hydrateCatalog, getCatalogSnapshot } = useProductStore.getState();
            recompileCatalogMatrix();

            if (isSupabaseConfigured()) {
                const [, projectsResponse] = await Promise.all([
                    loadAccess().catch(() => null),
                    fetch('/api/projects', { cache: 'no-store' }).catch(() => null),
                ]);

                if (projectsResponse?.ok) {
                    const project = (await projectsResponse.json()).projects?.[0];
                    if (project?.catalog) {
                        hydrateCatalog(project.catalog);
                        projectIdRef.current = project.id;
                    }
                }
                lastSavedRef.current = JSON.stringify(getCatalogSnapshot());
                if (!cancelled) setCloudReady(true);
            }

            if (!cancelled) setReady(true);
        };

        void prepareWorkspace();
        return () => { cancelled = true; };
    }, [loadAccess]);

    useEffect(() => {
        if (!cloudReady) return;

        let saveTimer: number | undefined;
        const unsubscribe = useProductStore.subscribe((state) => {
            const snapshot = state.getCatalogSnapshot();
            const serialized = JSON.stringify(snapshot);
            if (serialized === lastSavedRef.current) return;

            window.clearTimeout(saveTimer);
            setSaveState('saving');
            saveTimer = window.setTimeout(async () => {
                const body = { name: snapshot.productTitle || 'Untitled catalog', catalog: snapshot };
                const projectId = projectIdRef.current;
                try {
                    const response = await fetch('/api/projects', {
                        method: projectId ? 'PUT' : 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(projectId ? { id: projectId, ...body } : body),
                    });
                    if (!response.ok) throw new Error();
                    if (!projectId) projectIdRef.current = (await response.json()).project?.id ?? null;
                    lastSavedRef.current = serialized;
                    setSaveState('saved');
                } catch {
                    setSaveState('error');
                }
            }, 700);
        });

        return () => {
            window.clearTimeout(saveTimer);
            unsubscribe();
        };
    }, [cloudReady]);

    if (!ready) return <WorkspaceLoading />;

    const { access } = store;
    const issues = validateProductData({ productTitle: store.productTitle, options: store.options, variants: store.variants });
    const isEmpty = !store.productTitle.trim() && store.options.length === 0;
    const variantLimit = access.entitlements.maxVariantsPerProject;
    const withinLimit = isWithinLimit(variantLimit, store.variants.length);
    const canUpgrade = !access.role && access.tier === 'FREE';

    const handleExport = async () => {
        if (isEmpty || issues.length > 0) {
            setTab('variants');
            show('error', isEmpty ? 'Add a product title and options before exporting.' : 'Fix the highlighted issues before exporting.');
            return;
        }

        if (!isSupabaseConfigured()) {
            downloadCsv(new Blob([convertToShopifyCsv()], { type: 'text/csv;charset=utf-8;' }), store.productTitle);
            show('success', 'Your Shopify CSV has been downloaded.');
            return;
        }

        setExporting(true);
        try {
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
                show('error', error?.error || 'The export could not be completed. Please try again.');
                if (response.status === 403 && canUpgrade) setUpgradeOpen(true);
                return;
            }

            downloadCsv(await response.blob(), store.productTitle);
            show('success', `Exported ${store.variants.length} variants to a Shopify CSV.`);
        } catch {
            show('error', 'You appear to be offline. Check your connection and try again.');
        } finally {
            setExporting(false);
        }
    };

    const refreshAccess = async () => {
        const next = await loadAccess().catch(() => null);
        const upgraded = !!next && (next.role !== null || next.tier !== 'FREE');
        if (upgraded) show('success', 'Your plan is active. Enjoy the upgrade!');
        return upgraded;
    };

    const panelVisibility = (id: WorkspaceTab) => (tab === id ? 'block' : 'hidden lg:block');

    return (
        <div className="min-h-dvh bg-canvas">
            <WorkspaceHeader
                title={store.productTitle}
                email={email}
                access={access}
                saveState={saveState}
                exporting={exporting}
                exportBlocked={!withinLimit}
                onExport={handleExport}
                onUpgrade={() => setUpgradeOpen(true)}
            />

            <main id="main" className="mx-auto max-w-[1600px] px-4 pb-[calc(env(safe-area-inset-bottom)+6.5rem)] pt-5 sm:px-6 lg:pb-12 lg:pt-8">
                <h1 className="sr-only">VariantFlow workspace</h1>
                <div className="grid items-start gap-6 lg:grid-cols-[minmax(22rem,26rem)_1fr] xl:gap-8">
                    <div className="space-y-6 lg:sticky lg:top-24 lg:max-h-[calc(100dvh-7rem)] lg:overflow-y-auto lg:pb-2 scroll-thin">
                        <Panel step={1} title="Product" description="Name it and list its options." className={panelVisibility('build')}>
                            <OptionsBuilder />
                        </Panel>
                        <Panel step={2} title="Rules" description="SKUs and pricing, applied to every variant." className={panelVisibility('rules')}>
                            <RulesPanel />
                        </Panel>
                        <Panel step={3} title="Tools" description="Import supplier data and send feedback." className={panelVisibility('tools')}>
                            <CatalogToolsPanel onUpgrade={() => setUpgradeOpen(true)} />
                        </Panel>
                    </div>

                    <div className={cn('min-w-0 space-y-5', panelVisibility('variants'))}>
                        <ValidationSummary
                            issues={issues}
                            isEmpty={isEmpty}
                            variantCount={store.variants.length}
                            variantLimit={variantLimit}
                            canUpgrade={canUpgrade}
                            onUpgrade={() => setUpgradeOpen(true)}
                        />
                        <VariantTable />
                    </div>
                </div>
            </main>

            <MobileTabs active={tab} onChange={setTab} variantCount={store.variants.length} issueCount={issues.length} />
            <UpgradeDialog open={upgradeOpen} onOpenChange={setUpgradeOpen} onRefreshAccess={refreshAccess} onError={(message) => show('error', message)} />
            <Notice notice={notice} onDismiss={dismiss} />
        </div>
    );
}
