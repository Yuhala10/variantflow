import { Crown, ShieldCheck, Sparkles } from 'lucide-react';
import { AccountAccess } from '../../types';

export function PlanBadge({ access }: { access: AccountAccess }) {
    if (access.role === 'owner') {
        return <span className="chip bg-gold-soft text-gold ring-1 ring-gold/25"><Crown className="h-3 w-3" /> Owner · All access</span>;
    }
    if (access.role === 'admin') {
        return <span className="chip bg-gold-soft text-gold ring-1 ring-gold/25"><ShieldCheck className="h-3 w-3" /> Admin · All access</span>;
    }
    if (access.tier === 'FREE') {
        return <span className="chip bg-surface-2 text-ink-2">Free plan</span>;
    }
    return <span className="chip bg-brand-soft text-brand-ink"><Sparkles className="h-3 w-3" /> {access.tier === 'PRO' ? 'Pro' : 'Scale'} plan</span>;
}
