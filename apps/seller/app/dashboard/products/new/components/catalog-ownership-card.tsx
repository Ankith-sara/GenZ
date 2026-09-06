import React from "react";
import { Building2, ShieldCheck } from "lucide-react";

export interface SellerOption {
  id: string;
  business_name: string;
  full_name?: string | null;
}

interface CatalogOwnershipCardProps {
  sellers?: SellerOption[];
  adminUserId?: string;
  selectedSellerId: string;
  onChangeSellerId?: (id: string) => void;
  isSellerMode?: boolean;
  sellerBusinessName?: string;
}

export function CatalogOwnershipCard({
  selectedSellerId,
  sellerBusinessName,
}: CatalogOwnershipCardProps) {
  return (
    <div id="catalog-ownership" className="space-y-4 rounded-xl border border-[#E5E5E0] bg-white p-5 shadow-xs">
      <div className="border-b border-[#E5E5E0] pb-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-[#171717]">
          <Building2 className="h-4 w-4 text-[#737373]" />
          <span>Catalog Ownership</span>
        </h2>
        <p className="mt-0.5 text-xs text-[#737373]">
          Verified workshop ownership credentials bound to this catalog listing.
        </p>
      </div>

      <div className="space-y-4">
        {/* Hidden seller ID input for form submission */}
        <input type="hidden" name="seller_id" value={selectedSellerId} />

        <div className="flex items-center gap-3 rounded-lg border border-[#E5E5E0] bg-[#FAF8F5] p-3.5 text-xs text-[#171717]">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#0095F6]">
            <ShieldCheck className="h-5 w-5 text-[#0095F6]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-[#171717]">
                {sellerBusinessName || "My Verified Workshop"}
              </span>
              <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-[#0095F6]">
                Verified Artisan
              </span>
            </div>
            <span className="text-[11px] text-[#737373] mt-0.5 block">
              Direct Workshop • Account Verified • Workshop ID: {selectedSellerId}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
