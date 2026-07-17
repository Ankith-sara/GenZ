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
    <main className="flex min-h-screen flex-col justify-center bg-neutral-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="bg-paper-white mb-6 flex items-center justify-between rounded-[4px] border border-black/10 px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="bg-brand-yellow flex h-8 w-8 items-center justify-center rounded-[4px] text-lg font-medium text-white">
              Z
            </div>
            <span className="text-brand-yellow font-medium">
              GenZ Manufacturer Portal
            </span>
          </div>

          <form action="/api/auth/signout" method="POST">
            <Button
              variant="ghost"
              size="sm"
              type="submit"
              className="text-smoke hover:text-brand-yellow"
            >
              <LogOut className="mr-1.5 h-4 w-4" /> Sign Out
            </Button>
          </form>
        </div>
      </div>

      <div className="bg-paper-white border-black/10/80 overflow-hidden rounded-[4px] border sm:mx-auto sm:w-full sm:max-w-2xl">
        {/* Verification Status Banner */}
        {status === "pending" || status === "not_submitted" ? (
          <div className="flex items-start gap-4 border-b border-amber-200 bg-amber-50 p-6">
            <div className="shrink-0 rounded-full bg-amber-100 p-3 text-amber-800">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-medium text-amber-950">
                Application Under Review
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-amber-800">
                Thank you for registering with GenZ. Your factory profile and documents
                are currently being audited by our verification team. This process
                typically takes 24–48 hours.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-4 border-b border-red-200 bg-red-50 p-6">
            <div className="shrink-0 rounded-full bg-red-100 p-3 text-red-800">
              <XCircle className="h-6 w-6" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-medium text-red-950">
                Application Rejected
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-red-800">
                Your application could not be approved at this time. Please see the
                reason below:
              </p>
              {rejectionReason && (
                <div className="bg-paper-white/80 mt-3 rounded border border-red-200 p-3 font-mono text-xs text-red-900">
                  {rejectionReason}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Application details summary */}
        <div className="p-8">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-brand-yellow font-serif text-xl font-semibold">
              Registration Profile
            </h3>
            <Badge className="bg-brand-yellow text-black capitalize">
              {businessType === "manufacturer"
                ? "Regular Manufacturer"
                : businessType === "startup"
                  ? "Startup / Brand"
                  : "Artisan / MSME"}
            </Badge>
          </div>

          <dl className="grid grid-cols-1 gap-x-4 gap-y-6 rounded-[4px] border border-black/10 bg-gray-50/50 p-6 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-semibold tracking-wider text-neutral-400 uppercase">
                Company Name
              </dt>
              <dd className="text-brand-yellow mt-1 text-sm font-medium">
                {manufacturer?.business_name}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold tracking-wider text-neutral-400 uppercase">
                Owner / Founder Name
              </dt>
              <dd className="mt-1 text-sm font-medium text-neutral-800">
                {metadata.owner_name ||
                  metadata.founder_name ||
                  session.profile?.full_name ||
                  "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold tracking-wider text-neutral-400 uppercase">
                Official Email
              </dt>
              <dd className="mt-1 text-sm font-medium text-neutral-800">
                {metadata.email || session.email || "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold tracking-wider text-neutral-400 uppercase">
                Mobile Number
              </dt>
              <dd className="mt-1 text-sm font-medium text-neutral-800">
                {metadata.phone || "—"}
              </dd>
            </div>

            {businessType === "manufacturer" && (
              <>
                <div className="sm:col-span-2">
                  <dt className="text-xs font-semibold tracking-wider text-neutral-400 uppercase">
                    Factory Address
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-neutral-800">
                    {manufacturer?.factory_address}, {manufacturer?.city},{" "}
                    {manufacturer?.state} - {manufacturer?.pincode}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold tracking-wider text-neutral-400 uppercase">
                    GSTIN
                  </dt>
                  <dd className="mt-1 font-mono text-sm text-neutral-800">
                    {manufacturer?.gst_number}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold tracking-wider text-neutral-400 uppercase">
                    Established Year
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-neutral-800">
                    {manufacturer?.established_year || "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold tracking-wider text-neutral-400 uppercase">
                    Employees
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-neutral-800">
                    {metadata.employee_count || "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold tracking-wider text-neutral-400 uppercase">
                    Capacity
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-neutral-800">
                    {metadata.manufacturing_capacity || "—"}
                  </dd>
                </div>
              </>
            )}

            {businessType === "startup" && (
              <>
                <div>
                  <dt className="text-xs font-semibold tracking-wider text-neutral-400 uppercase">
                    GSTIN
                  </dt>
                  <dd className="mt-1 font-mono text-sm text-neutral-800">
                    {manufacturer?.gst_number || "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold tracking-wider text-neutral-400 uppercase">
                    Website
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-neutral-800">
                    {metadata.website || "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold tracking-wider text-neutral-400 uppercase">
                    Owns Factory?
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-neutral-800">
                    {metadata.owns_factory || "—"}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-xs font-semibold tracking-wider text-neutral-400 uppercase">
                    Brand Description
                  </dt>
                  <dd className="mt-1 text-sm leading-relaxed font-medium text-neutral-800">
                    {metadata.description || "—"}
                  </dd>
                </div>
              </>
            )}

            {businessType === "artisan" && (
              <>
                <div>
                  <dt className="text-xs font-semibold tracking-wider text-neutral-400 uppercase">
                    Location
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-neutral-800">
                    {metadata.district}, {metadata.state}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold tracking-wider text-neutral-400 uppercase">
                    Production Type
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-neutral-800">
                    {metadata.handmade_machine || "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold tracking-wider text-neutral-400 uppercase">
                    UDYAM Registration
                  </dt>
                  <dd className="mt-1 font-mono text-sm text-neutral-800">
                    {metadata.udyam_optional || "—"}
                  </dd>
                </div>
              </>
            )}

            <div className="mt-2 border-t pt-4 sm:col-span-2">
              <dt className="mb-2 text-xs font-semibold tracking-wider text-neutral-400 uppercase">
                Uploaded Verification Proofs
              </dt>
              <dd className="text-smoke grid grid-cols-1 gap-2 text-xs font-medium sm:grid-cols-2">
                {Object.keys(metadata)
                  .filter(
                    (k) =>
                      k.endsWith("_file") ||
                      k.endsWith("_logo") ||
                      k.endsWith("_photos") ||
                      k.includes("exterior") ||
                      k.includes("interior") ||
                      k.includes("machinery") ||
                      k.includes("walkthrough") ||
                      k.includes("crafting") ||
                      k.includes("products")
                  )
                  .map((key) => (
                    <div
                      key={key}
                      className="bg-paper-white flex items-center gap-1.5 rounded border border-black/10 p-2"
                    >
                      <FileText className="text-brand-yellow h-4.5 w-4.5" />
                      <div className="min-w-0">
                        <p className="text-[10px] text-neutral-500 capitalize">
                          {key.replace(/_/g, " ")}
                        </p>
                        <p className="text-brand-yellow truncate font-medium">
                          {String(metadata[key])}
                        </p>
                      </div>
                    </div>
                  ))}
              </dd>
            </div>
          </dl>

          <div className="mt-8 text-center">
            <p className="text-smoke text-xs">
              Need to change your details? Reach out to us at{" "}
              <a
                href="mailto:support@genz.co"
                className="hover:text-brand-yellow font-semibold underline"
              >
                support@genz.co
              </a>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
