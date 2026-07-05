"use client";

import { useState } from "react";
import type { ElementType } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Building2, FileText, Package, ShieldCheck,
  User, Menu, X, MessageSquare,
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
    { href: "/dashboard/account", label: "Account", icon: User },
  ],
  admin: [
    { href: "/dashboard/admin", label: "Dashboard", icon: LayoutDashboard },
    {
      href: "/dashboard/admin/verifications",
      label: "Verifications",
      icon: ShieldCheck,
    },
    { href: "/dashboard/account", label: "Account", icon: User },
  ],
};

function NavLinks({ role, onNavigate }: { role: Role; onNavigate?: () => void }) {
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
            className={`flex h-11 items-center gap-3 rounded-[4px] px-3 text-sm transition-colors ${
              active
                ? "bg-foreground text-background"
                : "text-foreground hover:bg-border/50"
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function DashboardSidebar({ role }: { role: Role }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile top bar trigger */}
      <div className="border-border flex items-center justify-between border-b p-4 sm:hidden">
        <span className="text-sm tracking-[0.22em] uppercase">GenZ</span>
        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((o) => !o)}
          className="border-border flex h-11 w-11 items-center justify-center rounded-[4px] border"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Desktop sidebar */}
      <aside className="border-border hidden w-60 shrink-0 border-r p-4 sm:block">
        <NavLinks role={role} />
      </aside>

      {/* Mobile slide-over */}
      {open && (
        <div className="border-border border-b p-4 sm:hidden">
          <NavLinks role={role} onNavigate={() => setOpen(false)} />
        </div>
      )}
    </>
  );
}
