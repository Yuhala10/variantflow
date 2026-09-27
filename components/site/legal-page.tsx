import { getDictionary, type Locale } from '../../lib/i18n';

interface LegalSection {
    heading: string;
    paragraphs: string[];
    bullets?: string[];
}

export function LegalPage({ locale, title, sections, children }: { locale: Locale; title: string; sections: LegalSection[]; children?: React.ReactNode }) {
    const t = getDictionary(locale);
    return (
        <article className="container-page max-w-3xl animate-rise pb-24 pt-14 md:pt-20">
            {children}
            <p className="eyebrow">{t.legal.eyebrow}</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.03em] text-ink sm:text-5xl">{title}</h1>
            <p className="mt-4 text-sm text-ink-3">{t.common.lastUpdated({ date: t.legal.updated })}</p>
            <div className="prose-page mt-10 border-t border-line pt-4">
                {sections.map((section) => (
                    <section key={section.heading}>
                        <h2>{section.heading}</h2>
                        {section.bullets && <ul>{section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>}
                        {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                    </section>
                ))}
            </div>
        </article>
    );
}
