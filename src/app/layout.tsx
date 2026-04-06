import { Header, Footer } from '@/components';
import { GoogleAnalytics } from '@next/third-parties/google';
import ThemeProvider from '@/contexts/ThemeProvider';
import { baseMetadata } from '@/data/siteMetadata';
import 'react-loading-skeleton/dist/skeleton.css';
import '@/styles/tailwind.css';

export const metadata = {
  ...baseMetadata,
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className="antialiased"
      suppressHydrationWarning
    >
      <meta name="msapplication-TileColor" content="#000000" />
      <meta name="theme-color" media="(prefers-color-scheme: light)" content="#eee" />
      <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#000" />

      {process.env.NODE_ENV === 'production' && <GoogleAnalytics gaId={process.env.G_ID || ''} />}

      <body
        className="antialiased
          bg-background-main-light text-main-light dark:bg-background-main-dark dark:text-main-dark
        "
      >
        <ThemeProvider>
          <div className="mx-auto max-w-5xl px-4 sm:px-6 xl:px-0">
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
