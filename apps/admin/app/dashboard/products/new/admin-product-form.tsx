"use client";

import React, { useActionState } from "react";
import { ProductEditorForm, type SellerOption } from "@genz/ui/shared-features";
import { createProduct, type ProductFormState } from "@/app/dashboard/products/actions";

export type { SellerOption };

interface AdminProductFormProps {
  sellers: SellerOption[];
  adminUserId: string;
}

export function AdminProductForm({ sellers, adminUserId }: AdminProductFormProps) {
  const [state, formAction, isPending] = useActionState<ProductFormState, FormData>(
    createProduct,
    {}
  );

  return (
    <ProductEditorForm
      role="admin"
      sellers={sellers}
      adminUserId={adminUserId}
      action={formAction}
      state={state}
      isPending={isPending}
      cancelHref="/admin/dashboard/products"
    />
  );
}
