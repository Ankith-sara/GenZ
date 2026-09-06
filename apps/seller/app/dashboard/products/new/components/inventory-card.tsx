import React from "react";
import { Package, Barcode } from "lucide-react";

interface InventoryCardProps {
  sku: string;
  onChangeSku: (val: string) => void;
  barcode: string;
  onChangeBarcode: (val: string) => void;
  stockQty: string;
  onChangeStockQty: (val: string) => void;
  lowStockThreshold: string;
  onChangeLowStockThreshold: (val: string) => void;
  trackInventory: boolean;
  onToggleTrackInventory: (val: boolean) => void;
}

const FOCUS_RING =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#171717]/20 focus-visible:ring-offset-1";

export function InventoryCard({
  sku,
  onChangeSku,
  barcode,
  onChangeBarcode,
  stockQty,
  onChangeStockQty,
  lowStockThreshold,
  onChangeLowStockThreshold,
  trackInventory,
  onToggleTrackInventory,
}: InventoryCardProps) {
  return (
    <div id="inventory" className="space-y-4 rounded-xl border border-[#E5E5E0] bg-white p-5 shadow-xs">
      <div className="flex items-center justify-between border-b border-[#E5E5E0] pb-3">
        <div>
          <h2 className="flex items-center gap-2 text-sm font-semibold text-[#171717]">
            <Package className="h-4 w-4 text-[#737373]" />
            <span>Inventory & Stock</span>
          </h2>
          <p className="mt-0.5 text-xs text-[#737373]">
            Track workshop stock levels, SKUs, barcodes, and minimum stock alerts.
          </p>
        </div>

        <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-[#171717]">
          <input
            type="checkbox"
            checked={trackInventory}
            onChange={(e) => onToggleTrackInventory(e.target.checked)}
            className="h-4 w-4 rounded border-[#E5E5E0] text-[#171717]"
          />
          <span>Track Quantity</span>
        </label>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-medium text-[#171717]">
            SKU (Stock Keeping Unit)
          </label>
          <input
            type="text"
            value={sku}
            onChange={(e) => onChangeSku(e.target.value)}
            placeholder="e.g. ETIK-TOY-001"
            className={`mt-1.5 h-9 w-full rounded-lg border border-[#E5E5E0] bg-white px-3 font-mono text-xs text-[#171717] placeholder-[#A3A3A3] ${FOCUS_RING}`}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-[#171717]">
            Barcode / GTIN / EAN
          </label>
          <div className="relative mt-1.5">
            <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#737373]" />
            <input
              type="text"
              value={barcode}
              onChange={(e) => onChangeBarcode(e.target.value)}
              placeholder="e.g. 8901234567890"
              className={`h-9 w-full rounded-lg border border-[#E5E5E0] bg-white pl-9 pr-3 font-mono text-xs text-[#171717] placeholder-[#A3A3A3] ${FOCUS_RING}`}
            />
          </div>
        </div>

        {trackInventory && (
          <>
            <div>
              <label className="block text-xs font-medium text-[#171717]">
                Available Units in Workshop
              </label>
              <input
                type="number"
                min={0}
                value={stockQty}
                onChange={(e) => onChangeStockQty(e.target.value)}
                placeholder="50"
                className={`mt-1.5 h-9 w-full rounded-lg border border-[#E5E5E0] bg-white px-3 font-mono text-xs text-[#171717] placeholder-[#A3A3A3] ${FOCUS_RING}`}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#171717]">
                Low Stock Warning Threshold
              </label>
              <input
                type="number"
                min={0}
                value={lowStockThreshold}
                onChange={(e) => onChangeLowStockThreshold(e.target.value)}
                placeholder="5"
                className={`mt-1.5 h-9 w-full rounded-lg border border-[#E5E5E0] bg-white px-3 font-mono text-xs text-[#171717] placeholder-[#A3A3A3] ${FOCUS_RING}`}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
