"use client";

import React, { useState, useMemo, useCallback } from "react";
import {
  Layers, Plus, Trash2, X, Sparkles,
  DollarSign, Package, Barcode, Check, RotateCcw,
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

export function VariantsCard({
  basePrice = "",
  productName = "",
}: VariantsCardProps) {
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
  const [customOverrides, setCustomOverrides] = useState<Record<string, VariantOverride>>({});

  // Track bulk inputs
  const [bulkPriceInput, setBulkPriceInput] = useState("");
  const [bulkStockInput, setBulkStockInput] = useState("");
  const [showBulkActions, setShowBulkActions] = useState(false);

  // Slug generator helper for SKUs
  const generateSku = useCallback((pName: string, combination: Record<string, string>) => {
    const cleanPrefix = (pName || "PRD")
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, "-")
      .slice(0, 8);
    const suffix = Object.values(combination)
      .map((v) => v.toUpperCase().replace(/[^A-Z0-9]+/g, "").slice(0, 3))
      .join("-");
    return suffix ? `${cleanPrefix}-${suffix}` : cleanPrefix;
  }, []);

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
          id: `var-${Object.values(comb).join("-").toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
          title,
          combination: comb,
          sku: override?.sku !== undefined ? override.sku : generateSku(productName, comb),
          price: override?.price !== undefined ? override.price : (basePrice ? String(basePrice) : ""),
          stock: override?.stock !== undefined ? override.stock : "10",
          isAvailable: override?.isAvailable !== undefined ? override.isAvailable : true,
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
    setOptions(
      options.map((o) => (o.id === id ? { ...o, name } : o))
    );
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
  const updateVariant = (title: string, field: keyof VariantOverride, value: unknown) => {
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
    <div id="variants" className="space-y-4 rounded-xl border border-neutral-200 bg-white p-5 shadow-2xs">
      {/* HEADER */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-neutral-100 pb-3">
        <div>
          <h2 className="flex items-center gap-2 text-sm font-semibold text-neutral-900">
            <Layers className="h-4 w-4 text-neutral-600" />
            <span>Product Variants</span>
          </h2>
          <p className="mt-0.5 text-xs text-neutral-500">
            Configure options such as size, color, or finish to create multi-item listings with independent prices and stock.
          </p>
        </div>

        {/* Toggle Checkbox */}
        <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-neutral-800 select-none">
          <input
            type="checkbox"
            checked={hasVariants}
            onChange={(e) => setHasVariants(e.target.checked)}
            className="h-4 w-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900 focus:ring-offset-0 cursor-pointer"
          />
          <span>This product has options</span>
        </label>
      </div>

      {hasVariants && (
        <div className="space-y-5 animate-in fade-in duration-150">
          {/* 1. OPTIONS BUILDER */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-900">
                Options ({options.length} / 3 max)
              </span>
              <span className="text-[11px] text-neutral-400">
                Press Enter or comma to add multiple tags
              </span>
            </div>

            {options.map((opt, optIdx) => (
              <div
                key={opt.id}
                className="rounded-xl border border-neutral-200 bg-neutral-50/60 p-3.5 space-y-2.5 transition-all hover:border-neutral-300"
              >
                <div className="flex items-center justify-between gap-3">
                  {/* Option Name Input + Presets */}
                  <div className="flex flex-wrap items-center gap-2 flex-1">
                    <label htmlFor={`opt-name-${opt.id}`} className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wide">
                      Option {optIdx + 1}
                    </label>
                    <input
                      id={`opt-name-${opt.id}`}
                      type="text"
                      value={opt.name}
                      onChange={(e) => updateOptionName(opt.id, e.target.value)}
                      placeholder="e.g. Size, Color, Finish"
                      className="h-8 w-36 rounded-lg border border-neutral-200 bg-white px-2.5 text-xs font-semibold text-neutral-900 focus:border-neutral-900 focus:outline-none"
                    />

                    {/* Quick presets pills */}
                    <div className="hidden sm:flex items-center gap-1 text-[11px]">
                      {PRESET_OPTIONS.filter((p) => p !== opt.name).slice(0, 3).map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => updateOptionName(opt.id, preset)}
                          className="rounded-md border border-neutral-200 bg-white px-1.5 py-0.5 text-[10px] text-neutral-500 hover:border-neutral-300 hover:text-neutral-800 transition-colors"
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
                      className="rounded-lg p-1.5 text-neutral-400 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
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
                      className="inline-flex items-center gap-1 rounded-lg border border-neutral-200 bg-white px-2.5 py-1 text-xs font-medium text-neutral-800 shadow-2xs group"
                    >
                      <span>{val}</span>
                      <button
                        type="button"
                        onClick={() => removeValueTag(opt.id, valIdx)}
                        className="text-neutral-400 hover:text-neutral-900 cursor-pointer"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}

                  {/* Tag input */}
                  <div className="flex items-center gap-1">
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
                      className="h-8 w-44 rounded-lg border border-dashed border-neutral-300 bg-white px-2.5 text-xs text-neutral-900 placeholder:text-neutral-400 focus:border-solid focus:border-neutral-900 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => addValueTag(opt.id)}
                      disabled={!newTagInputs[opt.id]?.trim()}
                      className="h-8 rounded-lg bg-neutral-900 px-2.5 text-xs font-medium text-white hover:bg-neutral-800 disabled:opacity-30 transition-opacity cursor-pointer"
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
                className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:border-neutral-400 hover:bg-neutral-50 transition-colors cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5 text-neutral-500" />
                <span>Add another option (e.g. Color, Finish)</span>
              </button>
            )}
          </div>

          {/* 2. VARIANT COMBINATIONS MATRIX */}
          <div className="space-y-3 pt-2">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-xs font-semibold text-neutral-900 flex items-center gap-2">
                  <span>Variant Matrix</span>
                  <span className="rounded-full bg-neutral-100 px-2 py-0.5 font-mono text-[10px] text-neutral-600">
                    {variants.length} combinations
                  </span>
                </h3>
                <p className="text-[11px] text-neutral-500">
                  Edit individual variant prices, stock, and SKUs below.
                </p>
              </div>

              {/* Bulk Edit Toggle */}
              {variants.length > 1 && (
                <button
                  type="button"
                  onClick={() => setShowBulkActions(!showBulkActions)}
                  className="inline-flex items-center gap-1 text-xs text-neutral-600 hover:text-neutral-900 hover:underline cursor-pointer"
                >
                  <Sparkles className="h-3 w-3 text-amber-500" />
                  <span>{showBulkActions ? "Hide bulk edit" : "Bulk edit prices & stock"}</span>
                </button>
              )}
            </div>

            {/* BULK ACTION BAR */}
            {showBulkActions && variants.length > 1 && (
              <div className="flex flex-wrap items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-3 text-xs animate-in fade-in duration-150">
                {/* Bulk Price */}
                <div className="flex items-center gap-1.5">
                  <span className="text-neutral-600 font-medium">Price (₹):</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 1499"
                    value={bulkPriceInput}
                    onChange={(e) => setBulkPriceInput(e.target.value)}
                    className="h-7 w-24 rounded-md border border-neutral-200 bg-white px-2 text-xs font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleApplyBulkPrice}
                    disabled={!bulkPriceInput}
                    className="h-7 rounded-md bg-neutral-900 px-2.5 text-[11px] font-medium text-white hover:bg-neutral-800 disabled:opacity-40 cursor-pointer"
                  >
                    Apply All
                  </button>
                </div>

                {/* Bulk Stock */}
                <div className="flex items-center gap-1.5">
                  <span className="text-neutral-600 font-medium">Stock:</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 25"
                    value={bulkStockInput}
                    onChange={(e) => setBulkStockInput(e.target.value)}
                    className="h-7 w-20 rounded-md border border-neutral-200 bg-white px-2 text-xs font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleApplyBulkStock}
                    disabled={!bulkStockInput}
                    className="h-7 rounded-md bg-neutral-900 px-2.5 text-[11px] font-medium text-white hover:bg-neutral-800 disabled:opacity-40 cursor-pointer"
                  >
                    Apply All
                  </button>
                </div>

                {basePrice && (
                  <button
                    type="button"
                    onClick={handleResetToBasePrice}
                    className="inline-flex items-center gap-1 text-[11px] text-neutral-500 hover:text-neutral-900 ml-auto cursor-pointer"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>Reset prices to base (₹{basePrice})</span>
                  </button>
                )}
              </div>
            )}

            {/* VARIANTS EDITABLE TABLE */}
            {variants.length > 0 ? (
              <div className="overflow-x-auto rounded-xl border border-neutral-200 shadow-2xs">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-neutral-200 bg-[#FAFAF9] text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">
                    <tr>
                      <th className="p-3">Variant Combination</th>
                      <th className="p-3 w-40">
                        <span className="flex items-center gap-1">
                          <Barcode className="h-3 w-3" />
                          <span>SKU Code</span>
                        </span>
                      </th>
                      <th className="p-3 w-32">
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          <span>Price (₹)</span>
                        </span>
                      </th>
                      <th className="p-3 w-28">
                        <span className="flex items-center gap-1">
                          <Package className="h-3 w-3" />
                          <span>Stock Qty</span>
                        </span>
                      </th>
                      <th className="p-3 w-28">Status</th>
                      <th className="p-3 w-10 text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 bg-white">
                    {variants.map((v, idx) => (
                      <tr key={v.id} className="hover:bg-neutral-50/70 transition-colors">
                        {/* Variant Title */}
                        <td className="p-3">
                          <span className="font-semibold text-neutral-900 block">
                            {v.title}
                          </span>
                          <span className="text-[10px] text-neutral-400 font-mono">
                            #{idx + 1}
                          </span>
                        </td>

                        {/* SKU Input */}
                        <td className="p-3">
                          <input
                            type="text"
                            value={v.sku}
                            onChange={(e) => updateVariant(v.title, "sku", e.target.value)}
                            placeholder="SKU-CODE"
                            className="h-8 w-full rounded-md border border-neutral-200 bg-white px-2 text-xs font-mono text-neutral-800 focus:border-neutral-900 focus:outline-none"
                          />
                        </td>

                        {/* Price Input */}
                        <td className="p-3">
                          <div className="relative">
                            <span className="absolute top-1/2 left-2 -translate-y-1/2 text-neutral-400 font-mono text-xs">
                              ₹
                            </span>
                            <input
                              type="number"
                              min="0"
                              value={v.price}
                              onChange={(e) => updateVariant(v.title, "price", e.target.value)}
                              placeholder={basePrice ? String(basePrice) : "0"}
                              className="h-8 w-full rounded-md border border-neutral-200 bg-white pl-5 pr-2 text-xs font-mono font-medium text-neutral-900 focus:border-neutral-900 focus:outline-none"
                            />
                          </div>
                        </td>

                        {/* Stock Input */}
                        <td className="p-3">
                          <input
                            type="number"
                            min="0"
                            value={v.stock}
                            onChange={(e) => updateVariant(v.title, "stock", e.target.value)}
                            placeholder="0"
                            className="h-8 w-full rounded-md border border-neutral-200 bg-white px-2 text-xs font-mono text-neutral-900 focus:border-neutral-900 focus:outline-none"
                          />
                        </td>

                        {/* Status Selector / Toggle */}
                        <td className="p-3">
                          <button
                            type="button"
                            onClick={() => updateVariant(v.title, "isAvailable", !v.isAvailable)}
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold transition-colors cursor-pointer ${
                              v.isAvailable && Number(v.stock || "0") > 0
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-neutral-100 text-neutral-600 border border-neutral-200"
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
                            className="text-neutral-400 hover:text-rose-600 p-1 rounded transition-colors cursor-pointer"
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
              <div className="rounded-xl border border-dashed border-neutral-200 bg-neutral-50/50 p-6 text-center">
                <p className="text-xs font-medium text-neutral-700">
                  No variant combinations generated yet
                </p>
                <p className="mt-1 text-[11px] text-neutral-400">
                  Add values (e.g. S, M, L) to your options above to create combinations.
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
