import { renderShareImage } from '../../../../lib/og-image';
import { isLocale, locales } from '../../../../lib/i18n';
import { GUIDE_KEYS, LANDING_KEYS, type GuideKey, type LandingKey } from '../../../../lib/i18n/routes';
import { getLanding } from '../../../../lib/content/landing';
import { getGuide } from '../../../../lib/content/guides';
import { getMarketing } from '../../../../lib/content/marketing';

export const dynamic = 'force-static';
export const dynamicParams = false;

export function generateStaticParams() {
    return locales.flatMap((locale) => [...LANDING_KEYS, ...GUIDE_KEYS].map((key) => ({ locale, key })));
}

/** Share image for one landing page or guide, in its language (/og/<key> and /fr/og/<key>). */
export async function GET(_request: Request, { params }: { params: Promise<{ locale: string; key: string }> }) {
    const { locale: raw, key } = await params;
    const locale = isLocale(raw) ? raw : 'en';

    if ((LANDING_KEYS as string[]).includes(key)) {
        const page = getLanding(locale, key as LandingKey);
        return renderShareImage({ eyebrow: page.eyebrow, title: `${page.h1} ${page.h1Accent}` });
    }
    if ((GUIDE_KEYS as string[]).includes(key)) {
        const guide = getGuide(locale, key as GuideKey);
        return renderShareImage({ eyebrow: getMarketing(locale).labels.guides, title: guide.title });
    }
    return new Response('Not found', { status: 404 });
}
