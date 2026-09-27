'use client';

import { useCallback, useRef, useState } from 'react';
import { Check, ChevronsUpDown, Lock, Plus, Trash2 } from 'lucide-react';
import { useI18n } from '../i18n/i18n-provider';
import { useDismiss } from './use-dismiss';
import { cn } from '../../lib/utils';

export interface ProjectSummary {
    id: string;
    name: string;
    updated_at: string;
}

interface ProjectSwitcherProps {
    title: string;
    projects: ProjectSummary[];
    currentId: string | null;
    canCreate: boolean;
    onSelect: (id: string) => void;
    onCreate: () => void;
    onDelete: (id: string) => void;
}

export function ProjectSwitcher({ title, projects, currentId, canCreate, onSelect, onCreate, onDelete }: ProjectSwitcherProps) {
    const { t, formatDate } = useI18n();
    const copy = t.workspace.projects;
    const [open, setOpen] = useState(false);
    const [confirmingId, setConfirmingId] = useState<string | null>(null);
    const ref = useRef<HTMLDivElement>(null);
    const close = useCallback(() => { setOpen(false); setConfirmingId(null); }, []);
    useDismiss(ref, open, close);

    return (
        <div ref={ref} className="relative min-w-0">
            <button
                type="button"
                onClick={() => setOpen((value) => !value)}
                aria-expanded={open}
                aria-haspopup="menu"
                aria-label={copy.label}
                className="flex max-w-full items-center gap-1.5 rounded-lg px-1.5 py-1 text-left transition-colors hover:bg-surface-2"
            >
                <span className="truncate text-[15px] font-semibold leading-tight text-ink">{title}</span>
                <ChevronsUpDown className="h-4 w-4 shrink-0 text-ink-3" />
            </button>

            {open && (
                <div role="menu" className="animate-rise absolute left-0 top-[calc(100%+0.5rem)] z-50 w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-line bg-surface shadow-xl [animation-duration:0.25s]">
                    <p className="px-4 pb-1 pt-3 text-xs font-semibold text-ink-3">{copy.label}</p>
                    <ul className="scroll-thin max-h-72 overflow-y-auto p-1.5">
                        {projects.map((project) => {
                            const current = project.id === currentId;
                            const confirming = confirmingId === project.id;
                            return (
                                <li key={project.id} className="group relative">
                                    {confirming ? (
                                        <div className="animate-fade rounded-lg bg-danger-soft p-3">
                                            <p className="text-sm text-ink">{copy.confirmDelete({ name: project.name || copy.untitled })}</p>
                                            <div className="mt-2.5 flex gap-2">
                                                <button type="button" onClick={() => { onDelete(project.id); close(); }} className="btn btn-sm bg-danger text-surface hover:opacity-90">{t.common.delete}</button>
                                                <button type="button" onClick={() => setConfirmingId(null)} className="btn btn-secondary btn-sm">{t.common.cancel}</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className={cn('flex items-center rounded-lg', current ? 'bg-brand-soft/60' : 'hover:bg-surface-2')}>
                                            <button
                                                type="button"
                                                role="menuitem"
                                                onClick={() => { if (!current) onSelect(project.id); close(); }}
                                                className="flex min-h-12 min-w-0 flex-1 items-center gap-3 px-3 text-left"
                                            >
                                                <span className="min-w-0 flex-1">
                                                    <span className="block truncate text-sm font-medium text-ink">{project.name || copy.untitled}</span>
                                                    <span className="block text-xs text-ink-3">{copy.edited({ date: formatDate(project.updated_at) })}</span>
                                                </span>
                                                {current && <Check className="h-4 w-4 shrink-0 text-brand" aria-label={copy.current} />}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setConfirmingId(project.id)}
                                                aria-label={`${copy.delete}: ${project.name || copy.untitled}`}
                                                className="mr-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-ink-3 opacity-100 transition-opacity hover:bg-danger-soft hover:text-danger sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                    <div className="border-t border-line p-1.5">
                        <button
                            type="button"
                            role="menuitem"
                            onClick={() => { onCreate(); close(); }}
                            className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium text-brand-ink hover:bg-brand-soft"
                        >
                            {canCreate ? <Plus className="h-4 w-4" /> : <Lock className="h-4 w-4" />} {copy.new}
                        </button>
                        {!canCreate && <p className="px-3 pb-2 text-xs text-ink-3">{copy.limit}</p>}
                    </div>
                </div>
            )}
        </div>
    );
}
