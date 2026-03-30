import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BS3DCRAFTS.CO - Premium 3D Baskı",
  description: "Precision in Every Layer. Profesyonel 3D baskı ürünleri.",
  keywords: ["3D baskı", "3D printing", "PLA", "PETG", "reçine", "resin", "özel tasarım", "custom design"],
  authors: [{ name: "BS3DCRAFTS.CO" }],
  creator: "BS3DCRAFTS.CO",
  publisher: "BS3DCRAFTS.CO",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://bs3dcrafts.vercel.app'),
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    url: '/',
    title: 'BS3DCRAFTS.CO - Premium 3D Baskı',
    description: 'Precision in Every Layer. Profesyonel 3D baskı ürünleri.',
    siteName: 'BS3DCRAFTS.CO',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'BS3DCRAFTS.CO - Premium 3D Baskı',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BS3DCRAFTS.CO - Premium 3D Baskı',
    description: 'Precision in Every Layer. Profesyonel 3D baskı ürünleri.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'BS3DCRAFTS.CO',
    description: 'Precision in Every Layer. Profesyonel 3D baskı ürünleri.',
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://bs3dcrafts.vercel.app',
    logo: `${process.env.NEXT_PUBLIC_APP_URL || 'https://bs3dcrafts.vercel.app'}/logo.png`,
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      availableLanguage: ['Turkish', 'English'],
    },
    sameAs: [],
  }

  return (
    <html lang="tr" className="dark">
      <body className={inter.className}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
