"use client";

import { useActionState } from "react";
import { Trash2, Plus } from "lucide-react";
import { Button } from "@genz/ui";
import { formatInr } from "@/features/products/lib/products";
import {
  addVariant,
  deleteVariant,
  type VariantFormState,
} from "@\/app\/dashboard\/products/actions";
import type { ProductVariant } from "@genz/types";

const inputClass =
  "mt-1 w-full rounded-xl border border-[#E5E5E0] bg-[#FAF8F4]/50 px-3 py-2 text-xs font-medium text-black placeholder:text-[#8C8C85] focus:border-black focus:bg-white focus:ring-1 focus:ring-black focus-visible:outline-none transition-all";

const labelClass =
  "block text-[10px] font-bold text-[#1A1A18] uppercase tracking-wider font-graphik";

export function ProductVariantEditor({
  productId,
  variants,
}: {
  productId: string;
  variants: ProductVariant[];
}) {
  const addVariantForProduct = addVariant.bind(null, productId);
  const [state, formAction, isPending] = useActionState<VariantFormState, FormData>(
    addVariantForProduct,
    {}
  );

  return (
    <div className="font-graphik space-y-4">
      <p className="text-xs leading-relaxed text-[#73736E]">
        Add custom options like Color (Red) or Size (Large) with optional price override
        and stock quantity.
      </p>

      {/* Existing Variants List */}
      {variants.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-[#E5E5E0] bg-[#FAF8F4]">
          <ul className="divide-y divide-[#E5E5E0]">
            {variants.map((variant) => (
              <li
                key={variant.id}
                className="flex items-center justify-between gap-2 px-3 py-2.5 text-xs text-black"
              >
                <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
                  <span className="rounded bg-[#E5E5E0] px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-[#52524E] uppercase">
                    {variant.variant_name}
                  </span>
                  <span className="font-semibold text-black">
                    {variant.variant_value}
                  </span>
                  {variant.price_inr !== null && (
                    <span className="font-mono text-[11px] font-bold text-emerald-700">
                      {formatInr(variant.price_inr)}
                    </span>
                  )}
                  {variant.stock_qty !== null && (
                    <span className="font-mono text-[10px] text-[#73736E]">
                      ({variant.stock_qty} in stock)
                    </span>
                  )}
                </div>
                <form action={deleteVariant.bind(null, productId, variant.id)}>
                  <button
                    type="submit"
                    aria-label={`Remove ${variant.variant_name}: ${variant.variant_value}`}
                    className="rounded-lg border border-transparent p-1 text-[#8C8C85] transition-colors hover:border-[#E5E5E0] hover:bg-white hover:text-rose-600"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </form>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Add Variant Form in 4-Column Full Width Grid */}
      <form action={formAction} className="space-y-3 pt-1">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
          <div>
            <label htmlFor="variant_name" className={labelClass}>
              Option Name *
            </label>
            <input
              id="variant_name"
              name="variant_name"
              placeholder="e.g. Color"
              required
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="variant_value" className={labelClass}>
              Option Value *
            </label>
            <input
              id="variant_value"
              name="variant_value"
              placeholder="e.g. Red"
              required
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="price_inr" className={labelClass}>
              Price (₹ INR)
            </label>
            <input
              id="price_inr"
              name="price_inr"
              type="number"
              min={0}
              step="0.01"
              placeholder="e.g. 1499"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="stock_qty" className={labelClass}>
              Stock Qty
            </label>
            <input
              id="stock_qty"
              name="stock_qty"
              type="number"
              min={0}
              step="1"
              placeholder="e.g. 50"
              className={inputClass}
            />
          </div>
        </div>

        <Button
          type="submit"
          className="flex h-10 items-center justify-center gap-1.5 rounded-xl bg-black px-6 text-xs font-semibold text-white shadow-2xs transition-all hover:bg-neutral-800 sm:w-auto"
          disabled={isPending}
        >
          <Plus className="h-3.5 w-3.5" />
          <span>{isPending ? "Adding Variant…" : "Add Product Variant"}</span>
        </Button>
      </form>

      {state?.error && (
        <p role="alert" className="mt-1 text-xs font-semibold text-rose-600">
          {state.error}
        </p>
      )}
    </div>
  );
}
