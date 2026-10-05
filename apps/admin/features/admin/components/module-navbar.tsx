"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, Briefcase, Users, Landmark } from "lucide-react";

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
    pendingSettlements?: number;
  };
}

export function ModuleNavbar({ counts }: ModuleNavbarProps) {
  const pathname = usePathname();

  // Determine active module
  const isFinanceActive = Boolean(pathname?.startsWith("/dashboard/finance"));
  const isCrmActive = Boolean(pathname?.startsWith("/dashboard/crm"));
  const isOpsActive = Boolean(
    pathname?.startsWith("/dashboard/operations") ||
    pathname?.startsWith("/dashboard/orders") ||
    pathname?.startsWith("/dashboard/products") ||
    pathname?.startsWith("/dashboard/tasks") ||
    pathname?.startsWith("/dashboard/verifications")
  );
  const isAdminActive = !isCrmActive && !isOpsActive && !isFinanceActive;

  const opsBadge = (counts?.tasks ?? 0) + (counts?.pendingVerifications ?? 0);
  const crmBadge = (counts?.leads ?? 0) + (counts?.onboarding ?? 0);

  const modules = [
    {
      id: "admin",
      label: "Admin",
      href: "/dashboard",
      icon: Shield,
      isActive: isAdminActive,
      badge: null,
      activeColor: "text-amber-400",
    },
    {
      id: "finance",
      label: "Finance",
      href: "/dashboard/finance",
      icon: Landmark,
      isActive: isFinanceActive,
      badge: (counts?.pendingSettlements ?? 0) > 0 ? counts?.pendingSettlements : null,
      activeColor: "text-amber-400",
    },
    {
      id: "operations",
      label: "Operations",
      href: "/dashboard/operations",
      icon: Briefcase,
      isActive: isOpsActive,
      badge: opsBadge > 0 ? opsBadge : null,
      activeColor: "text-blue-400",
    },
    {
      id: "crm",
      label: "CRM",
      href: "/dashboard/crm",
      icon: Users,
      isActive: isCrmActive,
      badge: crmBadge > 0 ? crmBadge : null,
      activeColor: "text-emerald-400",
    },
  ];

  return (
    <nav
      aria-label="Modular Platform Navigation"
      className="inline-flex items-center gap-1 rounded-xl border border-[#E5E5E0] bg-white p-1 shadow-2xs backdrop-blur-md"
    >
      {modules.map((mod) => {
        const Icon = mod.icon;

        return (
          <Link
            key={mod.id}
            href={mod.href}
            className={`group relative flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-bold transition-all duration-150 ${
              mod.isActive
                ? "bg-[#1A1A18] text-white shadow-xs"
                : "text-[#52524E] hover:bg-[#FAF8F4] hover:text-[#1A1A18]"
            }`}
          >
            <Icon
              className={`h-3.5 w-3.5 transition-colors ${
                mod.isActive
                  ? mod.activeColor
                  : "text-[#8C8C85] group-hover:text-[#1A1A18]"
              }`}
            />
            <span className="font-graphik">{mod.label}</span>

            {mod.badge ? (
              <span
                className={`flex h-4 min-w-4 items-center justify-center rounded-full px-1.5 font-mono text-[9px] font-bold ${
                  mod.isActive
                    ? "bg-amber-400 text-black"
                    : "border border-amber-200 bg-amber-100 text-amber-900"
                }`}
              >
                {mod.badge}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
