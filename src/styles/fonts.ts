import { Geist, Geist_Mono, Roboto } from 'next/font/google';
import localFont from 'next/font/local';

export const geist = Geist({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-geist',
  display: 'swap',
});

export const geistMono = Geist_Mono({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-geist-mono',
  display: 'swap',
});

export const roboto = Roboto({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  style: ['normal', 'italic'],
  variable: '--font-roboto',
  display: 'swap',
});

export const robotoSlab = localFont({
  src: [
    {
      path: './fonts/roboto-slab/RobotoSlab.woff2',
      weight: '600',
      style: 'normal',
    },
    {
      path: './fonts/roboto-slab/RobotoSlab.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-roboto-slab',
  display: 'swap',
  adjustFontFallback: 'Times New Roman',
});
