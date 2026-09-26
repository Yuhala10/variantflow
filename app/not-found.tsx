import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowLeft } from 'lucide-react';
import { Logo } from '../components/brand/logo';

export const metadata: Metadata = {
    title: 'Page not found',
};

export default function NotFound() {
    return (
        <main id="main" className="safe-top safe-bottom relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 text-center">
            <div className="grid-backdrop pointer-events-none absolute inset-0 -z-10" />
            <Logo className="mb-10" />
            <p className="font-display text-8xl italic leading-none text-brand">404</p>
            <h1 className="mt-6 text-3xl font-semibold tracking-tight text-ink">This page doesn&apos;t exist</h1>
            <p className="mt-3 max-w-sm text-ink-2">The link may be broken or the page may have moved.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/" className="btn btn-primary btn-lg"><ArrowLeft /> Back home</Link>
                <Link href="/workspace" className="btn btn-secondary btn-lg">Open workspace</Link>
            </div>
        </main>
    );
}
