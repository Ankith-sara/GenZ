import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/require-role";
import { ReviewActions } from "./review-actions";

export default async function AdminVerificationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole("admin");
  const { id } = await params;
  const supabase = await createClient();

  const { data: application } = await supabase
    .from("seller_applications")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!application) notFound();

  const formData = (application.form_data ?? {}) as Record<string, string>;
  const businessType = application.business_type || "seller";

  return (
    <div className="mx-auto max-w-6xl px-1 py-4 sm:px-6 sm:py-8">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-[#E5E5E0] pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-nantes text-2xl font-bold text-black sm:text-3xl">
              {application.business_name}
            </h1>
            <span className="bg-brand-yellow rounded px-2 py-0.5 text-[10px] font-bold text-black uppercase">
              {businessType}
            </span>
          </div>
          <p className="font-graphik text-smoke mt-1 text-xs break-all sm:text-sm">
            {application.full_name} · {application.phone || "No phone"} ·{" "}
            {application.email}
          </p>
          <p className="font-graphik mt-1 text-xs text-[#8C8C85]">
            Submitted:{" "}
            {new Date(application.created_at).toLocaleDateString("en-IN", {
              weekday: "short",
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={`rounded-full border px-4 py-1.5 text-xs font-bold tracking-wider uppercase ${
              application.status === "pending"
                ? "border-amber-200 bg-amber-50 text-amber-700"
                : application.status === "approved"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {application.status}
          </span>
          <Link
            href="/admin/dashboard/verifications"
            className="font-graphik flex h-9 shrink-0 items-center justify-center gap-2 rounded-full border border-[#E5E5E0] bg-white px-4 text-xs font-semibold text-black transition-colors hover:border-black hover:bg-[#FAF7F0] sm:h-10"
            aria-label="Back to applications"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Link>
        </div>
      </div>

      {/* Application Details */}
      <div className="mt-8 space-y-6">
        {/* Contact & Owner Info */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-[#E5E5E0] bg-white p-6">
            <h3 className="font-graphik mb-4 border-b border-[#E5E5E0] pb-2 text-xs font-bold tracking-wider text-black uppercase">
              Owner &amp; Contact
            </h3>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="font-graphik text-smoke text-xs font-semibold uppercase">
                  Full Name
                </dt>
                <dd className="font-graphik mt-0.5 font-medium text-black">
                  {application.full_name}
                </dd>
              </div>
              <div>
                <dt className="font-graphik text-smoke text-xs font-semibold uppercase">
                  Email
                </dt>
                <dd className="mt-0.5 font-mono text-xs font-medium text-black">
                  {application.email}
                </dd>
              </div>
              <div>
                <dt className="font-graphik text-smoke text-xs font-semibold uppercase">
                  Phone
                </dt>
                <dd className="mt-0.5 font-mono text-xs font-medium text-black">
                  {application.phone || "—"}
                </dd>
              </div>
              {formData.owner_name && formData.owner_name !== application.full_name && (
                <div>
                  <dt className="font-graphik text-smoke text-xs font-semibold uppercase">
                    Authorized Person
                  </dt>
                  <dd className="font-graphik mt-0.5 font-medium text-black">
                    {formData.owner_name}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          <div className="rounded-2xl border border-[#E5E5E0] bg-white p-6">
            <h3 className="font-graphik mb-4 border-b border-[#E5E5E0] pb-2 text-xs font-bold tracking-wider text-black uppercase">
              Location &amp; Facility
            </h3>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="font-graphik text-smoke text-xs font-semibold uppercase">
                  Factory Address
                </dt>
                <dd className="font-graphik mt-0.5 font-medium text-black">
                  {formData.factory_address || "—"}, {formData.city || "—"},{" "}
                  {formData.state || "—"} - {formData.pincode || "—"}
                </dd>
              </div>
              {formData.established_year && (
                <div>
                  <dt className="font-graphik text-smoke text-xs font-semibold uppercase">
                    Established
                  </dt>
                  <dd className="font-graphik mt-0.5 font-medium text-black">
                    {formData.established_year}
                  </dd>
                </div>
              )}
              {formData.employee_count && (
                <div>
                  <dt className="font-graphik text-smoke text-xs font-semibold uppercase">
                    Employees
                  </dt>
                  <dd className="font-graphik mt-0.5 font-medium text-black">
                    {formData.employee_count}
                  </dd>
                </div>
              )}
              {formData.google_maps_location && (
                <div>
                  <dt className="font-graphik text-smoke text-xs font-semibold uppercase">
                    Google Maps
                  </dt>
                  <dd className="mt-0.5">
                    <a
                      href={formData.google_maps_location}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-semibold text-blue-600 hover:underline"
                    >
                      Open Maps Location
                    </a>
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>

        {/* Manufacturing Details */}
        {(formData.product_categories || formData.products_manufactured) && (
          <div className="rounded-2xl border border-[#E5E5E0] bg-white p-6">
            <h3 className="font-graphik mb-4 border-b border-[#E5E5E0] pb-2 text-xs font-bold tracking-wider text-black uppercase">
              Manufacturing Capabilities
            </h3>
            <dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
              {formData.product_categories && (
                <div>
                  <dt className="font-graphik text-smoke text-xs font-semibold uppercase">
                    Categories
                  </dt>
                  <dd className="font-graphik mt-0.5 font-medium text-black">
                    {formData.product_categories}
                  </dd>
                </div>
              )}
              {formData.products_manufactured && (
                <div>
                  <dt className="font-graphik text-smoke text-xs font-semibold uppercase">
                    Products
                  </dt>
                  <dd className="font-graphik mt-0.5 font-medium text-black">
                    {formData.products_manufactured}
                  </dd>
                </div>
              )}
              {formData.manufacturing_capacity && (
                <div>
                  <dt className="font-graphik text-smoke text-xs font-semibold uppercase">
                    Monthly Capacity
                  </dt>
                  <dd className="font-graphik mt-0.5 font-medium text-black">
                    {formData.manufacturing_capacity}
                  </dd>
                </div>
              )}
              {formData.moq && (
                <div>
                  <dt className="font-graphik text-smoke text-xs font-semibold uppercase">
                    MOQ
                  </dt>
                  <dd className="font-graphik mt-0.5 font-medium text-black">
                    {formData.moq}
                  </dd>
                </div>
              )}
              {formData.oem_odm && (
                <div>
                  <dt className="font-graphik text-smoke text-xs font-semibold uppercase">
                    OEM / ODM
                  </dt>
                  <dd className="font-graphik mt-0.5 font-medium text-black">
                    {formData.oem_odm}
                  </dd>
                </div>
              )}
              {formData.export_available && (
                <div>
                  <dt className="font-graphik text-smoke text-xs font-semibold uppercase">
                    Export Available
                  </dt>
                  <dd className="font-graphik mt-0.5 font-medium text-black">
                    {formData.export_available}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        )}

        {/* Documents & Verification */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-[#E5E5E0] bg-white p-6">
            <h3 className="font-graphik mb-4 border-b border-[#E5E5E0] pb-2 text-xs font-bold tracking-wider text-black uppercase">
              Documents
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between rounded-lg border border-[#E5E5E0] bg-[#FAF7F0] p-3">
                <div>
                  <p className="font-graphik font-semibold text-black">
                    GST Certificate
                  </p>
                  <p className="font-mono text-[#73736E]">
                    {formData.gst_number || "—"}
                  </p>
                </div>
                {formData.gst_number && (
                  <span className="bg-brand-yellow rounded px-2 py-0.5 text-[10px] font-bold text-black">
                    Provided
                  </span>
                )}
              </div>
              {formData.pan_number && (
                <div className="flex items-center justify-between rounded-lg border border-[#E5E5E0] bg-[#FAF7F0] p-3">
                  <div>
                    <p className="font-graphik font-semibold text-black">PAN Number</p>
                    <p className="font-mono text-[#73736E]">{formData.pan_number}</p>
                  </div>
                  <span className="bg-brand-yellow rounded px-2 py-0.5 text-[10px] font-bold text-black">
                    Provided
                  </span>
                </div>
              )}
              {formData.cin_number && (
                <div className="flex items-center justify-between rounded-lg border border-[#E5E5E0] bg-[#FAF7F0] p-3">
                  <div>
                    <p className="font-graphik font-semibold text-black">CIN Number</p>
                    <p className="font-mono text-[#73736E]">{formData.cin_number}</p>
                  </div>
                  <span className="bg-brand-yellow rounded px-2 py-0.5 text-[10px] font-bold text-black">
                    Provided
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-[#E5E5E0] bg-white p-6">
            <h3 className="font-graphik mb-4 border-b border-[#E5E5E0] pb-2 text-xs font-bold tracking-wider text-black uppercase">
              Uploaded Proofs
            </h3>
            <ul className="space-y-2 text-xs">
              {[
                { key: "company_logo", label: "Company Logo" },
                { key: "factory_exterior", label: "Factory Exterior" },
                { key: "factory_interior", label: "Factory Interior" },
                { key: "machinery_photo", label: "Machinery Photo" },
                { key: "production_line", label: "Production Line" },
                { key: "udyam_certificate_file", label: "UDYAM Certificate" },
                { key: "factory_license_file", label: "Factory License" },
              ]
                .filter((item) => formData[item.key])
                .map((item) => (
                  <li
                    key={item.key}
                    className="flex items-center justify-between rounded-lg border border-[#E5E5E0] bg-[#FAF7F0] p-3"
                  >
                    <span className="font-graphik font-semibold text-black">
                      {item.label}
                    </span>
                    <span className="font-mono text-[10px] font-medium text-emerald-600">
                      ✓ Uploaded
                    </span>
                  </li>
                ))}
              {Object.keys(formData).filter((k) =>
                [
                  "company_logo",
                  "factory_exterior",
                  "factory_interior",
                  "machinery_photo",
                  "production_line",
                  "udyam_certificate_file",
                  "factory_license_file",
                ].includes(k)
              ).length === 0 && (
                <li className="font-graphik text-smoke py-2">No files uploaded</li>
              )}
            </ul>
          </div>
        </div>

        {/* Walkthrough Video */}
        {formData.walkthrough_video && (
          <div className="rounded-2xl border border-[#E5E5E0] bg-white p-6">
            <h3 className="font-graphik mb-4 border-b border-[#E5E5E0] pb-2 text-xs font-bold tracking-wider text-black uppercase">
              Factory Walkthrough Video
            </h3>
            <div className="flex h-32 items-center justify-center rounded-xl bg-neutral-900 text-white">
              <div className="text-center">
                <p className="mt-2 text-sm font-medium">Video Submitted</p>
                <p className="text-xs text-white/50">{formData.walkthrough_video}</p>
              </div>
            </div>
          </div>
        )}

        {/* Rejection reason (if rejected) */}
        {application.status === "rejected" && application.rejection_reason && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
            <h4 className="font-graphik mb-1 text-xs font-bold tracking-wider text-red-800 uppercase">
              Rejection Reason
            </h4>
            <p className="font-graphik text-sm leading-relaxed text-red-700">
              {application.rejection_reason}
            </p>
          </div>
        )}
      </div>

      {/* Review Actions Panel */}
      <div className="mt-8 border-t border-[#E5E5E0] pt-8">
        <ReviewActions
          sellerId={application.id}
          status={application.status}
          defaultEmail={application.email}
          businessName={application.business_name}
        />
      </div>
    </div>
  );
}
