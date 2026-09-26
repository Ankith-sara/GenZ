"use client";

import { useMemo, useState } from "react";
import {
  Briefcase,
  Percent,
  Calendar,
  Package,
  IndianRupee,
  Search,
  LayoutGrid,
  List,
  SlidersHorizontal,
  RotateCcw,
  X,
  ChevronRight,
  Award,
  Plus,
  Edit,
} from "lucide-react";
import type { CRMDeal, CRMDealStage } from "@genz/types";
import { CRMNavHeader } from "./crm-nav-header";
import {
  updateDealStageAction,
  moveDealToOnboardingAction,
  createDealAction,
  updateDealAction,
} from "../actions";

interface DealsViewClientProps {
  deals: CRMDeal[];
  counts?: {
    contacts?: number;
    leads?: number;
    deals?: number;
    onboardings?: number;
  };
}

const FUNNEL_DEAL_STAGES: {
  key: CRMDealStage;
  label: string;
  dot: string;
  tint: string;
  text: string;
}[] = [
    { key: "proposal_sent", label: "Proposal sent", dot: "#5D78C9", tint: "#EEF1FA", text: "#3B4F98" },
    { key: "terms_negotiating", label: "Negotiating", dot: "#7A4FA0", tint: "#F4EEF9", text: "#5C3A79" },
    { key: "contract_signed", label: "Contract signed", dot: "#3F7A55", tint: "#EAF4EC", text: "#2E5B3F" },
  ];

const LOST_STAGE = {
  key: "lost" as const,
  label: "Lost",
  dot: "#948C84",
  tint: "#F1EFEC",
  text: "#6B655E",
};

const STAGE_STYLE = Object.fromEntries(
  [...FUNNEL_DEAL_STAGES, LOST_STAGE].map((s) => [s.key, s])
) as Record<CRMDealStage, (typeof FUNNEL_DEAL_STAGES)[number]>;

const STAGE_OPTIONS: { value: CRMDealStage; label: string }[] = [
  ...FUNNEL_DEAL_STAGES.map((s) => ({ value: s.key, label: s.label })),
  { value: LOST_STAGE.key, label: LOST_STAGE.label },
];

export function DealsViewClient({ deals, counts }: DealsViewClientProps) {
  const [selectedStage, setSelectedStage] = useState<CRMDealStage | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddDealModal, setShowAddDealModal] = useState(false);
  const [editingDeal, setEditingDeal] = useState<CRMDeal | null>(null);

  // View Mode: tile (grid) vs list (table)
  const [viewMode, setViewMode] = useState<"tile" | "list">("tile");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Filter States
  const [commissionFilter, setCommissionFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<
    "recent" | "gmv_desc" | "commission_desc" | "skus_desc" | "name_asc"
  >("recent");

  const handleCreateDeal = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    await createDealAction(formData);
    setIsSubmitting(false);
    setShowAddDealModal(false);
  };

  const handleUpdateDeal = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingDeal) return;
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    await updateDealAction(editingDeal.id, {
      deal_name: formData.get("dealName") as string,
      expected_sku_count: parseInt(formData.get("expectedSkuCount") as string, 10) || 0,
      commission_rate_percent: parseFloat(formData.get("commissionRate") as string) || 0,
      estimated_annual_value_inr: parseInt(formData.get("estimatedAnnualValue") as string, 10) || 0,
      target_onboarding_date: (formData.get("targetDate") as string) || null,
      stage: (formData.get("stage") as CRMDealStage) || editingDeal.stage,
      notes: (formData.get("notes") as string) || null,
    });
    setIsSubmitting(false);
    setEditingDeal(null);
  };

  const handleUpdateStage = async (dealId: string, nextStage: CRMDealStage) => {
    setIsSubmitting(true);
    await updateDealStageAction(dealId, nextStage);
    setIsSubmitting(false);
  };

  const handleMoveToOnboarding = async (dealId: string) => {
    setIsSubmitting(true);
    await moveDealToOnboardingAction(dealId);
    setIsSubmitting(false);
    window.location.href = "/dashboard/crm/onboarding";
  };

  // Metrics
  const activeDealsCount = deals.filter(
    (d) => d.stage !== "contract_signed" && d.stage !== "lost"
  ).length;

  const totalGMV = deals.reduce(
    (acc, d) => acc + (d.estimated_annual_value_inr || 0),
    0
  );

  const avgCommission = deals.length
    ? Math.round(
      deals.reduce((acc, d) => acc + (d.commission_rate_percent || 0), 0) /
      deals.length
    )
    : 0;

  const stageCounts = useMemo(() => {
    const map: Record<string, number> = {};
    [...FUNNEL_DEAL_STAGES, LOST_STAGE].forEach((s) => (map[s.key] = 0));
    deals.forEach((d) => (map[d.stage] = (map[d.stage] || 0) + 1));
    return map;
  }, [deals]);

  const activeFilterCount =
    (selectedStage !== "all" ? 1 : 0) +
    (commissionFilter !== "all" ? 1 : 0) +
    (searchQuery.trim().length > 0 ? 1 : 0) +
    (sortBy !== "recent" ? 1 : 0);

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedStage("all");
    setCommissionFilter("all");
    setSortBy("recent");
  };

  const filteredDeals = deals
    .filter((deal) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        deal.deal_name.toLowerCase().includes(q) ||
        (deal.lead_name && deal.lead_name.toLowerCase().includes(q));

      const matchesStage =
        selectedStage === "all" || deal.stage === selectedStage;

      const matchesCommission =
        commissionFilter === "all" ||
        (commissionFilter === "high" && (deal.commission_rate_percent || 0) >= 15) ||
        (commissionFilter === "standard" && (deal.commission_rate_percent || 0) < 15);

      return matchesQuery && matchesStage && matchesCommission;
    })
    .sort((a, b) => {
      if (sortBy === "name_asc") return a.deal_name.localeCompare(b.deal_name);
      if (sortBy === "gmv_desc") {
        return (b.estimated_annual_value_inr || 0) - (a.estimated_annual_value_inr || 0);
      }
      if (sortBy === "commission_desc") {
        return (b.commission_rate_percent || 0) - (a.commission_rate_percent || 0);
      }
      if (sortBy === "skus_desc") {
        return (b.expected_sku_count || 0) - (a.expected_sku_count || 0);
      }
      return (
        new Date(b.created_at || "").getTime() -
        new Date(a.created_at || "").getTime()
      );
    });

  return (
    <div className="space-y-5 bg-[#F5F6F3] -m-px p-px">
      {/* Shared CRM Navigation Header */}
      <CRMNavHeader
        eyebrow="Commercial Agreements"
        title="Commercial Deals"
        description="Negotiate SKU commitments, platform commission agreements, and launch dates with high-volume sellers."
        counts={{
          contacts: counts?.contacts,
          leads: counts?.leads,
          deals: deals.length,
          onboardings: counts?.onboardings,
        }}
        actions={
          <button
            type="button"
            onClick={() => setShowAddDealModal(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#23231F] px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-[#3A3A34]"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Deal</span>
          </button>
        }
      />

      {/* COMMERCIAL METRIC CARDS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-[#E1E4DD] bg-white p-4">
          <div className="flex items-center justify-between text-[#73736E]">
            <span className="text-xs font-medium uppercase tracking-wider">
              Active Deals
            </span>
            <Briefcase className="h-4 w-4 text-[#5D78C9]" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-[#23231F] font-mono tabular-nums">
              {activeDealsCount}
            </span>
            <p className="text-[11px] text-[#73736E] mt-0.5">
              Currently negotiating
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-[#E1E4DD] bg-white p-4">
          <div className="flex items-center justify-between text-[#73736E]">
            <span className="text-xs font-medium uppercase tracking-wider">
              Pipeline GMV
            </span>
            <IndianRupee className="h-4 w-4 text-[#3F7A55]" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-[#2E5B3F] font-mono tabular-nums">
              ₹{totalGMV.toLocaleString("en-IN")}
            </span>
            <p className="text-[11px] text-[#73736E] mt-0.5">
              Estimated annual GMV potential
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-[#E1E4DD] bg-white p-4">
          <div className="flex items-center justify-between text-[#73736E]">
            <span className="text-xs font-medium uppercase tracking-wider">
              Avg Commission
            </span>
            <Percent className="h-4 w-4 text-[#7A4FA0]" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-[#23231F] font-mono tabular-nums">
              {avgCommission}%
            </span>
            <p className="text-[11px] text-[#73736E] mt-0.5">
              Target platform take rate
            </p>
          </div>
        </div>
      </div>

      {/* PIPELINE STRIP HERO */}
      <div className="rounded-xl border border-[#E1E4DD] bg-white p-4">
        <div className="flex flex-wrap items-stretch gap-1.5">
          <button
            onClick={() => setSelectedStage("all")}
            className={`flex items-center gap-2 rounded-lg border px-3.5 py-2.5 text-left transition ${selectedStage === "all"
                ? "border-[#23231F] bg-[#23231F] text-white"
                : "border-[#E1E4DD] bg-white text-[#4B4F49] hover:border-[#23231F]/40"
              }`}
          >
            <span className="text-xs font-semibold">All deals</span>
            <span
              className={`text-xs tabular-nums ${selectedStage === "all" ? "text-white/70" : "text-[#8C8C85]"
                }`}
            >
              {deals.length}
            </span>
          </button>

          {FUNNEL_DEAL_STAGES.map((s, i) => {
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
                {i < FUNNEL_DEAL_STAGES.length - 1 && (
                  <ChevronRight className="mx-1 h-3.5 w-3.5 text-[#C7CAC2] shrink-0" />
                )}
              </div>
            );
          })}

          <button
            onClick={() => setSelectedStage(LOST_STAGE.key)}
            style={{
              borderColor:
                selectedStage === LOST_STAGE.key ? LOST_STAGE.dot : "#E1E4DD",
              background:
                selectedStage === LOST_STAGE.key ? LOST_STAGE.tint : "white",
            }}
            className="ml-auto flex items-center gap-2 rounded-lg border px-3.5 py-2.5 text-left transition hover:border-[#23231F]/30"
          >
            <span className="text-xs font-semibold text-[#6B655E]">Lost</span>
            <span className="text-xs tabular-nums text-[#8C8C85]">
              {stageCounts[LOST_STAGE.key] || 0}
            </span>
          </button>
        </div>
      </div>

      {/* SEARCH, FILTER & VIEW CONTROLS */}
      <div className="space-y-3 rounded-xl border border-[#E1E4DD] bg-white p-3.5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#8C8C85]" />
            <input
              type="text"
              placeholder="Search deals by contract name or seller…"
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

          {/* Right Action Bar */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => setShowAdvancedFilters((prev) => !prev)}
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${showAdvancedFilters || activeFilterCount > 0
                  ? "border-[#23231F] bg-[#23231F] text-white"
                  : "border-[#E1E4DD] bg-white text-[#52524E] hover:border-[#23231F]/30"
                }`}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="ml-0.5 rounded-full bg-white/20 px-1.5 text-[10px] font-bold">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {activeFilterCount > 0 && (
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
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition ${viewMode === "tile"
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
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition ${viewMode === "list"
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

        {/* Advanced Filters Drawer */}
        {showAdvancedFilters && (
          <div className="grid grid-cols-1 gap-3 border-t border-[#F0F0EC] pt-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-[11px] font-medium text-[#73736E]">
                Commission rate bracket
              </label>
              <select
                value={commissionFilter}
                onChange={(e) => setCommissionFilter(e.target.value)}
                className="w-full rounded-lg border border-[#E1E4DD] bg-[#F5F6F3] px-2.5 py-1.5 text-xs text-[#23231F] outline-none focus:border-[#3A4B99]"
              >
                <option value="all">All commission rates</option>
                <option value="high">High commission (≥ 15%)</option>
                <option value="standard">Standard commission (&lt; 15%)</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-[11px] font-medium text-[#73736E]">
                Sort by
              </label>
              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(
                    e.target.value as
                    | "recent" | "gmv_desc" | "commission_desc" | "skus_desc" | "name_asc"
                  )
                }
                className="w-full rounded-lg border border-[#E1E4DD] bg-[#F5F6F3] px-2.5 py-1.5 text-xs text-[#23231F] outline-none focus:border-[#3A4B99]"
              >
                <option value="recent">Recently added</option>
                <option value="gmv_desc">Annual GMV, highest first</option>
                <option value="commission_desc">Commission rate, highest first</option>
                <option value="skus_desc">Target SKU count, highest first</option>
                <option value="name_asc">Deal name, A–Z</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* RESULTS: LIST VS TILE VIEW */}
      {viewMode === "list" ? (
        /* LIST / TABLE VIEW */
        <div className="overflow-hidden rounded-xl border border-[#E1E4DD] bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#E1E4DD] text-[11px] font-medium text-[#8C8C85]">
                <tr>
                  <th className="px-4 py-3">Deal &amp; partner</th>
                  <th className="px-4 py-3 text-right">Target SKUs</th>
                  <th className="px-4 py-3 text-right">Commission</th>
                  <th className="px-4 py-3 text-right">Est. annual GMV</th>
                  <th className="px-4 py-3">Target launch</th>
                  <th className="px-4 py-3">Stage</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F0EC]">
                {filteredDeals.map((deal) => (
                  <tr
                    key={deal.id}
                    className="hover:bg-[#F5F6F3]/70 transition"
                  >
                    <td className="px-4 py-3">
                      <div className="font-semibold text-[#23231F]">
                        {deal.deal_name}
                      </div>
                      {deal.lead_name && (
                        <div className="mt-0.5 text-[11px] text-[#8C8C85]">
                          Partner: {deal.lead_name}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums text-[#23231F]">
                      {deal.expected_sku_count} SKUs
                    </td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums text-[#5C3A79] font-medium">
                      {deal.commission_rate_percent}%
                    </td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums font-semibold text-[#2E5B3F]">
                      ₹{(deal.estimated_annual_value_inr || 0).toLocaleString(
                        "en-IN"
                      )}
                    </td>
                    <td className="px-4 py-3 text-[#4B4F49]">
                      {deal.target_onboarding_date || "Within 30 days"}
                    </td>
                    <td className="px-4 py-3">
                      <DealStageSelect
                        value={deal.stage}
                        disabled={isSubmitting}
                        onChange={(v) => handleUpdateStage(deal.id, v)}
                      />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingDeal(deal)}
                          className="inline-flex items-center gap-1 rounded-md border border-[#E1E4DD] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#52524E] hover:bg-[#F5F6F3] hover:text-[#23231F]"
                        >
                          <Edit className="h-3 w-3" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleMoveToOnboarding(deal.id)}
                          disabled={
                            isSubmitting || deal.stage === "contract_signed"
                          }
                          className="inline-flex items-center gap-1.5 rounded-lg bg-[#3A4B99] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#2E3C80] disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <span>Move to onboarding</span>
                          <Award className="h-3 w-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* TILE / GRID VIEW */
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredDeals.map((deal) => {
            const stageStyle = STAGE_STYLE[deal.stage];
            return (
              <div
                key={deal.id}
                className="flex flex-col justify-between rounded-xl border border-[#E1E4DD] bg-white pl-4 pr-5 py-5 transition hover:border-[#23231F]/25"
                style={{
                  borderLeft: `4px solid ${stageStyle?.dot || "#E1E4DD"}`,
                }}
              >
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-semibold text-[#23231F]">
                        {deal.deal_name}
                      </h3>
                      {deal.lead_name && (
                        <p className="mt-0.5 truncate text-xs font-medium text-[#73736E]">
                          Partner: {deal.lead_name}
                        </p>
                      )}
                    </div>

                    <span
                      className="shrink-0 rounded-md px-2 py-0.5 text-[10px] font-semibold"
                      style={{
                        background: stageStyle?.tint || "#F1F2F0",
                        color: stageStyle?.text || "#565D68",
                      }}
                    >
                      {stageStyle?.label}
                    </span>
                  </div>

                  {/* Commercial Terms Summary Box */}
                  <div className="rounded-lg bg-[#F5F6F3] p-3 space-y-2 text-xs border border-[#E1E4DD]/60">
                    <div className="flex justify-between items-center">
                      <span className="text-[#73736E]">Target SKUs:</span>
                      <span className="font-semibold text-[#23231F] flex items-center gap-1 font-mono">
                        <Package className="h-3 w-3 text-[#A6A79F]" />
                        {deal.expected_sku_count} SKUs
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#73736E]">Commission rate:</span>
                      <span className="font-semibold text-[#5C3A79] flex items-center gap-0.5 font-mono">
                        <Percent className="h-3 w-3" />
                        {deal.commission_rate_percent}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#73736E]">Target go-live:</span>
                      <span className="font-semibold text-[#23231F] flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-[#A6A79F]" />
                        {deal.target_onboarding_date || "Within 30 days"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-1 border-t border-[#E1E4DD]/60">
                      <span className="text-[#73736E]">Est. annual GMV:</span>
                      <span className="font-bold text-[#2E5B3F] font-mono tabular-nums">
                        ₹
                        {(deal.estimated_annual_value_inr || 0).toLocaleString(
                          "en-IN"
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Notes */}
                  {deal.notes && (
                    <p className="mt-2 rounded-lg bg-[#F5F6F3] p-2.5 text-[11px] italic text-[#73736E] line-clamp-2">
                      “{deal.notes}”
                    </p>
                  )}
                </div>

                {/* Card Footer */}
                <div className="mt-4 space-y-2 border-t border-[#F0F0EC] pt-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[11px] text-[#8C8C85]">Stage</span>
                    <DealStageSelect
                      value={deal.stage}
                      disabled={isSubmitting}
                      onChange={(v) => handleUpdateStage(deal.id, v)}
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] text-[#8C8C85]">
                        Owner: {deal.assignee_name || "Operations Lead"}
                      </span>
                      <button
                        type="button"
                        onClick={() => setEditingDeal(deal)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#52524E] hover:text-[#23231F] hover:underline"
                      >
                        <Edit className="h-3 w-3" />
                        <span>Edit</span>
                      </button>
                    </div>

                    <button
                      onClick={() => handleMoveToOnboarding(deal.id)}
                      disabled={
                        isSubmitting || deal.stage === "contract_signed"
                      }
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[#3A4B99] px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-[#2E3C80] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <span>Move to onboarding</span>
                      <Award className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* EMPTY STATE */}
      {filteredDeals.length === 0 && (
        <div className="rounded-xl border border-[#E1E4DD] bg-white p-12 text-center">
          <Briefcase className="mx-auto h-7 w-7 text-[#A6A79F]" />
          <h4 className="mt-3 text-sm font-semibold text-[#23231F]">
            No deals match these filters
          </h4>
          <p className="mx-auto mt-1 max-w-sm text-xs text-[#73736E]">
            {activeFilterCount > 0
              ? "Clear a filter or try a different search term to see more deals."
              : "Create commercial deals from qualified leads to track contract terms and GMV commitments."}
          </p>
          {activeFilterCount > 0 && (
            <button
              onClick={resetFilters}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#23231F] px-4 py-2 text-xs font-semibold text-white hover:bg-[#3A3A34]"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Clear filters</span>
            </button>
          )}
        </div>
      )}

      {/* ADD DEAL MODAL */}
      {showAddDealModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-[#E1E4DD] bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#F0F0EC] pb-3">
              <div>
                <h3 className="text-base font-bold text-[#23231F]">Add Commercial Deal</h3>
                <p className="text-xs text-[#73736E]">Create a contract agreement for platform onboarding</p>
              </div>
              <button
                onClick={() => setShowAddDealModal(false)}
                className="text-[#8C8C85] hover:text-[#23231F]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateDeal} className="mt-4 space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-[#73736E]">Deal Title *</label>
                <input
                  name="dealName"
                  required
                  placeholder="e.g. Royal Jaipur Blockprints Master Partnership"
                  className="mt-1 w-full rounded-lg border border-[#E1E4DD] bg-[#F5F6F3] px-3 py-2 text-xs text-[#23231F] outline-none focus:border-[#3A4B99]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-[#73736E]">Target SKU Count</label>
                  <input
                    name="expectedSkuCount"
                    type="number"
                    defaultValue={15}
                    className="mt-1 w-full rounded-lg border border-[#E1E4DD] bg-[#F5F6F3] px-3 py-2 text-xs text-[#23231F] outline-none focus:border-[#3A4B99]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-[#73736E]">Commission Rate (%)</label>
                  <input
                    name="commissionRate"
                    type="number"
                    step="0.1"
                    defaultValue={12.5}
                    className="mt-1 w-full rounded-lg border border-[#E1E4DD] bg-[#F5F6F3] px-3 py-2 text-xs text-[#23231F] outline-none focus:border-[#3A4B99]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-[#73736E]">Estimated Annual GMV (₹)</label>
                  <input
                    name="estimatedAnnualValue"
                    type="number"
                    defaultValue={400000}
                    className="mt-1 w-full rounded-lg border border-[#E1E4DD] bg-[#F5F6F3] px-3 py-2 text-xs text-[#23231F] outline-none focus:border-[#3A4B99]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-[#73736E]">Target Go-Live Date</label>
                  <input
                    name="targetDate"
                    type="date"
                    className="mt-1 w-full rounded-lg border border-[#E1E4DD] bg-[#F5F6F3] px-3 py-2 text-xs text-[#23231F] outline-none focus:border-[#3A4B99]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#73736E]">Deal Stage</label>
                <select
                  name="stage"
                  defaultValue="proposal_sent"
                  className="mt-1 w-full rounded-lg border border-[#E1E4DD] bg-[#F5F6F3] px-3 py-2 text-xs text-[#23231F] outline-none focus:border-[#3A4B99]"
                >
                  <option value="proposal_sent">Proposal Sent</option>
                  <option value="terms_negotiating">Negotiating Terms</option>
                  <option value="contract_signed">Contract Signed</option>
                  <option value="lost">Lost</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#73736E]">Commercial Notes</label>
                <textarea
                  name="notes"
                  rows={2}
                  placeholder="Terms agreed, logistics requirements, exclusivity conditions..."
                  className="mt-1 w-full rounded-lg border border-[#E1E4DD] bg-[#F5F6F3] px-3 py-2 text-xs text-[#23231F] outline-none focus:border-[#3A4B99]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#F0F0EC]">
                <button
                  type="button"
                  onClick={() => setShowAddDealModal(false)}
                  className="rounded-lg border border-[#E1E4DD] px-4 py-2 text-xs font-semibold text-[#73736E] hover:bg-[#F5F6F3]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-lg bg-[#23231F] px-4 py-2 text-xs font-semibold text-white hover:bg-[#3A3A34] disabled:opacity-50"
                >
                  {isSubmitting ? "Creating..." : "Create deal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT DEAL MODAL */}
      {editingDeal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-[#E1E4DD] bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#F0F0EC] pb-3">
              <div>
                <h3 className="text-base font-bold text-[#23231F]">Edit Commercial Deal</h3>
                <p className="text-xs text-[#73736E]">Update contract terms, commission, and launch schedule</p>
              </div>
              <button
                onClick={() => setEditingDeal(null)}
                className="text-[#8C8C85] hover:text-[#23231F]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateDeal} className="mt-4 space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-[#73736E]">Deal Title *</label>
                <input
                  name="dealName"
                  required
                  defaultValue={editingDeal.deal_name}
                  className="mt-1 w-full rounded-lg border border-[#E1E4DD] bg-[#F5F6F3] px-3 py-2 text-xs text-[#23231F] outline-none focus:border-[#3A4B99]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-[#73736E]">Target SKU Count</label>
                  <input
                    name="expectedSkuCount"
                    type="number"
                    defaultValue={editingDeal.expected_sku_count}
                    className="mt-1 w-full rounded-lg border border-[#E1E4DD] bg-[#F5F6F3] px-3 py-2 text-xs text-[#23231F] outline-none focus:border-[#3A4B99]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-[#73736E]">Commission Rate (%)</label>
                  <input
                    name="commissionRate"
                    type="number"
                    step="0.1"
                    defaultValue={editingDeal.commission_rate_percent}
                    className="mt-1 w-full rounded-lg border border-[#E1E4DD] bg-[#F5F6F3] px-3 py-2 text-xs text-[#23231F] outline-none focus:border-[#3A4B99]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-[#73736E]">Estimated Annual GMV (₹)</label>
                  <input
                    name="estimatedAnnualValue"
                    type="number"
                    defaultValue={editingDeal.estimated_annual_value_inr}
                    className="mt-1 w-full rounded-lg border border-[#E1E4DD] bg-[#F5F6F3] px-3 py-2 text-xs text-[#23231F] outline-none focus:border-[#3A4B99]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-[#73736E]">Target Go-Live Date</label>
                  <input
                    name="targetDate"
                    type="date"
                    defaultValue={editingDeal.target_onboarding_date || ""}
                    className="mt-1 w-full rounded-lg border border-[#E1E4DD] bg-[#F5F6F3] px-3 py-2 text-xs text-[#23231F] outline-none focus:border-[#3A4B99]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#73736E]">Deal Stage</label>
                <select
                  name="stage"
                  defaultValue={editingDeal.stage}
                  className="mt-1 w-full rounded-lg border border-[#E1E4DD] bg-[#F5F6F3] px-3 py-2 text-xs text-[#23231F] outline-none focus:border-[#3A4B99]"
                >
                  <option value="proposal_sent">Proposal Sent</option>
                  <option value="terms_negotiating">Negotiating Terms</option>
                  <option value="contract_signed">Contract Signed</option>
                  <option value="lost">Lost</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#73736E]">Commercial Notes</label>
                <textarea
                  name="notes"
                  rows={2}
                  defaultValue={editingDeal.notes || ""}
                  placeholder="Terms agreed, logistics requirements, exclusivity conditions..."
                  className="mt-1 w-full rounded-lg border border-[#E1E4DD] bg-[#F5F6F3] px-3 py-2 text-xs text-[#23231F] outline-none focus:border-[#3A4B99]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#F0F0EC]">
                <button
                  type="button"
                  onClick={() => setEditingDeal(null)}
                  className="rounded-lg border border-[#E1E4DD] px-4 py-2 text-xs font-semibold text-[#73736E] hover:bg-[#F5F6F3]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-lg bg-[#23231F] px-4 py-2 text-xs font-semibold text-white hover:bg-[#3A3A34] disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : "Save changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function DealStageSelect({
  value,
  disabled,
  onChange,
}: {
  value: CRMDealStage;
  disabled: boolean;
  onChange: (v: CRMDealStage) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as CRMDealStage)}
      disabled={disabled}
      className="rounded-md border border-[#E1E4DD] bg-[#F5F6F3] px-2 py-1 text-[11px] font-medium text-[#23231F] outline-none focus:border-[#3A4B99]"
    >
      {STAGE_OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
