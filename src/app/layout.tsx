import { Header, Footer } from '@/components/layout';
import { baseMetadata } from '@/data/siteMetadata';
import { geist, geistMono, roboto, robotoSlab } from '@/styles/fonts';
import UmamiScript from '@/components/analytics/UmamiScript';
import UmamiPageviews from '@/components/analytics/UmamiPageviews';
import { Suspense } from 'react';
import ThemeProvider from '@/contexts/ThemeProvider';
import 'react-loading-skeleton/dist/skeleton.css';
import '@/styles/tailwind.css';

export const metadata = {
  ...baseMetadata,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const fixtureAnalytics = process.env.E2E_FIXTURES === 'true' && process.env.E2E_UMAMI_PAGEVIEWS === 'true';
  const analyticsEnabled = process.env.NODE_ENV === 'production' || fixtureAnalytics;

  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
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

        {analyticsEnabled && (
          <UmamiScript websiteId={fixtureAnalytics ? '00000000-0000-0000-0000-000000000186' : undefined} />
        )}
      </head>

      <body
        className="antialiased
          bg-background-main-light text-main-light dark:bg-background-main-dark dark:text-main-dark
        "
      >
        {analyticsEnabled && (
          <Suspense fallback={null}>
            <UmamiPageviews />
          </Suspense>
        )}
        <ThemeProvider>
          <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-80 focus:rounded-lg focus:bg-primary-700 focus:px-5 focus:py-3 focus:text-white">Skip to content</a>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 xl:px-0">
            <Header />
            <main id="main-content" tabIndex={-1} className="min-h-[calc(100vh-300px)] py-2 sm:pt-6 sm:pb-8">
              {children}
            </main>
          </div>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
