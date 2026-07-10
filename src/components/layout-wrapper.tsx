"use client";

import { usePathname } from "next/navigation";
import { Header } from "./header";
import { Footer } from "./footer";

interface LayoutWrapperProps {
  children: React.ReactNode;
  isLoggedIn: boolean;
  role?: string;
  userName?: string;
  signOutAction: () => void;
}

export function LayoutWrapper({
  children,
  isLoggedIn,
  role,
  userName,
  signOutAction,
}: LayoutWrapperProps) {
  const pathname = usePathname();

  // Exclude dashboard, admin console, and auth pages from storefront header/footer
  const isDashboard =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/admin/dashboard") ||
    pathname.startsWith("/dashboard/manufacturer") ||
    pathname.startsWith("/dashboard/pending-verification");

  const isAuth =
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/forgot-password" ||
    pathname === "/reset-password" ||
    pathname.startsWith("/admin/login") ||
    pathname.startsWith("/admin/signup") ||
    pathname.startsWith("/signup/manufacturer") ||
    pathname.startsWith("/login/manufacturer");

  const showHeaderFooter = !isDashboard && !isAuth;

  return (
    <>
      {showHeaderFooter && (
        <Header
          isLoggedIn={isLoggedIn}
          role={role}
          userName={userName}
          signOutAction={signOutAction}
        />
      )}
      {children}
      {showHeaderFooter && <Footer />}
    </>
  );
}
