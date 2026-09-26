import { Suspense } from 'react';
import { pageMetadata } from '../../lib/seo';

export const metadata = pageMetadata({
    title: 'Sign in',
    description: 'Sign in or create a free VariantFlow account to save your catalogs across devices.',
    path: '/auth',
    noIndex: true,
});

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    // useSearchParams in the page needs a Suspense boundary for static rendering.
    return <Suspense>{children}</Suspense>;
}
