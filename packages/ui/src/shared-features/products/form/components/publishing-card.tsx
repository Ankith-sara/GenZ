import React from "react";
import { Globe, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

export interface PublishingCardProps {
  status: "published" | "draft";
  onChangeStatus: (val: "published" | "draft") => void;
}

export function PublishingCard({
  status,
  onChangeStatus,
}: PublishingCardProps) {
  const handleSelect = (val: "published" | "draft") => {
    if (val === status) return;
    onChangeStatus(val);
    if (val === "published") {
      toast.info("Status set to Published", {
        description: "Click Publish Product or Save Changes to push live to storefront.",
      });
    } else {
      toast.info("Status set to Draft", {
        description: "Click Save as Draft to keep this listing hidden from shoppers.",
      });
    }
  };

  return (
    <div id="publishing" className="space-y-4 rounded-xl border border-[#E5E5E0] bg-white p-5 shadow-xs">
      <div className="border-b border-[#E5E5E0] pb-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-[#171717]">
          <Globe className="h-4 w-4 text-[#737373]" />
          <span>Publishing Status</span>
        </h2>
        <p className="mt-0.5 text-xs text-[#737373]">
          Control catalog publication status and live visibility on the marketplace.
        </p>
      </div>

      <div className="space-y-4">
        {/* Hidden status form input */}
        <input type="hidden" name="status" value={status} />

        {/* Status Options */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleSelect("published")}
            className={`flex items-center justify-between rounded-xl border p-3.5 text-left transition-all duration-150 cursor-pointer ${
              status === "published"
                ? "border-emerald-500 bg-emerald-50/70 text-emerald-950 ring-2 ring-emerald-500/20 shadow-xs"
                : "border-[#E5E5E0] bg-white text-[#171717] hover:bg-[#FAF8F5] hover:border-[#D4D4D0]"
            }`}
          >
            <div>
              <span className="font-semibold text-xs flex items-center gap-1.5 text-emerald-700">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Published (Active)
              </span>
              <span className="text-[11px] text-[#737373] mt-0.5 block">
                Visible on storefront to all buyers
              </span>
            </div>
            <Eye className="h-4 w-4 shrink-0 text-emerald-600" />
          </button>

          <button
            type="button"
            onClick={() => handleSelect("draft")}
            className={`flex items-center justify-between rounded-xl border p-3.5 text-left transition-all duration-150 cursor-pointer ${
              status === "draft"
                ? "border-amber-500 bg-amber-50/70 text-amber-950 ring-2 ring-amber-500/20 shadow-xs"
                : "border-[#E5E5E0] bg-white text-[#171717] hover:bg-[#FAF8F5] hover:border-[#D4D4D0]"
            }`}
          >
            <div>
              <span className="font-semibold text-xs flex items-center gap-1.5 text-amber-700">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                Draft (Hidden)
              </span>
              <span className="text-[11px] text-[#737373] mt-0.5 block">
                Saved privately in workshop catalog
              </span>
            </div>
            <EyeOff className="h-4 w-4 shrink-0 text-amber-600" />
          </button>
        </div>
      </div>
    </div>
  );
}
