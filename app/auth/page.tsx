'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { ArrowLeft, Check, Eye, EyeOff, Loader2 } from 'lucide-react';
import { createSupabaseBrowserClient } from '../../lib/supabase/client';
import { safeRedirectPath } from '../../lib/safe-redirect';
import { Logo } from '../../components/brand/logo';
import { cn } from '../../lib/utils';

type Mode = 'login' | 'signup';

const BENEFITS = [
    'Save catalogs to your account',
    'Continue on any device',
    'Free up to 50 variants per export',
];

export default function AuthPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const next = safeRedirectPath(searchParams.get('next'));
    const [mode, setMode] = useState<Mode>(searchParams.get('mode') === 'signup' ? 'signup' : 'login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [message, setMessage] = useState<{ tone: 'error' | 'success'; text: string } | null>(null);
    const [busy, setBusy] = useState(false);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setMessage(null);
        const supabase = createSupabaseBrowserClient();

        if (!supabase) {
            setMessage({ tone: 'error', text: 'Sign-in is not available right now. Please try again later.' });
            return;
        }

        setBusy(true);
        const result = mode === 'login'
            ? await supabase.auth.signInWithPassword({ email, password })
            : await supabase.auth.signUp({
                email,
                password,
                options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
            });

        if (result.error) {
            setMessage({ tone: 'error', text: result.error.message });
            setBusy(false);
        } else if (mode === 'signup' && !result.data.session) {
            setMessage({ tone: 'success', text: 'Account created. Check your inbox to confirm your email, then sign in.' });
            setBusy(false);
        } else {
            router.replace(next);
            router.refresh();
        }
    };

    const switchMode = (value: Mode) => {
        setMode(value);
        setMessage(null);
    };

    return (
        <div className="grid min-h-dvh lg:grid-cols-[1fr_1.1fr]">
            {/* Brand panel */}
            <aside className="relative hidden overflow-hidden bg-brand p-12 text-on-brand lg:flex lg:flex-col lg:justify-between">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_60%_at_20%_0%,rgb(255_255_255/0.18),transparent)]" />
                <Link href="/" className="relative inline-flex items-center gap-2.5 text-[15px] font-semibold">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-[10px] bg-on-brand/15">
                        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5"><path d="M12 3 3 7.5l9 4.5 9-4.5L12 3Z" fill="currentColor" /><path d="m3 12 9 4.5 9-4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.75" /><path d="m3 16.5 9 4.5 9-4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.45" /></svg>
                    </span>
                    VariantFlow
                </Link>
                <div className="relative max-w-md">
                    <p className="font-display text-5xl italic leading-[1.05]">&ldquo;From options to a Shopify-ready catalog in minutes.&rdquo;</p>
                    <ul className="mt-10 space-y-3">
                        {BENEFITS.map((benefit) => (
                            <li key={benefit} className="flex items-center gap-3 text-[15px] opacity-90">
                                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-on-brand/15"><Check className="h-3.5 w-3.5" /></span>
                                {benefit}
                            </li>
                        ))}
                    </ul>
                </div>
                <p className="relative text-sm opacity-70">© {new Date().getFullYear()} VariantFlow</p>
            </aside>

            {/* Form */}
            <main id="main" className="safe-top safe-bottom flex flex-col px-5 py-6 sm:px-10">
                <div className="flex items-center justify-between">
                    <div className="lg:hidden"><Logo /></div>
                    <Link href="/" className="btn btn-ghost btn-sm ml-auto"><ArrowLeft /> Home</Link>
                </div>

                <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-10">
                    <div className="animate-rise">
                        <h1 className="text-3xl font-semibold tracking-tight text-ink">
                            {mode === 'login' ? 'Welcome back' : 'Create your account'}
                        </h1>
                        <p className="mt-2 text-[15px] text-ink-2">
                            {mode === 'login' ? 'Sign in to continue to your workspace.' : 'Start building catalogs for free. No card required.'}
                        </p>

                        <div role="tablist" aria-label="Account" className="mt-8 grid grid-cols-2 rounded-xl bg-surface-2 p-1">
                            {(['login', 'signup'] as Mode[]).map((value) => (
                                <button
                                    key={value}
                                    type="button"
                                    role="tab"
                                    aria-selected={mode === value}
                                    onClick={() => switchMode(value)}
                                    className={cn(
                                        'min-h-10 rounded-lg text-sm font-semibold transition-all duration-200',
                                        mode === value ? 'bg-surface text-ink shadow-sm' : 'text-ink-3 hover:text-ink-2',
                                    )}
                                >
                                    {value === 'login' ? 'Sign in' : 'Create account'}
                                </button>
                            ))}
                        </div>

                        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                            <div>
                                <label htmlFor="email" className="label">Email</label>
                                <input
                                    id="email"
                                    type="email"
                                    required
                                    autoComplete="email"
                                    inputMode="email"
                                    value={email}
                                    onChange={(event) => setEmail(event.target.value)}
                                    className="field"
                                    placeholder="you@company.com"
                                />
                            </div>
                            <div>
                                <label htmlFor="password" className="label">Password</label>
                                <div className="relative">
                                    <input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        minLength={6}
                                        autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                                        value={password}
                                        onChange={(event) => setPassword(event.target.value)}
                                        className="field pr-12"
                                        placeholder={mode === 'login' ? 'Your password' : 'At least 6 characters'}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((value) => !value)}
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                        className="btn btn-ghost btn-icon btn-sm absolute right-1 top-1/2 -translate-y-1/2"
                                    >
                                        {showPassword ? <EyeOff /> : <Eye />}
                                    </button>
                                </div>
                            </div>

                            {message && (
                                <p
                                    role={message.tone === 'error' ? 'alert' : 'status'}
                                    className={cn(
                                        'animate-fade rounded-xl p-3.5 text-sm leading-relaxed',
                                        message.tone === 'error' ? 'bg-danger-soft text-danger' : 'bg-success-soft text-success',
                                    )}
                                >
                                    {message.text}
                                </p>
                            )}

                            <button type="submit" disabled={busy} className="btn btn-primary btn-lg w-full">
                                {busy && <Loader2 className="animate-spin" />}
                                {mode === 'login' ? 'Sign in' : 'Create account'}
                            </button>
                        </form>

                        <p className="mt-8 text-center text-xs leading-relaxed text-ink-3">
                            By continuing you agree to our <Link href="/terms" className="underline underline-offset-2 hover:text-ink-2">Terms</Link> and{' '}
                            <Link href="/privacy" className="underline underline-offset-2 hover:text-ink-2">Privacy policy</Link>.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
