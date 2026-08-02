"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  CalendarCheck,
  UserCheck,
  Users,
  Building2,
  ShoppingBag,
  MessageSquare,
  Mail,
  ChevronDown,
  ChevronUp,
  PanelLeftClose,
  ChevronsUpDown,
} from "lucide-react";

interface AdminSidebarProps {
  adminUser?: {
    full_name?: string | null;
    email?: string | null;
  };
  counts?: {
    users?: number;
    pendingVerifications?: number;
    products?: number;
    inquiries?: number;
    waitlist?: number;
    contact?: number;
  };
}

export function AdminSidebar({ adminUser, counts }: AdminSidebarProps) {
  const pathname = usePathname();

  // Collapsible dropdown states
  const [usersOpen, setUsersOpen] = useState(true);
  const [productsOpen, setProductsOpen] = useState(false);

  return (
    <aside className="flex min-h-screen w-64 flex-shrink-0 flex-col justify-between border-r border-[#E5E5E3] bg-[#F5F5F3] p-4 select-none">
      <div className="space-y-6">
        {/* Top Brand Block */}
        <div className="flex items-center justify-between pb-2">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-black text-white shadow-xs">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="12 2 2 7 12 12 22 7 12 2" />
                <polyline points="2 17 12 22 22 17" />
                <polyline points="2 12 12 17 22 12" />
              </svg>
            </div>
            <div>
              <span className="font-nantes block text-sm leading-tight font-bold text-black">
                GenZ Control
              </span>
              <span className="font-graphik block text-[11px] text-[#73736E]">
                Management Suite
              </span>
            </div>
          </div>

          <button className="rounded-lg p-1 text-[#73736E] hover:bg-[#EAEAE6] hover:text-black">
            <PanelLeftClose className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation Section 1: Front Office */}
        <div className="space-y-1">
          <p className="font-graphik mb-2 px-3 text-[11px] font-semibold tracking-wider text-[#8C8C85] uppercase">
            Front Office
          </p>

          {/* Dashboard Main Link */}
          <Link
            href="/admin/dashboard"
            className={`font-graphik flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all ${
              pathname === "/admin/dashboard"
                ? "border border-[#E5E5E0] bg-white text-black shadow-xs"
                : "text-[#52524E] hover:bg-[#EAEAE6] hover:text-black"
            }`}
          >
            <LayoutGrid className="h-4 w-4" />
            <span>Dashboard</span>
          </Link>

          {/* Verifications Link */}
          <Link
            href="/admin/dashboard/verifications"
            className={`font-graphik flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-medium transition-all ${
              pathname?.startsWith("/admin/dashboard/verifications")
                ? "border border-[#E5E5E0] bg-white text-black shadow-xs"
                : "text-[#52524E] hover:bg-[#EAEAE6] hover:text-black"
            }`}
          >
            <div className="flex items-center gap-3">
              <Building2 className="h-4 w-4" />
              <span>GST Verifications</span>
            </div>
            {(counts?.pendingVerifications ?? 0) > 0 && (
              <span className="rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-bold text-amber-950">
                {counts?.pendingVerifications}
              </span>
            )}
          </Link>

          {/* Expandable Users Group */}
          <div>
            <button
              onClick={() => setUsersOpen(!usersOpen)}
              className="font-graphik flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 text-xs font-medium text-[#52524E] transition-all hover:bg-[#EAEAE6] hover:text-black"
            >
              <div className="flex items-center gap-3">
                <Users className="h-4 w-4" />
                <span>User Profiles</span>
              </div>
              {usersOpen ? (
                <ChevronUp className="h-3.5 w-3.5 text-[#8C8C85]" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5 text-[#8C8C85]" />
              )}
            </button>

            {/* Sub-Items */}
            {usersOpen && (
              <div className="mt-1 ml-8 space-y-1 border-l-2 border-[#E5E5E0] pl-3">
                <Link
                  href="/admin/dashboard/users"
                  className={`font-graphik block py-1.5 text-xs transition-colors ${
                    pathname === "/admin/dashboard/users"
                      ? "font-semibold text-black"
                      : "text-[#73736E] hover:text-black"
                  }`}
                >
                  All Registered Users
                </Link>
                <Link
                  href="/admin/dashboard/users?role=manufacturer"
                  className="font-graphik block py-1.5 text-xs text-[#73736E] transition-colors hover:text-black"
                >
                  Manufacturers
                </Link>
                <Link
                  href="/admin/dashboard/users?role=buyer"
                  className="font-graphik block py-1.5 text-xs text-[#73736E] transition-colors hover:text-black"
                >
                  Buyers
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Section 2: Property & Catalog */}
        <div className="space-y-1">
          <p className="font-graphik mb-2 px-3 text-[11px] font-semibold tracking-wider text-[#8C8C85] uppercase">
            Property & Catalog
          </p>

          <div>
            <button
              onClick={() => setProductsOpen(!productsOpen)}
              className="font-graphik flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 text-xs font-medium text-[#52524E] transition-all hover:bg-[#EAEAE6] hover:text-black"
            >
              <div className="flex items-center gap-3">
                <ShoppingBag className="h-4 w-4" />
                <span>Product Catalog</span>
              </div>
              {productsOpen ? (
                <ChevronUp className="h-3.5 w-3.5 text-[#8C8C85]" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5 text-[#8C8C85]" />
              )}
            </button>

            {productsOpen && (
              <div className="mt-1 ml-8 space-y-1 border-l-2 border-[#E5E5E0] pl-3">
                <Link
                  href="/admin/dashboard/products"
                  className={`font-graphik block py-1.5 text-xs transition-colors ${
                    pathname === "/admin/dashboard/products"
                      ? "font-semibold text-black"
                      : "text-[#73736E] hover:text-black"
                  }`}
                >
                  All Products ({counts?.products ?? 0})
                </Link>
              </div>
            )}
          </div>

          <Link
            href="/admin/dashboard/inquiries"
            className={`font-graphik flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-medium transition-all ${
              pathname === "/admin/dashboard/inquiries"
                ? "border border-[#E5E5E0] bg-white text-black shadow-xs"
                : "text-[#52524E] hover:bg-[#EAEAE6] hover:text-black"
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            <span>Inquiry Stream</span>
          </Link>
        </div>

        {/* Navigation Section 3: Communication */}
        <div className="space-y-1">
          <p className="font-graphik mb-2 px-3 text-[11px] font-semibold tracking-wider text-[#8C8C85] uppercase">
            Leads & Communication
          </p>

          <Link
            href="/admin/dashboard/waitlist"
            className={`font-graphik flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-medium transition-all ${
              pathname === "/admin/dashboard/waitlist"
                ? "border border-[#E5E5E0] bg-white text-black shadow-xs"
                : "text-[#52524E] hover:bg-[#EAEAE6] hover:text-black"
            }`}
          >
            <UserCheck className="h-4 w-4" />
            <span>Waitlist Leads</span>
          </Link>

          <Link
            href="/admin/dashboard/contact"
            className={`font-graphik flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-medium transition-all ${
              pathname === "/admin/dashboard/contact"
                ? "border border-[#E5E5E0] bg-white text-black shadow-xs"
                : "text-[#52524E] hover:bg-[#EAEAE6] hover:text-black"
            }`}
          >
            <Mail className="h-4 w-4" />
            <span>Contact Messages</span>
          </Link>
        </div>
      </div>

      {/* Bottom Admin User Footer Card */}
      <div className="mt-6 border-t border-[#E5E5E0] pt-4">
        <div className="flex cursor-pointer items-center justify-between rounded-xl p-2 transition-all hover:bg-[#EAEAE6]">
          <div className="flex items-center gap-2.5">
            <div className="bg-brand-yellow flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-black">
              {(adminUser?.full_name || "A")[0].toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <span className="font-graphik block truncate text-xs font-bold text-black">
                {adminUser?.full_name || "Robert Austin"}
              </span>
              <span className="font-graphik block truncate text-[10px] text-[#73736E]">
                {adminUser?.email || "admin@genz.in"}
              </span>
            </div>
          </div>
          <ChevronsUpDown className="h-3.5 w-3.5 flex-shrink-0 text-[#8C8C85]" />
        </div>
      </div>
    </aside>
  );
}
