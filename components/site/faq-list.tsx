import { Plus } from 'lucide-react';

export function FaqList({ items }: { items: ReadonlyArray<{ question: string; answer: string }> }) {
    return (
        <div className="divide-y divide-line overflow-hidden rounded-[1.375rem] border border-line bg-surface shadow-sm">
            {items.map((item) => (
                <details key={item.question} className="group">
                    <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-6 px-6 py-4 text-left text-[15px] font-medium text-ink transition-colors hover:bg-surface-2/60 [&::-webkit-details-marker]:hidden">
                        <h3>{item.question}</h3>
                        <Plus className="h-4 w-4 shrink-0 text-ink-3 transition-transform duration-300 group-open:rotate-45" aria-hidden="true" />
                    </summary>
                    <p className="px-6 pb-5 text-[15px] leading-relaxed text-ink-2">{item.answer}</p>
                </details>
            ))}
        </div>
    );
}
