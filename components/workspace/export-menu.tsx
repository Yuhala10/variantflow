'use client';

import { useCallback, useRef, useState } from 'react';
import { ChevronDown, Download, Loader2, Lock } from 'lucide-react';
import type { ExportPlatform } from '../../exporters';
import { useI18n } from '../i18n/i18n-provider';
import { useDismiss } from './use-dismiss';

interface ExportMenuProps {
    exporting: boolean;
    blocked: boolean;
    multiPlatform: boolean;
    onExport: (platform: ExportPlatform) => void;
    onLocked: () => void;
}

const FORMATS: ExportPlatform[] = ['shopify', 'woocommerce', 'universal'];

/**
 * Primary button exports Shopify; the chevron opens the other formats (Scale).
 * A catalog over the plan's limit stays clickable so the click can offer the upgrade.
 */
export function ExportMenu({ exporting, blocked, multiPlatform, onExport, onLocked }: ExportMenuProps) {
    const { t } = useI18n();
    const copy = t.workspace.exportMenu;
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const close = useCallback(() => setOpen(false), []);
    useDismiss(ref, open, close);

    return (
        <div ref={ref} className="relative flex">
            <button
                type="button"
                onClick={() => onExport('shopify')}
                disabled={exporting}
                title={blocked ? t.workspace.exportBlocked : copy.formats.shopify.description}
                className="btn btn-primary btn-sm rounded-r-none"
            >
                {exporting ? <Loader2 className="animate-spin" /> : blocked ? <Lock /> : <Download />}
                <span className="hidden sm:inline">{t.workspace.exportCsv}</span>
                <span className="sm:hidden">{t.workspace.export}</span>
            </button>
            <button
                type="button"
                onClick={() => setOpen((value) => !value)}
                disabled={exporting}
                aria-expanded={open}
                aria-haspopup="menu"
                aria-label={copy.more}
                className="btn btn-primary btn-sm rounded-l-none border-l border-l-on-brand/20 px-2"
            >
                <ChevronDown className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
            </button>

            {open && (
                <div role="menu" aria-label={copy.label} className="animate-rise absolute right-0 top-[calc(100%+0.5rem)] z-50 w-72 overflow-hidden rounded-2xl border border-line bg-surface p-1.5 shadow-xl [animation-duration:0.25s]">
                    {FORMATS.map((format) => {
                        const locked = format !== 'shopify' && !multiPlatform;
                        const { name, description } = copy.formats[format];
                        return (
                            <button
                                key={format}
                                type="button"
                                role="menuitem"
                                onClick={() => { close(); if (locked) onLocked(); else onExport(format); }}
                                className="flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-surface-2"
                            >
                                <Download className="mt-0.5 h-4 w-4 shrink-0 text-ink-3" />
                                <span className="min-w-0 flex-1">
                                    <span className="flex items-center gap-2 text-sm font-medium text-ink">
                                        {name}
                                        {locked && <span className="chip bg-gold-soft px-2 py-0.5 text-[11px] text-gold"><Lock className="h-2.5 w-2.5" /> {copy.scaleOnly}</span>}
                                    </span>
                                    <span className="block text-xs text-ink-3">{description}</span>
                                </span>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
