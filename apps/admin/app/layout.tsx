import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Fraunces } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { Toaster } from "sonner";
import { SITE_URL } from "@genz/utils";

const siteUrl = SITE_URL || "https://admin.genz-platform.com";

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
    default: "Admin Portal | GenZ Platform",
    template: "%s | GenZ Admin",
  },
  description:
    "Platform administration, verifications, user management, and system metrics.",
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
