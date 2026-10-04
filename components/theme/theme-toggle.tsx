'use client';

import { useSyncExternalStore } from 'react';
import { Monitor, Moon, Sun } from 'lucide-react';
import { useI18n } from '../i18n/i18n-provider';
import { cn } from '../../lib/utils';
import { THEME_STORAGE_KEY, type Theme } from '../../lib/theme';

const THEME_EVENT = 'vf-theme-change';
const ORDER: Theme[] = ['light', 'dark', 'auto'];
const ICONS = { light: Sun, dark: Moon, auto: Monitor };

const readTheme = (): Theme => {
    try {
        const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
        return stored === 'light' || stored === 'dark' ? stored : 'auto';
    } catch {
        return 'auto';
    }
};

const DARK_QUERY = '(prefers-color-scheme: dark)';

/** What the visitor actually sees: their choice, or the device setting when on Auto. */
const readAppearance = (): 'light' | 'dark' => {
    const theme = readTheme();
    if (theme !== 'auto') return theme;
    return window.matchMedia(DARK_QUERY).matches ? 'dark' : 'light';
};

const subscribe = (callback: () => void) => {
    const media = window.matchMedia(DARK_QUERY);
    window.addEventListener(THEME_EVENT, callback);
    window.addEventListener('storage', callback);
    media.addEventListener('change', callback);
    return () => {
        window.removeEventListener(THEME_EVENT, callback);
        window.removeEventListener('storage', callback);
        media.removeEventListener('change', callback);
    };
};

function setTheme(theme: Theme) {
    const root = document.documentElement;
    if (theme === 'auto') delete root.dataset.theme;
    else root.dataset.theme = theme;
    try {
        if (theme === 'auto') window.localStorage.removeItem(THEME_STORAGE_KEY);
        else window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
        // Storage can be blocked; the theme still applies for this visit.
    }
    window.dispatchEvent(new Event(THEME_EVENT));
}

export function useTheme() {
    const theme = useSyncExternalStore(subscribe, readTheme, () => 'auto' as Theme);
    return { theme, setTheme };
}

/** One button that flips between light and dark. */
export function ThemeToggle({ className }: { className?: string }) {
    const { t } = useI18n();
    const appearance = useSyncExternalStore(subscribe, readAppearance, () => 'light' as const);
    const Icon = ICONS[appearance];

    return (
        <button
            type="button"
            onClick={() => setTheme(appearance === 'dark' ? 'light' : 'dark')}
            aria-label={`${t.common.theme.label}: ${t.common.theme[appearance]}`}
            title={`${t.common.theme.label}: ${t.common.theme[appearance]}`}
            className={cn('btn btn-ghost btn-icon btn-sm', className)}
        >
            <Icon key={appearance} className="animate-pop" />
        </button>
    );
}

/** Three-way switch for menus and footers. */
export function ThemeSwitch({ className }: { className?: string }) {
    const { t } = useI18n();
    const { theme } = useTheme();

    return (
        <div role="radiogroup" aria-label={t.common.theme.label} className={cn('inline-flex rounded-full border border-line bg-surface-2 p-0.5', className)}>
            {ORDER.map((value) => {
                const Icon = ICONS[value];
                const selected = theme === value;
                return (
                    <button
                        key={value}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        aria-label={t.common.theme[value]}
                        title={t.common.theme[value]}
                        onClick={() => setTheme(value)}
                        className={cn(
                            'inline-flex h-8 min-w-9 items-center justify-center gap-1.5 rounded-full px-2.5 text-xs font-semibold transition-all duration-200',
                            selected ? 'bg-surface text-ink shadow-sm' : 'text-ink-3 hover:text-ink-2',
                        )}
                    >
                        <Icon className="h-3.5 w-3.5" />
                    </button>
                );
            })}
        </div>
    );
}
