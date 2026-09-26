"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, Target, Briefcase, ClipboardCheck } from "lucide-react";

interface CRMNavHeaderProps {
  title: string;
  eyebrow?: string;
  description: string;
  actions?: React.ReactNode;
  counts?: {
    contacts?: number;
    leads?: number;
    deals?: number;
    onboardings?: number;
  };
}

export function CRMNavHeader({
  title,
  eyebrow = "Seller CRM & Pipeline",
  description,
  actions,
  counts,
}: CRMNavHeaderProps) {
  const pathname = usePathname();

  const steps = [
    {
      id: "contacts",
      number: "1",
      label: "Contacts",
      href: "/dashboard/crm/contacts",
      icon: Users,
      count: counts?.contacts,
      subtext: "Raw seller directory & scouting",
      active: pathname === "/dashboard/crm/contacts" || pathname === "/dashboard/crm",
    },
    {
      id: "leads",
      number: "2",
      label: "Qualified Leads",
      href: "/dashboard/crm/leads",
      icon: Target,
      count: counts?.leads,
      subtext: "Pipeline evaluation & scoring",
      active: pathname === "/dashboard/crm/leads",
    },
    {
      id: "deals",
      number: "3",
      label: "Deals",
      href: "/dashboard/crm/deals",
      icon: Briefcase,
      count: counts?.deals,
      subtext: "Commercial terms & contracts",
      active: pathname === "/dashboard/crm/deals",
    },
    {
      id: "onboarding",
      number: "4",
      label: "Onboarding Process",
      href: "/dashboard/crm/onboarding",
      icon: ClipboardCheck,
      count: counts?.onboardings,
      subtext: "Operational fulfillment & go-live",
      active: pathname === "/dashboard/crm/onboarding",
    },
  ];

  return (
    <div className="space-y-3.5">
      {/* Top Banner with Title, Eyebrow & Actions */}
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div>
          {eyebrow && (
            <p className="text-[10px] font-bold tracking-widest text-[#8C8C85] uppercase">
              {eyebrow}
            </p>
          )}
          <h2 className="mt-0.5 text-2xl font-bold tracking-tight text-[#1A1A18]">
            {title}
          </h2>
          <p className="mt-0.5 text-xs text-[#73736E] max-w-2xl">
            {description}
          </p>
        </div>

        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </div>

      {/* 4-Step Interactive Pipeline Funnel */}
      <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <Link
              key={step.id}
              href={step.href}
              className={`flex flex-col justify-between rounded-xl border p-3 sm:p-3.5 transition-all ${
                step.active
                  ? "border-black bg-white shadow-xs ring-1 ring-black/10"
                  : "border-[#E5E5E0] bg-white/70 hover:bg-white hover:border-[#1A1A18]/20"
              }`}
            >
              <div className="flex items-center justify-between text-[#73736E]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#1A1A18]">
                  {step.number}. {step.label}
                </span>
                <Icon
                  className={`h-3.5 w-3.5 ${
                    step.active ? "text-black" : "text-[#8C8C85]"
                  }`}
                />
              </div>

              <div className="mt-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-xl sm:text-2xl font-bold text-[#1A1A18]">
                    {step.count ?? 0}
                  </span>
                  {step.active && (
                    <span className="text-[10px] font-semibold text-[#1A1A18] bg-[#FAF8F4] px-2 py-0.5 rounded-full border border-[#E5E5E0]">
                      Active View
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[#73736E] mt-0.5 line-clamp-1">
                  {step.subtext}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
