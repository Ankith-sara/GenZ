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
    <div className="relative hidden h-screen w-full overflow-hidden bg-[#111110] lg:block">
      {/* Background Industrial Image */}
      <Image
        src="/machine_work.png"
        alt="Indian Manufacturing Excellence"
        fill
        priority
        className="object-cover object-center opacity-20 transition-transform duration-700 hover:scale-[1.01]"
        sizes="50vw"
      />

      {/* Modern Gradient Mesh Overlay - Warm Charcoal without green */}
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#111110] via-[#111110]/85 to-[#111110]/50" />

      {/* Content Container with balanced vertical distribution */}
      <div className="relative z-20 flex h-full flex-col justify-between p-10 xl:p-14">
        {/* Top Badge */}
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs backdrop-blur-md">
            <span className="h-2 w-2 animate-pulse rounded-full bg-amber-400" />
            <span>Verified Manufacturer Network</span>
          </div>
          <span className="font-mono text-xs font-medium text-white/50">
            Seller Desk
          </span>
        </div>

        {/* Center Features & Metric Cards - perfectly vertically balanced */}
        <div className="my-auto w-full max-w-xl space-y-5">
          {/* Metric Stats Strip */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-3.5 backdrop-blur-md">
              <div className="flex items-center gap-1.5 text-[11px] text-white/60">
                <Users className="h-3.5 w-3.5 text-amber-400" />
                <span>Active Buyers</span>
              </div>
              <p className="mt-1 text-lg font-bold text-white">1,200+</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-3.5 backdrop-blur-md">
              <div className="flex items-center gap-1.5 text-[11px] text-white/60">
                <TrendingUp className="h-3.5 w-3.5 text-amber-400" />
                <span>Zero Markup</span>
              </div>
              <p className="mt-1 text-lg font-bold text-white">₹0 fee</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-3.5 backdrop-blur-md">
              <div className="flex items-center gap-1.5 text-[11px] text-white/60">
                <ShieldCheck className="h-3.5 w-3.5 text-amber-400" />
                <span>Settlements</span>
              </div>
              <p className="mt-1 text-lg font-bold text-white">Instant</p>
            </div>
          </div>

          {/* 3 Seller Desk Feature Cards */}
          <div className="space-y-3">
            {factoryFeatures.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="flex items-start gap-3.5 rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-md transition-all hover:border-white/20 hover:bg-white/[0.1]"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-amber-400">
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
        </div>

        {/* Bottom Social Proof Tagline */}
        <div className="border-t border-white/10 pt-4">
          <p className="text-xs leading-relaxed text-white/50">
            Trusted by verified Indian manufacturing clusters across Tirupur, Surat,
            Ludhiana, Rajkot, and Channapatna.
          </p>
        </div>
      </div>
    </div>
  );
}
