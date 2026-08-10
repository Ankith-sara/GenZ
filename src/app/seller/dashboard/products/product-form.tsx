"use client";

import { useActionState, useState, startTransition } from "react";
import { Button } from "@/components/ui/atoms/button";
import { createProduct, updateProduct, type ProductFormState } from "./actions";
import { TOY_CATEGORIES, AGE_GROUPS } from "@/features/products/lib/products";
import type { Product } from "@/types/database";
import {
  Upload,
  Image as ImageIcon,
  Tag,
  FileText,
  X,
  Plus,
  ChevronDown,
} from "lucide-react";

type Props =
  { mode: "create"; product?: undefined } | { mode: "edit"; product: Product };

const inputClass =
  "mt-1.5 w-full rounded-xl border border-[#E5E5E0] bg-[#FAF8F4]/50 px-4 py-3 text-xs font-medium text-[#1A1A18] placeholder:text-[#8C8C85] focus:border-black focus:bg-white focus:ring-1 focus:ring-black focus-visible:outline-none transition-all";

const selectClass =
  "mt-1.5 h-11 w-full rounded-xl border border-[#E5E5E0] bg-[#FAF8F4]/50 px-4 pr-10 py-2.5 text-xs font-semibold text-[#1A1A18] focus:border-black focus:bg-white focus:ring-1 focus:ring-black focus-visible:outline-none transition-all appearance-none cursor-pointer";

const textareaClass =
  "mt-1.5 w-full rounded-xl border border-[#E5E5E0] bg-[#FAF8F4]/50 px-4 py-3 text-xs font-medium text-[#1A1A18] placeholder:text-[#8C8C85] focus:border-black focus:bg-white focus:ring-1 focus:ring-black focus-visible:outline-none transition-all";

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

  // Cover image states
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  // Gallery image states
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
    if (e.target) e.target.value = "";
  };

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    const mergedFiles = [...galleryFiles, ...files].slice(0, 8);
    setGalleryFiles(mergedFiles);
    setGalleryPreviews(mergedFiles.map((f) => URL.createObjectURL(f)));

    if (e.target) e.target.value = "";
  };

  const removeGalleryFile = (index: number) => {
    const newFiles = galleryFiles.filter((_, idx) => idx !== index);
    setGalleryFiles(newFiles);
    setGalleryPreviews(newFiles.map((f) => URL.createObjectURL(f)));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    formData.delete("cover_image");
    formData.delete("gallery_images");

    if (coverFile) {
      formData.append("cover_image", coverFile);
    }
    galleryFiles.forEach((file) => {
      formData.append("gallery_images", file);
    });

    startTransition(() => {
      formAction(formData);
    });
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="font-graphik space-y-8">
      {/* SECTION 1: VISUAL ASSETS (Cover & Gallery Uploaders) */}
      {props.mode === "create" && (
        <div className="space-y-4 rounded-2xl border border-[#E5E5E0] bg-white p-6 shadow-2xs">
          <div className="flex items-center gap-2 border-b border-[#F0F0EC] pb-3">
            <ImageIcon className="h-4.5 w-4.5 text-black" />
            <h3 className="text-xs font-bold tracking-wider text-[#1A1A18] uppercase">
              1. Catalog Visual Assets
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Cover Image Uploader */}
            <div>
              <label className={labelClass}>Main Cover Image *</label>
              <div className="relative mt-2 flex min-h-[170px] items-center justify-center rounded-2xl border border-dashed border-[#E5E5E0] bg-[#FAF8F4] p-4 transition-all hover:border-black hover:bg-[#F5F2EA]">
                {coverPreview ? (
                  <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-[#E5E5E0]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={coverPreview}
                      alt="Cover preview"
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setCoverFile(null);
                        setCoverPreview(null);
                      }}
                      className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/80 text-xs font-bold text-white transition-colors hover:bg-black"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2 py-4 text-center">
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full border border-[#E5E5E0] bg-white shadow-2xs">
                      <Upload className="h-4 w-4 text-[#1A1A18]" />
                    </div>
                    <div className="text-xs text-[#73736E]">
                      <label
                        htmlFor="cover_image"
                        className="relative cursor-pointer font-bold text-[#1A1A18] hover:underline"
                      >
                        <span>Select cover photo</span>
                        <input
                          id="cover_image"
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={handleCoverChange}
                        />
                      </label>
                      <p className="mt-1 text-[11px] text-[#8C8C85]">
                        High-res PNG, JPG, WEBP (Max 5MB)
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Gallery Images Uploader */}
            <div>
              <label className={labelClass}>Product Gallery (Up to 8)</label>
              <div className="mt-2 space-y-3">
                {galleryPreviews.length > 0 && (
                  <div className="grid grid-cols-4 gap-2">
                    {galleryPreviews.map((url, idx) => (
                      <div
                        key={idx}
                        className="group relative aspect-square overflow-hidden rounded-xl border border-[#E5E5E0] bg-white shadow-2xs"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt="" className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeGalleryFile(idx)}
                          className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/85 text-[9px] font-bold text-white transition-colors hover:bg-black"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {galleryFiles.length < 8 && (
                  <div className="relative flex min-h-[110px] items-center justify-center rounded-2xl border border-dashed border-[#E5E5E0] bg-[#FAF8F4] p-4 transition-all hover:border-black hover:bg-[#F5F2EA]">
                    <div className="space-y-1.5 py-1 text-center">
                      <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-full border border-[#E5E5E0] bg-white shadow-2xs">
                        <Plus className="h-4 w-4 text-[#1A1A18]" />
                      </div>
                      <div className="text-xs text-[#73736E]">
                        <label
                          htmlFor="gallery_images"
                          className="relative cursor-pointer font-bold text-[#1A1A18] hover:underline"
                        >
                          <span>Add additional photo</span>
                          <input
                            id="gallery_images"
                            type="file"
                            accept="image/*"
                            multiple
                            className="sr-only"
                            onChange={handleGalleryChange}
                          />
                        </label>
                        <p className="mt-0.5 text-[11px] text-[#8C8C85]">
                          {8 - galleryFiles.length} slots remaining
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: ESSENTIAL CLASSIFICATION & PRICING */}
      <div className="space-y-4 rounded-2xl border border-[#E5E5E0] bg-white p-6 shadow-2xs">
        <div className="flex items-center gap-2 border-b border-[#F0F0EC] pb-3">
          <Tag className="h-4.5 w-4.5 text-black" />
          <h3 className="text-xs font-bold tracking-wider text-[#1A1A18] uppercase">
            2. Basic Information & Pricing
          </h3>
        </div>

        <div className="space-y-4">
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

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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

            <div>
              <label htmlFor="age_group" className={labelClass}>
                Target Age Group
              </label>
              <div className="relative">
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
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                  <ChevronDown className="h-4 w-4 text-[#73736E]" />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="price_inr" className={labelClass}>
                Wholesale Price (INR ₹) *
              </label>
              <div className="relative">
                <input
                  id="price_inr"
                  name="price_inr"
                  type="number"
                  min={0}
                  step="0.01"
                  defaultValue={product?.price_inr ?? ""}
                  className={inputClass}
                  placeholder="e.g. 1499"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: CRAFT STORY & MATERIAL SPECIFICATIONS */}
      <div className="space-y-4 rounded-2xl border border-[#E5E5E0] bg-white p-6 shadow-2xs">
        <div className="flex items-center gap-2 border-b border-[#F0F0EC] pb-3">
          <FileText className="h-4.5 w-4.5 text-black" />
          <h3 className="text-xs font-bold tracking-wider text-[#1A1A18] uppercase">
            3. Product Story & Material Specs
          </h3>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="description" className={labelClass}>
              Detailed Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              defaultValue={product?.description ?? ""}
              className={textareaClass}
              placeholder="Describe the artisan craft, sustainable manufacturing process, and buyer specifications..."
            />
          </div>

          <div>
            <label htmlFor="materials" className={labelClass}>
              Materials & Finishing
            </label>
            <input
              id="materials"
              name="materials"
              placeholder="e.g. Natural Organic Wood, Non-toxic Lacquer finish"
              defaultValue={product?.materials?.join(", ") ?? ""}
              className={inputClass}
            />
            <p className="mt-1 text-[11px] text-[#8C8C85]">
              Separate materials with commas — shown clearly to buyers on product detail
              pages.
            </p>
          </div>
        </div>
      </div>

      {state?.error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50/80 p-4 text-xs font-semibold text-rose-800">
          {state.error}
        </div>
      )}

      {/* SUBMISSION BAR */}
      <div className="flex items-center justify-between rounded-2xl border border-[#E5E5E0] bg-white p-4 shadow-2xs">
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
