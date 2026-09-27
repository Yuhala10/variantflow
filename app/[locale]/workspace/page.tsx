'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useProductStore, type CatalogSnapshot } from '../../../store/productStore';
import { OptionsBuilder } from '../../../components/product/options-builder';
import { RulesPanel } from '../../../components/product/rules-panel';
import { ImportPanel } from '../../../components/product/import-panel';
import { FeedbackForm } from '../../../components/product/feedback-form';
import { VariantTable } from '../../../components/variants/variant-table';
import { WorkspaceHeader, type SaveState } from '../../../components/workspace/workspace-header';
import { ValidationSummary } from '../../../components/workspace/validation-summary';
import { MobileTabs, type WorkspaceTab } from '../../../components/workspace/mobile-tabs';
import { UpgradeDialog } from '../../../components/workspace/upgrade-dialog';
import { Notice, useNotice } from '../../../components/workspace/notice';
import { LogoMark } from '../../../components/brand/logo';
import { useI18n } from '../../../components/i18n/i18n-provider';
import { validateProductData } from '../../../domain/validation/validateProduct';
import type { ImportedCatalog } from '../../../domain/import/importCatalog';
import { EXPORT_PLATFORMS, type ExportPlatform } from '../../../exporters';
import { isSupabaseConfigured } from '../../../lib/supabase/config';
import { isWithinLimit } from '../../../lib/entitlements';
import { translateCode } from '../../../lib/i18n';
import type { AccountAccess } from '../../../types';
import { cn } from '../../../lib/utils';

interface Project {
    id: string;
    name: string;
    updated_at: string;
    catalog: Partial<CatalogSnapshot>;
}

interface PendingSave {
    timer: number;
    snapshot: CatalogSnapshot;
    serialized: string;
    session: number;
}

const EMPTY_CATALOG: CatalogSnapshot = { productTitle: '', options: [], skuConfig: { pattern: '' }, basePrice: 0, priceRules: [], overrides: {} };

const newId = () => (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2));

function WorkspaceLoading() {
    const { t } = useI18n();
    return (
        <main className="flex min-h-dvh items-center justify-center bg-canvas px-6">
            <div className="animate-fade flex flex-col items-center gap-5 text-center">
                <LogoMark className="h-14 w-14 rounded-2xl shadow-lg" />
                <div>
                    <p className="text-base font-semibold text-ink">{t.workspace.loadingTitle}</p>
                    <p className="mt-1 text-sm text-ink-3">{t.workspace.loadingSub}</p>
                </div>
                <div className="h-1 w-32 overflow-hidden rounded-full bg-surface-3">
                    <div className="animate-shimmer h-full w-1/2 rounded-full bg-brand" />
                </div>
            </div>
        </main>
    );
}

function Panel({ id, step, title, description, children, className }: { id: string; step: number; title: string; description: string; children: React.ReactNode; className?: string }) {
    return (
        <section aria-labelledby={`panel-${id}`} className={cn('card p-5 sm:p-6', className)}>
            <header className="mb-5 flex items-start gap-3">
                <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand text-xs font-semibold text-on-brand">{step}</span>
                <div>
                    <h2 id={`panel-${id}`} className="text-base font-semibold leading-7 text-ink">{title}</h2>
                    <p className="text-sm text-ink-3">{description}</p>
                </div>
            </header>
            {children}
        </section>
    );
}

const fileNameFrom = (response: Response, fallback: string) => {
    const match = /filename="([^"]+)"/.exec(response.headers.get('Content-Disposition') ?? '');
    return match?.[1] ?? fallback;
};

const downloadBlob = (blob: Blob, fileName: string) => {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
};

export default function WorkspacePage() {
    const { t } = useI18n();
    const store = useProductStore();
    const [ready, setReady] = useState(false);
    const [email, setEmail] = useState<string | null>(null);
    const [cloudReady, setCloudReady] = useState(false);
    const [saveState, setSaveState] = useState<SaveState>('idle');
    const [tab, setTab] = useState<WorkspaceTab>('build');
    const [upgradeOpen, setUpgradeOpen] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [projects, setProjects] = useState<Project[]>([]);
    const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
    const [rowRunsUsed, setRowRunsUsed] = useState(0);
    const { notice, show, dismiss } = useNotice();

    const projectIdRef = useRef<string | null>(null);
    const lastSavedRef = useRef('');
    const pendingRef = useRef<PendingSave | null>(null);
    const saveChainRef = useRef<Promise<void>>(Promise.resolve());
    // Incremented whenever the open project changes, so stale saves never land in the wrong project.
    const sessionRef = useRef(0);
    const suppressRef = useRef(false);

    const apiMessage = useCallback((payload: { code?: string; limit?: number | null; error?: string } | null, fallback: string) =>
        translateCode(t.apiErrors, payload?.code, { limit: payload?.limit ?? '' }, fallback), [t]);

    const loadAccess = useCallback(async (): Promise<AccountAccess | null> => {
        const response = await fetch('/api/account', { cache: 'no-store' });
        if (!response.ok) return null;
        const account = await response.json();
        if (account.access) useProductStore.getState().setAccess(account.access);
        setEmail(account.user?.email ?? null);
        setRowRunsUsed(account.usage?.rowRunsUsed ?? 0);
        return account.access ?? null;
    }, []);

    /** Loads a catalog into the editor without triggering an autosave. */
    const openCatalog = useCallback((projectId: string | null, catalog: Partial<CatalogSnapshot>) => {
        sessionRef.current += 1;
        projectIdRef.current = projectId;
        setCurrentProjectId(projectId);
        suppressRef.current = true;
        useProductStore.getState().replaceCatalog(catalog);
        lastSavedRef.current = JSON.stringify(useProductStore.getState().getCatalogSnapshot());
        suppressRef.current = false;
        setSaveState('idle');
    }, []);

    const persist = useCallback((pending: Omit<PendingSave, 'timer'>) => {
        saveChainRef.current = saveChainRef.current.then(async () => {
            if (pending.session !== sessionRef.current) return;
            const projectId = projectIdRef.current;
            const body = { name: pending.snapshot.productTitle || t.workspace.projects.untitled, catalog: pending.snapshot };
            try {
                const response = await fetch('/api/projects', {
                    method: projectId ? 'PUT' : 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(projectId ? { id: projectId, ...body } : body),
                });
                if (!response.ok) throw new Error();
                const saved = (await response.json()).project as Project | undefined;
                if (saved) {
                    if (!projectId && pending.session === sessionRef.current) {
                        projectIdRef.current = saved.id;
                        setCurrentProjectId(saved.id);
                    }
                    setProjects((list) => [saved, ...list.filter((project) => project.id !== saved.id)]);
                }
                if (pending.session === sessionRef.current) {
                    lastSavedRef.current = pending.serialized;
                    setSaveState('saved');
                }
            } catch {
                if (pending.session === sessionRef.current) setSaveState('error');
            }
        });
        return saveChainRef.current;
    }, [t]);

    /** Saves any pending change immediately (before switching or creating projects). */
    const flushPendingSave = useCallback(async () => {
        const pending = pendingRef.current;
        if (pending) {
            window.clearTimeout(pending.timer);
            pendingRef.current = null;
            await persist(pending);
        }
        await saveChainRef.current;
    }, [persist]);

    useEffect(() => {
        let cancelled = false;

        const prepareWorkspace = async () => {
            useProductStore.getState().recompileCatalogMatrix();

            if (isSupabaseConfigured()) {
                const [, projectsResponse] = await Promise.all([
                    loadAccess().catch(() => null),
                    fetch('/api/projects', { cache: 'no-store' }).catch(() => null),
                ]);

                const list: Project[] = projectsResponse?.ok ? (await projectsResponse.json()).projects ?? [] : [];
                if (cancelled) return;
                setProjects(list);
                if (list[0]) openCatalog(list[0].id, list[0].catalog);
                else lastSavedRef.current = JSON.stringify(useProductStore.getState().getCatalogSnapshot());
                setCloudReady(true);
            }

            if (!cancelled) setReady(true);
        };

        void prepareWorkspace();
        return () => { cancelled = true; };
    }, [loadAccess, openCatalog]);

    useEffect(() => {
        if (!cloudReady) return;

        const unsubscribe = useProductStore.subscribe((state) => {
            if (suppressRef.current) return;
            const snapshot = state.getCatalogSnapshot();
            const serialized = JSON.stringify(snapshot);
            if (serialized === lastSavedRef.current) return;

            if (pendingRef.current) window.clearTimeout(pendingRef.current.timer);
            setSaveState('saving');
            const session = sessionRef.current;
            const timer = window.setTimeout(() => {
                const pending = pendingRef.current;
                pendingRef.current = null;
                if (pending) void persist(pending);
            }, 700);
            pendingRef.current = { timer, snapshot, serialized, session };
        });

        return () => {
            if (pendingRef.current) window.clearTimeout(pendingRef.current.timer);
            unsubscribe();
        };
    }, [cloudReady, persist]);

    if (!ready) return <WorkspaceLoading />;

    const { access } = store;
    const { entitlements } = access;
    const issues = validateProductData(
        { productTitle: store.productTitle, options: store.options, variants: store.variants },
        { advanced: entitlements.canUseAdvancedValidation },
    );
    const errors = issues.filter((issue) => issue.severity === 'error');
    const warnings = issues.filter((issue) => issue.severity === 'warning');
    const isEmpty = !store.productTitle.trim() && store.options.length === 0;
    const variantLimit = entitlements.maxVariantsPerProject;
    const withinLimit = isWithinLimit(variantLimit, store.variants.length);
    const canUpgrade = !access.role && access.tier === 'FREE';
    const canCreateProject = entitlements.maxProjects === null || projects.length < entitlements.maxProjects;

    const handleExport = async (platform: ExportPlatform) => {
        if (isEmpty || errors.length > 0) {
            setTab('variants');
            show('error', isEmpty ? t.workspace.notices.addBeforeExport : t.workspace.notices.fixBeforeExport);
            return;
        }
        const formatName = t.workspace.exportMenu.formats[platform].name;
        const catalog = {
            productTitle: store.productTitle,
            options: store.options,
            skuConfig: store.skuConfig,
            basePrice: store.basePrice,
            priceRules: store.priceRules,
            variants: store.variants,
        };

        if (!isSupabaseConfigured()) {
            const csv = EXPORT_PLATFORMS[platform].convert(catalog);
            downloadBlob(new Blob([csv], { type: 'text/csv;charset=utf-8;' }), `variantflow_${EXPORT_PLATFORMS[platform].fileSuffix}.csv`);
            show('success', t.workspace.notices.downloaded({ count: store.variants.length, format: formatName }));
            return;
        }

        setExporting(true);
        try {
            const response = await fetch(`/api/export/${platform}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(catalog),
            });

            if (!response.ok) {
                const payload = await response.json().catch(() => null);
                show('error', apiMessage(payload, t.workspace.notices.exportFailed));
                if (canUpgrade && ['variant-limit', 'platform-locked'].includes(payload?.code)) setUpgradeOpen(true);
                return;
            }

            const used = Number(response.headers.get('X-Row-Runs-Used'));
            if (Number.isFinite(used) && used > 0) setRowRunsUsed(used);
            downloadBlob(await response.blob(), fileNameFrom(response, `variantflow_${EXPORT_PLATFORMS[platform].fileSuffix}.csv`));
            show('success', t.workspace.notices.downloaded({ count: store.variants.length, format: formatName }));
        } catch {
            show('error', t.workspace.notices.offline);
        } finally {
            setExporting(false);
        }
    };

    const handleImport = async (catalog: ImportedCatalog, rows: number) => {
        try {
            const response = await fetch('/api/usage/import', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rows }),
            });
            const payload = await response.json().catch(() => null);
            if (!response.ok) {
                show('error', apiMessage(payload, t.apiErrors['server-error']()));
                return false;
            }
            if (typeof payload?.used === 'number') setRowRunsUsed(payload.used);
        } catch {
            show('error', t.workspace.notices.offline);
            return false;
        }

        const current = useProductStore.getState();
        current.replaceCatalog({
            productTitle: catalog.productTitle || current.productTitle,
            options: catalog.options.map((option) => ({ id: newId(), name: option.name, values: option.values })),
            skuConfig: current.skuConfig,
            basePrice: catalog.basePrice,
            priceRules: [],
            overrides: catalog.overrides,
        });
        show('success', t.workspace.tools.imported({ variants: useProductStore.getState().variants.length }));
        setTab('variants');
        return true;
    };

    const selectProject = async (id: string) => {
        const project = projects.find((item) => item.id === id);
        if (!project) return;
        await flushPendingSave();
        openCatalog(project.id, project.catalog);
    };

    const createProject = async () => {
        if (!canCreateProject) {
            show('error', t.workspace.projects.limit);
            if (canUpgrade) setUpgradeOpen(true);
            return;
        }
        await flushPendingSave();
        try {
            const response = await fetch('/api/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: t.workspace.projects.untitled, catalog: EMPTY_CATALOG }),
            });
            const payload = await response.json().catch(() => null);
            if (!response.ok || !payload?.project) {
                show('error', apiMessage(payload, t.apiErrors['server-error']()));
                if (payload?.code === 'project-limit' && canUpgrade) setUpgradeOpen(true);
                return;
            }
            setProjects((list) => [payload.project, ...list]);
            openCatalog(payload.project.id, EMPTY_CATALOG);
            setTab('build');
            show('success', t.workspace.projects.created);
        } catch {
            show('error', t.workspace.notices.offline);
        }
    };

    const deleteProject = async (id: string) => {
        try {
            const response = await fetch(`/api/projects?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
            if (!response.ok) throw new Error();
        } catch {
            show('error', t.apiErrors['server-error']());
            return;
        }
        const remaining = projects.filter((project) => project.id !== id);
        setProjects(remaining);
        if (id === projectIdRef.current) {
            if (pendingRef.current) {
                window.clearTimeout(pendingRef.current.timer);
                pendingRef.current = null;
            }
            if (remaining[0]) openCatalog(remaining[0].id, remaining[0].catalog);
            else openCatalog(null, EMPTY_CATALOG);
        }
        show('success', t.workspace.projects.deleted);
    };

    const refreshAccess = async () => {
        const next = await loadAccess().catch(() => null);
        const upgraded = !!next && (next.role !== null || next.tier !== 'FREE');
        if (upgraded) show('success', t.workspace.upgradeDialog.active);
        return upgraded;
    };

    const panelVisibility = (id: WorkspaceTab) => (tab === id ? 'block' : 'hidden lg:block');
    const panels = t.workspace.panels;

    return (
        <div className="min-h-dvh bg-canvas">
            <WorkspaceHeader
                title={store.productTitle}
                email={email}
                access={access}
                saveState={saveState}
                exporting={exporting}
                exportBlocked={!withinLimit}
                projects={projects}
                currentProjectId={currentProjectId}
                canCreateProject={canCreateProject}
                onExport={handleExport}
                onUpgrade={() => setUpgradeOpen(true)}
                onSelectProject={selectProject}
                onCreateProject={createProject}
                onDeleteProject={deleteProject}
            />

            <main id="main" className="mx-auto max-w-[1600px] px-4 pb-[calc(env(safe-area-inset-bottom)+6.5rem)] pt-5 sm:px-6 lg:pb-12 lg:pt-8">
                <h1 className="sr-only">{t.workspace.srTitle}</h1>
                <div className="grid items-start gap-6 lg:grid-cols-[minmax(22rem,26rem)_1fr] xl:gap-8">
                    <div className="scroll-thin space-y-6 lg:sticky lg:top-24 lg:max-h-[calc(100dvh-7rem)] lg:overflow-y-auto lg:pb-2">
                        <Panel id="product" step={1} title={panels.product.title} description={panels.product.description} className={panelVisibility('build')}>
                            <OptionsBuilder />
                        </Panel>
                        <Panel id="rules" step={2} title={panels.rules.title} description={panels.rules.description} className={panelVisibility('rules')}>
                            <RulesPanel />
                        </Panel>
                        <Panel id="tools" step={3} title={panels.tools.title} description={panels.tools.description} className={panelVisibility('tools')}>
                            <div className="space-y-8">
                                <ImportPanel onUpgrade={() => setUpgradeOpen(true)} onImport={handleImport} onError={(message) => show('error', message)} />
                                <div className="border-t border-line pt-7"><FeedbackForm /></div>
                            </div>
                        </Panel>
                    </div>

                    <div className={cn('min-w-0 space-y-5', panelVisibility('variants'))}>
                        <ValidationSummary
                            errors={errors}
                            warnings={warnings}
                            advancedEnabled={entitlements.canUseAdvancedValidation}
                            isEmpty={isEmpty}
                            variantCount={store.variants.length}
                            variantLimit={variantLimit}
                            rowRunsUsed={rowRunsUsed}
                            rowRunLimit={entitlements.monthlyRowRuns}
                            canUpgrade={canUpgrade}
                            onUpgrade={() => setUpgradeOpen(true)}
                        />
                        <VariantTable />
                    </div>
                </div>
            </main>

            <MobileTabs active={tab} onChange={setTab} variantCount={store.variants.length} issueCount={errors.length} />
            <UpgradeDialog open={upgradeOpen} onOpenChange={setUpgradeOpen} onRefreshAccess={refreshAccess} onError={(message) => show('error', message)} />
            <Notice notice={notice} onDismiss={dismiss} />
        </div>
    );
}
