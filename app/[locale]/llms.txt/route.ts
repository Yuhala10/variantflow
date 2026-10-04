import { getDictionary, isLocale, localePath, locales } from '../../../lib/i18n';
import { GUIDE_KEYS, LANDING_KEYS, guidePath, landingPath } from '../../../lib/i18n/routes';
import { getLanding } from '../../../lib/content/landing';
import { getGuide } from '../../../lib/content/guides';
import { getMarketing } from '../../../lib/content/marketing';
import { absoluteUrl, siteConfig } from '../../../lib/site';

export const dynamic = 'force-static';
export const dynamicParams = false;

export function generateStaticParams() {
    return locales.map((locale) => ({ locale }));
}

/** A plain-text map of the site for AI assistants and answer engines (llmstxt.org format). */
export async function GET(_request: Request, { params }: { params: Promise<{ locale: string }> }) {
    const { locale: raw } = await params;
    const locale = isLocale(raw) ? raw : 'en';
    const t = getDictionary(locale);
    const m = getMarketing(locale);
    const url = (path: string) => absoluteUrl(localePath(locale, path));

    const lines = [
        `# ${siteConfig.name}`,
        '',
        `> ${t.meta.description}`,
        '',
        `## ${m.labels.features}`,
        ...LANDING_KEYS.map((key) => {
            const page = getLanding(locale, key);
            return `- [${page.nav}](${url(landingPath(key, locale))}): ${page.description}`;
        }),
        '',
        `## ${m.labels.guides}`,
        ...GUIDE_KEYS.map((key) => {
            const guide = getGuide(locale, key);
            return `- [${guide.title}](${url(guidePath(key, locale))}): ${guide.description}`;
        }),
        '',
        `## ${t.footer.product}`,
        `- [${t.nav.pricing}](${url('/pricing')}): ${t.seo.pricing.description}`,
        `- [${t.footer.howToPay}](${url('/how-to-pay')}): ${t.seo.howToPay.description}`,
        `- [${t.footer.privacy}](${url('/privacy')})`,
        `- [${t.footer.terms}](${url('/terms')})`,
        '',
    ];

    return new Response(lines.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
