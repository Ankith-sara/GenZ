"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  Users,
  Building2,
  ShoppingBag,
  MessageSquare,
  Mail,
  UserCheck,
  ChevronDown,
  ChevronUp,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronsUpDown,
  X,
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
  isOpen?: boolean;
  onClose?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function AdminSidebar({
  adminUser,
  counts,
  isOpen = false,
  onClose,
  isCollapsed = false,
  onToggleCollapse,
}: AdminSidebarProps) {
  const pathname = usePathname();

  // Collapsible dropdown states
  const [usersOpen, setUsersOpen] = useState(true);
  const [productsOpen, setProductsOpen] = useState(false);

  return (
    <>
      {/* Mobile Dark Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs transition-opacity lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-full flex-col justify-between border-r border-[#E5E5E3] bg-[#F5F5F3] p-4 text-black transition-all duration-300 select-none lg:static lg:z-auto lg:min-h-screen lg:flex-shrink-0 ${
          isCollapsed ? "lg:w-20" : "lg:w-64"
        } ${
          isOpen
            ? "w-64 translate-x-0 shadow-2xl"
            : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="space-y-6">
          {/* Top Brand Block */}
          <div className="flex items-center justify-between pb-2">
            <div
              className={`flex items-center gap-2.5 ${
                isCollapsed ? "lg:w-full lg:justify-center" : ""
              }`}
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-black font-bold text-white shadow-xs">
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
              <div className={isCollapsed ? "lg:hidden" : "block"}>
                <span className="font-nantes block text-sm leading-tight font-bold text-black">
                  GenZ Control
                </span>
                <span className="font-graphik block text-[11px] text-[#73736E]">
                  Management Suite
                </span>
              </div>
            </div>

            {/* Mobile close button */}
            {onClose && (
              <button
                onClick={onClose}
                className="rounded-lg p-1 text-[#73736E] transition-colors hover:bg-[#EAEAE6] hover:text-black lg:hidden"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            )}

            {/* Desktop collapse button */}
            {onToggleCollapse && (
              <button
                onClick={onToggleCollapse}
                className="hidden rounded-lg p-1.5 text-[#73736E] transition-colors hover:bg-[#EAEAE6] hover:text-black lg:block"
                aria-label={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              >
                {isCollapsed ? (
                  <PanelLeftOpen className="h-4 w-4" />
                ) : (
                  <PanelLeftClose className="h-4 w-4" />
                )}
              </button>
            )}
          </div>

          {/* Navigation Section 1: Front Office */}
          <div className="space-y-1">
            <p
              className={`font-graphik mb-2 px-3 text-[11px] font-semibold tracking-wider text-[#8C8C85] uppercase ${
                isCollapsed ? "lg:hidden" : "block"
              }`}
            >
              Front Office
            </p>

            {/* Dashboard Main Link */}
            <Link
              href="/admin/dashboard"
              title={isCollapsed ? "Dashboard" : undefined}
              className={`font-graphik flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all ${
                isCollapsed ? "lg:justify-center lg:px-0" : ""
              } ${
                pathname === "/admin/dashboard"
                  ? "border border-[#E5E5E0] bg-white text-black shadow-xs"
                  : "text-[#52524E] hover:bg-[#EAEAE6] hover:text-black"
              }`}
            >
              <LayoutGrid className="h-4 w-4 shrink-0" />
              <span className={isCollapsed ? "lg:hidden" : "block"}>Dashboard</span>
            </Link>

            {/* Verifications Link */}
            <Link
              href="/admin/dashboard/verifications"
              title={isCollapsed ? "Verifications" : undefined}
              className={`font-graphik flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-medium transition-all ${
                isCollapsed ? "lg:justify-center lg:px-0" : ""
              } ${
                pathname?.startsWith("/admin/dashboard/verifications")
                  ? "border border-[#E5E5E0] bg-white text-black shadow-xs"
                  : "text-[#52524E] hover:bg-[#EAEAE6] hover:text-black"
              }`}
            >
              <div className="flex items-center gap-3">
                <Building2 className="h-4 w-4 shrink-0" />
                <span className={isCollapsed ? "lg:hidden" : "block"}>
                  Verifications
                </span>
              </div>
              {(counts?.pendingVerifications ?? 0) > 0 && (
                <span
                  className={`rounded-full bg-amber-400 font-bold text-amber-950 ${
                    isCollapsed
                      ? "h-2 w-2 p-0 text-[0px] lg:block"
                      : "px-2 py-0.5 text-[10px]"
                  }`}
                >
                  {isCollapsed ? "" : counts?.pendingVerifications}
                </span>
              )}
            </Link>

            {/* Expandable Users Group */}
            <div>
              <button
                onClick={() => setUsersOpen(!usersOpen)}
                title={isCollapsed ? "User Profiles" : undefined}
                className={`font-graphik flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 text-xs font-medium text-[#52524E] transition-all hover:bg-[#EAEAE6] hover:text-black ${
                  isCollapsed ? "lg:justify-center lg:px-0" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <Users className="h-4 w-4 shrink-0" />
                  <span className={isCollapsed ? "lg:hidden" : "block"}>
                    User Profiles
                  </span>
                </div>
                {!isCollapsed && (
                  <>
                    {usersOpen ? (
                      <ChevronUp className="h-3.5 w-3.5 text-[#8C8C85]" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5 text-[#8C8C85]" />
                    )}
                  </>
                )}
              </button>

              {/* Sub-Items */}
              {usersOpen && !isCollapsed && (
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
            <p
              className={`font-graphik mb-2 px-3 text-[11px] font-semibold tracking-wider text-[#8C8C85] uppercase ${
                isCollapsed ? "lg:hidden" : "block"
              }`}
            >
              Property & Catalog
            </p>

            <div>
              <button
                onClick={() => setProductsOpen(!productsOpen)}
                title={isCollapsed ? "Product Catalog" : undefined}
                className={`font-graphik flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 text-xs font-medium text-[#52524E] transition-all hover:bg-[#EAEAE6] hover:text-black ${
                  isCollapsed ? "lg:justify-center lg:px-0" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <ShoppingBag className="h-4 w-4 shrink-0" />
                  <span className={isCollapsed ? "lg:hidden" : "block"}>
                    Product Catalog
                  </span>
                </div>
                {!isCollapsed && (
                  <>
                    {productsOpen ? (
                      <ChevronUp className="h-3.5 w-3.5 text-[#8C8C85]" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5 text-[#8C8C85]" />
                    )}
                  </>
                )}
              </button>

              {productsOpen && !isCollapsed && (
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
              title={isCollapsed ? "Inquiry Stream" : undefined}
              className={`font-graphik flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-medium transition-all ${
                isCollapsed ? "lg:justify-center lg:px-0" : ""
              } ${
                pathname === "/admin/dashboard/inquiries"
                  ? "border border-[#E5E5E0] bg-white text-black shadow-xs"
                  : "text-[#52524E] hover:bg-[#EAEAE6] hover:text-black"
              }`}
            >
              <MessageSquare className="h-4 w-4 shrink-0" />
              <span className={isCollapsed ? "lg:hidden" : "block"}>
                Inquiry Stream
              </span>
            </Link>
          </div>

          {/* Navigation Section 3: Communication */}
          <div className="space-y-1">
            <p
              className={`font-graphik mb-2 px-3 text-[11px] font-semibold tracking-wider text-[#8C8C85] uppercase ${
                isCollapsed ? "lg:hidden" : "block"
              }`}
            >
              Leads & Communication
            </p>

            <Link
              href="/admin/dashboard/waitlist"
              title={isCollapsed ? "Waitlist Leads" : undefined}
              className={`font-graphik flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-medium transition-all ${
                isCollapsed ? "lg:justify-center lg:px-0" : ""
              } ${
                pathname === "/admin/dashboard/waitlist"
                  ? "border border-[#E5E5E0] bg-white text-black shadow-xs"
                  : "text-[#52524E] hover:bg-[#EAEAE6] hover:text-black"
              }`}
            >
              <UserCheck className="h-4 w-4 shrink-0" />
              <span className={isCollapsed ? "lg:hidden" : "block"}>
                Waitlist Leads
              </span>
            </Link>

            <Link
              href="/admin/dashboard/contact"
              title={isCollapsed ? "Contact Messages" : undefined}
              className={`font-graphik flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-medium transition-all ${
                isCollapsed ? "lg:justify-center lg:px-0" : ""
              } ${
                pathname === "/admin/dashboard/contact"
                  ? "border border-[#E5E5E0] bg-white text-black shadow-xs"
                  : "text-[#52524E] hover:bg-[#EAEAE6] hover:text-black"
              }`}
            >
              <Mail className="h-4 w-4 shrink-0" />
              <span className={isCollapsed ? "lg:hidden" : "block"}>
                Contact Messages
              </span>
            </Link>
          </div>
        </div>

        {/* Bottom Section: Admin Profile Footer */}
        <div className="mt-6 border-t border-[#E5E5E0] pt-4">
          <div
            className={`flex cursor-pointer items-center justify-between rounded-xl p-2 transition-all hover:bg-[#EAEAE6] ${
              isCollapsed ? "lg:justify-center" : ""
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="bg-brand-yellow flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-black">
                {(adminUser?.full_name || "A")[0].toUpperCase()}
              </div>
              <div className={`overflow-hidden ${isCollapsed ? "lg:hidden" : "block"}`}>
                <span className="font-graphik block truncate text-xs font-bold text-black">
                  {adminUser?.full_name || "Robert Austin"}
                </span>
                <span className="font-graphik block truncate text-[10px] text-[#73736E]">
                  {adminUser?.email || "admin@genz.in"}
                </span>
              </div>
            </div>
            {!isCollapsed && (
              <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-[#8C8C85]" />
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
