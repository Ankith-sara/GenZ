"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@genz/database/admin";
import { validateFileContentServer } from "@genz/validation";
import { requireRole } from "@genz/database/authorization";
import { withRateLimit } from "@genz/utils/rate-limiter";
import type { DocType } from "@genz/types";
import { getAuthenticatedSellerApiClient } from "@/lib/api-server-client";

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

      let documentId: string | undefined;

      try {
        const client = await getAuthenticatedSellerApiClient();
        const docRes = await client.sellers.uploadDocument({
          document_type: docType,
          file_url: path,
          file_name: file.name,
          file_size: file.size,
        });
        documentId = (docRes as any)?.id || (docRes as any)?.document?.id;
      } catch (err: unknown) {
        console.error("[uploadDocumentAction] API error:", err);
        await supabase.storage.from("seller-documents").remove([path]);
        return {
          error:
            err instanceof Error
              ? err.message
              : "Failed to record seller document in database via backend API.",
        };
      }

      revalidatePath("/seller/dashboard/documents");
      revalidatePath("/seller/dashboard/onboarding");
      return { success: true, documentId };
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

      try {
        const client = await getAuthenticatedSellerApiClient();
        await client.sellers.deleteDocument(docId);
      } catch (err: unknown) {
        console.error("[deleteDocumentAction] API error:", err);
        return {
          error:
            err instanceof Error
              ? err.message
              : "Failed to delete document from database via backend API.",
        };
      }

      revalidatePath("/seller/dashboard/documents");
      revalidatePath("/seller/dashboard/onboarding");
      return { success: true };
    }
  );
}

export async function submitForVerification() {
  const session = await requireRole("seller");
  try {
    const client = await getAuthenticatedSellerApiClient();
    await client.sellers.submitForVerification();
  } catch (err: unknown) {
    console.error("[submitForVerification] API error:", err);
    return {
      error:
        err instanceof Error
          ? err.message
          : "Failed to submit for verification via backend API.",
    };
  }

  revalidatePath("/seller/dashboard/onboarding");
  return { success: true };
}
