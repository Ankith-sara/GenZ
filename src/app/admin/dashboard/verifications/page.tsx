import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/require-role";
import type { ApplicationStatus } from "@/types/database";

const TABS: { value: ApplicationStatus | "all"; label: string }[] = [
  { value: "pending", label: "Pending Review" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "all", label: "All" },
];

export default async function AdminVerificationsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireRole("admin");
  const { status: statusParam } = await searchParams;
  const activeTab = (statusParam as ApplicationStatus | "all") ?? "pending";

  const supabase = await createClient();

  // Fetch all applications to compute tab counts efficiently
  const { data: allApplications } = await supabase
    .from("manufacturer_applications")
    .select("id, status, business_name, full_name, email, phone, created_at")
    .order("created_at", { ascending: false });

  const list = allApplications ?? [];
  const counts: Record<ApplicationStatus | "all", number> = {
    pending: list.filter((a) => a.status === "pending").length,
    approved: list.filter((a) => a.status === "approved").length,
    rejected: list.filter((a) => a.status === "rejected").length,
    all: list.length,
  };

  const applications =
    activeTab === "all" ? list : list.filter((app) => app.status === activeTab);

  return (
    <div className="mx-auto max-w-5xl px-1 py-4 sm:px-6 sm:py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-nantes text-2xl font-bold text-black sm:text-3xl">
            Manufacturer Applications
          </h1>
          <p className="font-graphik text-smoke mt-1 text-xs sm:text-sm">
            Review, approve, or reject manufacturer registration applications.
          </p>
        </div>
        <Link
          href="/admin/dashboard"
          className="font-graphik flex h-9 shrink-0 items-center justify-center gap-2 rounded-full border border-[#E5E5E0] bg-white px-4 text-xs font-semibold text-black transition-colors hover:border-black hover:bg-[#FAF7F0] sm:h-10"
          aria-label="Back to dashboard"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </Link>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {TABS.map((tab) => {
          const count = counts[tab.value] ?? 0;
          const isActive = activeTab === tab.value;
          return (
            <Link
              key={tab.value}
              href={`/admin/dashboard/verifications?status=${tab.value}`}
              className={`font-graphik flex h-10 items-center gap-2 rounded-full border px-4 text-xs font-semibold tracking-wider uppercase transition-colors ${
                isActive
                  ? "border-black bg-black text-white"
                  : "border-[#E5E5E0] bg-[#FAF7F0] text-[#52524E] hover:border-black hover:text-black"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold ${
                  isActive ? "bg-white/20 text-white" : "bg-[#E5E5E0] text-[#52524E]"
                }`}
              >
                {count}
              </span>
            </Link>
          );
        })}
      </div>

      <div className="mt-6 divide-y divide-[#E5E5E0] rounded-2xl border border-[#E5E5E0] bg-white">
        {(applications ?? []).length === 0 && (
          <p className="font-graphik text-smoke p-6 text-sm">
            No applications in this category.
          </p>
        )}
        {(applications ?? []).map((app) => (
          <Link
            key={app.id}
            href={`/admin/dashboard/verifications/${app.id}`}
            className="flex flex-wrap items-center justify-between gap-3 p-5 transition-colors hover:bg-[#FAF7F0]"
          >
            <div>
              <p className="font-graphik text-sm font-bold text-black">
                {app.business_name}
              </p>
              <p className="font-graphik text-smoke mt-0.5 text-xs">
                {app.full_name} · {app.email} · {app.phone || "No phone"}
              </p>
              <p className="font-graphik mt-1 text-[11px] text-[#8C8C85]">
                Applied:{" "}
                {new Date(app.created_at).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
            <span
              className={`rounded-full border px-3 py-1 text-[10px] font-bold tracking-wider uppercase ${
                app.status === "pending"
                  ? "border-amber-200 bg-amber-50 text-amber-700"
                  : app.status === "approved"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-red-200 bg-red-50 text-red-700"
              }`}
            >
              {app.status}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
