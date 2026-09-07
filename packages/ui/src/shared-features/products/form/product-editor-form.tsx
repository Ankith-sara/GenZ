"use client";

import React, { useState, startTransition } from "react";
import Link from "next/link";
import {
  ArrowLeft, Eye, Save, Send,
  Loader2, X, Film,
  Image as ImageIcon,
  CheckCircle2,
} from "lucide-react";
import { Button } from "../../../components/button";
import {
  BasicInfoCard,
  CatalogOwnershipCard,
  type SellerOption,
  InventoryCard,
  MerchandisingCard,
  PublishingCard,
  MediaCard,
  type ProductImageItem,
  VariantsCard,
} from "./components";

export interface ProductFormState {
  error?: string;
  success?: boolean;
}

export interface ProductEditorFormProps {
  role: "admin" | "seller";
  mode?: "create" | "edit";
  productId?: string;
  adminUserId?: string;
  sellerId?: string;
  sellerBusinessName?: string;
  sellers?: SellerOption[];
  action: (formData: FormData) => void;
  state?: ProductFormState;
  isPending?: boolean;
  cancelHref?: string;
  manageReelsHref?: string;
  reelsCount?: number;
  submitLabel?: string;
  categories?: string[];
  onUploadImage?: (file: File, index: number) => Promise<string | null>;
  initialValues?: {
    name?: string;
    priceInr?: string;
    category?: string;
    materials?: string;
    description?: string;
    sku?: string;
    stockQty?: string;
    lowStockThreshold?: string;
    trackInventory?: boolean;
    isFeatured?: boolean;
    isNewArrival?: boolean;
    isBestSeller?: boolean;
    status?: "published" | "draft";
    images?: ProductImageItem[];
  };
}

const PRESSABLE =
  "cursor-pointer transition-all duration-150 ease-out active:scale-[0.98]";

export function ProductEditorForm({
  role,
  mode = "create",
  productId = "",
  adminUserId = "",
  sellerId = "",
  sellerBusinessName,
  sellers = [],
  action,
  state,
  isPending = false,
  cancelHref = role === "admin" ? "/admin/dashboard/products" : "/dashboard/products",
  manageReelsHref,
  reelsCount,
  submitLabel,
  categories,
  onUploadImage,
  initialValues,
}: ProductEditorFormProps) {
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // 1. Basic Info State
  const [name, setName] = useState(initialValues?.name || "");
  const [priceInr, setPriceInr] = useState(initialValues?.priceInr || "");
  const [category, setCategory] = useState(
    initialValues?.category || (categories && categories[0]) || "Wooden Toys & Crafts"
  );
  const [materials, setMaterials] = useState(initialValues?.materials || "");
  const [description, setDescription] = useState(initialValues?.description || "");

  // 2. Catalog Ownership State
  const [selectedSellerId, setSelectedSellerId] = useState<string>(
    role === "seller" ? sellerId : sellerId || adminUserId || (sellers[0]?.id ?? "")
  );

  // 3. Media State
  const [images, setImages] = useState<ProductImageItem[]>(initialValues?.images || []);
  const coverPreview = images[0]?.previewUrl || null;

  // 4. Inventory State
  const [sku, setSku] = useState(initialValues?.sku || "");
  const [stockQty, setStockQty] = useState(initialValues?.stockQty || "");
  const [lowStockThreshold, setLowStockThreshold] = useState(
    initialValues?.lowStockThreshold || "5"
  );
  const [trackInventory, setTrackInventory] = useState(
    initialValues?.trackInventory ?? true
  );

  // 5. Merchandising State
  const [isFeatured, setIsFeatured] = useState(initialValues?.isFeatured ?? false);
  const [isNewArrival, setIsNewArrival] = useState(initialValues?.isNewArrival ?? true);
  const [isBestSeller, setIsBestSeller] = useState(initialValues?.isBestSeller ?? false);

  // 7. Publishing State
  const [status, setStatus] = useState<"published" | "draft">(
    initialValues?.status || "published"
  );

  const executeSubmit = async (targetStatus?: "published" | "draft") => {
    const formElement = document.getElementById(
      "shared-product-editor-form"
    ) as HTMLFormElement | null;
    if (!formElement) return;

    const formData = new FormData(formElement);

    // If a client-side upload handler is provided, upload images first
    if (onUploadImage) {
      formData.delete("cover_image");
      formData.delete("gallery_images");

      setIsUploading(true);
      try {
        const imagesToUpload = images.filter((img) => img.file && img.file.size > 0);
        const uploadPromises = imagesToUpload.map((img, idx) =>
          onUploadImage(img.file!, idx).catch((e) => {
            console.warn(`Upload failed for image ${idx}:`, e);
            return null;
          })
        );
        const uploadedPaths = await Promise.all(uploadPromises);

        const allPaths: string[] = [];
        let fileIdx = 0;
        for (const img of images) {
          if (img.file && img.file.size > 0) {
            const path = uploadedPaths[fileIdx++];
            if (path) allPaths.push(path);
          } else if (img.source === "url" && img.previewUrl) {
            allPaths.push(img.previewUrl);
          }
        }

        if (allPaths.length > 0) {
          formData.set("cover_image_path", allPaths[0]);
        }
        allPaths.slice(1).forEach((p) => {
          formData.append("gallery_image_paths", p);
        });
      } catch (err) {
        console.warn("Client image upload warning:", err);
      } finally {
        setIsUploading(false);
      }
    }

    const effectiveStatus = targetStatus || status || "published";
    formData.set("status", effectiveStatus);

    startTransition(() => {
      action(formData);
    });
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-16">
      {/* PAGE HEADER & ACTIONS */}
      <div className="flex flex-col gap-4 rounded-xl border border-[#E5E5E0] bg-white p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2 text-xs text-[#737373]">
            <Link
              href={cancelHref}
              className="flex items-center gap-1 hover:text-[#171717] hover:underline"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>{role === "admin" ? "Catalog Desk" : "Products"}</span>
            </Link>
            <span>/</span>
            <span className="font-semibold text-[#171717]">
              {mode === "edit" ? (initialValues?.name || "Edit Listing") : "New Listing"}
            </span>
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-[#171717]">
            {mode === "edit"
              ? `Edit: ${initialValues?.name || "Product"}`
              : role === "admin"
                ? "Add Catalog Product"
                : "Add New Product"}
          </h1>
          <p className="mt-0.5 text-xs text-[#737373]">
            {mode === "edit"
              ? "Update listing details, pricing, inventory specifications, and active status."
              : role === "admin"
                ? "Publish manufactured creations across all verified makers or official catalog."
                : "Publish your manufactured creations to the GenZ marketplace."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {manageReelsHref && (
            <Button
              type="button"
              variant="outline"
              asChild
              className={`h-9 items-center gap-1.5 rounded-lg border-[#E5E5E0] bg-white px-3.5 text-xs font-medium text-[#171717] hover:bg-[#F5F5F4] hover:text-[#171717] hover:border-[#171717]/30 ${PRESSABLE}`}
            >
              <Link href={manageReelsHref}>
                <Film className="h-3.5 w-3.5 text-[#737373]" />
                <span>
                  Reels {reelsCount !== undefined ? `(${reelsCount})` : ""}
                </span>
              </Link>
            </Button>
          )}

          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setStatus("draft");
              executeSubmit("draft");
            }}
            disabled={isPending || isUploading}
            className={`h-9 items-center gap-1.5 rounded-lg border-[#E5E5E0] bg-white px-3.5 text-xs font-medium text-[#171717] hover:bg-[#F5F5F4] hover:text-[#171717] hover:border-[#171717]/30 ${PRESSABLE}`}
          >
            <Save className="h-3.5 w-3.5 text-[#737373]" />
            <span>Save Draft</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => setShowPreviewModal(true)}
            className={`h-9 items-center gap-1.5 rounded-lg border-[#E5E5E0] bg-white px-3.5 text-xs font-medium text-[#171717] hover:bg-[#F5F5F4] hover:text-[#171717] hover:border-[#171717]/30 ${PRESSABLE}`}
          >
            <Eye className="h-3.5 w-3.5 text-[#737373]" />
            <span>Preview</span>
          </Button>

          <Button
            type="button"
            onClick={() => {
              const target = mode === "edit" ? status : "published";
              executeSubmit(target);
            }}
            disabled={isPending || isUploading}
            className={`h-9 items-center gap-1.5 rounded-lg bg-[#171717] px-4 text-xs font-medium text-white shadow-xs hover:bg-[#262626] ${PRESSABLE}`}
          >
            {isPending || isUploading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>{isUploading ? "Uploading Media..." : "Saving..."}</span>
              </>
            ) : (
              <>
                <Send className="h-3.5 w-3.5" />
                <span>
                  {submitLabel || (mode === "edit" ? "Save Changes" : "Publish Product")}
                </span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* SUCCESS ALERT */}
      {state?.success && (
        <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800 shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>Product listing saved and updated successfully!</span>
          </div>
          <Link
            href={cancelHref}
            className="font-medium text-emerald-700 underline hover:text-emerald-900"
          >
            Back to Catalog &rarr;
          </Link>
        </div>
      )}

      {/* ERROR ALERT */}
      {state?.error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-800 shadow-xs">
          {state.error}
        </div>
      )}

      {/* FORM SECTIONS */}
      <form
        id="shared-product-editor-form"
        onSubmit={(e) => {
          e.preventDefault();
          executeSubmit(status);
        }}
        noValidate
        className="space-y-6"
      >
        {productId && <input type="hidden" name="id" value={productId} />}
        {productId && <input type="hidden" name="productId" value={productId} />}

        {/* 1. Basic Info */}
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
          categories={categories}
        />

        {/* 2. Catalog Ownership */}
        <CatalogOwnershipCard
          sellers={sellers}
          adminUserId={adminUserId}
          selectedSellerId={selectedSellerId}
          onChangeSellerId={setSelectedSellerId}
          isSellerMode={role === "seller"}
          sellerBusinessName={sellerBusinessName}
        />

        {/* 3. Unified Media Uploader */}
        <MediaCard images={images} onImagesChange={setImages} />

        {/* 4. Product Variants */}
        <VariantsCard basePrice={priceInr} productName={name} />

        {/* 5. Inventory & Tracking */}
        <InventoryCard
          sku={sku}
          onChangeSku={setSku}
          stockQty={stockQty}
          onChangeStockQty={setStockQty}
          lowStockThreshold={lowStockThreshold}
          onChangeLowStockThreshold={setLowStockThreshold}
          trackInventory={trackInventory}
          onToggleTrackInventory={setTrackInventory}
        />

        {/* 6. Merchandising & Badges */}
        <MerchandisingCard
          isFeatured={isFeatured}
          onToggleFeatured={setIsFeatured}
          isNewArrival={isNewArrival}
          onToggleNewArrival={setIsNewArrival}
          isBestSeller={isBestSeller}
          onToggleBestSeller={setIsBestSeller}
        />

        {/* 8. Publishing Status */}
        <PublishingCard status={status} onChangeStatus={setStatus} />

        {/* BOTTOM ACTION BAR */}
        <div className="flex flex-col gap-3 rounded-xl border border-[#E5E5E0] bg-white p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
          <span className="text-xs text-[#737373]">
            Changes can be updated or unlisted anytime from your catalog desk.
          </span>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setStatus("draft");
                executeSubmit("draft");
              }}
              disabled={isPending || isUploading}
              className={`h-9 items-center gap-1.5 rounded-lg border-[#E5E5E0] bg-white px-3.5 text-xs font-medium text-[#171717] hover:bg-[#F5F5F4] hover:text-[#171717] hover:border-[#171717]/30 ${PRESSABLE}`}
            >
              <Save className="h-3.5 w-3.5 text-[#737373]" />
              <span>Save as Draft</span>
            </Button>

            <Button
              type="submit"
              disabled={isPending || isUploading}
              className={`h-9 items-center gap-1.5 rounded-lg bg-[#171717] px-4 text-xs font-medium text-white shadow-xs hover:bg-[#262626] ${PRESSABLE}`}
            >
              {isPending || isUploading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>{isUploading ? "Uploading Media..." : "Saving..."}</span>
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" />
                  <span>
                    {submitLabel || (mode === "edit" ? "Save Changes" : "Publish Product")}
                  </span>
                </>
              )}
            </Button>
          </div>
        </div>
      </form>

      {/* LIVE PREVIEW MODAL */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setShowPreviewModal(false)}
          />
          <div className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#E5E5E0] pb-3">
              <span className="font-mono text-xs font-semibold text-[#737373] uppercase tracking-wider">
                Storefront Buyer Preview
              </span>
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="rounded-lg p-1 text-[#737373] hover:bg-[#F5F5F4] hover:text-[#171717]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-[#E5E5E0] bg-[#FAF8F5]">
                {coverPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={coverPreview}
                    alt={name || "Product preview"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center text-[#A3A3A3]">
                    <ImageIcon className="h-10 w-10 mb-2" />
                    <span className="text-xs">No cover image uploaded</span>
                  </div>
                )}
              </div>

              <div>
                <span className="rounded-md bg-[#FAF8F5] px-2 py-0.5 font-mono text-[10px] font-semibold text-[#737373]">
                  {category}
                </span>
                <h3 className="mt-1 text-base font-semibold text-[#171717]">
                  {name || "Untitled Product"}
                </h3>
                <span className="font-mono text-lg font-bold text-[#171717]">
                  ₹{priceInr ? Number(priceInr).toLocaleString() : "0.00"}
                </span>
              </div>

              {description && (
                <div className="border-t border-[#E5E5E0] pt-3">
                  <span className="block text-xs font-semibold text-[#171717] mb-1">
                    Craft Story
                  </span>
                  <p className="text-xs leading-relaxed text-[#52524E] whitespace-pre-wrap">
                    {description}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
