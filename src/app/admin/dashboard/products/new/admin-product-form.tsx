"use client";

import React, { useActionState, useState, startTransition } from "react";
import { Button } from "@/components/ui/atoms/button";
import {
  createProduct,
  type ProductFormState,
} from "@/app/seller/dashboard/products/actions";
import { TOY_CATEGORIES, AGE_GROUPS } from "@/features/products/lib/products";
import { Upload, Building2 } from "lucide-react";

export interface SellerOption {
  id: string;
  business_name: string;
  full_name?: string | null;
}

interface AdminProductFormProps {
  sellers: SellerOption[];
  adminUserId: string;
}

const inputClass =
  "mt-1.5 w-full rounded-xl border border-[#E5E5E0] bg-white px-4 py-3 text-sm text-black placeholder:text-[#8C8C85] focus:border-black focus:ring-1 focus:ring-black focus-visible:outline-none transition-all";

const selectClass =
  "mt-1.5 h-12 w-full rounded-xl border border-[#E5E5E0] bg-white px-4 pr-10 py-2.5 text-sm text-black placeholder:text-[#8C8C85] focus:border-black focus:ring-1 focus:ring-black focus-visible:outline-none transition-all appearance-none cursor-pointer";

const textareaClass =
  "mt-1.5 w-full rounded-xl border border-[#E5E5E0] bg-white px-4 py-3 text-sm text-black placeholder:text-[#8C8C85] focus:border-black focus:ring-1 focus:ring-black focus-visible:outline-none transition-all";

const labelClass =
  "block text-xs font-bold text-[#1A1A18] uppercase tracking-wider font-graphik";

export function AdminProductForm({ sellers, adminUserId }: AdminProductFormProps) {
  const [state, formAction, isPending] = useActionState<ProductFormState, FormData>(
    createProduct,
    {}
  );

  const [selectedSellerId, setSelectedSellerId] = useState<string>(adminUserId);

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

    // Clean out native file inputs
    formData.delete("cover_image");
    formData.delete("gallery_images");

    // Append our state files
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
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <input type="hidden" name="is_admin" value="true" />

      {/* SELLER ASSIGNMENT SELECTOR (Admin Exclusive) */}
      <div className="font-graphik rounded-xl border border-[#E5E5E0] bg-[#FAF7F0] p-4">
        <div className="mb-2 flex items-center gap-2">
          <Building2 className="h-4 w-4 text-black" />
          <label htmlFor="seller_id" className={labelClass}>
            Assign Product To Seller Account
          </label>
        </div>
        <div className="relative">
          <select
            id="seller_id"
            name="seller_id"
            value={selectedSellerId}
            onChange={(e) => setSelectedSellerId(e.target.value)}
            className={selectClass}
          >
            <option value={adminUserId}>
              ⭐ Direct Platform / Admin Official Catalog
            </option>
            {sellers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.business_name} {s.full_name ? `(${s.full_name})` : ""}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pt-1.5 pr-4">
            <span className="text-[10px] text-[#8C8C85]">▼</span>
          </div>
        </div>
        <p className="mt-2 text-xs text-[#73736E]">
          As an Administrator, you can create products under any registered seller or
          assign directly to the GenZ Official catalog.
        </p>
      </div>

      {/* Product Image Cover Selector */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Cover image uploader */}
        <div>
          <label className={labelClass}>Product Cover Image</label>
          <div className="relative mt-2 flex min-h-[160px] items-center justify-center rounded-2xl border border-dashed border-[#E5E5E0] bg-[#FAF7F0] p-6 transition-colors hover:bg-[#F5F5F0]">
            {coverPreview ? (
              <div className="relative aspect-video w-full max-w-md overflow-hidden rounded-xl border border-[#E5E5E0]">
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
                  ✕
                </button>
              </div>
            ) : (
              <div className="space-y-2 py-4 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-[#E5E5E0] bg-white">
                  <Upload className="h-5 w-5 text-[#8C8C85]" />
                </div>
                <div className="text-xs text-[#73736E]">
                  <label
                    htmlFor="cover_image"
                    className="relative cursor-pointer rounded-md font-semibold text-black hover:underline"
                  >
                    <span>Upload cover image</span>
                    <input
                      id="cover_image"
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={handleCoverChange}
                    />
                  </label>
                  <p className="mt-1 text-[#8C8C85]">PNG, JPG, WEBP up to 5MB</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Gallery images uploader */}
        <div>
          <label className={labelClass}>Product Gallery Images</label>
          <div className="mt-2 space-y-4">
            {galleryPreviews.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {galleryPreviews.map((url, idx) => (
                  <div
                    key={idx}
                    className="group relative aspect-square overflow-hidden rounded-xl border border-[#E5E5E0] bg-white"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeGalleryFile(idx)}
                      className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/85 text-[9px] font-bold text-white transition-colors hover:bg-black"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            {galleryFiles.length < 8 && (
              <div className="relative flex min-h-[120px] items-center justify-center rounded-2xl border border-dashed border-[#E5E5E0] bg-[#FAF7F0] p-6 transition-colors hover:bg-[#F5F5F0]">
                <div className="space-y-2 py-2 text-center">
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full border border-[#E5E5E0] bg-white">
                    <Upload className="h-4 w-4 text-[#8C8C85]" />
                  </div>
                  <div className="text-xs text-[#73736E]">
                    <label
                      htmlFor="gallery_images"
                      className="relative cursor-pointer rounded-md font-semibold text-black hover:underline"
                    >
                      <span>Add gallery image</span>
                      <input
                        id="gallery_images"
                        type="file"
                        accept="image/*"
                        multiple
                        className="sr-only"
                        onChange={handleGalleryChange}
                      />
                    </label>
                    <p className="mt-1 text-[#8C8C85]">
                      Up to {8 - galleryFiles.length} more (PNG, JPG, WEBP)
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div>
        <label htmlFor="name" className={labelClass}>
          Product name
        </label>
        <input
          id="name"
          name="name"
          required
          className={inputClass}
          placeholder="e.g. Premium Artisanal Wooden Block Set"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="category" className={labelClass}>
            Category
          </label>
          <div className="relative">
            <select
              id="category"
              name="category"
              defaultValue={TOY_CATEGORIES[0]}
              className={selectClass}
            >
              {TOY_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pt-1.5 pr-4">
              <span className="text-[10px] text-[#8C8C85]">▼</span>
            </div>
          </div>
        </div>
        <div>
          <label htmlFor="age_group" className={labelClass}>
            Age group
          </label>
          <div className="relative">
            <select
              id="age_group"
              name="age_group"
              defaultValue=""
              className={selectClass}
            >
              <option value="">Not specified</option>
              {AGE_GROUPS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pt-1.5 pr-4">
              <span className="text-[10px] text-[#8C8C85]">▼</span>
            </div>
          </div>
        </div>
        <div>
          <label htmlFor="price_inr" className={labelClass}>
            Price (INR)
          </label>
          <input
            id="price_inr"
            name="price_inr"
            type="number"
            min={0}
            step="0.01"
            className={inputClass}
            placeholder="e.g. 1999"
          />
        </div>
      </div>

      <div>
        <label htmlFor="description" className={labelClass}>
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          className={textareaClass}
          placeholder="Detailed item description, craftsmanship specifications, safety certifications..."
        />
      </div>

      <div>
        <label htmlFor="materials" className={labelClass}>
          Materials
        </label>
        <input
          id="materials"
          name="materials"
          placeholder="Natural Organic Wood, Non-Toxic Water-Based Paint"
          className={inputClass}
        />
      </div>

      {state?.error && (
        <p role="alert" className="mt-2 text-sm font-semibold text-rose-600">
          {state.error}
        </p>
      )}

      <Button
        type="submit"
        className="w-full rounded-xl bg-black px-6 py-2.5 text-xs font-semibold tracking-wider text-white uppercase transition-all hover:bg-neutral-800 sm:w-auto"
        disabled={isPending}
      >
        {isPending ? "Creating Listing…" : "Publish Catalog Product"}
      </Button>
    </form>
  );
}
