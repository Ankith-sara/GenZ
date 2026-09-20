"use client";

import React, { useState, useEffect, useRef, startTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowLeft,
  Eye,
  Save,
  Send,
  CheckCircle2,
  Loader2,
  X,
  Film,
  Image as ImageIcon,
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
  const [isBestSeller, setIsBestSeller] = useState(
    initialValues?.isBestSeller ?? false
  );

  // 7. Publishing State
  const [status, setStatus] = useState<"published" | "draft">(
    initialValues?.status || "published"
  );
  const [submittingStatus, setSubmittingStatus] = useState<
    "published" | "draft" | null
  >(null);

  const submittedStatusRef = useRef<"published" | "draft" | null>(null);
  const prevSuccessRef = useRef(false);

  // Toast feedback on form completion
  useEffect(() => {
    if (state?.success && !prevSuccessRef.current) {
      prevSuccessRef.current = true;
      const target = submittedStatusRef.current || status;
      if (target === "draft") {
        toast.success("Listing saved as Draft", {
          description:
            "Your product has been saved privately in your workshop catalog.",
        });
      } else {
        toast.success(
          mode === "edit" ? "Product Changes Saved" : "Product Published Successfully!",
          {
            description: "Your product listing is active and live on the storefront.",
          }
        );
      }
    } else if (!state?.success) {
      prevSuccessRef.current = false;
    }

    if (state?.error) {
      toast.error("Failed to save product", {
        description: state.error,
      });
    }
  }, [state, status, mode]);

  // Toast feedback on initial redirect from creation
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("created") === "true") {
      const createdStatus = params.get("status");
      if (createdStatus === "draft") {
        toast.success("Product Created as Draft!", {
          description: "Your new listing is saved privately in your catalog.",
        });
      } else {
        toast.success("Product Published Successfully!", {
          description: "Your new listing is live and discoverable on the marketplace.",
        });
      }
      const url = new URL(window.location.href);
      url.searchParams.delete("created");
      url.searchParams.delete("status");
      window.history.replaceState(
        {},
        "",
        url.pathname + (url.search ? url.search : "")
      );
    }
  }, []);

  const executeSubmit = async (targetStatus?: "published" | "draft") => {
    const formElement = document.getElementById(
      "shared-product-editor-form"
    ) as HTMLFormElement | null;
    if (!formElement) return;

    const effectiveStatus = targetStatus || status || "published";
    submittedStatusRef.current = effectiveStatus;
    setSubmittingStatus(effectiveStatus);

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

    formData.set("status", effectiveStatus);

    startTransition(() => {
      action(formData);
    });
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-16">
      {/* PAGE HEADER & ACTIONS */}
      <div className="border-border bg-card flex flex-col gap-4 rounded-lg border p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-muted-foreground mb-1.5 flex items-center gap-2 text-xs">
            <Link
              href={cancelHref}
              className="hover:text-foreground flex items-center gap-1 font-medium transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>{role === "admin" ? "Catalog Desk" : "Products"}</span>
            </Link>
            <span>/</span>
            <span className="text-foreground font-semibold">
              {mode === "edit" ? initialValues?.name || "Edit Listing" : "New Listing"}
            </span>
          </div>
          <h1 className="text-foreground text-xl font-bold tracking-tight sm:text-2xl">
            {mode === "edit"
              ? `Edit: ${initialValues?.name || "Product"}`
              : role === "admin"
                ? "Add Catalog Product"
                : "Add New Product"}
          </h1>
          <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
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
              className={`border-border bg-card text-foreground hover:bg-muted h-9 items-center gap-1.5 rounded-lg px-4 text-xs font-semibold shadow-sm ${PRESSABLE}`}
            >
              <Link href={manageReelsHref}>
                <Film className="text-muted-foreground h-3.5 w-3.5" />
                <span>Reels {reelsCount !== undefined ? `(${reelsCount})` : ""}</span>
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
            className={`border-border bg-card text-foreground hover:bg-muted h-9 items-center gap-1.5 rounded-lg px-4 text-xs font-semibold shadow-sm disabled:opacity-60 ${PRESSABLE}`}
          >
            {(isPending || isUploading) && submittingStatus === "draft" ? (
              <>
                <Loader2 className="text-muted-foreground h-3.5 w-3.5 animate-spin" />
                <span>Saving Draft...</span>
              </>
            ) : (
              <>
                <Save className="text-muted-foreground h-3.5 w-3.5" />
                <span>Save Draft</span>
              </>
            )}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => setShowPreviewModal(true)}
            className={`border-border bg-card text-foreground hover:bg-muted h-9 items-center gap-1.5 rounded-lg px-4 text-xs font-semibold shadow-sm ${PRESSABLE}`}
          >
            <Eye className="text-muted-foreground h-3.5 w-3.5" />
            <span>Preview</span>
          </Button>

          <Button
            type="button"
            onClick={() => {
              const target = mode === "edit" ? status : "published";
              executeSubmit(target);
            }}
            disabled={isPending || isUploading}
            className={`h-9 items-center gap-1.5 rounded-full !bg-[#18181b] px-5 text-xs font-semibold !text-white shadow-sm hover:!bg-foreground disabled:opacity-60 ${PRESSABLE}`}
          >
            {isPending || isUploading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin text-white" />
                <span className="text-white">
                  {isUploading
                    ? "Uploading Media..."
                    : submittingStatus === "draft"
                      ? "Saving..."
                      : mode === "edit"
                        ? "Saving Changes..."
                        : "Publishing..."}
                </span>
              </>
            ) : (
              <>
                <Send className="h-3.5 w-3.5 text-white" />
                <span className="text-white">
                  {submitLabel ||
                    (mode === "edit" ? "Save Changes" : "Publish Product")}
                </span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* SUCCESS ALERT */}
      {state?.success && (
        <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800 shadow-sm">
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
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-xs font-semibold text-rose-800 shadow-sm">
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

        {/* 1. Media Uploader */}
        <MediaCard images={images} onImagesChange={setImages} />

        {/* 2. Basic Info */}
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

        {/* 3. Catalog Ownership */}
        <CatalogOwnershipCard
          sellers={sellers}
          adminUserId={adminUserId}
          selectedSellerId={selectedSellerId}
          onChangeSellerId={setSelectedSellerId}
          isSellerMode={role === "seller"}
          sellerBusinessName={sellerBusinessName}
        />

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

        {/* 7. Publishing Status */}
        <PublishingCard status={status} onChangeStatus={setStatus} />

        {/* BOTTOM ACTION BAR */}
        <div className="border-border bg-card flex flex-col gap-3 rounded-lg border p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <span className="text-muted-foreground text-xs">
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
              className={`border-border bg-card text-foreground hover:bg-muted h-9 items-center gap-1.5 rounded-lg px-4 text-xs font-semibold shadow-sm disabled:opacity-60 ${PRESSABLE}`}
            >
              {(isPending || isUploading) && submittingStatus === "draft" ? (
                <>
                  <Loader2 className="text-muted-foreground h-3.5 w-3.5 animate-spin" />
                  <span>Saving Draft...</span>
                </>
              ) : (
                <>
                  <Save className="text-muted-foreground h-3.5 w-3.5" />
                  <span>Save as Draft</span>
                </>
              )}
            </Button>

            <Button
              type="submit"
              disabled={isPending || isUploading}
              className={`h-9 items-center gap-1.5 rounded-full !bg-[#18181b] px-5 text-xs font-semibold !text-white shadow-sm hover:!bg-foreground disabled:opacity-60 ${PRESSABLE}`}
            >
              {isPending || isUploading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-white" />
                  <span className="text-white">
                    {isUploading
                      ? "Uploading Media..."
                      : submittingStatus === "draft"
                        ? "Saving..."
                        : mode === "edit"
                          ? "Saving Changes..."
                          : "Publishing..."}
                  </span>
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5 text-white" />
                  <span className="text-white">
                    {submitLabel ||
                      (mode === "edit" ? "Save Changes" : "Publish Product")}
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
            className="fixed inset-0 bg-foreground/50 backdrop-blur-xs transition-opacity"
            onClick={() => setShowPreviewModal(false)}
          />
          <div className="border-border bg-card relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg border p-6 shadow-2xl">
            <div className="border-border flex items-center justify-between border-b pb-3">
              <span className="text-muted-foreground font-mono text-xs font-bold tracking-wider uppercase">
                Storefront Buyer Preview
              </span>
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer rounded-full p-1.5 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div className="border-border bg-muted/40 relative aspect-square w-full overflow-hidden rounded-lg border">
                {coverPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={coverPreview}
                    alt={name || "Product preview"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="text-muted-foreground flex h-full w-full flex-col items-center justify-center">
                    <ImageIcon className="mb-2 h-10 w-10" />
                    <span className="text-xs">No cover image uploaded</span>
                  </div>
                )}
              </div>

              <div>
                <span className="bg-muted text-muted-foreground rounded-full px-3 py-1 font-mono text-[10px] font-semibold">
                  {category}
                </span>
                <h3 className="text-foreground mt-2 text-base font-bold tracking-tight">
                  {name || "Untitled Product"}
                </h3>
                <span className="text-foreground font-mono text-lg font-bold">
                  ₹{priceInr ? Number(priceInr).toLocaleString() : "0.00"}
                </span>
              </div>

              {description && (
                <div className="border-border border-t pt-3">
                  <span className="text-foreground mb-1 block text-xs font-bold">
                    Craft Story
                  </span>
                  <p className="text-muted-foreground text-xs leading-relaxed whitespace-pre-wrap">
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
