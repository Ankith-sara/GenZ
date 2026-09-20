"use client";

import React, { useState, useMemo, useCallback } from "react";
import { Layers, Plus, Trash2, X, Sparkles, RotateCcw } from "lucide-react";
import { M3Switch } from "./product-info-cards";

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

export const STANDARD_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];

export function VariantsCard({ basePrice = "", productName = "" }: VariantsCardProps) {
  const [hasVariants, setHasVariants] = useState(false);

  // Option groups (e.g. Size, Color)
  const [options, setOptions] = useState<OptionGroup[]>([
    {
      id: "opt-1",
      name: "Size",
      values: ["XS", "S", "M", "L", "XL", "XXL", "3XL"],
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
            .slice(0, 4)
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

  // Derive variants directly from combinations + overrides
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
    const newId = `opt-${Date.now()}`;
    setOptions([
      ...options,
      {
        id: newId,
        name: "",
        values: [],
      },
    ]);
  };

  // Remove option group
  const removeOptionGroup = (id: string) => {
    setOptions(options.filter((o) => o.id !== id));
  };

  // Update option name
  const updateOptionName = (id: string, name: string) => {
    setOptions(options.map((o) => (o.id === id ? { ...o, name } : o)));
  };

  // Add a value to an option group
  const addValueTag = (id: string) => {
    const raw = newTagInputs[id] || "";
    const trimmed = raw.trim().replace(/^,+|,+$/g, "");
    if (!trimmed) return;

    setOptions(
      options.map((o) => {
        if (o.id === id && !o.values.includes(trimmed)) {
          return { ...o, values: [...o.values, trimmed] };
        }
        return o;
      })
    );

    setNewTagInputs({ ...newTagInputs, [id]: "" });
  };

  // Remove a value tag from an option group
  const removeValueTag = (id: string, indexToRemove: number) => {
    setOptions(
      options.map((o) => {
        if (o.id === id) {
          return {
            ...o,
            values: o.values.filter((_, idx) => idx !== indexToRemove),
          };
        }
        return o;
      })
    );
  };

  // Update a specific field for a variant
  const updateVariant = (
    title: string,
    field: keyof VariantOverride,
    value: string | boolean
  ) => {
    setCustomOverrides((prev) => ({
      ...prev,
      [title]: {
        ...prev[title],
        [field]: value,
      },
    }));
  };

  // Remove / exclude a variant row
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
    <section
      id="variants"
      className="scroll-mt-24 overflow-hidden rounded-xl border border-[#E5E5E0] bg-white shadow-xs"
    >
      {/* SECTION HEAD */}
      <div className="flex items-start justify-between gap-3 border-b border-[#E5E5E0] p-5 pb-3 sm:p-6 sm:pb-3">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 text-[#52524E]">
            <Layers className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-[#1A1A18]">Variants</h2>
            <p className="mt-0.5 max-w-[60ch] text-xs text-[#52524E]">
              Sell this piece in more than one size, colour or finish, each with its own
              price and stock.
            </p>
          </div>
        </div>

        {/* M3 Switch in header */}
        <div className="shrink-0 pt-0.5">
          <M3Switch
            id="has-variants"
            checked={hasVariants}
            onChange={setHasVariants}
            label="This product has options"
          />
        </div>
      </div>

      {hasVariants && (
        <div className="space-y-5 p-5 sm:p-6">
          {/* 1. OPTIONS BUILDER */}
          <div className="space-y-3">
            {options.map((opt, optIdx) => (
              <div
                key={opt.id}
                className="flex flex-col items-start gap-3 rounded-lg border border-[#E5E5E0] bg-[#FAF8F4] p-3.5 transition-all sm:flex-row"
              >
                {/* Option Name Input */}
                <div className="w-full shrink-0 sm:w-44">
                  <input
                    id={`opt-name-${opt.id}`}
                    type="text"
                    value={opt.name}
                    onChange={(e) => updateOptionName(opt.id, e.target.value)}
                    placeholder={`Option ${optIdx + 1} name, e.g. Size`}
                    className="h-10 w-full rounded-lg border border-[#E5E5E0] bg-white px-3 text-xs font-semibold text-[#1A1A18] focus:border-[#1A1A18] focus:ring-1 focus:ring-[#1A1A18] focus:outline-none"
                  />
                </div>

                {/* Option Values Chips Field & Quick Presets */}
                <div className="w-full flex-1 space-y-2">
                  <div className="flex min-h-10 w-full flex-wrap items-center gap-1.5 rounded-lg border border-[#E5E5E0] bg-white p-2 focus-within:border-[#1A1A18] focus-within:ring-1 focus-within:ring-[#1A1A18]">
                    {opt.values.map((val, valIdx) => (
                      <span
                        key={valIdx}
                        className="inline-flex items-center gap-1.5 rounded-md border border-[#E5E5E0] bg-[#FAF8F4] px-2.5 py-1 text-xs font-medium text-[#1A1A18]"
                      >
                        <span>{val}</span>
                        <button
                          type="button"
                          onClick={() => removeValueTag(opt.id, valIdx)}
                          className="cursor-pointer text-[#52524E] hover:text-[#1A1A18]"
                          aria-label={`Remove ${val}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}

                    <input
                      type="text"
                      placeholder={
                        opt.values.length === 0
                          ? "Type a value and press Enter"
                          : "Add value..."
                      }
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
                      onBlur={() => addValueTag(opt.id)}
                      className="h-7 min-w-[120px] flex-1 bg-transparent px-2 text-xs text-[#1A1A18] placeholder:text-[#52524E]/50 focus:outline-none"
                    />
                  </div>

                  {/* Sizing Quick Presets (XS to 3XL) */}
                  {opt.name.toLowerCase().includes("size") && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5 text-[11px]">
                      <span className="font-medium text-[#52524E]">Presets:</span>
                      <button
                        type="button"
                        onClick={() => {
                          setOptions(
                            options.map((o) =>
                              o.id === opt.id
                                ? {
                                    ...o,
                                    values: Array.from(
                                      new Set([...o.values, ...STANDARD_SIZES])
                                    ),
                                  }
                                : o
                            )
                          );
                        }}
                        className="inline-flex cursor-pointer items-center rounded-md border border-[#1A1A18] bg-[#1A1A18] px-2 py-0.5 text-[11px] font-semibold text-white transition-colors hover:bg-[#2E2E2B]"
                      >
                        + All XS to 3XL
                      </button>
                      {STANDARD_SIZES.map((sz) => {
                        const isSelected = opt.values.includes(sz);
                        return (
                          <button
                            key={sz}
                            type="button"
                            onClick={() => {
                              if (isSelected) {
                                setOptions(
                                  options.map((o) =>
                                    o.id === opt.id
                                      ? {
                                          ...o,
                                          values: o.values.filter((v) => v !== sz),
                                        }
                                      : o
                                  )
                                );
                              } else {
                                setOptions(
                                  options.map((o) =>
                                    o.id === opt.id
                                      ? { ...o, values: [...o.values, sz] }
                                      : o
                                  )
                                );
                              }
                            }}
                            className={`inline-flex cursor-pointer items-center rounded-md border px-2 py-0.5 text-[11px] font-medium transition-colors ${
                              isSelected
                                ? "border-[#1A1A18] bg-[#FAF8F4] font-bold text-[#1A1A18]"
                                : "border-[#E5E5E0] bg-white text-[#52524E] hover:border-[#1A1A18] hover:text-[#1A1A18]"
                            }`}
                          >
                            {sz}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Remove Option Button */}
                {options.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeOptionGroup(opt.id)}
                    title="Remove this option"
                    className="cursor-pointer rounded-full p-2 text-[#52524E] transition-colors hover:bg-rose-50 hover:text-rose-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}

            {/* Add Option Button */}
            {options.length < 3 && (
              <button
                type="button"
                onClick={addOptionGroup}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold text-[#1A1A18] transition-colors hover:bg-black/5"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add option</span>
              </button>
            )}
          </div>

          {/* 2. VARIANT COMBINATIONS MATRIX TABLE */}
          <div className="space-y-3 pt-2">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-xs font-semibold text-[#1A1A18]">
                Variant combinations ({variants.length})
              </span>

              {variants.length > 1 && (
                <button
                  type="button"
                  onClick={() => setShowBulkActions(!showBulkActions)}
                  className="inline-flex cursor-pointer items-center gap-1 text-xs font-medium text-[#52524E] hover:text-[#1A1A18] hover:underline"
                >
                  <Sparkles className="h-3.5 w-3.5 text-[#C89D32]" />
                  <span>
                    {showBulkActions ? "Hide bulk edit" : "Bulk edit prices & stock"}
                  </span>
                </button>
              )}
            </div>

            {/* Bulk Action Bar */}
            {showBulkActions && variants.length > 1 && (
              <div className="flex flex-wrap items-center gap-3 rounded-lg border border-[#E5E5E0] bg-[#FAF8F4] p-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-[#52524E]">Price (₹):</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 1499"
                    value={bulkPriceInput}
                    onChange={(e) => setBulkPriceInput(e.target.value)}
                    className="h-8 w-24 rounded-lg border border-[#E5E5E0] bg-white px-2.5 font-mono text-xs text-[#1A1A18] focus:border-[#1A1A18] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleApplyBulkPrice}
                    disabled={!bulkPriceInput}
                    className="h-8 cursor-pointer rounded-full bg-[#1A1A18] px-3 text-[11px] font-semibold text-white hover:bg-[#2E2E2B] disabled:opacity-40"
                  >
                    Apply
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-[#52524E]">Stock:</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="25"
                    value={bulkStockInput}
                    onChange={(e) => setBulkStockInput(e.target.value)}
                    className="h-8 w-20 rounded-lg border border-[#E5E5E0] bg-white px-2.5 font-mono text-xs text-[#1A1A18] focus:border-[#1A1A18] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleApplyBulkStock}
                    disabled={!bulkStockInput}
                    className="h-8 cursor-pointer rounded-full bg-[#1A1A18] px-3 text-[11px] font-semibold text-white hover:bg-[#2E2E2B] disabled:opacity-40"
                  >
                    Apply
                  </button>
                </div>

                {basePrice && (
                  <button
                    type="button"
                    onClick={handleResetToBasePrice}
                    className="ml-auto inline-flex cursor-pointer items-center gap-1 text-[11px] text-[#52524E] hover:text-[#1A1A18]"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>Reset to base (₹{basePrice})</span>
                  </button>
                )}
              </div>
            )}

            {/* Matrix Table */}
            {variants.length > 0 ? (
              <div className="overflow-x-auto rounded-lg border border-[#E5E5E0] shadow-xs">
                <table className="w-full border-collapse text-left text-xs">
                  <thead className="border-b border-[#E5E5E0] bg-[#FAF8F4] text-[11px] font-semibold text-[#52524E]">
                    <tr>
                      <th className="p-3">Variant</th>
                      <th className="w-44 p-3">SKU</th>
                      <th className="w-36 p-3">Price (₹)</th>
                      <th className="w-28 p-3">Stock</th>
                      <th className="w-10 p-3 text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E5E0] bg-white">
                    {variants.map((v) => (
                      <tr
                        key={v.id}
                        className="transition-colors hover:bg-[#FAF8F4]/60"
                      >
                        <td className="p-3 font-semibold text-[#1A1A18]">{v.title}</td>

                        <td className="p-3">
                          <input
                            type="text"
                            value={v.sku}
                            onChange={(e) =>
                              updateVariant(v.title, "sku", e.target.value)
                            }
                            placeholder="SKU"
                            className="h-9 w-full rounded-lg border border-[#E5E5E0] bg-white px-2.5 font-mono text-xs text-[#1A1A18] focus:border-[#1A1A18] focus:ring-1 focus:ring-[#1A1A18] focus:outline-none"
                          />
                        </td>

                        <td className="p-3">
                          <input
                            type="number"
                            min="0"
                            value={v.price}
                            onChange={(e) =>
                              updateVariant(v.title, "price", e.target.value)
                            }
                            placeholder={basePrice ? String(basePrice) : "0"}
                            className="h-9 w-full rounded-lg border border-[#E5E5E0] bg-white px-2.5 font-mono text-xs font-medium text-[#1A1A18] focus:border-[#1A1A18] focus:ring-1 focus:ring-[#1A1A18] focus:outline-none"
                          />
                        </td>

                        <td className="p-3">
                          <input
                            type="number"
                            min="0"
                            value={v.stock}
                            onChange={(e) =>
                              updateVariant(v.title, "stock", e.target.value)
                            }
                            placeholder="0"
                            className="h-9 w-full rounded-lg border border-[#E5E5E0] bg-white px-2.5 font-mono text-xs text-[#1A1A18] focus:border-[#1A1A18] focus:ring-1 focus:ring-[#1A1A18] focus:outline-none"
                          />
                        </td>

                        <td className="p-3 text-center">
                          <button
                            type="button"
                            onClick={() => removeVariantRow(v.title)}
                            title="Exclude this variant"
                            className="cursor-pointer rounded p-1 text-[#52524E] transition-colors hover:text-rose-600"
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
              <div className="rounded-lg border border-dashed border-[#E5E5E0] bg-[#FAF8F4]/50 p-5 text-center">
                <p className="text-xs text-[#52524E]">
                  Add at least one option with two or more values to generate variant
                  rows.
                </p>
              </div>
            )}
          </div>

          <input
            type="hidden"
            name="variants_json"
            value={hasVariants ? JSON.stringify(variants) : ""}
          />
        </div>
      )}
    </section>
  );
}
