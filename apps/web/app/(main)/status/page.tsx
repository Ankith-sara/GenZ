import Link from "next/link";
import { CheckCircle2, ShieldCheck, Server, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "System Status | GenZ Marketplace",
  description: "Live operational status of GenZ systems, services, and APIs.",
};

export default function StatusPage() {
  const services = [
    { name: "Storefront & Catalog API", status: "Operational", uptime: "99.98%" },
    { name: "UPI QR Payment Gateway", status: "Operational", uptime: "100%" },
    {
      name: "Artisan Dashboard & Studio Portal",
      status: "Operational",
      uptime: "99.95%",
    },
    {
      name: "Order Tracking & Logistics Dispatch",
      status: "Operational",
      uptime: "99.90%",
    },
    {
      name: "Authentication & Seller KYC Service",
      status: "Operational",
      uptime: "99.99%",
    },
  ];

  return (
    <main className="min-h-screen flex-1 bg-[#FAF7F0] pb-24 font-sans text-[#1A1A18] antialiased">
      <div className="relative overflow-hidden border-b border-neutral-800 bg-black px-4 py-12 text-white sm:px-6 sm:py-16 md:px-12">
        <div className="relative z-10 mx-auto max-w-4xl text-left">
          <Link
            href="/"
            className="mb-4 inline-flex items-center gap-1.5 text-xs font-medium text-neutral-400 hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Home</span>
          </Link>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-400">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
            <span>All Systems Operational</span>
          </div>
          <h1 className="font-nantes text-3xl font-normal tracking-tight sm:text-5xl">
            System Status
          </h1>
          <p className="mt-2 max-w-xl text-xs text-neutral-400 sm:text-sm">
            Real-time health and uptime monitoring for the GenZ artisan direct
            manufacturing network.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl space-y-6 px-4 py-10 sm:px-6 md:px-12">
        <div className="divide-y divide-[#E5E5E0] rounded-2xl border border-[#E5E5E0] bg-white p-6 shadow-xs">
          {services.map((svc) => (
            <div
              key={svc.name}
              className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
            >
              <div className="flex items-center gap-3">
                <Server className="h-5 w-5 text-neutral-500" />
                <div>
                  <h3 className="text-sm font-semibold text-[#1A1A18]">{svc.name}</h3>
                  <p className="text-xs text-[#73736E]">30-Day Uptime: {svc.uptime}</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                <span>{svc.status}</span>
              </span>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-[#E5E5E0] bg-white p-5 text-xs text-[#52524E] shadow-xs">
          <ShieldCheck className="h-5 w-5 shrink-0 text-amber-600" />
          <span>
            Automated health checks run every 60 seconds across all regions. If you
            encounter any unexpected disruptions, please contact our support team.
          </span>
        </div>
      </div>
    </main>
  );
}
