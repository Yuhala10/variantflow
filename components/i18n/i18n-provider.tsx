'use client';

import { createContext, useContext, useMemo } from 'react';
import { getDictionary, intlLocale, localePath, type Dictionary, type Locale } from '../../lib/i18n';

interface I18nContextValue {
    locale: Locale;
    t: Dictionary;
    /** Locale-aware internal path. */
    href: (path: string) => string;
    formatNumber: (value: number) => string;
    formatDate: (value: string | Date) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ locale, children }: { locale: Locale; children: React.ReactNode }) {
    const value = useMemo<I18nContextValue>(() => {
        const numberFormat = new Intl.NumberFormat(intlLocale[locale]);
        const dateFormat = new Intl.DateTimeFormat(intlLocale[locale], { day: 'numeric', month: 'short', year: 'numeric' });
        return {
            locale,
            t: getDictionary(locale),
            href: (path) => localePath(locale, path),
            formatNumber: (number) => numberFormat.format(number),
            formatDate: (date) => dateFormat.format(typeof date === 'string' ? new Date(date) : date),
        };
    }, [locale]);

    return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
    const context = useContext(I18nContext);
    if (!context) throw new Error('useI18n must be used inside I18nProvider');
    return context;
}
