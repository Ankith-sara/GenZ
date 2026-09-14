"use client";

import React from "react";
import {
  FileText,
  Bold,
  Italic,
  Heading,
  List,
  ListOrdered,
  Building2,
  ShieldCheck,
  CheckCircle2,
  Package,
  Sparkles,
  Award,
  Flame,
  Globe,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";

const FOCUS_RING =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-1";

/* ==========================================================================
   Section 2: Basic Information Card
   ========================================================================== */

export const DEFAULT_PRODUCT_CATEGORIES = [
  "Etikoppaka Wooden Toys",
  "Kondapalli Toys",
  "Wooden Toys & Crafts",
  "Home & Furniture",
  "Handicrafts",
];

export interface BasicInfoCardProps {
  name: string;
  onChangeName: (val: string) => void;
  priceInr: string;
  onChangePriceInr: (val: string) => void;
  category: string;
  onChangeCategory: (val: string) => void;
  description: string;
  onChangeDescription: (val: string) => void;
  materials: string;
  onChangeMaterials: (val: string) => void;
  categories?: string[];
}

export function BasicInfoCard({
  name,
  onChangeName,
  priceInr,
  onChangePriceInr,
  category,
  onChangeCategory,
  description,
  onChangeDescription,
  materials,
  onChangeMaterials,
  categories = DEFAULT_PRODUCT_CATEGORIES,
}: BasicInfoCardProps) {
  const insertFormatting = (prefix: string, suffix: string = "") => {
    onChangeDescription(`${description}${prefix}Formatted Text${suffix}`);
  };

  return (
    <div
      id="basic-info"
      className="border-border bg-card space-y-5 rounded-2xl border p-5 shadow-2xs"
    >
      <div className="border-border border-b pb-3.5">
        <h2 className="text-foreground flex items-center gap-2 text-sm font-bold">
          <FileText className="text-muted-foreground h-4 w-4" />
          <span>Basic Information</span>
        </h2>
        <p className="text-muted-foreground mt-0.5 text-xs">
          Add the core details, title, category, price, and descriptive craftsmanship
          specifications.
        </p>
      </div>

      <div className="space-y-4">
        {/* Product Name & Selling Price */}
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="name"
                className="text-foreground block text-xs font-semibold"
              >
                Product Name <span className="text-destructive">*</span>
              </label>
              <span className="text-muted-foreground font-mono text-[10px]">
                {name.length}/100
              </span>
            </div>
            <input
              id="name"
              name="name"
              type="text"
              required
              maxLength={100}
              value={name}
              onChange={(e) => onChangeName(e.target.value)}
              placeholder="e.g. Handcrafted Teakwood Building Blocks"
              className={`border-border bg-background text-foreground placeholder:text-muted-foreground mt-1.5 h-10 w-full rounded-xl border px-3.5 text-xs ${FOCUS_RING}`}
            />
          </div>

          <div>
            <label
              htmlFor="price_inr"
              className="text-foreground block text-xs font-semibold"
            >
              Wholesale Price (INR ₹) <span className="text-destructive">*</span>
            </label>
            <div className="relative mt-1.5">
              <span className="text-muted-foreground absolute top-1/2 left-3.5 -translate-y-1/2 text-xs font-semibold">
                ₹
              </span>
              <input
                id="price_inr"
                name="price_inr"
                type="number"
                required
                min="0"
                step="0.01"
                value={priceInr}
                onChange={(e) => onChangePriceInr(e.target.value)}
                placeholder="1499"
                className={`border-border bg-background text-foreground placeholder:text-muted-foreground h-10 w-full rounded-xl border pr-3.5 pl-8 text-xs font-medium ${FOCUS_RING}`}
              />
            </div>
          </div>
        </div>

        {/* Category & Materials */}
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="category"
              className="text-foreground block text-xs font-semibold"
            >
              Marketplace Category <span className="text-destructive">*</span>
            </label>
            <select
              id="category"
              name="category"
              value={category}
              onChange={(e) => onChangeCategory(e.target.value)}
              className={`border-border bg-background text-foreground mt-1.5 h-10 w-full rounded-xl border px-3.5 text-xs ${FOCUS_RING}`}
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="materials"
              className="text-foreground block text-xs font-semibold"
            >
              Materials Used (Comma-separated)
            </label>
            <input
              id="materials"
              name="materials"
              type="text"
              value={materials}
              onChange={(e) => onChangeMaterials(e.target.value)}
              placeholder="e.g. Natural Organic Wood, Vegetable Dyes"
              className={`border-border bg-background text-foreground placeholder:text-muted-foreground mt-1.5 h-10 w-full rounded-xl border px-3.5 text-xs ${FOCUS_RING}`}
            />
          </div>
        </div>

        {/* Description & Rich Markdown Toolbar */}
        <div>
          <div className="flex items-center justify-between">
            <label
              htmlFor="description"
              className="text-foreground block text-xs font-semibold"
            >
              Craft Story & Product Description
            </label>
            <span className="text-muted-foreground font-mono text-[10px]">
              {description.length}/2000
            </span>
          </div>

          {/* Formatting Helper Buttons */}
          <div className="border-border bg-muted/40 text-muted-foreground mt-1.5 flex items-center gap-1 rounded-t-xl border border-b-0 px-2.5 py-1.5 text-xs">
            <button
              type="button"
              onClick={() => insertFormatting("**", "**")}
              className="hover:bg-background hover:text-foreground cursor-pointer rounded-lg p-1 transition-colors"
              title="Bold"
            >
              <Bold className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting("*", "*")}
              className="hover:bg-background hover:text-foreground cursor-pointer rounded-lg p-1 transition-colors"
              title="Italic"
            >
              <Italic className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting("### ")}
              className="hover:bg-background hover:text-foreground cursor-pointer rounded-lg p-1 transition-colors"
              title="Heading"
            >
              <Heading className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting("- ")}
              className="hover:bg-background hover:text-foreground cursor-pointer rounded-lg p-1 transition-colors"
              title="Bullet List"
            >
              <List className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting("1. ")}
              className="hover:bg-background hover:text-foreground cursor-pointer rounded-lg p-1 transition-colors"
              title="Numbered List"
            >
              <ListOrdered className="h-3.5 w-3.5" />
            </button>
          </div>

          <textarea
            id="description"
            name="description"
            rows={4}
            maxLength={2000}
            value={description}
            onChange={(e) => onChangeDescription(e.target.value)}
            placeholder="Share the craft heritage, artisan techniques, and dimensions of this product..."
            className={`border-border bg-background text-foreground placeholder:text-muted-foreground w-full rounded-b-xl border p-3.5 text-xs ${FOCUS_RING}`}
          />
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   Section 3: Catalog Ownership Card
   ========================================================================== */

export interface SellerOption {
  id: string;
  business_name: string;
  full_name?: string | null;
}

export interface CatalogOwnershipCardProps {
  sellers?: SellerOption[];
  adminUserId?: string;
  selectedSellerId: string;
  onChangeSellerId?: (id: string) => void;
  isSellerMode?: boolean;
  sellerBusinessName?: string;
}

export function CatalogOwnershipCard({
  sellers = [],
  adminUserId = "",
  selectedSellerId,
  onChangeSellerId,
  isSellerMode = false,
  sellerBusinessName,
}: CatalogOwnershipCardProps) {
  const isDirectPlatform = selectedSellerId === adminUserId;
  const currentSeller = sellers.find((s) => s.id === selectedSellerId);

  return (
    <div
      id="catalog-ownership"
      className="border-border bg-card space-y-5 rounded-2xl border p-5 shadow-2xs"
    >
      <div className="border-border border-b pb-3.5">
        <h2 className="text-foreground flex items-center gap-2 text-sm font-bold">
          <Building2 className="text-muted-foreground h-4 w-4" />
          <span>Catalog Ownership</span>
        </h2>
        <p className="text-muted-foreground mt-0.5 text-xs">
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
            <div className="border-border bg-muted/40 text-foreground flex items-center gap-3.5 rounded-xl border p-4 text-xs">
              <div className="bg-primary/10 text-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <span className="text-foreground block text-sm font-bold">
                  {sellerBusinessName || "My Verified Workshop"}
                </span>
                <span className="text-muted-foreground text-[11px]">
                  Direct Artisan Workshop • Account Verified • Seller ID:{" "}
                  {selectedSellerId}
                </span>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Admin Ownership Selector */}
            <div>
              <label
                htmlFor="seller_id"
                className="text-foreground block text-xs font-semibold"
              >
                Select Catalog Owner Account
              </label>
              <select
                id="seller_id"
                name="seller_id"
                value={selectedSellerId}
                onChange={(e) => onChangeSellerId && onChangeSellerId(e.target.value)}
                className={`border-border bg-background text-foreground mt-1.5 h-10 w-full rounded-xl border px-3.5 text-xs font-medium ${FOCUS_RING}`}
              >
                {adminUserId && (
                  <option value={adminUserId}>
                    Direct Platform / Official Catalog (GenZ Official)
                  </option>
                )}
                {sellers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.business_name} {s.full_name ? `(${s.full_name})` : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Ownership Banner */}
            {isDirectPlatform ? (
              <div className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3.5 text-xs text-emerald-800 dark:text-emerald-300">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <span className="block font-bold">
                    Managed by GenZ Official Catalog
                  </span>
                  <span className="text-[11px] opacity-90">
                    Direct platform inventory with top-tier fulfillment priority &
                    global visibility.
                  </span>
                </div>
              </div>
            ) : (
              <div className="border-border bg-muted/40 text-foreground flex items-center gap-3 rounded-xl border p-3.5 text-xs">
                <ShieldCheck className="text-primary h-4 w-4 shrink-0" />
                <div>
                  <span className="block font-bold">
                    Seller Account: {currentSeller?.business_name || "Verified Seller"}
                  </span>
                  <span className="text-muted-foreground text-[11px]">
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

/* ==========================================================================
   Section 5: Inventory & Logistics Card
   ========================================================================== */

export interface InventoryCardProps {
  sku: string;
  onChangeSku: (val: string) => void;
  stockQty: string;
  onChangeStockQty: (val: string) => void;
  lowStockThreshold: string;
  onChangeLowStockThreshold: (val: string) => void;
  trackInventory: boolean;
  onToggleTrackInventory: (val: boolean) => void;
}

export function InventoryCard({
  sku,
  onChangeSku,
  stockQty,
  onChangeStockQty,
  lowStockThreshold,
  onChangeLowStockThreshold,
  trackInventory,
  onToggleTrackInventory,
}: InventoryCardProps) {
  return (
    <div
      id="inventory"
      className="border-border bg-card space-y-5 rounded-2xl border p-5 shadow-2xs"
    >
      <div className="border-border flex items-center justify-between border-b pb-3.5">
        <div>
          <h2 className="text-foreground flex items-center gap-2 text-sm font-bold">
            <Package className="text-muted-foreground h-4 w-4" />
            <span>Inventory</span>
          </h2>
          <p className="text-muted-foreground mt-0.5 text-xs">
            Track stock levels, SKUs, and low stock warnings.
          </p>
        </div>

        <label className="text-foreground flex cursor-pointer items-center gap-2 text-xs font-semibold select-none">
          <input
            type="checkbox"
            name="track_inventory"
            value="true"
            checked={trackInventory}
            onChange={(e) => onToggleTrackInventory(e.target.checked)}
            className="border-border text-primary focus:ring-primary/20 h-4 w-4 rounded"
          />
          <span>Track Stock</span>
        </label>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className="text-foreground block text-xs font-semibold">
            SKU Code
          </label>
          <input
            type="text"
            name="sku"
            value={sku}
            onChange={(e) => onChangeSku(e.target.value)}
            placeholder="e.g. TOY-WOOD-001"
            className={`border-border bg-background text-foreground placeholder:text-muted-foreground mt-1.5 h-10 w-full rounded-xl border px-3.5 font-mono text-xs ${FOCUS_RING}`}
          />
        </div>

        <div>
          <label className="text-foreground block text-xs font-semibold">
            Available Stock Quantity
          </label>
          <input
            type="number"
            name="stock_qty"
            min="0"
            disabled={!trackInventory}
            value={stockQty}
            onChange={(e) => onChangeStockQty(e.target.value)}
            placeholder="0"
            className={`border-border bg-background text-foreground placeholder:text-muted-foreground disabled:bg-muted/50 disabled:text-muted-foreground mt-1.5 h-10 w-full rounded-xl border px-3.5 font-mono text-xs ${FOCUS_RING}`}
          />
        </div>

        <div>
          <label className="text-foreground block text-xs font-semibold">
            Low Stock Threshold
          </label>
          <input
            type="number"
            name="low_stock_threshold"
            min="0"
            disabled={!trackInventory}
            value={lowStockThreshold}
            onChange={(e) => onChangeLowStockThreshold(e.target.value)}
            placeholder="5"
            className={`border-border bg-background text-foreground placeholder:text-muted-foreground disabled:bg-muted/50 disabled:text-muted-foreground mt-1.5 h-10 w-full rounded-xl border px-3.5 font-mono text-xs ${FOCUS_RING}`}
          />
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   Section 6: Compliance & Merchandising Card
   ========================================================================== */

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
    <div
      id="merchandising"
      className="border-border bg-card space-y-5 rounded-2xl border p-5 shadow-2xs"
    >
      <div className="border-border border-b pb-3.5">
        <h2 className="text-foreground flex items-center gap-2 text-sm font-bold">
          <Sparkles className="text-muted-foreground h-4 w-4" />
          <span>Merchandising & Badging</span>
        </h2>
        <p className="text-muted-foreground mt-0.5 text-xs">
          Highlight items in storefront collections with promotional badges and featured
          spot placement.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <label
          className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 text-xs transition-all ${
            isFeatured
              ? "text-foreground border-amber-500/40 bg-amber-500/10 ring-1 ring-amber-500/30"
              : "border-border bg-background text-foreground hover:bg-muted/40 hover:border-border"
          }`}
        >
          <input
            type="checkbox"
            name="is_featured"
            value="true"
            checked={isFeatured}
            onChange={(e) => onToggleFeatured(e.target.checked)}
            className="border-border text-primary focus:ring-primary/20 h-4 w-4 rounded"
          />
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Award className="h-4 w-4" />
            </div>
            <div>
              <span className="text-foreground block font-bold">Featured</span>
              <span className="text-muted-foreground text-[10px]">
                Homepage spotlight
              </span>
            </div>
          </div>
        </label>

        <label
          className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 text-xs transition-all ${
            isNewArrival
              ? "text-foreground border-emerald-500/40 bg-emerald-500/10 ring-1 ring-emerald-500/30"
              : "border-border bg-background text-foreground hover:bg-muted/40 hover:border-border"
          }`}
        >
          <input
            type="checkbox"
            name="is_new_arrival"
            value="true"
            checked={isNewArrival}
            onChange={(e) => onToggleNewArrival(e.target.checked)}
            className="border-border text-primary focus:ring-primary/20 h-4 w-4 rounded"
          />
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <span className="text-foreground block font-bold">New Arrival</span>
              <span className="text-muted-foreground text-[10px]">
                Badge as new craft
              </span>
            </div>
          </div>
        </label>

        <label
          className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 text-xs transition-all ${
            isBestSeller
              ? "text-foreground border-rose-500/40 bg-rose-500/10 ring-1 ring-rose-500/30"
              : "border-border bg-background text-foreground hover:bg-muted/40 hover:border-border"
          }`}
        >
          <input
            type="checkbox"
            name="is_bestseller"
            value="true"
            checked={isBestSeller}
            onChange={(e) => onToggleBestSeller(e.target.checked)}
            className="border-border text-primary focus:ring-primary/20 h-4 w-4 rounded"
          />
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <Flame className="h-4 w-4" />
            </div>
            <div>
              <span className="text-foreground block font-bold">Best Seller</span>
              <span className="text-muted-foreground text-[10px]">
                Badge high demand
              </span>
            </div>
          </div>
        </label>
      </div>
    </div>
  );
}

/* ==========================================================================
   Section 7: Publishing & Audit Card
   ========================================================================== */

export interface PublishingCardProps {
  status: "published" | "draft";
  onChangeStatus: (val: "published" | "draft") => void;
}

export function PublishingCard({ status, onChangeStatus }: PublishingCardProps) {
  const handleSelect = (val: "published" | "draft") => {
    if (val === status) return;
    onChangeStatus(val);
    if (val === "published") {
      toast.info("Status set to Published", {
        description:
          "Click Publish Product or Save Changes to push live to storefront.",
      });
    } else {
      toast.info("Status set to Draft", {
        description: "Click Save as Draft to keep this listing hidden from shoppers.",
      });
    }
  };

  return (
    <div
      id="publishing"
      className="border-border bg-card space-y-5 rounded-2xl border p-5 shadow-2xs"
    >
      <div className="border-border border-b pb-3.5">
        <h2 className="text-foreground flex items-center gap-2 text-sm font-bold">
          <Globe className="text-muted-foreground h-4 w-4" />
          <span>Publishing Status</span>
        </h2>
        <p className="text-muted-foreground mt-0.5 text-xs">
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
            className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 text-left transition-all duration-150 ${
              status === "published"
                ? "text-foreground border-emerald-500/50 bg-emerald-500/10 shadow-2xs ring-2 ring-emerald-500/20"
                : "border-border bg-background text-foreground hover:bg-muted/40 hover:border-foreground/20"
            }`}
          >
            <div>
              <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                Published (Active)
              </span>
              <span className="text-muted-foreground mt-0.5 block text-[11px]">
                Visible on storefront to all buyers
              </span>
            </div>
            <Eye className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          </button>

          <button
            type="button"
            onClick={() => handleSelect("draft")}
            className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 text-left transition-all duration-150 ${
              status === "draft"
                ? "text-foreground border-amber-500/50 bg-amber-500/10 shadow-2xs ring-2 ring-amber-500/20"
                : "border-border bg-background text-foreground hover:bg-muted/40 hover:border-foreground/20"
            }`}
          >
            <div>
              <span className="flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-400">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                Draft (Hidden)
              </span>
              <span className="text-muted-foreground mt-0.5 block text-[11px]">
                Saved privately in workshop catalog
              </span>
            </div>
            <EyeOff className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
          </button>
        </div>
      </div>
    </div>
  );
}
