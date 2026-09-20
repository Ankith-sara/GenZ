"use client";

import React, { useState, useMemo, useCallback } from "react";
import {
  Layers,
  Plus,
  Trash2,
  X,
  Sparkles,
  DollarSign,
  Package,
  Barcode,
  Check,
  RotateCcw,
} from "lucide-react";

export interface OptionGroup {
  id: string;
  name: string;
  values: string[];
}

export interface VariantRow {
  id: string;
  title: string;
  combination: Record<string, string>;
  sku: string;
  price: string;
  stock: string;
  isAvailable: boolean;
}

interface VariantOverride {
  sku?: string;
  price?: string;
  stock?: string;
  isAvailable?: boolean;
  isDeleted?: boolean;
}

interface VariantsCardProps {
  basePrice?: string | number;
  productName?: string;
}

const PRESET_OPTIONS = ["Size", "Color", "Material", "Finish", "Style", "Pack Size"];

export function VariantsCard({ basePrice = "", productName = "" }: VariantsCardProps) {
  const [hasVariants, setHasVariants] = useState(false);

  // Option groups (e.g. Size, Color)
  const [options, setOptions] = useState<OptionGroup[]>([
    {
      id: "opt-1",
      name: "Size",
      values: ["Small", "Medium"],
    },
  ]);

  // Temporary text inputs for adding values to each option group
  const [newTagInputs, setNewTagInputs] = useState<Record<string, string>>({});

  // User overrides per variant title (price, stock, sku, isAvailable, isDeleted)
  const [customOverrides, setCustomOverrides] = useState<
    Record<string, VariantOverride>
  >({});

  // Track bulk inputs
  const [bulkPriceInput, setBulkPriceInput] = useState("");
  const [bulkStockInput, setBulkStockInput] = useState("");
  const [showBulkActions, setShowBulkActions] = useState(false);

  // Slug generator helper for SKUs
  const generateSku = useCallback(
    (pName: string, combination: Record<string, string>) => {
      const cleanPrefix = (pName || "PRD")
        .toUpperCase()
        .replace(/[^A-Z0-9]+/g, "-")
        .slice(0, 8);
      const suffix = Object.values(combination)
        .map((v) =>
          v
            .toUpperCase()
            .replace(/[^A-Z0-9]+/g, "")
            .slice(0, 3)
        )
        .join("-");
      return suffix ? `${cleanPrefix}-${suffix}` : cleanPrefix;
    },
    []
  );

  // Compute combinations
  const combinations = useMemo(() => {
    const active = options.filter(
      (opt) => opt.name.trim() !== "" && opt.values.length > 0
    );
    if (active.length === 0) return [];

    let results: Record<string, string>[] = [{}];

    for (const opt of active) {
      const next: Record<string, string>[] = [];
      for (const current of results) {
        for (const val of opt.values) {
          next.push({
            ...current,
            [opt.name]: val,
          });
        }
      }
      results = next;
    }

    return results;
  }, [options]);

  // Derive variants directly from combinations + overrides (pure derived state, no useEffect)
  const variants = useMemo<VariantRow[]>(() => {
    if (!hasVariants) return [];
    return combinations
      .map((comb) => {
        const title = Object.values(comb).join(" / ");
        const override = customOverrides[title];
        if (override?.isDeleted) return null;

        return {
          id: `var-${Object.values(comb)
            .join("-")
            .toLowerCase()
            .replace(/[^a-z0-9]/g, "-")}`,
          title,
          combination: comb,
          sku:
            override?.sku !== undefined ? override.sku : generateSku(productName, comb),
          price:
            override?.price !== undefined
              ? override.price
              : basePrice
                ? String(basePrice)
                : "",
          stock: override?.stock !== undefined ? override.stock : "10",
          isAvailable:
            override?.isAvailable !== undefined ? override.isAvailable : true,
        };
      })
      .filter((v): v is VariantRow => v !== null);
  }, [hasVariants, combinations, customOverrides, productName, basePrice, generateSku]);

  // Add a new option group (e.g. Color)
  const addOptionGroup = () => {
    if (options.length >= 3) return;

    const usedNames = options.map((o) => o.name);
    const nextPreset = PRESET_OPTIONS.find((p) => !usedNames.includes(p)) || "Option";

    const newOpt: OptionGroup = {
      id: `opt-${Date.now()}`,
      name: nextPreset,
      values: [],
    };
    setOptions([...options, newOpt]);
  };

  // Remove an option group
  const removeOptionGroup = (id: string) => {
    setOptions(options.filter((o) => o.id !== id));
  };

  // Update option group name
  const updateOptionName = (id: string, name: string) => {
    setOptions(options.map((o) => (o.id === id ? { ...o, name } : o)));
  };

  // Add a value tag to an option
  const addValueTag = (optId: string) => {
    const raw = newTagInputs[optId]?.trim();
    if (!raw) return;

    const newValues = raw
      .split(",")
      .map((s) => s.trim())
      .filter((s) => Boolean(s));

    setOptions(
      options.map((opt) => {
        if (opt.id !== optId) return opt;
        const currentVals = [...opt.values];
        for (const val of newValues) {
          if (!currentVals.includes(val)) {
            currentVals.push(val);
          }
        }
        return { ...opt, values: currentVals };
      })
    );

    setNewTagInputs({ ...newTagInputs, [optId]: "" });
  };

  // Remove a value tag from an option
  const removeValueTag = (optId: string, valIndex: number) => {
    setOptions(
      options.map((opt) => {
        if (opt.id !== optId) return opt;
        return {
          ...opt,
          values: opt.values.filter((_, i) => i !== valIndex),
        };
      })
    );
  };

  // Update a single variant property
  const updateVariant = (
    title: string,
    field: keyof VariantOverride,
    value: unknown
  ) => {
    setCustomOverrides((prev) => ({
      ...prev,
      [title]: {
        ...prev[title],
        [field]: value,
      },
    }));
  };

  // Remove a specific variant row
  const removeVariantRow = (title: string) => {
    setCustomOverrides((prev) => ({
      ...prev,
      [title]: {
        ...prev[title],
        isDeleted: true,
      },
    }));
  };

  // Bulk Apply Price
  const handleApplyBulkPrice = () => {
    if (!bulkPriceInput) return;
    setCustomOverrides((prev) => {
      const next = { ...prev };
      for (const v of variants) {
        next[v.title] = { ...next[v.title], price: bulkPriceInput };
      }
      return next;
    });
  };

  // Bulk Apply Stock
  const handleApplyBulkStock = () => {
    if (!bulkStockInput) return;
    setCustomOverrides((prev) => {
      const next = { ...prev };
      for (const v of variants) {
        next[v.title] = { ...next[v.title], stock: bulkStockInput };
      }
      return next;
    });
  };

  // Quick reset to base price
  const handleResetToBasePrice = () => {
    if (!basePrice) return;
    setCustomOverrides((prev) => {
      const next = { ...prev };
      for (const v of variants) {
        next[v.title] = { ...next[v.title], price: String(basePrice) };
      }
      return next;
    });
  };

  return (
    <div
      id="variants"
      className="border-border bg-card space-y-5 rounded-lg border p-5 shadow-sm"
    >
      {/* HEADER */}
      <div className="border-border flex flex-col gap-2 border-b pb-3.5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-foreground flex items-center gap-2 text-sm font-bold">
            <Layers className="text-muted-foreground h-4 w-4" />
            <span>Product Variants</span>
          </h2>
          <p className="text-muted-foreground mt-0.5 text-xs">
            Configure options such as size, color, or finish to create multi-item
            listings with independent prices and stock.
          </p>
        </div>

        {/* Toggle Checkbox */}
        <label className="text-foreground flex cursor-pointer items-center gap-2 text-xs font-semibold select-none">
          <input
            type="checkbox"
            checked={hasVariants}
            onChange={(e) => setHasVariants(e.target.checked)}
            className="border-border text-primary focus:ring-primary/20 h-4 w-4 cursor-pointer rounded"
          />
          <span>This product has options</span>
        </label>
      </div>

      {hasVariants && (
        <div className="animate-in fade-in space-y-5 duration-150">
          {/* 1. OPTIONS BUILDER */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-foreground text-xs font-bold">
                Options ({options.length} / 3 max)
              </span>
              <span className="text-muted-foreground text-[11px]">
                Press Enter or comma to add multiple tags
              </span>
            </div>

            {options.map((opt, optIdx) => (
              <div
                key={opt.id}
                className="border-border bg-muted/30 hover:border-foreground/20 space-y-3 rounded-lg border p-4 transition-all"
              >
                <div className="flex items-center justify-between gap-3">
                  {/* Option Name Input + Presets */}
                  <div className="flex flex-1 flex-wrap items-center gap-2">
                    <label
                      htmlFor={`opt-name-${opt.id}`}
                      className="text-muted-foreground text-[11px] font-bold tracking-wide uppercase"
                    >
                      Option {optIdx + 1}
                    </label>
                    <input
                      id={`opt-name-${opt.id}`}
                      type="text"
                      value={opt.name}
                      onChange={(e) => updateOptionName(opt.id, e.target.value)}
                      placeholder="e.g. Size, Color, Finish"
                      className="border-border bg-background text-foreground focus:ring-primary/20 h-8 w-36 rounded-lg border px-2.5 text-xs font-semibold focus:ring-1 focus:outline-none"
                    />

                    {/* Quick presets pills */}
                    <div className="hidden items-center gap-1.5 text-[11px] sm:flex">
                      {PRESET_OPTIONS.filter((p) => p !== opt.name)
                        .slice(0, 3)
                        .map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => updateOptionName(opt.id, preset)}
                            className="border-border bg-background text-muted-foreground hover:border-foreground/20 hover:text-foreground cursor-pointer rounded-full border px-2 py-0.5 text-[10px] font-medium transition-colors"
                          >
                            {preset}
                          </button>
                        ))}
                    </div>
                  </div>

                  {/* Remove Option Group Button */}
                  {options.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeOptionGroup(opt.id)}
                      title="Remove this option"
                      className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive cursor-pointer rounded-lg p-1.5 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {/* Option Values Tags + Input */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  {opt.values.map((val, valIdx) => (
                    <span
                      key={valIdx}
                      className="border-border bg-background text-foreground group inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium shadow-sm"
                    >
                      <span>{val}</span>
                      <button
                        type="button"
                        onClick={() => removeValueTag(opt.id, valIdx)}
                        className="text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}

                  {/* Tag input */}
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      placeholder="Add value (e.g. S, Red)..."
                      value={newTagInputs[opt.id] || ""}
                      onChange={(e) =>
                        setNewTagInputs({ ...newTagInputs, [opt.id]: e.target.value })
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === ",") {
                          e.preventDefault();
                          addValueTag(opt.id);
                        }
                      }}
                      className="border-border bg-background text-foreground placeholder:text-muted-foreground focus:ring-primary/20 h-8 w-44 rounded-lg border border-dashed px-2.5 text-xs focus:border-solid focus:ring-1 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => addValueTag(opt.id)}
                      disabled={!newTagInputs[opt.id]?.trim()}
                      className="h-8 cursor-pointer rounded-lg !bg-[#18181b] px-3 text-xs font-semibold !text-white transition-opacity hover:!bg-[#27272a] disabled:opacity-30"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Add another option button */}
            {options.length < 3 && (
              <button
                type="button"
                onClick={addOptionGroup}
                className="border-border text-foreground hover:border-foreground/20 hover:bg-muted/40 inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-dashed px-3.5 py-1.5 text-xs font-semibold transition-colors"
              >
                <Plus className="text-muted-foreground h-3.5 w-3.5" />
                <span>Add another option (e.g. Color, Finish)</span>
              </button>
            )}
          </div>

          {/* 2. VARIANT COMBINATIONS MATRIX */}
          <div className="space-y-3 pt-2">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-foreground flex items-center gap-2 text-xs font-bold">
                  <span>Variant Matrix</span>
                  <span className="bg-muted text-muted-foreground rounded-full px-2.5 py-0.5 font-mono text-[10px] font-semibold">
                    {variants.length} combinations
                  </span>
                </h3>
                <p className="text-muted-foreground text-[11px]">
                  Edit individual variant prices, stock, and SKUs below.
                </p>
              </div>

              {/* Bulk Edit Toggle */}
              {variants.length > 1 && (
                <button
                  type="button"
                  onClick={() => setShowBulkActions(!showBulkActions)}
                  className="text-muted-foreground hover:text-foreground inline-flex cursor-pointer items-center gap-1 text-xs font-semibold hover:underline"
                >
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                  <span>
                    {showBulkActions ? "Hide bulk edit" : "Bulk edit prices & stock"}
                  </span>
                </button>
              )}
            </div>

            {/* BULK ACTION BAR */}
            {showBulkActions && variants.length > 1 && (
              <div className="border-border bg-muted/30 animate-in fade-in flex flex-wrap items-center gap-3 rounded-lg border p-3.5 text-xs duration-150">
                {/* Bulk Price */}
                <div className="flex items-center gap-1.5">
                  <span className="text-muted-foreground font-semibold">
                    Price (₹):
                  </span>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 1499"
                    value={bulkPriceInput}
                    onChange={(e) => setBulkPriceInput(e.target.value)}
                    className="border-border bg-background text-foreground h-8 w-24 rounded-lg border px-2.5 font-mono text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleApplyBulkPrice}
                    disabled={!bulkPriceInput}
                    className="h-8 cursor-pointer rounded-lg !bg-[#18181b] px-3 text-[11px] font-semibold !text-white hover:!bg-[#27272a] disabled:opacity-40"
                  >
                    Apply All
                  </button>
                </div>

                {/* Bulk Stock */}
                <div className="flex items-center gap-1.5">
                  <span className="text-muted-foreground font-semibold">Stock:</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 25"
                    value={bulkStockInput}
                    onChange={(e) => setBulkStockInput(e.target.value)}
                    className="border-border bg-background text-foreground h-8 w-20 rounded-lg border px-2.5 font-mono text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleApplyBulkStock}
                    disabled={!bulkStockInput}
                    className="h-8 cursor-pointer rounded-lg !bg-[#18181b] px-3 text-[11px] font-semibold !text-white hover:!bg-[#27272a] disabled:opacity-40"
                  >
                    Apply All
                  </button>
                </div>

                {basePrice && (
                  <button
                    type="button"
                    onClick={handleResetToBasePrice}
                    className="text-muted-foreground hover:text-foreground ml-auto inline-flex cursor-pointer items-center gap-1 text-[11px]"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>Reset prices to base (₹{basePrice})</span>
                  </button>
                )}
              </div>
            )}

            {/* VARIANTS EDITABLE TABLE */}
            {variants.length > 0 ? (
              <div className="border-border overflow-x-auto rounded-lg border shadow-sm">
                <table className="w-full text-left text-xs">
                  <thead className="border-border bg-muted/40 text-muted-foreground border-b text-[10px] font-bold tracking-wider uppercase">
                    <tr>
                      <th className="p-3">Variant Combination</th>
                      <th className="w-40 p-3">
                        <span className="flex items-center gap-1">
                          <Barcode className="h-3 w-3" />
                          <span>SKU Code</span>
                        </span>
                      </th>
                      <th className="w-32 p-3">
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          <span>Price (₹)</span>
                        </span>
                      </th>
                      <th className="w-28 p-3">
                        <span className="flex items-center gap-1">
                          <Package className="h-3 w-3" />
                          <span>Stock Qty</span>
                        </span>
                      </th>
                      <th className="w-28 p-3">Status</th>
                      <th className="w-10 p-3 text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-border bg-card divide-y">
                    {variants.map((v, idx) => (
                      <tr key={v.id} className="hover:bg-muted/30 transition-colors">
                        {/* Variant Title */}
                        <td className="p-3">
                          <span className="text-foreground block font-bold">
                            {v.title}
                          </span>
                          <span className="text-muted-foreground font-mono text-[10px]">
                            #{idx + 1}
                          </span>
                        </td>

                        {/* SKU Input */}
                        <td className="p-3">
                          <input
                            type="text"
                            value={v.sku}
                            onChange={(e) =>
                              updateVariant(v.title, "sku", e.target.value)
                            }
                            placeholder="SKU-CODE"
                            className="border-border bg-background text-foreground focus:ring-primary/20 h-8 w-full rounded-lg border px-2.5 font-mono text-xs focus:ring-1 focus:outline-none"
                          />
                        </td>

                        {/* Price Input */}
                        <td className="p-3">
                          <div className="relative">
                            <span className="text-muted-foreground absolute top-1/2 left-2.5 -translate-y-1/2 font-mono text-xs">
                              ₹
                            </span>
                            <input
                              type="number"
                              min="0"
                              value={v.price}
                              onChange={(e) =>
                                updateVariant(v.title, "price", e.target.value)
                              }
                              placeholder={basePrice ? String(basePrice) : "0"}
                              className="border-border bg-background text-foreground focus:ring-primary/20 h-8 w-full rounded-lg border pr-2 pl-6 font-mono text-xs font-medium focus:ring-1 focus:outline-none"
                            />
                          </div>
                        </td>

                        {/* Stock Input */}
                        <td className="p-3">
                          <input
                            type="number"
                            min="0"
                            value={v.stock}
                            onChange={(e) =>
                              updateVariant(v.title, "stock", e.target.value)
                            }
                            placeholder="0"
                            className="border-border bg-background text-foreground focus:ring-primary/20 h-8 w-full rounded-lg border px-2.5 font-mono text-xs focus:ring-1 focus:outline-none"
                          />
                        </td>

                        {/* Status Selector / Toggle */}
                        <td className="p-3">
                          <button
                            type="button"
                            onClick={() =>
                              updateVariant(v.title, "isAvailable", !v.isAvailable)
                            }
                            className={`inline-flex cursor-pointer items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold transition-colors ${
                              v.isAvailable && Number(v.stock || "0") > 0
                                ? "border border-emerald-500/20 bg-emerald-500/15 text-emerald-800 dark:text-emerald-300"
                                : "bg-muted text-muted-foreground border-border border"
                            }`}
                          >
                            {v.isAvailable && Number(v.stock || "0") > 0 ? (
                              <>
                                <Check className="h-2.5 w-2.5" />
                                <span>Active</span>
                              </>
                            ) : (
                              <span>Out of stock</span>
                            )}
                          </button>
                        </td>

                        {/* Delete Row Button */}
                        <td className="p-3 text-center">
                          <button
                            type="button"
                            onClick={() => removeVariantRow(v.title)}
                            title="Exclude this variant"
                            className="text-muted-foreground hover:text-destructive cursor-pointer rounded p-1 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="border-border bg-muted/20 rounded-lg border border-dashed p-6 text-center">
                <p className="text-foreground text-xs font-semibold">
                  No variant combinations generated yet
                </p>
                <p className="text-muted-foreground mt-1 text-[11px]">
                  Add values (e.g. S, M, L) to your options above to create
                  combinations.
                </p>
              </div>
            )}
          </div>

          {/* Hidden Form Input for Form Submission Serialization */}
          <input
            type="hidden"
            name="variants_json"
            value={hasVariants ? JSON.stringify(variants) : ""}
          />
        </div>
      )}
    </div>
  );
}
