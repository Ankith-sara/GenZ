"use client";

import { useState } from "react";
import type { ElementType } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  FileText,
  Package,
  ShieldCheck,
  User,
  Menu,
  X,
  MessageSquare,
  ChevronsUpDown,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import type { Role } from "@/types/database";

type NavItem = { href: string; label: string; icon: ElementType };

const NAV_BY_ROLE: Record<Role, NavItem[]> = {
  buyer: [],
  manufacturer: [
    { href: "/dashboard/manufacturer", label: "Dashboard", icon: LayoutDashboard },
    {
      href: "/dashboard/manufacturer/onboarding",
      label: "Business Profile",
      icon: Building2,
    },
    { href: "/dashboard/manufacturer/documents", label: "Documents", icon: FileText },
    { href: "/dashboard/manufacturer/products", label: "Products", icon: Package },
    {
      href: "/dashboard/manufacturer/inquiries",
      label: "Inquiries",
      icon: MessageSquare,
    },
    { href: "/profile", label: "Account", icon: User },
  ],
  admin: [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    {
      href: "/admin/dashboard/verifications",
      label: "Verifications",
      icon: ShieldCheck,
    },
    { href: "/profile", label: "Account", icon: User },
  ],
};

function NavLinks({
  role,
  isCollapsed,
  onNavigate,
}: {
  role: Role;
  isCollapsed: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const items = NAV_BY_ROLE[role];

  return (
    <nav className="flex flex-col gap-1">
      {items.map((item) => {
        const active =
          pathname === item.href ||
          (item.href !== `/dashboard/${role}` && pathname.startsWith(item.href));
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            title={isCollapsed ? item.label : undefined}
            className={`font-graphik flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all ${
              isCollapsed ? "lg:justify-center lg:px-0" : ""
            } ${
              active
                ? "border border-[#E5E5E0] bg-white text-black shadow-xs"
                : "text-[#52524E] hover:bg-[#EAEAE6] hover:text-black"
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className={isCollapsed ? "lg:hidden" : "block"}>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

interface DashboardSidebarProps {
  role: Role;
  user?: {
    full_name?: string | null;
    email?: string | null;
  };
}

export function DashboardSidebar({ role, user }: DashboardSidebarProps) {
  const [open, setOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      const savedCollapse = localStorage.getItem("mfg_sidebar_collapsed");
      return savedCollapse === "true";
    }
    return false;
  });

  const handleToggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("mfg_sidebar_collapsed", String(next));
      return next;
    });
  };

  const nameInitial = (user?.full_name || user?.email || "M")[0].toUpperCase();

  return (
    <>
      {/* Mobile top bar trigger */}
      <div className="border-border flex items-center justify-between border-b bg-[#F5F5F3] p-4 sm:hidden">
        <span className="font-nantes text-sm font-bold text-black">
          GenZ Manufacturer
        </span>
        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((o) => !o)}
          className="border-border flex h-10 w-10 items-center justify-center rounded-xl border bg-white"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Desktop Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-full flex-col justify-between border-r border-[#E5E5E3] bg-[#F5F5F3] p-4 text-black transition-all duration-300 select-none lg:static lg:z-auto lg:min-h-screen lg:flex-shrink-0 ${
          isCollapsed ? "lg:w-20" : "lg:w-64"
        } ${
          open ? "w-64 translate-x-0 shadow-2xl" : "-translate-x-full sm:translate-x-0"
        } hidden sm:flex`}
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
                  GenZ Manufacturer
                </span>
                <span className="font-graphik block text-[11px] text-[#73736E]">
                  Partner Portal
                </span>
              </div>
            </div>

            {/* Desktop collapse button */}
            <button
              onClick={handleToggleCollapse}
              className="hidden rounded-lg p-1.5 text-[#73736E] transition-colors hover:bg-[#EAEAE6] hover:text-black lg:block"
              aria-label={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {isCollapsed ? (
                <PanelLeftOpen className="h-4 w-4" />
              ) : (
                <PanelLeftClose className="h-4 w-4" />
              )}
            </button>
          </div>

          <div className="space-y-1">
            <p
              className={`font-graphik mb-2 px-3 text-[11px] font-semibold tracking-wider text-[#8C8C85] uppercase ${
                isCollapsed ? "lg:hidden" : "block"
              }`}
            >
              Navigation
            </p>
            <NavLinks role={role} isCollapsed={isCollapsed} />
          </div>
        </div>

        {/* Bottom User Profile info */}
        <div className="border-t border-[#E5E5E0] pt-4">
          <Link
            href="/profile"
            className={`flex cursor-pointer items-center justify-between rounded-xl p-2 transition-all hover:bg-[#EAEAE6] ${
              isCollapsed ? "lg:justify-center" : ""
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="bg-brand-yellow flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-black">
                {nameInitial}
              </div>
              <div className={`overflow-hidden ${isCollapsed ? "lg:hidden" : "block"}`}>
                <span className="font-graphik block truncate font-sans text-xs font-bold text-black">
                  {user?.full_name || "Manufacturer"}
                </span>
                <span className="font-graphik block truncate font-sans text-[10px] text-[#73736E]">
                  {user?.email}
                </span>
              </div>
            </div>
            {!isCollapsed && (
              <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-[#8C8C85]" />
            )}
          </Link>
        </div>
      </aside>

      {/* Mobile Menu Dropdown */}
      {open && (
        <div className="border-border border-b bg-[#F5F5F3] p-4 sm:hidden">
          <NavLinks role={role} isCollapsed={false} onNavigate={() => setOpen(false)} />
        </div>
      )}
    </>
  );
}
