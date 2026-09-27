'use client';

import { Crown, ShieldCheck, Sparkles } from 'lucide-react';
import { AccountAccess } from '../../types';
import { useI18n } from '../i18n/i18n-provider';

export function PlanBadge({ access }: { access: AccountAccess }) {
    const { t } = useI18n();
    const copy = t.workspace.plan;

    if (access.role === 'owner') {
        return <span className="chip bg-gold-soft text-gold ring-1 ring-gold/25"><Crown className="h-3 w-3" /> {copy.owner}</span>;
    }
    if (access.role === 'admin') {
        return <span className="chip bg-gold-soft text-gold ring-1 ring-gold/25"><ShieldCheck className="h-3 w-3" /> {copy.admin}</span>;
    }
    if (access.tier === 'FREE') {
        return <span className="chip bg-surface-2 text-ink-2">{copy.free}</span>;
    }
    return <span className="chip bg-brand-soft text-brand-ink"><Sparkles className="h-3 w-3" /> {access.tier === 'PRO' ? copy.pro : copy.scale}</span>;
}
