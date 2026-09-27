import { pageMetadata } from '../../../lib/seo';
import { resolveLocale, type LocaleParams } from '../../../lib/i18n/server';

export async function generateMetadata({ params }: LocaleParams) {
    const { locale, t } = await resolveLocale(params);
    return pageMetadata(locale, { title: t.seo.workspace.title, description: t.seo.workspace.description, path: '/workspace', noIndex: true });
}

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
    return children;
}
