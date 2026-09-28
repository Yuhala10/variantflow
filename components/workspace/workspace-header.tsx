'use client';

import Link from 'next/link';
import { Check, CloudOff, Loader2, Sparkles } from 'lucide-react';
import { LogoMark } from '../brand/logo';
import { AccountAccess } from '../../types';
import { nextTier } from '../../lib/entitlements';
import type { ExportPlatform } from '../../exporters';
import { useI18n } from '../i18n/i18n-provider';
import { AccountMenu } from './account-menu';
import { PlanBadge } from './plan-badge';
import { ExportMenu } from './export-menu';
import { ProjectSwitcher, type ProjectSummary } from './project-switcher';

export type SaveState = 'idle' | 'saving' | 'saved' | 'error';

interface WorkspaceHeaderProps {
    title: string;
    email: string | null;
    access: AccountAccess;
    saveState: SaveState;
    exporting: boolean;
    exportBlocked: boolean;
    projects: ProjectSummary[];
    currentProjectId: string | null;
    canCreateProject: boolean;
    onExport: (platform: ExportPlatform) => void;
    onUpgrade: () => void;
    onUnlockPlatforms: () => void;
    onExtend: () => void;
    onSelectProject: (id: string) => void;
    onCreateProject: () => void;
    onDeleteProject: (id: string) => void;
}

function SaveIndicator({ state }: { state: SaveState }) {
    const { t } = useI18n();
    if (state === 'idle') return null;
    const content = {
        saving: <><Loader2 className="h-3.5 w-3.5 animate-spin" /> {t.workspace.saving}</>,
        saved: <><Check className="h-3.5 w-3.5 text-success" /> {t.workspace.saved}</>,
        error: <><CloudOff className="h-3.5 w-3.5 text-danger" /> {t.workspace.notSaved}</>,
    }[state];
    return <span aria-live="polite" className="inline-flex items-center gap-1.5 text-xs text-ink-3">{content}</span>;
}

export function WorkspaceHeader(props: WorkspaceHeaderProps) {
    const { title, email, access, saveState, exporting, exportBlocked, onExport, onUpgrade } = props;
    const { t, href } = useI18n();
    const canUpgrade = nextTier(access) !== null;
    const displayTitle = title.trim() || t.workspace.untitled;

    return (
        <header className="safe-top sticky top-0 z-40 border-b border-line bg-canvas/80 backdrop-blur-xl backdrop-saturate-150">
            <div className="mx-auto flex h-16 max-w-[1600px] items-center gap-2 px-4 sm:gap-3 sm:px-6">
                <Link href={href('/')} aria-label="VariantFlow" className="shrink-0"><LogoMark /></Link>
                <div className="min-w-0 flex-1">
                    {email ? (
                        <ProjectSwitcher
                            title={displayTitle}
                            projects={props.projects}
                            currentId={props.currentProjectId}
                            canCreate={props.canCreateProject}
                            onSelect={props.onSelectProject}
                            onCreate={props.onCreateProject}
                            onDelete={props.onDeleteProject}
                        />
                    ) : (
                        <p className="truncate px-1.5 text-[15px] font-semibold leading-tight text-ink">{displayTitle}</p>
                    )}
                    <div className="flex items-center gap-2 px-1.5">
                        <span className="hidden text-xs text-ink-3 sm:inline">{t.workspace.label}</span>
                        <SaveIndicator state={saveState} />
                    </div>
                </div>

                <div className="hidden md:block"><PlanBadge access={access} /></div>

                {canUpgrade && (
                    <button type="button" onClick={onUpgrade} className="btn btn-soft btn-sm hidden sm:inline-flex">
                        <Sparkles /> {t.workspace.upgrade}
                    </button>
                )}

                <ExportMenu
                    exporting={exporting}
                    blocked={exportBlocked}
                    multiPlatform={access.entitlements.canUseMultiPlatformExport}
                    onExport={onExport}
                    onLocked={props.onUnlockPlatforms}
                />

                <AccountMenu email={email} access={access} onUpgrade={onUpgrade} onExtend={props.onExtend} />
            </div>
        </header>
    );
}
