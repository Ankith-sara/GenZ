"use client";

import { useActionState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatInr } from "@/lib/products";
import {
  addVariant,
  deleteVariant,
  type VariantFormState,
} from "@/app/dashboard/manufacturer/products/actions";
import type { ProductVariant } from "@/types/database";

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
      <p className="mb-2 text-sm font-medium">Variants</p>
      <p className="text-muted-foreground mb-4 text-xs">
        Add options like Color/Red or Size/Large, each with its own optional price
        override and stock count.
      </p>

      {variants.length > 0 && (
        <ul className="divide-border border-border mb-4 divide-y rounded-[4px] border">
          {variants.map((variant) => (
            <li
              key={variant.id}
              className="flex items-center justify-between gap-3 px-4 py-3 text-sm"
            >
              <div>
                <span className="font-medium">{variant.variant_name}:</span>{" "}
                {variant.variant_value}
                {variant.price_inr !== null && (
                  <span className="text-muted-foreground">
                    {" "}
                    · {formatInr(variant.price_inr)}
                  </span>
                )}
                {variant.stock_qty !== null && (
                  <span className="text-muted-foreground">
                    {" "}
                    · {variant.stock_qty} in stock
                  </span>
                )}
              </div>
              <form action={deleteVariant.bind(null, productId, variant.id)}>
                <button
                  type="submit"
                  aria-label={`Remove ${variant.variant_name}: ${variant.variant_value}`}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}

      <form action={formAction} className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div>
          <Label htmlFor="variant_name" className="text-xs">
            Name
          </Label>
          <Input id="variant_name" name="variant_name" placeholder="Color" required />
        </div>
        <div>
          <Label htmlFor="variant_value" className="text-xs">
            Value
          </Label>
          <Input id="variant_value" name="variant_value" placeholder="Red" required />
        </div>
        <div>
          <Label htmlFor="price_inr" className="text-xs">
            Price override
          </Label>
          <Input id="price_inr" name="price_inr" type="number" min={0} step="0.01" />
        </div>
        <div>
          <Label htmlFor="stock_qty" className="text-xs">
            Stock
          </Label>
          <Input id="stock_qty" name="stock_qty" type="number" min={0} step="1" />
        </div>
        <div className="col-span-2 sm:col-span-4">
          <Button type="submit" variant="outline" size="sm" disabled={isPending}>
            {isPending ? "Adding…" : "Add variant"}
          </Button>
        </div>
      </form>

      {state?.error && (
        <p role="alert" className="text-destructive mt-2 text-sm">
          {state.error}
        </p>
      )}
    </div>
  );
}
