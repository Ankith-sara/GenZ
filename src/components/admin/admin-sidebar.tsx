"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  Building2,
  Users,
  ShoppingBag,
  MessageSquare,
  UserCheck,
  Mail,
  BarChart3,
  ShieldCheck,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronsUpDown,
  X,
  LogOut,
} from "lucide-react";
import { signOut } from "@/app/login/actions";

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
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const mainNav = [
    {
      label: "Dashboard",
      href: "/admin/dashboard",
      icon: LayoutGrid,
      badge: null,
      exact: true,
    },
    {
      label: "Verifications",
      href: "/admin/dashboard/verifications",
      icon: Building2,
      badge: counts?.pendingVerifications ?? 0,
      exact: false,
    },
    {
      label: "Users",
      href: "/admin/dashboard/users",
      icon: Users,
      badge: null,
      exact: false,
    },
    {
      label: "Products",
      href: "/admin/dashboard/products",
      icon: ShoppingBag,
      badge: null,
      exact: false,
    },
    {
      label: "Inquiries",
      href: "/admin/dashboard/inquiries",
      icon: MessageSquare,
      badge: counts?.inquiries ?? 0,
      exact: false,
    },
  ];

  const leadsNav = [
    {
      label: "Waitlist",
      href: "/admin/dashboard/waitlist",
      icon: UserCheck,
      badge: counts?.waitlist ?? 0,
    },
    {
      label: "Messages",
      href: "/admin/dashboard/contact",
      icon: Mail,
      badge: counts?.contact ?? 0,
    },
  ];

  const systemNav = [
    {
      label: "Analytics",
      href: "/admin/dashboard?view=analytics",
      icon: BarChart3,
      badge: null,
    },
    {
      label: "Audit Logs",
      href: "/admin/dashboard?view=logs",
      icon: ShieldCheck,
      badge: null,
    },
    {
      label: "Settings",
      href: "/admin/dashboard?view=settings",
      icon: Settings,
      badge: null,
    },
  ];

  const isLinkActive = (href: string, exact = false) => {
    if (exact) return pathname === href;
    return pathname?.startsWith(href);
  };

  return (
    <>
      {/* Mobile Dark Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs transition-opacity lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-full flex-col justify-between border-r border-[#E5E5E0] bg-[#FAF8F4] p-3 text-[#1A1A18] transition-all duration-200 select-none lg:sticky lg:top-0 lg:z-auto lg:h-screen lg:shrink-0 ${
          isCollapsed ? "w-[72px]" : "w-[260px]"
        } ${
          isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="space-y-6">
          {/* Top Brand Header */}
          <div className="flex h-12 items-center justify-between px-2">
            <Link
              href="/admin/dashboard"
              className={`flex items-center gap-2.5 ${
                isCollapsed ? "w-full justify-center" : ""
              }`}
            >
              <div className="font-graphik flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-black text-xs font-bold text-white shadow-2xs">
                GZ
              </div>
              {!isCollapsed && (
                <div>
                  <span className="font-graphik block text-sm leading-tight font-bold text-black">
                    GenZ Command
                  </span>
                  <span className="font-graphik block text-[10px] text-[#73736E]">
                    Enterprise Admin
                  </span>
                </div>
              )}
            </Link>

            {/* Mobile close button */}
            {onClose && (
              <button
                onClick={onClose}
                className="rounded-lg p-1 text-[#73736E] hover:bg-[#EBEBE6] hover:text-black lg:hidden"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            )}

            {/* Desktop collapse toggle */}
            {onToggleCollapse && (
              <button
                onClick={onToggleCollapse}
                className="hidden rounded-lg p-1 text-[#73736E] hover:bg-[#EBEBE6] hover:text-black lg:block"
                title={
                  isCollapsed ? "Expand Sidebar (260px)" : "Collapse Sidebar (72px)"
                }
              >
                {isCollapsed ? (
                  <PanelLeftOpen className="h-4 w-4" />
                ) : (
                  <PanelLeftClose className="h-4 w-4" />
                )}
              </button>
            )}
          </div>

          {/* MAIN SECTION */}
          <div className="space-y-1">
            {!isCollapsed && (
              <p className="font-graphik mb-2 px-3 text-[10px] font-bold tracking-widest text-[#8C8C85] uppercase">
                MAIN
              </p>
            )}

            {mainNav.map((item) => {
              const Icon = item.icon;
              const active = isLinkActive(item.href, item.exact);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={isCollapsed ? item.label : undefined}
                  className={`font-graphik group relative flex items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold transition-all ${
                    isCollapsed ? "justify-center px-0" : ""
                  } ${
                    active
                      ? "bg-[#EBEBE6] font-bold text-black"
                      : "text-[#52524E] hover:bg-[#EBEBE6]/60 hover:text-black"
                  }`}
                >
                  {/* Left Active Accent Line */}
                  {active && (
                    <span className="absolute top-1.5 bottom-1.5 left-0 w-1 rounded-r-full bg-black" />
                  )}

                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4 shrink-0 text-[#52524E] group-hover:text-black" />
                    {!isCollapsed && <span>{item.label}</span>}
                  </div>

                  {item.badge !== null && item.badge > 0 && (
                    <span
                      className={`rounded-full border border-amber-300 bg-amber-100 font-mono font-bold text-amber-900 ${
                        isCollapsed
                          ? "h-2 w-2 p-0 text-[0px]"
                          : "px-2 py-0.5 text-[10px]"
                      }`}
                    >
                      {!isCollapsed && item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* LEADS SECTION */}
          <div className="space-y-1">
            {!isCollapsed && (
              <p className="font-graphik mb-2 px-3 text-[10px] font-bold tracking-widest text-[#8C8C85] uppercase">
                LEADS
              </p>
            )}

            {leadsNav.map((item) => {
              const Icon = item.icon;
              const active = isLinkActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={isCollapsed ? item.label : undefined}
                  className={`font-graphik group relative flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                    isCollapsed ? "justify-center px-0" : ""
                  } ${
                    active
                      ? "bg-[#EBEBE6] font-bold text-black"
                      : "text-[#52524E] hover:bg-[#EBEBE6]/60 hover:text-black"
                  }`}
                >
                  {active && (
                    <span className="absolute top-1.5 bottom-1.5 left-0 w-1 rounded-r-full bg-black" />
                  )}

                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4 shrink-0 text-[#52524E] group-hover:text-black" />
                    {!isCollapsed && <span>{item.label}</span>}
                  </div>
                </Link>
              );
            })}
          </div>

          {/* SYSTEM SECTION */}
          <div className="space-y-1">
            {!isCollapsed && (
              <p className="font-graphik mb-2 px-3 text-[10px] font-bold tracking-widest text-[#8C8C85] uppercase">
                SYSTEM
              </p>
            )}

            {systemNav.map((item) => {
              const Icon = item.icon;
              const active = isLinkActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={isCollapsed ? item.label : undefined}
                  className={`font-graphik group relative flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                    isCollapsed ? "justify-center px-0" : ""
                  } ${
                    active
                      ? "bg-[#EBEBE6] font-bold text-black"
                      : "text-[#52524E] hover:bg-[#EBEBE6]/60 hover:text-black"
                  }`}
                >
                  {active && (
                    <span className="absolute top-1.5 bottom-1.5 left-0 w-1 rounded-r-full bg-black" />
                  )}

                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4 shrink-0 text-[#52524E] group-hover:text-black" />
                    {!isCollapsed && <span>{item.label}</span>}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* BOTTOM PROFILE SECTION */}
        <div className="relative border-t border-[#E5E5E0] pt-3">
          <button
            type="button"
            onClick={() => setProfileMenuOpen((prev) => !prev)}
            className={`font-graphik flex w-full cursor-pointer items-center justify-between rounded-xl p-2 transition-all hover:bg-[#EBEBE6] ${
              isCollapsed ? "justify-center" : ""
            }`}
          >
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#C89D32] font-mono text-xs font-bold text-white shadow-2xs">
                {(adminUser?.full_name || "A")[0].toUpperCase()}
              </div>
              {!isCollapsed && (
                <div className="overflow-hidden text-left">
                  <span className="block truncate text-xs leading-tight font-bold text-black">
                    {adminUser?.full_name || "Admin User"}
                  </span>
                  <span className="block truncate text-[10px] font-medium text-[#73736E]">
                    Superadmin
                  </span>
                </div>
              )}
            </div>
            {!isCollapsed && (
              <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-[#8C8C85]" />
            )}
          </button>

          {/* Profile Dropup Menu */}
          {profileMenuOpen && (
            <div className="animate-in fade-in-90 zoom-in-95 absolute bottom-full left-0 z-50 mb-2 w-full min-w-[200px] overflow-hidden rounded-xl border border-[#E5E5E0] bg-white p-1 shadow-lg duration-100">
              <div className="border-b border-[#F0F0EC] p-2.5">
                <p className="font-graphik truncate text-xs font-bold text-black">
                  {adminUser?.full_name || "Admin User"}
                </p>
                <p className="font-graphik truncate text-[10px] text-[#73736E]">
                  {adminUser?.email || "admin@genz.in"}
                </p>
              </div>

              <form action={signOut}>
                <button
                  type="submit"
                  className="font-graphik flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-rose-600 transition-colors hover:bg-rose-50"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Sign Out</span>
                </button>
              </form>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
