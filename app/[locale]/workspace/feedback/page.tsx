'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowLeft, Check, Loader2, Mail, RotateCcw } from 'lucide-react';
import { useI18n } from '../../../../components/i18n/i18n-provider';
import { translateCode } from '../../../../lib/i18n';
import { cn } from '../../../../lib/utils';

interface FeedbackItem {
    id: string;
    email: string | null;
    category: 'bug' | 'idea' | 'question' | 'other';
    message: string;
    page: string | null;
    plan: string | null;
    status: 'new' | 'done';
    created_at: string;
}

type Filter = 'new' | 'done' | 'all';

const CATEGORY_TONE: Record<FeedbackItem['category'], string> = {
    bug: 'bg-danger-soft text-danger',
    idea: 'bg-brand-soft text-brand-ink',
    question: 'bg-gold-soft text-gold',
    other: 'bg-surface-2 text-ink-2',
};

/** Owner/admin inbox for messages sent through the workspace feedback form. */
export default function FeedbackInboxPage() {
    const { t, href, formatDate } = useI18n();
    const copy = t.workspace.inbox;
    const [items, setItems] = useState<FeedbackItem[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<Filter>('new');
    const [busyId, setBusyId] = useState<string | null>(null);

    useEffect(() => {
        let active = true;
        fetch('/api/feedback', { cache: 'no-store' })
            .then(async (response) => ({ response, payload: await response.json().catch(() => null) }))
            .then(({ response, payload }) => {
                if (!active) return;
                if (response.ok) setItems(payload?.feedback ?? []);
                else setError(response.status === 403 ? translateCode(t.apiErrors, 'forbidden') : copy.loadFailed);
            })
            .catch(() => { if (active) setError(copy.loadFailed); });
        return () => { active = false; };
    }, [copy.loadFailed, t.apiErrors]);

    const setStatus = async (item: FeedbackItem, status: FeedbackItem['status']) => {
        setBusyId(item.id);
        const response = await fetch('/api/feedback', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: item.id, status }),
        }).catch(() => null);
        setBusyId(null);
        if (response?.ok) setItems((list) => list?.map((entry) => (entry.id === item.id ? { ...entry, status } : entry)) ?? null);
    };

    const counts = { new: items?.filter((item) => item.status === 'new').length ?? 0, done: items?.filter((item) => item.status === 'done').length ?? 0, all: items?.length ?? 0 };
    const visible = items?.filter((item) => filter === 'all' || item.status === filter) ?? [];

    return (
        <main id="main" className="min-h-dvh bg-canvas">
            <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
                <Link href={href('/workspace')} className="btn btn-ghost btn-sm -ml-2"><ArrowLeft /> {copy.back}</Link>
                <h1 className="mt-4 text-3xl font-semibold tracking-tight text-ink">{copy.title}</h1>
                <p className="mt-1 text-ink-2">{copy.subtitle}</p>

                <div role="tablist" className="mt-6 inline-flex rounded-xl bg-surface-2 p-1">
                    {(['new', 'done', 'all'] as Filter[]).map((value) => (
                        <button
                            key={value}
                            type="button"
                            role="tab"
                            aria-selected={filter === value}
                            onClick={() => setFilter(value)}
                            className={cn('min-h-9 rounded-lg px-3 text-sm font-semibold transition-all', filter === value ? 'bg-surface text-ink shadow-sm' : 'text-ink-3 hover:text-ink-2')}
                        >
                            {copy.filters[value]} <span className="tabular-nums text-ink-3">{counts[value]}</span>
                        </button>
                    ))}
                </div>

                <div className="mt-5 space-y-3">
                    {error && <p role="alert" className="rounded-xl bg-danger-soft p-4 text-sm text-danger">{error}</p>}
                    {!error && items === null && <Loader2 className="h-5 w-5 animate-spin text-ink-3" />}
                    {items !== null && visible.length === 0 && <p className="card p-6 text-center text-sm text-ink-3">{copy.empty}</p>}
                    {visible.map((item) => (
                        <article key={item.id} className={cn('card p-5', item.status === 'done' && 'opacity-70')}>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-ink-3">
                                <span className={cn('chip', CATEGORY_TONE[item.category])}>{t.workspace.tools.categories[item.category]}</span>
                                <span>{copy.from({ email: item.email ?? '—', plan: item.plan ?? '—' })}</span>
                                <span>· {formatDate(item.created_at)}</span>
                                {item.page && <span className="font-mono">· {item.page}</span>}
                            </div>
                            <p className="mt-3 whitespace-pre-wrap text-[15px] leading-relaxed text-ink">{item.message}</p>
                            <div className="mt-4 flex flex-wrap gap-2">
                                {item.email && (
                                    <a href={`mailto:${item.email}?subject=${encodeURIComponent(copy.replySubject)}`} className="btn btn-secondary btn-sm"><Mail /> {copy.reply}</a>
                                )}
                                <button type="button" disabled={busyId === item.id} onClick={() => setStatus(item, item.status === 'new' ? 'done' : 'new')} className="btn btn-ghost btn-sm">
                                    {busyId === item.id ? <Loader2 className="animate-spin" /> : item.status === 'new' ? <Check /> : <RotateCcw />}
                                    {item.status === 'new' ? copy.markDone : copy.reopen}
                                </button>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </main>
    );
}
