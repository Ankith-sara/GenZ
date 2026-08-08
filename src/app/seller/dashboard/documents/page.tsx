import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/features/auth/lib/require-role";
import { DocumentUploadWizard } from "@/features/documents/components/document-upload-wizard";
import { DocumentUploader } from "@/features/documents/components/document-uploader";
import { DocumentList } from "@/features/documents/components/document-list";
import { PageHeader } from "@/components/ui/organisms/page-header";

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
    <div className="space-y-6 select-none">
      <PageHeader
        title="Document Vault & Compliance Credentials"
        description="Upload your GST certificate, factory photographs, and compliance clearances."
        breadcrumbs={[
          { label: "Seller Desk", href: "/seller/dashboard" },
          { label: "Document Vault" },
        ]}
      />

      {/* Main Upload Wizard */}
      <div className="rounded-2xl border border-[#E5E5E0] bg-white p-6 shadow-2xs">
        <DocumentUploadWizard
          sellerId={session.userId}
          initialDocuments={documents ?? []}
          verificationStatus={seller?.status ?? "not_submitted"}
        />
      </div>

      {/* Other Supporting Documents Section */}
      <div className="space-y-4 rounded-2xl border border-[#E5E5E0] bg-white p-6 shadow-2xs">
        <div className="border-b border-[#F0F0EC] pb-3">
          <h3 className="font-graphik text-sm font-bold text-[#1A1A18]">
            Additional Supporting Documents
          </h3>
          <p className="font-graphik text-xs text-[#73736E]">
            Export licenses, proprietary trademarks, ISO certificates, or brand
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
