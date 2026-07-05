"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { DOC_TYPE_LABEL } from "@/lib/verification";
import type { ManufacturerDocument } from "@/types/database";

export function DocumentList({
  documents,
  canManage,
}: {
  documents: ManufacturerDocument[];
  canManage: boolean;
}) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function handleDelete(doc: ManufacturerDocument) {
    setPendingId(doc.id);
    const supabase = createClient();

    await supabase.storage.from("manufacturer-documents").remove([doc.file_path]);
    await supabase.from("manufacturer_documents").delete().eq("id", doc.id);

    setPendingId(null);
    router.refresh();
  }

  if (documents.length === 0) {
    return <p className="text-muted-foreground text-sm">No documents uploaded yet.</p>;
  }

  return (
    <ul className="divide-border border-border bg-card divide-y rounded-[4px] border">
      {documents.map((doc) => (
        <li
          key={doc.id}
          className="flex items-center justify-between gap-4 p-4 text-sm"
        >
          <div className="min-w-0">
            <p className="truncate font-medium">{doc.file_name}</p>
            <p className="text-muted-foreground text-xs">
              {DOC_TYPE_LABEL[doc.doc_type]} ·{" "}
              {new Date(doc.uploaded_at).toLocaleDateString()}
            </p>
          </div>
          {canManage && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={pendingId === doc.id}
              onClick={() => handleDelete(doc)}
            >
              {pendingId === doc.id ? "Removing…" : "Remove"}
            </Button>
          )}
        </li>
      ))}
    </ul>
  );
}
