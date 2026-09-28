'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { ArrowLeft, Check, Eye, EyeOff, Loader2 } from 'lucide-react';
import { createSupabaseBrowserClient } from '../../../lib/supabase/client';
import { safeRedirectPath } from '../../../lib/safe-redirect';
import { translateCode } from '../../../lib/i18n';
import { Logo, LogoMark } from '../../../components/brand/logo';
import { useI18n } from '../../../components/i18n/i18n-provider';
import { LanguageSwitcher } from '../../../components/i18n/language-switcher';
import { cn } from '../../../lib/utils';

type Mode = 'login' | 'signup' | 'forgot';

const authErrorText = (errors: Record<string, string>, error: { code?: string; message: string }) =>
    (error.code && errors[error.code]) || errors[error.message] || error.message;

export default function AuthPage() {
    const { t, href } = useI18n();
    const copy = t.auth;
    const router = useRouter();
    const searchParams = useSearchParams();
    const next = safeRedirectPath(searchParams.get('next'), href('/workspace'));
    const linkError = searchParams.get('error');
    const linkFailed = linkError === 'link';
    const [mode, setMode] = useState<Mode>(linkFailed ? 'forgot' : searchParams.get('mode') === 'signup' ? 'signup' : 'login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [message, setMessage] = useState<{ tone: 'error' | 'success'; text: string } | null>(
        linkFailed ? { tone: 'error', text: copy.linkExpired } : linkError === 'confirm' ? { tone: 'error', text: copy.confirmLink } : null,
    );
    const [busy, setBusy] = useState(false);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setMessage(null);
        const supabase = createSupabaseBrowserClient();

        if (!supabase) {
            setMessage({ tone: 'error', text: copy.unavailable });
            return;
        }

        setBusy(true);
        const callbackUrl = (nextPath: string) => `${window.location.origin}${href('/auth/callback')}?next=${encodeURIComponent(nextPath)}`;

        if (mode === 'forgot') {
            const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: callbackUrl(href('/auth/reset')) });
            setBusy(false);
            // Same message whether or not the account exists, so the form cannot be used to look up emails.
            setMessage(error && error.code?.startsWith('over_') ? { tone: 'error', text: authErrorText(copy.errors, error) } : { tone: 'success', text: copy.resetSent });
            return;
        }

        if (mode === 'signup') {
            // Instant sign-up: the server creates a confirmed account, so there is no email to open first.
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            }).catch(() => null);
            const payload = response ? await response.json().catch(() => null) : null;
            if (response?.ok) {
                const signIn = await supabase.auth.signInWithPassword({ email: email.trim(), password });
                if (!signIn.error) {
                    router.replace(next);
                    router.refresh();
                    return;
                }
                setMode('login');
                setMessage({ tone: 'error', text: authErrorText(copy.errors, signIn.error) });
                setBusy(false);
                return;
            }
            if (response && response.status !== 503) {
                if (payload?.code === 'account-exists') setMode('login');
                setMessage({ tone: 'error', text: translateCode(t.apiErrors, payload?.code, {}, t.apiErrors['server-error']()) });
                setBusy(false);
                return;
            }
            // 503 (no service key) or network failure: fall back to Supabase's standard email-confirmation sign-up below.
        }

        const result = mode === 'login'
            ? await supabase.auth.signInWithPassword({ email, password })
            : await supabase.auth.signUp({
                email,
                password,
                options: { emailRedirectTo: callbackUrl(next) },
            });

        if (result.error) {
            setMessage({ tone: 'error', text: authErrorText(copy.errors, result.error) });
            setBusy(false);
        } else if (mode === 'signup' && !result.data.session && result.data.user?.identities?.length === 0) {
            // Supabase answers a sign-up for an existing email with an empty identity list instead of an error.
            setMode('login');
            setMessage({ tone: 'error', text: copy.accountExists });
            setBusy(false);
        } else if (mode === 'signup' && !result.data.session) {
            setMessage({ tone: 'success', text: copy.confirmEmail });
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
                <Link href={href('/')} className="relative inline-flex items-center gap-2.5 text-[15px] font-semibold">
                    <LogoMark className="bg-on-brand/15 shadow-none" />
                    VariantFlow
                </Link>
                <div className="relative max-w-md">
                    <p className="font-display text-5xl italic leading-[1.05]">{copy.quote}</p>
                    <ul className="mt-10 space-y-3">
                        {copy.benefits.map((benefit) => (
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
                <div className="flex items-center justify-between gap-2">
                    <div className="lg:hidden"><Logo href={href('/')} /></div>
                    <div className="ml-auto flex items-center gap-1">
                        <LanguageSwitcher compact />
                        <Link href={href('/')} className="btn btn-ghost btn-sm"><ArrowLeft /> {t.common.home}</Link>
                    </div>
                </div>

                <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-10">
                    <div className="animate-rise">
                        <h1 className="text-3xl font-semibold tracking-tight text-ink">{mode === 'login' ? copy.welcome : mode === 'signup' ? copy.create : copy.forgotTitle}</h1>
                        <p className="mt-2 text-[15px] text-ink-2">{mode === 'login' ? copy.welcomeSub : mode === 'signup' ? copy.createSub : copy.forgotSub}</p>

                        {mode !== 'forgot' && <div role="tablist" aria-label={copy.tabsLabel} className="mt-8 grid grid-cols-2 rounded-xl bg-surface-2 p-1">
                            {(['login', 'signup'] as Mode[]).map((value) => (
                                <button
                                    key={value}
                                    type="button"
                                    role="tab"
                                    aria-selected={mode === value}
                                    onClick={() => switchMode(value)}
                                    className={cn(
                                        'min-h-10 rounded-lg px-2 text-sm font-semibold transition-all duration-200',
                                        mode === value ? 'bg-surface text-ink shadow-sm' : 'text-ink-3 hover:text-ink-2',
                                    )}
                                >
                                    {value === 'login' ? copy.tabSignIn : copy.tabCreate}
                                </button>
                            ))}
                        </div>}

                        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                            <div>
                                <label htmlFor="email" className="label">{copy.email}</label>
                                <input id="email" type="email" required autoComplete="email" inputMode="email" value={email} onChange={(event) => setEmail(event.target.value)} className="field" placeholder={copy.emailPlaceholder} />
                            </div>
                            {mode !== 'forgot' && <div>
                                <div className="flex items-baseline justify-between gap-3">
                                    <label htmlFor="password" className="label">{copy.password}</label>
                                    {mode === 'login' && (
                                        <button type="button" onClick={() => switchMode('forgot')} className="mb-1.5 text-xs font-medium text-brand underline-offset-2 hover:underline">{copy.forgot}</button>
                                    )}
                                </div>
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
                                        placeholder={mode === 'login' ? copy.passwordLogin : copy.passwordSignup}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((value) => !value)}
                                        aria-label={showPassword ? copy.hidePassword : copy.showPassword}
                                        className="btn btn-ghost btn-icon btn-sm absolute right-1 top-1/2 -translate-y-1/2"
                                    >
                                        {showPassword ? <EyeOff /> : <Eye />}
                                    </button>
                                </div>
                            </div>}

                            {message && (
                                <p
                                    role={message.tone === 'error' ? 'alert' : 'status'}
                                    className={cn('animate-fade rounded-xl p-3.5 text-sm leading-relaxed', message.tone === 'error' ? 'bg-danger-soft text-danger' : 'bg-success-soft text-success')}
                                >
                                    {message.text}
                                </p>
                            )}

                            <button type="submit" disabled={busy} className="btn btn-primary btn-lg w-full">
                                {busy && <Loader2 className="animate-spin" />}
                                {mode === 'login' ? copy.submitLogin : mode === 'signup' ? copy.submitSignup : copy.sendReset}
                            </button>
                            {mode === 'forgot' && (
                                <button type="button" onClick={() => switchMode('login')} className="btn btn-ghost w-full"><ArrowLeft /> {copy.backToSignIn}</button>
                            )}
                        </form>

                        <p className="mt-8 text-center text-xs leading-relaxed text-ink-3">
                            {copy.legalBefore} <Link href={href('/terms')} className="underline underline-offset-2 hover:text-ink-2">{copy.terms}</Link> {copy.and}{' '}
                            <Link href={href('/privacy')} className="underline underline-offset-2 hover:text-ink-2">{copy.privacy}</Link>.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
