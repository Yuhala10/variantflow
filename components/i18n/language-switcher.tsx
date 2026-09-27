'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Languages } from 'lucide-react';
import { LOCALE_COOKIE, localePath, stripLocale, type Locale } from '../../lib/i18n';
import { useI18n } from './i18n-provider';
import { cn } from '../../lib/utils';

const ONE_YEAR = 60 * 60 * 24 * 365;

export const rememberLocale = (locale: Locale) => {
    document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${ONE_YEAR}; samesite=lax`;
};

/** Switches to the other language on the same page. Prefetch is off so the saved preference applies first. */
export function LanguageSwitcher({ className, compact = false }: { className?: string; compact?: boolean }) {
    const { locale, t } = useI18n();
    const pathname = usePathname() || '/';
    const target: Locale = locale === 'en' ? 'fr' : 'en';
    const href = localePath(target, stripLocale(pathname));

    return (
        <Link
            href={href}
            prefetch={false}
            hrefLang={target}
            lang={target}
            onClick={() => rememberLocale(target)}
            aria-label={`${t.common.language}: ${t.common.languageNames[target]}`}
            className={cn('btn btn-ghost btn-sm gap-1.5', className)}
        >
            <Languages />
            {compact ? target.toUpperCase() : t.common.switchTo}
        </Link>
    );
}
