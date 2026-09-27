'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Logo } from '../../components/brand/logo';
import { useI18n } from '../../components/i18n/i18n-provider';

export default function NotFound() {
    const { t, href } = useI18n();
    return (
        <main id="main" className="safe-top safe-bottom relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 text-center">
            <div className="grid-backdrop pointer-events-none absolute inset-0 -z-10" />
            <Logo href={href('/')} className="mb-10" />
            <p className="font-display text-8xl italic leading-none text-brand">404</p>
            <h1 className="mt-6 text-3xl font-semibold tracking-tight text-ink">{t.notFound.title}</h1>
            <p className="mt-3 max-w-sm text-ink-2">{t.notFound.text}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href={href('/')} className="btn btn-primary btn-lg"><ArrowLeft /> {t.common.backHome}</Link>
                <Link href={href('/workspace')} className="btn btn-secondary btn-lg">{t.common.openWorkspace}</Link>
            </div>
        </main>
    );
}
