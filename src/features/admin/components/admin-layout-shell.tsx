"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { AdminSidebar } from "./admin-sidebar";
import { CommandMenu } from "@/components/ui/organisms/command-menu";
import {
  Menu,
  Search,
  Bell,
  Calendar,
  ChevronDown,
  Building2,
  CheckCircle2,
} from "lucide-react";

interface AdminLayoutShellProps {
  adminUser?: {
    full_name?: string | null;
    email?: string | null;
  };
  counts: {
    users: number;
    pendingVerifications: number;
    products: number;
    inquiries: number;
    waitlist: number;
    contact: number;
  };
  firstName: string;
  dateRangeFormatted: string;
  children: React.ReactNode;
}

export function AdminLayoutShell({
  adminUser,
  counts,
  firstName,
  dateRangeFormatted,
  children,
}: AdminLayoutShellProps) {
  const pathname = usePathname();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [commandMenuOpen, setCommandMenuOpen] = useState(false);
  const [notifPopoverOpen, setNotifPopoverOpen] = useState(false);
  const [workspaceOpen, setWorkspaceOpen] = useState(false);

  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      const savedCollapse = localStorage.getItem("admin_sidebar_collapsed");
      return savedCollapse === "true";
    }
    return false;
  });

  const handleToggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("admin_sidebar_collapsed", String(next));
      return next;
    });
  };

  // Keyboard shortcut for ⌘K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandMenuOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Time-based greeting generator
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  // Page title mapping for non-dashboard pages
  const getPageTitle = () => {
    if (pathname === "/admin/dashboard") return null;
    if (pathname?.includes("/verifications")) return "Seller Verifications";
    if (pathname?.includes("/users")) return "User Profiles";
    if (pathname?.includes("/products")) return "Product Catalog";
    if (pathname?.includes("/inquiries")) return "Inquiry Stream";
    if (pathname?.includes("/waitlist")) return "Waitlist Leads";
    if (pathname?.includes("/contact")) return "Contact Messages";
    return "Dashboard";
  };

  const pageTitle = getPageTitle();

  return (
    <div className="flex min-h-screen bg-[#FAF8F4] font-sans text-[#1A1A18] antialiased">
      {/* 1. SIDEBAR */}
      <AdminSidebar
        adminUser={adminUser}
        counts={counts}
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
        isCollapsed={isCollapsed}
        onToggleCollapse={handleToggleCollapse}
      />

      {/* 2. MAIN CONTENT AREA */}
      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        {/* STICKY TOP NAVIGATION BAR */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-[#E5E5E0] bg-[#FAF8F4]/85 px-4 backdrop-blur-md select-none sm:px-6 lg:px-8">
          {/* Left Greeting / Page Title & Mobile Toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#E5E5E0] bg-white text-black hover:bg-[#EBEBE6] lg:hidden"
              aria-label="Open Navigation Menu"
            >
              <Menu className="h-4 w-4" />
            </button>

            {pageTitle ? (
              <div>
                <h1 className="font-graphik text-base font-bold text-[#1A1A18]">
                  {pageTitle}
                </h1>
              </div>
            ) : (
              <div>
                <h1 className="font-graphik text-base font-bold text-[#1A1A18]">
                  {getGreeting()}, {firstName}
                </h1>
              </div>
            )}
          </div>

          {/* Right Header Toolbar */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Workspace Selector */}
            <div className="relative hidden md:block">
              <button
                type="button"
                onClick={() => setWorkspaceOpen((prev) => !prev)}
                className="font-graphik flex items-center gap-2 rounded-lg border border-[#E5E5E0] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#1A1A18] shadow-2xs hover:bg-[#FAF7F0]"
              >
                <Building2 className="h-3.5 w-3.5 text-[#73736E]" />
                <span>GenZ India Platform</span>
                <ChevronDown className="h-3 w-3 text-[#8C8C85]" />
              </button>

              {workspaceOpen && (
                <div className="absolute right-0 z-50 mt-1.5 w-56 rounded-xl border border-[#E5E5E0] bg-white p-1 shadow-lg ring-1 ring-black/5">
                  <div className="border-b border-[#F0F0EC] px-3 py-2">
                    <p className="font-graphik text-[10px] font-bold text-[#8C8C85] uppercase">
                      Select Workspace
                    </p>
                  </div>
                  <button
                    onClick={() => setWorkspaceOpen(false)}
                    className="font-graphik flex w-full items-center justify-between rounded-lg bg-[#FAF7F0] px-3 py-2 text-xs font-semibold text-black"
                  >
                    <span>GenZ India Platform</span>
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  </button>
                </div>
              )}
            </div>

            {/* Global Search Bar (⌘K) Trigger */}
            <button
              onClick={() => setCommandMenuOpen(true)}
              className="font-graphik flex h-9 items-center gap-2 rounded-lg border border-[#E5E5E0] bg-white px-3 text-xs text-[#73736E] shadow-2xs transition-all hover:border-black/30 hover:text-black"
            >
              <Search className="h-3.5 w-3.5 text-[#73736E]" />
              <span className="hidden sm:inline">Search...</span>
              <kbd className="hidden rounded border border-[#E5E5E0] bg-[#FAF7F0] px-1.5 py-0.5 font-mono text-[10px] font-bold text-[#73736E] sm:inline-block">
                ⌘K
              </kbd>
            </button>

            {/* Notifications Button */}
            <div className="relative">
              <button
                onClick={() => setNotifPopoverOpen((prev) => !prev)}
                className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-[#E5E5E0] bg-white text-[#52524E] shadow-2xs transition-all hover:bg-[#FAF7F0] hover:text-black"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4" />
                {counts.pendingVerifications > 0 && (
                  <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-amber-500 ring-2 ring-white" />
                )}
              </button>

              {notifPopoverOpen && (
                <div className="absolute right-0 z-50 mt-2 w-80 rounded-2xl border border-[#E5E5E0] bg-white p-3 shadow-xl">
                  <div className="flex items-center justify-between border-b border-[#F0F0EC] pb-2.5">
                    <span className="font-graphik text-xs font-bold text-black">
                      Notifications
                    </span>
                    <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 font-mono text-[10px] font-bold text-amber-800">
                      {counts.pendingVerifications} Pending
                    </span>
                  </div>

                  <div className="space-y-2 py-3">
                    {counts.pendingVerifications > 0 ? (
                      <div className="rounded-xl border border-amber-200/60 bg-amber-50/50 p-2.5 text-xs">
                        <p className="font-semibold text-black">
                          {counts.pendingVerifications} Seller Verification Applications
                        </p>
                        <p className="mt-0.5 text-[11px] text-[#73736E]">
                          Review factory documents and business details.
                        </p>
                      </div>
                    ) : (
                      <p className="py-4 text-center text-xs text-[#73736E]">
                        All notifications cleared.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Date Range Filter Pill */}
            <div className="font-graphik hidden items-center gap-2 rounded-lg border border-[#E5E5E0] bg-white px-3 py-1.5 text-xs font-semibold text-[#1A1A18] shadow-2xs sm:flex">
              <Calendar className="h-3.5 w-3.5 text-[#73736E]" />
              <span>{dateRangeFormatted}</span>
            </div>
          </div>
        </header>

        {/* MAIN SCROLLABLE CONTENT BODY */}
        <main className="flex-1 p-4 select-text sm:p-6 lg:p-8">{children}</main>
      </div>

      {/* GLOBAL ⌘K COMMAND MENU */}
      <CommandMenu isOpen={commandMenuOpen} onClose={() => setCommandMenuOpen(false)} />
    </div>
  );
}
