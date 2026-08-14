"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  ShieldAlert,
  PackageX,
  Compass,
  Home,
  ArrowRight,
  LayoutGrid,
  Building2,
  Settings,
  ShoppingBag,
  MessageSquare,
  HelpCircle,
} from "lucide-react";

export default function NotFound() {
  const pathname = usePathname() || "";

  if (pathname.startsWith("/admin")) {
    return <AdminNotFound />;
  }

  if (pathname.startsWith("/dashboard") || pathname.startsWith("/seller/dashboard")) {
    return <SellerNotFound />;
  }

  return <MainNotFound />;
}

/* 1. ADMIN PORTAL 404 LAYOUT */
function AdminNotFound() {
  return (
    <div className="font-graphik flex min-h-screen flex-col bg-[#FAF8F4] text-[#1A1A18] select-none">
      {/* Admin Top Bar */}
      <header className="border-b border-[#E5E5E0] bg-white px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/admin/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black text-xs font-bold text-white shadow-2xs">
              GZ
            </div>
            <div>
              <span className="block text-sm leading-tight font-bold text-black">
                GenZ Command
              </span>
              <span className="block text-[10px] text-[#73736E]">
                Enterprise Admin Portal
              </span>
            </div>
          </Link>
          <span className="rounded-full bg-rose-100 px-3 py-1 font-mono text-[11px] font-bold text-rose-800">
            HTTP 404 — ADMIN RESOURCE MISSING
          </span>
        </div>
      </header>

      {/* Admin Content */}
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center px-6 py-16 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 text-rose-600 shadow-2xs">
          <ShieldAlert className="h-8 w-8" />
        </div>

        <span className="font-mono text-xs font-bold tracking-widest text-rose-600 uppercase">
          ERROR 404
        </span>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-[#1A1A18] sm:text-3xl">
          Admin Page Not Found
        </h1>
        <p className="mt-3 text-xs leading-relaxed text-[#73736E] sm:text-sm">
          The requested administrative path or management resource does not exist, has
          restricted access, or has been relocated.
        </p>

        {/* Quick Admin Nav Shortcuts */}
        <div className="mt-8 grid w-full grid-cols-1 gap-3 sm:grid-cols-3">
          <Link
            href="/admin/dashboard"
            className="flex flex-col items-center gap-2 rounded-xl border border-[#E5E5E0] bg-white p-4 text-center shadow-2xs transition-all hover:border-black hover:bg-[#FAF8F4]"
          >
            <LayoutGrid className="h-5 w-5 text-black" />
            <span className="text-xs font-bold text-[#1A1A18]">Dashboard</span>
            <span className="text-[10px] text-[#73736E]">Command overview</span>
          </Link>

          <Link
            href="/admin/dashboard/verifications"
            className="flex flex-col items-center gap-2 rounded-xl border border-[#E5E5E0] bg-white p-4 text-center shadow-2xs transition-all hover:border-black hover:bg-[#FAF8F4]"
          >
            <Building2 className="h-5 w-5 text-black" />
            <span className="text-xs font-bold text-[#1A1A18]">Verifications</span>
            <span className="text-[10px] text-[#73736E]">Seller approvals</span>
          </Link>

          <Link
            href="/admin/dashboard/settings"
            className="flex flex-col items-center gap-2 rounded-xl border border-[#E5E5E0] bg-white p-4 text-center shadow-2xs transition-all hover:border-black hover:bg-[#FAF8F4]"
          >
            <Settings className="h-5 w-5 text-black" />
            <span className="text-xs font-bold text-[#1A1A18]">Settings</span>
            <span className="text-[10px] text-[#73736E]">System controls</span>
          </Link>
        </div>

        <div className="mt-8">
          <Link
            href="/admin/dashboard"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-black px-6 text-xs font-bold text-white shadow-2xs transition-colors hover:bg-neutral-800"
          >
            <span>Return to Admin Dashboard</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </main>

      {/* Admin Footer */}
      <footer className="border-t border-[#E5E5E0] bg-white py-4 text-center text-[11px] text-[#73736E]">
        GenZ Administrative Governance Portal &bull; System Status: Nominal
      </footer>
    </div>
  );
}

/* 2. SELLER WORKSPACE 404 LAYOUT */
function SellerNotFound() {
  return (
    <div className="font-graphik flex min-h-screen flex-col bg-[#FAF7F0] text-[#1A1A18] select-none">
      {/* Seller Top Bar */}
      <header className="border-b border-[#E5E5E0] bg-white px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/seller/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-600 text-xs font-bold text-white shadow-2xs">
              SH
            </div>
            <div>
              <span className="block text-sm leading-tight font-bold text-black">
                GenZ Seller Hub
              </span>
              <span className="block text-[10px] text-[#73736E]">
                Manufacturer & Seller Workspace
              </span>
            </div>
          </Link>
          <span className="rounded-full bg-amber-100 px-3 py-1 font-mono text-[11px] font-bold text-amber-900">
            SELLER WORKSPACE 404
          </span>
        </div>
      </header>

      {/* Seller Content */}
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center px-6 py-16 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-200 bg-amber-50 text-amber-600 shadow-2xs">
          <PackageX className="h-8 w-8" />
        </div>

        <span className="font-mono text-xs font-bold tracking-widest text-amber-700 uppercase">
          PAGE NOT FOUND
        </span>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-[#1A1A18] sm:text-3xl">
          Seller Workspace Page Not Found
        </h1>
        <p className="mt-3 text-xs leading-relaxed text-[#73736E] sm:text-sm">
          The seller workspace tool, product catalog item, or inquiry record you are
          trying to access is unavailable or has been removed.
        </p>

        {/* Quick Seller Shortcuts */}
        <div className="mt-8 grid w-full grid-cols-1 gap-3 sm:grid-cols-3">
          <Link
            href="/seller/dashboard"
            className="flex flex-col items-center gap-2 rounded-xl border border-[#E5E5E0] bg-white p-4 text-center shadow-2xs transition-all hover:border-black hover:bg-[#FAF8F4]"
          >
            <LayoutGrid className="h-5 w-5 text-amber-600" />
            <span className="text-xs font-bold text-[#1A1A18]">Seller Home</span>
            <span className="text-[10px] text-[#73736E]">Workspace portal</span>
          </Link>

          <Link
            href="/seller/dashboard/products"
            className="flex flex-col items-center gap-2 rounded-xl border border-[#E5E5E0] bg-white p-4 text-center shadow-2xs transition-all hover:border-black hover:bg-[#FAF8F4]"
          >
            <ShoppingBag className="h-5 w-5 text-amber-600" />
            <span className="text-xs font-bold text-[#1A1A18]">My Products</span>
            <span className="text-[10px] text-[#73736E]">Catalog manager</span>
          </Link>

          <Link
            href="/seller/dashboard/inquiries"
            className="flex flex-col items-center gap-2 rounded-xl border border-[#E5E5E0] bg-white p-4 text-center shadow-2xs transition-all hover:border-black hover:bg-[#FAF8F4]"
          >
            <MessageSquare className="h-5 w-5 text-amber-600" />
            <span className="text-xs font-bold text-[#1A1A18]">Inquiries</span>
            <span className="text-[10px] text-[#73736E]">Buyer leads</span>
          </Link>
        </div>

        <div className="mt-8">
          <Link
            href="/seller/dashboard"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-black px-6 text-xs font-bold text-white shadow-2xs transition-colors hover:bg-neutral-800"
          >
            <span>Return to Seller Workspace</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </main>

      {/* Seller Footer */}
      <footer className="border-t border-[#E5E5E0] bg-white py-4 text-center text-[11px] text-[#73736E]">
        GenZ Seller Operations Hub &bull; Need help? Contact seller support.
      </footer>
    </div>
  );
}

/* 3. MAIN PUBLIC STOREFRONT 404 LAYOUT  */
function MainNotFound() {
  return (
    <div className="font-graphik flex min-h-screen flex-col bg-[#FAF7F0] text-[#1A1A18] antialiased select-none">
      {/* Header */}
      <header className="border-b border-[#E5E5E0] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="relative h-8 w-8 overflow-hidden rounded-lg border border-[#E5E5E0] bg-black">
              <Image
                src="/logo.png"
                alt="GenZ Logo"
                fill
                className="object-cover"
                sizes="32px"
              />
            </div>
            <span className="font-graphik text-lg font-bold tracking-widest text-black uppercase">
              Gen<span className="text-amber-500">Z</span>
            </span>
          </Link>

          <Link
            href="/discover"
            className="flex items-center gap-1 text-xs font-bold tracking-wider text-[#52524E] uppercase transition-colors hover:text-black"
          >
            <span>Browse Catalog</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-6 py-20 text-center">
        <div className="font-serif text-8xl font-normal tracking-tight text-amber-600 select-none sm:text-9xl">
          404
        </div>
        <h1 className="mt-2 font-serif text-3xl font-normal text-[#1A1A18] sm:text-4xl">
          Page Not Found
        </h1>
        <p className="mt-4 text-xs leading-relaxed text-[#73736E] sm:text-sm">
          The page you are looking for might have been removed, had its name changed, or
          is temporarily unavailable.
        </p>

        {/* Action Buttons */}
        <div className="mt-10 flex w-full flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-black px-6 text-xs font-bold tracking-wider text-white uppercase shadow-2xs transition-all hover:bg-neutral-800"
          >
            <Home className="h-4 w-4" />
            <span>Back to Home</span>
          </Link>

          <Link
            href="/discover"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#E5E5E0] bg-white px-6 text-xs font-bold tracking-wider text-[#1A1A18] uppercase shadow-2xs transition-all hover:border-black hover:bg-[#FAF8F4]"
          >
            <Compass className="h-4 w-4" />
            <span>Browse Discover Feed</span>
          </Link>

          <Link
            href="/contact"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#E5E5E0] bg-white px-6 text-xs font-bold tracking-wider text-[#1A1A18] uppercase shadow-2xs transition-all hover:border-black hover:bg-[#FAF8F4]"
          >
            <HelpCircle className="h-4 w-4" />
            <span>Contact Support</span>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-[#E5E5E0] bg-white py-6">
        <div className="mx-auto max-w-7xl px-6 text-center text-xs text-[#73736E]">
          &copy; {new Date().getFullYear()} GenZ Platform. All rights reserved. Made in
          India.
        </div>
      </footer>
    </div>
  );
}
