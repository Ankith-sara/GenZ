import Link from "next/link";
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
    <div className="mx-auto max-w-3xl px-6 py-12 sm:px-12">
      <Link
        href="/dashboard/manufacturer"
        className="text-muted-foreground text-sm hover:underline"
      >
        ← Back to dashboard
      </Link>
      <h1 className="mt-4 text-3xl leading-[1.27]">Verification documents</h1>
      <p className="text-muted-foreground mt-2 max-w-xl">
        Work through the three steps below — GST certificate, factory photos, and
        (optionally) quality certificates. These are only visible to you and the GenZ
        admin team.
      </p>

      <div className="mt-8">
        <DocumentUploadWizard
          manufacturerId={session.userId}
          initialDocuments={documents ?? []}
          verificationStatus={manufacturer?.status ?? "not_submitted"}
        />
      </div>

      <div className="border-border mt-10 border-t pt-8">
        <h2 className="mb-1 text-lg">Other documents</h2>
        <p className="text-muted-foreground mb-4 text-sm">
          Anything else you&apos;d like the admin team to see — export licenses, brand
          registrations, and so on.
        </p>
        <DocumentUploader manufacturerId={session.userId} docTypeOptions={["other"]} />
        <div className="mt-4">
          <DocumentList documents={otherDocuments} canManage />
        </div>
      </div>
    </div>
  );
}
