import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import "./globals.css";
import { CookieConsent } from "@/components/cookie-consent";

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
  title: "GenZ",
  description: "B2C platform",
  icons: {
    icon: "/favicon.jpeg",
    shortcut: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${graphik.variable} ${grenette.variable} antialiased min-h-screen flex flex-col`} suppressHydrationWarning>
        {children}
        <CookieConsent />
      </body>
    </html>
  );
}
