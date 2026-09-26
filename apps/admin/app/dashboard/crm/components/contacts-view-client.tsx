"use client";

import { useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Users,
  UserPlus,
  ArrowRight,
  Building,
  Phone,
  Mail,
  MapPin,
  Search,
  LayoutGrid,
  List,
  SlidersHorizontal,
  RotateCcw,
  X,
  Edit,
  Loader2,
  Save,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  ExternalLink,
  Clock,
} from "lucide-react";
import type { CRMContact, CRMContactStatus, SellerOnboardingTracker, OnboardingStage } from "@genz/types";
import { CRMNavHeader } from "./crm-nav-header";
import {
  createContactAction,
  updateContactAction,
  convertContactToLeadAction,
} from "../actions";

interface ContactsViewClientProps {
  contacts: CRMContact[];
  onboardings?: SellerOnboardingTracker[];
  counts?: {
    contacts?: number;
    leads?: number;
    deals?: number;
    onboardings?: number;
  };
}

/* Authentic Monochromatic Progression Stages according to docs/DESIGN.md */
const CONTACT_STAGES = [
  {
    key: "new",
    label: "New Scouted",
    containerBg: "#FAF8F4",
    borderColor: "#E5E5E0",
    textColor: "#52524E",
    indicatorColor: "#8C8C85",
  },
  {
    key: "contacted",
    label: "Contacted",
    containerBg: "#FAF8F4",
    borderColor: "#E5E5E0",
    textColor: "#1A1A18",
    indicatorColor: "#52524E",
  },
  {
    key: "qualified",
    label: "Qualified",
    containerBg: "#FAF8F4",
    borderColor: "#C89D32",
    textColor: "#1A1A18",
    indicatorColor: "#C89D32",
  },
] as const;

const DISQUALIFIED = {
  key: "disqualified" as const,
  label: "Disqualified",
  containerBg: "#FFF1F2",
  borderColor: "#FECDD3",
  textColor: "#BE123C",
  indicatorColor: "#E11D48",
};

const STATUS_STYLE_MAP: Record<
  string,
  { key: string; label: string; containerBg: string; borderColor: string; textColor: string; indicatorColor: string }
> = {
  ...Object.fromEntries(CONTACT_STAGES.map((s) => [s.key, s])),
  [DISQUALIFIED.key]: DISQUALIFIED,
};

const ONBOARDING_STAGE_LABELS: Record<OnboardingStage, string> = {
  kyc_documents: "KYC Verification",
  catalog_ingestion: "Catalog Ingestion",
  quality_packaging_check: "Quality & Packaging Check",
  credentials_sent: "Credentials Setup",
  live_on_marketplace: "Live on Storefront",
};

export function ContactsViewClient({
  contacts: initialContacts,
  onboardings = [],
  counts,
}: ContactsViewClientProps) {
  const router = useRouter();
  // Modal & Drawer States
  const [showAddContactDrawer, setShowAddContactDrawer] = useState(false);
  const [editingContact, setEditingContact] = useState<CRMContact | null>(null);
  const [selectedContact, setSelectedContact] = useState<CRMContact | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // View Mode: tile (grid) vs list (table)
  const [viewMode, setViewMode] = useState<"tile" | "list">("tile");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all"); // "all", "onboarded", "new", "contacted", "qualified", "disqualified"
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [stateFilter, setStateFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"recent" | "name_asc" | "name_desc">("recent");

  // Map onboardings by normalized identifiers for fast cross-referencing
  const onboardingLookup = useMemo(() => {
    const byEmail = new Map<string, SellerOnboardingTracker>();
    const byPhone = new Map<string, SellerOnboardingTracker>();
    const byName = new Map<string, SellerOnboardingTracker>();

    onboardings.forEach((o) => {
      if (o.email) byEmail.set(o.email.toLowerCase().trim(), o);
      if (o.phone) byPhone.set(o.phone.replace(/[^0-9]/g, ""), o);
      if (o.contact_person) byName.set(o.contact_person.toLowerCase().trim(), o);
      if (o.seller_name) byName.set(o.seller_name.toLowerCase().trim(), o);
    });

    return { byEmail, byPhone, byName };
  }, [onboardings]);

  // Helper to find matched onboarding record for a contact
  const getContactOnboarding = useCallback((c: CRMContact): SellerOnboardingTracker | undefined => {
    const emailKey = c.email ? c.email.toLowerCase().trim() : "";
    const phoneDigits = c.phone ? c.phone.replace(/[^0-9]/g, "") : "";
    const nameKey = c.name ? c.name.toLowerCase().trim() : "";
    const businessKey = c.business_name ? c.business_name.toLowerCase().trim() : "";

    if (emailKey && onboardingLookup.byEmail.has(emailKey)) {
      return onboardingLookup.byEmail.get(emailKey);
    }
    if (phoneDigits && onboardingLookup.byPhone.has(phoneDigits)) {
      return onboardingLookup.byPhone.get(phoneDigits);
    }
    if (nameKey && onboardingLookup.byName.has(nameKey)) {
      return onboardingLookup.byName.get(nameKey);
    }
    if (businessKey && onboardingLookup.byName.has(businessKey)) {
      return onboardingLookup.byName.get(businessKey);
    }
    return undefined;
  }, [onboardingLookup]);

  // Merge contacts with onboardings & ensure all onboarded sellers are represented
  const mergedContacts: CRMContact[] = useMemo(() => {
    const existingList = [...initialContacts];
    const existingEmails = new Set(
      existingList.map((c) => c.email?.toLowerCase().trim()).filter(Boolean)
    );
    const existingPhones = new Set(
      existingList.map((c) => c.phone?.replace(/[^0-9]/g, "")).filter(Boolean)
    );
    const existingNames = new Set(
      existingList.map((c) => c.name?.toLowerCase().trim()).filter(Boolean)
    );

    // Enrich existing contacts with fallback data from onboardings if missing
    const enriched = existingList.map((c) => {
      const matched = getContactOnboarding(c);
      if (!matched) return c;

      return {
        ...c,
        business_name: c.business_name || matched.seller_name || null,
        phone: c.phone || matched.phone,
        email: c.email || matched.email || null,
        craft_category: c.craft_category || matched.craft_category || null,
        city: c.city || matched.city || null,
        state: c.state || matched.state || null,
        cluster_name:
          c.cluster_name ||
          (matched.craft_category?.toLowerCase().includes("kondapalli")
            ? "Kondapalli Craft Village"
            : matched.craft_category?.toLowerCase().includes("etikoppaka")
            ? "Etikoppaka Cluster"
            : null),
        notes: c.notes || matched.notes || null,
      };
    });

    // Synthesize contacts for any onboarded sellers not yet in the contacts directory
    onboardings.forEach((o) => {
      const email = o.email?.toLowerCase().trim();
      const phoneDigits = o.phone?.replace(/[^0-9]/g, "");
      const name = o.contact_person?.toLowerCase().trim();
      const business = o.seller_name?.toLowerCase().trim();

      const exists =
        (email && existingEmails.has(email)) ||
        (phoneDigits && existingPhones.has(phoneDigits)) ||
        (name && existingNames.has(name)) ||
        (business && existingNames.has(business));

      if (!exists) {
        const syntheticContact: CRMContact = {
          id: `onboarded-contact-${o.id}`,
          name: o.contact_person || o.seller_name,
          business_name: o.seller_name,
          phone: o.phone || "+91 00000 00000",
          email: o.email || null,
          craft_category: o.craft_category || "Traditional Craft",
          city: o.city || "Andhra Pradesh",
          state: o.state || "Andhra Pradesh",
          cluster_name: o.craft_category?.toLowerCase().includes("kondapalli")
            ? "Kondapalli Craft Village"
            : "Etikoppaka Cluster",
          source: "cluster_scouting",
          status: "qualified",
          notes: o.notes || "Onboarded master artisan workshop.",
          created_at: o.created_at || new Date().toISOString(),
          updated_at: o.updated_at || new Date().toISOString(),
        };
        enriched.unshift(syntheticContact);
      }
    });

    return enriched;
  }, [initialContacts, onboardings, getContactOnboarding]);

  const handleCreateContact = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    await createContactAction(formData);
    setIsSubmitting(false);
    setShowAddContactDrawer(false);
  };

  const handleUpdateContact = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingContact) return;
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    await updateContactAction(editingContact.id, {
      name: (formData.get("name") as string)?.trim(),
      business_name: ((formData.get("business_name") as string) || (formData.get("businessName") as string))?.trim() || null,
      phone: (formData.get("phone") as string)?.trim(),
      email: (formData.get("email") as string)?.trim() || null,
      craft_category: ((formData.get("craft_category") as string) || (formData.get("craftCategory") as string))?.trim() || null,
      city: (formData.get("city") as string)?.trim() || null,
      state: (formData.get("state") as string)?.trim() || null,
      cluster_name: ((formData.get("cluster_name") as string) || (formData.get("clusterName") as string))?.trim() || null,
      source: (formData.get("source") as string) || "cluster_scouting",
      status: (formData.get("status") as CRMContactStatus) || "new",
      notes: (formData.get("notes") as string)?.trim() || null,
    });
    setIsSubmitting(false);
    setEditingContact(null);
  };

  const handleConvertToLead = async (contactId: string) => {
    setIsSubmitting(true);
    await convertContactToLeadAction(contactId);
    setIsSubmitting(false);
    router.push("/dashboard/crm/leads");
  };

  // Derive unique filter options
  const uniqueCategories = Array.from(
    new Set(mergedContacts.map((c) => c.craft_category).filter(Boolean))
  ) as string[];

  const uniqueStates = Array.from(
    new Set(mergedContacts.map((c) => c.state).filter(Boolean))
  ) as string[];

  const uniqueSources = Array.from(
    new Set(mergedContacts.map((c) => c.source).filter(Boolean))
  ) as string[];

  const statusCounts = useMemo(() => {
    const map: Record<string, number> = {};
    [...CONTACT_STAGES, DISQUALIFIED].forEach((s) => (map[s.key] = 0));
    map["onboarded"] = 0;

    mergedContacts.forEach((c) => {
      map[c.status] = (map[c.status] || 0) + 1;
      if (getContactOnboarding(c)) {
        map["onboarded"] = (map["onboarded"] || 0) + 1;
      }
    });

    return map;
  }, [mergedContacts, getContactOnboarding]);

  const activeFilterCount =
    (statusFilter !== "all" ? 1 : 0) +
    (categoryFilter !== "all" ? 1 : 0) +
    (stateFilter !== "all" ? 1 : 0) +
    (sourceFilter !== "all" ? 1 : 0) +
    (searchQuery.trim().length > 0 ? 1 : 0) +
    (sortBy !== "recent" ? 1 : 0);

  const resetFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setCategoryFilter("all");
    setStateFilter("all");
    setSourceFilter("all");
    setSortBy("recent");
  };

  const filteredContacts = mergedContacts
    .filter((c) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        c.name.toLowerCase().includes(q) ||
        (c.business_name && c.business_name.toLowerCase().includes(q)) ||
        (c.craft_category && c.craft_category.toLowerCase().includes(q)) ||
        (c.city && c.city.toLowerCase().includes(q)) ||
        (c.state && c.state.toLowerCase().includes(q)) ||
        (c.phone && c.phone.includes(q)) ||
        (c.email && c.email.toLowerCase().includes(q));

      const matchesStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "onboarded"
          ? Boolean(getContactOnboarding(c))
          : c.status === statusFilter;

      const matchesCategory =
        categoryFilter === "all" || c.craft_category === categoryFilter;
      const matchesState = stateFilter === "all" || c.state === stateFilter;
      const matchesSource = sourceFilter === "all" || c.source === sourceFilter;

      return (
        matchesQuery &&
        matchesStatus &&
        matchesCategory &&
        matchesState &&
        matchesSource
      );
    })
    .sort((a, b) => {
      if (sortBy === "name_asc") return a.name.localeCompare(b.name);
      if (sortBy === "name_desc") return b.name.localeCompare(a.name);
      return (
        new Date(b.created_at || "").getTime() -
        new Date(a.created_at || "").getTime()
      );
    });

  return (
    <div className="space-y-4 text-[#1A1A18]">
      {/* Shared CRM Navigation Header */}
      <CRMNavHeader
        eyebrow="Seller CRM Directory"
        title="Seller Contacts"
        description="Scout, record, and evaluate prospect master artisans, registered GI cooperatives, and craft producers across Indian clusters."
        counts={{
          contacts: mergedContacts.length,
          leads: counts?.leads,
          deals: counts?.deals,
          onboardings: counts?.onboardings || onboardings.length,
        }}
        actions={
          <button
            onClick={() => setShowAddContactDrawer(true)}
            className="inline-flex items-center gap-2 rounded-full bg-[#1A1A18] px-4 py-1.5 text-xs font-semibold text-white shadow-xs transition hover:bg-[#2E2E2B] disabled:opacity-60"
          >
            <UserPlus className="h-3.5 w-3.5" />
            <span>Add contact</span>
          </button>
        }
      />

      {/* UNIFIED TOOLBAR: Search, Filters, View Modes & Status Progression */}
      <div className="space-y-2.5 rounded-xl border border-[#E5E5E0] bg-white p-2.5 sm:p-3 shadow-xs">
        {/* Top Control Bar: Search Input + Advanced Filter Toggle + View Mode Toggle */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#52524E]" />
            <input
              type="text"
              placeholder="Search artisan, business, cluster, phone, city…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-[#E5E5E0] bg-[#FAF8F4]/60 py-1.5 pl-9 pr-8 text-xs text-[#1A1A18] placeholder-[#52524E]/60 outline-none transition focus:border-[#1A1A18] focus:bg-white focus:ring-1 focus:ring-[#1A1A18]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-[#52524E] hover:bg-[#E5E5E0] hover:text-[#1A1A18] transition"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* Filter Toggle Button */}
            <button
              type="button"
              onClick={() => setShowAdvancedFilters((prev) => !prev)}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                showAdvancedFilters || activeFilterCount > 0
                  ? "border-[#1A1A18] bg-[#1A1A18] text-white"
                  : "border-[#E5E5E0] bg-white text-[#1A1A18] hover:bg-[#FAF8F4]"
              }`}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="ml-1 rounded-full bg-white/20 text-white px-1.5 py-0.2 text-[10px] font-bold font-mono">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-[#52524E] hover:bg-[#FAF8F4] hover:text-[#1A1A18] transition"
                title="Reset all filters"
              >
                <RotateCcw className="h-3 w-3" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            )}

            {/* Segmented Button for View Toggle */}
            <div className="flex items-center rounded-lg border border-[#E5E5E0] bg-[#FAF8F4] p-0.5">
              <button
                type="button"
                onClick={() => setViewMode("tile")}
                className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition ${
                  viewMode === "tile"
                    ? "bg-white text-[#1A1A18] shadow-xs"
                    : "text-[#52524E] hover:text-[#1A1A18]"
                }`}
                title="Tile view"
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Tile</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition ${
                  viewMode === "list"
                    ? "bg-white text-[#1A1A18] shadow-xs"
                    : "text-[#52524E] hover:text-[#1A1A18]"
                }`}
                title="List view"
              >
                <List className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">List</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Control Bar: Status Filter Chips */}
        <div className="flex flex-wrap items-center gap-1.5 border-t border-[#F0EFEA] pt-2">
          {/* All Contacts Chip */}
          <button
            onClick={() => setStatusFilter("all")}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all ${
              statusFilter === "all"
                ? "bg-[#1A1A18] text-white shadow-xs"
                : "border border-[#E5E5E0] bg-[#FAF8F4] text-[#52524E] hover:border-[#1A1A18]/40 hover:text-[#1A1A18]"
            }`}
          >
            <span>All contacts</span>
            <span
              className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono ${
                statusFilter === "all"
                  ? "bg-white/20 text-white"
                  : "bg-white text-[#52524E] border border-[#E5E5E0]"
              }`}
            >
              {mergedContacts.length}
            </span>
          </button>

          {/* Onboarded Sellers Chip with Craft Gold Accent (#C89D32) */}
          <button
            onClick={() => setStatusFilter("onboarded")}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all border ${
              statusFilter === "onboarded"
                ? "bg-[#1A1A18] text-[#C89D32] border-[#C89D32] shadow-xs"
                : "border-[#C89D32]/40 bg-[#FAF8F4] text-[#C89D32] hover:bg-[#C89D32]/10"
            }`}
          >
            <Sparkles className="h-3 w-3 text-[#C89D32] fill-current" />
            <span>Onboarded Sellers</span>
            <span
              className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono font-bold ${
                statusFilter === "onboarded"
                  ? "bg-[#C89D32]/20 text-[#C89D32]"
                  : "bg-white text-[#C89D32] border border-[#C89D32]/30"
              }`}
            >
              {statusCounts["onboarded"] || 0}
            </span>
          </button>

          {/* Contact Progression Stages */}
          {CONTACT_STAGES.map((s) => {
            const active = statusFilter === s.key;
            return (
              <button
                key={s.key}
                onClick={() => setStatusFilter(s.key)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all border ${
                  active
                    ? "bg-[#1A1A18] text-white border-[#1A1A18] shadow-xs"
                    : "border-[#E5E5E0] bg-[#FAF8F4] text-[#52524E] hover:border-[#1A1A18]/40 hover:text-[#1A1A18]"
                }`}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full shrink-0"
                  style={{ background: s.indicatorColor }}
                />
                <span>{s.label}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono ${
                    active
                      ? "bg-white/20 text-white"
                      : "bg-white text-[#52524E] border border-[#E5E5E0]"
                  }`}
                >
                  {statusCounts[s.key] || 0}
                </span>
              </button>
            );
          })}

          {/* Disqualified Chip with Destructive Rose (#E11D48) */}
          <button
            onClick={() => setStatusFilter(DISQUALIFIED.key)}
            className={`ml-auto inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all border ${
              statusFilter === DISQUALIFIED.key
                ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                : "border-rose-200 bg-rose-50/60 text-rose-700 hover:bg-rose-100"
            }`}
          >
            <span>Disqualified</span>
            <span
              className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono ${
                statusFilter === DISQUALIFIED.key
                  ? "bg-white/20 text-white"
                  : "bg-white text-rose-700 border border-rose-200"
              }`}
            >
              {statusCounts[DISQUALIFIED.key] || 0}
            </span>
          </button>
        </div>

        {/* Expandable Advanced Filter Options */}
        {showAdvancedFilters && (
          <div className="grid grid-cols-1 gap-3 border-t border-[#E5E5E0] pt-3.5 sm:grid-cols-2 md:grid-cols-4">
            <div>
              <label className="mb-1 block text-[11px] font-semibold text-[#52524E]">
                Craft category
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full rounded-xl border border-[#E5E5E0] bg-[#FAF8F4]/50 px-3 py-2 text-xs text-[#1A1A18] outline-none transition focus:border-[#1A1A18] focus:bg-white focus:ring-1 focus:ring-[#1A1A18]"
              >
                <option value="all">All categories ({uniqueCategories.length})</option>
                {uniqueCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-[11px] font-semibold text-[#52524E]">
                State / region
              </label>
              <select
                value={stateFilter}
                onChange={(e) => setStateFilter(e.target.value)}
                className="w-full rounded-xl border border-[#E5E5E0] bg-[#FAF8F4]/50 px-3 py-2 text-xs text-[#1A1A18] outline-none transition focus:border-[#1A1A18] focus:bg-white focus:ring-1 focus:ring-[#1A1A18]"
              >
                <option value="all">All states ({uniqueStates.length})</option>
                {uniqueStates.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-[11px] font-semibold text-[#52524E]">
                Scouting source
              </label>
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="w-full rounded-xl border border-[#E5E5E0] bg-[#FAF8F4]/50 px-3 py-2 text-xs text-[#1A1A18] outline-none transition focus:border-[#1A1A18] focus:bg-white focus:ring-1 focus:ring-[#1A1A18]"
              >
                <option value="all">All sources</option>
                {uniqueSources.map((src) => (
                  <option key={src} value={src}>
                    {src.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-[11px] font-semibold text-[#52524E]">
                Sort by
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "recent" | "name_asc" | "name_desc")}
                className="w-full rounded-xl border border-[#E5E5E0] bg-[#FAF8F4]/50 px-3 py-2 text-xs text-[#1A1A18] outline-none transition focus:border-[#1A1A18] focus:bg-white focus:ring-1 focus:ring-[#1A1A18]"
              >
                <option value="recent">Recently added</option>
                <option value="name_asc">Artisan / Seller name, A–Z</option>
                <option value="name_desc">Artisan / Seller name, Z–A</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* RESULTS: LIST VS TILE */}
      {viewMode === "list" ? (
        /* LIST / TABLE VIEW */
        <div className="overflow-hidden rounded-2xl border border-[#E5E5E0] bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#E5E5E0] bg-[#FAF8F4] text-[11px] font-semibold text-[#52524E]">
                <tr>
                  <th className="px-4 py-3.5">Artisan &amp; Workshop</th>
                  <th className="px-4 py-3.5">Contact Details</th>
                  <th className="px-4 py-3.5">Craft Category</th>
                  <th className="px-4 py-3.5">Cluster Location</th>
                  <th className="px-4 py-3.5">Status &amp; Onboarding</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E0]/60">
                {filteredContacts.map((contact) => {
                  const style = STATUS_STYLE_MAP[contact.status] || STATUS_STYLE_MAP.new;
                  const onboarding = getContactOnboarding(contact);

                  return (
                    <tr
                      key={contact.id}
                      className="hover:bg-[#FAF8F4]/60 transition"
                    >
                      {/* Name & Business */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-[#1A1A18] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                            {contact.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-semibold text-[#1A1A18] flex items-center gap-2">
                              <span>{contact.name}</span>
                              {onboarding && (
                                <span
                                  className="inline-flex items-center gap-1 rounded-full border border-[#C89D32]/40 bg-[#FAF8F4] px-2 py-0.5 text-[10px] font-bold text-[#C89D32]"
                                  title="Seller enrolled in onboarding pipeline"
                                >
                                  <Sparkles className="h-2.5 w-2.5 fill-current" />
                                  <span>Onboarded</span>
                                </span>
                              )}
                            </div>
                            {contact.business_name && (
                              <div className="mt-0.5 flex items-center gap-1 text-[11px] text-[#52524E]">
                                <Building className="h-3 w-3 shrink-0 text-[#8C8C85]" />
                                <span>{contact.business_name}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Contact Channels */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-[#1A1A18]">
                            {contact.phone}
                          </span>
                        </div>
                        {contact.email && (
                          <div className="mt-0.5 text-[11px] text-[#52524E]">
                            {contact.email}
                          </div>
                        )}
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3.5 text-[#52524E]">
                        <span className="rounded-full bg-[#FAF8F4] px-2.5 py-1 text-[11px] font-medium text-[#1A1A18] border border-[#E5E5E0]">
                          {contact.craft_category || "Traditional Crafts"}
                        </span>
                      </td>

                      {/* Location */}
                      <td className="px-4 py-3.5 text-[#52524E]">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-[#8C8C85] shrink-0" />
                          <span>
                            {[contact.cluster_name, contact.city, contact.state]
                              .filter(Boolean)
                              .join(", ") || "Andhra Pradesh"}
                          </span>
                        </div>
                      </td>

                      {/* Status & Onboarding Stage */}
                      <td className="px-4 py-3.5">
                        <div className="flex flex-col gap-1 items-start">
                          <span
                            className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold capitalize"
                            style={{
                              background: style.containerBg,
                              borderColor: style.borderColor,
                              color: style.textColor,
                            }}
                          >
                            <span
                              className="h-1.5 w-1.5 rounded-full"
                              style={{ background: style.indicatorColor }}
                            />
                            <span>{contact.status}</span>
                          </span>

                          {onboarding && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[#C89D32] bg-[#FAF8F4] rounded-full border border-[#C89D32]/30 px-2 py-0.5">
                              {onboarding.live_on_marketplace ? (
                                <>
                                  <CheckCircle2 className="h-3 w-3 text-[#C89D32]" />
                                  <span>Live in Storefront</span>
                                </>
                              ) : (
                                <>
                                  <Clock className="h-3 w-3 text-[#C89D32]" />
                                  <span>{ONBOARDING_STAGE_LABELS[onboarding.current_stage]}</span>
                                </>
                              )}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Action buttons */}
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedContact(contact)}
                            className="rounded-full border border-[#E5E5E0] bg-white px-3 py-1 text-xs font-semibold text-[#1A1A18] hover:bg-[#FAF8F4] transition"
                          >
                            Details
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingContact(contact)}
                            className="inline-flex items-center gap-1 rounded-full border border-[#E5E5E0] bg-white px-3 py-1 text-xs font-semibold text-[#1A1A18] hover:bg-[#FAF8F4] transition"
                          >
                            <Edit className="h-3 w-3" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleConvertToLead(contact.id)}
                            disabled={isSubmitting}
                            className="inline-flex items-center gap-1 rounded-full bg-[#1A1A18] px-3.5 py-1 text-xs font-semibold text-white transition hover:bg-[#2E2E2B] disabled:cursor-not-allowed disabled:opacity-40 shadow-xs"
                          >
                            <span>Promote</span>
                            <ArrowRight className="h-3 w-3" />
                          </button>
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
        /* TILE / GRID VIEW */
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredContacts.map((contact) => {
            const style = STATUS_STYLE_MAP[contact.status] || STATUS_STYLE_MAP.new;
            const onboarding = getContactOnboarding(contact);

            return (
              <div
                key={contact.id}
                className="group relative flex flex-col justify-between rounded-2xl border border-[#E5E5E0] bg-white p-5 shadow-xs transition-all duration-200 hover:border-[#1A1A18]/30 hover:shadow-md"
              >
                <div className="space-y-3.5">
                  {/* Card Header with Initial Avatar & Status */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-11 w-11 rounded-full bg-[#1A1A18] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                        {contact.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <h3 className="truncate text-base font-bold text-[#1A1A18]">
                          {contact.name}
                        </h3>
                        {contact.business_name && (
                          <p className="mt-0.5 truncate text-xs font-medium text-[#52524E] flex items-center gap-1.5">
                            <Building className="h-3 w-3 shrink-0 text-[#8C8C85]" />
                            <span>{contact.business_name}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <span
                        className="inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold capitalize"
                        style={{
                          background: style.containerBg,
                          borderColor: style.borderColor,
                          color: style.textColor,
                        }}
                      >
                        <span
                          className="h-1.5 w-1.5 rounded-full"
                          style={{ background: style.indicatorColor }}
                        />
                        <span>{contact.status}</span>
                      </span>

                      {onboarding && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-[#C89D32]/40 bg-[#FAF8F4] px-2 py-0.5 text-[10px] font-bold text-[#C89D32] shadow-xs">
                          <Sparkles className="h-2.5 w-2.5 fill-current" />
                          <span>Onboarded</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Onboarding Stage Banner if Onboarded */}
                  {onboarding && (
                    <div className="rounded-xl bg-[#FAF8F4] p-2.5 border border-[#C89D32]/30 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        {onboarding.live_on_marketplace ? (
                          <ShieldCheck className="h-4 w-4 text-[#C89D32] shrink-0" />
                        ) : (
                          <Clock className="h-4 w-4 text-[#C89D32] shrink-0" />
                        )}
                        <div>
                          <p className="text-[11px] font-bold text-[#1A1A18]">
                            {onboarding.live_on_marketplace
                              ? "Live in Storefront"
                              : ONBOARDING_STAGE_LABELS[onboarding.current_stage]}
                          </p>
                          <p className="text-[10px] text-[#52524E]">
                            KYC: {onboarding.kyc_completed ? "✓ Done" : "Pending"} • Catalog:{" "}
                            {onboarding.catalog_completed ? "✓ Ready" : "Pending"}
                          </p>
                        </div>
                      </div>
                      <Link
                        href="/dashboard/crm/onboarding"
                        className="rounded-full bg-white p-1 text-[#1A1A18] border border-[#E5E5E0] hover:bg-[#FAF8F4] transition"
                        title="View in Onboarding Process"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </div>
                  )}

                  {/* Details Body */}
                  <div className="space-y-2 pt-1 text-xs text-[#52524E]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 shrink-0 text-[#8C8C85]" />
                        <a
                          href={`tel:${contact.phone}`}
                          className="font-mono hover:text-[#1A1A18]"
                        >
                          {contact.phone}
                        </a>
                      </div>
                    </div>

                    {contact.email && (
                      <div className="flex items-center gap-2 truncate">
                        <Mail className="h-3.5 w-3.5 shrink-0 text-[#8C8C85]" />
                        <a
                          href={`mailto:${contact.email}`}
                          className="truncate hover:text-[#1A1A18]"
                        >
                          {contact.email}
                        </a>
                      </div>
                    )}

                    {(contact.city || contact.cluster_name || contact.state) && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-[#8C8C85]" />
                        <span className="truncate">
                          {[contact.cluster_name, contact.city, contact.state]
                            .filter(Boolean)
                            .join(", ")}
                        </span>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {contact.craft_category && (
                        <span className="rounded-full bg-[#FAF8F4] border border-[#E5E5E0] px-2.5 py-0.5 text-[11px] font-medium text-[#1A1A18]">
                          {contact.craft_category}
                        </span>
                      )}
                      {contact.source && (
                        <span className="rounded-full bg-[#FAF8F4] border border-[#E5E5E0] px-2.5 py-0.5 text-[11px] text-[#52524E] capitalize">
                          {contact.source.replace(/_/g, " ")}
                        </span>
                      )}
                    </div>
                  </div>

                  {contact.notes && (
                    <p className="mt-2 rounded-xl bg-[#FAF8F4] p-3 text-[11px] italic text-[#52524E] border border-[#E5E5E0] line-clamp-2">
                      “{contact.notes}”
                    </p>
                  )}
                </div>

                {/* Card Footer with Pill Action Buttons */}
                <div className="mt-4 flex items-center justify-between border-t border-[#E5E5E0] pt-3.5">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedContact(contact)}
                      className="rounded-full border border-[#E5E5E0] bg-white px-3 py-1 text-xs font-semibold text-[#1A1A18] hover:bg-[#FAF8F4] transition"
                    >
                      Details
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingContact(contact)}
                      className="inline-flex items-center gap-1 rounded-full border border-[#E5E5E0] bg-white px-3 py-1 text-xs font-semibold text-[#1A1A18] hover:bg-[#FAF8F4] transition"
                    >
                      <Edit className="h-3 w-3" />
                      <span>Edit</span>
                    </button>
                  </div>

                  <button
                    onClick={() => handleConvertToLead(contact.id)}
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-1.5 rounded-full bg-[#1A1A18] px-4 py-1.5 text-xs font-semibold text-white shadow-xs transition hover:bg-[#2E2E2B] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <span>Promote</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* EMPTY STATE */}
      {filteredContacts.length === 0 && (
        <div className="rounded-2xl border border-[#E5E5E0] bg-white p-12 text-center shadow-xs">
          <Users className="mx-auto h-8 w-8 text-[#8C8C85]" />
          <h4 className="mt-3 text-base font-bold text-[#1A1A18]">
            No contacts match these filters
          </h4>
          <p className="mx-auto mt-1 max-w-sm text-xs text-[#52524E]">
            {activeFilterCount > 0
              ? "Clear your filter criteria or search keyword to see contacts in your directory."
              : "Add your first prospect seller or master artisan contact to begin building the directory."}
          </p>
          {activeFilterCount > 0 && (
            <button
              onClick={resetFilters}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#1A1A18] px-5 py-2 text-xs font-semibold text-white hover:bg-[#2E2E2B] transition shadow-xs"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Clear filters</span>
            </button>
          )}
        </div>
      )}

      {/* SLIDE-OVER DRAWER (docs/DESIGN.md Section 6 Standard) - ADD CONTACT */}
      {showAddContactDrawer && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop: fixed inset-0 bg-[#1A1A18]/40 backdrop-blur-xs */}
          <div
            onClick={() => setShowAddContactDrawer(false)}
            className="fixed inset-0 bg-[#1A1A18]/40 backdrop-blur-xs transition-opacity duration-200"
          />

          {/* Right-Aligned Drawer Panel: border-l border-[#E5E5E0] bg-white text-[#1A1A18] shadow-2xl */}
          <div className="fixed inset-y-0 right-0 z-50 flex max-w-full pl-10">
            <div className="w-screen max-w-lg md:max-w-xl border-l border-[#E5E5E0] bg-white text-[#1A1A18] shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-200">
              {/* Header: border-b border-[#E5E5E0] bg-[#FAF8F4] px-6 py-4 */}
              <div className="flex items-center justify-between border-b border-[#E5E5E0] bg-[#FAF8F4] px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-[#1A1A18] text-white flex items-center justify-center font-bold shadow-xs">
                    <UserPlus className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#1A1A18]">
                      Add Seller Contact
                    </h3>
                    <p className="text-xs text-[#52524E]">
                      Register a scouted artisan workshop or producer
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAddContactDrawer(false)}
                  className="rounded-full p-2 text-[#52524E] hover:bg-[#E5E5E0] hover:text-[#1A1A18] transition"
                  title="Close sideview drawer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Drawer Body (Scrollable form with DESIGN.md Input standards) */}
              <form
                onSubmit={handleCreateContact}
                className="flex-1 overflow-y-auto px-6 py-5 space-y-5"
              >
                {/* Group 1: Artisan & Workshop Identity */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#1A1A18]">
                      1. Artisan &amp; Business
                    </span>
                    <div className="h-px flex-1 bg-[#E5E5E0]" />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1A1A18]">
                      Artisan / Contact Person Name <span className="text-rose-600">*</span>
                    </label>
                    <input
                      name="name"
                      required
                      placeholder="e.g. Polumuri Nageswara Rao"
                      className="mt-1.5 w-full rounded-xl border border-[#E5E5E0] bg-[#FAF8F4]/50 px-3.5 py-2.5 text-xs text-[#1A1A18] outline-none transition focus:border-[#1A1A18] focus:bg-white focus:ring-1 focus:ring-[#1A1A18]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1A1A18]">
                      Business / Guild / Workshop Name
                    </label>
                    <input
                      name="business_name"
                      placeholder="e.g. Sri Venkateswara Kondapalli Toys Cooperative"
                      className="mt-1.5 w-full rounded-xl border border-[#E5E5E0] bg-[#FAF8F4]/50 px-3.5 py-2.5 text-xs text-[#1A1A18] outline-none transition focus:border-[#1A1A18] focus:bg-white focus:ring-1 focus:ring-[#1A1A18]"
                    />
                  </div>
                </div>

                {/* Group 2: Direct Communication Channels */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#1A1A18]">
                      2. Communication Channels
                    </span>
                    <div className="h-px flex-1 bg-[#E5E5E0]" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#1A1A18]">
                        Phone Number <span className="text-rose-600">*</span>
                      </label>
                      <input
                        name="phone"
                        required
                        placeholder="+91 94401 23456"
                        className="mt-1.5 w-full rounded-xl border border-[#E5E5E0] bg-[#FAF8F4]/50 px-3.5 py-2.5 text-xs text-[#1A1A18] outline-none transition focus:border-[#1A1A18] focus:bg-white focus:ring-1 focus:ring-[#1A1A18] font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#1A1A18]">
                        Email Address
                      </label>
                      <input
                        name="email"
                        type="email"
                        placeholder="artisan@guild.in"
                        className="mt-1.5 w-full rounded-xl border border-[#E5E5E0] bg-[#FAF8F4]/50 px-3.5 py-2.5 text-xs text-[#1A1A18] outline-none transition focus:border-[#1A1A18] focus:bg-white focus:ring-1 focus:ring-[#1A1A18]"
                      />
                    </div>
                  </div>
                </div>

                {/* Group 3: Craft Lineage & Regional Geography */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#1A1A18]">
                      3. Craft &amp; Location
                    </span>
                    <div className="h-px flex-1 bg-[#E5E5E0]" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#1A1A18]">
                        Craft Category
                      </label>
                      <input
                        name="craft_category"
                        placeholder="e.g. Kondapalli Toys, Etikoppaka"
                        className="mt-1.5 w-full rounded-xl border border-[#E5E5E0] bg-[#FAF8F4]/50 px-3.5 py-2.5 text-xs text-[#1A1A18] outline-none transition focus:border-[#1A1A18] focus:bg-white focus:ring-1 focus:ring-[#1A1A18]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#1A1A18]">
                        Cluster / Village Name
                      </label>
                      <input
                        name="cluster_name"
                        placeholder="e.g. Kondapalli Craft Village"
                        className="mt-1.5 w-full rounded-xl border border-[#E5E5E0] bg-[#FAF8F4]/50 px-3.5 py-2.5 text-xs text-[#1A1A18] outline-none transition focus:border-[#1A1A18] focus:bg-white focus:ring-1 focus:ring-[#1A1A18]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#1A1A18]">
                        City / District
                      </label>
                      <input
                        name="city"
                        placeholder="e.g. Vijayawada, Visakhapatnam"
                        className="mt-1.5 w-full rounded-xl border border-[#E5E5E0] bg-[#FAF8F4]/50 px-3.5 py-2.5 text-xs text-[#1A1A18] outline-none transition focus:border-[#1A1A18] focus:bg-white focus:ring-1 focus:ring-[#1A1A18]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#1A1A18]">
                        State
                      </label>
                      <input
                        name="state"
                        placeholder="e.g. Andhra Pradesh, Rajasthan"
                        className="mt-1.5 w-full rounded-xl border border-[#E5E5E0] bg-[#FAF8F4]/50 px-3.5 py-2.5 text-xs text-[#1A1A18] outline-none transition focus:border-[#1A1A18] focus:bg-white focus:ring-1 focus:ring-[#1A1A18]"
                      />
                    </div>
                  </div>
                </div>

                {/* Group 4: Pipeline Source */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#1A1A18]">
                      4. Sourcing Assessment
                    </span>
                    <div className="h-px flex-1 bg-[#E5E5E0]" />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1A1A18]">
                      Scouting Source
                    </label>
                    <select
                      name="source"
                      defaultValue="field_visit"
                      className="mt-1.5 w-full rounded-xl border border-[#E5E5E0] bg-[#FAF8F4]/50 px-3.5 py-2.5 text-xs text-[#1A1A18] outline-none transition focus:border-[#1A1A18] focus:bg-white focus:ring-1 focus:ring-[#1A1A18]"
                    >
                      <option value="field_visit">Field / Cluster Scouting</option>
                      <option value="gi_registry">GI Registry Certification</option>
                      <option value="referral">Seller / Artisan Referral</option>
                      <option value="exhibition">Craft Exhibition / Trade Fair</option>
                      <option value="inbound">Inbound Contact Application</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1A1A18]">
                      Field Notes &amp; Observations
                    </label>
                    <textarea
                      name="notes"
                      rows={3}
                      placeholder="Notes on traditional tools, workshop capacity, registered GI certificates, SKU readiness..."
                      className="mt-1.5 w-full rounded-xl border border-[#E5E5E0] bg-[#FAF8F4]/50 px-3.5 py-2.5 text-xs text-[#1A1A18] outline-none transition focus:border-[#1A1A18] focus:bg-white focus:ring-1 focus:ring-[#1A1A18]"
                    />
                  </div>
                </div>

                {/* Sticky Footer: border-t border-[#E5E5E0] bg-[#FAF8F4] px-6 py-3.5 flex items-center justify-between */}
                <div className="sticky bottom-0 -mx-6 -mb-5 mt-6 flex items-center justify-between border-t border-[#E5E5E0] bg-[#FAF8F4] px-6 py-3.5">
                  <button
                    type="button"
                    onClick={() => setShowAddContactDrawer(false)}
                    className="rounded-full border border-[#E5E5E0] bg-white px-4 py-2 text-xs font-medium text-[#1A1A18] hover:bg-[#FAF8F4] transition-colors"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-2 rounded-full bg-[#1A1A18] px-5 py-2 text-xs font-semibold text-white hover:bg-[#2E2E2B] transition-colors disabled:opacity-60 shadow-xs"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Saving contact…</span>
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        <span>Save contact</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* SLIDE-OVER DRAWER - EDIT CONTACT */}
      {editingContact && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            onClick={() => setEditingContact(null)}
            className="fixed inset-0 bg-[#1A1A18]/40 backdrop-blur-xs transition-opacity duration-200"
          />

          <div className="fixed inset-y-0 right-0 z-50 flex max-w-full pl-10">
            <div className="w-screen max-w-lg md:max-w-xl border-l border-[#E5E5E0] bg-white text-[#1A1A18] shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-200">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[#E5E5E0] bg-[#FAF8F4] px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-[#1A1A18] text-white flex items-center justify-center font-bold shadow-xs">
                    <Edit className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#1A1A18]">
                      Edit Seller Contact
                    </h3>
                    <p className="text-xs text-[#52524E]">
                      Update contact profile, cluster details, and progression
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setEditingContact(null)}
                  className="rounded-full p-2 text-[#52524E] hover:bg-[#E5E5E0] hover:text-[#1A1A18] transition"
                  title="Close sideview drawer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Form Body */}
              <form
                onSubmit={handleUpdateContact}
                className="flex-1 overflow-y-auto px-6 py-5 space-y-5"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#1A1A18]">
                      Artisan &amp; Workshop Identity
                    </span>
                    <div className="h-px flex-1 bg-[#E5E5E0]" />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1A1A18]">
                      Artisan / Contact Person Name <span className="text-rose-600">*</span>
                    </label>
                    <input
                      name="name"
                      required
                      defaultValue={editingContact.name}
                      className="mt-1.5 w-full rounded-xl border border-[#E5E5E0] bg-[#FAF8F4]/50 px-3.5 py-2.5 text-xs text-[#1A1A18] outline-none transition focus:border-[#1A1A18] focus:bg-white focus:ring-1 focus:ring-[#1A1A18]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1A1A18]">
                      Business / Guild / Workshop Name
                    </label>
                    <input
                      name="business_name"
                      defaultValue={editingContact.business_name || ""}
                      className="mt-1.5 w-full rounded-xl border border-[#E5E5E0] bg-[#FAF8F4]/50 px-3.5 py-2.5 text-xs text-[#1A1A18] outline-none transition focus:border-[#1A1A18] focus:bg-white focus:ring-1 focus:ring-[#1A1A18]"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#1A1A18]">
                      Communication
                    </span>
                    <div className="h-px flex-1 bg-[#E5E5E0]" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#1A1A18]">
                        Phone <span className="text-rose-600">*</span>
                      </label>
                      <input
                        name="phone"
                        required
                        defaultValue={editingContact.phone}
                        className="mt-1.5 w-full rounded-xl border border-[#E5E5E0] bg-[#FAF8F4]/50 px-3.5 py-2.5 text-xs text-[#1A1A18] outline-none transition focus:border-[#1A1A18] focus:bg-white focus:ring-1 focus:ring-[#1A1A18] font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#1A1A18]">
                        Email
                      </label>
                      <input
                        name="email"
                        type="email"
                        defaultValue={editingContact.email || ""}
                        className="mt-1.5 w-full rounded-xl border border-[#E5E5E0] bg-[#FAF8F4]/50 px-3.5 py-2.5 text-xs text-[#1A1A18] outline-none transition focus:border-[#1A1A18] focus:bg-white focus:ring-1 focus:ring-[#1A1A18]"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#1A1A18]">
                      Craft &amp; Geography
                    </span>
                    <div className="h-px flex-1 bg-[#E5E5E0]" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#1A1A18]">
                        Craft Category
                      </label>
                      <input
                        name="craft_category"
                        defaultValue={editingContact.craft_category || ""}
                        className="mt-1.5 w-full rounded-xl border border-[#E5E5E0] bg-[#FAF8F4]/50 px-3.5 py-2.5 text-xs text-[#1A1A18] outline-none transition focus:border-[#1A1A18] focus:bg-white focus:ring-1 focus:ring-[#1A1A18]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#1A1A18]">
                        Cluster / Village
                      </label>
                      <input
                        name="cluster_name"
                        defaultValue={editingContact.cluster_name || ""}
                        className="mt-1.5 w-full rounded-xl border border-[#E5E5E0] bg-[#FAF8F4]/50 px-3.5 py-2.5 text-xs text-[#1A1A18] outline-none transition focus:border-[#1A1A18] focus:bg-white focus:ring-1 focus:ring-[#1A1A18]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#1A1A18]">
                        City
                      </label>
                      <input
                        name="city"
                        defaultValue={editingContact.city || ""}
                        className="mt-1.5 w-full rounded-xl border border-[#E5E5E0] bg-[#FAF8F4]/50 px-3.5 py-2.5 text-xs text-[#1A1A18] outline-none transition focus:border-[#1A1A18] focus:bg-white focus:ring-1 focus:ring-[#1A1A18]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#1A1A18]">
                        State
                      </label>
                      <input
                        name="state"
                        defaultValue={editingContact.state || ""}
                        className="mt-1.5 w-full rounded-xl border border-[#E5E5E0] bg-[#FAF8F4]/50 px-3.5 py-2.5 text-xs text-[#1A1A18] outline-none transition focus:border-[#1A1A18] focus:bg-white focus:ring-1 focus:ring-[#1A1A18]"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#1A1A18]">
                      Pipeline Status &amp; Source
                    </span>
                    <div className="h-px flex-1 bg-[#E5E5E0]" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#1A1A18]">
                        Status
                      </label>
                      <select
                        name="status"
                        defaultValue={editingContact.status}
                        className="mt-1.5 w-full rounded-xl border border-[#E5E5E0] bg-[#FAF8F4]/50 px-3.5 py-2.5 text-xs text-[#1A1A18] outline-none transition focus:border-[#1A1A18] focus:bg-white focus:ring-1 focus:ring-[#1A1A18]"
                      >
                        <option value="new">New Scouted</option>
                        <option value="contacted">Contacted</option>
                        <option value="qualified">Qualified</option>
                        <option value="disqualified">Disqualified</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#1A1A18]">
                        Source
                      </label>
                      <select
                        name="source"
                        defaultValue={editingContact.source || "cluster_scouting"}
                        className="mt-1.5 w-full rounded-xl border border-[#E5E5E0] bg-[#FAF8F4]/50 px-3.5 py-2.5 text-xs text-[#1A1A18] outline-none transition focus:border-[#1A1A18] focus:bg-white focus:ring-1 focus:ring-[#1A1A18]"
                      >
                        <option value="cluster_scouting">Field / Cluster Scouting</option>
                        <option value="gi_registry">GI Registry Certification</option>
                        <option value="referral">Seller / Artisan Referral</option>
                        <option value="exhibition">Craft Exhibition / Trade Fair</option>
                        <option value="inbound">Inbound Contact Application</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1A1A18]">
                      Field Notes &amp; Observations
                    </label>
                    <textarea
                      name="notes"
                      rows={3}
                      defaultValue={editingContact.notes || ""}
                      className="mt-1.5 w-full rounded-xl border border-[#E5E5E0] bg-[#FAF8F4]/50 px-3.5 py-2.5 text-xs text-[#1A1A18] outline-none transition focus:border-[#1A1A18] focus:bg-white focus:ring-1 focus:ring-[#1A1A18]"
                    />
                  </div>
                </div>

                <div className="sticky bottom-0 -mx-6 -mb-5 mt-6 flex items-center justify-between border-t border-[#E5E5E0] bg-[#FAF8F4] px-6 py-3.5">
                  <button
                    type="button"
                    onClick={() => setEditingContact(null)}
                    className="rounded-full border border-[#E5E5E0] bg-white px-4 py-2 text-xs font-medium text-[#1A1A18] hover:bg-[#FAF8F4] transition-colors"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-2 rounded-full bg-[#1A1A18] px-5 py-2 text-xs font-semibold text-white hover:bg-[#2E2E2B] transition-colors disabled:opacity-60 shadow-xs"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Saving changes…</span>
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        <span>Save changes</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* CONTACT DETAILS CARD MODAL */}
      {selectedContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A1A18]/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-[#E5E5E0] bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#E5E5E0] pb-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-[#1A1A18] text-white flex items-center justify-center font-bold text-base shadow-xs">
                  {selectedContact.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-[#1A1A18] text-lg">
                    {selectedContact.name}
                  </h3>
                  <p className="text-xs text-[#52524E]">
                    {selectedContact.business_name || "Independent Artisan Workshop"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedContact(null)}
                className="rounded-full p-2 text-[#52524E] hover:bg-[#FAF8F4] hover:text-[#1A1A18] transition"
              >
                ✕
              </button>
            </div>

            {/* Onboarding Banner if applicable */}
            {(() => {
              const matchedOnboard = getContactOnboarding(selectedContact);
              if (!matchedOnboard) return null;

              return (
                <div className="mt-4 rounded-xl bg-[#FAF8F4] p-4 border border-[#C89D32]/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#C89D32]">
                      <Sparkles className="h-4 w-4 fill-current" />
                      <span>Enrolled Onboarded Seller</span>
                    </span>
                    <span className="rounded-full bg-white px-2.5 py-0.5 text-[10px] font-bold text-[#C89D32] border border-[#C89D32]/30 shadow-xs">
                      {ONBOARDING_STAGE_LABELS[matchedOnboard.current_stage]}
                    </span>
                  </div>

                  <p className="text-xs text-[#52524E]">
                    {matchedOnboard.notes || "Master artisan in verified onboarding progression."}
                  </p>

                  <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] text-[#52524E]">
                    <div className="flex items-center gap-1.5">
                      <span className={matchedOnboard.kyc_completed ? "text-[#C89D32] font-bold" : "text-[#8C8C85]"}>
                        {matchedOnboard.kyc_completed ? "✓" : "○"} KYC Verified
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={matchedOnboard.catalog_completed ? "text-[#C89D32] font-bold" : "text-[#8C8C85]"}>
                        {matchedOnboard.catalog_completed ? "✓" : "○"} Catalog Ingested
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={matchedOnboard.quality_check_completed ? "text-[#C89D32] font-bold" : "text-[#8C8C85]"}>
                        {matchedOnboard.quality_check_completed ? "✓" : "○"} Quality Packaging
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={matchedOnboard.live_on_marketplace ? "text-[#C89D32] font-bold" : "text-[#8C8C85]"}>
                        {matchedOnboard.live_on_marketplace ? "✓" : "○"} Live in Storefront
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <Link
                      href="/dashboard/crm/onboarding"
                      className="inline-flex items-center gap-1 rounded-full bg-[#1A1A18] px-3.5 py-1 text-[11px] font-semibold text-white shadow-xs hover:bg-[#2E2E2B] transition"
                    >
                      <span>View in Onboarding Process</span>
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              );
            })()}

            {/* Metadata Grid */}
            <div className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-[#FAF8F4] p-4 rounded-xl border border-[#E5E5E0]">
                <div>
                  <span className="text-[10px] font-bold text-[#8C8C85] uppercase">
                    Phone
                  </span>
                  <p className="font-semibold text-[#1A1A18] mt-0.5 font-mono">
                    {selectedContact.phone}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#8C8C85] uppercase">
                    Email
                  </span>
                  <p className="font-semibold text-[#1A1A18] mt-0.5 truncate">
                    {selectedContact.email || "Not specified"}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#8C8C85] uppercase">
                    Craft Category
                  </span>
                  <p className="font-semibold text-[#1A1A18] mt-0.5">
                    {selectedContact.craft_category || "Traditional Craft"}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#8C8C85] uppercase">
                    Contact Status
                  </span>
                  <p className="font-semibold text-[#1A1A18] mt-0.5 capitalize">
                    {selectedContact.status}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#8C8C85] uppercase">
                    Cluster / Village
                  </span>
                  <p className="font-semibold text-[#1A1A18] mt-0.5">
                    {selectedContact.cluster_name || "N/A"}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#8C8C85] uppercase">
                    Geographic Region
                  </span>
                  <p className="font-semibold text-[#1A1A18] mt-0.5">
                    {selectedContact.city}, {selectedContact.state}
                  </p>
                </div>
              </div>

              {selectedContact.notes && (
                <div>
                  <span className="text-[10px] font-bold text-[#8C8C85] uppercase">
                    Scouting Observations
                  </span>
                  <p className="mt-1 text-xs text-[#52524E] bg-white p-3.5 rounded-xl border border-[#E5E5E0] leading-relaxed">
                    {selectedContact.notes}
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-[#8C8C85]">
                  Added:{" "}
                  {selectedContact.created_at
                    ? new Date(selectedContact.created_at).toLocaleDateString()
                    : "Recently"}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const c = selectedContact;
                      setSelectedContact(null);
                      setEditingContact(c);
                    }}
                    className="inline-flex items-center gap-1 rounded-full border border-[#E5E5E0] bg-white px-4 py-2 font-semibold text-[#1A1A18] hover:bg-[#FAF8F4] transition"
                  >
                    <Edit className="h-3.5 w-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleConvertToLead(selectedContact.id)}
                    disabled={isSubmitting}
                    className="rounded-full bg-[#1A1A18] px-5 py-2 font-semibold text-white hover:bg-[#2E2E2B] transition shadow-xs disabled:opacity-50"
                  >
                    Promote to Lead
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
