"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@genz/database/admin";
import { validateFileContentServer } from "@/lib/file-validation";
import { requireRole } from "@/features/auth/lib/require-role";
import { withRateLimit } from "@/lib/rate-limiter";
import type { DocType } from "@genz/types";

export interface DocumentUploadResult {
  success?: boolean;
  error?: string;
  documentId?: string;
}

export async function uploadDocumentAction(
  formData: FormData
): Promise<DocumentUploadResult> {
  const session = await requireRole("seller");
  const docType = String(formData.get("doc_type") ?? "") as DocType;
  const file = formData.get("document") as File | null;

  if (!file || file.size === 0) {
    return { error: "No document file provided." };
  }
  if (!docType) {
    return { error: "Document type is required." };
  }

  return withRateLimit(
    {
      endpointType: "user",
      actionName: "upload_document",
      identifier: session.userId,
    },
    async () => {
      const validation = await validateFileContentServer(file, ["image", "pdf"]);
      if (!validation.valid) {
        return { error: validation.error || "Invalid document file content." };
      }

      let supabase;
      try {
        supabase = createAdminClient();
      } catch (err: unknown) {
        console.error(
          "[CONFIG_ERROR] [uploadDocumentAction] Admin client init failed:",
          err
        );
        return {
          error:
            "Server misconfiguration: admin credentials are not set up. Contact an engineer.",
        };
      }

      const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
      const path = `${session.userId}/${docType}/${Date.now()}-${safeName}`;

      const buffer = Buffer.from(await file.arrayBuffer());
      const { error: uploadError } = await supabase.storage
        .from("seller-documents")
        .upload(path, buffer, { contentType: file.type, upsert: false });

      if (uploadError) {
        console.error("[uploadDocumentAction] Storage upload error:", uploadError);
        return { error: uploadError.message || "Failed to upload document." };
      }

      const { data, error: insertError } = await supabase
        .from("seller_documents")
        .insert({
          seller_id: session.userId,
          doc_type: docType,
          file_path: path,
          file_name: file.name,
        })
        .select("id")
        .single();

      if (insertError) {
        console.error("[uploadDocumentAction] DB insert error:", insertError);
        await supabase.storage.from("seller-documents").remove([path]);
        return { error: "Failed to record seller document in database." };
      }

      revalidatePath("/seller/dashboard/documents");
      revalidatePath("/seller/dashboard/onboarding");
      return { success: true, documentId: data.id };
    }
  );
}

export async function deleteDocumentAction(
  docId: string,
  filePath: string
): Promise<{ success?: boolean; error?: string }> {
  const session = await requireRole("seller");

  return withRateLimit(
    {
      endpointType: "user",
      actionName: "delete_document",
      identifier: session.userId,
    },
    async () => {
      let supabase;
      try {
        supabase = createAdminClient();
      } catch (err: unknown) {
        console.error(
          "[CONFIG_ERROR] [deleteDocumentAction] Admin client init failed:",
          err
        );
        return {
          error:
            "Server misconfiguration: admin credentials are not set up. Contact an engineer.",
        };
      }

      await supabase.storage.from("seller-documents").remove([filePath]);
      const { error: deleteError } = await supabase
        .from("seller_documents")
        .delete()
        .eq("id", docId)
        .eq("seller_id", session.userId);

      if (deleteError) {
        return { error: "Failed to delete document from database." };
      }

      revalidatePath("/seller/dashboard/documents");
      revalidatePath("/seller/dashboard/onboarding");
      return { success: true };
    }
  );
}

export async function submitForVerification() {
  const session = await requireRole("seller");
  let supabase;
  try {
    supabase = createAdminClient();
  } catch (err: unknown) {
    console.error("[submitForVerification] Admin client init error:", err);
    return { error: "Server misconfiguration." };
  }

  await supabase
    .from("seller_profiles")
    .update({ status: "pending" })
    .eq("id", session.userId);

  revalidatePath("/seller/dashboard/onboarding");
  return { success: true };
}
