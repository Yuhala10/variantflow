import type { Metadata, Viewport } from 'next';
import { notFound } from 'next/navigation';
import { Inter, Instrument_Serif } from 'next/font/google';
import { siteConfig } from '../../lib/site';
import { JsonLd, languageAlternates, organizationSchema, websiteSchema } from '../../lib/seo';
import { getDictionary, htmlLang, isLocale, locales, ogLocale } from '../../lib/i18n';
import { I18nProvider } from '../../components/i18n/i18n-provider';
import '../globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
});

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale);

  return {
    metadataBase: new URL(siteConfig.url),
    title: { default: t.seo.home.title, template: `%s · ${siteConfig.name}` },
    description: t.meta.description,
    keywords: t.meta.keywords,
    applicationName: siteConfig.name,
    authors: [{ name: siteConfig.name, url: siteConfig.url }],
    creator: siteConfig.name,
    publisher: siteConfig.name,
    category: 'technology',
    formatDetection: { telephone: false, email: false, address: false },
    alternates: { canonical: locale === 'en' ? '/' : `/${locale}`, languages: languageAlternates('/') },
    openGraph: { type: 'website', siteName: siteConfig.name, locale: ogLocale[locale], title: t.seo.home.title, description: t.meta.description },
    twitter: { card: 'summary_large_image', title: t.seo.home.title, description: t.meta.description },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 },
    },
    icons: {
      icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
      apple: [{ url: '/apple-icon', sizes: '180x180', type: 'image/png' }],
    },
    manifest: '/manifest.webmanifest',
    appleWebApp: { capable: true, title: siteConfig.name, statusBarStyle: 'default' },
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
      other: process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION
        ? { 'msvalidate.01': process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION }
        : undefined,
    },
  };
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: siteConfig.themeColor.light },
    { media: '(prefers-color-scheme: dark)', color: siteConfig.themeColor.dark },
  ],
  colorScheme: 'light dark',
};

export default async function RootLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);

  return (
    <html lang={htmlLang[locale]} className={`${inter.variable} ${instrumentSerif.variable}`}>
      <body className="min-h-dvh bg-canvas font-sans text-ink antialiased">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-surface focus:px-4 focus:py-2 focus:shadow-lg">
          {t.common.skipToContent}
        </a>
        <JsonLd data={[organizationSchema(locale), websiteSchema(locale)]} />
        <I18nProvider locale={locale}>{children}</I18nProvider>
      </body>
    </html>
  );
}
