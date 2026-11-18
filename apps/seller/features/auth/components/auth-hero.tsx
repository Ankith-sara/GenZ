import { ShieldCheck, Users } from "lucide-react";

type Stage = "rfq" | "production" | "packed" | "dispatched";

const STAGE_LABEL: Record<Stage, string> = {
  rfq: "RFQ received",
  production: "In production",
  packed: "Packed",
  dispatched: "Dispatched",
};

// Sample entries from the clusters GenZ sells from
const DISPATCHES: { cluster: string; goods: string; qty: string; stage: Stage }[] = [
  { cluster: "Tirupur", goods: "Knit polo shirts", qty: "5,000 pcs", stage: "dispatched" },
  { cluster: "Surat", goods: "Synthetic fabric", qty: "12,000 m", stage: "packed" },
  { cluster: "Rajkot", goods: "Auto components", qty: "800 pcs", stage: "production" },
  { cluster: "Channapatna", goods: "Wooden toys", qty: "1,500 pcs", stage: "rfq" },
];

const PROOF_POINTS = [
  { icon: ShieldCheck, text: "GST, MSME, DPIIT, and audit verified" },
  { icon: Users, text: "1,200+ active buyers" },
];

// Safety-tape stripes: the one piece of factory signage on this panel
const HAZARD_TAPE =
  "bg-[repeating-linear-gradient(135deg,#fbbf24_0_10px,transparent_10px_20px)]";

function StageCell({ stage }: { stage: Stage }) {
  const live = stage === "dispatched";
  return (
    <span
      className={`inline-flex items-center gap-2 ${live ? "text-white" : "text-white/60"}`}
    >
      <span
        aria-hidden="true"
        className={`h-2 w-2 shrink-0 rounded-full ${
          live ? "bg-amber-400" : "border border-white/40"
        }`}
      />
      {STAGE_LABEL[stage]}
    </span>
  );
}

export function AuthHero() {
  return (
    // Exactly one viewport tall, never scrolls. Content is compact enough to fit
    // ~560px of CSS height (a 1080p screen at 150% scaling).
    <aside className="hidden h-dvh flex-col justify-between gap-5 overflow-hidden bg-[#111110] p-8 lg:flex">
      {/* Signage strip */}
      <div className="flex items-center gap-4">
        <span className="text-xs font-semibold whitespace-nowrap text-white">
          Verified Manufacturer Network
        </span>
        <span aria-hidden="true" className={`h-2 flex-1 ${HAZARD_TAPE}`} />
      </div>

      {/* Headline + dispatch board */}
      <div className="space-y-5">
        <div className="max-w-xl">
          <p className="text-3xl leading-[1.08] font-extrabold tracking-tight text-balance text-white xl:text-4xl">
            From your factory floor to a verified buyer’s door.
          </p>
          <p className="mt-2 text-sm leading-relaxed text-white/60">
            Quote, confirm, and get paid from one desk, with no platform fee.
          </p>
        </div>

        <div className="w-full max-w-xl overflow-hidden rounded-xl border border-white/15">
          <div className="flex items-center justify-between border-b border-white/15 px-4 py-2.5">
            <p className="text-sm font-semibold text-white">Dispatch board</p>
            <p className="font-mono text-xs text-white/50">Sample entries</p>
          </div>
          <table className="w-full text-left text-sm">
            <caption className="sr-only">
              Sample dispatches from manufacturing clusters
            </caption>
            <thead className="sr-only">
              <tr>
                <th scope="col">Cluster</th>
                <th scope="col" className="hidden xl:table-cell">Goods</th>
                <th scope="col">Quantity</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {DISPATCHES.map(({ cluster, goods, qty, stage }) => (
                <tr
                  key={cluster}
                  className="border-b border-dashed border-white/15 last:border-b-0"
                >
                  <td className="px-4 py-2.5 font-semibold whitespace-nowrap text-white">
                    {cluster}
                  </td>
                  <td className="hidden px-2 py-2.5 text-xs text-white/50 xl:table-cell">
                    {goods}
                  </td>
                  <td className="px-2 py-2.5 text-right font-mono text-xs whitespace-nowrap text-white/80 tabular-nums">
                    {qty}
                  </td>
                  <td className="px-4 py-2.5 text-xs whitespace-nowrap">
                    <StageCell stage={stage} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Proof points: one line, dropped only on very short screens */}
      <ul className="hidden max-w-xl flex-wrap items-center gap-x-6 gap-y-2 border-t border-white/10 pt-4 text-sm text-white/60 [@media(min-height:480px)]:flex">
        {PROOF_POINTS.map(({ icon: Icon, text }) => (
          <li key={text} className="flex items-center gap-2">
            <Icon className="h-4 w-4 shrink-0 text-amber-400" aria-hidden="true" />
            <span>{text}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}