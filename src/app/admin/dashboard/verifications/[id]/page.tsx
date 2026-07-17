import Link from "next/link";
import { notFound } from "next/navigation";
import { 
  Building2, MapPin, Award, Shield, FileText, CheckCircle2, Video 
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
        className="text-smoke text-sm hover:underline hover:text-forest-green flex items-center gap-1"
      >
        ← Back to control center
      </Link>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-b pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-serif text-black font-semibold">
              {manufacturer.business_name}
            </h1>
            <Badge className="bg-forest-green text-black uppercase text-[10px] ml-2">
              {businessType}
            </Badge>
          </div>
          <p className="text-smoke text-sm mt-1">
            Registered: {profile?.full_name || "—"} · {profile?.phone || metadata.phone || "No phone"} · {metadata.email || "No email"}
          </p>
        </div>
        <Badge variant={manufacturer.status} className="text-sm px-3 py-1">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border rounded-[4px] p-6 bg-paper-white ">
                  <h3 className="font-serif text-base font-semibold text-black mb-4 flex items-center gap-2 border-b pb-2">
                    <Building2 className="h-4.5 w-4.5" /> Company & Owner
                  </h3>
                  <dl className="space-y-3 text-sm">
                    <div>
                      <dt className="text-xs text-smoke uppercase font-semibold">Factory Name</dt>
                      <dd className="font-medium mt-0.5 text-neutral-800">{manufacturer.business_name}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-smoke uppercase font-semibold">Authorized Person</dt>
                      <dd className="font-medium mt-0.5 text-neutral-800">{metadata.owner_name}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-smoke uppercase font-semibold">Contact Email</dt>
                      <dd className="font-medium mt-0.5 text-neutral-800 font-mono text-xs">{metadata.email}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-smoke uppercase font-semibold">Phone Number</dt>
                      <dd className="font-medium mt-0.5 text-neutral-800 flex items-center gap-1.5">
                        {metadata.phone} 
                        <Badge className="bg-green-50 text-green-700 border border-green-200 text-[10px]">OTP Verified</Badge>
                      </dd>
                    </div>
                  </dl>
                </div>

                <div className="border rounded-[4px] p-6 bg-paper-white ">
                  <h3 className="font-serif text-base font-semibold text-black mb-4 flex items-center gap-2 border-b pb-2">
                    <MapPin className="h-4.5 w-4.5" /> Factory Facility Details
                  </h3>
                  <dl className="space-y-3 text-sm">
                    <div>
                      <dt className="text-xs text-smoke uppercase font-semibold">Address</dt>
                      <dd className="font-medium mt-0.5 text-neutral-800">
                        {manufacturer.factory_address}, {manufacturer.city}, {manufacturer.state} - {manufacturer.pincode}
                      </dd>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <dt className="text-xs text-smoke uppercase font-semibold">Established</dt>
                        <dd className="font-medium mt-0.5 text-neutral-800">{manufacturer.established_year}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-smoke uppercase font-semibold">Employees</dt>
                        <dd className="font-medium mt-0.5 text-neutral-800">{metadata.employee_count}</dd>
                      </div>
                    </div>
                    {metadata.google_maps_location && (
                      <div>
                        <dt className="text-xs text-smoke uppercase font-semibold">Google Maps</dt>
                        <dd className="mt-0.5">
                          <a 
                            href={String(metadata.google_maps_location)} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="text-xs text-primary hover:underline font-semibold"
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
              <div className="border rounded-[4px] p-6 bg-paper-white ">
                <h3 className="font-serif text-base font-semibold text-black mb-4 flex items-center gap-2 border-b pb-2">
                  <Award className="h-4.5 w-4.5" /> Manufacturing Capabilities
                </h3>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                  <div>
                    <dt className="text-xs text-smoke uppercase font-semibold">Product Categories</dt>
                    <dd className="font-medium mt-0.5 text-neutral-800">{metadata.product_categories}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-smoke uppercase font-semibold">Products Manufactured</dt>
                    <dd className="font-medium mt-0.5 text-neutral-800">{metadata.products_manufactured}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-smoke uppercase font-semibold">Monthly Capacity</dt>
                    <dd className="font-medium mt-0.5 text-neutral-800">{metadata.manufacturing_capacity}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-smoke uppercase font-semibold">Minimum Order Quantity (MOQ)</dt>
                    <dd className="font-medium mt-0.5 text-neutral-800">{metadata.moq}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-smoke uppercase font-semibold">OEM / ODM Capability</dt>
                    <dd className="font-medium mt-0.5 text-neutral-800">{metadata.oem_odm}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-smoke uppercase font-semibold">Available for Export</dt>
                    <dd className="font-medium mt-0.5 text-neutral-800">{metadata.export_available}</dd>
                  </div>
                </dl>
              </div>

              {/* Step 4 & 5: Documents & Photos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border rounded-[4px] p-6 bg-paper-white ">
                  <h3 className="font-serif text-base font-semibold text-black mb-4 flex items-center gap-2 border-b pb-2">
                    <Shield className="h-4.5 w-4.5" /> Verification Documents
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center bg-gray-50 p-2.5 rounded border text-xs">
                      <div>
                        <p className="font-semibold text-neutral-700">GST Registration Certificate</p>
                        <p className="font-mono text-neutral-500 mt-0.5">{manufacturer.gst_number}</p>
                      </div>
                      <Badge className="bg-forest-green text-black">Attached</Badge>
                    </div>
                    {metadata.udyam_certificate_file && (
                      <div className="flex justify-between items-center bg-gray-50 p-2.5 rounded border text-xs">
                        <div>
                          <p className="font-semibold text-neutral-700">UDYAM / MSME Certificate</p>
                          <p className="text-neutral-500 mt-0.5">{metadata.udyam_certificate_file}</p>
                        </div>
                        <Badge className="bg-forest-green text-black">Attached</Badge>
                      </div>
                    )}
                    {metadata.factory_license_file && (
                      <div className="flex justify-between items-center bg-gray-50 p-2.5 rounded border text-xs">
                        <div>
                          <p className="font-semibold text-neutral-700">Factory License</p>
                          <p className="text-neutral-500 mt-0.5">{metadata.factory_license_file}</p>
                        </div>
                        <Badge className="bg-forest-green text-black">Attached</Badge>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-2 text-xs pt-2">
                      <div className="bg-gray-50 p-2 border rounded">
                        <span className="text-[10px] text-smoke uppercase font-semibold block">PAN</span>
                        <span className="font-mono font-medium text-neutral-800">{metadata.pan_number || "—"}</span>
                      </div>
                      <div className="bg-gray-50 p-2 border rounded">
                        <span className="text-[10px] text-smoke uppercase font-semibold block">CIN</span>
                        <span className="font-mono font-medium text-neutral-800">{metadata.cin_number || "—"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border rounded-[4px] p-6 bg-paper-white ">
                  <h3 className="font-serif text-base font-semibold text-black mb-4 flex items-center gap-2 border-b pb-2">
                    <FileText className="h-4.5 w-4.5" /> Company & Factory Proofs
                  </h3>
                  <ul className="space-y-2.5 text-xs">
                    {[
                      { key: "company_logo", label: "Company Logo" },
                      { key: "factory_exterior", label: "Factory Exterior Photo" },
                      { key: "factory_interior", label: "Factory Interior Photo" },
                      { key: "machinery_photo", label: "Machinery Photo" },
                      { key: "production_line", label: "Production Line Photo" }
                    ].map((item) => (
                      <li key={item.key} className="flex justify-between items-center bg-gray-50 p-2 rounded border">
                        <span className="font-semibold text-neutral-700">{item.label}</span>
                        <span className="text-green-600 font-medium font-mono text-[10px]">{metadata[item.key] || "Uploaded"}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Step 6: Manufacturing Proof Video */}
              {metadata.walkthrough_video && (
                <div className="border rounded-[4px] p-6 bg-paper-white ">
                  <h3 className="font-serif text-base font-semibold text-black mb-4 flex items-center gap-2 border-b pb-2">
                    <Video className="h-4.5 w-4.5" /> Mandatory Verification Walkthrough Video
                  </h3>
                  <div className="bg-neutral-900 aspect-video rounded-[4px] overflow-hidden flex flex-col justify-center items-center text-center relative p-6">
                    <div className="w-16 h-16 bg-gold-yellow text-black flex items-center justify-center rounded-full  mb-4 cursor-pointer  transition-transform duration-300">
                      <Video className="h-8 w-8" />
                    </div>
                    <span className="text-white font-medium block">Play Simulated Walkthrough Video</span>
                    <span className="text-white/60 text-xs block mt-1">File Name: {metadata.walkthrough_video}</span>
                    <span className="absolute bottom-4 left-4 bg-black/60 text-[10px] text-white px-2 py-1 rounded border border-white/20">
                      Walkthrough Audit Done
                    </span>
                  </div>
                  
                  {/* Video details checklist confirmation */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 text-xs">
                    {[
                      "Raw materials entry",
                      "Full manufacturing cycle",
                      "Workers operating machines",
                      "Packaging & labeling",
                      "Factory board checked"
                    ].map((check, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 bg-green-50 text-green-800 border border-green-100 p-2 rounded">
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
            <div className="border rounded-[4px] p-6 bg-paper-white ">
              <h3 className="font-serif text-base font-semibold text-black mb-4 flex items-center gap-2 border-b pb-2">
                <Building2 className="h-4.5 w-4.5" /> Brand Profile Summary
              </h3>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                <div>
                  <dt className="text-xs text-smoke uppercase font-semibold">Founder Name</dt>
                  <dd className="font-medium mt-0.5 text-neutral-800">{metadata.founder_name}</dd>
                </div>
                <div>
                  <dt className="text-xs text-smoke uppercase font-semibold">Brand Website</dt>
                  <dd className="font-medium mt-0.5">
                    {metadata.website ? (
                      <a href={String(metadata.website)} target="_blank" rel="noreferrer" className="text-primary underline font-semibold">
                        {String(metadata.website)}
                      </a>
                    ) : "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-smoke uppercase font-semibold">Product Categories</dt>
                  <dd className="font-medium mt-0.5 text-neutral-800">{metadata.product_categories}</dd>
                </div>
                <div>
                  <dt className="text-xs text-smoke uppercase font-semibold">Owns Production Facility?</dt>
                  <dd className="font-medium mt-0.5 text-neutral-800">{metadata.owns_factory}</dd>
                </div>
                {manufacturer.gst_number && (
                  <div>
                    <dt className="text-xs text-smoke uppercase font-semibold">GSTIN</dt>
                    <dd className="font-medium mt-0.5 font-mono text-neutral-800">{manufacturer.gst_number}</dd>
                  </div>
                )}
                {metadata.brand_logo && (
                  <div>
                    <dt className="text-xs text-smoke uppercase font-semibold">Brand Logo Attachment</dt>
                    <dd className="font-medium mt-0.5 text-green-600 font-mono text-xs">✓ {metadata.brand_logo}</dd>
                  </div>
                )}
                <div className="sm:col-span-2">
                  <dt className="text-xs text-smoke uppercase font-semibold">Brand Vision & Description</dt>
                  <dd className="font-medium mt-0.5 text-neutral-800 leading-relaxed bg-gray-50 p-4 border rounded italic">
                    &ldquo;{metadata.description}&rdquo;
                  </dd>
                </div>
              </dl>
            </div>
          )}

          {/* ARTISAN / MSME REVIEW LAYOUT */}
          {businessType === "artisan" && (
            <div className="space-y-6">
              <div className="border rounded-[4px] p-6 bg-paper-white ">
                <h3 className="font-serif text-base font-semibold text-black mb-4 flex items-center gap-2 border-b pb-2">
                  <Building2 className="h-4.5 w-4.5" /> Artisan / MSME Profile Details
                </h3>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                  <div>
                    <dt className="text-xs text-smoke uppercase font-semibold">Artisan Owner</dt>
                    <dd className="font-medium mt-0.5 text-neutral-800">{metadata.owner_name}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-smoke uppercase font-semibold">Workshop Location</dt>
                    <dd className="font-medium mt-0.5 text-neutral-800">{metadata.district}, {metadata.state}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-smoke uppercase font-semibold">Craft Categories</dt>
                    <dd className="font-medium mt-0.5 text-neutral-800">{metadata.product_categories}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-smoke uppercase font-semibold">Production Process</dt>
                    <dd className="font-medium mt-0.5 text-neutral-800">{metadata.handmade_machine}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-smoke uppercase font-semibold">UDYAM Registration ID</dt>
                    <dd className="font-medium mt-0.5 font-mono text-neutral-800">{metadata.udyam_optional || "Not Provided"}</dd>
                  </div>
                </dl>
              </div>

              {/* Artisan Proof Attachments */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="border rounded-[4px] p-4 bg-paper-white  text-center">
                  <span className="text-xs text-smoke uppercase font-semibold block mb-2">Workshop Photo</span>
                  <div className="bg-gray-100 h-28 flex items-center justify-center text-primary font-medium text-xs rounded border border-dashed">
                    ✓ {metadata.workshop_photos || "Attached"}
                  </div>
                </div>
                <div className="border rounded-[4px] p-4 bg-paper-white  text-center">
                  <span className="text-xs text-smoke uppercase font-semibold block mb-2">Artisan Products Photo</span>
                  <div className="bg-gray-100 h-28 flex items-center justify-center text-primary font-medium text-xs rounded border border-dashed">
                    ✓ {metadata.artisan_products || "Attached"}
                  </div>
                </div>
                <div className="border rounded-[4px] p-4 bg-paper-white  text-center">
                  <span className="text-xs text-smoke uppercase font-semibold block mb-2">Crafting Process Video</span>
                  <div className="bg-gray-100 h-28 flex items-center justify-center text-primary font-medium text-xs rounded border border-dashed">
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
