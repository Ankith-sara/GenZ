"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Shield,
  Briefcase,
  Users,
  ChevronDown,
  Package,
  ShoppingBag,
  CheckSquare,
  Building2,
  LayoutGrid,
  UserCog,
  Target,
  ClipboardCheck,
  Settings,
  type LucideIcon,
} from "lucide-react";

interface DepartmentSubItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: number | null;
}

interface DepartmentItem {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  isActive: boolean;
  badge?: number | null;
  subItems: DepartmentSubItem[];
}

interface DepartmentNavbarProps {
  counts?: {
    pendingVerifications?: number;
    tasks?: number;
    leads?: number;
    onboarding?: number;
    contacts?: number;
    deals?: number;
  };
}

export function DepartmentNavbar({ counts }: DepartmentNavbarProps) {
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

  // Determine current active department
  const isCrmActive = Boolean(pathname?.startsWith("/dashboard/crm"));
  const isOpsActive = Boolean(
    pathname?.startsWith("/dashboard/orders") ||
      pathname?.startsWith("/dashboard/products") ||
      pathname?.startsWith("/dashboard/tasks") ||
      pathname?.startsWith("/dashboard/verifications")
  );
  const isAdminActive = !isCrmActive && !isOpsActive;

  const departments: DepartmentItem[] = [
    {
      id: "admin",
      label: "Admin",
      href: "/dashboard",
      icon: Shield,
      isActive: isAdminActive,
      subItems: [
        { label: "Dashboard Overview", href: "/dashboard", icon: LayoutGrid },
        { label: "Team Employees", href: "/dashboard/employees", icon: UserCog },
        { label: "Department Governance", href: "/dashboard/employees/departments", icon: Building2 },
        { label: "System & Settings", href: "/dashboard/settings", icon: Settings },
      ],
    },
    {
      id: "operations",
      label: "Operations",
      href: "/dashboard/orders",
      icon: Briefcase,
      isActive: isOpsActive,
      badge: counts?.tasks || counts?.pendingVerifications ? (counts?.tasks ?? 0) + (counts?.pendingVerifications ?? 0) : null,
      subItems: [
        { label: "Orders & Shipments", href: "/dashboard/orders", icon: Package },
        { label: "Products Catalog", href: "/dashboard/products", icon: ShoppingBag },
        { label: "Internal Tasks", href: "/dashboard/tasks", icon: CheckSquare, badge: counts?.tasks },
        { label: "Seller Verifications", href: "/dashboard/verifications", icon: Building2, badge: counts?.pendingVerifications },
      ],
    },
    {
      id: "crm",
      label: "CRM",
      href: "/dashboard/crm/leads",
      icon: Users,
      isActive: isCrmActive,
      badge: counts?.leads || counts?.onboarding ? (counts?.leads ?? 0) + (counts?.onboarding ?? 0) : null,
      subItems: [
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
      aria-label="Department Navigation"
      className="flex items-center gap-1 rounded-xl border border-neutral-200/90 bg-white/90 p-1 shadow-2xs backdrop-blur-md"
    >
      {departments.map((dept) => {
        const Icon = dept.icon;
        const isMenuOpen = activeDropdown === dept.id;

        return (
          <div key={dept.id} className="relative">
            <div className="flex items-center">
              <Link
                href={dept.href}
                onClick={() => setActiveDropdown(null)}
                className={`group flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold transition-all ${
                  dept.isActive
                    ? "bg-[#1A1A18] text-white shadow-xs"
                    : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                }`}
              >
                <Icon
                  className={`h-3.5 w-3.5 ${
                    dept.isActive ? "text-[#C89D32]" : "text-neutral-400 group-hover:text-neutral-700"
                  }`}
                />
                <span>{dept.label}</span>

                {dept.badge && !dept.isActive ? (
                  <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-100 px-1 font-mono text-[9px] font-bold text-amber-800">
                    {dept.badge}
                  </span>
                ) : null}
              </Link>

              {/* Submenu Trigger Dropdown Caret */}
              <button
                type="button"
                onClick={() => setActiveDropdown(isMenuOpen ? null : dept.id)}
                aria-expanded={isMenuOpen}
                aria-label={`Open ${dept.label} submenu`}
                className={`flex h-7 w-5 items-center justify-center rounded-r-lg text-neutral-400 hover:text-neutral-900 transition-colors ${
                  dept.isActive ? "text-neutral-300 hover:text-white" : ""
                }`}
              >
                <ChevronDown
                  className={`h-3 w-3 transition-transform ${isMenuOpen ? "rotate-180" : ""}`}
                />
              </button>
            </div>

            {/* Submenu Dropdown Popover */}
            {isMenuOpen && (
              <div className="absolute top-full left-0 z-50 mt-1.5 w-56 rounded-xl border border-neutral-200 bg-white p-1.5 shadow-xl ring-1 ring-black/5 animate-in fade-in-0 zoom-in-95">
                <div className="border-b border-neutral-100 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                  {dept.label} Department Modules
                </div>
                <div className="mt-1 space-y-0.5">
                  {dept.subItems.map((sub) => {
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
