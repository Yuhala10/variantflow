import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

/** Visible breadcrumb trail; pair it with breadcrumbSchema() for search engines. */
export function Breadcrumbs({ label, items }: { label: string; items: Array<{ name: string; href?: string }> }) {
    return (
        <nav aria-label={label} className="mb-6">
            <ol className="flex flex-wrap items-center gap-1.5 text-sm text-ink-3">
                {items.map((item, index) => (
                    <li key={item.name} className="inline-flex items-center gap-1.5">
                        {index > 0 && <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />}
                        {item.href
                            ? <Link href={item.href} className="transition-colors hover:text-ink">{item.name}</Link>
                            : <span aria-current="page" className="font-medium text-ink-2">{item.name}</span>}
                    </li>
                ))}
            </ol>
        </nav>
    );
}
