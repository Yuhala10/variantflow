'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';
import { useI18n } from '../i18n/i18n-provider';

export type NoticeTone = 'success' | 'error';
interface NoticeState { id: number; tone: NoticeTone; text: string }

export function useNotice() {
    const [notice, setNotice] = useState<NoticeState | null>(null);
    const counter = useRef(0);
    const show = useCallback((tone: NoticeTone, text: string) => {
        counter.current += 1;
        setNotice({ id: counter.current, tone, text });
    }, []);
    const dismiss = useCallback(() => setNotice(null), []);
    return { notice, show, dismiss };
}

export function Notice({ notice, onDismiss }: { notice: NoticeState | null; onDismiss: () => void }) {
    const { t } = useI18n();

    useEffect(() => {
        if (!notice) return;
        const timer = window.setTimeout(onDismiss, notice.tone === 'error' ? 6000 : 3500);
        return () => window.clearTimeout(timer);
    }, [notice, onDismiss]);

    return (
        <div
            aria-live="polite"
            className="pointer-events-none fixed inset-x-4 bottom-[calc(env(safe-area-inset-bottom)+5.25rem)] z-[60] flex justify-center lg:bottom-6 lg:left-auto lg:right-6 lg:justify-end"
        >
            {notice && (
                <div
                    key={notice.id}
                    role={notice.tone === 'error' ? 'alert' : 'status'}
                    className="animate-rise pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border border-line bg-surface p-4 shadow-xl [animation-duration:0.35s]"
                >
                    {notice.tone === 'success'
                        ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
                        : <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-danger" />}
                    <p className="flex-1 text-sm leading-relaxed text-ink">{notice.text}</p>
                    <button type="button" onClick={onDismiss} aria-label={t.common.dismiss} className="-m-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-ink-3 hover:bg-surface-2">
                        <X className="h-4 w-4" />
                    </button>
                </div>
            )}
        </div>
    );
}
