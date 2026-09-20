"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Button } from "@genz/ui";
import { setProductStatus, deleteProduct } from "../actions";
import type { ProductStatus } from "@/types/database";
import { toast } from "sonner";
import {
  Globe,
  Archive,
  Trash2,
  FileEdit,
  AlertTriangle,
  ExternalLink,
  Loader2,
} from "lucide-react";

export function PublishControls({
  productId,
  status: initialStatus,
}: {
  productId: string;
  status: ProductStatus;
}) {
  const [currentStatus, setCurrentStatus] = useState<ProductStatus>(initialStatus);
  const [isPending, startTransition] = useTransition();
  const [activeAction, setActiveAction] = useState<
    "published" | "draft" | "archived" | "delete" | null
  >(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const handleStatusChange = (nextStatus: ProductStatus) => {
    setActiveAction(nextStatus);
    startTransition(async () => {
      try {
        const res = await setProductStatus(productId, nextStatus);
        if (res && "error" in res && res.error) {
          toast.error("Failed to update status", { description: res.error });
        } else {
          setCurrentStatus(nextStatus);
          if (nextStatus === "published") {
            toast.success("Product published to live storefront!", {
              description: "Your product is now live and discoverable by all shoppers.",
            });
          } else if (nextStatus === "draft") {
            toast.success("Product moved to draft", {
              description:
                "Your product is saved as draft and hidden from public catalog.",
            });
          } else if (nextStatus === "archived") {
            toast.success("Product listing archived", {
              description: "Archived products are hidden from public catalog search.",
            });
          }
        }
      } catch (err) {
        toast.error("Error updating status", {
          description: err instanceof Error ? err.message : "Please try again.",
        });
      } finally {
        setActiveAction(null);
      }
    });
  };

  const handleDelete = () => {
    setActiveAction("delete");
    startTransition(async () => {
      try {
        toast.loading("Deleting product listing...", { id: "delete-prod" });
        await deleteProduct(productId);
        toast.success("Product deleted successfully", { id: "delete-prod" });
      } catch (err) {
        toast.error("Failed to delete product", {
          id: "delete-prod",
          description: err instanceof Error ? err.message : "Please try again.",
        });
        setActiveAction(null);
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Horizontal Toolbar */}
      <div className="flex flex-col gap-4 rounded-xl border border-[#E5E5E0] bg-white p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        {/* Left Status Indicator */}
        <div className="flex items-center gap-3">
          <div
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
              currentStatus === "published"
                ? "bg-[#FAF8F4] text-[#1A1A18]"
                : currentStatus === "archived"
                  ? "bg-[#FAF8F4] text-[#52524E]"
                  : "bg-amber-50 text-amber-700"
            }`}
          >
            {currentStatus === "published" ? (
              <Globe className="h-4 w-4" />
            ) : currentStatus === "archived" ? (
              <Archive className="h-4 w-4" />
            ) : (
              <FileEdit className="h-4 w-4" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#1A1A18] capitalize">
                {currentStatus === "published"
                  ? "Live in Storefront Marketplace"
                  : `${currentStatus} Status`}
              </span>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                  currentStatus === "published"
                    ? "border border-[#E5E5E0] bg-[#FAF8F4] text-[#1A1A18]"
                    : currentStatus === "archived"
                      ? "border border-[#E5E5E0] bg-[#FAF8F4] text-[#52524E]"
                      : "border border-amber-300 bg-amber-50 text-amber-800"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    currentStatus === "published"
                      ? "bg-[#1A1A18]"
                      : currentStatus === "archived"
                        ? "bg-neutral-400"
                        : "bg-amber-500"
                  }`}
                />
                {currentStatus === "published" ? "Active" : currentStatus}
              </span>
            </div>
            <span className="text-[11px] text-[#52524E]">
              {currentStatus === "published"
                ? "Visible to all buyers and search engine catalog"
                : currentStatus === "archived"
                  ? "Hidden from catalog search"
                  : "Saved as draft, not visible to buyers yet"}
            </span>
          </div>
        </div>

        {/* Right Action Buttons */}
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {currentStatus !== "published" && (
            <Button
              type="button"
              disabled={isPending}
              onClick={() => handleStatusChange("published")}
              className="flex h-9 items-center gap-1.5 rounded-lg bg-[#1A1A18] px-4 text-xs font-semibold text-white transition-all hover:bg-[#2E2E2B] disabled:opacity-60"
            >
              {activeAction === "published" ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Globe className="h-3.5 w-3.5" />
              )}
              <span>{activeAction === "published" ? "Publishing..." : "Publish"}</span>
            </Button>
          )}

          {currentStatus === "published" && (
            <>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="h-9 rounded-lg border border-[#E5E5E0] bg-white text-xs font-semibold text-[#1A1A18] hover:bg-[#FAF8F4]"
              >
                <Link
                  href={`/products/${productId}`}
                  target="_blank"
                  className="flex items-center gap-1.5 px-3"
                >
                  <span>View Public Page</span>
                  <ExternalLink className="h-3.5 w-3.5 text-[#52524E]" />
                </Link>
              </Button>

              <Button
                type="button"
                disabled={isPending}
                onClick={() => handleStatusChange("draft")}
                variant="outline"
                className="flex h-9 items-center gap-1.5 rounded-lg border border-[#E5E5E0] bg-white px-3.5 text-xs font-semibold text-[#1A1A18] transition-all hover:bg-[#FAF8F4] disabled:opacity-60"
              >
                {activeAction === "draft" ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <FileEdit className="h-3.5 w-3.5 text-[#52524E]" />
                )}
                <span>
                  {activeAction === "draft"
                    ? "Moving to Draft..."
                    : "Unpublish to Draft"}
                </span>
              </Button>
            </>
          )}

          {currentStatus !== "archived" && (
            <Button
              type="button"
              disabled={isPending}
              onClick={() => handleStatusChange("archived")}
              variant="outline"
              className="flex h-9 items-center gap-1.5 rounded-lg border border-[#E5E5E0] bg-white px-3.5 text-xs font-medium text-[#1A1A18] transition-all hover:bg-[#FAF8F4] disabled:opacity-60"
            >
              {activeAction === "archived" ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Archive className="h-3.5 w-3.5 text-[#52524E]" />
              )}
              <span>{activeAction === "archived" ? "Archiving..." : "Archive"}</span>
            </Button>
          )}

          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={() => setConfirmingDelete((prev) => !prev)}
            className="flex h-9 items-center gap-1.5 rounded-lg border border-rose-200 px-3 text-xs font-semibold text-rose-700 transition-all hover:bg-rose-50 disabled:opacity-60"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Delete</span>
          </Button>
        </div>
      </div>

      {/* Danger Zone Confirmation */}
      {confirmingDelete && (
        <div className="flex flex-col gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 font-semibold text-rose-800">
            <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>Are you sure you want to permanently delete this listing?</span>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button
              type="button"
              size="sm"
              disabled={isPending}
              onClick={handleDelete}
              className="rounded-lg bg-rose-600 px-4 text-xs font-bold text-white hover:bg-rose-700 disabled:opacity-60"
            >
              {activeAction === "delete" ? (
                <div className="flex items-center gap-1.5">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Deleting...</span>
                </div>
              ) : (
                "Confirm Delete"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isPending}
              onClick={() => setConfirmingDelete(false)}
              className="rounded-lg border border-rose-200 bg-white text-xs font-semibold text-rose-700 hover:bg-rose-50"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
