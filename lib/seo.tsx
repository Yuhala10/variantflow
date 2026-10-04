import type { Metadata } from 'next';
import { BILLING_PLANS, SubscriptionTier } from '../types';
import { absoluteUrl, siteConfig } from './site';
import { getDictionary, htmlLang, localePath, locales, ogLocale, type Locale } from './i18n';

type Schema = Record<string, unknown>;

/** Renders schema.org JSON-LD. `<` is escaped so content can never close the script tag. */
export function JsonLd({ data }: { data: Schema | Schema[] }) {
    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
        />
    );
}

export const shareImagePath = (locale: Locale) => localePath(locale, '/og.png');

/** hreflang alternates for a path that exists in every language. */
export const languageAlternates = (path: string) => ({
    ...Object.fromEntries(locales.map((locale) => [htmlLang[locale], localePath(locale, path)])),
    'x-default': path,
});

interface PageMetadataInput {
    title: string;
    description: string;
    /** Path without language prefix, when it is the same in every language. */
    path: string;
    /** Per-language paths, for pages whose URL is translated (overrides `path`). */
    paths?: Record<Locale, string>;
    /** Use the plain title without the "· VariantFlow" suffix. */
    absoluteTitle?: boolean;
    noIndex?: boolean;
    /** Prefix-free path of this page's share image; defaults to the site image. */
    ogImage?: string;
    /** Marks the page as an article (guides). */
    article?: { published: string; modified: string };
}

export function pageMetadata(locale: Locale, { title, description, path, paths, absoluteTitle, noIndex, ogImage, article }: PageMetadataInput): Metadata {
    const socialTitle = absoluteTitle ? title : `${title} · ${siteConfig.name}`;
    const pathFor = (target: Locale) => localePath(target, paths ? paths[target] : path);
    const url = pathFor(locale);
    const image = { url: localePath(locale, ogImage ?? '/og.png'), width: 1200, height: 630, alt: ogImage ? title : getDictionary(locale).meta.ogAlt };

    return {
        title: absoluteTitle ? { absolute: title } : title,
        description,
        alternates: {
            canonical: url,
            languages: { ...Object.fromEntries(locales.map((target) => [htmlLang[target], pathFor(target)])), 'x-default': pathFor('en') },
        },
        openGraph: {
            title: socialTitle,
            description,
            url,
            siteName: siteConfig.name,
            locale: ogLocale[locale],
            alternateLocale: locales.filter((other) => other !== locale).map((other) => ogLocale[other]),
            images: [image],
            ...(article
                ? { type: 'article' as const, publishedTime: article.published, modifiedTime: article.modified, authors: [siteConfig.name] }
                : { type: 'website' as const }),
        },
        twitter: { card: 'summary_large_image', title: socialTitle, description, images: [image.url] },
        robots: noIndex ? { index: false, follow: false, googleBot: { index: false, follow: false } } : undefined,
    };
}

export const organizationSchema = (locale: Locale): Schema => ({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${siteConfig.url}/#organization`,
    name: siteConfig.name,
    url: siteConfig.url,
    logo: absoluteUrl('/logo.png'),
    description: getDictionary(locale).meta.shortDescription,
});

export const websiteSchema = (locale: Locale): Schema => ({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${siteConfig.url}/#website`,
    name: siteConfig.name,
    url: absoluteUrl(localePath(locale, '/')),
    description: getDictionary(locale).meta.description,
    inLanguage: locales.map((other) => htmlLang[other]),
    publisher: { '@id': `${siteConfig.url}/#organization` },
});

export const softwareApplicationSchema = (locale: Locale): Schema => {
    const t = getDictionary(locale);
    return {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        '@id': `${siteConfig.url}/#software`,
        name: siteConfig.name,
        url: absoluteUrl(localePath(locale, '/')),
        applicationCategory: 'BusinessApplication',
        applicationSubCategory: t.meta.applicationSubCategory,
        operatingSystem: 'Web browser, iOS, Android, Windows, macOS',
        description: t.meta.description,
        inLanguage: htmlLang[locale],
        availableLanguage: locales.map((other) => htmlLang[other]),
        featureList: t.meta.featureList,
        offers: (Object.keys(BILLING_PLANS) as SubscriptionTier[]).map((tier) => {
            const plan = BILLING_PLANS[tier];
            return {
                '@type': 'Offer',
                name: t.plans[tier].name,
                description: t.plans[tier].description,
                price: plan.priceUsdt.toFixed(2),
                priceCurrency: 'USD',
                url: absoluteUrl(localePath(locale, '/pricing')),
                availability: 'https://schema.org/InStock',
                ...(plan.priceUsdt > 0 && {
                    priceSpecification: { '@type': 'UnitPriceSpecification', price: plan.priceUsdt.toFixed(2), priceCurrency: 'USD', unitCode: 'MON', billingDuration: 'P1M' },
                }),
            };
        }),
        publisher: { '@id': `${siteConfig.url}/#organization` },
    };
};

export const faqSchema = (items: ReadonlyArray<{ question: string; answer: string }>, locale: Locale): Schema => ({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    inLanguage: htmlLang[locale],
    mainEntity: items.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
});

export const breadcrumbSchema = (locale: Locale, items: ReadonlyArray<{ name: string; path: string }>): Schema => ({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: absoluteUrl(localePath(locale, item.path)),
    })),
});

export const howToSchema = (locale: Locale, name: string, steps: ReadonlyArray<{ title: string; text: string }>): Schema => ({
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name,
    inLanguage: htmlLang[locale],
    step: steps.map((step, index) => ({ '@type': 'HowToStep', position: index + 1, name: step.title, text: step.text })),
});

export const webPageSchema = (locale: Locale, page: { name: string; description: string; path: string }): Schema => ({
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${absoluteUrl(localePath(locale, page.path))}#webpage`,
    url: absoluteUrl(localePath(locale, page.path)),
    name: page.name,
    description: page.description,
    inLanguage: htmlLang[locale],
    isPartOf: { '@id': `${siteConfig.url}/#website` },
    about: { '@id': `${siteConfig.url}/#software` },
});

export const articleSchema = (
    locale: Locale,
    article: { title: string; description: string; path: string; published: string; modified: string; image: string },
): Schema => ({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    inLanguage: htmlLang[locale],
    datePublished: article.published,
    dateModified: article.modified,
    image: absoluteUrl(localePath(locale, article.image)),
    mainEntityOfPage: absoluteUrl(localePath(locale, article.path)),
    author: { '@id': `${siteConfig.url}/#organization` },
    publisher: { '@id': `${siteConfig.url}/#organization` },
});

export const itemListSchema = (name: string, items: ReadonlyArray<{ name: string; url: string }>): Schema => ({
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    itemListElement: items.map((item, index) => ({ '@type': 'ListItem', position: index + 1, name: item.name, url: absoluteUrl(item.url) })),
});
