import type { Metadata } from 'next';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import { getDictionary, localePath, locales } from '../lib/i18n';
import { themeInitScript } from '../lib/theme';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-jakarta', display: 'swap' });

export const metadata: Metadata = {
    title: 'Page not found · Page introuvable · VariantFlow',
    robots: { index: false, follow: true },
};

/**
 * Unmatched URLs bypass the per-language layouts, so this page can't know which
 * language was requested; it shows both, each linking to its own home page.
 */
export default function GlobalNotFound() {
    return (
        <html lang="en" className={`${inter.variable} ${jakarta.variable}`} suppressHydrationWarning>
            <body className="min-h-dvh bg-canvas font-sans text-ink antialiased">
                <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
                <main className="safe-top safe-bottom relative isolate flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 py-16 text-center">
                    <div className="aurora" />
                    <h1 className="display text-gradient text-8xl">404</h1>
                    <div className="mt-10 grid w-full max-w-2xl gap-6 sm:grid-cols-2">
                        {locales.map((locale) => {
                            const t = getDictionary(locale);
                            return (
                                <section key={locale} lang={locale} className="card p-6 text-left">
                                    <h2 className="text-xl font-bold tracking-tight text-ink">{t.notFound.title}</h2>
                                    <p className="mt-2 text-sm text-ink-2">{t.notFound.text}</p>
                                    <a href={localePath(locale, '/')} className="btn btn-primary mt-5">{t.common.backHome}</a>
                                </section>
                            );
                        })}
                    </div>
                </main>
            </body>
        </html>
    );
}
