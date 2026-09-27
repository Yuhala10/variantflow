'use client';

import React, { useState } from 'react';
import { MessageCircle, Send } from 'lucide-react';
import { useI18n } from '../i18n/i18n-provider';

export function FeedbackForm() {
    const { t } = useI18n();
    const copy = t.workspace.tools;
    const [name, setName] = useState('');
    const [message, setMessage] = useState('');

    const send = (event: React.FormEvent) => {
        event.preventDefault();
        const trimmedMessage = message.trim();
        if (!trimmedMessage) return;
        const namePart = name.trim() ? `${copy.whatsappName}: ${name.trim()}\n` : '';
        const text = encodeURIComponent(`${namePart}${copy.whatsappMessage}: ${trimmedMessage}`);
        window.open(`https://wa.me/681731512?text=${text}`, '_blank', 'noopener,noreferrer');
    };

    return (
        <form onSubmit={send}>
            <h3 className="flex items-center gap-2 text-[13px] font-semibold text-ink">
                <MessageCircle className="h-4 w-4 text-ink-3" /> {copy.feedbackTitle}
            </h3>
            <p className="mb-3 mt-1 text-xs text-ink-3">{copy.feedbackText}</p>
            <div className="space-y-2.5">
                <input value={name} onChange={(event) => setName(event.target.value)} placeholder={copy.name} aria-label={copy.nameLabel} autoComplete="name" className="field" />
                <textarea value={message} onChange={(event) => setMessage(event.target.value)} rows={3} aria-label={copy.message} placeholder={copy.messagePlaceholder} className="field resize-y" />
                <button type="submit" disabled={!message.trim()} className="btn btn-secondary w-full"><Send /> {copy.send}</button>
            </div>
        </form>
    );
}
