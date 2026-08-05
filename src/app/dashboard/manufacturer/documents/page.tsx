import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/require-role";
import { DocumentUploadWizard } from "@/components/document-upload-wizard";
import { DocumentUploader } from "@/components/document-uploader";
import { DocumentList } from "@/components/document-list";

export default async function ManufacturerDocumentsPage() {
  const session = await requireRole("manufacturer");
  const supabase = await createClient();

  const { data: documents } = await supabase
    .from("manufacturer_documents")
    .select("*")
    .eq("manufacturer_id", session.userId)
    .order("uploaded_at", { ascending: false });

  const { data: manufacturer } = await supabase
    .from("manufacturer_profiles")
    .select("status")
    .eq("id", session.userId)
    .single();

  const otherDocuments = (documents ?? []).filter((d) => d.doc_type === "other");

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header and Back Link Row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-nantes text-3xl font-bold text-[#1A1A18]">
            Verification Documents
          </h1>
          <p className="font-graphik mt-1 text-xs text-[#73736E]">
            Upload your GST Certificate, factory photographs, and quality certificates.
            Secured for review by the admin team.
          </p>
        </div>
        <Link
          href="/dashboard/manufacturer"
          className="font-graphik flex items-center gap-1.5 text-xs font-semibold text-[#52524E] hover:text-black sm:order-first"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      {/* Main Upload Wizard */}
      <div className="rounded-3xl border border-[#E5E5E0] bg-white p-6 shadow-xs sm:p-8">
        <DocumentUploadWizard
          manufacturerId={session.userId}
          initialDocuments={documents ?? []}
          verificationStatus={manufacturer?.status ?? "not_submitted"}
        />
      </div>

      {/* Other Documents Section */}
      <div className="space-y-4 rounded-3xl border border-[#E5E5E0] bg-white p-6 shadow-xs sm:p-8">
        <div>
          <h3 className="font-graphik text-[11px] font-semibold tracking-wider text-[#8C8C85] uppercase">
            Other Supporting Documents
          </h3>
          <p className="font-graphik mt-1 text-xs text-[#73736E]">
            Export licenses, proprietary trademarks, or brand registrations.
          </p>
        </div>

        <div className="space-y-4 border-t border-[#F0F0EC] pt-4">
          <DocumentUploader
            manufacturerId={session.userId}
            docTypeOptions={["other"]}
          />
          <div className="mt-4">
            <DocumentList documents={otherDocuments} canManage />
          </div>
        </div>
      </div>
    </div>
  );
}
