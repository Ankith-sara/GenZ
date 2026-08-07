"use client";

import { useActionState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatInr } from "@/lib/products";
import {
  addVariant,
  deleteVariant,
  type VariantFormState,
} from "@/app/dashboard/seller/products/actions";
import type { ProductVariant } from "@/types/database";

const inputClass =
  "mt-1.5 w-full rounded-xl border border-[#E5E5E0] bg-white px-3 py-2.5 text-xs text-black placeholder:text-[#8C8C85] focus:border-black focus:ring-1 focus:ring-black focus-visible:outline-none transition-all";

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
    <div>
      <p className="font-graphik mb-1 text-xs font-semibold tracking-wider text-[#1A1A18] uppercase">
        Variants
      </p>
      <p className="font-graphik mb-4 text-xs leading-relaxed text-[#8C8C85]">
        Add options like Color/Red or Size/Large, each with its own optional price
        override and stock count.
      </p>

      {variants.length > 0 && (
        <div className="mb-6 overflow-hidden rounded-2xl border border-[#E5E5E0] bg-[#FAF7F0]">
          <ul className="divide-y divide-[#E5E5E0]">
            {variants.map((variant) => (
              <li
                key={variant.id}
                className="font-graphik flex items-center justify-between gap-3 px-4 py-3.5 text-xs text-black"
              >
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="rounded bg-[#F0F0EC] px-2 py-0.5 text-[9px] font-bold tracking-wider text-[#8C8C85] uppercase">
                    {variant.variant_name}
                  </span>
                  <span className="rounded border border-[#E5E5E0] bg-white px-2 py-0.5 font-semibold text-black">
                    {variant.variant_value}
                  </span>
                  {variant.price_inr !== null && (
                    <span className="ml-1 font-semibold text-[#52524E]">
                      {formatInr(variant.price_inr)}
                    </span>
                  )}
                  {variant.stock_qty !== null && (
                    <span className="ml-1 text-[11px] text-[#8C8C85]">
                      ({variant.stock_qty} in stock)
                    </span>
                  )}
                </div>
                <form action={deleteVariant.bind(null, productId, variant.id)}>
                  <button
                    type="submit"
                    aria-label={`Remove ${variant.variant_name}: ${variant.variant_value}`}
                    className="rounded-lg border border-transparent p-1.5 text-[#8C8C85] transition-colors hover:border-[#E5E5E0] hover:bg-white hover:text-red-600"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </form>
              </li>
            ))}
          </ul>
        </div>
      )}

      <form action={formAction} className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div>
          <label htmlFor="variant_name" className={labelClass}>
            Name
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
            Value
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
            Price (INR)
          </label>
          <input
            id="price_inr"
            name="price_inr"
            type="number"
            min={0}
            step="0.01"
            placeholder="e.g. 150"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="stock_qty" className={labelClass}>
            Stock
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
        <div className="col-span-2 mt-2 sm:col-span-4">
          <Button
            type="submit"
            className="w-full rounded-xl bg-black px-5 py-2.5 text-[10px] font-semibold tracking-wider text-white uppercase transition-all hover:bg-neutral-800 sm:w-auto"
            disabled={isPending}
          >
            {isPending ? "Adding…" : "Add variant"}
          </Button>
        </div>
      </form>

      {state?.error && (
        <p role="alert" className="mt-2 text-xs font-semibold text-rose-600">
          {state.error}
        </p>
      )}
    </div>
  );
}
