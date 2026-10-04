import Link from 'next/link';
import { cn } from '../../lib/utils';

/** The bare three-layer glyph, for placing on colored backgrounds. */
export function LogoGlyph({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={cn('h-5 w-5', className)}>
            <path d="M12 3 3 7.5l9 4.5 9-4.5L12 3Z" fill="currentColor" />
            <path d="m3 12 9 4.5 9-4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.78" />
            <path d="m3 16.5 9 4.5 9-4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
        </svg>
    );
}

/** Three stacked layers — options combining into one clean catalog. */
export function LogoMark({ className }: { className?: string }) {
    return (
        <span className={cn('relative inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-[linear-gradient(135deg,#5a4ff0_10%,#c14ad6_100%)] text-white shadow-[0_6px_14px_-6px_rgb(90_79_240/0.7)]', className)}>
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-[62%] w-[62%]">
                <path d="M12 3 3 7.5l9 4.5 9-4.5L12 3Z" fill="currentColor" />
                <path d="m3 12 9 4.5 9-4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.75" />
                <path d="m3 16.5 9 4.5 9-4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.45" />
            </svg>
        </span>
    );
}

export function Logo({ href = '/', className }: { href?: string; className?: string }) {
    return (
        <Link href={href} aria-label="VariantFlow" className={cn('group inline-flex items-center gap-2.5', className)}>
            <LogoMark className="transition-transform duration-300 group-hover:-rotate-6" />
            <span className="font-display text-[16px] font-bold tracking-tight text-ink">VariantFlow</span>
        </Link>
    );
}
