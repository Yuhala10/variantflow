'use client';

import { Grid3x3, Layers, SlidersHorizontal, Wrench } from 'lucide-react';
import { cn } from '../../lib/utils';

export type WorkspaceTab = 'build' | 'rules' | 'variants' | 'tools';

const TABS: Array<{ id: WorkspaceTab; label: string; icon: typeof Layers }> = [
    { id: 'build', label: 'Product', icon: Layers },
    { id: 'rules', label: 'Rules', icon: SlidersHorizontal },
    { id: 'variants', label: 'Variants', icon: Grid3x3 },
    { id: 'tools', label: 'Tools', icon: Wrench },
];

export function MobileTabs({ active, onChange, variantCount, issueCount }: { active: WorkspaceTab; onChange: (tab: WorkspaceTab) => void; variantCount: number; issueCount: number }) {
    return (
        <nav aria-label="Workspace sections" className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-line bg-canvas/85 backdrop-blur-xl backdrop-saturate-150 lg:hidden">
            <ul className="mx-auto grid max-w-lg grid-cols-4">
                {TABS.map(({ id, label, icon: Icon }) => {
                    const selected = active === id;
                    const badge = id === 'variants' && variantCount > 0 ? variantCount : null;
                    return (
                        <li key={id}>
                            <button
                                type="button"
                                onClick={() => onChange(id)}
                                aria-current={selected ? 'page' : undefined}
                                className={cn('relative flex h-16 w-full flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors', selected ? 'text-brand' : 'text-ink-3')}
                            >
                                <span className={cn('relative inline-flex h-8 w-14 items-center justify-center rounded-full transition-colors duration-200', selected && 'bg-brand-soft')}>
                                    <Icon className="h-5 w-5" />
                                    {badge !== null && (
                                        <span className={cn('absolute -right-0.5 -top-1 min-w-5 rounded-full px-1 text-[10px] font-semibold leading-5 tabular-nums', issueCount ? 'bg-warn text-surface' : 'bg-brand text-on-brand')}>
                                            {badge > 999 ? '999+' : badge}
                                        </span>
                                    )}
                                </span>
                                {label}
                            </button>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}
