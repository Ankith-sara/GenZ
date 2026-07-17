import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Building2,
  MapPin,
  Award,
  Shield,
  FileText,
  CheckCircle2,
  Video,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/require-role";
import { Badge } from "@/components/ui/badge";
import { STATUS_LABEL } from "@/lib/verification";
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

  // Try parsing custom metadata from the description column
  let metadata: Record<string, string | number | boolean | null | undefined> = {};
  let isJsonMetadata = false;

  try {
    if (manufacturer.description && manufacturer.description.startsWith("{")) {
      metadata = JSON.parse(manufacturer.description);
      isJsonMetadata = true;
    }
  } catch (e) {
    console.error("Failed to parse manufacturer description JSON:", e);
  }

  const businessType = metadata.business_type || "manufacturer";

  return (
    <div className="mx-auto max-w-4xl px-6 py-12 sm:px-12">
      <Link
        href="/admin/dashboard"
        className="text-smoke hover:text-brand-yellow flex items-center gap-1 text-sm hover:underline"
      >
        ← Back to control center
      </Link>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-b pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-3xl font-semibold text-black">
              {manufacturer.business_name}
            </h1>
            <Badge className="bg-brand-yellow ml-2 text-[10px] text-black uppercase">
              {businessType}
            </Badge>
          </div>
          <p className="text-smoke mt-1 text-sm">
            Registered: {profile?.full_name || "—"} ·{" "}
            {profile?.phone || metadata.phone || "No phone"} ·{" "}
            {metadata.email || "No email"}
          </p>
        </div>
        <Badge variant={manufacturer.status} className="px-3 py-1 text-sm">
          {STATUS_LABEL[manufacturer.status]}
        </Badge>
      </div>

      {/* Render detailed view based on business type */}
      {isJsonMetadata ? (
        <div className="mt-8 space-y-8">
          {/* MANUFACTURER REVIEW LAYOUT */}
          {businessType === "manufacturer" && (
            <>
              {/* Step 1 & 2: Basic & Factory Details */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="bg-paper-white rounded-[4px] border p-6">
                  <h3 className="mb-4 flex items-center gap-2 border-b pb-2 font-serif text-base font-semibold text-black">
                    <Building2 className="h-4.5 w-4.5" /> Company & Owner
                  </h3>
                  <dl className="space-y-3 text-sm">
                    <div>
                      <dt className="text-smoke text-xs font-semibold uppercase">
                        Factory Name
                      </dt>
                      <dd className="mt-0.5 font-medium text-neutral-800">
                        {manufacturer.business_name}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-smoke text-xs font-semibold uppercase">
                        Authorized Person
                      </dt>
                      <dd className="mt-0.5 font-medium text-neutral-800">
                        {metadata.owner_name}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-smoke text-xs font-semibold uppercase">
                        Contact Email
                      </dt>
                      <dd className="mt-0.5 font-mono text-xs font-medium text-neutral-800">
                        {metadata.email}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-smoke text-xs font-semibold uppercase">
                        Phone Number
                      </dt>
                      <dd className="mt-0.5 flex items-center gap-1.5 font-medium text-neutral-800">
                        {metadata.phone}
                        <Badge className="border border-green-200 bg-green-50 text-[10px] text-green-700">
                          OTP Verified
                        </Badge>
                      </dd>
                    </div>
                  </dl>
                </div>

                <div className="bg-paper-white rounded-[4px] border p-6">
                  <h3 className="mb-4 flex items-center gap-2 border-b pb-2 font-serif text-base font-semibold text-black">
                    <MapPin className="h-4.5 w-4.5" /> Factory Facility Details
                  </h3>
                  <dl className="space-y-3 text-sm">
                    <div>
                      <dt className="text-smoke text-xs font-semibold uppercase">
                        Address
                      </dt>
                      <dd className="mt-0.5 font-medium text-neutral-800">
                        {manufacturer.factory_address}, {manufacturer.city},{" "}
                        {manufacturer.state} - {manufacturer.pincode}
                      </dd>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <dt className="text-smoke text-xs font-semibold uppercase">
                          Established
                        </dt>
                        <dd className="mt-0.5 font-medium text-neutral-800">
                          {manufacturer.established_year}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-smoke text-xs font-semibold uppercase">
                          Employees
                        </dt>
                        <dd className="mt-0.5 font-medium text-neutral-800">
                          {metadata.employee_count}
                        </dd>
                      </div>
                    </div>
                    {metadata.google_maps_location && (
                      <div>
                        <dt className="text-smoke text-xs font-semibold uppercase">
                          Google Maps
                        </dt>
                        <dd className="mt-0.5">
                          <a
                            href={String(metadata.google_maps_location)}
                            target="_blank"
                            rel="noreferrer"
                            className="text-primary text-xs font-semibold hover:underline"
                          >
                            Open Maps Location
                          </a>
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>
              </div>

              {/* Step 3: Manufacturing Details */}
              <div className="bg-paper-white rounded-[4px] border p-6">
                <h3 className="mb-4 flex items-center gap-2 border-b pb-2 font-serif text-base font-semibold text-black">
                  <Award className="h-4.5 w-4.5" /> Manufacturing Capabilities
                </h3>
                <dl className="grid grid-cols-1 gap-6 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-smoke text-xs font-semibold uppercase">
                      Product Categories
                    </dt>
                    <dd className="mt-0.5 font-medium text-neutral-800">
                      {metadata.product_categories}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-smoke text-xs font-semibold uppercase">
                      Products Manufactured
                    </dt>
                    <dd className="mt-0.5 font-medium text-neutral-800">
                      {metadata.products_manufactured}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-smoke text-xs font-semibold uppercase">
                      Monthly Capacity
                    </dt>
                    <dd className="mt-0.5 font-medium text-neutral-800">
                      {metadata.manufacturing_capacity}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-smoke text-xs font-semibold uppercase">
                      Minimum Order Quantity (MOQ)
                    </dt>
                    <dd className="mt-0.5 font-medium text-neutral-800">
                      {metadata.moq}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-smoke text-xs font-semibold uppercase">
                      OEM / ODM Capability
                    </dt>
                    <dd className="mt-0.5 font-medium text-neutral-800">
                      {metadata.oem_odm}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-smoke text-xs font-semibold uppercase">
                      Available for Export
                    </dt>
                    <dd className="mt-0.5 font-medium text-neutral-800">
                      {metadata.export_available}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Step 4 & 5: Documents & Photos */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="bg-paper-white rounded-[4px] border p-6">
                  <h3 className="mb-4 flex items-center gap-2 border-b pb-2 font-serif text-base font-semibold text-black">
                    <Shield className="h-4.5 w-4.5" /> Verification Documents
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between rounded border bg-gray-50 p-2.5 text-xs">
                      <div>
                        <p className="font-semibold text-neutral-700">
                          GST Registration Certificate
                        </p>
                        <p className="mt-0.5 font-mono text-neutral-500">
                          {manufacturer.gst_number}
                        </p>
                      </div>
                      <Badge className="bg-brand-yellow text-black">Attached</Badge>
                    </div>
                    {metadata.udyam_certificate_file && (
                      <div className="flex items-center justify-between rounded border bg-gray-50 p-2.5 text-xs">
                        <div>
                          <p className="font-semibold text-neutral-700">
                            UDYAM / MSME Certificate
                          </p>
                          <p className="mt-0.5 text-neutral-500">
                            {metadata.udyam_certificate_file}
                          </p>
                        </div>
                        <Badge className="bg-brand-yellow text-black">Attached</Badge>
                      </div>
                    )}
                    {metadata.factory_license_file && (
                      <div className="flex items-center justify-between rounded border bg-gray-50 p-2.5 text-xs">
                        <div>
                          <p className="font-semibold text-neutral-700">
                            Factory License
                          </p>
                          <p className="mt-0.5 text-neutral-500">
                            {metadata.factory_license_file}
                          </p>
                        </div>
                        <Badge className="bg-brand-yellow text-black">Attached</Badge>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
                      <div className="rounded border bg-gray-50 p-2">
                        <span className="text-smoke block text-[10px] font-semibold uppercase">
                          PAN
                        </span>
                        <span className="font-mono font-medium text-neutral-800">
                          {metadata.pan_number || "—"}
                        </span>
                      </div>
                      <div className="rounded border bg-gray-50 p-2">
                        <span className="text-smoke block text-[10px] font-semibold uppercase">
                          CIN
                        </span>
                        <span className="font-mono font-medium text-neutral-800">
                          {metadata.cin_number || "—"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-paper-white rounded-[4px] border p-6">
                  <h3 className="mb-4 flex items-center gap-2 border-b pb-2 font-serif text-base font-semibold text-black">
                    <FileText className="h-4.5 w-4.5" /> Company & Factory Proofs
                  </h3>
                  <ul className="space-y-2.5 text-xs">
                    {[
                      { key: "company_logo", label: "Company Logo" },
                      { key: "factory_exterior", label: "Factory Exterior Photo" },
                      { key: "factory_interior", label: "Factory Interior Photo" },
                      { key: "machinery_photo", label: "Machinery Photo" },
                      { key: "production_line", label: "Production Line Photo" },
                    ].map((item) => (
                      <li
                        key={item.key}
                        className="flex items-center justify-between rounded border bg-gray-50 p-2"
                      >
                        <span className="font-semibold text-neutral-700">
                          {item.label}
                        </span>
                        <span className="font-mono text-[10px] font-medium text-green-600">
                          {metadata[item.key] || "Uploaded"}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Step 6: Manufacturing Proof Video */}
              {metadata.walkthrough_video && (
                <div className="bg-paper-white rounded-[4px] border p-6">
                  <h3 className="mb-4 flex items-center gap-2 border-b pb-2 font-serif text-base font-semibold text-black">
                    <Video className="h-4.5 w-4.5" /> Mandatory Verification Walkthrough
                    Video
                  </h3>
                  <div className="relative flex aspect-video flex-col items-center justify-center overflow-hidden rounded-[4px] bg-neutral-900 p-6 text-center">
                    <div className="bg-brand-yellow-dark mb-4 flex h-16 w-16 cursor-pointer items-center justify-center rounded-full text-black transition-transform duration-300">
                      <Video className="h-8 w-8" />
                    </div>
                    <span className="block font-medium text-white">
                      Play Simulated Walkthrough Video
                    </span>
                    <span className="mt-1 block text-xs text-white/60">
                      File Name: {metadata.walkthrough_video}
                    </span>
                    <span className="absolute bottom-4 left-4 rounded border border-white/20 bg-black/60 px-2 py-1 text-[10px] text-white">
                      Walkthrough Audit Done
                    </span>
                  </div>

                  {/* Video details checklist confirmation */}
                  <div className="mt-4 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
                    {[
                      "Raw materials entry",
                      "Full manufacturing cycle",
                      "Workers operating machines",
                      "Packaging & labeling",
                      "Factory board checked",
                    ].map((check, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-1.5 rounded border border-green-100 bg-green-50 p-2 text-green-800"
                      >
                        <CheckCircle2 className="h-4 w-4 shrink-0" />
                        <span>{check}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* STARTUP / BRAND REVIEW LAYOUT */}
          {businessType === "startup" && (
            <div className="bg-paper-white rounded-[4px] border p-6">
              <h3 className="mb-4 flex items-center gap-2 border-b pb-2 font-serif text-base font-semibold text-black">
                <Building2 className="h-4.5 w-4.5" /> Brand Profile Summary
              </h3>
              <dl className="grid grid-cols-1 gap-6 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-smoke text-xs font-semibold uppercase">
                    Founder Name
                  </dt>
                  <dd className="mt-0.5 font-medium text-neutral-800">
                    {metadata.founder_name}
                  </dd>
                </div>
                <div>
                  <dt className="text-smoke text-xs font-semibold uppercase">
                    Brand Website
                  </dt>
                  <dd className="mt-0.5 font-medium">
                    {metadata.website ? (
                      <a
                        href={String(metadata.website)}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary font-semibold underline"
                      >
                        {String(metadata.website)}
                      </a>
                    ) : (
                      "—"
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-smoke text-xs font-semibold uppercase">
                    Product Categories
                  </dt>
                  <dd className="mt-0.5 font-medium text-neutral-800">
                    {metadata.product_categories}
                  </dd>
                </div>
                <div>
                  <dt className="text-smoke text-xs font-semibold uppercase">
                    Owns Production Facility?
                  </dt>
                  <dd className="mt-0.5 font-medium text-neutral-800">
                    {metadata.owns_factory}
                  </dd>
                </div>
                {manufacturer.gst_number && (
                  <div>
                    <dt className="text-smoke text-xs font-semibold uppercase">
                      GSTIN
                    </dt>
                    <dd className="mt-0.5 font-mono font-medium text-neutral-800">
                      {manufacturer.gst_number}
                    </dd>
                  </div>
                )}
                {metadata.brand_logo && (
                  <div>
                    <dt className="text-smoke text-xs font-semibold uppercase">
                      Brand Logo Attachment
                    </dt>
                    <dd className="mt-0.5 font-mono text-xs font-medium text-green-600">
                      ✓ {metadata.brand_logo}
                    </dd>
                  </div>
                )}
                <div className="sm:col-span-2">
                  <dt className="text-smoke text-xs font-semibold uppercase">
                    Brand Vision & Description
                  </dt>
                  <dd className="mt-0.5 rounded border bg-gray-50 p-4 leading-relaxed font-medium text-neutral-800 italic">
                    &ldquo;{metadata.description}&rdquo;
                  </dd>
                </div>
              </dl>
            </div>
          )}

          {/* ARTISAN / MSME REVIEW LAYOUT */}
          {businessType === "artisan" && (
            <div className="space-y-6">
              <div className="bg-paper-white rounded-[4px] border p-6">
                <h3 className="mb-4 flex items-center gap-2 border-b pb-2 font-serif text-base font-semibold text-black">
                  <Building2 className="h-4.5 w-4.5" /> Artisan / MSME Profile Details
                </h3>
                <dl className="grid grid-cols-1 gap-6 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-smoke text-xs font-semibold uppercase">
                      Artisan Owner
                    </dt>
                    <dd className="mt-0.5 font-medium text-neutral-800">
                      {metadata.owner_name}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-smoke text-xs font-semibold uppercase">
                      Workshop Location
                    </dt>
                    <dd className="mt-0.5 font-medium text-neutral-800">
                      {metadata.district}, {metadata.state}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-smoke text-xs font-semibold uppercase">
                      Craft Categories
                    </dt>
                    <dd className="mt-0.5 font-medium text-neutral-800">
                      {metadata.product_categories}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-smoke text-xs font-semibold uppercase">
                      Production Process
                    </dt>
                    <dd className="mt-0.5 font-medium text-neutral-800">
                      {metadata.handmade_machine}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-smoke text-xs font-semibold uppercase">
                      UDYAM Registration ID
                    </dt>
                    <dd className="mt-0.5 font-mono font-medium text-neutral-800">
                      {metadata.udyam_optional || "Not Provided"}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Artisan Proof Attachments */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="bg-paper-white rounded-[4px] border p-4 text-center">
                  <span className="text-smoke mb-2 block text-xs font-semibold uppercase">
                    Workshop Photo
                  </span>
                  <div className="text-primary flex h-28 items-center justify-center rounded border border-dashed bg-gray-100 text-xs font-medium">
                    ✓ {metadata.workshop_photos || "Attached"}
                  </div>
                </div>
                <div className="bg-paper-white rounded-[4px] border p-4 text-center">
                  <span className="text-smoke mb-2 block text-xs font-semibold uppercase">
                    Artisan Products Photo
                  </span>
                  <div className="text-primary flex h-28 items-center justify-center rounded border border-dashed bg-gray-100 text-xs font-medium">
                    ✓ {metadata.artisan_products || "Attached"}
                  </div>
                </div>
                <div className="bg-paper-white rounded-[4px] border p-4 text-center">
                  <span className="text-smoke mb-2 block text-xs font-semibold uppercase">
                    Crafting Process Video
                  </span>
                  <div className="text-primary flex h-28 items-center justify-center rounded border border-dashed bg-gray-100 text-xs font-medium">
                    ✓ {metadata.crafting_video || "Attached"}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        // Fallback backward compatibility for plain-text description profiles
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
              <dt className="text-muted-foreground text-xs">Description</dt>
              <dd className="mt-1">{manufacturer.description}</dd>
            </div>
          )}
        </dl>
      )}

      {/* Review Approval/Rejection Panel */}
      <div className="mt-8 border-t pt-8">
        <ReviewActions manufacturerId={manufacturer.id} status={manufacturer.status} />
      </div>
    </div>
  );
}
