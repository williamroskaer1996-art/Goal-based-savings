import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { AppStoreProvider } from '@/lib/store';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Triodos Bank',
  description: 'Banking with purpose. Triodos Bank.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#F3EDE4',
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
        <AppStoreProvider>
          {/* pt-[54px] clears the status bar / Dynamic Island in the mockup iframe */}
          <div className="mx-auto min-h-screen w-full max-w-md bg-birch-skin pt-[54px]">
            {children}
          </div>
        </AppStoreProvider>
      </body>
    </html>
  );
}
