"use client";

import React from "react";
import {
  ProductsCatalogManager,
  type SharedProductRecord,
} from "@genz/ui/shared-features";
import {
  setProductStatus,
  quickUpdateProduct,
  sellerDeleteProductAction,
} from "./actions";
import type { ProductStatus } from "@genz/types";

export type SellerProductRecord = SharedProductRecord;

interface SellerProductsClientProps {
  initialProducts: SellerProductRecord[];
}

export function SellerProductsClient({ initialProducts }: SellerProductsClientProps) {
  const handleUpdateStatus = async (
    productId: string,
    nextStatus: "published" | "draft"
  ) => {
    const res = await setProductStatus(productId, nextStatus as ProductStatus);
    if (res && "error" in res && res.error) {
      throw new Error(res.error);
    }
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
    await quickUpdateProduct(productId, data);
  };

  const handleDeleteProduct = async (productId: string) => {
    await sellerDeleteProductAction(productId);
  };

  return (
    <ProductsCatalogManager
      role="seller"
      initialProducts={initialProducts}
      onUpdateStatus={handleUpdateStatus}
      onUpdateProduct={handleUpdateProduct}
      onDeleteProduct={handleDeleteProduct}
      newProductHref="/dashboard/products/new"
      editProductHref={(id) => `/dashboard/products/${id}`}
      storefrontHref={(id) => `/products/${id}`}
    />
  );
}
