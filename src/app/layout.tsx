import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import "./globals.css";
import { CookieConsent } from "@/components/cookie-consent";
import { Analytics } from "@vercel/analytics/next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://genzonline.in";

// Graphik substitute — UI/body workhorse sans
const graphik = Inter({
  subsets: ["latin"],
  variable: "--font-graphik",
  weight: ["400", "500", "600"],
});

// Grenette substitute — editorial display serif, tight tracking at 36px+
const grenette = Fraunces({
  subsets: ["latin"],
  variable: "--font-grenette",
  weight: ["400"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "GenZ — Direct Made-in-India Manufacturing & Sourcing",
    template: "%s | GenZ",
  },
  description:
    "Discover and buy directly from verified Indian manufacturers, artisans, and innovators. Transparent pricing, direct sourcing, zero middleman markups.",
  keywords: [
    "Indian Manufacturers",
    "Made in India",
    "Direct Factory Sourcing",
    "B2C Manufacturing",
    "MSME Indian Marketplace",
    "Verified Suppliers India",
  ],
  authors: [{ name: "GenZ Platform" }],
  creator: "GenZ Platform",
  publisher: "GenZ Platform",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: "/favicon.jpeg",
    shortcut: "/favicon.ico",
    apple: "/logo.jpeg",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteUrl,
    title: "GenZ — Direct Made-in-India Manufacturing & Sourcing",
    description:
      "Empowering verified Indian manufacturers and innovators. Connect directly with makers and source quality Indian products.",
    siteName: "GenZ Platform",
    images: [
      {
        url: "/logo.jpeg",
        width: 800,
        height: 800,
        alt: "GenZ Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "GenZ — Direct Made-in-India Manufacturing Platform",
    description:
      "Connect directly with verified Indian manufacturers and source quality products with zero middleman markups.",
    images: ["/logo.jpeg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "GenZ Platform",
    url: siteUrl,
    logo: `${siteUrl}/logo.jpeg`,
    description:
      "India's trusted B2C manufacturing and innovation platform connecting buyers with verified domestic makers.",
    sameAs: ["https://www.instagram.com/genzonline.in"],
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${graphik.variable} ${grenette.variable} flex min-h-screen flex-col antialiased`}
        suppressHydrationWarning
      >
        {children}
        <CookieConsent />
        <Analytics />
      </body>
    </html>
  );
}
