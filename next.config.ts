import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: false,
  },
  experimental: {
    // Pages live under app/[locale], so unmatched URLs need a standalone 404 (app/global-not-found.tsx).
    globalNotFound: true,
  },
};

export default nextConfig;
