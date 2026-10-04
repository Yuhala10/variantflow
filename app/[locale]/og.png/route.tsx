import { renderShareImage } from '../../../lib/og-image';
import { getDictionary, isLocale, locales } from '../../../lib/i18n';
import { getMarketing } from '../../../lib/content/marketing';

export const dynamic = 'force-static';
export const dynamicParams = false;

export function generateStaticParams() {
    return locales.map((locale) => ({ locale }));
}

/** Localized site share image (served at /og.png and /fr/og.png). */
export async function GET(_request: Request, { params }: { params: Promise<{ locale: string }> }) {
    const { locale: raw } = await params;
    const locale = isLocale(raw) ? raw : 'en';
    const t = getDictionary(locale);
    const m = getMarketing(locale);
    return renderShareImage({ eyebrow: m.home.kicker, title: `${m.home.headline} ${m.home.headlineAccent}`, subtitle: t.meta.ogSubline });
}
