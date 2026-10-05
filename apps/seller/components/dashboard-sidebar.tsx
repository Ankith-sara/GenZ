"use client";

import React, { useState, useEffect, type ElementType } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Store,
  Building2,
  FileCheck,
  Settings,
  Plus,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  X,
  LogOut,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
} from "lucide-react";
import type { Role } from "@genz/types";
import { signOut } from "@/app/login/actions";

interface NavItem {
  href: string;
  label: string;
  icon: ElementType;
  badge?: string;
}

interface NavGroup {
  groupName: string;
  items: NavItem[];
}

function getSellerNavGroups(): NavGroup[] {
  return [
    {
      groupName: "Workspace",
      items: [{ href: "/dashboard", label: "Overview", icon: LayoutDashboard }],
    },
    {
      groupName: "Manage",
      items: [
        { href: "/dashboard/orders", label: "Orders", icon: ShoppingBag },
        { href: "/dashboard/products", label: "Products", icon: Package },
      ],
    },
    {
      groupName: "Store",
      items: [
        { href: "/dashboard/profile", label: "Storefront", icon: Store },
        { href: "/dashboard/account", label: "Business Profile", icon: Building2 },
        { href: "/dashboard/documents", label: "Verification", icon: FileCheck },
      ],
    },
    {
      groupName: "Account",
      items: [{ href: "/dashboard/settings", label: "Settings", icon: Settings }],
    },
  ];
}

interface DashboardSidebarProps {
  role: Role;
  user?: {
    full_name?: string | null;
    email?: string | null;
  };
  businessName?: string;
  isVerified?: boolean;
}

export function DashboardSidebar({
  user,
  businessName,
  isVerified,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Restore saved collapse state safely on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const saved = localStorage.getItem("genz_seller_sidebar_collapsed");
        if (saved === "true") setIsCollapsed(true);
      } catch {}
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("genz_seller_sidebar_collapsed", String(next));
      } catch {}
      return next;
    });
  };

  const navGroups = getSellerNavGroups();
  const displayName = businessName || user?.full_name || "Seller";
  const userInitial = displayName.charAt(0).toUpperCase();

  const isRouteActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <>
      {/* Mobile Top App Bar */}
      <header className="border-outline-variant/60 bg-surface-container-lowest flex h-14 items-center justify-between border-b px-4 select-none sm:hidden">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="border-outline-variant/60 bg-surface-container text-on-surface-variant flex h-9 w-9 items-center justify-center rounded-full border transition-transform active:scale-95"
            aria-label="Toggle navigation drawer"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="bg-primary text-on-primary flex h-7 w-7 items-center justify-center rounded-xl text-xs font-bold shadow-xs">
              <ShoppingBag className="h-3.5 w-3.5" />
            </div>
            <span className="text-on-surface text-sm font-semibold tracking-tight">
              GenZ Seller
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
              isVerified
                ? "bg-success-container text-on-success-container border-success/20 border"
                : "bg-warning-container text-on-warning-container border-warning/20 border"
            }`}
          >
            {isVerified ? (
              <CheckCircle2 className="text-success h-3 w-3" />
            ) : (
              <AlertCircle className="text-warning h-3 w-3" />
            )}
            <span>{isVerified ? "Verified" : "Pending"}</span>
          </span>
          <div className="bg-primary-container text-on-primary-container flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold">
            {userInitial}
          </div>
        </div>
      </header>

      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs transition-opacity sm:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Main Sidebar */}
      <aside
        className={`border-outline-variant/60 bg-surface-container-low text-on-surface sticky top-0 z-30 flex h-screen shrink-0 flex-col justify-between overflow-y-auto border-r transition-all duration-200 select-none ${
          isCollapsed ? "w-[76px]" : "w-[264px]"
        } ${
          mobileOpen
            ? "shadow-elevation-3 fixed inset-y-0 left-0 z-50 flex w-[280px] translate-x-0"
            : "hidden sm:flex"
        }`}
      >
        <div className="flex flex-1 flex-col space-y-4 p-3.5">
          {/* Header Brand & Toggle */}
          <div className="border-outline-variant/40 flex items-center justify-between border-b px-2 pt-1 pb-2">
            <Link
              href="/dashboard"
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-2.5 ${
                isCollapsed ? "lg:w-full lg:justify-center" : ""
              }`}
            >
              <div className="bg-primary text-on-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-xl font-bold shadow-xs">
                <ShoppingBag className="h-4 w-4" />
              </div>

              {!isCollapsed && (
                <div className="min-w-0">
                  <span className="text-on-surface block text-sm leading-none font-bold tracking-tight">
                    GenZ Seller
                  </span>
                  <span className="text-on-surface-variant mt-0.5 block text-[11px] font-medium">
                    Seller Desk
                  </span>
                </div>
              )}
            </Link>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="text-on-surface-variant hover:bg-surface-container-high rounded-full p-1.5 sm:hidden"
                aria-label="Close menu"
              >
                <X className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={toggleCollapse}
                className="text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface hidden rounded-full p-1.5 transition-colors lg:block"
                aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {isCollapsed ? (
                  <PanelLeftOpen className="h-4 w-4" />
                ) : (
                  <PanelLeftClose className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Quick Action: Add Product */}
          <div className="px-1">
            <Link
              href="/dashboard/products/new"
              onClick={() => setMobileOpen(false)}
              className={`bg-primary text-on-primary shadow-elevation-1 hover:shadow-elevation-2 flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-xs font-semibold transition-all active:scale-98 ${
                isCollapsed ? "lg:px-0 lg:py-2.5" : ""
              }`}
              title="Add New Product"
            >
              <Plus className="h-4 w-4 shrink-0" />
              <span className={isCollapsed ? "lg:hidden" : "inline"}>Add Product</span>
            </Link>
          </div>

          {/* Navigation Groups */}
          <nav className="flex-1 space-y-4 pt-1" aria-label="Sidebar Navigation">
            {navGroups.map((group) => (
              <div key={group.groupName} className="space-y-1">
                {!isCollapsed && (
                  <span className="text-on-surface-variant/80 block px-3 text-[10px] font-bold tracking-wider uppercase">
                    {group.groupName}
                  </span>
                )}

                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const active = isRouteActive(item.href);
                    const Icon = item.icon;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={`group relative flex items-center gap-3 rounded-full px-3.5 py-2 text-xs font-medium transition-all ${
                          isCollapsed ? "lg:justify-center lg:px-0" : ""
                        } ${
                          active
                            ? "bg-primary-container text-on-primary-container font-semibold shadow-xs"
                            : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
                        }`}
                        aria-current={active ? "page" : undefined}
                        title={isCollapsed ? item.label : undefined}
                      >
                        <Icon
                          className={`h-4 w-4 shrink-0 transition-colors ${
                            active
                              ? "text-on-primary-container"
                              : "text-on-surface-variant group-hover:text-on-surface"
                          }`}
                        />
                        <span className={isCollapsed ? "lg:hidden" : "block truncate"}>
                          {item.label}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Bottom Profile & Actions Area */}
        <div className="border-outline-variant/50 bg-surface-container/60 relative border-t p-2.5">
          {userMenuOpen && (
            <div className="border-outline-variant/60 bg-surface-container-lowest shadow-elevation-3 animate-in fade-in slide-in-from-bottom-2 absolute right-2.5 bottom-16 left-2.5 z-50 space-y-1 rounded-2xl border p-2 text-xs duration-150">
              <div className="border-outline-variant/40 border-b px-2 py-1.5">
                <span className="text-on-surface block truncate text-xs font-semibold">
                  {displayName}
                </span>
                <span className="text-on-surface-variant block truncate text-[11px]">
                  {user?.email}
                </span>
              </div>

              <Link
                href="/dashboard/settings"
                onClick={() => {
                  setUserMenuOpen(false);
                  setMobileOpen(false);
                }}
                className="text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface flex items-center gap-2 rounded-xl p-2 font-medium"
              >
                <Settings className="text-on-surface-variant h-4 w-4" />
                <span>Account Settings</span>
              </Link>

              <form action={signOut}>
                <button
                  type="submit"
                  className="text-error hover:bg-error-container hover:text-on-error-container flex w-full items-center gap-2 rounded-xl p-2 text-left font-medium transition-colors"
                >
                  <LogOut className="text-error h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </form>
            </div>
          )}

          <button
            type="button"
            onClick={() => setUserMenuOpen((prev) => !prev)}
            className={`hover:bg-surface-container-high flex w-full items-center justify-between rounded-xl p-1.5 text-left transition-colors ${
              isCollapsed ? "lg:justify-center" : ""
            }`}
            aria-label="User profile menu"
          >
            <div className="flex min-w-0 items-center gap-2.5">
              <div className="bg-primary-container text-on-primary-container flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold shadow-xs">
                {userInitial}
              </div>
              {!isCollapsed && (
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-on-surface block truncate text-xs leading-tight font-semibold">
                      {displayName}
                    </span>
                  </div>
                  <span className="text-on-surface-variant mt-0.5 block truncate text-[10px] leading-tight">
                    {user?.email || "Seller Account"}
                  </span>
                </div>
              )}
            </div>

            {!isCollapsed && (
              <MoreVertical className="text-on-surface-variant h-3.5 w-3.5 shrink-0" />
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
