import React from "react";
import { Building2, ShieldCheck, CheckCircle2 } from "lucide-react";

export interface SellerOption {
  id: string;
  business_name: string;
  full_name?: string | null;
}

interface CatalogOwnershipCardProps {
  sellers?: SellerOption[];
  adminUserId: string;
  selectedSellerId: string;
  onChangeSellerId?: (id: string) => void;
  isSellerMode?: boolean;
  sellerBusinessName?: string;
}

const FOCUS_RING =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#171717]/20 focus-visible:ring-offset-1";

export function CatalogOwnershipCard({
  sellers = [],
  adminUserId,
  selectedSellerId,
  onChangeSellerId,
  isSellerMode = false,
  sellerBusinessName,
}: CatalogOwnershipCardProps) {
  const isDirectPlatform = selectedSellerId === adminUserId;
  const currentSeller = sellers.find((s) => s.id === selectedSellerId);

  return (
    <div id="catalog-ownership" className="space-y-4 rounded-xl border border-[#E5E5E5] bg-white p-5 shadow-xs">
      <div className="border-b border-[#E5E5E5] pb-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-[#171717]">
          <Building2 className="h-4 w-4 text-[#737373]" />
          <span>Catalog Ownership</span>
        </h2>
        <p className="mt-0.5 text-xs text-[#737373]">
          {isSellerMode
            ? "Verified workshop ownership credentials bound to this catalog listing."
            : "Select whether this item belongs directly to the GenZ Official platform or an onboarded seller account."}
        </p>
      </div>

      <div className="space-y-4">
        {isSellerMode ? (
          <>
            {/* Hidden seller ID input for seller submission */}
            <input type="hidden" name="seller_id" value={selectedSellerId} />
            <div className="flex items-center gap-3 rounded-lg border border-[#E5E5E5] bg-[#FAFAF9] p-3 text-xs text-[#171717]">
              <ShieldCheck className="h-5 w-5 shrink-0 text-[#0095F6]" />
              <div>
                <span className="font-semibold block text-sm">
                  {sellerBusinessName || "My Verified Workshop"}
                </span>
                <span className="text-[11px] text-[#737373]">
                  Direct Artisan Workshop • Account Verified • Seller ID: {selectedSellerId}
                </span>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Admin Ownership Selector */}
            <div>
              <label htmlFor="seller_id" className="block text-xs font-medium text-[#171717]">
                Select Catalog Owner Account
              </label>
              <select
                id="seller_id"
                name="seller_id"
                value={selectedSellerId}
                onChange={(e) => onChangeSellerId && onChangeSellerId(e.target.value)}
                className={`mt-1.5 h-9 w-full rounded-lg border border-[#E5E5E5] bg-white px-3 text-xs font-medium text-[#171717] ${FOCUS_RING}`}
              >
                <option value={adminUserId}>
                  ⭐ Direct Platform / Official Catalog (GenZ Official)
                </option>
                {sellers.map((s) => (
                  <option key={s.id} value={s.id}>
                    🏢 {s.business_name} {s.full_name ? `(${s.full_name})` : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Ownership Banner */}
            {isDirectPlatform ? (
              <div className="flex items-center gap-3 rounded-lg border border-[#6EE7B7] bg-[#ECFDF5] p-3 text-xs text-[#047857]">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-[#10B981]" />
                <div>
                  <span className="font-semibold block">Managed by GenZ Official Catalog</span>
                  <span className="text-[11px] opacity-90">
                    Direct platform inventory with top-tier fulfillment priority & global visibility.
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 rounded-lg border border-[#E5E5E5] bg-[#FAFAF9] p-3 text-xs text-[#171717]">
                <ShieldCheck className="h-4 w-4 shrink-0 text-[#4338CA]" />
                <div>
                  <span className="font-semibold block">
                    Seller Account: {currentSeller?.business_name || "Verified Seller"}
                  </span>
                  <span className="text-[11px] text-[#737373]">
                    Seller ID: {selectedSellerId} • Account Verified
                  </span>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
