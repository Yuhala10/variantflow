'use client';

import Link from 'next/link';
import { Check, CloudOff, Download, Loader2, Sparkles } from 'lucide-react';
import { LogoMark } from '../brand/logo';
import { AccountAccess } from '../../types';
import { AccountMenu } from './account-menu';
import { PlanBadge } from './plan-badge';

export type SaveState = 'idle' | 'saving' | 'saved' | 'error';

interface WorkspaceHeaderProps {
    title: string;
    email: string | null;
    access: AccountAccess;
    saveState: SaveState;
    exporting: boolean;
    exportBlocked: boolean;
    onExport: () => void;
    onUpgrade: () => void;
}

function SaveIndicator({ state }: { state: SaveState }) {
    if (state === 'idle') return null;
    const content = {
        saving: <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving…</>,
        saved: <><Check className="h-3.5 w-3.5 text-success" /> Saved</>,
        error: <><CloudOff className="h-3.5 w-3.5 text-danger" /> Not saved</>,
    }[state];
    return <span aria-live="polite" className="inline-flex items-center gap-1.5 text-xs text-ink-3">{content}</span>;
}

export function WorkspaceHeader({ title, email, access, saveState, exporting, exportBlocked, onExport, onUpgrade }: WorkspaceHeaderProps) {
    const isFree = !access.role && access.tier === 'FREE';

    return (
        <header className="safe-top sticky top-0 z-40 border-b border-line bg-canvas/80 backdrop-blur-xl backdrop-saturate-150">
            <div className="mx-auto flex h-16 max-w-[1600px] items-center gap-3 px-4 sm:px-6">
                <Link href="/" aria-label="VariantFlow home" className="shrink-0">
                    <LogoMark />
                </Link>
                <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] font-semibold leading-tight text-ink">{title.trim() || 'Untitled product'}</p>
                    <div className="flex items-center gap-2">
                        <span className="hidden text-xs text-ink-3 sm:inline">Workspace</span>
                        <SaveIndicator state={saveState} />
                    </div>
                </div>

                <div className="hidden md:block"><PlanBadge access={access} /></div>

                {isFree && (
                    <button type="button" onClick={onUpgrade} className="btn btn-soft btn-sm hidden sm:inline-flex">
                        <Sparkles /> Upgrade
                    </button>
                )}

                <button
                    type="button"
                    onClick={onExport}
                    disabled={exporting || exportBlocked}
                    className="btn btn-primary btn-sm"
                    title={exportBlocked ? 'Your catalog is larger than your plan allows' : 'Download a Shopify-ready CSV'}
                >
                    {exporting ? <Loader2 className="animate-spin" /> : <Download />}
                    <span className="hidden sm:inline">Export CSV</span>
                    <span className="sm:hidden">Export</span>
                </button>

                <AccountMenu email={email} access={access} onUpgrade={onUpgrade} />
            </div>
        </header>
    );
}
