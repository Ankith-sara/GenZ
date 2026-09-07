import React from "react";
import { Sparkles, Award, Flame } from "lucide-react";

export interface MerchandisingCardProps {
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
            name="is_featured"
            value="true"
            checked={isFeatured}
            onChange={(e) => onToggleFeatured(e.target.checked)}
            className="h-4 w-4 rounded border-[#E5E5E5] text-[#171717]"
          />
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 text-amber-600" />
            <div>
              <span className="font-semibold block text-[#171717]">Featured Collection</span>
              <span className="text-[10px] text-[#737373]">Highlight on homepage spotlight</span>
            </div>
          </div>
        </label>

        <label className="flex items-center gap-3 rounded-lg border border-[#E5E5E5] bg-[#FAFAF9] p-3 cursor-pointer text-xs hover:border-[#A3A3A3]">
          <input
            type="checkbox"
            name="is_new_arrival"
            value="true"
            checked={isNewArrival}
            onChange={(e) => onToggleNewArrival(e.target.checked)}
            className="h-4 w-4 rounded border-[#E5E5E5] text-[#171717]"
          />
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-emerald-600" />
            <div>
              <span className="font-semibold block text-[#171717]">New Arrival</span>
              <span className="text-[10px] text-[#737373]">Badge as new craft launch</span>
            </div>
          </div>
        </label>

        <label className="flex items-center gap-3 rounded-lg border border-[#E5E5E5] bg-[#FAFAF9] p-3 cursor-pointer text-xs hover:border-[#A3A3A3]">
          <input
            type="checkbox"
            name="is_bestseller"
            value="true"
            checked={isBestSeller}
            onChange={(e) => onToggleBestSeller(e.target.checked)}
            className="h-4 w-4 rounded border-[#E5E5E5] text-[#171717]"
          />
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-rose-600" />
            <div>
              <span className="font-semibold block text-[#171717]">Best Seller</span>
              <span className="text-[10px] text-[#737373]">Badge high demand craft</span>
            </div>
          </div>
        </label>
      </div>
    </div>
  );
}
