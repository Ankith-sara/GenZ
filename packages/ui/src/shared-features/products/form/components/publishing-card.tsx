import React from "react";
import { Globe, Eye, EyeOff } from "lucide-react";

export interface PublishingCardProps {
  status: "published" | "draft";
  onChangeStatus: (val: "published" | "draft") => void;
}

export function PublishingCard({
  status,
  onChangeStatus,
}: PublishingCardProps) {
  return (
    <div id="publishing" className="space-y-4 rounded-xl border border-[#E5E5E5] bg-white p-5 shadow-xs">
      <div className="border-b border-[#E5E5E5] pb-3">
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
            onClick={() => onChangeStatus("published")}
            className={`flex items-center justify-between rounded-lg border p-3 text-left transition-all ${
              status === "published"
                ? "border-[#10B981] bg-[#ECFDF5] text-[#047857]"
                : "border-[#E5E5E5] bg-white text-[#171717] hover:bg-[#FAFAF9]"
            }`}
          >
            <div>
              <span className="font-semibold text-xs block">● Published (Active)</span>
              <span className="text-[10px] opacity-80">Visible on storefront immediately</span>
            </div>
            <Eye className="h-4 w-4 shrink-0" />
          </button>

          <button
            type="button"
            onClick={() => onChangeStatus("draft")}
            className={`flex items-center justify-between rounded-lg border p-3 text-left transition-all ${
              status === "draft"
                ? "border-[#FCD34D] bg-[#FFFBEB] text-[#B45309]"
                : "border-[#E5E5E5] bg-white text-[#171717] hover:bg-[#FAFAF9]"
            }`}
          >
            <div>
              <span className="font-semibold text-xs block">○ Draft (Hidden)</span>
              <span className="text-[10px] opacity-80">Saved privately in workshop catalog</span>
            </div>
            <EyeOff className="h-4 w-4 shrink-0" />
          </button>
        </div>
      </div>
    </div>
  );
}
