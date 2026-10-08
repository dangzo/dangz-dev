import localFont from 'next/font/local';

export const geist = localFont({
  src: [
    {
      path: './fonts/geist/Geist.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: './fonts/geist/Geist.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: './fonts/geist/Geist.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-geist',
  display: 'swap',
});

export const geistMono = localFont({
  src: './fonts/geist-mono/GeistMono.woff2',
  weight: '400',
  style: 'normal',
  variable: '--font-geist-mono',
  display: 'swap',
});

export const roboto = localFont({
  src: [
    {
      path: './fonts/roboto/Roboto.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: './fonts/roboto/Roboto.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: './fonts/roboto/Roboto.woff2',
      weight: '700',
      style: 'normal',
    },
    {
      path: './fonts/roboto/Roboto-Italic.woff2',
      weight: '400',
      style: 'italic',
    },
    {
      path: './fonts/roboto/Roboto-Italic.woff2',
      weight: '500',
      style: 'italic',
    },
    {
      path: './fonts/roboto/Roboto-Italic.woff2',
      weight: '700',
      style: 'italic',
    },
  ],
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
