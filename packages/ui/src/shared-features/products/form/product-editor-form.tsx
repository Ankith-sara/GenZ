"use client";

import React, { useState, useEffect, useRef, useMemo, startTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowLeft,
  ChevronRight,
  Send,
  CheckCircle2,
  Loader2,
  Film,
} from "lucide-react";
import { Button } from "../../../components/button";
import {
  BasicInfoCard,
  PricingCard,
  InventoryCard,
  StorefrontPreviewCard,
  PublishingCard,
  MerchandisingCard,
  CatalogOwnershipCard,
  DangerZoneCard,
  type SellerOption,
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
  onDelete?: () => void;
  isDeleting?: boolean;
  createdDate?: string;
  updatedDate?: string;
  initialValues?: {
    name?: string;
    priceInr?: string;
    comparePrice?: string;
    comparePriceInr?: string;
    category?: string;
    materials?: string | string[];
    description?: string;
    sku?: string;
    stockQty?: string;
    lowStockThreshold?: string;
    trackInventory?: boolean;
    allowBackorders?: boolean;
    isFeatured?: boolean;
    isNewArrival?: boolean;
    isBestSeller?: boolean;
    status?: "published" | "draft";
    images?: ProductImageItem[];
    createdDate?: string;
    updatedDate?: string;
  };
}

const SECTION_JUMP_LINKS = [
  { id: "sec-media", label: "Media" },
  { id: "sec-basics", label: "Product info" },
  { id: "sec-pricing", label: "Pricing" },
  { id: "sec-inventory", label: "Inventory" },
  { id: "variants", label: "Variants" },
];

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
  onDelete,
  isDeleting = false,
  createdDate,
  updatedDate,
  initialValues,
}: ProductEditorFormProps) {
  const [isUploading, setIsUploading] = useState(false);

  // 1. Basic Info State
  const [name, setName] = useState(initialValues?.name || "");
  const [priceInr, setPriceInr] = useState(initialValues?.priceInr || "");
  const [comparePriceInr, setComparePriceInr] = useState(
    initialValues?.comparePrice || initialValues?.comparePriceInr || ""
  );
  const [category, setCategory] = useState(
    initialValues?.category || (categories && categories[0]) || "Wooden Toys & Crafts"
  );

  const [materials, setMaterials] = useState<string[]>(() => {
    if (Array.isArray(initialValues?.materials)) {
      return initialValues.materials;
    }
    if (
      typeof initialValues?.materials === "string" &&
      initialValues.materials.trim()
    ) {
      return initialValues.materials
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
    return ["Ankudu Softwood", "Natural Lacquer"];
  });
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
  const [stockQty, setStockQty] = useState(initialValues?.stockQty || "0");
  const [lowStockThreshold, setLowStockThreshold] = useState(
    initialValues?.lowStockThreshold || "5"
  );
  const [trackInventory, setTrackInventory] = useState(
    initialValues?.trackInventory ?? true
  );
  const [allowBackorders, setAllowBackorders] = useState(
    initialValues?.allowBackorders ?? false
  );

  // 5. Merchandising State
  const [isFeatured, setIsFeatured] = useState(initialValues?.isFeatured ?? false);
  const [isNewArrival, setIsNewArrival] = useState(initialValues?.isNewArrival ?? true);
  const [isBestSeller, setIsBestSeller] = useState(
    initialValues?.isBestSeller ?? false
  );

  // 6. Publishing State
  const [status, setStatus] = useState<"published" | "draft">(
    initialValues?.status || "published"
  );
  const [submittingStatus, setSubmittingStatus] = useState<
    "published" | "draft" | null
  >(null);

  const submittedStatusRef = useRef<"published" | "draft" | null>(null);
  const prevSuccessRef = useRef(false);

  // Dirty State Tracking
  const isDirty = useMemo(() => {
    if (mode === "create") {
      return Boolean(name || priceInr || description || images.length > 0);
    }
    return (
      name !== (initialValues?.name || "") ||
      priceInr !== (initialValues?.priceInr || "") ||
      comparePriceInr !==
        (initialValues?.comparePrice || initialValues?.comparePriceInr || "") ||
      description !== (initialValues?.description || "") ||
      category !== (initialValues?.category || "") ||
      sku !== (initialValues?.sku || "") ||
      stockQty !== (initialValues?.stockQty || "") ||
      status !== (initialValues?.status || "published") ||
      isFeatured !== (initialValues?.isFeatured ?? false) ||
      isNewArrival !== (initialValues?.isNewArrival ?? true) ||
      isBestSeller !== (initialValues?.isBestSeller ?? false) ||
      trackInventory !== (initialValues?.trackInventory ?? true) ||
      images.length !== (initialValues?.images?.length || 0)
    );
  }, [
    name,
    priceInr,
    comparePriceInr,
    description,
    category,
    sku,
    stockQty,
    status,
    isFeatured,
    isNewArrival,
    isBestSeller,
    trackInventory,
    images.length,
    mode,
    initialValues,
  ]);

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

    // If client-side image uploader is provided
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
    } else {
      const existingCover = images[0]?.previewUrl;
      if (existingCover && !formData.get("cover_image_path")) {
        formData.set("cover_image_path", existingCover);
      }
      const galleryPaths = images
        .slice(1)
        .map((img) => img.previewUrl)
        .filter(Boolean);
      galleryPaths.forEach((p) => {
        formData.append("gallery_image_paths", p);
      });
    }

    formData.set("status", effectiveStatus);

    startTransition(() => {
      action(formData);
    });
  };

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      const topOffset = 80;
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - topOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="w-full pb-10 text-[#1A1A18]">
      {/* TOP STICKY APP BAR */}
      <header className="sticky top-0 z-30 border-b border-[#E5E5E0] bg-[#FAF8F4]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-3 py-2 sm:px-4 sm:py-2.5">
          {/* Left: Back Button + Breadcrumb + Title */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <Link
              href={cancelHref}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#52524E] transition-colors hover:bg-black/5 sm:h-10 sm:w-10"
              aria-label="Back to products"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>

            <div>
              <div className="flex items-center gap-1 text-[11px] text-[#52524E]">
                <Link
                  href={cancelHref}
                  className="transition-colors hover:text-[#1A1A18]"
                >
                  {role === "admin" ? "Catalog" : "Products"}
                </Link>
                <ChevronRight className="h-3 w-3 opacity-40" />
                <span className="font-medium text-[#1A1A18]">
                  {mode === "edit" ? "Edit listing" : "New listing"}
                </span>
              </div>

              <div className="mt-0.5 flex items-center gap-2.5">
                <h1 className="text-lg font-normal tracking-tight text-[#1A1A18] sm:text-xl">
                  {mode === "edit" ? "Edit product" : "Add product"}
                </h1>
                {isDirty && (
                  <span className="inline-flex h-5.5 items-center gap-1.5 rounded-sm bg-[#FEF3C7] px-2 text-[11px] font-medium text-[#92400E]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#B45309]" />
                    Unsaved changes
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {manageReelsHref && (
              <Button
                type="button"
                variant="outline"
                asChild
                className="h-9 gap-1.5 rounded-full border border-[#E5E5E0] bg-white px-3 text-xs font-semibold text-[#1A1A18] hover:bg-[#FAF8F4]"
              >
                <Link href={manageReelsHref}>
                  <Film className="h-3.5 w-3.5 text-[#52524E]" />
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
              className="h-9 gap-2 rounded-full border border-[#E5E5E0] bg-transparent px-4 text-xs font-medium text-[#1A1A18] hover:bg-black/5 disabled:opacity-50 sm:h-10 sm:px-5 sm:text-sm"
            >
              {(isPending || isUploading) && submittingStatus === "draft" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-[#52524E]" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save draft</span>
              )}
            </Button>

            <Button
              type="button"
              onClick={() => {
                const target = mode === "edit" ? status : "published";
                executeSubmit(target);
              }}
              disabled={isPending || isUploading}
              className="h-9 gap-2 rounded-full bg-[#1A1A18] px-5 text-xs font-medium text-white hover:bg-[#2E2E2B] disabled:opacity-50 sm:h-10 sm:px-6 sm:text-sm"
            >
              {isPending || isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                  <span>
                    {isUploading
                      ? "Uploading..."
                      : submittingStatus === "draft"
                        ? "Saving..."
                        : "Saving..."}
                  </span>
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span>{submitLabel || (mode === "edit" ? "Update" : "Publish")}</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-2 pt-2.5 pb-6 sm:px-4 sm:pt-3">
        {/* QUICK JUMP NAVIGATION PILLS */}
        <div className="mb-3.5 flex scrollbar-none items-center gap-1.5 overflow-x-auto pb-0.5">
          {SECTION_JUMP_LINKS.map((link) => (
            <button
              key={link.id}
              type="button"
              onClick={() => scrollToSection(link.id)}
              className="shrink-0 cursor-pointer rounded-lg border border-[#E5E5E0] bg-white px-2.5 py-1 text-xs font-medium text-[#52524E] transition-colors hover:border-[#1A1A18] hover:text-[#1A1A18]"
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* SUCCESS NOTIFICATION */}
        {state?.success && (
          <div className="mb-4 flex items-center justify-between rounded-xl border border-[#E5E5E0] bg-white p-3.5 text-xs font-semibold text-[#1A1A18] shadow-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-[#1A1A18]" />
              <span>Listing saved and published successfully!</span>
            </div>
            <Link
              href={cancelHref}
              className="inline-flex items-center gap-1 font-semibold text-[#1A1A18] hover:underline"
            >
              <span>Back to catalog</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}

        {/* ERROR NOTIFICATION */}
        {state?.error && (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs font-semibold text-rose-900 shadow-xs">
            {state.error}
          </div>
        )}

        {/* 2-COLUMN MAIN FORM GRID */}
        <form
          id="shared-product-editor-form"
          onSubmit={(e) => {
            e.preventDefault();
            executeSubmit(status);
          }}
          noValidate
        >
          {productId && <input type="hidden" name="id" value={productId} />}
          {productId && <input type="hidden" name="productId" value={productId} />}

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            {/* LEFT MAIN COLUMN (col-main) */}
            <div className="space-y-4 lg:col-span-8">
              {/* Section 1: Media & Photos */}
              <div id="sec-media">
                <MediaCard
                  images={images}
                  onImagesChange={setImages}
                  isUploading={isUploading}
                />
              </div>

              {/* Section 2: Basic Information & Craft Story */}
              <BasicInfoCard
                name={name}
                onChangeName={setName}
                category={category}
                onChangeCategory={setCategory}
                description={description}
                onChangeDescription={setDescription}
                materials={materials}
                onChangeMaterials={setMaterials}
                categories={categories}
              />

              {/* Section 3: Pricing */}
              <PricingCard
                priceInr={priceInr}
                onChangePriceInr={setPriceInr}
                comparePriceInr={comparePriceInr}
                onChangeComparePriceInr={setComparePriceInr}
              />

              {/* Section 4: Inventory & Logistics */}
              <InventoryCard
                productName={name}
                sku={sku}
                onChangeSku={setSku}
                stockQty={stockQty}
                onChangeStockQty={setStockQty}
                lowStockThreshold={lowStockThreshold}
                onChangeLowStockThreshold={setLowStockThreshold}
                trackInventory={trackInventory}
                onToggleTrackInventory={setTrackInventory}
                allowBackorders={allowBackorders}
                onToggleBackorders={setAllowBackorders}
              />

              {/* Section 5: Variants */}
              <VariantsCard basePrice={priceInr} productName={name} />
            </div>

            {/* RIGHT SIDEBAR COLUMN (col-side) */}
            <div className="space-y-4 lg:col-span-4">
              <div className="space-y-4 lg:sticky lg:top-16">
                {/* 1. Storefront Buyer Preview Card */}
                <StorefrontPreviewCard
                  name={name}
                  category={category}
                  priceInr={priceInr}
                  comparePriceInr={comparePriceInr}
                  coverPreviewUrl={coverPreview}
                  trackInventory={trackInventory}
                  stockQty={stockQty}
                  lowStockThreshold={lowStockThreshold}
                  isFeatured={isFeatured}
                  isNewArrival={isNewArrival}
                  isBestSeller={isBestSeller}
                />

                {/* 2. Publishing Status Card */}
                <div id="sec-publishing">
                  <PublishingCard
                    status={status}
                    onChangeStatus={setStatus}
                    createdDate={createdDate || initialValues?.createdDate}
                    updatedDate={updatedDate || initialValues?.updatedDate}
                  />
                </div>

                {/* 3. Merchandising Badges Card */}
                <div id="sec-merchandising">
                  <MerchandisingCard
                    isFeatured={isFeatured}
                    onToggleFeatured={setIsFeatured}
                    isNewArrival={isNewArrival}
                    onToggleNewArrival={setIsNewArrival}
                    isBestSeller={isBestSeller}
                    onToggleBestSeller={setIsBestSeller}
                  />
                </div>

                {/* 4. Catalog Ownership Card */}
                <div id="sec-ownership">
                  <CatalogOwnershipCard
                    sellers={sellers}
                    adminUserId={adminUserId}
                    selectedSellerId={selectedSellerId}
                    onChangeSellerId={setSelectedSellerId}
                    isSellerMode={role === "seller"}
                    sellerBusinessName={sellerBusinessName}
                  />
                </div>

                {/* 5. Danger Zone (Edit Mode Only) */}
                {mode === "edit" && onDelete && (
                  <DangerZoneCard onDelete={onDelete} isDeleting={isDeleting} />
                )}
              </div>
            </div>
          </div>
        </form>
      </main>

      {/* MOBILE STICKY BOTTOM ACTIONS */}
      <div className="fixed right-0 bottom-0 left-0 z-30 border-t border-[#E5E5E0] bg-[#FAF8F4]/95 px-4 py-3 shadow-lg backdrop-blur-md lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              setStatus("draft");
              executeSubmit("draft");
            }}
            disabled={isPending || isUploading}
            className="h-10 flex-1 cursor-pointer rounded-full border border-[#E5E5E0] bg-white px-4 text-xs font-semibold text-[#1A1A18] transition-colors hover:bg-[#FAF8F4] disabled:opacity-50"
          >
            Save draft
          </button>
          <button
            type="button"
            onClick={() => {
              const target = mode === "edit" ? status : "published";
              executeSubmit(target);
            }}
            disabled={isPending || isUploading}
            className="inline-flex h-10 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-full bg-[#1A1A18] px-4 text-xs font-semibold text-white transition-colors hover:bg-[#2E2E2B] disabled:opacity-50"
          >
            <Send className="h-3.5 w-3.5" />
            <span>{mode === "edit" ? "Update" : "Publish"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
