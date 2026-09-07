"use client";

import React from "react";
import {
  ProductsCatalogManager,
  type SharedProductRecord,
} from "@genz/ui/shared-features";
import {
  adminSetProductStatus,
  adminDeleteProduct,
  adminUpdateProduct,
} from "./actions";

export type ProductRecord = SharedProductRecord;

interface ProductsTableClientProps {
  initialProducts: ProductRecord[];
}

export function ProductsTableClient({ initialProducts }: ProductsTableClientProps) {
  const handleUpdateStatus = async (
    productId: string,
    nextStatus: "published" | "draft"
  ) => {
    await adminSetProductStatus(productId, nextStatus);
  };

  const handleUpdateProduct = async (
    productId: string,
    data: {
      name: string;
      category?: string | null;
      price_inr?: number | null;
      status?: string | null;
      description?: string | null;
    }
  ) => {
    await adminUpdateProduct(productId, data);
  };

  const handleDeleteProduct = async (productId: string) => {
    await adminDeleteProduct(productId);
  };

  return (
    <ProductsCatalogManager
      role="admin"
      initialProducts={initialProducts}
      onUpdateStatus={handleUpdateStatus}
      onUpdateProduct={handleUpdateProduct}
      onDeleteProduct={handleDeleteProduct}
      newProductHref="/admin/dashboard/products/new"
      editProductHref={(id) => `/admin/dashboard/products/${id}`}
      storefrontHref={(id) => `/products/${id}`}
    />
  );
}
