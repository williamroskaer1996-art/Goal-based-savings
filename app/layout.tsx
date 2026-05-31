import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { AppStoreProvider } from '@/lib/store';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-inter',
  display: 'swap',
});

const basePath = process.env.GITHUB_PAGES === 'true' ? '/Goal-based-savings' : '';

export const metadata: Metadata = {
  title: 'Triodos Bank',
  description: 'Banking with purpose. Triodos Bank.',
  manifest: `${basePath}/manifest.json`,
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Triodos',
  },
  icons: {
    apple: `${basePath}/apple-touch-icon.png`,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#F3EDE4',
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Syne:wght@500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-birch-skin text-charcoal antialiased">
        <ErrorBoundary>
          <AppStoreProvider>
            <div className="mx-auto min-h-dvh w-full max-w-md bg-birch-skin" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
              {children}
            </div>
          </AppStoreProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
