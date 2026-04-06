import type { Metadata } from 'next';

const title = 'Daniele Gazzelloni - Frontend Engineering Blog';
const description =
  'Practical insights on how to build scalable, maintainable, and high-performance frontend web apps in React, Vue and TypeScript.';
const author = 'Daniele Gazzelloni';
const siteName = title.split('(')[0].trim();

const baseMetadata: Metadata = {
  authors: [{ name: 'Daniele Gazzelloni', url: 'https://www.dangz.dev' }],
  publisher: 'Daniele Gazzelloni',
  creator: 'Daniele Gazzelloni',
  generator: 'Next.js',
  icons: { icon: '/favicon.ico' },
  title,
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
    url: 'https://www.dangz.dev',
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
    canonical: 'https://www.dangz.dev',
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