import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  distDir: process.env.E2E_FIXTURES === 'true' ? '.next-e2e' : '.next',
  devIndicators: process.env.E2E_FIXTURES === 'true' ? false : undefined,
  allowedDevOrigins: ['127.0.0.1'],
  experimental: {
    optimizePackageImports: [
      'clsx',
      '@sanity/image-url',
      '@next/third-parties',
      '@apollo/client',
      'next-sanity',
    ],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
    ],
  },
};

export default nextConfig;
