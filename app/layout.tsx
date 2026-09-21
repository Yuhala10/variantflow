import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://variantflow.app'),
  title: {
    default: 'VariantFlow — Product Variant Generator & Shopify CSV Tool',
    template: '%s | VariantFlow',
  },
  description:
    'Generate product variants, build SKU patterns, apply pricing rules, validate catalog structure, and export Shopify-ready CSV files in minutes.',
  keywords: [
    'variant generator',
    'shopify csv export',
    'product variant builder',
    'sku generator',
    'catalog validation',
    'pricing rules',
    'product matrix tool',
    'ecommerce catalog workflow',
  ],
  applicationName: 'VariantFlow',
  authors: [{ name: 'VariantFlow' }],
  creator: 'VariantFlow',
  publisher: 'VariantFlow',
  category: 'technology',
  openGraph: {
    title: 'VariantFlow — Product Variant Generator & Shopify CSV Tool',
    description:
      'Generate product variants, apply rules, validate your catalog, and export clean CSV files for Shopify.',
    url: 'https://variantflow.app',
    siteName: 'VariantFlow',
    locale: 'en_US',
    type: 'website',
    images: [{ url: '/og-image.svg', width: 1200, height: 630, alt: 'VariantFlow dashboard preview' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VariantFlow',
    description: 'Generate product variants and export Shopify-ready CSV data from a clean product compiler.',
    images: ['/og-image.svg'],
  },
  alternates: {
    canonical: 'https://variantflow.app',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full selection:bg-slate-900 selection:text-white">
      <body className={`${inter.variable} font-sans antialiased bg-slate-50 text-slate-900 h-full min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
