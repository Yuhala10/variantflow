'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { ArrowLeft, Loader2, LockKeyhole, Mail, UserRound } from 'lucide-react';
import { createSupabaseBrowserClient } from '../../lib/supabase/client';

export default function AuthPage() {
    const [mode, setMode] = useState<'login' | 'signup'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [busy, setBusy] = useState(false);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setMessage('');
        const supabase = createSupabaseBrowserClient();

        if (!supabase) {
            setMessage('Authentication is not connected yet. Add the Supabase values to .env.local first.');
            return;
        }

        setBusy(true);
        const result = mode === 'login'
            ? await supabase.auth.signInWithPassword({ email, password })
            : await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/auth/callback` } });

        if (result.error) {
            setMessage(result.error.message);
        } else if (mode === 'signup' && !result.data.session) {
            setMessage('Account created. Check your email to confirm your address, then sign in.');
        } else {
            window.location.assign('/workspace');
        }
        setBusy(false);
    };

    return (
        <main className="min-h-screen bg-[#174d3d] px-5 py-8 text-[#f4eadb] sm:px-8">
            <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col justify-center">
                <Link href="/" className="mb-8 inline-flex items-center gap-3 self-start text-sm font-bold text-[#c9e3d7] transition-colors hover:text-white"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f4eadb] text-sm font-black text-[#174d3d]">VF</span> VariantFlow</Link>
                <section className="rounded-[2rem] border border-[#4d806b] bg-[#205a48] p-6 shadow-[0_24px_60px_rgba(0,0,0,0.18)] sm:p-8">
                    <div className="mb-7 space-y-2">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f4eadb] text-[#174d3d]"><UserRound className="h-5 w-5" /></div>
                        <h1 className="pt-2 text-2xl font-black tracking-tight text-white">{mode === 'login' ? 'Welcome back' : 'Create your workspace'}</h1>
                        <p className="text-sm leading-relaxed text-[#c9e3d7]">Your account will keep your catalog and plan connected across sessions and devices.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <label className="block space-y-1.5"><span className="text-[10px] font-bold uppercase tracking-wider text-[#c9e3d7]">Email</span><span className="flex items-center gap-2 rounded-xl border border-[#6d9b88] bg-[#174d3d]/50 px-3"><Mail className="h-4 w-4 text-[#a9d2c0]" /><input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="h-11 min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-[#8eb8a5]" placeholder="you@example.com" /></span></label>
                        <label className="block space-y-1.5"><span className="text-[10px] font-bold uppercase tracking-wider text-[#c9e3d7]">Password</span><span className="flex items-center gap-2 rounded-xl border border-[#6d9b88] bg-[#174d3d]/50 px-3"><LockKeyhole className="h-4 w-4 text-[#a9d2c0]" /><input type="password" required minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} className="h-11 min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-[#8eb8a5]" placeholder="At least 6 characters" /></span></label>
                        <button type="submit" disabled={busy} className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#f4eadb] text-sm font-bold text-[#174d3d] transition-colors hover:bg-white disabled:cursor-wait disabled:opacity-70">{busy && <Loader2 className="h-4 w-4 animate-spin" />}{mode === 'login' ? 'Sign in' : 'Create account'}</button>
                    </form>

                    {message && <p className="mt-4 rounded-xl border border-[#d6b893]/60 bg-[#f4eadb]/10 p-3 text-xs leading-relaxed text-[#f4eadb]">{message}</p>}
                    <button type="button" onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setMessage(''); }} className="mt-6 w-full text-center text-xs font-semibold text-[#c9e3d7] underline underline-offset-4 hover:text-white">{mode === 'login' ? 'Need an account? Create one' : 'Already have an account? Sign in'}</button>
                </section>
                <Link href="/app" className="mt-6 inline-flex items-center justify-center gap-2 text-xs font-bold text-[#c9e3d7] hover:text-white"><ArrowLeft className="h-3.5 w-3.5" /> Back to product overview</Link>
            </div>
        </main>
    );
}
