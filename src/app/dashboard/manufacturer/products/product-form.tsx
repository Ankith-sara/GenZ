"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createProduct, updateProduct, type ProductFormState } from "./actions";
import { TOY_CATEGORIES, AGE_GROUPS } from "@/lib/products";
import type { Product } from "@/types/database";

type Props =
  { mode: "create"; product?: undefined } | { mode: "edit"; product: Product };

const selectClass =
  "h-11 w-full rounded-[4px] border border-input bg-card px-3.5 text-base text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground";

export function ProductForm(props: Props) {
  const action =
    props.mode === "create"
      ? createProduct
      : updateProduct.bind(null, props.product.id);

  const [state, formAction, isPending] = useActionState<ProductFormState, FormData>(
    action,
    {}
  );

  const product = props.mode === "edit" ? props.product : undefined;

  return (
    <form action={formAction} noValidate>
      <div className="mb-4">
        <Label htmlFor="name">Product name</Label>
        <Input id="name" name="name" required defaultValue={product?.name ?? ""} />
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <Label htmlFor="category">Category</Label>
          <select
            id="category"
            name="category"
            defaultValue={product?.category ?? TOY_CATEGORIES[0]}
            className={selectClass}
          >
            {TOY_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="age_group">Age group</Label>
          <select
            id="age_group"
            name="age_group"
            defaultValue={product?.age_group ?? ""}
            className={selectClass}
          >
            <option value="">Not specified</option>
            {AGE_GROUPS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="price_inr">Price (INR)</Label>
          <Input
            id="price_inr"
            name="price_inr"
            type="number"
            min={0}
            step="0.01"
            defaultValue={product?.price_inr ?? ""}
          />
        </div>
      </div>

      <div className="mb-4">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          rows={4}
          defaultValue={product?.description ?? ""}
        />
      </div>

      <div className="mb-2">
        <Label htmlFor="materials">Materials</Label>
        <Input
          id="materials"
          name="materials"
          placeholder="Beech wood, non-toxic paint, cotton rope"
          defaultValue={product?.materials?.join(", ") ?? ""}
        />
        <p className="text-muted-foreground mt-1.5 text-xs">
          Comma-separated — shown on the product page so buyers know what it&apos;s made
          of.
        </p>
      </div>

      {state?.error && (
        <p role="alert" className="text-destructive mt-2 mb-4 text-sm">
          {state.error}
        </p>
      )}

      <Button type="submit" className="mt-4" disabled={isPending}>
        {isPending
          ? "Saving…"
          : props.mode === "create"
            ? "Create product"
            : "Save changes"}
      </Button>
    </form>
  );
}
