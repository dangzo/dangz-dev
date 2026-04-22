import { Header, Footer } from '@/components/layout';
import Script from 'next/script';
import { GoogleAnalytics } from '@next/third-parties/google';
import ThemeProvider from '@/contexts/ThemeProvider';
import { baseMetadata } from '@/data/siteMetadata';
import { geist, geistMono, roboto, robotoSlab } from '@/styles/fonts';
import 'react-loading-skeleton/dist/skeleton.css';
import '@/styles/tailwind.css';

export const metadata = {
  ...baseMetadata,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geist.variable} ${geistMono.variable} ${roboto.variable} ${robotoSlab.variable} antialiased`}
      suppressHydrationWarning
    >
      <head>
        <meta name="msapplication-TileColor" content="#000000" />
        <meta name="theme-color" media="(prefers-color-scheme: light)" content="#eee" />
        <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#000" />

        <link rel="apple-touch-icon" sizes="180x180" href="/apple-icon.png" />
        <link rel="icon" type="image/png" sizes="48x48" href="/favicon-48x48.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />

        <Script defer src="https://cloud.umami.is/script.js" data-website-id="546ca232-1b93-4b09-862d-8aebf53123d0" />
      </head>

      {process.env.NODE_ENV === 'production' && <GoogleAnalytics gaId={process.env.G_ID || ''} />}

      <body
        className="antialiased
          bg-background-main-light text-main-light dark:bg-background-main-dark dark:text-main-dark
        "
      >
        <ThemeProvider>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 xl:px-0">
            <Header />
            <main className="min-h-[calc(100vh-300px)] py-2 sm:pt-6 sm:pb-8">
              {children}
            </main>
          </div>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
