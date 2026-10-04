import { Plus } from 'lucide-react';

export function FaqList({ items }: { items: ReadonlyArray<{ question: string; answer: string }> }) {
    return (
        <div className="space-y-3">
            {items.map((item) => (
                <details key={item.question} className="group card overflow-hidden transition-shadow duration-300 open:shadow-md">
                    <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-6 px-6 py-4 text-left [&::-webkit-details-marker]:hidden">
                        <h3 className="font-sans text-base font-semibold tracking-normal text-ink">{item.question}</h3>
                        <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-2 text-ink-2 transition-all duration-300 group-open:rotate-45 group-open:bg-brand group-open:text-on-brand">
                            <Plus className="h-4 w-4" aria-hidden="true" />
                        </span>
                    </summary>
                    <p className="px-6 pb-6 text-[15px] leading-relaxed text-ink-2">{item.answer}</p>
                </details>
            ))}
        </div>
    );
}
