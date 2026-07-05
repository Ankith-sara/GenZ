"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { setProductStatus, deleteProduct } from "../actions";
import type { ProductStatus } from "@/types/database";

export function PublishControls({
  productId,
  status,
}: {
  productId: string;
  status: ProductStatus;
}) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  return (
    <div className="border-border mt-6 flex flex-wrap items-center gap-3 border-t pt-6">
      {status !== "published" && (
        <form action={setProductStatus.bind(null, productId, "published")}>
          <Button type="submit">Publish</Button>
        </form>
      )}
      {status === "published" && (
        <form action={setProductStatus.bind(null, productId, "draft")}>
          <Button type="submit" variant="outline">
            Unpublish
          </Button>
        </form>
      )}
      {status !== "archived" && (
        <form action={setProductStatus.bind(null, productId, "archived")}>
          <Button type="submit" variant="ghost">
            Archive
          </Button>
        </form>
      )}

      <div className="ml-auto">
        {!confirmingDelete ? (
          <Button
            type="button"
            variant="ghost"
            className="text-destructive"
            onClick={() => setConfirmingDelete(true)}
          >
            Delete product
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-sm">Delete permanently?</span>
            <form action={deleteProduct.bind(null, productId)}>
              <Button
                type="submit"
                variant="outline"
                size="sm"
                className="text-destructive"
              >
                Confirm delete
              </Button>
            </form>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setConfirmingDelete(false)}
            >
              Cancel
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
