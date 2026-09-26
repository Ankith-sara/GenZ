"use client";

import { useRef, useState, type ComponentType, type PointerEvent, type ReactNode } from "react";
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
  ChevronDown,
  X,
  LogOut,
  CheckSquare,
  UserCog,
  Target,
  Briefcase,
  ClipboardCheck,
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
    orders?: number;
    waitlist?: number;
    contact?: number;
    tasks?: number;
    contacts?: number;
    leads?: number;
    deals?: number;
    onboarding?: number;
    employees?: number;
  };
  isOpen?: boolean;
  onClose?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

/* ------------------------------------------------------------------ */
/* Material 3 primitives: state-layer ripple + elevation + motion      */
/* ------------------------------------------------------------------ */

type IconType = ComponentType<{ className?: string }>;

interface NavItemData {
  label: string;
  href: string;
  icon: IconType;
  badge?: number | null;
  exact?: boolean;
}

interface RippleItem {
  id: number;
  x: number;
  y: number;
  size: number;
}

// M3 "standard" easing curve, used for every interactive transition below.
const M3_EASE = "ease-[cubic-bezier(0.2,0,0,1)]";
// M3 elevation tokens (level 1 for temporary/modal surfaces, level 2 for menus).
const M3_ELEVATION_1 = "shadow-[0_1px_2px_rgba(0,0,0,0.30),0_1px_3px_1px_rgba(0,0,0,0.15)]";
const M3_ELEVATION_2 = "shadow-[0_1px_2px_rgba(0,0,0,0.30),0_2px_6px_2px_rgba(0,0,0,0.15)]";

function useRipple() {
  const [ripples, setRipples] = useState<RippleItem[]>([]);
  const nextId = useRef(0);

  const addRipple = (event: PointerEvent<HTMLElement>) => {
    const el = event.currentTarget;
    const rect = el.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 1.8;
    const id = nextId.current++;

    setRipples((prev) => [
      ...prev,
      {
        id,
        x: event.clientX - rect.left - size / 2,
        y: event.clientY - rect.top - size / 2,
        size,
      },
    ]);

    window.setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 500);
  };

  return { ripples, addRipple };
}

function RippleLayer({ ripples }: { ripples: RippleItem[] }) {
  if (ripples.length === 0) return null;
  return (
    <>
      {ripples.map((r) => (
        <span
          key={r.id}
          aria-hidden="true"
          className="md-ripple pointer-events-none absolute rounded-full"
          style={{ left: r.x, top: r.y, width: r.size, height: r.size }}
        />
      ))}
    </>
  );
}

function CircularIconButton({
  onClick,
  ariaLabel,
  title,
  className = "",
  children,
}: {
  onClick?: () => void;
  ariaLabel?: string;
  title?: string;
  className?: string;
  children: ReactNode;
}) {
  const { ripples, addRipple } = useRipple();
  return (
    <button
      type="button"
      onClick={onClick}
      onPointerDown={addRipple}
      aria-label={ariaLabel}
      title={title}
      className={`relative isolate overflow-hidden rounded-full transition-colors duration-200 ${M3_EASE} ${className}`}
    >
      <RippleLayer ripples={ripples} />
      <span className="relative z-10 flex items-center justify-center">{children}</span>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Top-level nav item — supports the sidebar's global collapse (icon   */
/* only, with the badge shrinking to a dot, exactly as before)         */
/* ------------------------------------------------------------------ */

function PrimaryNavLink({
  href,
  label,
  icon: Icon,
  active,
  badge,
  collapsed,
}: {
  href: string;
  label: string;
  icon: IconType;
  active: boolean;
  badge?: number | null;
  collapsed?: boolean;
}) {
  const { ripples, addRipple } = useRipple();
  const hasBadge = badge !== null && badge !== undefined && badge > 0;

  return (
    <Link
      href={href}
      title={collapsed ? label : undefined}
      onPointerDown={addRipple}
      className={`font-graphik group relative isolate flex items-center justify-between overflow-hidden rounded-full px-3 py-2.5 text-xs font-semibold transition-colors duration-200 ${M3_EASE} ${
        collapsed ? "justify-center px-0" : ""
      } ${
        active
          ? "bg-[#EBEBE6] font-bold text-black"
          : "text-[#52524E] hover:bg-[#EBEBE6]/60 hover:text-black"
      }`}
    >
      <RippleLayer ripples={ripples} />
      <div className="relative z-10 flex items-center gap-3">
        <Icon className={`h-4 w-4 shrink-0 ${active ? "text-black" : "text-[#52524E] group-hover:text-black"}`} />
        {!collapsed && <span>{label}</span>}
      </div>
      {hasBadge && (
        <span
          className={`relative z-10 rounded-full border border-amber-300 bg-amber-100 font-mono font-bold text-amber-900 ${
            collapsed ? "h-2 w-2 p-0 text-[0px]" : "px-2 py-0.5 text-[10px]"
          }`}
        >
          {!collapsed && badge}
        </span>
      )}
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/* Sub-nav item — used inside the CRM / Operations / Inquiries /       */
/* System groups, in both their collapsed (icon-only) and expanded     */
/* (dense, indented) forms                                             */
/* ------------------------------------------------------------------ */

function SubNavLink({
  href,
  label,
  icon: Icon,
  active,
  badge,
  badgeColor = "neutral",
  collapsed,
}: {
  href: string;
  label: string;
  icon: IconType;
  active: boolean;
  badge?: number | null;
  badgeColor?: "emerald" | "neutral";
  collapsed?: boolean;
}) {
  const { ripples, addRipple } = useRipple();
  const badgeClasses =
    badgeColor === "emerald"
      ? "border-emerald-300 bg-emerald-100 text-emerald-900"
      : "border-neutral-300 bg-neutral-200 text-neutral-800";
  const hasBadge = badge !== null && badge !== undefined && badge > 0;

  if (collapsed) {
    return (
      <Link
        href={href}
        title={label}
        onPointerDown={addRipple}
        className={`font-graphik group relative isolate flex items-center justify-center overflow-hidden rounded-full py-2 text-xs font-semibold transition-colors duration-200 ${M3_EASE} ${
          active
            ? "bg-[#EBEBE6] font-bold text-black"
            : "text-[#52524E] hover:bg-[#EBEBE6]/60 hover:text-black"
        }`}
      >
        <RippleLayer ripples={ripples} />
        <Icon className="relative z-10 h-4 w-4 shrink-0 text-[#52524E] group-hover:text-black" />
      </Link>
    );
  }

  return (
    <Link
      href={href}
      onPointerDown={addRipple}
      className={`font-graphik group relative isolate flex items-center justify-between overflow-hidden rounded-full px-2.5 py-1.5 text-xs font-medium transition-colors duration-200 ${M3_EASE} ${
        active
          ? "bg-[#EBEBE6] font-bold text-black"
          : "text-[#52524E] hover:bg-[#EBEBE6]/60 hover:text-black"
      }`}
    >
      <RippleLayer ripples={ripples} />
      <div className="relative z-10 flex items-center gap-2.5">
        <Icon className={`h-3.5 w-3.5 shrink-0 ${active ? "text-black" : "text-[#73736E] group-hover:text-black"}`} />
        <span>{label}</span>
      </div>
      {hasBadge && (
        <span className={`relative z-10 rounded-full border px-1.5 py-0.2 font-mono text-[9px] font-bold ${badgeClasses}`}>
          {badge}
        </span>
      )}
    </Link>
  );
}

function CollapsedIconGroup({
  items,
  isLinkActive,
}: {
  items: NavItemData[];
  isLinkActive: (href: string, exact?: boolean) => boolean;
}) {
  return (
    <div className="space-y-1 border-t border-[#EBEBE6] pt-2">
      {items.map((item) => (
        <SubNavLink
          key={item.href}
          href={item.href}
          label={item.label}
          icon={item.icon}
          active={isLinkActive(item.href, item.exact)}
          collapsed
        />
      ))}
    </div>
  );
}

function ExpandedSubGroup({
  items,
  isLinkActive,
  badgeColor = "neutral",
}: {
  items: NavItemData[];
  isLinkActive: (href: string, exact?: boolean) => boolean;
  badgeColor?: "emerald" | "neutral";
}) {
  return (
    <div className="ml-3.5 space-y-1 border-l border-[#E5E5E0] pl-2.5 pt-0.5">
      {items.map((item) => (
        <SubNavLink
          key={item.href}
          href={item.href}
          label={item.label}
          icon={item.icon}
          active={isLinkActive(item.href, item.exact)}
          badge={item.badge ?? null}
          badgeColor={badgeColor}
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Expandable section header (CRM & Pipeline / Operations / Inquiries  */
/* / System) — M3 pill container, state-layer ripple, aggregated badge */
/* ------------------------------------------------------------------ */

function SectionHeader({
  icon: Icon,
  label,
  isActive,
  open,
  onToggle,
  badgeCount = 0,
  badgeColor = "neutral",
}: {
  icon: IconType;
  label: string;
  isActive: boolean;
  open: boolean;
  onToggle: () => void;
  badgeCount?: number;
  badgeColor?: "emerald" | "neutral";
}) {
  const { ripples, addRipple } = useRipple();
  const badgeClasses =
    badgeColor === "emerald"
      ? "border-emerald-300 bg-emerald-100 text-emerald-900"
      : "border-neutral-300 bg-neutral-200 text-neutral-800";

  return (
    <button
      type="button"
      onClick={onToggle}
      onPointerDown={addRipple}
      className={`font-graphik group relative isolate flex w-full items-center justify-between overflow-hidden rounded-full px-3 py-2.5 text-xs font-semibold transition-colors duration-200 ${M3_EASE} ${
        isActive
          ? "bg-[#EBEBE6]/80 font-bold text-black"
          : "text-[#52524E] hover:bg-[#EBEBE6]/50 hover:text-black"
      }`}
    >
      <RippleLayer ripples={ripples} />
      <span className="relative z-10 flex items-center gap-3">
        <Icon
          className={`h-4 w-4 shrink-0 transition-colors ${
            isActive ? "text-black" : "text-[#52524E] group-hover:text-black"
          }`}
        />
        <span>{label}</span>
      </span>
      <span className="relative z-10 flex items-center gap-1.5">
        {badgeCount > 0 && !open && (
          <span className={`rounded-full border px-1.5 py-0.2 font-mono text-[9px] font-bold ${badgeClasses}`}>
            {badgeCount}
          </span>
        )}
        <ChevronDown
          className={`h-3.5 w-3.5 text-[#8C8C85] transition-transform duration-200 ${M3_EASE} ${
            open ? "rotate-0" : "-rotate-90"
          }`}
        />
      </span>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Sidebar                                                             */
/* ------------------------------------------------------------------ */

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
  const profileRipple = useRipple();
  const signOutRipple = useRipple();

  // Active route checks
  const isCrmRoute = Boolean(pathname?.startsWith("/dashboard/crm"));
  const isOpsRoute = Boolean(
    pathname?.startsWith("/dashboard/orders") ||
      pathname?.startsWith("/dashboard/products") ||
      pathname?.startsWith("/dashboard/tasks") ||
      pathname?.startsWith("/dashboard/verifications")
  );
  const isInquiriesRoute = Boolean(
    pathname?.startsWith("/dashboard/waitlist") ||
      pathname?.startsWith("/dashboard/contact")
  );
  const isSystemRoute = Boolean(
    pathname?.startsWith("/dashboard/settings") ||
      pathname?.includes("view=analytics") ||
      pathname?.includes("view=logs")
  );

  // Accordion open/close states
  const [crmUserToggled, setCrmUserToggled] = useState<boolean | null>(null);
  const [opsUserToggled, setOpsUserToggled] = useState<boolean | null>(null);
  const [inquiriesUserToggled, setInquiriesUserToggled] = useState<boolean | null>(null);
  const [systemUserToggled, setSystemUserToggled] = useState<boolean | null>(null);

  const crmOpen = crmUserToggled ?? (isCrmRoute || true);
  const opsOpen = opsUserToggled ?? (isOpsRoute || true);
  const inquiriesOpen = inquiriesUserToggled ?? isInquiriesRoute;
  const systemOpen = systemUserToggled ?? isSystemRoute;

  const setCrmOpen = (val: boolean | ((prev: boolean) => boolean)) => {
    setCrmUserToggled((prev) => (typeof val === "function" ? val(prev ?? (isCrmRoute || true)) : val));
  };
  const setOpsOpen = (val: boolean | ((prev: boolean) => boolean)) => {
    setOpsUserToggled((prev) => (typeof val === "function" ? val(prev ?? (isOpsRoute || true)) : val));
  };
  const setInquiriesOpen = (val: boolean | ((prev: boolean) => boolean)) => {
    setInquiriesUserToggled((prev) => (typeof val === "function" ? val(prev ?? isInquiriesRoute) : val));
  };
  const setSystemOpen = (val: boolean | ((prev: boolean) => boolean)) => {
    setSystemUserToggled((prev) => (typeof val === "function" ? val(prev ?? isSystemRoute) : val));
  };

  const mainNav: NavItemData[] = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutGrid, badge: null, exact: true },
    { label: "Employees", href: "/dashboard/employees", icon: UserCog, badge: null, exact: false },
    { label: "Departments", href: "/dashboard/employees/departments", icon: Building2, badge: null, exact: false },
    { label: "Users", href: "/dashboard/users", icon: Users, badge: null, exact: false },
  ];

  const crmNav: NavItemData[] = [
    { label: "Contacts", href: "/dashboard/crm/contacts", icon: Users, badge: counts?.contacts ?? null, exact: false },
    { label: "Leads", href: "/dashboard/crm/leads", icon: Target, badge: counts?.leads ?? null, exact: false },
    { label: "Deals", href: "/dashboard/crm/deals", icon: Briefcase, badge: counts?.deals ?? null, exact: false },
    { label: "Onboarding", href: "/dashboard/crm/onboarding", icon: ClipboardCheck, badge: counts?.onboarding ?? 0, exact: false },
  ];

  const opsNav: NavItemData[] = [
    { label: "Orders", href: "/dashboard/orders", icon: Package, badge: null, exact: false },
    { label: "Products", href: "/dashboard/products", icon: ShoppingBag, badge: null, exact: false },
    { label: "Tasks", href: "/dashboard/tasks", icon: CheckSquare, badge: counts?.tasks ?? 0, exact: false },
    { label: "Verifications", href: "/dashboard/verifications", icon: ShieldCheck, badge: counts?.pendingVerifications ?? 0, exact: false },
  ];

  const inquiriesNav: NavItemData[] = [
    { label: "Waitlist", href: "/dashboard/waitlist", icon: UserCheck, badge: counts?.waitlist ?? 0 },
    { label: "Messages", href: "/dashboard/contact", icon: Mail, badge: counts?.contact ?? 0 },
  ];

  const systemNav: NavItemData[] = [
    { label: "Analytics", href: "/dashboard?view=analytics", icon: BarChart3 },
    { label: "Audit Logs", href: "/dashboard?view=logs", icon: ShieldCheck },
    { label: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  // Aggregated badge counts
  const crmBadgeCount =
    (counts?.contacts ?? 0) + (counts?.leads ?? 0) + (counts?.deals ?? 0) + (counts?.onboarding ?? 0);
  const opsBadgeCount = counts?.tasks ?? 0;
  const inquiriesBadgeCount = (counts?.waitlist ?? 0) + (counts?.contact ?? 0);

  const isLinkActive = (href: string, exact = false) => {
    if (exact) return pathname === href;
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname === href || pathname?.startsWith(`${href}/`);
  };

  return (
    <>
      {/* Material 3 state-layer ripple keyframes (plain <style>, no build-step dependency) */}
      <style>{`
        @keyframes md-ripple-fx {
          to {
            transform: scale(1);
            opacity: 0;
          }
        }
        .md-ripple {
          transform: scale(0);
          background: currentColor;
          opacity: 0.16;
          animation: md-ripple-fx 480ms cubic-bezier(0.2, 0, 0, 1) forwards;
        }
      `}</style>

      {/* Mobile Dark Backdrop (M3 scrim) */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs transition-opacity lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-dvh max-h-dvh flex-col justify-between border-r border-[#E5E5E0] bg-[#FAF8F4] p-3 text-[#1A1A18] transition-all duration-200 ${M3_EASE} select-none lg:sticky lg:top-0 lg:z-auto lg:h-screen lg:max-h-screen lg:shrink-0 ${
          isCollapsed ? "w-[72px]" : "w-[260px]"
        } ${
          isOpen ? `translate-x-0 ${M3_ELEVATION_1}` : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Top Brand Header (Fixed Top) */}
        <div className="flex h-12 shrink-0 items-center justify-between px-2 mb-2">
          <Link
            href="/dashboard"
            className={`flex items-center gap-2.5 ${isCollapsed ? "w-full justify-center" : ""}`}
          >
            <div className="font-graphik flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black text-xs font-bold text-white shadow-2xs">
              GZ
            </div>
            {!isCollapsed && (
              <div>
                <span className="font-graphik block text-sm leading-tight font-bold text-black">
                  GenZ Studio
                </span>
                <span className="font-graphik block text-[10px] text-[#73736E]">Studio Portal</span>
              </div>
            )}
          </Link>

          {/* Mobile close button */}
          {onClose && (
            <CircularIconButton
              onClick={onClose}
              ariaLabel="Close menu"
              className="p-1 text-[#73736E] hover:bg-[#EBEBE6] hover:text-black lg:hidden"
            >
              <X className="h-5 w-5" />
            </CircularIconButton>
          )}

          {/* Desktop collapse toggle */}
          {onToggleCollapse && (
            <CircularIconButton
              onClick={onToggleCollapse}
              title={isCollapsed ? "Expand Sidebar (260px)" : "Collapse Sidebar (72px)"}
              className="hidden p-1 text-[#73736E] hover:bg-[#EBEBE6] hover:text-black lg:block"
            >
              {isCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
            </CircularIconButton>
          )}
        </div>

        {/* Scrollable Middle Navigation Section */}
        <div className="sidebar-scroll flex-1 overflow-y-auto overflow-x-hidden min-h-0 space-y-4 pr-1">
          {/* MAIN SECTION */}
          <div className="space-y-1">
            {!isCollapsed && (
              <p className="font-graphik mb-1.5 px-3 text-[10px] font-bold tracking-widest text-[#8C8C85] uppercase">
                MAIN
              </p>
            )}

            {mainNav.map((item) => (
              <PrimaryNavLink
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
                active={isLinkActive(item.href, item.exact)}
                badge={item.badge}
                collapsed={isCollapsed}
              />
            ))}
          </div>

          {/* CRM & PIPELINE */}
          {isCollapsed ? (
            <CollapsedIconGroup items={crmNav} isLinkActive={isLinkActive} />
          ) : (
            <div className="space-y-1">
              <SectionHeader
                icon={Briefcase}
                label="CRM & Pipeline"
                isActive={isCrmRoute}
                open={crmOpen}
                onToggle={() => setCrmOpen((prev) => !prev)}
                badgeCount={crmBadgeCount}
                badgeColor="emerald"
              />
              {crmOpen && <ExpandedSubGroup items={crmNav} isLinkActive={isLinkActive} badgeColor="emerald" />}
            </div>
          )}

          {/* OPERATIONS */}
          {isCollapsed ? (
            <CollapsedIconGroup items={opsNav} isLinkActive={isLinkActive} />
          ) : (
            <div className="space-y-1">
              <SectionHeader
                icon={CheckSquare}
                label="Operations"
                isActive={isOpsRoute}
                open={opsOpen}
                onToggle={() => setOpsOpen((prev) => !prev)}
                badgeCount={opsBadgeCount}
                badgeColor="neutral"
              />
              {opsOpen && <ExpandedSubGroup items={opsNav} isLinkActive={isLinkActive} badgeColor="neutral" />}
            </div>
          )}

          {/* INQUIRIES */}
          {isCollapsed ? (
            <CollapsedIconGroup items={inquiriesNav} isLinkActive={isLinkActive} />
          ) : (
            <div className="space-y-1">
              <SectionHeader
                icon={Mail}
                label="Inquiries"
                isActive={isInquiriesRoute}
                open={inquiriesOpen}
                onToggle={() => setInquiriesOpen((prev) => !prev)}
                badgeCount={inquiriesBadgeCount}
                badgeColor="neutral"
              />
              {inquiriesOpen && (
                <ExpandedSubGroup items={inquiriesNav} isLinkActive={isLinkActive} badgeColor="neutral" />
              )}
            </div>
          )}

          {/* SYSTEM */}
          {isCollapsed ? (
            <CollapsedIconGroup items={systemNav} isLinkActive={isLinkActive} />
          ) : (
            <div className="space-y-1">
              <SectionHeader
                icon={Settings}
                label="System"
                isActive={isSystemRoute}
                open={systemOpen}
                onToggle={() => setSystemOpen((prev) => !prev)}
              />
              {systemOpen && <ExpandedSubGroup items={systemNav} isLinkActive={isLinkActive} />}
            </div>
          )}
        </div>

        {/* BOTTOM PROFILE SECTION (Fixed Bottom) */}
        <div className="relative shrink-0 border-t border-[#E5E5E0] pt-3 mt-2">
          <button
            type="button"
            onClick={() => setProfileMenuOpen((prev) => !prev)}
            onPointerDown={profileRipple.addRipple}
            className={`font-graphik relative isolate flex w-full cursor-pointer items-center justify-between overflow-hidden rounded-full p-2 transition-colors duration-200 ${M3_EASE} hover:bg-[#EBEBE6] ${
              isCollapsed ? "justify-center" : ""
            }`}
          >
            <RippleLayer ripples={profileRipple.ripples} />
            <div className="relative z-10 flex items-center gap-2.5 overflow-hidden">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#C89D32] font-mono text-xs font-bold text-white shadow-2xs">
                {(adminUser?.full_name || "A")[0].toUpperCase()}
              </div>
              {!isCollapsed && (
                <div className="overflow-hidden text-left">
                  <span className="block truncate text-xs leading-tight font-bold text-black">
                    {adminUser?.full_name || "Admin User"}
                  </span>
                  <span className="block truncate text-[10px] font-medium text-[#73736E]">Studio Manager</span>
                </div>
              )}
            </div>
            {!isCollapsed && (
              <ChevronsUpDown className="relative z-10 h-3.5 w-3.5 shrink-0 text-[#8C8C85]" />
            )}
          </button>

          {/* Profile Dropup Menu */}
          {profileMenuOpen && (
            <div
              className={`animate-in fade-in-90 zoom-in-95 absolute bottom-full left-0 z-50 mb-2 w-full min-w-[200px] overflow-hidden rounded-xl border border-[#E5E5E0] bg-white p-1 ${M3_ELEVATION_2} duration-100`}
            >
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
                  onPointerDown={signOutRipple.addRipple}
                  className={`font-graphik relative isolate flex w-full items-center gap-2 overflow-hidden rounded-lg px-3 py-2 text-xs font-medium text-rose-600 transition-colors duration-200 ${M3_EASE} hover:bg-rose-50`}
                >
                  <RippleLayer ripples={signOutRipple.ripples} />
                  <LogOut className="relative z-10 h-3.5 w-3.5" />
                  <span className="relative z-10">Sign Out</span>
                </button>
              </form>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}