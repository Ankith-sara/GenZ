import React from "react";
import { FileText, Bold, Italic, Heading, List, ListOrdered, Link2 } from "lucide-react";
import { TOY_CATEGORIES } from "@/features/products/lib/products";

interface BasicInfoCardProps {
  name: string;
  onChangeName: (val: string) => void;
  priceInr: string;
  onChangePriceInr: (val: string) => void;
  category: string;
  onChangeCategory: (val: string) => void;
  description: string;
  onChangeDescription: (val: string) => void;
  materials: string;
  onChangeMaterials: (val: string) => void;
}

const FOCUS_RING =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#171717]/20 focus-visible:ring-offset-1";

export function BasicInfoCard({
  name,
  onChangeName,
  priceInr,
  onChangePriceInr,
  category,
  onChangeCategory,
  description,
  onChangeDescription,
  materials,
  onChangeMaterials,
}: BasicInfoCardProps) {
  const insertFormatting = (prefix: string, suffix: string = "") => {
    onChangeDescription(`${description}${prefix}Formatted Text${suffix}`);
  };

  return (
    <div id="basic-info" className="space-y-4 rounded-xl border border-[#E5E5E5] bg-white p-5 shadow-xs">
      <div className="border-b border-[#E5E5E5] pb-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-[#171717]">
          <FileText className="h-4 w-4 text-[#737373]" />
          <span>Basic Information</span>
        </h2>
        <p className="mt-0.5 text-xs text-[#737373]">
          Add the core details, title, category, price, and descriptive craftsmanship specifications.
        </p>
      </div>

      <div className="space-y-4">
        {/* Product Name & Selling Price */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <div className="flex items-center justify-between">
              <label htmlFor="name" className="block text-xs font-medium text-[#171717]">
                Product Name <span className="text-rose-600">*</span>
              </label>
              <span className="font-mono text-[10px] text-[#737373]">
                {name.length}/100
              </span>
            </div>
            <input
              id="name"
              name="name"
              type="text"
              required
              maxLength={100}
              value={name}
              onChange={(e) => onChangeName(e.target.value)}
              placeholder="e.g. Handcrafted Wooden Lacquer Elephant"
              className={`mt-1.5 h-9 w-full rounded-lg border border-[#E5E5E5] bg-white px-3 text-xs text-[#171717] placeholder-[#A3A3A3] ${FOCUS_RING}`}
            />
          </div>

          <div>
            <label htmlFor="price_inr" className="block text-xs font-medium text-[#171717]">
              Selling Price (INR ₹) <span className="text-rose-600">*</span>
            </label>
            <div className="relative mt-1.5">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs text-[#737373]">
                ₹
              </span>
              <input
                id="price_inr"
                name="price_inr"
                type="number"
                min={0}
                step="0.01"
                required
                value={priceInr}
                onChange={(e) => onChangePriceInr(e.target.value)}
                placeholder="1499"
                className={`h-9 w-full rounded-lg border border-[#E5E5E5] bg-white pl-7 pr-3 font-mono text-xs text-[#171717] placeholder-[#A3A3A3] ${FOCUS_RING}`}
              />
            </div>
          </div>
        </div>

        {/* Category & Materials */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="category" className="block text-xs font-medium text-[#171717]">
              Category <span className="text-rose-600">*</span>
            </label>
            <select
              id="category"
              name="category"
              value={category}
              onChange={(e) => onChangeCategory(e.target.value)}
              className={`mt-1.5 h-9 w-full rounded-lg border border-[#E5E5E5] bg-white px-3 text-xs text-[#171717] ${FOCUS_RING}`}
            >
              {TOY_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="materials" className="block text-xs font-medium text-[#171717]">
              Materials (Comma Separated)
            </label>
            <input
              id="materials"
              name="materials"
              type="text"
              value={materials}
              onChange={(e) => onChangeMaterials(e.target.value)}
              placeholder="e.g. Ankudu Softwood, Natural Vegetable Lacquer"
              className={`mt-1.5 h-9 w-full rounded-lg border border-[#E5E5E5] bg-white px-3 text-xs text-[#171717] placeholder-[#A3A3A3] ${FOCUS_RING}`}
            />
          </div>
        </div>

        {/* Description Rich Text Editor Simulation */}
        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="description" className="block text-xs font-medium text-[#171717]">
              Full Description
            </label>
            <span className="font-mono text-[10px] text-[#737373]">
              {description.length}/2000
            </span>
          </div>

          <div className="mt-1.5 overflow-hidden rounded-lg border border-[#E5E5E5] bg-white">
            {/* Formatting Toolbar */}
            <div className="flex items-center gap-1 border-b border-[#E5E5E5] bg-[#FAFAF9] px-2.5 py-1.5">
              <button
                type="button"
                onClick={() => insertFormatting("**", "**")}
                className="rounded p-1 text-[#525252] hover:bg-[#E5E5E5] hover:text-[#171717]"
                title="Bold"
              >
                <Bold className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting("*", "*")}
                className="rounded p-1 text-[#525252] hover:bg-[#E5E5E5] hover:text-[#171717]"
                title="Italic"
              >
                <Italic className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting("### ")}
                className="rounded p-1 text-[#525252] hover:bg-[#E5E5E5] hover:text-[#171717]"
                title="Heading"
              >
                <Heading className="h-3.5 w-3.5" />
              </button>
              <div className="h-3.5 w-px bg-[#E5E5E5] mx-1" />
              <button
                type="button"
                onClick={() => insertFormatting("\n- ")}
                className="rounded p-1 text-[#525252] hover:bg-[#E5E5E5] hover:text-[#171717]"
                title="Bullet list"
              >
                <List className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting("\n1. ")}
                className="rounded p-1 text-[#525252] hover:bg-[#E5E5E5] hover:text-[#171717]"
                title="Numbered list"
              >
                <ListOrdered className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting("[Link Title](https://)")}
                className="rounded p-1 text-[#525252] hover:bg-[#E5E5E5] hover:text-[#171717]"
                title="Link"
              >
                <Link2 className="h-3.5 w-3.5" />
              </button>
            </div>

            <textarea
              id="description"
              name="description"
              rows={6}
              value={description}
              onChange={(e) => onChangeDescription(e.target.value)}
              placeholder="Detailed item description, craftsmanship specifications, artisan background, dimensions, and safety certifications..."
              className="w-full bg-white p-3 text-xs text-[#171717] placeholder-[#A3A3A3] focus:outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
