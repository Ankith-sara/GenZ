"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/atoms/button";
import { setProductStatus, deleteProduct } from "../actions";
import type { ProductStatus } from "@/types/database";
import {
  Globe,
  Archive,
  Trash2,
  FileEdit,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";

export function PublishControls({
  productId,
  status,
}: {
  productId: string;
  status: ProductStatus;
}) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  return (
    <div className="font-graphik space-y-4">
      {/* Horizontal Toolbar */}
      <div className="flex flex-col gap-4 rounded-xl border border-[#E5E5E0] bg-[#FAF8F4] p-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Left Status Indicator */}
        <div className="flex items-center gap-2.5">
          {status === "published" ? (
            <div className="flex h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-500" />
          ) : status === "archived" ? (
            <div className="flex h-2.5 w-2.5 rounded-full bg-neutral-400" />
          ) : (
            <div className="flex h-2.5 w-2.5 rounded-full bg-amber-500" />
          )}
          <div>
            <span className="block text-xs font-bold text-[#1A1A18] capitalize">
              {status === "published"
                ? "Live in Storefront Marketplace"
                : `${status} Status`}
            </span>
            <span className="text-[11px] text-[#73736E]">
              {status === "published"
                ? "Visible to all buyers and search engine catalog"
                : status === "archived"
                  ? "Hidden from catalog search"
                  : "Saved as draft, not visible to buyers yet"}
            </span>
          </div>
        </div>

        {/* Right Action Buttons */}
        <div className="flex shrink-0 flex-wrap items-center gap-2.5">
          {status !== "published" && (
            <form action={setProductStatus.bind(null, productId, "published")}>
              <Button
                type="submit"
                className="flex h-10 items-center gap-2 rounded-xl bg-black px-4 text-xs font-semibold text-white shadow-2xs transition-all hover:bg-neutral-800"
              >
                <Globe className="h-3.5 w-3.5" />
                <span>Publish</span>
              </Button>
            </form>
          )}

          {status === "published" && (
            <>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="h-10 rounded-xl border-[#E5E5E0] bg-white text-xs font-semibold text-black hover:bg-[#FAF8F4]"
              >
                <Link
                  href="/discover"
                  target="_blank"
                  className="flex items-center gap-1.5 px-3"
                >
                  <span>View Public Page</span>
                  <ExternalLink className="h-3.5 w-3.5 text-[#73736E]" />
                </Link>
              </Button>

              <form action={setProductStatus.bind(null, productId, "draft")}>
                <Button
                  type="submit"
                  variant="outline"
                  className="flex h-10 items-center gap-2 rounded-xl border-[#E5E5E0] bg-white px-4 text-xs font-semibold text-black transition-all hover:bg-[#FAF8F4]"
                >
                  <FileEdit className="h-3.5 w-3.5 text-[#73736E]" />
                  <span>Unpublish to Draft</span>
                </Button>
              </form>
            </>
          )}

          {status !== "archived" && (
            <form action={setProductStatus.bind(null, productId, "archived")}>
              <Button
                type="submit"
                variant="outline"
                className="flex h-10 items-center gap-2 rounded-xl border-[#E5E5E0] bg-white px-4 text-xs font-medium text-[#52524E] transition-all hover:bg-[#FAF8F4]"
              >
                <Archive className="h-3.5 w-3.5 text-[#73736E]" />
                <span>Archive</span>
              </Button>
            </form>
          )}

          <Button
            type="button"
            variant="outline"
            onClick={() => setConfirmingDelete((prev) => !prev)}
            className="flex h-10 items-center gap-1.5 rounded-xl border-rose-200 bg-white px-3 text-xs font-semibold text-rose-600 transition-all hover:bg-rose-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Delete</span>
          </Button>
        </div>
      </div>

      {/* Danger Zone Confirmation Dropdown */}
      {confirmingDelete && (
        <div className="flex flex-col gap-3 rounded-xl border border-rose-200 bg-rose-50/80 p-4 text-xs sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 font-semibold text-rose-900">
            <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>Are you sure you want to permanently delete this listing?</span>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <form action={deleteProduct.bind(null, productId)}>
              <Button
                type="submit"
                size="sm"
                className="rounded-lg bg-rose-600 px-4 text-xs font-bold text-white hover:bg-rose-700"
              >
                Confirm Delete
              </Button>
            </form>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setConfirmingDelete(false)}
              className="rounded-lg border-rose-200 bg-white text-xs font-semibold text-rose-900 hover:bg-rose-100"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
