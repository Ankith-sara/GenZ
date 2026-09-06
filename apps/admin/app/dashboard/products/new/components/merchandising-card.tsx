import React from "react";
import { Sparkles, Award, Flame, Tag } from "lucide-react";

interface MerchandisingCardProps {
  isFeatured: boolean;
  onToggleFeatured: (val: boolean) => void;
  isNewArrival: boolean;
  onToggleNewArrival: (val: boolean) => void;
  isBestSeller: boolean;
  onToggleBestSeller: (val: boolean) => void;
}

export function MerchandisingCard({
  isFeatured,
  onToggleFeatured,
  isNewArrival,
  onToggleNewArrival,
  isBestSeller,
  onToggleBestSeller,
}: MerchandisingCardProps) {
  return (
    <div id="merchandising" className="space-y-4 rounded-xl border border-[#E5E5E5] bg-white p-5 shadow-xs">
      <div className="border-b border-[#E5E5E5] pb-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-[#171717]">
          <Sparkles className="h-4 w-4 text-[#737373]" />
          <span>Merchandising & Badging</span>
        </h2>
        <p className="mt-0.5 text-xs text-[#737373]">
          Highlight items in storefront collections with promotional badges and featured spot placement.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <label className="flex items-center gap-3 rounded-lg border border-[#E5E5E5] bg-[#FAFAF9] p-3 cursor-pointer text-xs hover:border-[#A3A3A3]">
          <input
            type="checkbox"
            checked={isFeatured}
            onChange={(e) => onToggleFeatured(e.target.checked)}
            className="h-4 w-4 rounded border-[#E5E5E5] text-[#171717]"
          />
          <div>
            <span className="font-semibold text-[#171717] flex items-center gap-1">
              <Award className="h-3.5 w-3.5 text-amber-500" />
              <span>Featured Item</span>
            </span>
            <span className="text-[10px] text-[#737373]">Home banner hero spots</span>
          </div>
        </label>

        <label className="flex items-center gap-3 rounded-lg border border-[#E5E5E5] bg-[#FAFAF9] p-3 cursor-pointer text-xs hover:border-[#A3A3A3]">
          <input
            type="checkbox"
            checked={isNewArrival}
            onChange={(e) => onToggleNewArrival(e.target.checked)}
            className="h-4 w-4 rounded border-[#E5E5E5] text-[#171717]"
          />
          <div>
            <span className="font-semibold text-[#171717] flex items-center gap-1">
              <Tag className="h-3.5 w-3.5 text-[#4338CA]" />
              <span>New Arrival</span>
            </span>
            <span className="text-[10px] text-[#737373]">Fresh release collections</span>
          </div>
        </label>

        <label className="flex items-center gap-3 rounded-lg border border-[#E5E5E5] bg-[#FAFAF9] p-3 cursor-pointer text-xs hover:border-[#A3A3A3]">
          <input
            type="checkbox"
            checked={isBestSeller}
            onChange={(e) => onToggleBestSeller(e.target.checked)}
            className="h-4 w-4 rounded border-[#E5E5E5] text-[#171717]"
          />
          <div>
            <span className="font-semibold text-[#171717] flex items-center gap-1">
              <Flame className="h-3.5 w-3.5 text-rose-500" />
              <span>Best Seller</span>
            </span>
            <span className="text-[10px] text-[#737373]">Trending demand badge</span>
          </div>
        </label>
      </div>
    </div>
  );
}
