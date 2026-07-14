import { redirect } from "next/navigation";
import { Clock, FileText, XCircle, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getUserAndProfile } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function PendingVerificationPage() {
  const session = await getUserAndProfile();
  if (!session) {
    redirect("/login");
  }

  const role = session.profile?.role ?? "buyer";
  if (role !== "manufacturer") {
    redirect("/dashboard");
  }

  const supabase = await createClient();
  const { data: manufacturer } = await supabase
    .from("manufacturer_profiles")
    .select("*")
    .eq("id", session.userId)
    .maybeSingle();

  // If verified, go to dashboard
  if (manufacturer && manufacturer.status === "verified") {
    redirect("/dashboard/manufacturer");
  }

  const status = manufacturer?.status ?? "pending";
  const rejectionReason = manufacturer?.rejection_reason ?? "";

  // Attempt to parse metadata from the description column
  let metadata: Record<string, string | number | boolean | null | undefined> = {};

  try {
    if (manufacturer?.description && manufacturer.description.startsWith("{")) {
      metadata = JSON.parse(manufacturer.description);
    }
  } catch (e) {
    console.error("Failed to parse description as metadata:", e);
  }

  const businessType = String(metadata.business_type || "manufacturer");

  return (
    <main className="min-h-screen bg-neutral-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="flex justify-between items-center bg-paper-white border border-black/10 px-6 py-4 rounded-[4px]  mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-forest-green flex items-center justify-center text-white font-medium text-lg rounded-[4px]">
              Z
            </div>
            <span className="font-medium text-forest-green">GenZ Manufacturer Portal</span>
          </div>
          
          <form action="/api/auth/signout" method="POST">
            <Button variant="ghost" size="sm" type="submit" className="text-smoke hover:text-forest-green">
              <LogOut className="h-4 w-4 mr-1.5" /> Sign Out
            </Button>
          </form>
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-2xl bg-paper-white  border border-black/10/80 rounded-[4px] overflow-hidden">
        {/* Verification Status Banner */}
        {status === "pending" || status === "not_submitted" ? (
          <div className="bg-amber-50 border-b border-amber-200 p-6 flex items-start gap-4">
            <div className="p-3 bg-amber-100 rounded-full text-amber-800 shrink-0">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-medium text-amber-950 font-serif">Application Under Review</h2>
              <p className="text-sm text-amber-800 mt-1 leading-relaxed">
                Thank you for registering with GenZ. Your factory profile and documents are currently being audited by our verification team. This process typically takes 24–48 hours.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-red-50 border-b border-red-200 p-6 flex items-start gap-4">
            <div className="p-3 bg-red-100 rounded-full text-red-800 shrink-0">
              <XCircle className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-medium text-red-950 font-serif">Application Rejected</h2>
              <p className="text-sm text-red-800 mt-1 leading-relaxed">
                Your application could not be approved at this time. Please see the reason below:
              </p>
              {rejectionReason && (
                <div className="mt-3 p-3 bg-paper-white/80 border border-red-200 rounded font-mono text-xs text-red-900">
                  {rejectionReason}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Application details summary */}
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-serif text-xl text-forest-green font-semibold">Registration Profile</h3>
            <Badge className="bg-forest-green text-[#FFF0DD] capitalize">
              {businessType === "manufacturer" ? "Regular Manufacturer" : businessType === "startup" ? "Startup / Brand" : "Artisan / MSME"}
            </Badge>
          </div>

          <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 border border-black/10 rounded-[4px] p-6 bg-gray-50/50">
            <div>
              <dt className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Company Name</dt>
              <dd className="mt-1 text-sm font-medium text-forest-green">{manufacturer?.business_name}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Owner / Founder Name</dt>
              <dd className="mt-1 text-sm font-medium text-neutral-800">{metadata.owner_name || metadata.founder_name || session.profile?.full_name || "—"}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Official Email</dt>
              <dd className="mt-1 text-sm font-medium text-neutral-800">{metadata.email || session.email || "—"}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Mobile Number</dt>
              <dd className="mt-1 text-sm font-medium text-neutral-800">{metadata.phone || "—"}</dd>
            </div>

            {businessType === "manufacturer" && (
              <>
                <div className="sm:col-span-2">
                  <dt className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Factory Address</dt>
                  <dd className="mt-1 text-sm font-medium text-neutral-800">
                    {manufacturer?.factory_address}, {manufacturer?.city}, {manufacturer?.state} - {manufacturer?.pincode}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">GSTIN</dt>
                  <dd className="mt-1 text-sm font-mono text-neutral-800">{manufacturer?.gst_number}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Established Year</dt>
                  <dd className="mt-1 text-sm font-medium text-neutral-800">{manufacturer?.established_year || "—"}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Employees</dt>
                  <dd className="mt-1 text-sm font-medium text-neutral-800">{metadata.employee_count || "—"}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Capacity</dt>
                  <dd className="mt-1 text-sm font-medium text-neutral-800">{metadata.manufacturing_capacity || "—"}</dd>
                </div>
              </>
            )}

            {businessType === "startup" && (
              <>
                <div>
                  <dt className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">GSTIN</dt>
                  <dd className="mt-1 text-sm font-mono text-neutral-800">{manufacturer?.gst_number || "—"}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Website</dt>
                  <dd className="mt-1 text-sm font-medium text-neutral-800">{metadata.website || "—"}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Owns Factory?</dt>
                  <dd className="mt-1 text-sm font-medium text-neutral-800">{metadata.owns_factory || "—"}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Brand Description</dt>
                  <dd className="mt-1 text-sm font-medium text-neutral-800 leading-relaxed">{metadata.description || "—"}</dd>
                </div>
              </>
            )}

            {businessType === "artisan" && (
              <>
                <div>
                  <dt className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Location</dt>
                  <dd className="mt-1 text-sm font-medium text-neutral-800">{metadata.district}, {metadata.state}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Production Type</dt>
                  <dd className="mt-1 text-sm font-medium text-neutral-800">{metadata.handmade_machine || "—"}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">UDYAM Registration</dt>
                  <dd className="mt-1 text-sm font-mono text-neutral-800">{metadata.udyam_optional || "—"}</dd>
                </div>
              </>
            )}

            <div className="sm:col-span-2 border-t pt-4 mt-2">
              <dt className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">Uploaded Verification Proofs</dt>
              <dd className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-smoke font-medium">
                {Object.keys(metadata)
                  .filter(k => k.endsWith("_file") || k.endsWith("_logo") || k.endsWith("_photos") || k.includes("exterior") || k.includes("interior") || k.includes("machinery") || k.includes("walkthrough") || k.includes("crafting") || k.includes("products"))
                  .map((key) => (
                    <div key={key} className="flex items-center gap-1.5 bg-paper-white p-2 border border-black/10 rounded">
                      <FileText className="h-4.5 w-4.5 text-forest-green" />
                      <div className="min-w-0">
                        <p className="text-neutral-500 capitalize text-[10px]">{key.replace(/_/g, " ")}</p>
                        <p className="text-forest-green font-medium truncate">{String(metadata[key])}</p>
                      </div>
                    </div>
                  ))}
              </dd>
            </div>
          </dl>
          
          <div className="text-center mt-8">
            <p className="text-xs text-smoke">
              Need to change your details? Reach out to us at <a href="mailto:support@genz.co" className="underline font-semibold hover:text-forest-green">support@genz.co</a>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
