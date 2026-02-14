import { AuthProvider } from '@/components/auth/auth-provider';
import './globals.css';
import type { Metadata } from 'next';
import { Inter, Instrument_Serif, JetBrains_Mono } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { LanguageProvider } from '@/components/language-provider';
import { RealtimeNotifications } from '@/components/notifications/realtime-notifications';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans'
});

const serif = Instrument_Serif({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-serif'
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono'
});

export const metadata: Metadata = {
  metadataBase: new URL('https://adazeconnect.com'),
  title: {
    default: 'ADAZE - Ultimate African Mitumba Marketplace | Second-Hand Fashion',
    template: '%s | ADAZE'
  },
  description: 'Discover quality second-hand fashion at unbeatable prices. Connect traders, buyers, and transporters in Africa\'s premier mitumba marketplace with real-time tracking, secure M-Pesa payments, and verified sellers. Shop now!',
  keywords: [
    'mitumba',
    'second-hand clothes',
    'African marketplace',
    'fashion marketplace Kenya',
    'thrift shopping Africa',
    'buy second-hand clothes',
    'mitumba trading platform',
    'Kenya marketplace',
    'Tanzania fashion',
    'Uganda thrift',
    'Nigeria second-hand',
    'Ghana marketplace',
    'Rwanda fashion',
    'sustainable fashion Africa',
    'vintage clothes',
    'preloved fashion',
    'M-Pesa payments',
    'verified sellers',
    'online thrift store'
  ],
  authors: [{ name: 'ADAZE Team', url: 'https://adazeconnect.com' }],
  creator: 'ADAZE',
  publisher: 'ADAZE',
  category: 'E-commerce',
  classification: 'Marketplace',
  alternates: {
    canonical: 'https://adazeconnect.com'
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'ADAZE',
    startupImage: '/startup-image.png'
  },
  openGraph: {
    title: 'ADAZE - Ultimate African Mitumba Marketplace',
    description: 'Shop quality second-hand fashion across Africa. Connect with verified sellers, enjoy secure M-Pesa payments, and discover amazing deals on preloved clothes.',
    url: 'https://adazeconnect.com',
    siteName: 'ADAZE',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'ADAZE Marketplace - Buy & Sell Quality Second-Hand Fashion'
      }
    ],
    locale: 'en_US',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ADAZE - Ultimate African Mitumba Marketplace',
    description: 'Shop quality second-hand fashion across Africa. Verified sellers, secure payments, amazing deals!',
    images: ['/twitter-image.png'],
    creator: '@adazeconnect'
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
  },
  verification: {
    google: 'googlebd93f900b7be6f82'
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // JSON-LD Structured Data for Organization
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'ADAZE',
    description: 'Africa\'s premier mitumba marketplace connecting traders, buyers, and transporters',
    url: 'https://adazeconnect.com',
    logo: 'https://adazeconnect.com/icon-512.png',
    sameAs: [
      'https://twitter.com/adazeconnect',
      'https://facebook.com/adazeconnect'
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      availableLanguage: ['English', 'Swahili']
    }
  };

  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${serif.variable} ${mono.variable}`}>
      <head>
        <link rel="icon" href="/icon-72.png" />
        <link rel="apple-touch-icon" href="/icon-144.png" />
        <meta name="google-site-verification" content="googlebd93f900b7be6f82" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#F97316" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body suppressHydrationWarning className={`antialiased bg-grid-slate-900/[0.04]`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange={false}
        >
          <AuthProvider>
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
              <RealtimeNotifications />
            </LanguageProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
