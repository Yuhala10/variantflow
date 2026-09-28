'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { createSupabaseBrowserClient } from '../../../../lib/supabase/client';
import { Logo } from '../../../../components/brand/logo';
import { useI18n } from '../../../../components/i18n/i18n-provider';
import { cn } from '../../../../lib/utils';

/** Reached from the password-reset email; the callback route has already signed the user in. */
export default function ResetPasswordPage() {
    const { t, href } = useI18n();
    const copy = t.auth;
    const router = useRouter();
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState<{ tone: 'error' | 'success'; text: string } | null>(null);

    const submit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const supabase = createSupabaseBrowserClient();
        if (!supabase) {
            setMessage({ tone: 'error', text: copy.unavailable });
            return;
        }
        setBusy(true);
        setMessage(null);
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            router.replace(`${href('/auth')}?error=link`);
            return;
        }
        const { error } = await supabase.auth.updateUser({ password });
        if (error) {
            setMessage({ tone: 'error', text: (error.code && copy.errors[error.code]) || copy.errors[error.message] || error.message });
            setBusy(false);
            return;
        }
        setMessage({ tone: 'success', text: copy.passwordSaved });
        router.replace(href('/workspace'));
        router.refresh();
    };

    return (
        <main id="main" className="safe-top safe-bottom flex min-h-dvh flex-col bg-canvas px-5 py-6 sm:px-10">
            <Logo href={href('/')} />
            <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-10">
                <div className="animate-rise">
                    <h1 className="text-3xl font-semibold tracking-tight text-ink">{copy.newPasswordTitle}</h1>
                    <p className="mt-2 text-[15px] text-ink-2">{copy.newPasswordSub}</p>
                    <form onSubmit={submit} className="mt-8 space-y-5">
                        <div>
                            <label htmlFor="new-password" className="label">{copy.newPassword}</label>
                            <div className="relative">
                                <input
                                    id="new-password"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    minLength={6}
                                    autoComplete="new-password"
                                    value={password}
                                    onChange={(event) => setPassword(event.target.value)}
                                    className="field pr-12"
                                    placeholder={copy.passwordSignup}
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
                        </div>
                        {message && (
                            <p role={message.tone === 'error' ? 'alert' : 'status'} className={cn('animate-fade rounded-xl p-3.5 text-sm leading-relaxed', message.tone === 'error' ? 'bg-danger-soft text-danger' : 'bg-success-soft text-success')}>
                                {message.text}
                            </p>
                        )}
                        <button type="submit" disabled={busy} className="btn btn-primary btn-lg w-full">
                            {busy && <Loader2 className="animate-spin" />} {copy.savePassword}
                        </button>
                        <Link href={href('/auth')} className="btn btn-ghost w-full">{copy.backToSignIn}</Link>
                    </form>
                </div>
            </div>
        </main>
    );
}
