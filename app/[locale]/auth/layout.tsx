import { Suspense } from 'react';
import { pageMetadata } from '../../../lib/seo';
import { resolveLocale, type LocaleParams } from '../../../lib/i18n/server';

export async function generateMetadata({ params }: LocaleParams) {
    const { locale, t } = await resolveLocale(params);
    return pageMetadata(locale, { title: t.seo.auth.title, description: t.seo.auth.description, path: '/auth', noIndex: true });
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    // useSearchParams in the page needs a Suspense boundary for static rendering.
    return <Suspense>{children}</Suspense>;
}
