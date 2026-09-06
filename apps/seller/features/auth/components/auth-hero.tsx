 import Image from "next/image";
import { MessageSquare, Package, ShieldCheck } from "lucide-react";

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
      {/* Background Industrial Manufacturing Image */}
      <Image
        src="/machine_work.png"
        alt="Indian Manufacturing Excellence"
        fill
        priority
        className="object-cover object-center opacity-40 transition-transform duration-700 hover:scale-[1.01]"
        sizes="50vw"
      />

      {/* Gradient Overlay for Readability */}
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#111110] via-[#111110]/70 to-[#111110]/40" />

      {/* Content Container */}
      <div className="relative z-20 flex h-full flex-col justify-between p-12 lg:p-16">
        {/* Top Badge */}
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1 text-xs font-semibold text-white backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-[#C89D32]" />
            <span>GenZ Manufacturer & Supplier Network</span>
          </div>
          <span className="font-mono text-xs text-white/50">Factory Desk</span>
        </div>

        {/* Center / Bottom Features & Copy */}
        <div className="mt-auto max-w-xl space-y-6">
          <div>
            <h1 className="font-graphik text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Powering Direct Factory Commerce
            </h1>
            <p className="font-graphik mt-2.5 text-sm leading-relaxed text-white/80">
              Connect directly with verified corporate and institutional buyers without
              intermediary markups, opaque sourcing, or delayed settlements.
            </p>
          </div>

          {/* 3 Real Factory Desk Feature Cards */}
          <div className="space-y-2.5">
            {factoryFeatures.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="flex items-start gap-3.5 rounded-xl border border-white/10 bg-white/[0.06] p-3.5 backdrop-blur-md transition-colors hover:border-white/20 hover:bg-white/[0.1]"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-[#C89D32]">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-graphik text-xs font-bold text-white">
                      {item.title}
                    </h3>
                    <p className="font-graphik mt-0.5 text-[11px] leading-relaxed text-white/70">
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Social Proof Tagline */}
          <div className="pt-2">
            <p className="font-graphik text-xs text-white/50">
              Trusted by 1,200+ verified Indian manufacturing facilities across Tirupur, Surat, Ludhiana, and Rajkot.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

