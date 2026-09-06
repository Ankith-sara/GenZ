import { Building2, ShoppingBag, MessageSquare, Users, ShieldCheck } from "lucide-react";

export function AuthHero() {
  const operationalPillars = [
    {
      icon: Building2,
      title: "Supplier Verifications & Compliance",
      desc: "Audit factory onboarding, GST validation, and production capacity inspections.",
    },
    {
      icon: ShoppingBag,
      title: "Product Catalog Moderation",
      desc: "Review and approve B2B listings, wholesale MOQs, and technical specifications.",
    },
    {
      icon: ShoppingBag,
      title: "Orders & Fulfillment Oversight",
      desc: "Monitor direct consumer orders, Cash on Delivery status, and courier tracking.",
    },
    {
      icon: Users,
      title: "Platform User Governance",
      desc: "Enforce role-based access control and account lifecycle across buyers and sellers.",
    },
  ];

  return (
    <div className="relative hidden h-screen w-full flex-col justify-between overflow-hidden bg-[#111110] p-12 text-white lg:flex lg:p-16">
      {/* Background Subtle Accent */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(200,157,50,0.08),transparent_50%)]" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.03),transparent_70%)]" />

      {/* Top Header Badge */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-md">
          <ShieldCheck className="h-3.5 w-3.5 text-[#C89D32]" />
          <span>Platform Operations & Governance</span>
        </div>
        <span className="font-mono text-xs text-white/40">GenZ Core v2.4</span>
      </div>

      {/* Center Operational Overview Cards */}
      <div className="relative z-10 my-auto max-w-xl space-y-6">
        <div>
          <h1 className="font-graphik text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Command Console
          </h1>
          <p className="font-graphik mt-2 text-sm leading-relaxed text-white/70">
            Internal administration hub for monitoring marketplace health, auditing
            manufacturing partners, and maintaining verified commerce standards.
          </p>
        </div>

        {/* 4 Core Management Modules */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {operationalPillars.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="group rounded-xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-md transition-colors hover:border-white/20 hover:bg-white/[0.07]"
              >
                <div className="mb-2.5 flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-[#C89D32]">
                  <Icon className="h-4 w-4" />
                </div>
                <h3 className="font-graphik text-xs font-bold text-white">
                  {item.title}
                </h3>
                <p className="font-graphik mt-1 text-[11px] leading-normal text-white/60">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Compliance & Security Note */}
      <div className="relative z-10 rounded-xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-md">
        <div className="flex items-center justify-between text-xs text-white/60">
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span>Authorized Administrator Access Only</span>
          </span>
          <span className="font-mono text-[10px] text-white/40">
            Audit Stream Active
          </span>
        </div>
      </div>
    </div>
  );
}

