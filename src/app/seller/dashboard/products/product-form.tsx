"use client";

import { useActionState, useState, startTransition, useRef } from "react";
import { Button } from "@/components/ui/atoms/button";
import { createProduct, updateProduct, type ProductFormState } from "./actions";
import { TOY_CATEGORIES } from "@/features/products/lib/products";
import type { Product } from "@/types/database";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Upload,
  Tag,
  FileText,
  X,
  ChevronDown,
  Heading1,
  Heading2,
  Minus,
  Percent,
  Trash2,
  Eye,
  Image as ImageIcon,
} from "lucide-react";

type Props =
  { mode: "create"; product?: undefined } | { mode: "edit"; product: Product };

const inputClass =
  "mt-1.5 w-full rounded-xl border border-[#E5E5E0] bg-[#FAF8F4]/50 px-4 py-3 text-xs font-medium text-[#1A1A18] placeholder:text-[#8C8C85] focus:border-black focus:bg-white focus:ring-1 focus:ring-black focus-visible:outline-none transition-all";

const selectClass =
  "mt-1.5 h-11 w-full rounded-xl border border-[#E5E5E0] bg-[#FAF8F4]/50 px-4 pr-10 py-2.5 text-xs font-semibold text-[#1A1A18] focus:border-black focus:bg-white focus:ring-1 focus:ring-black focus-visible:outline-none transition-all appearance-none cursor-pointer";

const textareaClass =
  "mt-1.5 w-full rounded-b-xl border border-[#E5E5E0] bg-[#FAF8F4]/50 p-4 font-mono text-xs text-[#1A1A18] placeholder:text-[#8C8C85] focus:border-black focus:bg-white focus:ring-1 focus:ring-black focus-visible:outline-none transition-all min-h-[160px]";

const labelClass =
  "block text-[11px] font-bold text-[#1A1A18] uppercase tracking-wider font-graphik";

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

  // Unified Media State (Cover + Gallery merged into single drag & drop queue)
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Description & Pricing State
  const [descriptionText, setDescriptionText] = useState(product?.description ?? "");
  const [showPreview, setShowPreview] = useState(false);
  const [priceInr, setPriceInr] = useState<string>(
    product?.price_inr ? String(product.price_inr) : ""
  );
  const [discountPercent, setDiscountPercent] = useState<string>("");

  // Handle Drag & Drop file uploads
  const addImages = (files: File[]) => {
    const validImages = files.filter((f) => f.type.startsWith("image/"));
    if (validImages.length === 0) return;

    const combined = [...imageFiles, ...validImages].slice(0, 8);
    setImageFiles(combined);
    setImagePreviews(combined.map((f) => URL.createObjectURL(f)));
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    addImages(files);
    if (e.target) e.target.value = "";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addImages(Array.from(e.dataTransfer.files));
    }
  };

  const setAsCover = (index: number) => {
    if (index === 0) return;
    const updated = [...imageFiles];
    const [selected] = updated.splice(index, 1);
    updated.unshift(selected);
    setImageFiles(updated);
    setImagePreviews(updated.map((f) => URL.createObjectURL(f)));
  };

  const removeImage = (index: number) => {
    const updated = imageFiles.filter((_, idx) => idx !== index);
    setImageFiles(updated);
    setImagePreviews(updated.map((f) => URL.createObjectURL(f)));
  };

  // Word-doc Style Rich Text Toolbar Formatter
  const applyFormatting = (formatType: string) => {
    const textarea = document.getElementById(
      "description"
    ) as HTMLTextAreaElement | null;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = descriptionText.substring(start, end);
    let replacement = "";

    switch (formatType) {
      case "h1":
        replacement = `# ${selectedText || "Product Overview Heading"}`;
        break;
      case "h2":
        replacement = `## ${selectedText || "Key Specifications"}`;
        break;
      case "bold":
        replacement = `**${selectedText || "bold text"}**`;
        break;
      case "italic":
        replacement = `*${selectedText || "italic text"}*`;
        break;
      case "bullet":
        replacement = selectedText
          ? selectedText
              .split("\n")
              .map((line) => `• ${line}`)
              .join("\n")
          : "• Handcrafted in India\n• Non-toxic eco finish\n• Premium wood grain";
        break;
      case "numbered":
        replacement = selectedText
          ? selectedText
              .split("\n")
              .map((line, idx) => `${idx + 1}. ${line}`)
              .join("\n")
          : "1. Inspection cleared\n2. Batch packaged\n3. Ready for dispatch";
        break;
      case "rule":
        replacement = "\n---\n";
        break;
      case "clear":
        replacement = selectedText.replace(/[*#•\-\d+\.]/g, "").trim();
        break;
      default:
        replacement = selectedText;
    }

    const updatedText =
      descriptionText.substring(0, start) +
      replacement +
      descriptionText.substring(end);
    setDescriptionText(updatedText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + replacement.length,
        start + replacement.length
      );
    }, 0);
  };

  // Calculate discounted price preview
  const numPrice = Number(priceInr);
  const numDiscount = Number(discountPercent);
  const hasDiscount =
    !isNaN(numPrice) && numPrice > 0 && !isNaN(numDiscount) && numDiscount > 0;
  const discountedPrice = hasDiscount
    ? Math.round(numPrice * (1 - numDiscount / 100))
    : numPrice;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.delete("cover_image");
    formData.delete("gallery_images");

    if (imageFiles.length > 0) {
      formData.append("cover_image", imageFiles[0]);
      imageFiles.slice(1).forEach((file) => {
        formData.append("gallery_images", file);
      });
    }

    startTransition(() => {
      formAction(formData);
    });
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="font-graphik space-y-8">
      {/* SECTION 1: DRAG & DROP MEDIA UPLOADER */}
      {props.mode === "create" && (
        <div className="space-y-4 rounded-2xl border border-[#E5E5E0] bg-white p-6 shadow-2xs">
          <div className="flex items-center justify-between border-b border-[#F0F0EC] pb-3">
            <div className="flex items-center gap-2">
              <ImageIcon className="h-4.5 w-4.5 text-black" />
              <h3 className="text-xs font-bold tracking-wider text-[#1A1A18] uppercase">
                1. Product Media & Photo Gallery
              </h3>
            </div>
            <span className="font-mono text-[10px] text-[#73736E]">
              {imageFiles.length}/8 Photos Uploaded
            </span>
          </div>

          {/* Unified Drag & Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative flex min-h-[160px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition-all ${
              isDragging
                ? "scale-[1.01] border-black bg-[#FAF7F0]"
                : "border-[#E5E5E0] bg-[#FAF8F4]/60 hover:border-black/50 hover:bg-[#FAF8F4]"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileInputChange}
            />

            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl border border-[#E5E5E0] bg-white shadow-2xs">
              <Upload className="h-5 w-5 text-[#1A1A18]" />
            </div>

            <div className="mt-3 space-y-1">
              <p className="text-xs font-bold text-[#1A1A18]">
                Drag and drop your product images here, or{" "}
                <span className="underline">browse files</span>
              </p>
              <p className="text-[11px] text-[#73736E]">
                First image will automatically be assigned as the main cover photo.
                Supports high-res PNG, JPG, WEBP (Up to 8 files, Max 5MB each).
              </p>
            </div>
          </div>

          {/* Media Previews Queue */}
          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-2 gap-3 pt-2 sm:grid-cols-4 lg:grid-cols-6">
              {imagePreviews.map((url, idx) => {
                const isCover = idx === 0;
                return (
                  <div
                    key={idx}
                    className={`group relative aspect-square overflow-hidden rounded-xl border transition-all ${
                      isCover
                        ? "border-black shadow-md ring-2 ring-black/20"
                        : "border-[#E5E5E0] bg-white shadow-2xs hover:border-black/50"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt={`Product asset ${idx + 1}`}
                      className="h-full w-full object-cover"
                    />

                    {/* Cover Badge */}
                    {isCover ? (
                      <span className="absolute top-1.5 left-1.5 flex items-center gap-1 rounded-md bg-black px-2 py-0.5 font-mono text-[9px] font-bold text-white shadow-xs">
                        Main Cover
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setAsCover(idx);
                        }}
                        className="absolute top-1.5 left-1.5 rounded-md bg-black/80 px-2 py-0.5 font-mono text-[9px] font-bold text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black"
                      >
                        Make Cover
                      </button>
                    )}

                    {/* Delete Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage(idx);
                      }}
                      className="absolute top-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/80 text-white transition-colors hover:bg-rose-600"
                      aria-label="Remove image"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SECTION 2: PRODUCT NAME & DESCRIPTION */}
      <div className="space-y-4 rounded-2xl border border-[#E5E5E0] bg-white p-6 shadow-2xs">
        <div className="flex items-center gap-2 border-b border-[#F0F0EC] pb-3">
          <FileText className="h-4.5 w-4.5 text-black" />
          <h3 className="text-xs font-bold tracking-wider text-[#1A1A18] uppercase">
            2. Product Name & Craft Story Description
          </h3>
        </div>

        <div className="space-y-5">
          {/* Product Name */}
          <div>
            <label htmlFor="name" className={labelClass}>
              Product Name *
            </label>
            <input
              id="name"
              name="name"
              required
              defaultValue={product?.name ?? ""}
              className={inputClass}
              placeholder="e.g. Handcrafted Teakwood Building Blocks"
            />
          </div>

          {/* Product Description with Word-Doc Toolbar */}
          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="description" className={labelClass}>
                Craft Story & Buyer Description
              </label>

              <button
                type="button"
                onClick={() => setShowPreview((prev) => !prev)}
                className="flex items-center gap-1 text-[11px] font-semibold text-[#73736E] hover:text-black"
              >
                <Eye className="h-3.5 w-3.5" />
                <span>{showPreview ? "Edit Text" : "Live Formatted Preview"}</span>
              </button>
            </div>

            {/* Word-Doc Style Formatting Toolbar */}
            <div className="mt-2 flex flex-wrap items-center gap-1 rounded-t-xl border border-b-0 border-[#E5E5E0] bg-[#FAF8F4] px-3 py-2 select-none">
              <button
                type="button"
                onClick={() => applyFormatting("h1")}
                className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-bold text-[#1A1A18] hover:bg-white hover:shadow-2xs"
                title="Heading 1 (#)"
              >
                <Heading1 className="h-3.5 w-3.5" />
                <span>H1</span>
              </button>

              <button
                type="button"
                onClick={() => applyFormatting("h2")}
                className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-bold text-[#1A1A18] hover:bg-white hover:shadow-2xs"
                title="Heading 2 (##)"
              >
                <Heading2 className="h-3.5 w-3.5" />
                <span>H2</span>
              </button>

              <span className="mx-1 h-4 w-px bg-[#E5E5E0]" />

              <button
                type="button"
                onClick={() => applyFormatting("bold")}
                className="flex h-7 w-7 items-center justify-center rounded-md text-[#1A1A18] hover:bg-white hover:shadow-2xs"
                title="Bold (**text**)"
              >
                <Bold className="h-3.5 w-3.5" />
              </button>

              <button
                type="button"
                onClick={() => applyFormatting("italic")}
                className="flex h-7 w-7 items-center justify-center rounded-md text-[#1A1A18] hover:bg-white hover:shadow-2xs"
                title="Italic (*text*)"
              >
                <Italic className="h-3.5 w-3.5" />
              </button>

              <span className="mx-1 h-4 w-px bg-[#E5E5E0]" />

              <button
                type="button"
                onClick={() => applyFormatting("bullet")}
                className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-[#1A1A18] hover:bg-white hover:shadow-2xs"
                title="Bullet Points"
              >
                <List className="h-3.5 w-3.5" />
                <span>Bullet</span>
              </button>

              <button
                type="button"
                onClick={() => applyFormatting("numbered")}
                className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-[#1A1A18] hover:bg-white hover:shadow-2xs"
                title="Numbered List"
              >
                <ListOrdered className="h-3.5 w-3.5" />
                <span>Numbered</span>
              </button>

              <button
                type="button"
                onClick={() => applyFormatting("rule")}
                className="flex h-7 w-7 items-center justify-center rounded-md text-[#1A1A18] hover:bg-white hover:shadow-2xs"
                title="Horizontal Divider Line"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>

              <span className="mx-1 h-4 w-px bg-[#E5E5E0]" />

              <button
                type="button"
                onClick={() => applyFormatting("clear")}
                className="rounded-md px-2 py-1 text-[10px] font-bold text-[#73736E] uppercase hover:bg-white hover:text-black hover:shadow-2xs"
                title="Clear Formatting"
              >
                Clear
              </button>
            </div>

            {/* Description Textarea or Preview */}
            {showPreview ? (
              <div className="font-graphik min-h-[160px] rounded-b-xl border border-[#E5E5E0] bg-[#FAF7F0]/40 p-4 text-xs leading-relaxed whitespace-pre-wrap text-[#1A1A18]">
                {descriptionText ? (
                  descriptionText
                ) : (
                  <span className="text-[#8C8C85] italic">
                    No description entered yet.
                  </span>
                )}
              </div>
            ) : (
              <textarea
                id="description"
                name="description"
                rows={5}
                value={descriptionText}
                onChange={(e) => setDescriptionText(e.target.value)}
                className={textareaClass}
                placeholder={`Use the toolbar above to structure your craft story:\n\n# Artisan Heritage\nHandcrafted by master wood artisans in Channapatna.\n\n• Materials: Organic Teakwood\n• Finish: Non-toxic Vegetable Dyes\n• Export Specifications: Meets ISO Safety Standards`}
              />
            )}
          </div>
        </div>
      </div>

      {/* SECTION 3: CLASSIFICATION, MATERIALS & PRICING WITH DISCOUNT */}
      <div className="space-y-4 rounded-2xl border border-[#E5E5E0] bg-white p-6 shadow-2xs">
        <div className="flex items-center gap-2 border-b border-[#F0F0EC] pb-3">
          <Tag className="h-4.5 w-4.5 text-black" />
          <h3 className="text-xs font-bold tracking-wider text-[#1A1A18] uppercase">
            3. Basic Information, Material & Pricing
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Category Dropdown */}
          <div>
            <label htmlFor="category" className={labelClass}>
              Category *
            </label>
            <div className="relative">
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
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <ChevronDown className="h-4 w-4 text-[#73736E]" />
              </div>
            </div>
          </div>

          {/* Type of Material (Materials & Finishing) */}
          <div>
            <label htmlFor="materials" className={labelClass}>
              Type of Material *
            </label>
            <input
              id="materials"
              name="materials"
              placeholder="e.g. Natural Organic Wood, Lacquer"
              defaultValue={product?.materials?.join(", ") ?? ""}
              className={inputClass}
            />
          </div>

          {/* Wholesale Price (INR ₹) */}
          <div>
            <label htmlFor="price_inr" className={labelClass}>
              Wholesale Price (INR ₹) *
            </label>
            <input
              id="price_inr"
              name="price_inr"
              type="number"
              min={0}
              step="0.01"
              value={priceInr}
              onChange={(e) => setPriceInr(e.target.value)}
              className={inputClass}
              placeholder="e.g. 1499"
            />
          </div>

          {/* Discount Percentage Field */}
          <div>
            <label htmlFor="discount_percent" className={labelClass}>
              Discount (%)
            </label>
            <div className="relative">
              <input
                id="discount_percent"
                name="discount_percent"
                type="number"
                min={0}
                max={99}
                value={discountPercent}
                onChange={(e) => setDiscountPercent(e.target.value)}
                className={inputClass}
                placeholder="e.g. 15"
              />
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <Percent className="h-3.5 w-3.5 text-[#73736E]" />
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Summary Calculation Preview */}
        {hasDiscount && (
          <div className="flex items-center justify-between rounded-xl border border-emerald-200/80 bg-emerald-50/50 p-3.5 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-emerald-900">
                Discounted Offer Price applied to storefront
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-[#73736E] line-through">
                ₹{numPrice.toLocaleString()}
              </span>
              <span className="font-mono text-sm font-bold text-emerald-800">
                ₹{discountedPrice.toLocaleString()}
              </span>
              <span className="rounded bg-emerald-200 px-1.5 py-0.5 font-mono text-[10px] font-bold text-emerald-900">
                {numDiscount}% OFF
              </span>
            </div>
          </div>
        )}
      </div>

      {state?.error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50/80 p-4 text-xs font-semibold text-rose-800">
          {state.error}
        </div>
      )}

      {/* SUBMISSION BAR */}
      <div className="flex flex-col gap-3 rounded-2xl border border-[#E5E5E0] bg-white p-4 shadow-2xs sm:flex-row sm:items-center sm:justify-between">
        <span className="text-xs text-[#73736E]">
          Listings can be edited or unpublished anytime from your catalog desk.
        </span>
        <Button
          type="submit"
          disabled={isPending}
          className="h-10 rounded-xl bg-black px-6 text-xs font-semibold tracking-wider text-white uppercase transition-all hover:bg-neutral-800"
        >
          {isPending
            ? "Saving Listing..."
            : props.mode === "create"
              ? "Publish Product Listing"
              : "Save Listing Changes"}
        </Button>
      </div>
    </form>
  );
}
