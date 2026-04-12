import type { Metadata } from 'next';

const siteName = 'dangz.dev';
const defaultPageTitle = 'Daniele Gazzelloni | Frontend Engineering Blog';
const title = `${siteName} | ${defaultPageTitle}`;
const description = 'Practical insights on how to build scalable, maintainable, and high-performance frontend web apps in React, Vue and TypeScript.';
const author = 'Daniele Gazzelloni';
const siteUrl = 'https://www.dangz.dev';

const baseMetadata: Metadata = {
  metadataBase: new URL(siteUrl),
  authors: [{ name: 'Daniele Gazzelloni', url: siteUrl }],
  publisher: 'Daniele Gazzelloni',
  creator: 'Daniele Gazzelloni',
  generator: 'Next.js',
  title: {
    default: title,
    // Any page-level title automatically becomes "{page} | dangz.dev".
    template: `%s | ${siteName}`,
  },
  description,
  keywords: [
    'frontend development',
    'react',
    'vue',
    'typescript',
    'javascript',
    'web development',
    'programming',
    'software engineering',
    'web performance',
    'scalable web apps',
    'senior frontend engineer',
    'frontend architecture',
    'frontend best practices',
  ],
  openGraph: {
    title,
    description,
    url: siteUrl,
    siteName,
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: siteName,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: siteUrl,
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

const links = {
  email: 'dangz.dev@gmail.com',
  github: 'https://github.com/dangzo',
  linkedin: 'https://www.linkedin.com/in/dangzo',
  resumeURL: '/Daniele-Gazzelloni-Resume-2026.pdf',
};

export {
  author,
  title,
  description,
  siteName,
  baseMetadata,
  links,  
};