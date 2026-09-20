"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  Bold,
  Italic,
  Heading,
  List,
  ListOrdered,
  Building2,
  Tag,
  Package,
  Sparkles,
  Award,
  Flame,
  Globe,
  Eye,
  Plus,
  Minus,
  X,
  AlertTriangle,
  Sparkle,
  Store,
  Check,
} from "lucide-react";
import { Select } from "../../../../components/select";

export const DEFAULT_PRODUCT_CATEGORIES = [
  "Kondapalli toys",
  "Wooden toys & crafts",
  "Etikoppaka Wooden Toys",
  "Pooja essentials",
  "Home decor",
  "Handicrafts",
  "Festival & gifting sets",
];

/* M3 Switch Component */

export function M3Switch({
  checked,
  onChange,
  label,
  id,
}: {
  checked: boolean;
  onChange: (val: boolean) => void;
  label?: string;
  id?: string;
}) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-8 w-[52px] shrink-0 cursor-pointer rounded-full border-2 transition-colors duration-200 ease-out focus-visible:ring-2 focus-visible:ring-[#1A1A18] focus-visible:outline-none ${
        checked ? "border-[#1A1A18] bg-[#1A1A18]" : "border-[#E5E5E0] bg-[#FAF8F4]"
      }`}
    >
      <span
        className={`pointer-events-none absolute top-1/2 flex -translate-y-1/2 items-center justify-center rounded-full transition-all duration-200 ease-out ${
          checked
            ? "left-5 h-6 w-6 bg-white text-[#1A1A18]"
            : "left-1 h-4 w-4 bg-[#71717A] text-transparent"
        }`}
      >
        {checked && <Check className="h-3.5 w-3.5 stroke-[3]" />}
      </span>
    </button>
  );
}

/* ==========================================================================
   Section 2: Basic Information Card (Product Info & Craft Story)
   ========================================================================== */

export interface BasicInfoCardProps {
  name: string;
  onChangeName: (val: string) => void;
  category: string;
  onChangeCategory: (val: string) => void;
  description: string;
  onChangeDescription: (val: string) => void;
  materials: string[];
  onChangeMaterials: (val: string[]) => void;
  categories?: string[];
}

export function BasicInfoCard({
  name,
  onChangeName,
  category,
  onChangeCategory,
  description,
  onChangeDescription,
  materials,
  onChangeMaterials,
  categories = DEFAULT_PRODUCT_CATEGORIES,
}: BasicInfoCardProps) {
  const [tagInput, setTagInput] = useState("");

  const handleAddTag = () => {
    const trimmed = tagInput.trim().replace(/^,+|,+$/g, "");
    if (trimmed && !materials.includes(trimmed)) {
      onChangeMaterials([...materials, trimmed]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onChangeMaterials(materials.filter((t) => t !== tagToRemove));
  };

  const insertFormatting = (prefix: string, suffix: string = "") => {
    const textarea = document.getElementById(
      "product-description-field"
    ) as HTMLTextAreaElement | null;
    if (!textarea) {
      onChangeDescription(`${description}${prefix}Formatted Text${suffix}`);
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const val = textarea.value;

    if (prefix === "### " || prefix === "- " || prefix === "1. ") {
      const lineStart = val.lastIndexOf("\n", start - 1) + 1;
      const newVal = val.slice(0, lineStart) + prefix + val.slice(lineStart);
      onChangeDescription(newVal);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + prefix.length, end + prefix.length);
      }, 0);
    } else {
      const selectedText = val.slice(start, end) || "Text";
      const newVal =
        val.slice(0, start) + prefix + selectedText + suffix + val.slice(end);
      onChangeDescription(newVal);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(
          start + prefix.length,
          start + prefix.length + selectedText.length
        );
      }, 0);
    }
  };

  return (
    <section
      id="sec-basics"
      className="scroll-mt-24 overflow-hidden rounded-xl border border-[#E5E5E0] bg-white shadow-xs"
    >
      {/* Section Head */}
      <div className="flex items-start gap-3 border-b border-[#E5E5E0] p-5 pb-3 sm:p-6 sm:pb-3">
        <span className="mt-0.5 text-[#52524E]">
          <FileText className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <h2 className="flex items-center gap-2 text-base font-semibold text-[#1A1A18]">
            <span>Product information</span>
          </h2>
          <p className="mt-0.5 max-w-[60ch] text-xs text-[#52524E]">
            The title, category and craft story buyers see on the listing.
          </p>
        </div>
      </div>

      {/* Section Body */}
      <div className="space-y-4 p-5 sm:p-6">
        {/* Product Name */}
        <div>
          <div className="flex items-baseline justify-between text-xs font-semibold text-[#52524E]">
            <span>
              Product name <span className="text-rose-600">*</span>
            </span>
            <span className="font-mono text-[11px]">{name.length}/100</span>
          </div>
          <input
            id="name"
            name="name"
            type="text"
            required
            maxLength={100}
            value={name}
            onChange={(e) => onChangeName(e.target.value)}
            placeholder="e.g. Kondapalli Gruhapravesham Set"
            className="mt-1.5 h-12 w-full rounded-lg border border-[#E5E5E0] bg-white px-3.5 text-sm text-[#1A1A18] placeholder:text-[#52524E]/50 focus:border-[#1A1A18] focus:ring-1 focus:ring-[#1A1A18] focus:outline-none"
          />
        </div>

        {/* Category & Materials Chipfield */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="category"
              className="block text-xs font-semibold text-[#52524E]"
            >
              Marketplace category <span className="text-rose-600">*</span>
            </label>
            <Select
              id="category"
              name="category"
              value={category}
              onChange={onChangeCategory}
              options={categories}
              placeholder="Choose a category"
              className="mt-1.5"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#52524E]">
              Materials used
            </label>
            <input type="hidden" name="materials" value={materials.join(", ")} />
            <div className="mt-1.5 flex min-h-12 flex-wrap items-center gap-1.5 rounded-lg border border-[#E5E5E0] bg-white p-2 focus-within:border-[#1A1A18] focus-within:ring-1 focus-within:ring-[#1A1A18]">
              {materials.map((mat) => (
                <span
                  key={mat}
                  className="inline-flex items-center gap-1.5 rounded-md border border-[#E5E5E0] bg-[#FAF8F4] px-2.5 py-1 text-xs font-medium text-[#1A1A18]"
                >
                  <span>{mat}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(mat)}
                    className="cursor-pointer text-[#52524E] hover:text-[#1A1A18]"
                    aria-label={`Remove ${mat}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === ",") {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                onBlur={handleAddTag}
                placeholder={
                  materials.length === 0 ? "Type a material and press Enter" : "Add..."
                }
                className="h-8 min-w-[120px] flex-1 bg-transparent px-2 text-sm text-[#1A1A18] placeholder:text-[#52524E]/50 focus:outline-none"
              />
            </div>
            <p className="mt-1 text-[11px] text-[#52524E]">
              e.g. Softwood, Natural pigments, Tamarind glue
            </p>
          </div>
        </div>

        {/* Craft Story & Description with Toolbar */}
        <div>
          <div className="flex items-baseline justify-between text-xs font-semibold text-[#52524E]">
            <label htmlFor="product-description-field">
              Craft story &amp; product description
            </label>
            <span className="font-mono text-[11px]">{description.length}/2000</span>
          </div>

          <div className="mt-1.5 overflow-hidden rounded-lg border border-[#E5E5E0] focus-within:border-[#1A1A18] focus-within:ring-1 focus-within:ring-[#1A1A18]">
            {/* Formatting Toolbar */}
            <div className="flex items-center gap-1 border-b border-[#E5E5E0] bg-[#FAF8F4] px-2 py-1.5 text-[#52524E]">
              <button
                type="button"
                onClick={() => insertFormatting("**", "**")}
                className="cursor-pointer rounded p-1 transition-colors hover:bg-white hover:text-[#1A1A18]"
                title="Bold"
                aria-label="Bold"
              >
                <Bold className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting("_", "_")}
                className="cursor-pointer rounded p-1 transition-colors hover:bg-white hover:text-[#1A1A18]"
                title="Italic"
                aria-label="Italic"
              >
                <Italic className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting("### ")}
                className="cursor-pointer rounded p-1 transition-colors hover:bg-white hover:text-[#1A1A18]"
                title="Heading"
                aria-label="Heading"
              >
                <Heading className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting("- ")}
                className="cursor-pointer rounded p-1 transition-colors hover:bg-white hover:text-[#1A1A18]"
                title="Bullet List"
                aria-label="Bullet List"
              >
                <List className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting("1. ")}
                className="cursor-pointer rounded p-1 transition-colors hover:bg-white hover:text-[#1A1A18]"
                title="Numbered List"
                aria-label="Numbered List"
              >
                <ListOrdered className="h-3.5 w-3.5" />
              </button>
            </div>

            <textarea
              id="product-description-field"
              name="description"
              rows={4}
              maxLength={2000}
              value={description}
              onChange={(e) => onChangeDescription(e.target.value)}
              placeholder="Share the craft heritage, artisan technique and dimensions of this product…"
              className="min-h-[120px] w-full resize-y bg-white p-3.5 text-sm text-[#1A1A18] placeholder:text-[#52524E]/50 focus:outline-none"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ==========================================================================
   Section 3: Pricing Card (Wholesale & Compare-At Price)
   ========================================================================== */

export interface PricingCardProps {
  priceInr: string;
  onChangePriceInr: (val: string) => void;
  comparePriceInr: string;
  onChangeComparePriceInr: (val: string) => void;
}

export function PricingCard({
  priceInr,
  onChangePriceInr,
  comparePriceInr,
  onChangeComparePriceInr,
}: PricingCardProps) {
  const p = parseFloat(priceInr) || 0;
  const c = parseFloat(comparePriceInr) || 0;
  const discountPct = c > p && p > 0 ? Math.round((1 - p / c) * 100) : null;

  return (
    <section
      id="sec-pricing"
      className="scroll-mt-24 overflow-hidden rounded-xl border border-[#E5E5E0] bg-white shadow-xs"
    >
      <div className="flex items-start gap-3 border-b border-[#E5E5E0] p-5 pb-3 sm:p-6 sm:pb-3">
        <span className="mt-0.5 text-[#52524E]">
          <Tag className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-[#1A1A18]">Pricing</h2>
          <p className="mt-0.5 max-w-[60ch] text-xs text-[#52524E]">
            Buyers see the wholesale price; add a compare-at price to show a discount.
          </p>
        </div>
      </div>

      <div className="p-5 sm:p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Wholesale Price */}
          <div>
            <label
              htmlFor="price_inr"
              className="block text-xs font-semibold text-[#52524E]"
            >
              Wholesale price <span className="text-rose-600">*</span>
            </label>
            <div className="relative mt-1.5">
              <span className="absolute top-1/2 left-3.5 -translate-y-1/2 text-sm font-semibold text-[#52524E]">
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
                className="h-12 w-full rounded-lg border border-[#E5E5E0] bg-white pr-3.5 pl-8 text-sm font-medium text-[#1A1A18] placeholder:text-[#52524E]/50 focus:border-[#1A1A18] focus:ring-1 focus:ring-[#1A1A18] focus:outline-none"
              />
            </div>
          </div>

          {/* Compare-at Price */}
          <div>
            <div className="flex items-baseline justify-between text-xs font-semibold text-[#52524E]">
              <label htmlFor="compare_price">Compare-at price</label>
              {discountPct !== null && (
                <span className="font-mono text-xs font-bold text-[#C89D32]">
                  {discountPct}% off
                </span>
              )}
            </div>
            <div className="relative mt-1.5">
              <span className="absolute top-1/2 left-3.5 -translate-y-1/2 text-sm font-semibold text-[#52524E]">
                ₹
              </span>
              <input
                id="compare_price"
                name="compare_price"
                type="number"
                min="0"
                step="0.01"
                value={comparePriceInr}
                onChange={(e) => onChangeComparePriceInr(e.target.value)}
                placeholder="Optional, shown crossed out"
                className="h-12 w-full rounded-lg border border-[#E5E5E0] bg-white pr-3.5 pl-8 text-sm font-medium text-[#1A1A18] placeholder:text-[#52524E]/50 focus:border-[#1A1A18] focus:ring-1 focus:ring-[#1A1A18] focus:outline-none"
              />
            </div>
            <p className="mt-1 text-[11px] text-[#52524E]">
              Leave blank if this listing isn&apos;t discounted.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ==========================================================================
   Section 4: Inventory & Logistics Card (Stock & SKU)
   ========================================================================== */

export interface InventoryCardProps {
  productName: string;
  sku: string;
  onChangeSku: (val: string) => void;
  stockQty: string;
  onChangeStockQty: (val: string) => void;
  lowStockThreshold: string;
  onChangeLowStockThreshold: (val: string) => void;
  trackInventory: boolean;
  onToggleTrackInventory: (val: boolean) => void;
  allowBackorders?: boolean;
  onToggleBackorders?: (val: boolean) => void;
}

export function InventoryCard({
  productName,
  sku,
  onChangeSku,
  stockQty,
  onChangeStockQty,
  lowStockThreshold,
  onChangeLowStockThreshold,
  trackInventory,
  onToggleTrackInventory,
  allowBackorders = false,
  onToggleBackorders,
}: InventoryCardProps) {
  const handleGenerateSku = () => {
    const base = (productName || "PROD")
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, "-")
      .slice(0, 10)
      .replace(/-+$/, "");
    const generated = `${base || "PRD"}-${Math.floor(100 + Math.random() * 900)}`;
    onChangeSku(generated);
  };

  const handleStepQty = (delta: number) => {
    const current = parseInt(stockQty, 10) || 0;
    const next = Math.max(0, current + delta);
    onChangeStockQty(String(next));
  };

  return (
    <section
      id="sec-inventory"
      className="scroll-mt-24 overflow-hidden rounded-xl border border-[#E5E5E0] bg-white shadow-xs"
    >
      <div className="flex items-start gap-3 border-b border-[#E5E5E0] p-5 pb-3 sm:p-6 sm:pb-3">
        <span className="mt-0.5 text-[#52524E]">
          <Package className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-[#1A1A18]">Inventory</h2>
          <p className="mt-0.5 max-w-[60ch] text-xs text-[#52524E]">
            Track stock levels and get warned before you sell out.
          </p>
        </div>
      </div>

      <div className="space-y-4 p-5 sm:p-6">
        {/* Hidden inputs for form serialization */}
        <input type="hidden" name="track_inventory" value={String(trackInventory)} />
        <input type="hidden" name="allow_backorders" value={String(allowBackorders)} />

        {/* Track Stock Switch Row */}
        <div className="flex items-center gap-4 rounded-lg border border-[#E5E5E0] bg-[#FAF8F4] p-3.5">
          <M3Switch
            id="track-stock"
            checked={trackInventory}
            onChange={onToggleTrackInventory}
            label="Track stock for this listing"
          />
          <div className="min-w-0 flex-1">
            <b className="block text-sm font-medium text-[#1A1A18]">
              Track stock for this listing
            </b>
            <small className="block text-xs text-[#52524E]">
              Turn off for made-to-order items with no fixed quantity.
            </small>
          </div>
        </div>

        {/* 3-Column Stock Fields (12-Col Responsive Grid) */}
        <div
          className={`grid grid-cols-1 gap-3.5 transition-opacity sm:grid-cols-12 ${
            trackInventory ? "opacity-100" : "pointer-events-none opacity-40"
          }`}
        >
          {/* SKU Field with Generator (5 cols) */}
          <div className="min-w-0 sm:col-span-6 lg:col-span-5">
            <label htmlFor="sku" className="block text-xs font-semibold text-[#52524E]">
              SKU
            </label>
            <div className="mt-1.5 flex min-w-0 items-center gap-2">
              <input
                id="sku"
                name="sku"
                type="text"
                value={sku}
                onChange={(e) => onChangeSku(e.target.value)}
                placeholder="e.g. KPT-GRUHA-01"
                className="h-12 min-w-0 flex-1 rounded-lg border border-[#E5E5E0] bg-white px-3 font-mono text-sm text-[#1A1A18] placeholder:text-[#52524E]/50 focus:border-[#1A1A18] focus:ring-1 focus:ring-[#1A1A18] focus:outline-none"
              />
              <button
                type="button"
                onClick={handleGenerateSku}
                className="h-12 shrink-0 cursor-pointer rounded-lg border border-[#E5E5E0] bg-[#FAF8F4] px-3.5 text-xs font-semibold whitespace-nowrap text-[#1A1A18] transition-colors hover:bg-[#E5E5E0]/60"
                title="Generate SKU from name"
              >
                Generate
              </button>
            </div>
          </div>

          {/* Quantity Stepper (4 cols) */}
          <div className="min-w-0 sm:col-span-3 lg:col-span-4">
            <label
              htmlFor="stock_qty"
              className="block text-xs font-semibold text-[#52524E]"
            >
              Available quantity
            </label>
            <div className="mt-1.5 flex h-12 min-w-0 items-center overflow-hidden rounded-lg border border-[#E5E5E0] bg-white">
              <button
                type="button"
                onClick={() => handleStepQty(-1)}
                disabled={!trackInventory}
                className="flex h-full w-10 shrink-0 cursor-pointer items-center justify-center text-[#52524E] hover:bg-[#FAF8F4] active:bg-[#E5E5E0]/40 disabled:opacity-40"
                aria-label="Decrease quantity"
              >
                <Minus className="h-4 w-4" />
              </button>
              <input
                id="stock_qty"
                name="stock_qty"
                type="number"
                min="0"
                disabled={!trackInventory}
                value={stockQty}
                onChange={(e) => onChangeStockQty(e.target.value)}
                className="h-full min-w-0 flex-1 border-x border-[#E5E5E0] text-center font-mono text-sm font-semibold text-[#1A1A18] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => handleStepQty(1)}
                disabled={!trackInventory}
                className="flex h-full w-10 shrink-0 cursor-pointer items-center justify-center text-[#52524E] hover:bg-[#FAF8F4] active:bg-[#E5E5E0]/40 disabled:opacity-40"
                aria-label="Increase quantity"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Low Stock Warning Threshold (3 cols) */}
          <div className="min-w-0 sm:col-span-3 lg:col-span-3">
            <label
              htmlFor="low_stock_threshold"
              className="block text-xs font-semibold text-[#52524E]"
            >
              Low stock threshold
            </label>
            <input
              id="low_stock_threshold"
              name="low_stock_threshold"
              type="number"
              min="0"
              disabled={!trackInventory}
              value={lowStockThreshold}
              onChange={(e) => onChangeLowStockThreshold(e.target.value)}
              placeholder="5"
              className="mt-1.5 h-12 w-full min-w-0 rounded-lg border border-[#E5E5E0] bg-white px-3.5 font-mono text-sm text-[#1A1A18] placeholder:text-[#52524E]/50 focus:border-[#1A1A18] focus:ring-1 focus:ring-[#1A1A18] focus:outline-none"
            />
          </div>
        </div>

        {/* Allow Backorders Switch Row */}
        {onToggleBackorders && (
          <div className="flex items-center gap-4 rounded-lg border border-[#E5E5E0] bg-[#FAF8F4] p-3.5">
            <M3Switch
              id="backorder"
              checked={allowBackorders}
              onChange={onToggleBackorders}
              label="Allow orders when out of stock"
            />
            <div className="min-w-0 flex-1">
              <b className="block text-sm font-medium text-[#1A1A18]">
                Allow orders when out of stock
              </b>
              <small className="block text-xs text-[#52524E]">
                Buyers can still order; you&apos;ll see it flagged as backordered.
              </small>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

/* ==========================================================================
   Sidebar Card 1: Storefront Live Preview
   ========================================================================== */

export interface StorefrontPreviewCardProps {
  name: string;
  category: string;
  priceInr: string;
  comparePriceInr: string;
  coverPreviewUrl: string | null;
  trackInventory: boolean;
  stockQty: string;
  lowStockThreshold: string;
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
}

export function StorefrontPreviewCard({
  name,
  category,
  priceInr,
  comparePriceInr,
  coverPreviewUrl,
  trackInventory,
  stockQty,
  lowStockThreshold,
  isFeatured,
  isNewArrival,
  isBestSeller,
}: StorefrontPreviewCardProps) {
  const p = parseFloat(priceInr) || 0;
  const c = parseFloat(comparePriceInr) || 0;
  const discountPct = c > p && p > 0 ? Math.round((1 - p / c) * 100) : null;
  const qty = parseInt(stockQty, 10) || 0;
  const threshold = parseInt(lowStockThreshold, 10) || 5;

  let stockLabel = "Made to order";
  if (trackInventory) {
    if (qty <= 0) {
      stockLabel = "Out of stock";
    } else if (qty <= threshold) {
      stockLabel = `${qty} left · low stock`;
    } else {
      stockLabel = `${qty} in stock`;
    }
  }

  return (
    <div className="side-card rounded-xl border border-[#E5E5E0] bg-white p-4 shadow-xs">
      <div className="mb-3 flex items-center gap-2 text-sm font-medium text-[#1A1A18]">
        <Eye className="h-4 w-4 text-[#52524E]" />
        <span>Storefront preview</span>
      </div>

      <div className="overflow-hidden rounded-lg border border-[#E5E5E0] bg-white">
        {/* Media Preview Box (4:3 Aspect Ratio) */}
        <div className="relative aspect-4/3 w-full overflow-hidden bg-[#FAF8F4]">
          {/* Overlay Badges */}
          <div className="absolute top-2 left-2 z-10 flex flex-wrap gap-1">
            {isFeatured && (
              <span className="rounded bg-[#C89D32] px-2 py-0.5 text-[10px] font-bold text-white shadow-xs">
                Featured
              </span>
            )}
            {isNewArrival && (
              <span className="rounded bg-[#1A1A18] px-2 py-0.5 text-[10px] font-bold text-white shadow-xs">
                New
              </span>
            )}
            {isBestSeller && (
              <span className="rounded bg-[#2E2E2A] px-2 py-0.5 text-[10px] font-bold text-white shadow-xs">
                Best seller
              </span>
            )}
          </div>

          {coverPreviewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={coverPreviewUrl}
              alt={name || "Product preview"}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center text-[#52524E]/40">
              <Store className="h-10 w-10 stroke-[1.5]" />
              <span className="mt-1 text-[11px]">No cover uploaded</span>
            </div>
          )}
        </div>

        {/* Card Body */}
        <div className="p-3.5">
          <div className="truncate text-sm font-medium text-[#1A1A18]">
            {name || "Untitled listing"}
          </div>
          <div className="mt-0.5 text-xs text-[#52524E]">
            {category || "Choose a category"}
          </div>

          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="font-mono text-base font-semibold text-[#1A1A18]">
              ₹{p ? p.toLocaleString("en-IN") : "0"}
            </span>
            {c > p && (
              <span className="font-mono text-xs text-[#52524E] line-through">
                ₹{c.toLocaleString("en-IN")}
              </span>
            )}
            {discountPct !== null && (
              <span className="text-xs font-semibold text-[#C89D32]">
                {discountPct}% off
              </span>
            )}
          </div>

          <div className="mt-1.5 text-xs text-[#52524E]">{stockLabel}</div>
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   Sidebar Card 2: Publishing Status
   ========================================================================== */

export interface PublishingCardProps {
  status: "published" | "draft";
  onChangeStatus: (val: "published" | "draft") => void;
  createdDate?: string;
  updatedDate?: string;
}

export function PublishingCard({
  status,
  onChangeStatus,
  createdDate,
  updatedDate,
}: PublishingCardProps) {
  return (
    <div className="side-card space-y-3 rounded-xl border border-[#E5E5E0] bg-white p-4 shadow-xs">
      <div className="flex items-center gap-2 text-sm font-medium text-[#1A1A18]">
        <Globe className="h-4 w-4 text-[#52524E]" />
        <span>Publishing status</span>
      </div>

      {/* Hidden input for server action */}
      <input type="hidden" name="status" value={status} />

      <div className="space-y-2">
        {/* Draft Option */}
        <label
          onClick={() => onChangeStatus("draft")}
          className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3.5 text-xs transition-all ${
            status === "draft"
              ? "border-[#1A1A18] bg-[#FAF8F4]"
              : "border-[#E5E5E0] bg-white hover:border-[#1A1A18]/40"
          }`}
        >
          <input
            type="radio"
            name="status_radio"
            checked={status === "draft"}
            onChange={() => onChangeStatus("draft")}
            className="mt-0.5 h-4 w-4 accent-[#1A1A18]"
          />
          <div>
            <b className="block text-sm font-medium text-[#1A1A18]">Draft</b>
            <span className="mt-0.5 block text-xs text-[#52524E]">
              Saved privately. Only you can see it.
            </span>
          </div>
        </label>

        {/* Published Option */}
        <label
          onClick={() => onChangeStatus("published")}
          className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3.5 text-xs transition-all ${
            status === "published"
              ? "border-[#1A1A18] bg-[#FAF8F4]"
              : "border-[#E5E5E0] bg-white hover:border-[#1A1A18]/40"
          }`}
        >
          <input
            type="radio"
            name="status_radio"
            checked={status === "published"}
            onChange={() => onChangeStatus("published")}
            className="mt-0.5 h-4 w-4 accent-[#1A1A18]"
          />
          <div>
            <b className="block text-sm font-medium text-[#1A1A18]">Published</b>
            <span className="mt-0.5 block text-xs text-[#52524E]">
              Live on your storefront to all buyers.
            </span>
          </div>
        </label>
      </div>

      {(createdDate || updatedDate) && (
        <div className="mt-2 space-y-1 border-t border-[#E5E5E0] pt-2.5 text-xs text-[#52524E]">
          {createdDate && (
            <div>
              Created <b className="text-[#1A1A18]">{createdDate}</b>
            </div>
          )}
          {updatedDate && (
            <div>
              Last updated <b className="text-[#1A1A18]">{updatedDate}</b>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ==========================================================================
   Sidebar Card 3: Merchandising Badges (Max 2 Limit)
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
  const count = (isFeatured ? 1 : 0) + (isNewArrival ? 1 : 0) + (isBestSeller ? 1 : 0);

  const handleToggle = (current: boolean, setter: (val: boolean) => void) => {
    if (!current && count >= 2) return;
    setter(!current);
  };

  return (
    <div className="side-card space-y-3 rounded-xl border border-[#E5E5E0] bg-white p-4 shadow-xs">
      <div className="flex items-center gap-2 text-sm font-medium text-[#1A1A18]">
        <Sparkles className="h-4 w-4 text-[#C89D32]" />
        <span>Merchandising</span>
      </div>

      <div className="space-y-2">
        <input type="hidden" name="is_featured" value={String(isFeatured)} />
        <input type="hidden" name="is_new_arrival" value={String(isNewArrival)} />
        <input type="hidden" name="is_bestseller" value={String(isBestSeller)} />

        {/* Featured */}
        <label
          onClick={() => handleToggle(isFeatured, onToggleFeatured)}
          className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-xs transition-all ${
            isFeatured
              ? "border-[#C89D32] bg-[#FAF8F4]"
              : "border-[#E5E5E0] bg-white hover:border-[#1A1A18]/40"
          } ${!isFeatured && count >= 2 ? "cursor-not-allowed opacity-50" : ""}`}
        >
          <input
            type="checkbox"
            checked={isFeatured}
            disabled={!isFeatured && count >= 2}
            onChange={() => {}}
            className="h-4 w-4 rounded accent-[#1A1A18]"
          />
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#E5E5E0] bg-[#FAF8F4] text-[#C89D32]">
            <Award className="h-4 w-4" />
          </span>
          <div>
            <b className="block text-sm font-medium text-[#1A1A18]">Featured</b>
            <span className="text-xs text-[#52524E]">Homepage spotlight</span>
          </div>
        </label>

        {/* New Arrival */}
        <label
          onClick={() => handleToggle(isNewArrival, onToggleNewArrival)}
          className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-xs transition-all ${
            isNewArrival
              ? "border-[#1A1A18] bg-[#FAF8F4]"
              : "border-[#E5E5E0] bg-white hover:border-[#1A1A18]/40"
          } ${!isNewArrival && count >= 2 ? "cursor-not-allowed opacity-50" : ""}`}
        >
          <input
            type="checkbox"
            checked={isNewArrival}
            disabled={!isNewArrival && count >= 2}
            onChange={() => {}}
            className="h-4 w-4 rounded accent-[#1A1A18]"
          />
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#E5E5E0] bg-[#FAF8F4] text-[#1A1A18]">
            <Sparkle className="h-4 w-4" />
          </span>
          <div>
            <b className="block text-sm font-medium text-[#1A1A18]">New arrival</b>
            <span className="text-xs text-[#52524E]">Badge as new craft</span>
          </div>
        </label>

        {/* Best Seller */}
        <label
          onClick={() => handleToggle(isBestSeller, onToggleBestSeller)}
          className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-xs transition-all ${
            isBestSeller
              ? "border-[#1A1A18] bg-[#FAF8F4]"
              : "border-[#E5E5E0] bg-white hover:border-[#1A1A18]/40"
          } ${!isBestSeller && count >= 2 ? "cursor-not-allowed opacity-50" : ""}`}
        >
          <input
            type="checkbox"
            checked={isBestSeller}
            disabled={!isBestSeller && count >= 2}
            onChange={() => {}}
            className="h-4 w-4 rounded accent-[#1A1A18]"
          />
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#E5E5E0] bg-[#FAF8F4] text-[#1A1A18]">
            <Flame className="h-4 w-4" />
          </span>
          <div>
            <b className="block text-sm font-medium text-[#1A1A18]">Best seller</b>
            <span className="text-xs text-[#52524E]">Badge high demand</span>
          </div>
        </label>
      </div>

      <p className="text-xs text-[#52524E]">Choose up to 2 badges.</p>
    </div>
  );
}

/* ==========================================================================
   Sidebar Card 4: Catalog Ownership Card
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
  return (
    <div className="side-card space-y-3 rounded-xl border border-[#E5E5E0] bg-white p-4 shadow-xs">
      <div className="flex items-center gap-2 text-sm font-medium text-[#1A1A18]">
        <Building2 className="h-4 w-4 text-[#52524E]" />
        <span>Catalog ownership</span>
      </div>

      {isSellerMode ? (
        <>
          <input type="hidden" name="seller_id" value={selectedSellerId} />
          <div className="flex items-center gap-3 rounded-lg border border-[#E5E5E0] bg-[#FAF8F4] p-3 text-xs">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1A1A18] font-semibold text-white">
              {(sellerBusinessName || "AK").slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <b className="block text-sm font-medium text-[#1A1A18]">
                {sellerBusinessName || "Direct Artisan Workshop"}
              </b>
              <span className="text-xs text-[#52524E]">
                Direct artisan workshop · Verified
              </span>
            </div>
          </div>
        </>
      ) : (
        <div className="space-y-1.5">
          <label htmlFor="admin_seller_id" className="block text-xs text-[#52524E]">
            Assign maker / catalog account:
          </label>
          <Select
            id="admin_seller_id"
            name="seller_id"
            value={selectedSellerId}
            onChange={(val: string) => onChangeSellerId && onChangeSellerId(val)}
            options={[
              ...(adminUserId
                ? [{ value: adminUserId, label: "GenZ Official Platform Catalog" }]
                : []),
              ...sellers.map((s) => ({
                value: s.id,
                label: `${s.business_name}${s.full_name ? ` (${s.full_name})` : ""}`,
              })),
            ]}
            placeholder="Select a seller"
            className="mt-1"
          />
        </div>
      )}
    </div>
  );
}

/* ==========================================================================
   Sidebar Card 5: Danger Zone Card (Delete Listing)
   ========================================================================== */

export interface DangerZoneCardProps {
  onDelete: () => void;
  isDeleting?: boolean;
}

export function DangerZoneCard({ onDelete, isDeleting = false }: DangerZoneCardProps) {
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    if (!armed) return;
    const timer = setTimeout(() => setArmed(false), 4000);
    return () => clearTimeout(timer);
  }, [armed]);

  const handleClick = () => {
    if (!armed) {
      setArmed(true);
    } else {
      setArmed(false);
      onDelete();
    }
  };

  return (
    <div className="side-card space-y-3 rounded-xl border border-rose-200 bg-white p-4 shadow-xs">
      <div className="flex items-center gap-2 text-sm font-medium text-rose-700">
        <AlertTriangle className="h-4 w-4" />
        <span>Danger zone</span>
      </div>
      <p className="text-xs text-[#52524E]">
        Removing a listing takes it off your storefront immediately. This can&apos;t be
        undone.
      </p>
      <button
        type="button"
        disabled={isDeleting}
        onClick={handleClick}
        className={`w-full cursor-pointer rounded-lg border px-4 py-2.5 text-xs font-semibold transition-all ${
          armed
            ? "border-rose-600 bg-rose-600 text-white"
            : "border-rose-200 text-rose-700 hover:bg-rose-50"
        }`}
      >
        {isDeleting
          ? "Deleting listing..."
          : armed
            ? "Click again to confirm"
            : "Delete listing"}
      </button>
    </div>
  );
}
