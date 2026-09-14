import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Roboto } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { Toaster } from "sonner";
import { SITE_URL } from "@genz/utils";

const siteUrl = SITE_URL || "https://seller.genz-platform.com";

const fontSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const fontRoboto = Roboto({
  subsets: ["latin"],
  variable: "--font-roboto",
  weight: ["300", "400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Seller Portal | GenZ",
    template: "%s | GenZ Seller",
  },
  description: "Manage products, orders, verification, and analytics on GenZ Platform.",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.ico",
    apple: "/logo.png",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${fontSans.variable} ${fontRoboto.variable} flex min-h-screen flex-col font-sans antialiased`}
        suppressHydrationWarning
      >
        {children}
        <Toaster position="top-center" richColors closeButton />
        <Analytics />
      </body>
    </html>
  );
}
