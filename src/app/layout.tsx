import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import "./globals.css";
import { CookieConsent } from "@/components/cookie-consent";
import { getUserAndProfile } from "@/lib/auth";
import { signOut } from "@/app/login/actions";
import { LayoutWrapper } from "@/components/layout-wrapper";

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
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getUserAndProfile();
  const isLoggedIn = !!session;
  const role = session?.profile?.role;
  const userName = session?.profile?.full_name || session?.email;

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${graphik.variable} ${grenette.variable} antialiased min-h-screen flex flex-col`} suppressHydrationWarning>
        <LayoutWrapper
          isLoggedIn={isLoggedIn}
          role={role}
          userName={userName}
          signOutAction={signOut}
        >
          {children}
        </LayoutWrapper>
        <CookieConsent />
      </body>
    </html>
  );
}
