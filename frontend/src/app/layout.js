import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import Script from 'next/script';

export const metadata = {
  title: {
    default: 'NotebookForU - Personalized Notebooks',
    template: '%s | NotebookForU',
  },
  description:
    'Create, customize, and order unique notebooks for all occasions. Perfect for gifts, journals, and special events.',
  keywords: ['notebooks', 'custom notebooks', 'personalized journals', 'gift notebooks'],
  icons: {
    icon: '/logo.ico',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'NotebookForU - Personalized Notebooks',
    description: 'Design your perfect notebook with our customization tools',
    url: 'https://notebookforu.in',
    siteName: 'NotebookForU',
    images: [
      {
        url: 'https://notebookforu.in/logo.png',
        width: 1200,
        height: 630,
        alt: 'NotebookForU Custom Notebooks',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NotebookForU - Personalized Notebooks',
    description: 'Design your perfect notebook with our customization tools',
    images: ['https://notebookforu.in/logo.png'],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        {/* ✅ Google AdSense Script */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1295474251832679"
          crossOrigin="anonymous"
          strategy="beforeInteractive"
        />
      </head>
      <body className="flex flex-col min-h-screen bg-gray-50 text-gray-900">
        <Navbar />
        <main className="flex-grow">{children}</main>
        <Footer />

        {/* ✅ Vercel Analytics & Speed Insights */}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
