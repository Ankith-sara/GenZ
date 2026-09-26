"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Shield,
  Briefcase,
  Users,
  ChevronDown,
  LayoutGrid,
  FileBarChart,
  Settings,
  Package,
  ShoppingBag,
  CheckSquare,
  Building2,
  UserCog,
  Target,
  ClipboardCheck,
} from "lucide-react";

interface ModuleNavbarProps {
  counts?: {
    pendingVerifications?: number;
    tasks?: number;
    leads?: number;
    onboarding?: number;
    contacts?: number;
    deals?: number;
    orders?: number;
    products?: number;
  };
}

export function ModuleNavbar({ counts }: ModuleNavbarProps) {
  const pathname = usePathname();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Determine active module
  const isCrmActive = Boolean(pathname?.startsWith("/dashboard/crm"));
  const isOpsActive = Boolean(
    pathname?.startsWith("/dashboard/operations") ||
      pathname?.startsWith("/dashboard/orders") ||
      pathname?.startsWith("/dashboard/products") ||
      pathname?.startsWith("/dashboard/tasks") ||
      pathname?.startsWith("/dashboard/verifications")
  );
  const isAdminActive = !isCrmActive && !isOpsActive;

  const modules = [
    {
      id: "admin",
      label: "Admin",
      dashboardHref: "/dashboard",
      reportsHref: "/dashboard/reports?module=admin",
      settingsHref: "/dashboard/settings",
      icon: Shield,
      isActive: isAdminActive,
      badge: null,
      quickLinks: [
        { label: "Dashboard", href: "/dashboard", icon: LayoutGrid },
        { label: "Reports & Logs", href: "/dashboard/reports?module=admin", icon: FileBarChart },
        { label: "Platform Settings", href: "/dashboard/settings", icon: Settings },
        { label: "Team Employees", href: "/dashboard/employees", icon: UserCog },
        { label: "Departments", href: "/dashboard/employees/departments", icon: Building2 },
        { label: "Roles & Permissions", href: "/dashboard/roles", icon: Shield },
      ],
    },
    {
      id: "operations",
      label: "Operations",
      dashboardHref: "/dashboard/operations",
      reportsHref: "/dashboard/reports?module=operations",
      settingsHref: "/dashboard/operations/settings",
      icon: Briefcase,
      isActive: isOpsActive,
      badge:
        counts?.tasks || counts?.pendingVerifications
          ? (counts?.tasks ?? 0) + (counts?.pendingVerifications ?? 0)
          : null,
      quickLinks: [
        { label: "Operations Dashboard", href: "/dashboard/operations", icon: LayoutGrid },
        { label: "Operations Reports", href: "/dashboard/reports?module=operations", icon: FileBarChart },
        { label: "Operations Settings", href: "/dashboard/operations/settings", icon: Settings },
        { label: "Orders & Shipping", href: "/dashboard/orders", icon: Package },
        { label: "Products Catalog", href: "/dashboard/products", icon: ShoppingBag },
        { label: "Tasks Kanban", href: "/dashboard/tasks", icon: CheckSquare, badge: counts?.tasks },
        { label: "Verifications & KYC", href: "/dashboard/verifications", icon: Building2, badge: counts?.pendingVerifications },
      ],
    },
    {
      id: "crm",
      label: "CRM",
      dashboardHref: "/dashboard/crm",
      reportsHref: "/dashboard/reports?module=crm",
      settingsHref: "/dashboard/crm/settings",
      icon: Users,
      isActive: isCrmActive,
      badge:
        counts?.leads || counts?.onboarding
          ? (counts?.leads ?? 0) + (counts?.onboarding ?? 0)
          : null,
      quickLinks: [
        { label: "CRM Dashboard", href: "/dashboard/crm", icon: LayoutGrid },
        { label: "CRM Reports", href: "/dashboard/reports?module=crm", icon: FileBarChart },
        { label: "CRM Settings", href: "/dashboard/crm/settings", icon: Settings },
        { label: "Sourcing Leads", href: "/dashboard/crm/leads", icon: Target, badge: counts?.leads },
        { label: "Artisan Contacts", href: "/dashboard/crm/contacts", icon: Users, badge: counts?.contacts },
        { label: "Pipeline Deals", href: "/dashboard/crm/deals", icon: Briefcase, badge: counts?.deals },
        { label: "Seller Onboarding", href: "/dashboard/crm/onboarding", icon: ClipboardCheck, badge: counts?.onboarding },
      ],
    },
  ];

  return (
    <nav
      ref={containerRef}
      aria-label="Modular Platform Navigation"
      className="flex items-center gap-1 rounded-xl border border-neutral-200/90 bg-white/95 p-1 shadow-2xs backdrop-blur-md"
    >
      {modules.map((mod) => {
        const Icon = mod.icon;
        const isMenuOpen = activeDropdown === mod.id;

        return (
          <div key={mod.id} className="relative">
            <div className="flex items-center">
              <Link
                href={mod.dashboardHref}
                onClick={() => setActiveDropdown(null)}
                className={`group flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold transition-all ${
                  mod.isActive
                    ? "bg-[#1A1A18] text-white shadow-xs"
                    : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                }`}
              >
                <Icon
                  className={`h-3.5 w-3.5 ${
                    mod.isActive
                      ? "text-[#C89D32]"
                      : "text-neutral-400 group-hover:text-neutral-700"
                  }`}
                />
                <span>{mod.label}</span>

                {mod.badge && !mod.isActive ? (
                  <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-100 px-1 font-mono text-[9px] font-bold text-amber-800">
                    {mod.badge}
                  </span>
                ) : null}
              </Link>

              {/* Submenu Dropdown Trigger */}
              <button
                type="button"
                onClick={() => setActiveDropdown(isMenuOpen ? null : mod.id)}
                aria-expanded={isMenuOpen}
                aria-label={`Open ${mod.label} module navigation`}
                className={`flex h-7 w-5 items-center justify-center rounded-r-lg text-neutral-400 hover:text-neutral-900 transition-colors ${
                  mod.isActive ? "text-neutral-300 hover:text-white" : ""
                }`}
              >
                <ChevronDown
                  className={`h-3 w-3 transition-transform ${isMenuOpen ? "rotate-180" : ""}`}
                />
              </button>
            </div>

            {/* Module Submenu Popover with Dashboard, Reports, Settings */}
            {isMenuOpen && (
              <div className="absolute top-full left-0 z-50 mt-1.5 w-60 rounded-xl border border-neutral-200 bg-white p-2 shadow-xl ring-1 ring-black/5 animate-in fade-in-0 zoom-in-95">
                <div className="flex items-center justify-between border-b border-neutral-100 px-2 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                  <span>{mod.label} Module Hub</span>
                  <span className="text-[9px] lowercase text-neutral-400 font-normal">hub</span>
                </div>

                {/* Primary Hub Links: Dashboard | Reports | Settings */}
                <div className="grid grid-cols-3 gap-1 py-1.5 border-b border-neutral-100">
                  <Link
                    href={mod.dashboardHref}
                    onClick={() => setActiveDropdown(null)}
                    className="flex flex-col items-center justify-center rounded-lg p-1.5 text-[10px] font-semibold text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
                  >
                    <LayoutGrid className="h-3.5 w-3.5 text-neutral-500 mb-0.5" />
                    <span>Dashboard</span>
                  </Link>
                  <Link
                    href={mod.reportsHref}
                    onClick={() => setActiveDropdown(null)}
                    className="flex flex-col items-center justify-center rounded-lg p-1.5 text-[10px] font-semibold text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
                  >
                    <FileBarChart className="h-3.5 w-3.5 text-neutral-500 mb-0.5" />
                    <span>Reports</span>
                  </Link>
                  <Link
                    href={mod.settingsHref}
                    onClick={() => setActiveDropdown(null)}
                    className="flex flex-col items-center justify-center rounded-lg p-1.5 text-[10px] font-semibold text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
                  >
                    <Settings className="h-3.5 w-3.5 text-neutral-500 mb-0.5" />
                    <span>Settings</span>
                  </Link>
                </div>

                {/* Module Pages List */}
                <div className="mt-1.5 space-y-0.5">
                  <div className="px-2 py-0.5 text-[9px] font-bold text-neutral-400 uppercase tracking-wider">
                    Pages & Workflows
                  </div>
                  {mod.quickLinks.slice(3).map((sub) => {
                    const SubIcon = sub.icon;
                    const isSubActive = pathname === sub.href;
                    return (
                      <Link
                        key={sub.href}
                        href={sub.href}
                        onClick={() => setActiveDropdown(null)}
                        className={`flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                          isSubActive
                            ? "bg-neutral-900 text-white"
                            : "text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <SubIcon
                            className={`h-3.5 w-3.5 ${
                              isSubActive ? "text-[#C89D32]" : "text-neutral-400"
                            }`}
                          />
                          <span>{sub.label}</span>
                        </span>
                        {sub.badge ? (
                          <span
                            className={`rounded-full px-1.5 py-0.2 text-[9px] font-mono font-bold ${
                              isSubActive
                                ? "bg-white/20 text-white"
                                : "bg-neutral-100 text-neutral-600"
                            }`}
                          >
                            {sub.badge}
                          </span>
                        ) : null}
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}
