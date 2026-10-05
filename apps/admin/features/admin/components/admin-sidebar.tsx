"use client";

import { useEffect, useRef, useState, type ComponentType } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  Building2,
  Users,
  ShoppingBag,
  Package,
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
  CheckSquare,
  UserCog,
  Target,
  Briefcase,
  ClipboardCheck,
  FileBarChart,
  Shield,
  Landmark,
  Receipt,
  Scale,
} from "lucide-react";
import { signOut } from "@/app/login/actions";

export type AdminModule = "admin" | "operations" | "crm" | "finance";

interface AdminSidebarProps {
  adminUser?: { full_name?: string | null; email?: string | null };
  counts?: {
    users?: number;
    pendingVerifications?: number;
    products?: number;
    orders?: number;
    waitlist?: number;
    contact?: number;
    tasks?: number;
    contacts?: number;
    leads?: number;
    deals?: number;
    onboarding?: number;
    employees?: number;
    pendingSettlements?: number;
  };
  isOpen?: boolean;
  onClose?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  activeModule?: AdminModule;
}

type IconType = ComponentType<{ className?: string }>;
type NavItem = {
  label: string;
  href: string;
  icon: IconType;
  badge?: number | null;
  /** "attention" = needs action (amber pill), "plain" = just a count */
  tone?: "attention" | "plain";
  exact?: boolean;
};
type NavSection = { title: string; items: NavItem[] };
type ModuleConfig = {
  title: string;
  subtitle: string;
  icon: IconType;
  /** Tonal colours for the module card */
  card: string;
  iconBox: string;
  sections: NavSection[];
};

/* M3 state layer: hover 8%, pressed 12%, painted with a pseudo-element so it works on any background */
const STATE_LAYER =
  "relative isolate overflow-hidden before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:bg-current before:opacity-0 before:transition-opacity before:duration-200 hover:before:opacity-[0.08] focus-visible:before:opacity-[0.12] active:before:opacity-[0.12]";
const FOCUS_RING =
  "focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none";

function buildModules(
  c: NonNullable<AdminSidebarProps["counts"]>
): Record<AdminModule, ModuleConfig> {
  return {
    crm: {
      title: "Artisan CRM",
      subtitle: "Sourcing & pipeline hub",
      icon: Users,
      card: "bg-emerald-50 text-emerald-950",
      iconBox: "bg-emerald-700 text-white",
      sections: [
        {
          title: "Pipeline & sourcing",
          items: [
            {
              label: "CRM Overview",
              href: "/dashboard/crm",
              icon: LayoutGrid,
              exact: true,
            },
            {
              label: "Artisan Contacts",
              href: "/dashboard/crm/contacts",
              icon: Users,
              badge: c.contacts,
            },
            {
              label: "Sourcing Leads",
              href: "/dashboard/crm/leads",
              icon: Target,
              badge: c.leads,
            },
            {
              label: "Pipeline Deals",
              href: "/dashboard/crm/deals",
              icon: Briefcase,
              badge: c.deals,
            },
            {
              label: "Seller Onboarding",
              href: "/dashboard/crm/onboarding",
              icon: ClipboardCheck,
              badge: c.onboarding,
              tone: "attention",
            },
          ],
        },
        {
          title: "Reports & config",
          items: [
            {
              label: "CRM Reports",
              href: "/dashboard/reports?module=crm",
              icon: FileBarChart,
            },
            { label: "CRM Settings", href: "/dashboard/crm/settings", icon: Settings },
          ],
        },
      ],
    },
    operations: {
      title: "Operations Hub",
      subtitle: "Orders, catalog & KYC",
      icon: Briefcase,
      card: "bg-blue-50 text-blue-950",
      iconBox: "bg-blue-700 text-white",
      sections: [
        {
          title: "Operations & catalog",
          items: [
            {
              label: "Operations Hub",
              href: "/dashboard/operations",
              icon: LayoutGrid,
              exact: true,
            },
            {
              label: "Orders & Shipping",
              href: "/dashboard/orders",
              icon: Package,
              badge: c.orders,
            },
            {
              label: "Products Catalog",
              href: "/dashboard/products",
              icon: ShoppingBag,
              badge: c.products,
            },
            {
              label: "Tasks",
              href: "/dashboard/tasks",
              icon: CheckSquare,
              badge: c.tasks,
              tone: "attention",
            },
            {
              label: "Verifications (KYC)",
              href: "/dashboard/verifications",
              icon: ShieldCheck,
              badge: c.pendingVerifications,
              tone: "attention",
            },
          ],
        },
        {
          title: "Reports & config",
          items: [
            {
              label: "Operations Reports",
              href: "/dashboard/reports?module=operations",
              icon: FileBarChart,
            },
            {
              label: "Operations Settings",
              href: "/dashboard/operations/settings",
              icon: Settings,
            },
          ],
        },
      ],
    },
    admin: {
      title: "Platform Admin",
      subtitle: "Governance & employees",
      icon: Shield,
      card: "bg-[#EFEDE6] text-[#1A1A18]",
      iconBox: "bg-[#1A1A18] text-amber-400",
      sections: [
        {
          title: "Organization",
          items: [
            {
              label: "Executive Dashboard",
              href: "/dashboard",
              icon: LayoutGrid,
              exact: true,
            },
            { label: "Team Employees", href: "/dashboard/employees", icon: UserCog },
            {
              label: "Departments",
              href: "/dashboard/employees/departments",
              icon: Building2,
            },
            {
              label: "User Profiles",
              href: "/dashboard/users",
              icon: Users,
              badge: c.users,
            },
          ],
        },
        {
          title: "Inquiries",
          items: [
            {
              label: "Waitlist Signups",
              href: "/dashboard/waitlist",
              icon: UserCheck,
              badge: c.waitlist,
            },
            {
              label: "Contact Inquiries",
              href: "/dashboard/contact",
              icon: Mail,
              badge: c.contact,
            },
          ],
        },
        {
          title: "Governance & system",
          items: [
            {
              label: "Platform Analytics",
              href: "/dashboard?view=analytics",
              icon: BarChart3,
            },
            { label: "Audit Logs", href: "/dashboard?view=logs", icon: ShieldCheck },
            { label: "Platform Settings", href: "/dashboard/settings", icon: Settings },
            { label: "Roles & Permissions", href: "/dashboard/roles", icon: Shield },
          ],
        },
      ],
    },
    finance: {
      title: "Finance & ECO Core",
      subtitle: "Settlements, Ledger & GST",
      icon: Landmark,
      card: "bg-amber-50 text-amber-950",
      iconBox: "bg-amber-700 text-white",
      sections: [
        {
          title: "Ledger & Settlements",
          items: [
            {
              label: "Finance Overview",
              href: "/dashboard/finance",
              icon: LayoutGrid,
              exact: true,
            },
            {
              label: "Seller Settlements",
              href: "/dashboard/finance?tab=settlements",
              icon: Building2,
              badge: c.pendingSettlements,
              tone: "attention",
            },
            {
              label: "Commission Invoices",
              href: "/dashboard/finance?tab=commissions",
              icon: FileBarChart,
            },
            {
              label: "General Ledger",
              href: "/dashboard/finance?tab=ledger",
              icon: Scale,
            },
            {
              label: "5-Way Reconciliation",
              href: "/dashboard/finance?tab=reconciliation",
              icon: ShieldCheck,
            },
          ],
        },
        {
          title: "Compliance & Audit",
          items: [
            {
              label: "Statutory GST & TDS",
              href: "/dashboard/finance?tab=statutory",
              icon: Receipt,
            },
            {
              label: "Trial Balance Audit",
              href: "/dashboard/finance?tab=ledger",
              icon: CheckSquare,
            },
          ],
        },
      ],
    },
  };
}

/* ─── Nav item ─── */
function NavLink({
  item,
  active,
  collapsed,
  onNavigate,
}: {
  item: NavItem;
  active: boolean;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const Icon = item.icon;
  const count = typeof item.badge === "number" && item.badge > 0 ? item.badge : null;
  const tone = active
    ? "bg-secondary-container text-on-secondary-container"
    : "text-on-surface-variant hover:text-on-surface";

  if (collapsed) {
    return (
      <Link
        href={item.href}
        onClick={onNavigate}
        title={count ? `${item.label} (${count})` : item.label}
        aria-label={item.label}
        aria-current={active ? "page" : undefined}
        className={`${STATE_LAYER} ${FOCUS_RING} mx-auto flex h-12 w-12 items-center justify-center rounded-2xl transition-colors ${tone}`}
      >
        <Icon className="h-5 w-5" />
        {count && item.tone === "attention" && (
          <span className="bg-warning ring-surface-container-lowest absolute top-2 right-2 h-2 w-2 rounded-full ring-2" />
        )}
      </Link>
    );
  }

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={`${STATE_LAYER} ${FOCUS_RING} flex h-12 items-center gap-3 rounded-full pr-4 pl-4 text-sm transition-colors ${tone} ${active ? "font-semibold" : "font-medium"}`}
    >
      <Icon className="h-5 w-5 shrink-0" />
      <span className="flex-1 truncate">{item.label}</span>
      {count !== null && (
        <span
          className={`min-w-6 rounded-full px-2 py-0.5 text-center text-xs font-semibold tabular-nums ${
            item.tone === "attention"
              ? "bg-warning-container text-on-warning-container"
              : active
                ? ""
                : "text-on-surface-variant"
          }`}
        >
          {count}
        </span>
      )}
    </Link>
  );
}

/* MAIN */
export function AdminSidebar({
  adminUser,
  counts = {},
  isOpen = false,
  onClose,
  isCollapsed = false,
  onToggleCollapse,
  activeModule: propModule,
}: AdminSidebarProps) {
  const pathname = usePathname() ?? "";
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const down = (e: MouseEvent) =>
      !menuRef.current?.contains(e.target as Node) && setMenuOpen(false);
    const key = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    document.addEventListener("mousedown", down);
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("mousedown", down);
      document.removeEventListener("keydown", key);
    };
  }, [menuOpen]);

  const currentModule: AdminModule =
    propModule ??
    (pathname.startsWith("/dashboard/crm")
      ? "crm"
      : pathname.startsWith("/dashboard/finance")
        ? "finance"
        : ["operations", "orders", "products", "tasks", "verifications"].some((p) =>
              pathname.startsWith(`/dashboard/${p}`)
            )
          ? "operations"
          : "admin");

  const mod = buildModules(counts)[currentModule];
  const ModIcon = mod.icon;

  /* Pick ONE active item: the most specific match, so "Team Employees" doesn't light up on /employees/departments */
  const matches = (it: NavItem) => {
    const [path, query] = it.href.split("?");
    if (query)
      return (
        pathname === path &&
        typeof window !== "undefined" &&
        window.location.search.includes(query)
      );
    if (it.exact || it.href === "/dashboard") return pathname === it.href;
    return pathname === it.href || pathname.startsWith(`${it.href}/`);
  };
  const activeHref = mod.sections
    .flatMap((s) => s.items)
    .filter(matches)
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;

  const name = adminUser?.full_name || "Admin User";

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        aria-label="Main navigation"
        className={`border-outline-variant/50 text-on-surface fixed inset-y-0 left-0 z-50 flex h-dvh flex-col border-r bg-[#FAF8F4] transition-[width,transform] duration-300 ease-[cubic-bezier(0.2,0,0,1)] select-none lg:sticky lg:top-0 lg:z-auto lg:h-screen lg:shrink-0 ${
          isCollapsed ? "w-[80px] px-3" : "w-[280px] px-3"
        } ${isOpen ? "shadow-elevation-2 translate-x-0 rounded-r-3xl lg:rounded-none" : "-translate-x-full lg:translate-x-0"}`}
      >
        {/* Brand row */}
        <div
          className={`flex h-16 shrink-0 items-center ${isCollapsed ? "justify-center" : "justify-between pl-2"}`}
        >
          {!isCollapsed && (
            <Link
              href="/dashboard"
              className={`${FOCUS_RING} flex items-center gap-3 rounded-full`}
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-sm font-bold text-white">
                GZ
              </span>
              <span className="leading-tight">
                <span className="block text-base font-semibold">GenZ Studio</span>
                <span className="text-on-surface-variant block text-xs">
                  Studio Portal
                </span>
              </span>
            </Link>
          )}
          {onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              className={`${STATE_LAYER} ${FOCUS_RING} text-on-surface-variant hidden h-10 w-10 items-center justify-center rounded-full lg:flex`}
            >
              {isCollapsed ? (
                <PanelLeftOpen className="h-5 w-5" />
              ) : (
                <PanelLeftClose className="h-5 w-5" />
              )}
            </button>
          )}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close menu"
              className={`${STATE_LAYER} ${FOCUS_RING} text-on-surface-variant flex h-10 w-10 items-center justify-center rounded-full lg:hidden`}
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Module card (pinned, does not scroll away) */}
        <div className={`shrink-0 pb-2 ${isCollapsed ? "flex justify-center" : ""}`}>
          {isCollapsed ? (
            <span
              title={mod.title}
              className={`flex h-12 w-12 items-center justify-center rounded-2xl ${mod.iconBox}`}
            >
              <ModIcon className="h-5 w-5" />
            </span>
          ) : (
            <div className={`flex items-center gap-3 rounded-2xl p-3 ${mod.card}`}>
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${mod.iconBox}`}
              >
                <ModIcon className="h-5 w-5" />
              </span>
              <div className="min-w-0 leading-tight">
                <p className="truncate text-sm font-semibold">{mod.title}</p>
                <p className="truncate text-xs opacity-75">{mod.subtitle}</p>
              </div>
            </div>
          )}
        </div>

        {/* Scrollable navigation */}
        <nav className="sidebar-scroll min-h-0 flex-1 [scrollbar-width:thin] space-y-1 overflow-x-hidden overflow-y-auto pb-2">
          {mod.sections.map((section, i) => (
            <div
              key={section.title}
              className={i > 0 ? "border-outline-variant/50 mt-2 border-t pt-2" : ""}
            >
              {!isCollapsed && (
                <p className="text-on-surface-variant px-4 pt-2 pb-1.5 text-xs font-medium tracking-wide">
                  {section.title}
                </p>
              )}
              <div className="space-y-0.5">
                {section.items.map((item) => (
                  <NavLink
                    key={item.href}
                    item={item}
                    active={item.href === activeHref}
                    collapsed={isCollapsed}
                    onNavigate={onClose}
                  />
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Profile (pinned) */}
        <div
          ref={menuRef}
          className="border-outline-variant/50 relative shrink-0 border-t py-3"
        >
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            className={`${STATE_LAYER} ${FOCUS_RING} flex w-full cursor-pointer items-center gap-3 rounded-full p-2 text-left ${isCollapsed ? "justify-center" : ""}`}
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#C89D32] text-sm font-bold text-white">
              {name[0].toUpperCase()}
            </span>
            {!isCollapsed && (
              <>
                <span className="min-w-0 flex-1 leading-tight">
                  <span className="block truncate text-sm font-semibold">{name}</span>
                  <span className="text-on-surface-variant block truncate text-xs">
                    Studio Manager
                  </span>
                </span>
                <ChevronsUpDown className="text-on-surface-variant mr-1 h-4 w-4 shrink-0" />
              </>
            )}
          </button>

          {menuOpen && (
            <div
              role="menu"
              className={`bg-surface-container-lowest shadow-elevation-2 absolute bottom-full z-50 mb-2 overflow-hidden rounded-2xl py-2 ${
                isCollapsed ? "left-0 w-64" : "inset-x-0"
              }`}
            >
              <div className="px-4 pt-1 pb-3">
                <p className="truncate text-sm font-semibold">{name}</p>
                <p className="text-on-surface-variant truncate text-xs">
                  {adminUser?.email || "admin@genz.in"}
                </p>
              </div>
              <form
                action={signOut}
                className="border-outline-variant/50 border-t pt-1"
              >
                <button
                  type="submit"
                  role="menuitem"
                  className={`${STATE_LAYER} ${FOCUS_RING} flex h-12 w-full cursor-pointer items-center gap-3 px-4 text-sm font-medium text-[#ef4444]`}
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </form>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
