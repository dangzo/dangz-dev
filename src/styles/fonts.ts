import { Geist, Geist_Mono, Roboto, Roboto_Slab } from 'next/font/google';

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

export const robotoSlab = Roboto_Slab({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-roboto-slab',
  display: 'optional',
});
