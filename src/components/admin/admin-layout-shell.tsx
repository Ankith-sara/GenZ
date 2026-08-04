"use client";

import { useState } from "react";
import { AdminSidebar } from "./admin-sidebar";
import { Menu, Search, Bell, Calendar, ChevronDown, LogOut } from "lucide-react";
import { signOut } from "@/app/login/actions";

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
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
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

  return (
    <div className="flex min-h-screen bg-[#F5F5F3] font-sans text-black antialiased">
      {/* 1. SIDEBAR (Desktop + Mobile Drawer + Collapsible) */}
      <AdminSidebar
        adminUser={adminUser}
        counts={counts}
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
        isCollapsed={isCollapsed}
        onToggleCollapse={handleToggleCollapse}
      />

      {/* 2. MAIN CONTENT CONTAINER */}
      <div className="flex min-w-0 flex-1 flex-col space-y-6 overflow-y-auto bg-[#FAFAFA] p-4 sm:p-6 lg:p-8">
        {/* Top Header Controls */}
        <header className="flex flex-col justify-between gap-4 rounded-2xl border border-[#E5E5E0] bg-white p-4 shadow-xs sm:flex-row sm:items-center sm:px-6">
          {/* Left Greeting & Mobile Hamburger Toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#E5E5E0] bg-[#FAF7F0] text-black hover:bg-[#EAEAE6] lg:hidden"
              aria-label="Open Navigation Menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="bg-brand-yellow flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-black/10 text-sm font-bold text-black">
              {firstName[0]?.toUpperCase() || "A"}
            </div>
            <div>
              <h1 className="font-nantes text-base leading-tight font-bold text-black sm:text-lg">
                Hello {firstName}
              </h1>
              <p className="font-graphik text-xs text-[#73736E]">
                Welcome back to GenZ Platform
              </p>
            </div>
          </div>

          {/* Right Header Toolbar */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            <button
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#E5E5E0] bg-white text-[#52524E] transition-all hover:bg-[#F5F5F3] hover:text-black"
              aria-label="Search"
            >
              <Search className="h-4 w-4" />
            </button>

            <button
              className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-[#E5E5E0] bg-white text-[#52524E] transition-all hover:bg-[#F5F5F3] hover:text-black"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              {counts.pendingVerifications > 0 && (
                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-amber-500" />
              )}
            </button>

            <div className="font-graphik flex cursor-pointer items-center gap-1.5 rounded-xl border border-[#E5E5E0] bg-white px-2.5 py-2 text-xs font-medium text-[#52524E] hover:bg-[#F5F5F3] sm:px-3">
              <span>Last 7 days</span>
              <ChevronDown className="h-3.5 w-3.5 text-[#8C8C85]" />
            </div>

            <div className="font-graphik hidden items-center gap-2 rounded-xl border border-[#E5E5E0] bg-white px-3 py-2 text-xs font-semibold text-black shadow-xs sm:flex">
              <Calendar className="h-4 w-4 text-[#73736E]" />
              <span>{dateRangeFormatted}</span>
            </div>

            <form action={signOut} className="ml-auto sm:ml-2">
              <button
                type="submit"
                className="font-graphik flex h-9 items-center gap-1.5 rounded-xl border border-[#E5E5E0] bg-white px-3 text-xs font-semibold text-[#52524E] transition-all hover:bg-red-50 hover:text-red-600"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Exit</span>
              </button>
            </form>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}
