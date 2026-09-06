"use client";

import React, { useActionState, useState, startTransition } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Eye,
  Save,
  Send,
  Loader2,
  Image as ImageIcon,
  X,
} from "lucide-react";
import { Button, MediaCard, type ProductImageItem, VariantsCard } from "@genz/ui";
import { createProduct, type ProductFormState } from "@/app/dashboard/products/actions";
import { TOY_CATEGORIES } from "@/features/products/lib/products";
import { BasicInfoCard } from "./components/basic-info-card";
import { CatalogOwnershipCard } from "./components/catalog-ownership-card";
import { InventoryCard } from "./components/inventory-card";
import { TaxComplianceCard } from "./components/tax-compliance-card";
import { MerchandisingCard } from "./components/merchandising-card";
import { PublishingCard } from "./components/publishing-card";

interface SellerProductFormProps {
  sellerId: string;
  sellerBusinessName?: string;
}

const PRESSABLE = "cursor-pointer transition-all duration-150 ease-out active:scale-[0.98]";

export function SellerProductForm({ sellerId, sellerBusinessName }: SellerProductFormProps) {
  const [state, formAction, isPending] = useActionState<ProductFormState, FormData>(
    createProduct,
    {}
  );

  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // 1. Basic Info State
  const [name, setName] = useState("");
  const [category, setCategory] = useState<string>(TOY_CATEGORIES[0] || "Etikoppaka Wooden Toys");
  const [description, setDescription] = useState("");
  const [materials, setMaterials] = useState("");
  const [priceInr, setPriceInr] = useState("");

  // 2. Media State (Unified 8-image gallery)
  const [images, setImages] = useState<ProductImageItem[]>([]);
  const coverPreview = images[0]?.previewUrl || null;

  // 3. Inventory State
  const [sku, setSku] = useState("");
  const [barcode, setBarcode] = useState("");
  const [stockQty, setStockQty] = useState("");
  const [lowStockThreshold, setLowStockThreshold] = useState("5");
  const [trackInventory, setTrackInventory] = useState(true);

  // 4. Tax & Compliance State
  const [gstRate, setGstRate] = useState("12");
  const [hsnCode, setHsnCode] = useState("");
  const [countryOfOrigin, setCountryOfOrigin] = useState("India");

  // 5. Merchandising State
  const [isFeatured, setIsFeatured] = useState(false);
  const [isNewArrival, setIsNewArrival] = useState(true);
  const [isBestSeller, setIsBestSeller] = useState(false);

  // 6. Publishing State
  const [status, setStatus] = useState<"published" | "draft">("published");

  const executeSubmit = (targetStatus?: "published" | "draft") => {
    const formElement = document.getElementById("enterprise-product-form") as HTMLFormElement | null;
    if (!formElement) return;

    const formData = new FormData(formElement);
    formData.delete("cover_image");
    formData.delete("gallery_images");

    if (images[0]?.file) {
      formData.append("cover_image", images[0].file);
    }
    images.slice(1).forEach((item) => {
      if (item.file) {
        formData.append("gallery_images", item.file);
      }
    });

    if (targetStatus) {
      formData.set("status", targetStatus);
    }

    startTransition(() => {
      formAction(formData);
    });
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-16">
      {/* PAGE HEADER & ACTIONS */}
      <div className="flex flex-col gap-4 rounded-xl border border-[#E5E5E0] bg-white p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#737373] mb-1">
            <Link href="/dashboard/products" className="hover:text-[#171717] hover:underline flex items-center gap-1">
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Products</span>
            </Link>
            <span>/</span>
            <span className="font-semibold text-[#171717]">New Listing</span>
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-[#171717]">
            Add New Product
          </h1>
          <p className="text-xs text-[#737373] mt-0.5">
            Publish your manufactured creations to the GenZ marketplace.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setStatus("draft");
              executeSubmit("draft");
            }}
            disabled={isPending}
            className={`h-9 items-center gap-1.5 rounded-lg border-[#E5E5E0] bg-white px-3.5 text-xs font-medium text-[#171717] hover:bg-[#F5F5F4] ${PRESSABLE}`}
          >
            <Save className="h-3.5 w-3.5 text-[#737373]" />
            <span>Save Draft</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => setShowPreviewModal(true)}
            className={`h-9 items-center gap-1.5 rounded-lg border-[#E5E5E0] bg-white px-3.5 text-xs font-medium text-[#171717] hover:bg-[#F5F5F4] ${PRESSABLE}`}
          >
            <Eye className="h-3.5 w-3.5 text-[#737373]" />
            <span>Preview</span>
          </Button>

          <Button
            type="button"
            onClick={() => {
              setStatus("published");
              executeSubmit("published");
            }}
            disabled={isPending}
            className={`h-9 items-center gap-1.5 rounded-lg bg-[#171717] px-4 text-xs font-medium text-white shadow-xs hover:bg-[#262626] ${PRESSABLE}`}
          >
            {isPending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Publishing…</span>
              </>
            ) : (
              <>
                <Send className="h-3.5 w-3.5" />
                <span>Publish Product</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {state?.error && (
        <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-800">
          ⚠️ {state.error}
        </div>
      )}

      {/* SINGLE COLUMN SEQUENTIAL FORM FLOW */}
      <form id="enterprise-product-form" onSubmit={(e) => { e.preventDefault(); executeSubmit(); }} noValidate className="space-y-6">
        {/* 1. Product Images (FIRST) */}
        <MediaCard
          images={images}
          onImagesChange={setImages}
          maxImages={8}
        />

        {/* 2. Basic Information (Title, Selling Price INR, Category, Materials, Full Description) */}
        <BasicInfoCard
          name={name}
          onChangeName={setName}
          priceInr={priceInr}
          onChangePriceInr={setPriceInr}
          category={category}
          onChangeCategory={setCategory}
          description={description}
          onChangeDescription={setDescription}
          materials={materials}
          onChangeMaterials={setMaterials}
        />

        {/* 3. Catalog Ownership (Seller Workshop ID) */}
        <CatalogOwnershipCard
          selectedSellerId={sellerId}
          isSellerMode={true}
          sellerBusinessName={sellerBusinessName}
        />

        {/* 4. Variants */}
        <VariantsCard basePrice={priceInr} productName={name} />

        {/* 5. Inventory */}
        <InventoryCard
          sku={sku}
          onChangeSku={setSku}
          barcode={barcode}
          onChangeBarcode={setBarcode}
          stockQty={stockQty}
          onChangeStockQty={setStockQty}
          lowStockThreshold={lowStockThreshold}
          onChangeLowStockThreshold={setLowStockThreshold}
          trackInventory={trackInventory}
          onToggleTrackInventory={setTrackInventory}
        />

        {/* 6. Tax & Compliance */}
        <TaxComplianceCard
          gstRate={gstRate}
          onChangeGstRate={setGstRate}
          hsnCode={hsnCode}
          onChangeHsnCode={setHsnCode}
          countryOfOrigin={countryOfOrigin}
          onChangeCountryOfOrigin={setCountryOfOrigin}
        />

        {/* 7. Merchandising */}
        <MerchandisingCard
          isFeatured={isFeatured}
          onToggleFeatured={setIsFeatured}
          isNewArrival={isNewArrival}
          onToggleNewArrival={setIsNewArrival}
          isBestSeller={isBestSeller}
          onToggleBestSeller={setIsBestSeller}
        />

        {/* 8. Publishing */}
        <PublishingCard
          status={status}
          onChangeStatus={setStatus}
        />

        {/* BOTTOM FORM ACTIONS */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E5E5E0]">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setStatus("draft");
              executeSubmit("draft");
            }}
            disabled={isPending}
            className={`h-10 items-center gap-1.5 rounded-lg border-[#E5E5E0] bg-white px-4 text-xs font-medium text-[#171717] hover:bg-[#F5F5F4] ${PRESSABLE}`}
          >
            <Save className="h-4 w-4 text-[#737373]" />
            <span>Save Draft</span>
          </Button>

          <Button
            type="button"
            onClick={() => {
              setStatus("published");
              executeSubmit("published");
            }}
            disabled={isPending}
            className={`h-10 items-center gap-1.5 rounded-lg bg-[#171717] px-6 text-xs font-medium text-white shadow-xs hover:bg-[#262626] ${PRESSABLE}`}
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Publishing Product…</span>
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                <span>Publish Product</span>
              </>
            )}
          </Button>
        </div>
      </form>

      {/* STOREFRONT PREVIEW MODAL */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-lg rounded-2xl border border-[#E5E5E0] bg-white p-6 shadow-xl">
            <button
              type="button"
              onClick={() => setShowPreviewModal(false)}
              className="absolute top-4 right-4 text-[#737373] hover:text-[#171717]"
            >
              <X className="h-5 w-5" />
            </button>

            <span className="text-[10px] font-semibold text-[#737373] uppercase tracking-wider block mb-2">
              Storefront Customer Card Preview
            </span>

            <div className="overflow-hidden rounded-xl border border-[#E5E5E0] bg-white shadow-xs">
              <div className="relative aspect-square w-full bg-[#FAFAF9] flex items-center justify-center">
                {coverPreview ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={coverPreview} alt="" className="h-full w-full object-cover" />
                ) : (
                  <ImageIcon className="h-12 w-12 text-[#A3A3A3]" />
                )}
                {isNewArrival && (
                  <span className="absolute top-3 left-3 rounded-full bg-[#171717] px-2.5 py-0.5 text-[10px] font-semibold text-white">
                    NEW ARRIVAL
                  </span>
                )}
              </div>

              <div className="p-4 space-y-2">
                <span className="text-[11px] font-semibold text-[#737373] block uppercase">
                  {category || "Category"}
                </span>
                <h3 className="text-sm font-semibold text-[#171717] truncate">
                  {name || "Untitled Product"}
                </h3>
                <div className="flex items-center justify-between pt-1">
                  <span className="font-mono text-sm font-bold text-[#171717]">
                    ₹{priceInr ? Number(priceInr).toLocaleString() : "0"}
                  </span>
                  <span className="rounded-full bg-[#ECFDF5] px-2.5 py-0.5 font-mono text-[10px] font-semibold text-[#047857]">
                    In Stock
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <Button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="h-8 rounded-lg bg-[#171717] px-4 text-xs font-medium text-white"
              >
                Close Preview
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
