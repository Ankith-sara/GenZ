import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/require-role";
import { Badge } from "@/components/ui/badge";
import { STATUS_LABEL, DOC_TYPE_LABEL } from "@/lib/verification";
import { ReviewActions } from "./review-actions";

export default async function AdminVerificationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole("admin");
  const { id } = await params;
  const supabase = await createClient();

  const { data: manufacturer } = await supabase
    .from("manufacturer_profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!manufacturer) notFound();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  const { data: documents } = await supabase
    .from("manufacturer_documents")
    .select("*")
    .eq("manufacturer_id", id)
    .order("uploaded_at", { ascending: false });

  const docsWithUrls = await Promise.all(
    (documents ?? []).map(async (doc) => {
      const { data: signed } = await supabase.storage
        .from("manufacturer-documents")
        .createSignedUrl(doc.file_path, 60 * 10); // 10 minutes
      return { ...doc, url: signed?.signedUrl ?? null };
    })
  );

  return (
    <div className="mx-auto max-w-3xl px-6 py-12 sm:px-12">
      <Link
        href="/dashboard/admin/verifications"
        className="text-muted-foreground text-sm hover:underline"
      >
        ← Back to verifications
      </Link>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <h1 className="text-3xl leading-[1.27]">{manufacturer.business_name}</h1>
        <Badge variant={manufacturer.status}>{STATUS_LABEL[manufacturer.status]}</Badge>
      </div>
      <p className="text-muted-foreground mt-1 text-sm">
        {profile?.full_name} · {profile?.phone ?? "no phone on file"}
      </p>

      <dl className="border-border bg-card mt-8 grid grid-cols-1 gap-6 rounded-[4px] border p-6 sm:grid-cols-2">
        <div>
          <dt className="text-muted-foreground text-xs">GSTIN</dt>
          <dd className="mt-1">{manufacturer.gst_number}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground text-xs">Established</dt>
          <dd className="mt-1">{manufacturer.established_year ?? "—"}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-muted-foreground text-xs">Factory address</dt>
          <dd className="mt-1">
            {manufacturer.factory_address ?? "—"}
            {manufacturer.city ? `, ${manufacturer.city}` : ""}
            {manufacturer.state ? `, ${manufacturer.state}` : ""}
            {manufacturer.pincode ? ` ${manufacturer.pincode}` : ""}
          </dd>
        </div>
        {manufacturer.description && (
          <div className="sm:col-span-2">
            <dt className="text-muted-foreground text-xs">What they make</dt>
            <dd className="mt-1">{manufacturer.description}</dd>
          </div>
        )}
      </dl>

      <h2 className="mt-8 mb-3 text-lg">Documents</h2>
      {docsWithUrls.length === 0 && (
        <p className="text-muted-foreground text-sm">No documents uploaded.</p>
      )}
      <ul className="divide-border border-border bg-card divide-y rounded-[4px] border">
        {docsWithUrls.map((doc) => (
          <li
            key={doc.id}
            className="flex items-center justify-between gap-4 p-4 text-sm"
          >
            <div>
              <p className="font-medium">{doc.file_name}</p>
              <p className="text-muted-foreground text-xs">
                {DOC_TYPE_LABEL[doc.doc_type]}
              </p>
            </div>
            {doc.url ? (
              <a
                href={doc.url}
                target="_blank"
                rel="noreferrer"
                className="text-sm underline underline-offset-2"
              >
                View
              </a>
            ) : (
              <span className="text-muted-foreground text-xs">Unavailable</span>
            )}
          </li>
        ))}
      </ul>

      <ReviewActions manufacturerId={manufacturer.id} status={manufacturer.status} />
    </div>
  );
}
