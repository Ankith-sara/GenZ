import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireRole } from "@/lib/require-role";
import { ProductForm } from "../product-form";

export default async function NewProductPage() {
  await requireRole("manufacturer");

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header and Back Link Row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-nantes text-3xl font-bold text-[#1A1A18]">New Product</h1>
          <p className="font-graphik mt-1 text-xs text-[#73736E]">
            Starts as a draft. You can add image assets, variants, and reels once
            created.
          </p>
        </div>
        <Link
          href="/dashboard/manufacturer/products"
          className="font-graphik flex items-center gap-1.5 text-xs font-semibold text-[#52524E] hover:text-black sm:order-first"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Products</span>
        </Link>
      </div>

      <div className="rounded-3xl border border-[#E5E5E0] bg-white p-6 shadow-xs sm:p-8">
        <ProductForm mode="create" />
      </div>
    </div>
  );
}
