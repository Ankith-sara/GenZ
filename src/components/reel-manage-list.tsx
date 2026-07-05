"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { productMediaUrl } from "@/lib/products";
import type { Reel } from "@/types/database";

export function ReelManageList({ reels }: { reels: Reel[] }) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function handleDelete(reel: Reel) {
    setPendingId(reel.id);
    const supabase = createClient();

    const paths = [reel.video_path, reel.thumbnail_path].filter(
      (p): p is string => !!p
    );
    await supabase.storage.from("product-media").remove(paths);
    await supabase.from("reels").delete().eq("id", reel.id);

    setPendingId(null);
    router.refresh();
  }

  if (reels.length === 0) {
    return <p className="text-muted-foreground text-sm">No reels uploaded yet.</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {reels.map((reel) => {
        const videoUrl = productMediaUrl(reel.video_path);
        const thumbUrl = productMediaUrl(reel.thumbnail_path);
        return (
          <div key={reel.id} className="border-border bg-card rounded-[4px] border p-4">
            <div className="aspect-video overflow-hidden rounded-[4px] bg-black">
              {videoUrl && (
                <video
                  src={videoUrl}
                  poster={thumbUrl ?? undefined}
                  controls
                  className="h-full w-full object-cover"
                />
              )}
            </div>
            {reel.caption && <p className="mt-3 text-sm">{reel.caption}</p>}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-destructive mt-2"
              disabled={pendingId === reel.id}
              onClick={() => handleDelete(reel)}
            >
              {pendingId === reel.id ? "Removing…" : "Remove reel"}
            </Button>
          </div>
        );
      })}
    </div>
  );
}
