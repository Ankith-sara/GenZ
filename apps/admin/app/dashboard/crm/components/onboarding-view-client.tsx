"use client";

import { useMemo, useState } from "react";
import {
  Award, CheckCircle2, Clock, Search,
  LayoutGrid, List, RotateCcw, X,
  ChevronRight,
} from "lucide-react";
import type { SellerOnboardingTracker, OnboardingStage } from "@genz/types";
import { CRMNavHeader } from "./crm-nav-header";
import { updateOnboardingStageAction } from "../actions";

interface OnboardingViewClientProps {
  onboardings: SellerOnboardingTracker[];
  counts?: {
    contacts?: number;
    leads?: number;
    deals?: number;
    onboardings?: number;
  };
}

const ONBOARDING_STAGES: {
  key: OnboardingStage;
  label: string;
  dot: string;
  tint: string;
  text: string;
}[] = [
  { key: "kyc_documents", label: "KYC verification", dot: "#8B93A6", tint: "#F1F2F0", text: "#565D68" },
  { key: "catalog_ingestion", label: "Catalog ingestion", dot: "#5D78C9", tint: "#EEF1FA", text: "#3B4F98" },
  { key: "quality_packaging_check", label: "Quality check", dot: "#C48A2E", tint: "#FBF2E2", text: "#8A5E17" },
  { key: "credentials_sent", label: "Credentials setup", dot: "#7A4FA0", tint: "#F4EEF9", text: "#5C3A79" },
  { key: "live_on_marketplace", label: "Live activation", dot: "#3F7A55", tint: "#EAF4EC", text: "#2E5B3F" },
];

export function OnboardingViewClient({
  onboardings,
  counts,
}: OnboardingViewClientProps) {
  const [selectedStage, setSelectedStage] = useState<OnboardingStage | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState<"tile" | "list">("tile");

  const handleAdvanceOnboarding = async (
    id: string,
    nextStage: OnboardingStage,
    checkboxes: {
      kyc_completed?: boolean;
      catalog_completed?: boolean;
      quality_check_completed?: boolean;
      credentials_sent?: boolean;
      live_on_marketplace?: boolean;
    }
  ) => {
    setIsSubmitting(true);
    await updateOnboardingStageAction(id, nextStage, checkboxes);
    setIsSubmitting(false);
  };

  const stageCounts = useMemo(() => {
    const map: Record<string, number> = {};
    ONBOARDING_STAGES.forEach((s) => (map[s.key] = 0));
    onboardings.forEach((o) => (map[o.current_stage] = (map[o.current_stage] || 0) + 1));
    return map;
  }, [onboardings]);

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedStage("all");
  };

  const filteredOnboardings = onboardings.filter((item) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !q ||
      item.seller_name.toLowerCase().includes(q) ||
      item.contact_person.toLowerCase().includes(q) ||
      item.craft_category.toLowerCase().includes(q) ||
      (item.city && item.city.toLowerCase().includes(q));

    const matchesStage =
      selectedStage === "all" || item.current_stage === selectedStage;

    return matchesQuery && matchesStage;
  });

  return (
    <div className="space-y-5 bg-[#F5F6F3] -m-px p-px">
      {/* Shared CRM Navigation Header */}
      <CRMNavHeader
        eyebrow="Operational Fulfillment"
        title="Seller Onboarding Process"
        description="Track signed sellers through the 5 operational milestones from compliance and catalog photography to live marketplace activation."
        counts={{
          contacts: counts?.contacts,
          leads: counts?.leads,
          deals: counts?.deals,
          onboardings: onboardings.length,
        }}
      />

      {/* PIPELINE STRIP HERO */}
      <div className="rounded-xl border border-[#E1E4DD] bg-white p-4">
        <div className="flex flex-wrap items-stretch gap-1.5">
          <button
            onClick={() => setSelectedStage("all")}
            className={`flex items-center gap-2 rounded-lg border px-3.5 py-2.5 text-left transition ${
              selectedStage === "all"
                ? "border-[#23231F] bg-[#23231F] text-white"
                : "border-[#E1E4DD] bg-white text-[#4B4F49] hover:border-[#23231F]/40"
            }`}
          >
            <span className="text-xs font-semibold">All sellers</span>
            <span
              className={`text-xs tabular-nums ${
                selectedStage === "all" ? "text-white/70" : "text-[#8C8C85]"
              }`}
            >
              {onboardings.length}
            </span>
          </button>

          {ONBOARDING_STAGES.map((s, i) => {
            const active = selectedStage === s.key;
            return (
              <div key={s.key} className="flex items-center">
                <button
                  onClick={() => setSelectedStage(s.key)}
                  style={{
                    borderColor: active ? s.dot : "#E1E4DD",
                    background: active ? s.tint : "white",
                  }}
                  className="flex items-center gap-2 rounded-lg border px-3.5 py-2.5 text-left transition hover:border-[#23231F]/30"
                >
                  <span
                    className="flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold text-white shrink-0"
                    style={{ background: s.dot }}
                  >
                    {i + 1}
                  </span>
                  <span className="flex flex-col leading-tight">
                    <span
                      className="text-xs font-semibold"
                      style={{ color: active ? s.text : "#23231F" }}
                    >
                      {s.label}
                    </span>
                  </span>
                  <span className="text-xs tabular-nums text-[#8C8C85]">
                    {stageCounts[s.key] || 0}
                  </span>
                </button>
                {i < ONBOARDING_STAGES.length - 1 && (
                  <ChevronRight className="mx-1 h-3.5 w-3.5 text-[#C7CAC2] shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* SEARCH & CONTROLS */}
      <div className="space-y-3 rounded-xl border border-[#E1E4DD] bg-white p-3.5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#8C8C85]" />
            <input
              type="text"
              placeholder="Search onboarding sellers by business, contact, craft…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg bg-[#F5F6F3] py-2 pl-9 pr-8 text-xs text-[#23231F] placeholder-[#8C8C85] outline-none focus:ring-1 focus:ring-[#3A4B99]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8C8C85] hover:text-[#23231F]"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {(selectedStage !== "all" || searchQuery) && (
              <button
                type="button"
                onClick={resetFilters}
                className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#73736E] hover:bg-[#F5F6F3] hover:text-[#23231F] transition"
                title="Reset all filters"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            )}

            <div className="flex items-center rounded-lg border border-[#E1E4DD] bg-[#F5F6F3] p-0.5">
              <button
                type="button"
                onClick={() => setViewMode("tile")}
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition ${
                  viewMode === "tile"
                    ? "bg-white text-[#23231F] shadow-sm"
                    : "text-[#73736E] hover:text-[#23231F]"
                }`}
                title="Tile view"
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Tile</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition ${
                  viewMode === "list"
                    ? "bg-white text-[#23231F] shadow-sm"
                    : "text-[#73736E] hover:text-[#23231F]"
                }`}
                title="List view"
              >
                <List className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">List</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* RESULTS: LIST VS TILE */}
      {viewMode === "list" ? (
        /* LIST / TABLE VIEW */
        <div className="overflow-hidden rounded-xl border border-[#E1E4DD] bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#E1E4DD] text-[11px] font-medium text-[#8C8C85]">
                <tr>
                  <th className="px-4 py-3">Seller &amp; contact</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Progress</th>
                  <th className="px-4 py-3">1. KYC</th>
                  <th className="px-4 py-3">2. Catalog</th>
                  <th className="px-4 py-3">3. QC</th>
                  <th className="px-4 py-3">4. Creds</th>
                  <th className="px-4 py-3">5. Live</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F0EC]">
                {filteredOnboardings.map((item) => {
                  const completedCount = [
                    item.kyc_completed,
                    item.catalog_completed,
                    item.quality_check_completed,
                    item.credentials_sent,
                    item.live_on_marketplace,
                  ].filter(Boolean).length;
                  const progressPercent = (completedCount / 5) * 100;

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-[#F5F6F3]/70 transition"
                    >
                      <td className="px-4 py-3">
                        <div className="font-semibold text-[#23231F]">
                          {item.seller_name}
                        </div>
                        <div className="mt-0.5 text-[11px] text-[#8C8C85]">
                          {item.contact_person} • {item.phone}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[#4B4F49]">
                        {item.craft_category}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-semibold text-[#23231F]">
                            {completedCount}/5
                          </span>
                          <div className="h-1.5 w-16 rounded-full bg-[#E1E4DD] overflow-hidden">
                            <div
                              className="h-full bg-[#3F7A55]"
                              style={{ width: `${progressPercent}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <MilestoneIndicator
                          completed={item.kyc_completed}
                          onComplete={() =>
                            handleAdvanceOnboarding(
                              item.id,
                              "catalog_ingestion",
                              { kyc_completed: true }
                            )
                          }
                          disabled={isSubmitting}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <MilestoneIndicator
                          completed={item.catalog_completed}
                          onComplete={() =>
                            handleAdvanceOnboarding(
                              item.id,
                              "quality_packaging_check",
                              { catalog_completed: true }
                            )
                          }
                          disabled={isSubmitting}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <MilestoneIndicator
                          completed={item.quality_check_completed}
                          onComplete={() =>
                            handleAdvanceOnboarding(
                              item.id,
                              "credentials_sent",
                              { quality_check_completed: true }
                            )
                          }
                          disabled={isSubmitting}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <MilestoneIndicator
                          completed={item.credentials_sent}
                          onComplete={() =>
                            handleAdvanceOnboarding(item.id, "live_on_marketplace", {
                              credentials_sent: true,
                            })
                          }
                          disabled={isSubmitting}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <MilestoneIndicator
                          completed={item.live_on_marketplace}
                          onComplete={() =>
                            handleAdvanceOnboarding(item.id, "live_on_marketplace", {
                              live_on_marketplace: true,
                            })
                          }
                          disabled={isSubmitting}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* TILE / MILESTONE CARDS VIEW */
        <div className="space-y-4">
          {filteredOnboardings.map((item) => {
            const completedCount = [
              item.kyc_completed,
              item.catalog_completed,
              item.quality_check_completed,
              item.credentials_sent,
              item.live_on_marketplace,
            ].filter(Boolean).length;
            const progressPercent = (completedCount / 5) * 100;

            return (
              <div
                key={item.id}
                className="rounded-xl border border-[#E1E4DD] bg-white p-5 space-y-4 transition hover:border-[#23231F]/25"
                style={{
                  borderLeft: `4px solid ${
                    item.live_on_marketplace ? "#3F7A55" : "#5D78C9"
                  }`,
                }}
              >
                {/* Seller Header */}
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between border-b border-[#F0F0EC] pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-[#23231F] text-base">
                        {item.seller_name}
                      </h3>
                      {item.live_on_marketplace ? (
                        <span className="rounded-md border border-[#3F7A55]/30 bg-[#EAF4EC] px-2 py-0.5 text-[10px] font-bold text-[#2E5B3F]">
                          LIVE ON MARKETPLACE
                        </span>
                      ) : (
                        <span className="rounded-md border border-[#C48A2E]/30 bg-[#FBF2E2] px-2 py-0.5 text-[10px] font-semibold text-[#8A5E17] capitalize">
                          {item.current_stage.replace(/_/g, " ")}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#73736E] mt-0.5">
                      Contact: {item.contact_person} • {item.phone} •{" "}
                      {item.craft_category}
                      {item.city ? ` • ${item.city}, ${item.state}` : ""}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-xs font-semibold text-[#23231F] font-mono">
                        {completedCount} of 5 Milestones
                      </span>
                      <div className="mt-1 h-2 w-32 rounded-full bg-[#E1E4DD] overflow-hidden">
                        <div
                          className="h-full bg-[#3F7A55] transition-all duration-300"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 5-STAGE MILESTONES GRID */}
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 md:grid-cols-5">
                  {/* Milestone 1 */}
                  <div
                    className={`rounded-lg border p-3 flex flex-col justify-between ${
                      item.kyc_completed
                        ? "border-[#3F7A55]/30 bg-[#EAF4EC]"
                        : "border-[#E1E4DD] bg-[#F5F6F3]"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs font-semibold text-[#23231F]">
                        <span>1. KYC Docs</span>
                        {item.kyc_completed ? (
                          <CheckCircle2 className="h-4 w-4 text-[#3F7A55]" />
                        ) : (
                          <Clock className="h-4 w-4 text-[#A6A79F]" />
                        )}
                      </div>
                      <p className="mt-1 text-[10px] text-[#73736E]">
                        GST, PAN, Bank Details
                      </p>
                    </div>
                    {!item.kyc_completed && (
                      <button
                        onClick={() =>
                          handleAdvanceOnboarding(
                            item.id,
                            "catalog_ingestion",
                            { kyc_completed: true }
                          )
                        }
                        disabled={isSubmitting}
                        className="mt-3 text-[10px] font-semibold text-[#2E5B3F] hover:underline text-left"
                      >
                        Mark Complete ✓
                      </button>
                    )}
                  </div>

                  {/* Milestone 2 */}
                  <div
                    className={`rounded-lg border p-3 flex flex-col justify-between ${
                      item.catalog_completed
                        ? "border-[#3F7A55]/30 bg-[#EAF4EC]"
                        : "border-[#E1E4DD] bg-[#F5F6F3]"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs font-semibold text-[#23231F]">
                        <span>2. Catalog Ingestion</span>
                        {item.catalog_completed ? (
                          <CheckCircle2 className="h-4 w-4 text-[#3F7A55]" />
                        ) : (
                          <Clock className="h-4 w-4 text-[#A6A79F]" />
                        )}
                      </div>
                      <p className="mt-1 text-[10px] text-[#73736E]">
                        Photos, Specs &amp; Pricing
                      </p>
                    </div>
                    {!item.catalog_completed && (
                      <button
                        onClick={() =>
                          handleAdvanceOnboarding(
                            item.id,
                            "quality_packaging_check",
                            { catalog_completed: true }
                          )
                        }
                        disabled={isSubmitting}
                        className="mt-3 text-[10px] font-semibold text-[#2E5B3F] hover:underline text-left"
                      >
                        Mark Complete ✓
                      </button>
                    )}
                  </div>

                  {/* Milestone 3 */}
                  <div
                    className={`rounded-lg border p-3 flex flex-col justify-between ${
                      item.quality_check_completed
                        ? "border-[#3F7A55]/30 bg-[#EAF4EC]"
                        : "border-[#E1E4DD] bg-[#F5F6F3]"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs font-semibold text-[#23231F]">
                        <span>3. Quality Audit</span>
                        {item.quality_check_completed ? (
                          <CheckCircle2 className="h-4 w-4 text-[#3F7A55]" />
                        ) : (
                          <Clock className="h-4 w-4 text-[#A6A79F]" />
                        )}
                      </div>
                      <p className="mt-1 text-[10px] text-[#73736E]">
                        Craft Barcode &amp; Packaging
                      </p>
                    </div>
                    {!item.quality_check_completed && (
                      <button
                        onClick={() =>
                          handleAdvanceOnboarding(
                            item.id,
                            "credentials_sent",
                            { quality_check_completed: true }
                          )
                        }
                        disabled={isSubmitting}
                        className="mt-3 text-[10px] font-semibold text-[#2E5B3F] hover:underline text-left"
                      >
                        Mark Complete ✓
                      </button>
                    )}
                  </div>

                  {/* Milestone 4 */}
                  <div
                    className={`rounded-lg border p-3 flex flex-col justify-between ${
                      item.credentials_sent
                        ? "border-[#3F7A55]/30 bg-[#EAF4EC]"
                        : "border-[#E1E4DD] bg-[#F5F6F3]"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs font-semibold text-[#23231F]">
                        <span>4. Credentials</span>
                        {item.credentials_sent ? (
                          <CheckCircle2 className="h-4 w-4 text-[#3F7A55]" />
                        ) : (
                          <Clock className="h-4 w-4 text-[#A6A79F]" />
                        )}
                      </div>
                      <p className="mt-1 text-[10px] text-[#73736E]">
                        Seller Studio Login Sent
                      </p>
                    </div>
                    {!item.credentials_sent && (
                      <button
                        onClick={() =>
                          handleAdvanceOnboarding(
                            item.id,
                            "live_on_marketplace",
                            { credentials_sent: true }
                          )
                        }
                        disabled={isSubmitting}
                        className="mt-3 text-[10px] font-semibold text-[#2E5B3F] hover:underline text-left"
                      >
                        Mark Complete ✓
                      </button>
                    )}
                  </div>

                  {/* Milestone 5 */}
                  <div
                    className={`rounded-lg border p-3 flex flex-col justify-between ${
                      item.live_on_marketplace
                        ? "border-[#3F7A55]/30 bg-[#EAF4EC]"
                        : "border-[#E1E4DD] bg-[#F5F6F3]"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs font-semibold text-[#23231F]">
                        <span>5. Live Go-Live</span>
                        {item.live_on_marketplace ? (
                          <CheckCircle2 className="h-4 w-4 text-[#3F7A55]" />
                        ) : (
                          <Clock className="h-4 w-4 text-[#A6A79F]" />
                        )}
                      </div>
                      <p className="mt-1 text-[10px] text-[#73736E]">
                        Active on Marketplace
                      </p>
                    </div>
                    {!item.live_on_marketplace && (
                      <button
                        onClick={() =>
                          handleAdvanceOnboarding(
                            item.id,
                            "live_on_marketplace",
                            { live_on_marketplace: true }
                          )
                        }
                        disabled={isSubmitting}
                        className="mt-3 text-[10px] font-semibold text-[#2E5B3F] hover:underline text-left"
                      >
                        Activate Live ✓
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* EMPTY STATE */}
      {filteredOnboardings.length === 0 && (
        <div className="rounded-xl border border-[#E1E4DD] bg-white p-12 text-center">
          <Award className="mx-auto h-7 w-7 text-[#A6A79F]" />
          <h4 className="mt-3 text-sm font-semibold text-[#23231F]">
            No onboarding sellers found
          </h4>
          <p className="mx-auto mt-1 max-w-sm text-xs text-[#73736E]">
            {selectedStage !== "all" || searchQuery
              ? "Clear your search or stage filter to see more sellers."
              : "Move commercial deals to onboarding once partnership terms are agreed."}
          </p>
        </div>
      )}
    </div>
  );
}

function MilestoneIndicator({
  completed,
  onComplete,
  disabled,
}: {
  completed?: boolean;
  onComplete: () => void;
  disabled: boolean;
}) {
  if (completed) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#2E5B3F]">
        <CheckCircle2 className="h-3.5 w-3.5" />
        <span>Done</span>
      </span>
    );
  }
  return (
    <button
      onClick={onComplete}
      disabled={disabled}
      className="inline-flex items-center gap-1 rounded border border-[#E1E4DD] bg-[#F5F6F3] px-2 py-0.5 text-[10px] font-medium text-[#4B4F49] hover:border-[#3F7A55] hover:text-[#2E5B3F] transition disabled:opacity-40"
    >
      <Clock className="h-3 w-3 text-[#A6A79F]" />
      <span>Complete</span>
    </button>
  );
}
