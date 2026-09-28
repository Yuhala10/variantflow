'use client';

import React, { useState } from 'react';
import { CheckCircle2, Loader2, MessageCircle, Send } from 'lucide-react';
import { useI18n } from '../i18n/i18n-provider';
import { translateCode } from '../../lib/i18n';
import { cn } from '../../lib/utils';

const CATEGORIES = ['bug', 'idea', 'question', 'other'] as const;
type Category = (typeof CATEGORIES)[number];

/** Sends feedback to the owners' inbox (/workspace/feedback), tagged with the sender's account, plan and page. */
export function FeedbackForm() {
    const { t, locale } = useI18n();
    const copy = t.workspace.tools;
    const [category, setCategory] = useState<Category>('idea');
    const [message, setMessage] = useState('');
    const [state, setState] = useState<'idle' | 'sending' | 'sent'>('idle');
    const [error, setError] = useState<string | null>(null);

    const send = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!message.trim() || state === 'sending') return;
        setState('sending');
        setError(null);
        try {
            const response = await fetch('/api/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ category, message: message.trim(), page: window.location.pathname, locale }),
            });
            if (!response.ok) {
                const payload = await response.json().catch(() => null);
                const fallback = response.status === 401 || response.status === 503 ? copy.signInToSend : t.apiErrors['server-error']();
                setError(translateCode(t.apiErrors, response.status === 503 ? undefined : payload?.code, {}, fallback));
                setState('idle');
                return;
            }
            setMessage('');
            setState('sent');
        } catch {
            setError(t.workspace.notices.offline);
            setState('idle');
        }
    };

    return (
        <div>
            <h3 className="flex items-center gap-2 text-[13px] font-semibold text-ink">
                <MessageCircle className="h-4 w-4 text-ink-3" /> {copy.feedbackTitle}
            </h3>

            {state === 'sent' ? (
                <div role="status" className="animate-fade mt-3 rounded-xl border border-success/30 bg-success-soft p-4">
                    <p className="flex items-center gap-2 text-sm font-semibold text-ink"><CheckCircle2 className="h-4 w-4 text-success" /> {copy.sentTitle}</p>
                    <p className="mt-1 text-sm text-ink-2">{copy.sentText}</p>
                    <button type="button" onClick={() => setState('idle')} className="btn btn-secondary btn-sm mt-3">{copy.sendAnother}</button>
                </div>
            ) : (
                <form onSubmit={send}>
                    <p className="mb-3 mt-1 text-xs text-ink-3">{copy.feedbackText}</p>
                    <div className="space-y-2.5">
                        <div role="radiogroup" aria-label={copy.categoryLabel} className="flex flex-wrap gap-1.5">
                            {CATEGORIES.map((value) => (
                                <button
                                    key={value}
                                    type="button"
                                    role="radio"
                                    aria-checked={category === value}
                                    onClick={() => setCategory(value)}
                                    className={cn('chip border transition-colors', category === value ? 'border-brand bg-brand-soft text-brand-ink' : 'border-line bg-surface text-ink-2 hover:border-line-strong')}
                                >
                                    {copy.categories[value]}
                                </button>
                            ))}
                        </div>
                        <textarea value={message} onChange={(event) => setMessage(event.target.value)} maxLength={4000} rows={4} aria-label={copy.message} placeholder={copy.messagePlaceholder} className="field resize-y" />
                        {error && <p role="alert" className="text-sm text-danger">{error}</p>}
                        <button type="submit" disabled={!message.trim() || state === 'sending'} className="btn btn-secondary w-full">
                            {state === 'sending' ? <Loader2 className="animate-spin" /> : <Send />} {copy.send}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}
