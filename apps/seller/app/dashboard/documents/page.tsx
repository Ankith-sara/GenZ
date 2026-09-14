import { createClient } from "@genz/database";
import { requireRole } from "@/features/auth/lib/require-role";
import { DocumentUploadWizard } from "@/features/documents/components/document-upload-wizard";
import { DocumentUploader } from "@/features/documents/components/document-uploader";
import { DocumentList } from "@/features/documents/components/document-list";
import { PageHeader } from "@genz/ui";

export default async function SellerDocumentsPage() {
  const session = await requireRole("seller");
  const supabase = await createClient();

  const [{ data: documents }, { data: seller }] = await Promise.all([
    supabase
      .from("seller_documents")
      .select("*")
      .eq("seller_id", session.userId)
      .order("uploaded_at", { ascending: false }),
    supabase
      .from("seller_profiles")
      .select("status")
      .eq("id", session.userId)
      .maybeSingle(),
  ]);

  const otherDocuments = (documents ?? []).filter((d) => d.doc_type === "other");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Verification Documents"
        description="Upload your GST certificate, business licenses, or trade credentials to verify your store."
        breadcrumbs={[
          { label: "Overview", href: "/dashboard" },
          { label: "Verification Documents" },
        ]}
      />

      {/* Main Upload Wizard */}
      <div className="border-outline-variant/60 bg-surface-container-lowest shadow-elevation-1 rounded-2xl border p-5 sm:p-6">
        <DocumentUploadWizard
          sellerId={session.userId}
          initialDocuments={documents ?? []}
          verificationStatus={seller?.status ?? "not_submitted"}
        />
      </div>

      {/* Other Supporting Documents Section */}
      <div className="border-outline-variant/60 bg-surface-container-lowest shadow-elevation-1 space-y-4 rounded-2xl border p-5 sm:p-6">
        <div className="border-outline-variant/40 border-b pb-3">
          <h3 className="text-on-surface text-sm font-bold">
            Additional Supporting Documents
          </h3>
          <p className="text-on-surface-variant text-xs">
            Optional export licenses, trademarks, artisan certificates, or brand
            registrations.
          </p>
        </div>

        <div className="space-y-4 pt-1">
          <DocumentUploader sellerId={session.userId} docTypeOptions={["other"]} />
          <div className="mt-4">
            <DocumentList documents={otherDocuments} canManage />
          </div>
        </div>
      </div>
    </div>
  );
}
