import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Fraunces } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { Toaster } from "sonner";
import { SITE_URL } from "@genz/utils";

const siteUrl = SITE_URL || "https://genz-platform.com";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-graphik",
  weight: ["400", "500", "600", "700"],
});

const grenette = Fraunces({
  subsets: ["latin"],
  variable: "--font-grenette",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "GenZ — Direct Made-in-India Manufacturing & Sourcing",
    template: "%s | GenZ",
  },
  description:
    "Discover and buy directly from verified Indian sellers, artisans, and innovators. Transparent pricing, direct sourcing, zero middleman markups.",
  keywords: [
    "Indian Sellers",
    "Made in India",
    "Direct Factory Sourcing",
    "B2C Manufacturing",
    "MSME Indian Marketplace",
    "Verified Suppliers India",
  ],
  authors: [{ name: "GenZ Platform" }],
  creator: "GenZ Platform",
  publisher: "GenZ Platform",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.ico",
    apple: "/logo.png",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteUrl,
    title: "GenZ — Direct Made-in-India Manufacturing & Sourcing",
    description:
      "Empowering verified Indian sellers and innovators. Connect directly with makers and source quality Indian products.",
    siteName: "GenZ Platform",
    images: [
      {
        url: "/logo.png",
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
      "Connect directly with verified Indian sellers and source quality products with zero middleman markups.",
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
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
    logo: `${siteUrl}/logo.png`,
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
        className={`${plusJakarta.variable} ${grenette.variable} flex min-h-screen flex-col antialiased`}
        suppressHydrationWarning
      >
        {children}
        <Toaster position="top-right" richColors closeButton />
        <Analytics />
      </body>
    </html>
  );
}
