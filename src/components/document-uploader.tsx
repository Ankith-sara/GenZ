"use client";

import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { DOC_TYPE_LABEL, DOC_TYPES } from "@/lib/verification";
import type { DocType } from "@/types/database";

const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10MB
const ACCEPTED = ".pdf,.jpg,.jpeg,.png,.webp";

export function DocumentUploader({
  manufacturerId,
  docTypeOptions = DOC_TYPES,
}: {
  manufacturerId: string;
  docTypeOptions?: DocType[];
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [docType, setDocType] = useState<DocType>(docTypeOptions[0]);
  const [status, setStatus] = useState<"idle" | "uploading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      setError("Choose a file first.");
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setError("File must be under 10MB.");
      return;
    }

    setStatus("uploading");
    setError(null);

    const supabase = createClient();
    const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    const path = `${manufacturerId}/${docType}/${Date.now()}-${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from("manufacturer-documents")
      .upload(path, file, { upsert: false });

    if (uploadError) {
      setStatus("error");
      setError(uploadError.message);
      return;
    }

    const { error: insertError } = await supabase
      .from("manufacturer_documents")
      .insert({
        manufacturer_id: manufacturerId,
        doc_type: docType,
        file_path: path,
        file_name: file.name,
      });

    if (insertError) {
      setStatus("error");
      setError(insertError.message);
      return;
    }

    setStatus("idle");
    if (fileInputRef.current) fileInputRef.current.value = "";
    router.refresh();
  }

  return (
    <form
      onSubmit={handleUpload}
      className="border-border bg-card rounded-[4px] border p-6"
    >
      <div className="mb-4">
        <Label htmlFor="docType">Document type</Label>
        <select
          id="docType"
          value={docType}
          onChange={(e) => setDocType(e.target.value as DocType)}
          className="border-input bg-card text-foreground focus-visible:ring-foreground h-11 w-full rounded-[4px] border px-3.5 text-base focus-visible:ring-2 focus-visible:outline-none"
        >
          {docTypeOptions.map((t) => (
            <option key={t} value={t}>
              {DOC_TYPE_LABEL[t]}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <Label htmlFor="file">File</Label>
        <input
          ref={fileInputRef}
          id="file"
          type="file"
          accept={ACCEPTED}
          className="file:border-foreground block w-full text-sm file:mr-4 file:h-11 file:rounded-[4px] file:border file:bg-transparent file:px-4 file:text-sm"
        />
        <p className="text-muted-foreground mt-1.5 text-xs">
          PDF, JPG, PNG, or WebP. Up to 10MB.
        </p>
      </div>

      {error && (
        <p role="alert" className="text-destructive mb-4 text-sm">
          {error}
        </p>
      )}

      <Button type="submit" disabled={status === "uploading"}>
        <Upload className="h-4 w-4" aria-hidden="true" />
        {status === "uploading" ? "Uploading…" : "Upload document"}
      </Button>
    </form>
  );
}
