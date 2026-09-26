"use client";

import { useMemo, useState } from "react";
import {
  Target, Briefcase, Layers, Phone, MapPin, Search, 
  LayoutGrid, List, SlidersHorizontal, RotateCcw, 
  X, Leaf, Flame, Sun, Snowflake, ChevronRight, 
  Plus, Edit, Loader2, Save,
} from "lucide-react";
import type { CRMLead, CRMLeadStage } from "@genz/types";
import { CRMNavHeader } from "./crm-nav-header";
import {
  createLeadAction,
  updateLeadAction,
  updateLeadStageAction,
  convertLeadToDealAction,
} from "../actions";

interface LeadsViewClientProps {
  leads: CRMLead[];
  counts?: {
    contacts?: number;
    leads?: number;
    deals?: number;
    onboardings?: number;
  };
}

/* Pipeline order matters here — this is a real funnel, not a decorative list. */
const FUNNEL_STAGES: { key: CRMLeadStage; label: string; dot: string; tint: string; text: string }[] = [
  { key: "discovery", label: "Discovery", dot: "#8B93A6", tint: "#F1F2F0", text: "#565D68" },
  { key: "pitch_in_progress", label: "Pitch in progress", dot: "#5D78C9", tint: "#EEF1FA", text: "#3B4F98" },
  { key: "catalog_audit", label: "Catalog audit", dot: "#C48A2E", tint: "#FBF2E2", text: "#8A5E17" },
  { key: "negotiating", label: "Negotiating", dot: "#7A4FA0", tint: "#F4EEF9", text: "#5C3A79" },
  { key: "converted", label: "Converted", dot: "#3F7A55", tint: "#EAF4EC", text: "#2E5B3F" },
];
const DROPPED = { key: "dropped" as const, label: "Dropped", dot: "#948C84", tint: "#F1EFEC", text: "#6B655E" };
const STAGE_STYLE = Object.fromEntries(
  [...FUNNEL_STAGES, DROPPED].map((s) => [s.key, s])
) as Record<CRMLeadStage, (typeof FUNNEL_STAGES)[number]>;

const SCORE_STYLE: Record<string, { icon: typeof Flame; dot: string; text: string }> = {
  hot: { icon: Flame, dot: "#B3472B", text: "#8A3721" },
  warm: { icon: Sun, dot: "#B98329", text: "#8A611E" },
  cold: { icon: Snowflake, dot: "#5B6663", text: "#5B6663" },
};

const STAGE_OPTIONS: { value: CRMLeadStage; label: string }[] = [
  ...FUNNEL_STAGES.map((s) => ({ value: s.key, label: s.label })),
  { value: DROPPED.key, label: DROPPED.label },
];

export function LeadsViewClient({ leads, counts }: LeadsViewClientProps) {
  const [selectedStage, setSelectedStage] = useState<CRMLeadStage | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Add / Edit Lead States
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [editingLead, setEditingLead] = useState<CRMLead | null>(null);

  const [viewMode, setViewMode] = useState<"tile" | "list">("tile");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const [giFilter, setGiFilter] = useState<"all" | "gi_only" | "non_gi">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [scoreFilter, setScoreFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"recent" | "score_desc" | "capacity_desc" | "name_asc">("recent");

  const handleCreateLead = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    await createLeadAction(formData);
    setIsSubmitting(false);
    setShowAddLeadModal(false);
  };

  const handleUpdateLead = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingLead) return;
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    await updateLeadAction(editingLead.id, {
      artisan_or_business_name: formData.get("businessName") as string,
      contact_person: formData.get("contactPerson") as string,
      phone: formData.get("phone") as string,
      email: (formData.get("email") as string) || null,
      craft_category: (formData.get("craftCategory") as string) || "Traditional Crafts",
      cluster_name: (formData.get("clusterName") as string) || null,
      city: (formData.get("city") as string) || null,
      state: (formData.get("state") as string) || null,
      gi_certified: formData.get("giCertified") === "true",
      monthly_capacity_units: parseInt(formData.get("monthlyCapacityUnits") as string, 10) || 100,
      lead_score: (formData.get("leadScore") as string) || "warm",
      stage: (formData.get("stage") as CRMLeadStage) || "discovery",
      notes: (formData.get("notes") as string) || null,
    });
    setIsSubmitting(false);
    setEditingLead(null);
  };

  const handleUpdateStage = async (leadId: string, nextStage: CRMLeadStage) => {
    setIsSubmitting(true);
    await updateLeadStageAction(leadId, nextStage);
    setIsSubmitting(false);
  };

  const handleConvertToDeal = async (leadId: string, leadName: string) => {
    setIsSubmitting(true);
    await convertLeadToDealAction(leadId, `${leadName} Seller Partnership`);
    setIsSubmitting(false);
    window.location.href = "/dashboard/crm/deals";
  };

  const uniqueCategories = Array.from(
    new Set(leads.map((l) => l.craft_category).filter(Boolean))
  ) as string[];

  const activeFilterCount =
    (selectedStage !== "all" ? 1 : 0) +
    (giFilter !== "all" ? 1 : 0) +
    (categoryFilter !== "all" ? 1 : 0) +
    (scoreFilter !== "all" ? 1 : 0) +
    (searchQuery.trim().length > 0 ? 1 : 0) +
    (sortBy !== "recent" ? 1 : 0);

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedStage("all");
    setGiFilter("all");
    setCategoryFilter("all");
    setScoreFilter("all");
    setSortBy("recent");
  };

  const stageCounts = useMemo(() => {
    const map: Record<string, number> = {};
    [...FUNNEL_STAGES, DROPPED].forEach((s) => (map[s.key] = 0));
    leads.forEach((l) => (map[l.stage] = (map[l.stage] || 0) + 1));
    return map;
  }, [leads]);

  const filteredLeads = leads
    .filter((lead) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        lead.artisan_or_business_name.toLowerCase().includes(q) ||
        lead.contact_person.toLowerCase().includes(q) ||
        lead.craft_category.toLowerCase().includes(q) ||
        (lead.city && lead.city.toLowerCase().includes(q)) ||
        (lead.cluster_name && lead.cluster_name.toLowerCase().includes(q));

      const matchesStage = selectedStage === "all" || lead.stage === selectedStage;
      const matchesGi =
        giFilter === "all" ||
        (giFilter === "gi_only" && Boolean(lead.gi_certified)) ||
        (giFilter === "non_gi" && !lead.gi_certified);

      const matchesCategory = categoryFilter === "all" || lead.craft_category === categoryFilter;

      const matchesScore =
        scoreFilter === "all" ||
        (lead.lead_score && lead.lead_score.toLowerCase() === scoreFilter.toLowerCase());

      return matchesQuery && matchesStage && matchesGi && matchesCategory && matchesScore;
    })
    .sort((a, b) => {
      if (sortBy === "name_asc") {
        return a.artisan_or_business_name.localeCompare(b.artisan_or_business_name);
      }
      if (sortBy === "capacity_desc") {
        return (b.monthly_capacity_units || 0) - (a.monthly_capacity_units || 0);
      }
      if (sortBy === "score_desc") {
        const scoreWeight: Record<string, number> = { hot: 3, warm: 2, cold: 1 };
        const wA = a.lead_score ? scoreWeight[a.lead_score.toLowerCase()] || 0 : 0;
        const wB = b.lead_score ? scoreWeight[b.lead_score.toLowerCase()] || 0 : 0;
        return wB - wA;
      }
      return new Date(b.created_at || "").getTime() - new Date(a.created_at || "").getTime();
    });

  return (
    <div className="space-y-5 bg-[#F5F6F3] -m-px p-px">
      <CRMNavHeader
        eyebrow="Sales Pipeline"
        title="Qualified Leads"
        description="Active seller prospects undergoing readiness assessment, catalog sampling, and business partnership pitches."
        counts={{
          contacts: counts?.contacts,
          leads: leads.length,
          deals: counts?.deals,
          onboardings: counts?.onboardings,
        }}
        actions={
          <button
            onClick={() => setShowAddLeadModal(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-[#23231F] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#3A3A34]"
          >
            <Plus className="h-4 w-4" />
            <span>Add lead</span>
          </button>
        }
      />

      {/* PIPELINE STRIP — the funnel is real, so it gets to be the hero */}
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
            <span className="text-xs font-semibold">All leads</span>
            <span className={`text-xs tabular-nums ${selectedStage === "all" ? "text-white/70" : "text-[#8C8C85]"}`}>
              {leads.length}
            </span>
          </button>

          {FUNNEL_STAGES.map((s, i) => {
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
                  <span className="flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold text-white shrink-0" style={{ background: s.dot }}>
                    {i + 1}
                  </span>
                  <span className="flex flex-col leading-tight">
                    <span className="text-xs font-semibold" style={{ color: active ? s.text : "#23231F" }}>
                      {s.label}
                    </span>
                  </span>
                  <span className="text-xs tabular-nums text-[#8C8C85]">{stageCounts[s.key] || 0}</span>
                </button>
                {i < FUNNEL_STAGES.length - 1 && <ChevronRight className="mx-1 h-3.5 w-3.5 text-[#C7CAC2] shrink-0" />}
              </div>
            );
          })}

          <button
            onClick={() => setSelectedStage(DROPPED.key)}
            style={{
              borderColor: selectedStage === DROPPED.key ? DROPPED.dot : "#E1E4DD",
              background: selectedStage === DROPPED.key ? DROPPED.tint : "white",
            }}
            className="ml-auto flex items-center gap-2 rounded-lg border px-3.5 py-2.5 text-left transition hover:border-[#23231F]/30"
          >
            <span className="text-xs font-semibold text-[#6B655E]">Dropped</span>
            <span className="text-xs tabular-nums text-[#8C8C85]">{stageCounts[DROPPED.key] || 0}</span>
          </button>
        </div>
      </div>

      {/* SEARCH & CONTROLS */}
      <div className="space-y-3 rounded-xl border border-[#E1E4DD] bg-white p-3.5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#8C8C85]" />
            <input
              type="text"
              placeholder="Search by seller, business, contact, category…"
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
            <button
              type="button"
              onClick={() => setShowAdvancedFilters((prev) => !prev)}
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                showAdvancedFilters || activeFilterCount > 0
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
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition ${
                  viewMode === "tile" ? "bg-white text-[#23231F] shadow-sm" : "text-[#73736E] hover:text-[#23231F]"
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
                  viewMode === "list" ? "bg-white text-[#23231F] shadow-sm" : "text-[#73736E] hover:text-[#23231F]"
                }`}
                title="List view"
              >
                <List className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">List</span>
              </button>
            </div>
          </div>
        </div>

        {showAdvancedFilters && (
          <div className="grid grid-cols-1 gap-3 border-t border-[#F0F0EC] pt-3 sm:grid-cols-2 md:grid-cols-4">
            <div>
              <label className="mb-1 block text-[11px] font-medium text-[#73736E]">GI certification</label>
              <select
                value={giFilter}
                onChange={(e) => setGiFilter(e.target.value as "all" | "gi_only" | "non_gi")}
                className="w-full rounded-lg border border-[#E1E4DD] bg-[#F5F6F3] px-2.5 py-1.5 text-xs text-[#23231F] outline-none focus:border-[#3A4B99]"
              >
                <option value="all">All leads</option>
                <option value="gi_only">GI tag certified only</option>
                <option value="non_gi">Non-GI leads</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-[11px] font-medium text-[#73736E]">Craft category</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full rounded-lg border border-[#E1E4DD] bg-[#F5F6F3] px-2.5 py-1.5 text-xs text-[#23231F] outline-none focus:border-[#3A4B99]"
              >
                <option value="all">All categories ({uniqueCategories.length})</option>
                {uniqueCategories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-[11px] font-medium text-[#73736E]">Lead score</label>
              <select
                value={scoreFilter}
                onChange={(e) => setScoreFilter(e.target.value)}
                className="w-full rounded-lg border border-[#E1E4DD] bg-[#F5F6F3] px-2.5 py-1.5 text-xs text-[#23231F] outline-none focus:border-[#3A4B99]"
              >
                <option value="all">All scores</option>
                <option value="hot">Hot — high priority</option>
                <option value="warm">Warm</option>
                <option value="cold">Cold</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-[11px] font-medium text-[#73736E]">Sort by</label>
              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(
                    e.target.value as "recent" | "score_desc" | "capacity_desc" | "name_asc"
                  )
                }
                className="w-full rounded-lg border border-[#E1E4DD] bg-[#F5F6F3] px-2.5 py-1.5 text-xs text-[#23231F] outline-none focus:border-[#3A4B99]"
              >
                <option value="recent">Recently added</option>
                <option value="score_desc">Lead score, highest first</option>
                <option value="capacity_desc">Monthly capacity, highest first</option>
                <option value="name_asc">Business name, A–Z</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* RESULTS */}
      {viewMode === "list" ? (
        <div className="overflow-hidden rounded-xl border border-[#E1E4DD] bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#E1E4DD] text-[11px] font-medium text-[#8C8C85]">
                <tr>
                  <th className="px-4 py-3">Lead &amp; business</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3 text-right">Capacity</th>
                  <th className="px-4 py-3">Score</th>
                  <th className="px-4 py-3">Stage</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F0EC]">
                {filteredLeads.map((lead) => {
                  const score = lead.lead_score ? SCORE_STYLE[lead.lead_score.toLowerCase()] : null;
                  return (
                    <tr key={lead.id} className="hover:bg-[#F5F6F3]/70">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-[#23231F]">{lead.artisan_or_business_name}</span>
                          {lead.gi_certified && <GiStamp />}
                        </div>
                        {(lead.city || lead.state) && (
                          <div className="mt-0.5 text-[11px] text-[#8C8C85]">
                            {[lead.cluster_name, lead.city, lead.state].filter(Boolean).join(", ")}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-[#23231F]">{lead.contact_person}</div>
                        <div className="mt-0.5 font-mono text-[11px] text-[#8C8C85]">{lead.phone}</div>
                      </td>
                      <td className="px-4 py-3 text-[#4B4F49]">{lead.craft_category}</td>
                      <td className="px-4 py-3 text-right font-mono tabular-nums text-[#23231F]">
                        {lead.monthly_capacity_units ? `${lead.monthly_capacity_units}/mo` : "—"}
                      </td>
                      <td className="px-4 py-3">
                        {score ? (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium" style={{ color: score.text }}>
                            <score.icon className="h-3 w-3" />
                            {lead.lead_score}
                          </span>
                        ) : (
                          <span className="text-[#C7CAC2]">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <StageSelect value={lead.stage} disabled={isSubmitting} onChange={(v) => handleUpdateStage(lead.id, v)} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setEditingLead(lead)}
                            className="inline-flex items-center gap-1 rounded-lg border border-[#E1E4DD] bg-white px-2.5 py-1 text-xs font-semibold text-[#52524E] hover:border-[#23231F]/30 hover:text-[#23231F]"
                          >
                            <Edit className="h-3 w-3" />
                            <span>Edit</span>
                          </button>
                          <ConvertButton
                            disabled={isSubmitting || lead.stage === "converted"}
                            onClick={() => handleConvertToDeal(lead.id, lead.artisan_or_business_name)}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredLeads.map((lead) => {
            const stageStyle = STAGE_STYLE[lead.stage];
            const score = lead.lead_score ? SCORE_STYLE[lead.lead_score.toLowerCase()] : null;
            return (
              <div
                key={lead.id}
                className="flex flex-col justify-between rounded-xl border border-[#E1E4DD] bg-white pl-4 pr-5 py-5 transition hover:border-[#23231F]/25"
                style={{ borderLeft: `4px solid ${stageStyle?.dot || "#E1E4DD"}` }}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="truncate text-sm font-semibold text-[#23231F]">{lead.artisan_or_business_name}</h3>
                        {lead.gi_certified && <GiStamp />}
                      </div>
                      <p className="mt-0.5 truncate text-xs font-medium text-[#73736E]">{lead.contact_person}</p>
                    </div>
                    <span
                      className="shrink-0 rounded-md px-2 py-0.5 text-[10px] font-semibold"
                      style={{ background: stageStyle?.tint, color: stageStyle?.text }}
                    >
                      {stageStyle?.label}
                    </span>
                  </div>

                  <div className="space-y-2 pt-1 text-xs text-[#52524E]">
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 shrink-0 text-[#A6A79F]" />
                      <a href={`tel:${lead.phone}`} className="font-mono hover:underline">
                        {lead.phone}
                      </a>
                    </div>
                    {(lead.cluster_name || lead.city || lead.state) && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-[#A6A79F]" />
                        <span>{[lead.cluster_name, lead.city, lead.state].filter(Boolean).join(", ")}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Layers className="h-3.5 w-3.5 shrink-0 text-[#A6A79F]" />
                      <span>
                        Monthly capacity: <strong className="font-mono tabular-nums">{lead.monthly_capacity_units || 0} units</strong>
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <span className="rounded-md border border-[#E1E4DD] px-2 py-0.5 text-[11px] text-[#4B4F49]">
                        {lead.craft_category}
                      </span>
                      {score && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium" style={{ color: score.text }}>
                          <score.icon className="h-3 w-3" />
                          {lead.lead_score}
                        </span>
                      )}
                    </div>
                  </div>

                  {lead.notes && (
                    <p className="mt-2 rounded-lg bg-[#F5F6F3] p-2.5 text-[11px] italic text-[#73736E] line-clamp-2">
                      “{lead.notes}”
                    </p>
                  )}
                </div>

                <div className="mt-4 space-y-2 border-t border-[#F0F0EC] pt-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[11px] text-[#8C8C85]">Stage</span>
                    <StageSelect value={lead.stage} disabled={isSubmitting} onChange={(v) => handleUpdateStage(lead.id, v)} />
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={() => setEditingLead(lead)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#52524E] hover:text-[#23231F] hover:underline"
                    >
                      <Edit className="h-3 w-3" />
                      <span>Edit</span>
                    </button>

                    <ConvertButton
                      disabled={isSubmitting || lead.stage === "converted"}
                      onClick={() => handleConvertToDeal(lead.id, lead.artisan_or_business_name)}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {filteredLeads.length === 0 && (
        <div className="rounded-xl border border-[#E1E4DD] bg-white p-12 text-center">
          <Target className="mx-auto h-7 w-7 text-[#A6A79F]" />
          <h4 className="mt-3 text-sm font-semibold text-[#23231F]">No leads match these filters</h4>
          <p className="mx-auto mt-1 max-w-sm text-xs text-[#73736E]">
            {activeFilterCount > 0
              ? "Clear a filter or try a different search term to see more of the pipeline."
              : "Promote seller contacts from the directory to start building the pipeline."}
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

      {/* ADD LEAD MODAL */}
      {showAddLeadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-[#E1E4DD] bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#F0F0EC] pb-3">
              <div>
                <h3 className="text-base font-bold text-[#23231F]">Add Pipeline Lead</h3>
                <p className="text-xs text-[#73736E]">Create a new qualified seller prospect</p>
              </div>
              <button onClick={() => setShowAddLeadModal(false)} className="text-[#8C8C85] hover:text-[#23231F]">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateLead} className="mt-4 space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-[#73736E]">Business / Enterprise Name *</label>
                <input
                  name="businessName"
                  required
                  placeholder="e.g. Royal Sanganer Handlooms"
                  className="mt-1 w-full rounded-lg border border-[#E1E4DD] bg-[#F5F6F3] px-3 py-2 text-xs text-[#23231F] outline-none focus:border-[#3A4B99]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-[#73736E]">Contact Person *</label>
                  <input
                    name="contactPerson"
                    required
                    placeholder="e.g. Suresh Meena"
                    className="mt-1 w-full rounded-lg border border-[#E1E4DD] bg-[#F5F6F3] px-3 py-2 text-xs text-[#23231F] outline-none focus:border-[#3A4B99]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-[#73736E]">Phone *</label>
                  <input
                    name="phone"
                    required
                    placeholder="+91 9876543210"
                    className="mt-1 w-full rounded-lg border border-[#E1E4DD] bg-[#F5F6F3] px-3 py-2 text-xs text-[#23231F] outline-none focus:border-[#3A4B99]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-[#73736E]">Email</label>
                  <input
                    name="email"
                    type="email"
                    placeholder="lead@example.com"
                    className="mt-1 w-full rounded-lg border border-[#E1E4DD] bg-[#F5F6F3] px-3 py-2 text-xs text-[#23231F] outline-none focus:border-[#3A4B99]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-[#73736E]">Craft Category</label>
                  <input
                    name="craftCategory"
                    defaultValue="Traditional Crafts"
                    className="mt-1 w-full rounded-lg border border-[#E1E4DD] bg-[#F5F6F3] px-3 py-2 text-xs text-[#23231F] outline-none focus:border-[#3A4B99]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-[#73736E]">City</label>
                  <input
                    name="city"
                    placeholder="e.g. Jaipur"
                    className="mt-1 w-full rounded-lg border border-[#E1E4DD] bg-[#F5F6F3] px-3 py-2 text-xs text-[#23231F] outline-none focus:border-[#3A4B99]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-[#73736E]">State</label>
                  <input
                    name="state"
                    placeholder="e.g. Rajasthan"
                    className="mt-1 w-full rounded-lg border border-[#E1E4DD] bg-[#F5F6F3] px-3 py-2 text-xs text-[#23231F] outline-none focus:border-[#3A4B99]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-[#73736E]">Cluster</label>
                  <input
                    name="clusterName"
                    placeholder="e.g. Sanganer"
                    className="mt-1 w-full rounded-lg border border-[#E1E4DD] bg-[#F5F6F3] px-3 py-2 text-xs text-[#23231F] outline-none focus:border-[#3A4B99]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-[#73736E]">Monthly Capacity</label>
                  <input
                    name="monthlyCapacityUnits"
                    type="number"
                    defaultValue={100}
                    className="mt-1 w-full rounded-lg border border-[#E1E4DD] bg-[#F5F6F3] px-3 py-2 text-xs text-[#23231F] outline-none focus:border-[#3A4B99]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-[#73736E]">Score</label>
                  <select
                    name="leadScore"
                    defaultValue="warm"
                    className="mt-1 w-full rounded-lg border border-[#E1E4DD] bg-[#F5F6F3] px-3 py-2 text-xs text-[#23231F] outline-none focus:border-[#3A4B99]"
                  >
                    <option value="hot">Hot (High Priority)</option>
                    <option value="warm">Warm</option>
                    <option value="cold">Cold</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-[#73736E]">Stage</label>
                  <select
                    name="stage"
                    defaultValue="discovery"
                    className="mt-1 w-full rounded-lg border border-[#E1E4DD] bg-[#F5F6F3] px-3 py-2 text-xs text-[#23231F] outline-none focus:border-[#3A4B99]"
                  >
                    <option value="discovery">Discovery</option>
                    <option value="pitch_in_progress">Pitch in Progress</option>
                    <option value="catalog_audit">Catalog Audit</option>
                    <option value="negotiating">Negotiating</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  name="giCertified"
                  id="giCertifiedAdd"
                  value="true"
                  className="rounded border-[#E1E4DD]"
                />
                <label htmlFor="giCertifiedAdd" className="text-xs text-[#23231F] font-medium">
                  GI Certified / Registered Craft Lineage
                </label>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#73736E]">Assessment Notes</label>
                <textarea
                  name="notes"
                  rows={2}
                  placeholder="Notes on workshop scale, pitch status, catalog availability..."
                  className="mt-1 w-full rounded-lg border border-[#E1E4DD] bg-[#F5F6F3] px-3 py-2 text-xs text-[#23231F] outline-none focus:border-[#3A4B99]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#F0F0EC]">
                <button
                  type="button"
                  onClick={() => setShowAddLeadModal(false)}
                  className="rounded-lg border border-[#E1E4DD] px-4 py-2 text-xs font-semibold text-[#73736E] hover:bg-[#F5F6F3]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-lg bg-[#23231F] px-4 py-2 text-xs font-semibold text-white hover:bg-[#3A3A34] disabled:opacity-50"
                >
                  {isSubmitting ? "Creating..." : "Create lead"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT LEAD MODAL */}
      {editingLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-[#E1E4DD] bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#F0F0EC] pb-3">
              <div>
                <h3 className="text-base font-bold text-[#23231F]">Edit Pipeline Lead</h3>
                <p className="text-xs text-[#73736E]">Update lead evaluation, capacity, and commercial readiness</p>
              </div>
              <button onClick={() => setEditingLead(null)} className="text-[#8C8C85] hover:text-[#23231F]">
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateLead} className="mt-4 space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-[#73736E]">Business / Enterprise Name *</label>
                <input
                  name="businessName"
                  required
                  defaultValue={editingLead.artisan_or_business_name}
                  className="mt-1 w-full rounded-lg border border-[#E1E4DD] bg-[#F5F6F3] px-3 py-2 text-xs text-[#23231F] outline-none focus:border-[#3A4B99]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-[#73736E]">Contact Person *</label>
                  <input
                    name="contactPerson"
                    required
                    defaultValue={editingLead.contact_person}
                    className="mt-1 w-full rounded-lg border border-[#E1E4DD] bg-[#F5F6F3] px-3 py-2 text-xs text-[#23231F] outline-none focus:border-[#3A4B99]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-[#73736E]">Phone *</label>
                  <input
                    name="phone"
                    required
                    defaultValue={editingLead.phone}
                    className="mt-1 w-full rounded-lg border border-[#E1E4DD] bg-[#F5F6F3] px-3 py-2 text-xs text-[#23231F] outline-none focus:border-[#3A4B99]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-[#73736E]">Email</label>
                  <input
                    name="email"
                    type="email"
                    defaultValue={editingLead.email || ""}
                    className="mt-1 w-full rounded-lg border border-[#E1E4DD] bg-[#F5F6F3] px-3 py-2 text-xs text-[#23231F] outline-none focus:border-[#3A4B99]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-[#73736E]">Craft Category</label>
                  <input
                    name="craftCategory"
                    defaultValue={editingLead.craft_category}
                    className="mt-1 w-full rounded-lg border border-[#E1E4DD] bg-[#F5F6F3] px-3 py-2 text-xs text-[#23231F] outline-none focus:border-[#3A4B99]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-[#73736E]">City</label>
                  <input
                    name="city"
                    defaultValue={editingLead.city || ""}
                    className="mt-1 w-full rounded-lg border border-[#E1E4DD] bg-[#F5F6F3] px-3 py-2 text-xs text-[#23231F] outline-none focus:border-[#3A4B99]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-[#73736E]">State</label>
                  <input
                    name="state"
                    defaultValue={editingLead.state || ""}
                    className="mt-1 w-full rounded-lg border border-[#E1E4DD] bg-[#F5F6F3] px-3 py-2 text-xs text-[#23231F] outline-none focus:border-[#3A4B99]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-[#73736E]">Cluster</label>
                  <input
                    name="clusterName"
                    defaultValue={editingLead.cluster_name || ""}
                    className="mt-1 w-full rounded-lg border border-[#E1E4DD] bg-[#F5F6F3] px-3 py-2 text-xs text-[#23231F] outline-none focus:border-[#3A4B99]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-[#73736E]">Monthly Capacity</label>
                  <input
                    name="monthlyCapacityUnits"
                    type="number"
                    defaultValue={editingLead.monthly_capacity_units || 100}
                    className="mt-1 w-full rounded-lg border border-[#E1E4DD] bg-[#F5F6F3] px-3 py-2 text-xs text-[#23231F] outline-none focus:border-[#3A4B99]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-[#73736E]">Score</label>
                  <select
                    name="leadScore"
                    defaultValue={editingLead.lead_score || "warm"}
                    className="mt-1 w-full rounded-lg border border-[#E1E4DD] bg-[#F5F6F3] px-3 py-2 text-xs text-[#23231F] outline-none focus:border-[#3A4B99]"
                  >
                    <option value="hot">Hot (High Priority)</option>
                    <option value="warm">Warm</option>
                    <option value="cold">Cold</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-[#73736E]">Stage</label>
                  <select
                    name="stage"
                    defaultValue={editingLead.stage}
                    className="mt-1 w-full rounded-lg border border-[#E1E4DD] bg-[#F5F6F3] px-3 py-2 text-xs text-[#23231F] outline-none focus:border-[#3A4B99]"
                  >
                    <option value="discovery">Discovery</option>
                    <option value="pitch_in_progress">Pitch in Progress</option>
                    <option value="catalog_audit">Catalog Audit</option>
                    <option value="negotiating">Negotiating</option>
                    <option value="converted">Converted</option>
                    <option value="dropped">Dropped</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  name="giCertified"
                  id="giCertifiedEdit"
                  value="true"
                  defaultChecked={editingLead.gi_certified}
                  className="rounded border-[#E1E4DD]"
                />
                <label htmlFor="giCertifiedEdit" className="text-xs text-[#23231F] font-medium">
                  GI Certified / Registered Craft Lineage
                </label>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#73736E]">Assessment Notes</label>
                <textarea
                  name="notes"
                  rows={2}
                  defaultValue={editingLead.notes || ""}
                  className="mt-1 w-full rounded-lg border border-[#E1E4DD] bg-[#F5F6F3] px-3 py-2 text-xs text-[#23231F] outline-none focus:border-[#3A4B99]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#F0F0EC]">
                <button
                  type="button"
                  onClick={() => setEditingLead(null)}
                  className="rounded-lg border border-[#E1E4DD] px-4 py-2 text-xs font-semibold text-[#73736E] hover:bg-[#F5F6F3]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#23231F] px-4 py-2 text-xs font-semibold text-white hover:bg-[#3A3A34] disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Save className="h-3.5 w-3.5" />
                  )}
                  <span>Save changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function GiStamp() {
  return (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-md border border-[#3F7A55]/30 bg-[#EAF4EC] px-1.5 py-0.5 text-[9px] font-bold text-[#2E5B3F]">
      <Leaf className="h-2.5 w-2.5" />
      GI
    </span>
  );
}

function StageSelect({
  value,
  disabled,
  onChange,
}: {
  value: CRMLeadStage;
  disabled: boolean;
  onChange: (v: CRMLeadStage) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as CRMLeadStage)}
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

function ConvertButton({ disabled, onClick }: { disabled: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-1.5 rounded-lg bg-[#3A4B99] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#2E3C80] disabled:cursor-not-allowed disabled:opacity-40"
    >
      <span>Create deal</span>
      <Briefcase className="h-3 w-3" />
    </button>
  );
}
