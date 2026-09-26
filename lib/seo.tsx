import type { Metadata } from 'next';
import { BILLING_PLANS } from '../types';
import { absoluteUrl, siteConfig } from './site';

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

const SHARE_IMAGE = {
    url: '/opengraph-image',
    width: 1200,
    height: 630,
    alt: 'VariantFlow — generate Shopify product variants, SKUs and CSV exports in minutes',
};

interface PageMetadataInput {
    title: string;
    description: string;
    path: string;
    /** Use the plain title without the "· VariantFlow" suffix. */
    absoluteTitle?: boolean;
    noIndex?: boolean;
}

export function pageMetadata({ title, description, path, absoluteTitle, noIndex }: PageMetadataInput): Metadata {
    const socialTitle = absoluteTitle ? title : `${title} · ${siteConfig.name}`;
    return {
        title: absoluteTitle ? { absolute: title } : title,
        description,
        alternates: { canonical: path },
        // Page-level openGraph replaces the inherited object, so the share image is set explicitly.
        openGraph: { title: socialTitle, description, url: path, type: 'website', siteName: siteConfig.name, locale: siteConfig.locale, images: [SHARE_IMAGE] },
        twitter: { card: 'summary_large_image', title: socialTitle, description, images: [SHARE_IMAGE.url] },
        robots: noIndex ? { index: false, follow: false, googleBot: { index: false, follow: false } } : undefined,
    };
}

export const organizationSchema = (): Schema => ({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${siteConfig.url}/#organization`,
    name: siteConfig.name,
    url: siteConfig.url,
    logo: absoluteUrl('/logo.png'),
    description: siteConfig.shortDescription,
});

export const websiteSchema = (): Schema => ({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${siteConfig.url}/#website`,
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    inLanguage: 'en',
    publisher: { '@id': `${siteConfig.url}/#organization` },
});

const planOffers = () =>
    Object.values(BILLING_PLANS).map((plan) => ({
        '@type': 'Offer',
        name: plan.name,
        price: plan.priceUsdt.toFixed(2),
        priceCurrency: 'USD',
        description: plan.description,
        url: absoluteUrl('/pricing'),
        availability: 'https://schema.org/InStock',
        ...(plan.priceUsdt > 0 && {
            priceSpecification: {
                '@type': 'UnitPriceSpecification',
                price: plan.priceUsdt.toFixed(2),
                priceCurrency: 'USD',
                unitCode: 'MON',
                billingDuration: 'P1M',
            },
        }),
    }));

export const softwareApplicationSchema = (): Schema => ({
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    '@id': `${siteConfig.url}/#software`,
    name: siteConfig.name,
    url: siteConfig.url,
    applicationCategory: 'BusinessApplication',
    applicationSubCategory: 'E-commerce catalog management',
    operatingSystem: 'Web browser, iOS, Android, Windows, macOS',
    description: siteConfig.description,
    featureList: [
        'Generate every product variant combination from option groups',
        'Rule-based SKU templates such as TSH-{COLOR}-{SIZE}',
        'Attribute-based pricing rules',
        'Real-time catalog validation for duplicates, missing prices and invalid SKUs',
        'Shopify-ready CSV export',
        'Supplier CSV import with automatic column mapping',
    ],
    offers: planOffers(),
    publisher: { '@id': `${siteConfig.url}/#organization` },
});

export const faqSchema = (items: ReadonlyArray<{ question: string; answer: string }>): Schema => ({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
});

export const breadcrumbSchema = (items: ReadonlyArray<{ name: string; path: string }>): Schema => ({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: absoluteUrl(item.path),
    })),
});

export const howToSchema = (name: string, steps: ReadonlyArray<{ title: string; text: string }>): Schema => ({
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name,
    step: steps.map((step, index) => ({
        '@type': 'HowToStep',
        position: index + 1,
        name: step.title,
        text: step.text,
    })),
});
