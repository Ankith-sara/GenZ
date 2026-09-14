import Image from "next/image";
import { MessageSquare, Package, ShieldCheck, TrendingUp, Users } from "lucide-react";

export function AuthHero() {
  const factoryFeatures = [
    {
      icon: MessageSquare,
      title: "Direct Buyer RFQs",
      desc: "Receive and negotiate bulk purchase requests directly from verified buyers.",
    },
    {
      icon: Package,
      title: "Catalog & MOQ Management",
      desc: "Publish your product lines, production lead times, and tiered wholesale pricing.",
    },
    {
      icon: ShieldCheck,
      title: "Compliance & Document Vault",
      desc: "Fast-track trust with verified GST, MSME, DPIIT, and factory audit credentials.",
    },
  ];

  return (
    <div className="relative hidden h-screen w-full overflow-hidden bg-neutral-950 lg:block">
      {/* Background Industrial Image */}
      <Image
        src="/machine_work.png"
        alt="Indian Manufacturing Excellence"
        fill
        priority
        className="object-cover object-center opacity-25 transition-transform duration-700 hover:scale-[1.01]"
        sizes="50vw"
      />

      {/* Modern Gradient Mesh Overlay */}
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-neutral-950 via-neutral-950/80 to-neutral-950/40" />

      {/* Ambient Glows */}
      <div className="pointer-events-none absolute top-1/4 right-1/4 z-10 h-72 w-72 rounded-full bg-amber-500/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-1/3 left-1/4 z-10 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />

      {/* Content Container */}
      <div className="relative z-20 flex h-full flex-col justify-between p-12 xl:p-16">
        {/* Top Badge */}
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs backdrop-blur-md">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
            <span>Verified Manufacturer Network</span>
          </div>
          <span className="font-mono text-xs font-medium text-white/50">
            Seller Desk
          </span>
        </div>

        {/* Center / Bottom Features & Copy */}
        <div className="mt-auto max-w-xl space-y-6">
          <div>
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 px-3 py-1 text-[11px] font-bold text-amber-300 backdrop-blur-xs">
              <span>B2B Direct Factory Commerce</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Powering Direct Factory Commerce
            </h1>
            <p className="mt-2.5 text-sm leading-relaxed text-white/80">
              Connect directly with verified corporate and institutional buyers without
              intermediary markups, opaque sourcing, or settlement delays.
            </p>
          </div>

          {/* Metric Stats Strip */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-3 backdrop-blur-md">
              <div className="flex items-center gap-1.5 text-[11px] text-white/60">
                <Users className="h-3.5 w-3.5 text-emerald-400" />
                <span>Active Units</span>
              </div>
              <p className="mt-1 text-lg font-bold text-white">1,200+</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-3 backdrop-blur-md">
              <div className="flex items-center gap-1.5 text-[11px] text-white/60">
                <TrendingUp className="h-3.5 w-3.5 text-amber-400" />
                <span>Zero Markup</span>
              </div>
              <p className="mt-1 text-lg font-bold text-white">₹0 Fee</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-3 backdrop-blur-md">
              <div className="flex items-center gap-1.5 text-[11px] text-white/60">
                <ShieldCheck className="h-3.5 w-3.5 text-blue-400" />
                <span>Settlements</span>
              </div>
              <p className="mt-1 text-lg font-bold text-white">Instant</p>
            </div>
          </div>

          {/* 3 Seller Desk Feature Cards */}
          <div className="space-y-2.5">
            {factoryFeatures.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="flex items-start gap-3.5 rounded-2xl border border-white/10 bg-white/[0.06] p-3.5 backdrop-blur-md transition-all hover:border-white/20 hover:bg-white/[0.1]"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/10 text-amber-400">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white">{item.title}</h3>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-white/70">
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Social Proof Tagline */}
          <div className="border-t border-white/10 pt-2">
            <p className="text-xs text-white/50">
              Trusted by verified Indian manufacturing clusters across Tirupur, Surat,
              Ludhiana, Rajkot, and Channapatna.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
