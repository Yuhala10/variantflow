'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { LogOut, UserRound } from 'lucide-react';
import { createSupabaseBrowserClient } from '../../lib/supabase/client';

export function AccountControl() {
    const [email, setEmail] = useState<string | null>(null);
    const [configured, setConfigured] = useState(false);

    useEffect(() => {
        const supabase = createSupabaseBrowserClient();
        if (!supabase) return;

        setConfigured(true);
        supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setEmail(session?.user?.email ?? null));
        return () => listener.subscription.unsubscribe();
    }, []);

    if (!configured) return null;
    if (!email) return <Link href="/auth?next=/workspace" className="inline-flex items-center gap-1.5 rounded-xl border border-[#e8dcc8] bg-[#fffdfb] px-2.5 py-2 text-[10px] font-bold uppercase tracking-wider text-[#5f5246] hover:border-[#bfdac8] hover:text-[#2e5f52]"><UserRound className="h-3.5 w-3.5" /> Sign in</Link>;

    const signOut = async () => {
        const supabase = createSupabaseBrowserClient();
        await supabase?.auth.signOut();
        window.location.assign('/app');
    };

    return <button type="button" onClick={signOut} title={email} className="inline-flex items-center gap-1.5 rounded-xl border border-[#e8dcc8] bg-[#fffdfb] px-2.5 py-2 text-[10px] font-bold uppercase tracking-wider text-[#5f5246] hover:border-[#bfdac8] hover:text-[#2e5f52]"><LogOut className="h-3.5 w-3.5" /> Sign out</button>;
}