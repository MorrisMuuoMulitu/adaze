import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { LanguageProvider } from '@/components/language-provider';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
});

export const metadata: Metadata = {
  metadataBase: new URL('https://adaze.africa'),
  title: 'ADAZE - Ultimate African Mitumba Marketplace',
  description: 'Discover quality second-hand fashion at unbeatable prices. Connect traders, buyers, and transporters in Africa\'s premier mitumba marketplace with real-time tracking, secure payments, and community features.',
  keywords: 'mitumba, second-hand clothes, African marketplace, fashion, trading, Kenya, Tanzania, Uganda, Nigeria, Ghana, Rwanda, sustainable fashion, thrift, vintage',
  authors: [{ name: 'ADAZE Team' }],
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F97316' },
    { media: '(prefers-color-scheme: dark)', color: '#F97316' }
  ],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'ADAZE',
    startupImage: '/startup-image.png'
  },
  openGraph: {
    title: 'ADAZE - Ultimate African Mitumba Marketplace',
    description: 'Discover quality second-hand fashion at unbeatable prices across Africa',
    url: 'https://adaze.africa',
    siteName: 'ADAZE',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'ADAZE Marketplace'
      }
    ],
    locale: 'en_US',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ADAZE - Ultimate African Mitumba Marketplace',
    description: 'Discover quality second-hand fashion at unbeatable prices across Africa',
    images: ['/twitter-image.png']
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1
    }
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className={`antialiased bg-grid-slate-900/[0.04]`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange={false}
        >
          <LanguageProvider>
            <div className="min-h-screen bg-background text-foreground">
              {children}
            </div>
            <Toaster 
              position="top-right"
              toastOptions={{
                style: {
                  background: 'hsl(var(--card))',
                  color: 'hsl(var(--card-foreground))',
                  border: '1px solid hsl(var(--border))'
                }
              }}
            />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}