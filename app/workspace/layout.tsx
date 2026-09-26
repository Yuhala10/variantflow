import { pageMetadata } from '../../lib/seo';

export const metadata = pageMetadata({
    title: 'Workspace',
    description: 'Build product variants, SKUs and prices, then export a Shopify-ready CSV.',
    path: '/workspace',
    noIndex: true,
});

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
    return children;
}
