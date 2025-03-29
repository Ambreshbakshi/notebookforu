import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata = {
  title: {
    default: 'NotebookForU - Personalized Notebooks',
    template: '%s | NotebookForU'
  },
  description: 'Create, customize, and order unique notebooks for all occasions. Perfect for gifts, journals, and special events.',
  keywords: ['notebooks', 'custom notebooks', 'personalized journals', 'gift notebooks'],
  icons: {
    icon: '/logo.ico',
    apple: '/apple-touch-icon.png'
  },
  openGraph: {
    title: 'NotebookForU - Personalized Notebooks',
    description: 'Design your perfect notebook with our customization tools',
    url: 'https://notebookforu.vercel.app',
    siteName: 'NotebookForU',
    images: [
      {
        url: 'https://notebookforu.vercel.app/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'NotebookForU Custom Notebooks'
      }
    ],
    locale: 'en_US',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NotebookForU - Personalized Notebooks',
    description: 'Design your perfect notebook with our customization tools',
    images: ['https://notebookforu.vercel.app/og-image.jpg']
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#111827" />
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body className="flex flex-col min-h-screen bg-gray-50 text-gray-900">
        <Navbar />
        <main className="flex-grow">
          {children} {/* No container div - uses native page margins */}
        </main>
        <Footer />
      </body>
    </html>
  );
}