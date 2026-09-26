export function LegalPage({ eyebrow, title, updated, children }: { eyebrow: string; title: string; updated: string; children: React.ReactNode }) {
    return (
        <article className="container-page max-w-3xl animate-rise pb-24 pt-14 md:pt-20">
            <p className="eyebrow">{eyebrow}</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.03em] text-ink sm:text-5xl">{title}</h1>
            <p className="mt-4 text-sm text-ink-3">Last updated {updated}</p>
            <div className="prose-page mt-10 border-t border-line pt-4">{children}</div>
        </article>
    );
}
