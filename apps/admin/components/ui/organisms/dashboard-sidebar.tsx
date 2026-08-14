"use client";

import { useState } from "react";
import type { ElementType } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShieldCheck,
  User,
  Menu,
  X,
  ChevronsUpDown,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
  Shield,
} from "lucide-react";
import type { Role } from "@genz/types";
import { signOut } from "@/app/login/actions";

interface NavGroup {
  groupName: string;
  items: {
    href: string;
    label: string;
    icon: ElementType;
    badge?: string;
  }[];
}

function getNavGroups(role: Role): NavGroup[] {
  return [
    {
      groupName: "ADMINISTRATION",
      items: [
        { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
        {
          href: "/dashboard/verifications",
          label: "Seller Audits",
          icon: ShieldCheck,
        },
      ],
    },
    {
      groupName: "ACCOUNT",
      items: [{ href: "/dashboard/account", label: "Profile & Security", icon: User }],
    },
  ];
}

interface DashboardSidebarProps {
  role: Role;
  user?: {
    full_name?: string | null;
    email?: string | null;
  };
}

export function DashboardSidebar({ role, user }: DashboardSidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("genz_admin_sidebar_collapsed");
      return saved === "true";
    }
    return false;
  });

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("genz_admin_sidebar_collapsed", String(next));
      return next;
    });
  };

  const navGroups = getNavGroups(role);
  const userInitial = (user?.full_name || user?.email || "A")[0].toUpperCase();

  return (
    <>
      {/* Mobile Header Bar */}
      <div className="flex h-14 items-center justify-between border-b border-[#E5E5E0] bg-[#FAF8F4] px-4 sm:hidden">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setMobileOpen((prev) => !prev)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#E5E5E0] bg-white text-black shadow-2xs active:scale-95"
            aria-label="Toggle mobile menu"
          >
            {mobileOpen ? (
              <X className="h-4.5 w-4.5" />
            ) : (
              <Menu className="h-4.5 w-4.5" />
            )}
          </button>

          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-black text-xs font-bold text-white shadow-2xs">
              <Shield className="h-3.5 w-3.5" />
            </div>
            <span className="font-nantes text-sm font-bold text-[#1A1A18]">
              GenZ Admin
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-black text-xs font-bold text-white">
            {userInitial}
          </div>
        </div>
      </div>

      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs transition-opacity duration-300 sm:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Desktop / Responsive Sidebar Drawer */}
      <aside
        className={`sticky top-0 z-30 h-screen shrink-0 flex-col justify-between overflow-y-auto border-r border-[#E5E5E0] bg-[#FAF8F4] text-[#1A1A18] transition-all duration-300 select-none ${
          isCollapsed ? "w-[72px]" : "w-[260px]"
        } ${
          mobileOpen
            ? "fixed inset-y-0 left-0 z-50 flex w-[280px] translate-x-0 shadow-2xl"
            : "hidden sm:flex"
        }`}
      >
        <div className="space-y-6 p-4">
          {/* Header Brand */}
          <div className="flex items-center justify-between border-b border-[#F0F0EC] pb-3">
            <Link
              href="/dashboard"
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-2.5 ${
                isCollapsed ? "lg:w-full lg:justify-center" : ""
              }`}
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-black font-bold text-white shadow-2xs">
                <Shield className="h-4 w-4" />
              </div>

              <div className={isCollapsed ? "lg:hidden" : "block"}>
                <span className="font-nantes block text-sm leading-tight font-bold text-[#1A1A18]">
                  GenZ Platform
                </span>
                <span className="block font-mono text-[10px] text-[#73736E]">
                  Admin Console
                </span>
              </div>
            </Link>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setMobileOpen(false)}
                className="rounded-lg p-1.5 text-[#73736E] hover:bg-[#EBEBE6] sm:hidden"
              >
                <X className="h-4 w-4" />
              </button>
              <button
                onClick={toggleCollapse}
                className="hidden rounded-lg p-1.5 text-[#73736E] transition-colors hover:bg-[#EBEBE6] hover:text-black lg:block"
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

          {/* Navigation Groups */}
          <div className="space-y-5">
            {navGroups.map((group, idx) => (
              <div key={idx} className="space-y-1">
                <p
                  className={`font-graphik mb-1 px-3 text-[10px] font-bold tracking-wider text-[#8C8C85] uppercase ${
                    isCollapsed ? "lg:hidden" : "block"
                  }`}
                >
                  {group.groupName}
                </p>

                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const isActive =
                      pathname === item.href ||
                      (item.href !== "/dashboard" && pathname.startsWith(item.href));
                    const Icon = item.icon;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={`group relative flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-semibold transition-all ${
                          isCollapsed ? "lg:justify-center lg:px-0" : ""
                        } ${
                          isActive
                            ? "border border-[#E5E5E0] bg-white font-bold text-black shadow-2xs"
                            : "text-[#52524E] hover:bg-[#EBEBE6] hover:text-black"
                        }`}
                      >
                        {/* Active Left Accent Bar */}
                        {isActive && (
                          <span className="absolute top-1.5 bottom-1.5 left-0 w-1 rounded-r-full bg-black" />
                        )}

                        <Icon className="h-4 w-4 shrink-0 text-[#73736E] group-hover:text-black" />
                        <span className={isCollapsed ? "lg:hidden" : "block"}>
                          {item.label}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Profile Footer */}
        <div className="relative border-t border-[#E5E5E0] p-3">
          {userMenuOpen && (
            <div className="font-graphik absolute right-3 bottom-16 left-3 z-50 space-y-1 rounded-xl border border-[#E5E5E0] bg-white p-2 text-xs shadow-xl">
              <Link
                href="/dashboard/account"
                onClick={() => {
                  setUserMenuOpen(false);
                  setMobileOpen(false);
                }}
                className="flex items-center gap-2 rounded-lg p-2 font-medium text-black hover:bg-[#FAF8F4]"
              >
                <User className="h-3.5 w-3.5" />
                <span>Account Settings</span>
              </Link>

              <form action={signOut}>
                <button
                  type="submit"
                  className="flex w-full items-center gap-2 rounded-lg p-2 font-semibold text-rose-700 hover:bg-rose-50"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Sign Out</span>
                </button>
              </form>
            </div>
          )}

          <div
            onClick={() => setUserMenuOpen((prev) => !prev)}
            className={`flex cursor-pointer items-center justify-between rounded-xl p-2 transition-colors hover:bg-[#EBEBE6] ${
              isCollapsed ? "lg:justify-center" : ""
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black text-xs font-bold text-white shadow-2xs">
                {userInitial}
              </div>
              <div className={`overflow-hidden ${isCollapsed ? "lg:hidden" : "block"}`}>
                <span className="font-graphik block truncate text-xs font-bold text-[#1A1A18]">
                  {user?.full_name || "Platform Admin"}
                </span>
                <span className="block truncate font-mono text-[10px] text-[#73736E]">
                  {user?.email}
                </span>
              </div>
            </div>

            {!isCollapsed && <ChevronsUpDown className="h-3.5 w-3.5 text-[#8C8C85]" />}
          </div>
        </div>
      </aside>
    </>
  );
}
