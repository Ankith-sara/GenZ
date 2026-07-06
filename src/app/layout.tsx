import type { Metadata } from "next";
import { Inter, PT_Serif } from "next/font/google";
import "./globals.css";
import { CookieConsent } from "@/components/cookie-consent";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["100", "400", "500"],
});

const ptSerif = PT_Serif({
  subsets: ["latin"],
  variable: "--font-pt-serif",
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "GenZ",
  description: "B2B platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${ptSerif.variable} antialiased min-h-screen flex flex-col`}>
        {children}
        <CookieConsent />
      </body>
    </html>
  );
}
