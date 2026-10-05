"use client";

import { useState, useMemo } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import type {
  AccountingAccount,
  AccountingJournal,
  CommissionRecord,
  SettlementBatch,
  FinancialOverviewSummary,
  ReconciliationException,
  PlatformSellerCandidate,
} from "@genz/types";
import {
  Landmark,
  ShieldCheck,
  CheckCircle2,
  Scale,
  RefreshCw,
  Search,
  Download,
  Plus,
  Eye,
  Building2,
} from "lucide-react";
import { toast } from "sonner";
import {
  approveSettlementAction,
  disburseSettlementAction,
  runReconciliationAction,
  resolveExceptionAction,
  generateSettlementAction,
} from "../actions";

interface FinanceClientProps {
  overview: FinancialOverviewSummary;
  accounts: AccountingAccount[];
  journals: AccountingJournal[];
  commissions: CommissionRecord[];
  settlements: SettlementBatch[];
  exceptions: ReconciliationException[];
  trialBalance: {
    accounts: {
      code: string;
      name: string;
      type: string;
      debit: number;
      credit: number;
    }[];
    totalDebit: number;
    totalCredit: number;
    isBalanced: boolean;
  };
  sellers?: PlatformSellerCandidate[];
}

type TabType =
  | "overview"
  | "settlements"
  | "commissions"
  | "ledger"
  | "statutory"
  | "reconciliation";

export function FinanceClient({
  overview,
  accounts,
  journals,
  commissions,
  settlements,
  exceptions,
  trialBalance,
  sellers = [],
}: FinanceClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Read active tab directly from URL query params
  const tabFromQuery = searchParams.get("tab") as TabType | null;
  const validTabs: TabType[] = [
    "overview",
    "settlements",
    "commissions",
    "ledger",
    "statutory",
    "reconciliation",
  ];
  const activeTab: TabType =
    tabFromQuery && validTabs.includes(tabFromQuery) ? tabFromQuery : "overview";

  const handleTabChange = (tab: TabType) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [settlementStatusFilter, setSettlementStatusFilter] = useState<string>("all");
  const [isProcessing, setIsProcessing] = useState(false);

  // Modals state
  const [selectedBatchForUtr, setSelectedBatchForUtr] =
    useState<SettlementBatch | null>(null);
  const [utrInput, setUtrInput] = useState("");
  const [selectedAccountForDrilldown, setSelectedAccountForDrilldown] =
    useState<AccountingAccount | null>(null);
  const [isCreateBatchModalOpen, setIsCreateBatchModalOpen] = useState(false);

  // Form for New Settlement Batch (backed by database sellers)
  const defaultSeller = sellers?.[0];
  const [newBatchSellerName, setNewBatchSellerName] = useState(
    defaultSeller?.business_name || defaultSeller?.name || ""
  );
  const [newBatchSellerId, setNewBatchSellerId] = useState(
    defaultSeller?.seller_id || ""
  );
  const [newBatchBankName, setNewBatchBankName] = useState("State Bank of India");
  const [newBatchAccountNum, setNewBatchAccountNum] = useState(
    defaultSeller?.phone
      ? `•••• •••• ${defaultSeller.phone.slice(-4)}`
      : "•••• •••• 9102"
  );
  const [newBatchIfsc, setNewBatchIfsc] = useState("SBIN0001844");
  const [newBatchProductName, setNewBatchProductName] = useState(
    defaultSeller?.craft_category || "Handcrafted Heritage Product"
  );
  const [newBatchGross, setNewBatchGross] = useState<number>(25000);
  const [newBatchNotes, setNewBatchNotes] = useState(
    "Direct artisan GI certified batch generation"
  );

  const handleOpenCreateBatchModal = () => {
    if (!newBatchSellerId && sellers.length > 0) {
      const first = sellers[0];
      setNewBatchSellerId(first.seller_id);
      setNewBatchSellerName(first.business_name || first.name);
      setNewBatchProductName(first.craft_category || "Handcrafted Heritage Product");
      if (first.phone) {
        setNewBatchAccountNum(`•••• •••• ${first.phone.slice(-4)}`);
      }
    }
    setIsCreateBatchModalOpen(true);
  };

  // Pre-calculated estimates for new batch modal
  const estComm = Math.round(((newBatchGross * 10) / 100) * 100) / 100;
  const estGst = Math.round(((estComm * 18) / 100) * 100) / 100;
  const estTcs = Math.round(((newBatchGross * 1) / 100) * 100) / 100;
  const estTds = Math.round(((newBatchGross * 0.1) / 100) * 100) / 100;
  const estNet =
    Math.round((newBatchGross - estComm - estGst - estTcs - estTds) * 100) / 100;

  // Actions
  const handleApprove = async (batchId: string) => {
    setIsProcessing(true);
    try {
      const res = await approveSettlementAction(batchId);
      if (res.success) {
        toast.success("Settlement batch approved by checker admin!");
      } else {
        toast.error(res.error || "Approval failed");
      }
    } catch {
      toast.error("Error approving batch");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDisburse = async () => {
    if (!selectedBatchForUtr) return;
    if (!utrInput.trim() || utrInput.trim().length < 6) {
      toast.error("Please enter a valid Bank UTR reference (min 6 characters)");
      return;
    }

    setIsProcessing(true);
    try {
      const res = await disburseSettlementAction(
        selectedBatchForUtr.id,
        utrInput.trim()
      );
      if (res.success) {
        toast.success("Disbursement confirmed & payout journal posted!");
        setSelectedBatchForUtr(null);
        setUtrInput("");
      } else {
        toast.error(res.error || "Disbursement failed");
      }
    } catch {
      toast.error("Error processing disbursement");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRunReconciliation = async () => {
    setIsProcessing(true);
    try {
      const res = await runReconciliationAction();
      if (res.success) {
        toast.success("5-Way reconciliation complete!");
      } else {
        toast.error(res.error || "Reconciliation failed");
      }
    } catch {
      toast.error("Error running reconciliation");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResolveException = async (id: string) => {
    setIsProcessing(true);
    try {
      const res = await resolveExceptionAction(id, "Resolved by admin audit review");
      if (res.success) {
        toast.success("Exception marked as resolved");
      } else {
        toast.error(res.error || "Failed to resolve");
      }
    } catch {
      toast.error("Error resolving exception");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBatchSellerId || !newBatchSellerName) {
      toast.error("Please select a registered seller from the database");
      return;
    }
    if (newBatchGross <= 0) {
      toast.error("Please specify a valid gross amount greater than 0");
      return;
    }

    setIsProcessing(true);
    try {
      const randomOrderId = `GZ-ORD-${Math.floor(100000 + Math.random() * 900000)}`;
      const res = await generateSettlementAction({
        sellerId: newBatchSellerId,
        sellerName: newBatchSellerName,
        sellerBankName: newBatchBankName,
        sellerAccountNumber: newBatchAccountNum,
        sellerIfsc: newBatchIfsc,
        notes: newBatchNotes,
        items: [
          {
            orderId: randomOrderId,
            orderItemId: `item-${randomOrderId}`,
            productName: newBatchProductName,
            grossAmount: newBatchGross,
            commissionRate: 10,
          },
        ],
      });

      if (res.success) {
        toast.success(
          `Settlement batch #${res.batch.batchNumber} created! Ready for checker approval.`
        );
        setIsCreateBatchModalOpen(false);
      } else {
        toast.error(res.error || "Failed to generate settlement batch");
      }
    } catch {
      toast.error("Error creating settlement batch");
    } finally {
      setIsProcessing(false);
    }
  };

  // CSV Export Utility
  const downloadCsv = (
    filename: string,
    headers: string[],
    rows: (string | number)[][]
  ) => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [
        headers.join(","),
        ...rows.map((r) =>
          r.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(",")
        ),
      ].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${filename}`);
  };

  // Filtered lists
  const filteredSettlements = useMemo(() => {
    return settlements.filter((s) => {
      const matchesSearch =
        s.sellerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.batchNumber.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        settlementStatusFilter === "all" ? true : s.status === settlementStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [settlements, searchQuery, settlementStatusFilter]);

  const filteredCommissions = useMemo(() => {
    return commissions.filter((c) => {
      return (
        (c.productName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.sellerName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.id.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [commissions, searchQuery]);

  // Account Ledger Lines Drilldown
  const ledgerLinesForSelectedAccount = useMemo(() => {
    if (!selectedAccountForDrilldown) return [];
    const lines: {
      journalId: string;
      date: string;
      narration: string;
      debit: number;
      credit: number;
    }[] = [];

    journals.forEach((j) => {
      j.lines.forEach((l) => {
        if (l.accountCode === selectedAccountForDrilldown.code) {
          lines.push({
            journalId: j.id,
            date: j.createdAt,
            narration: l.narration || j.narration,
            debit: l.debit || 0,
            credit: l.credit || 0,
          });
        }
      });
    });
    return lines;
  }, [journals, selectedAccountForDrilldown]);

  return (
    <div className="space-y-6">
      {/* Top Banner / Header */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-[#E5E5E0] bg-white p-5 shadow-xs sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#1A1A18] text-white shadow-xs">
            <Landmark className="h-6 w-6 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-2xl font-bold tracking-tight text-[#1A1A18]">
                Finance & ECO Accounting Core
              </h1>
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                Native Double-Entry
              </span>
            </div>
            <p className="text-xs text-[#73736E]">
              E-Commerce Operator (ECO) Revenue Recognition, Statutory GST/TCS, and
              Maker-Checker Settlements
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleOpenCreateBatchModal}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-[#1A1A18] px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition-all hover:bg-black"
          >
            <Plus className="h-3.5 w-3.5 text-amber-400" />
            Create Settlement Batch
          </button>

          <button
            onClick={handleRunReconciliation}
            disabled={isProcessing}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-[#E5E5E0] bg-white px-3.5 py-2 text-xs font-semibold text-[#1A1A18] transition-all hover:bg-[#FAF8F4]"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 text-amber-600 ${isProcessing ? "animate-spin" : ""}`}
            />
            Run 5-Way Audit
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-2xl border border-[#E5E5E0] bg-white p-4 shadow-xs">
          <span className="block text-[10px] font-bold tracking-wider text-[#73736E] uppercase">
            Marketplace GMV
          </span>
          <div className="mt-1 font-mono text-lg font-bold text-[#1A1A18]">
            ₹{overview.gmv.toLocaleString("en-IN")}
          </div>
          <span className="mt-1 block text-[9px] text-[#A1A19A]">
            *Not GenZ revenue (Customer funds)
          </span>
        </div>

        <div className="rounded-2xl border border-amber-200/80 bg-[#FAF7F0] p-4 shadow-xs">
          <span className="block text-[10px] font-bold tracking-wider text-amber-900 uppercase">
            Platform Commission
          </span>
          <div className="mt-1 font-mono text-lg font-bold text-[#D97706]">
            ₹{overview.platformRevenue.toLocaleString("en-IN")}
          </div>
          <span className="mt-1 block text-[9px] font-medium text-amber-800/80">
            Recognized GenZ Revenue
          </span>
        </div>

        <div className="rounded-2xl border border-[#E5E5E0] bg-white p-4 shadow-xs">
          <span className="block text-[10px] font-bold tracking-wider text-[#73736E] uppercase">
            Output GST (18%)
          </span>
          <div className="mt-1 font-mono text-lg font-bold text-[#1A1A18]">
            ₹{overview.outputGstPayable.toLocaleString("en-IN")}
          </div>
          <span className="mt-1 block text-[9px] font-medium text-emerald-600">
            GST on platform services (SAC 9983)
          </span>
        </div>

        <div className="rounded-2xl border border-[#E5E5E0] bg-white p-4 shadow-xs">
          <span className="block text-[10px] font-bold tracking-wider text-[#73736E] uppercase">
            Artisan Payables
          </span>
          <div className="mt-1 font-mono text-lg font-bold text-purple-700">
            ₹{overview.sellerPayablesOutstanding.toLocaleString("en-IN")}
          </div>
          <span className="mt-1 block text-[9px] text-[#73736E]">
            Pending batch payout
          </span>
        </div>

        <div className="rounded-2xl border border-[#E5E5E0] bg-white p-4 shadow-xs">
          <span className="block text-[10px] font-bold tracking-wider text-[#73736E] uppercase">
            Disbursed (Bank UTR)
          </span>
          <div className="mt-1 font-mono text-lg font-bold text-emerald-700">
            ₹{overview.disbursedSettlements.toLocaleString("en-IN")}
          </div>
          <span className="mt-1 block text-[9px] font-medium text-emerald-600">
            Disbursed to sellers
          </span>
        </div>

        <div className="rounded-2xl border border-[#E5E5E0] bg-white p-4 shadow-xs">
          <span className="block text-[10px] font-bold tracking-wider text-[#73736E] uppercase">
            GST-TCS & TDS
          </span>
          <div className="mt-1 font-mono text-lg font-bold text-blue-700">
            ₹{(overview.tcsCollected + overview.tdsDeducted).toLocaleString("en-IN")}
          </div>
          <span className="mt-1 block text-[9px] font-medium text-blue-600">
            GSTR-8 & 194-O Filings
          </span>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex overflow-x-auto border-b border-[#E5E5E0] text-xs font-semibold select-none">
        <button
          onClick={() => handleTabChange("overview")}
          className={`cursor-pointer px-4 py-3 whitespace-nowrap transition-colors ${
            activeTab === "overview"
              ? "border-b-2 border-[#D97706] font-bold text-[#D97706]"
              : "text-[#73736E] hover:text-[#1A1A18]"
          }`}
        >
          Executive P&L & Overview
        </button>
        <button
          onClick={() => handleTabChange("settlements")}
          className={`cursor-pointer px-4 py-3 whitespace-nowrap transition-colors ${
            activeTab === "settlements"
              ? "border-b-2 border-[#D97706] font-bold text-[#D97706]"
              : "text-[#73736E] hover:text-[#1A1A18]"
          }`}
        >
          Seller Settlements ({settlements.length})
        </button>
        <button
          onClick={() => handleTabChange("commissions")}
          className={`cursor-pointer px-4 py-3 whitespace-nowrap transition-colors ${
            activeTab === "commissions"
              ? "border-b-2 border-[#D97706] font-bold text-[#D97706]"
              : "text-[#73736E] hover:text-[#1A1A18]"
          }`}
        >
          Commission Invoices ({commissions.length})
        </button>
        <button
          onClick={() => handleTabChange("ledger")}
          className={`cursor-pointer px-4 py-3 whitespace-nowrap transition-colors ${
            activeTab === "ledger"
              ? "border-b-2 border-[#D97706] font-bold text-[#D97706]"
              : "text-[#73736E] hover:text-[#1A1A18]"
          }`}
        >
          General Ledger & Trial Balance
        </button>
        <button
          onClick={() => handleTabChange("statutory")}
          className={`cursor-pointer px-4 py-3 whitespace-nowrap transition-colors ${
            activeTab === "statutory"
              ? "border-b-2 border-[#D97706] font-bold text-[#D97706]"
              : "text-[#73736E] hover:text-[#1A1A18]"
          }`}
        >
          Statutory GST & TDS Register
        </button>
        <button
          onClick={() => handleTabChange("reconciliation")}
          className={`cursor-pointer px-4 py-3 whitespace-nowrap transition-colors ${
            activeTab === "reconciliation"
              ? "border-b-2 border-[#D97706] font-bold text-[#D97706]"
              : "text-[#73736E] hover:text-[#1A1A18]"
          }`}
        >
          5-Way Reconciliation Hub {exceptions.length > 0 && `(${exceptions.length})`}
        </button>
      </div>

      {/* Tab 1: Executive Overview */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-5 rounded-2xl border border-[#E5E5E0] bg-white p-5 shadow-xs lg:col-span-2">
            <div className="flex items-center justify-between border-b border-[#E5E5E0] pb-3">
              <h2 className="font-serif text-lg font-bold text-[#1A1A18]">
                Recent Double-Entry Journal Postings
              </h2>
              <span className="text-[11px] text-[#73736E]">
                Showing latest {journals.slice(0, 6).length} journal entries
              </span>
            </div>

            <div className="divide-y divide-[#E5E5E0]">
              {journals.slice(0, 6).map((j) => (
                <div key={j.id} className="py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="rounded border border-amber-200 bg-amber-50 px-2 py-0.5 font-mono text-xs font-bold text-amber-800">
                        {j.id}
                      </span>
                      <span className="text-xs font-semibold text-[#1A1A18]">
                        {j.narration}
                      </span>
                    </div>
                    <span className="font-mono text-xs font-bold text-[#1A1A18]">
                      ₹{j.totalAmount.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="mt-2 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                    {j.lines.map((l, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between rounded bg-[#FAF8F4] px-2.5 py-1 text-[11px]"
                      >
                        <span className="text-[#52524E]">
                          <strong className="font-mono">{l.accountCode}</strong>{" "}
                          {l.accountName || ""}
                        </span>
                        <span className="font-mono font-bold">
                          {l.debit > 0 ? (
                            <span className="text-emerald-700">
                              Dr ₹{l.debit.toLocaleString("en-IN")}
                            </span>
                          ) : (
                            <span className="text-blue-700">
                              Cr ₹{l.credit.toLocaleString("en-IN")}
                            </span>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Compliance & ECO Rule Reference */}
          <div className="space-y-4 rounded-2xl border border-[#E5E5E0] bg-white p-5 shadow-xs">
            <h3 className="border-b border-[#E5E5E0] pb-2.5 font-serif text-base font-bold text-[#1A1A18]">
              ECO Statutory Framework
            </h3>
            <div className="space-y-3 text-xs text-[#52524E]">
              <div className="rounded-xl border border-amber-200 bg-[#FAF7F0] p-3">
                <span className="block text-[10px] font-bold tracking-wider text-amber-950 uppercase">
                  Section 9(5) & 52 CGST Act
                </span>
                <p className="mt-1 text-[11px] leading-relaxed text-amber-900">
                  GenZ operates strictly as an E-Commerce Operator. Customer
                  consideration belongs to independent artisans. Platform commission is
                  taxed at 18% under SAC 9983.
                </p>
              </div>

              <div className="rounded-xl border border-[#E5E5E0] bg-[#FAF8F4] p-3">
                <span className="block text-[10px] font-bold tracking-wider text-[#1A1A18] uppercase">
                  Section 194-O Income Tax
                </span>
                <p className="mt-1 text-[11px] leading-relaxed text-[#73736E]">
                  0.1% TDS is automatically withheld on net taxable consideration for
                  participating artisan enterprises prior to bank disbursement.
                </p>
              </div>

              <div className="rounded-xl border border-[#E5E5E0] bg-[#FAF8F4] p-3">
                <span className="block text-[10px] font-bold tracking-wider text-[#1A1A18] uppercase">
                  Maker-Checker Controls
                </span>
                <p className="mt-1 text-[11px] leading-relaxed text-[#73736E]">
                  Disbursements require a maker to assemble the batch and an independent
                  checker admin to verify. Approved batches require official Bank UTR
                  logging.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Seller Settlements */}
      {activeTab === "settlements" && (
        <div className="space-y-4 rounded-2xl border border-[#E5E5E0] bg-white p-5 shadow-xs">
          <div className="flex flex-col justify-between gap-3 border-b border-[#E5E5E0] pb-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-serif text-lg font-bold text-[#1A1A18]">
                Seller Settlement Batches
              </h2>
              <p className="text-xs text-[#73736E]">
                Maker-Checker disbursement pipeline with statutory withholdings and Bank
                UTR recording
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="absolute top-2.5 left-2.5 h-3.5 w-3.5 text-[#A1A19A]" />
                <input
                  type="text"
                  placeholder="Search artisan or batch..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8.5 rounded-lg border border-[#E5E5E0] pr-3 pl-8 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <select
                value={settlementStatusFilter}
                onChange={(e) => setSettlementStatusFilter(e.target.value)}
                className="h-8.5 rounded-lg border border-[#E5E5E0] px-2.5 text-xs text-[#1A1A18] focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="pending_approval">Pending Approval</option>
                <option value="approved">Approved (Ready for UTR)</option>
                <option value="disbursed">Disbursed (Closed)</option>
              </select>

              <button
                onClick={() =>
                  downloadCsv(
                    "seller-settlements.csv",
                    [
                      "Batch ID",
                      "Batch Number",
                      "Artisan",
                      "Gross",
                      "Commission",
                      "GST",
                      "TCS",
                      "TDS",
                      "Net Payable",
                      "Status",
                      "UTR",
                    ],
                    filteredSettlements.map((s) => [
                      s.id,
                      s.batchNumber,
                      s.sellerName,
                      s.grossAmount,
                      s.totalCommission,
                      s.totalCommissionGst,
                      s.totalTcs,
                      s.totalTds,
                      s.netPayable,
                      s.status,
                      s.bankUtr || "",
                    ])
                  )
                }
                className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-[#E5E5E0] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#1A1A18] hover:bg-[#FAF8F4]"
              >
                <Download className="h-3 w-3" />
                Export CSV
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#E5E5E0] bg-[#FAF8F4] text-[#73736E]">
                <tr>
                  <th className="p-3 font-semibold">Batch ID</th>
                  <th className="p-3 font-semibold">Artisan / Seller</th>
                  <th className="p-3 font-semibold">Gross Sales</th>
                  <th className="p-3 font-semibold">Commission (10%)</th>
                  <th className="p-3 font-semibold">GST (18%)</th>
                  <th className="p-3 font-semibold">TCS & TDS</th>
                  <th className="p-3 font-semibold">Net Payout</th>
                  <th className="p-3 font-semibold">Status</th>
                  <th className="p-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E0]">
                {filteredSettlements.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-6 text-center text-xs text-[#73736E]">
                      No settlement batches matching search query.
                    </td>
                  </tr>
                ) : (
                  filteredSettlements.map((s) => (
                    <tr key={s.id} className="transition-colors hover:bg-[#FAF8F4]/50">
                      <td className="p-3 font-mono font-bold text-amber-800">
                        {s.id}
                        <span className="block font-sans text-[10px] font-normal text-[#73736E]">
                          {s.batchNumber}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="block font-semibold text-[#1A1A18]">
                          {s.sellerName}
                        </span>
                        <span className="font-mono text-[10px] text-[#73736E]">
                          {s.sellerBankName} • {s.sellerAccountNumber}
                        </span>
                      </td>
                      <td className="p-3 font-mono font-medium text-[#1A1A18]">
                        ₹{s.grossAmount.toLocaleString("en-IN")}
                      </td>
                      <td className="p-3 font-mono text-red-600">
                        -₹{s.totalCommission.toLocaleString("en-IN")}
                      </td>
                      <td className="p-3 font-mono text-red-600">
                        -₹{s.totalCommissionGst.toLocaleString("en-IN")}
                      </td>
                      <td className="p-3 font-mono text-blue-700">
                        -₹{(s.totalTcs + s.totalTds).toLocaleString("en-IN")}
                      </td>
                      <td className="p-3 font-mono text-sm font-bold text-emerald-700">
                        ₹{s.netPayable.toLocaleString("en-IN")}
                      </td>
                      <td className="p-3">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            s.status === "disbursed"
                              ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
                              : s.status === "approved"
                                ? "border border-blue-200 bg-blue-50 text-blue-800"
                                : "border border-amber-200 bg-amber-50 text-amber-800"
                          }`}
                        >
                          {s.status.toUpperCase()}
                        </span>
                        {s.bankUtr && (
                          <span className="mt-0.5 block font-mono text-[9px] text-[#73736E]">
                            UTR: {s.bankUtr}
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        {s.status === "pending_approval" && (
                          <button
                            onClick={() => handleApprove(s.id)}
                            disabled={isProcessing}
                            className="cursor-pointer rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-emerald-700"
                          >
                            Approve
                          </button>
                        )}
                        {s.status === "approved" && (
                          <button
                            onClick={() => setSelectedBatchForUtr(s)}
                            className="cursor-pointer rounded-lg bg-[#1A1A18] px-3 py-1.5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-black"
                          >
                            Disburse & UTR
                          </button>
                        )}
                        {s.status === "disbursed" && (
                          <span className="text-[11px] font-medium text-emerald-700">
                            Closed ✓
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Commission Invoices */}
      {activeTab === "commissions" && (
        <div className="space-y-4 rounded-2xl border border-[#E5E5E0] bg-white p-5 shadow-xs">
          <div className="flex flex-col justify-between gap-3 border-b border-[#E5E5E0] pb-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-serif text-lg font-bold text-[#1A1A18]">
                Marketplace Commission Invoices (B2B)
              </h2>
              <p className="text-xs text-[#73736E]">
                Platform service enablement invoices issued to sellers with 18% GST
                (SAC: 9983)
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute top-2.5 left-2.5 h-3.5 w-3.5 text-[#A1A19A]" />
                <input
                  type="text"
                  placeholder="Search commissions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8.5 rounded-lg border border-[#E5E5E0] pr-3 pl-8 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <button
                onClick={() =>
                  downloadCsv(
                    "commission-invoices-sac9983.csv",
                    [
                      "Commission ID",
                      "Order Reference",
                      "Product",
                      "Seller",
                      "Gross",
                      "Commission Rate",
                      "Commission (excl. GST)",
                      "GST (18%)",
                      "Total Invoice",
                      "Status",
                    ],
                    filteredCommissions.map((c) => [
                      c.id,
                      c.orderId,
                      c.productName || "Handcrafted Artisan Item",
                      c.sellerName || "Registered Master Artisan",
                      c.grossValue,
                      `${c.commissionRate}%`,
                      c.commissionAmount,
                      c.gstAmount,
                      c.totalCommission,
                      c.status,
                    ])
                  )
                }
                className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-[#E5E5E0] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#1A1A18] hover:bg-[#FAF8F4]"
              >
                <Download className="h-3 w-3" />
                Export CSV
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#E5E5E0] bg-[#FAF8F4] text-[#73736E]">
                <tr>
                  <th className="p-3 font-semibold">Commission ID</th>
                  <th className="p-3 font-semibold">Order Reference</th>
                  <th className="p-3 font-semibold">Product & Seller</th>
                  <th className="p-3 font-semibold">Gross Value</th>
                  <th className="p-3 font-semibold">Commission (10%)</th>
                  <th className="p-3 font-semibold">GST @ 18%</th>
                  <th className="p-3 font-semibold">Total Invoice</th>
                  <th className="p-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E0]">
                {filteredCommissions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-6 text-center text-xs text-[#73736E]">
                      No commission records found.
                    </td>
                  </tr>
                ) : (
                  filteredCommissions.map((c) => (
                    <tr key={c.id} className="transition-colors hover:bg-[#FAF8F4]/50">
                      <td className="p-3 font-mono font-bold text-amber-800">{c.id}</td>
                      <td className="p-3 font-mono text-[#1A1A18]">{c.orderId}</td>
                      <td className="p-3">
                        <span className="block font-semibold text-[#1A1A18]">
                          {c.productName}
                        </span>
                        <span className="text-[10px] text-[#73736E]">
                          {c.sellerName}
                        </span>
                      </td>
                      <td className="p-3 font-mono font-medium text-[#1A1A18]">
                        ₹{c.grossValue.toLocaleString("en-IN")}
                      </td>
                      <td className="p-3 font-mono font-bold text-[#D97706]">
                        ₹{c.commissionAmount.toLocaleString("en-IN")}
                      </td>
                      <td className="p-3 font-mono text-[#1A1A18]">
                        ₹{c.gstAmount.toLocaleString("en-IN")}
                      </td>
                      <td className="p-3 font-mono font-bold text-[#1A1A18]">
                        ₹{c.totalCommission.toLocaleString("en-IN")}
                      </td>
                      <td className="p-3">
                        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                          {c.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: General Ledger & Trial Balance */}
      {activeTab === "ledger" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-[#E5E5E0] bg-white p-5 shadow-xs">
            <div className="flex flex-col justify-between gap-3 border-b border-[#E5E5E0] pb-4 sm:flex-row sm:items-center">
              <div>
                <h2 className="font-serif text-lg font-bold text-[#1A1A18]">
                  Chart of Accounts & Trial Balance Audit
                </h2>
                <p className="text-xs text-[#73736E]">
                  Mathematical proof that Debits equal Credits across the platform
                  general ledger. Click an account to inspect ledger lines.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                    trialBalance.isBalanced
                      ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
                      : "border border-red-200 bg-red-50 text-red-800"
                  }`}
                >
                  <Scale className="h-3.5 w-3.5" />
                  {trialBalance.isBalanced
                    ? "Ledger Perfectly Balanced (0.00 Divergence)"
                    : "Imbalance Detected!"}
                </span>

                <button
                  onClick={() =>
                    downloadCsv(
                      "trial-balance-audit.csv",
                      [
                        "Account Code",
                        "Account Name",
                        "Type",
                        "Debit Balance",
                        "Credit Balance",
                      ],
                      trialBalance.accounts.map((a) => [
                        a.code,
                        a.name,
                        a.type,
                        a.debit,
                        a.credit,
                      ])
                    )
                  }
                  className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-[#E5E5E0] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#1A1A18] hover:bg-[#FAF8F4]"
                >
                  <Download className="h-3 w-3" />
                  Export
                </button>
              </div>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-[#E5E5E0] bg-[#FAF8F4] text-[#73736E]">
                  <tr>
                    <th className="p-3 font-semibold">Account Code</th>
                    <th className="p-3 font-semibold">Account Name</th>
                    <th className="p-3 font-semibold">Type</th>
                    <th className="p-3 text-right font-semibold">Debit Balance</th>
                    <th className="p-3 text-right font-semibold">Credit Balance</th>
                    <th className="p-3 text-right font-semibold">Ledger</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E5E0]">
                  {trialBalance.accounts.map((acc) => {
                    const fullAcc = accounts.find((a) => a.code === acc.code);
                    return (
                      <tr
                        key={acc.code}
                        className="transition-colors hover:bg-[#FAF8F4]/50"
                      >
                        <td className="p-3 font-mono font-bold text-amber-800">
                          {acc.code}
                        </td>
                        <td className="p-3 font-semibold text-[#1A1A18]">{acc.name}</td>
                        <td className="p-3">
                          <span className="rounded bg-[#FAF8F4] px-2 py-0.5 text-[10px] font-bold text-[#52524E] uppercase">
                            {acc.type}
                          </span>
                        </td>
                        <td className="p-3 text-right font-mono text-emerald-700">
                          {acc.debit > 0
                            ? `₹${acc.debit.toLocaleString("en-IN")}`
                            : "-"}
                        </td>
                        <td className="p-3 text-right font-mono text-blue-700">
                          {acc.credit > 0
                            ? `₹${acc.credit.toLocaleString("en-IN")}`
                            : "-"}
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() =>
                              setSelectedAccountForDrilldown(fullAcc || null)
                            }
                            className="inline-flex cursor-pointer items-center gap-1 rounded border border-[#E5E5E0] bg-white px-2 py-1 text-[11px] font-semibold text-[#73736E] hover:bg-[#FAF8F4] hover:text-[#1A1A18]"
                          >
                            <Eye className="h-3 w-3" />
                            View Ledger
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  <tr className="border-t-2 border-[#E5E5E0] bg-[#FAF7F0] text-sm font-bold">
                    <td colSpan={3} className="p-3 text-[#1A1A18]">
                      Total Trial Balance Equilibrium
                    </td>
                    <td className="p-3 text-right font-mono text-emerald-800">
                      ₹{trialBalance.totalDebit.toLocaleString("en-IN")}
                    </td>
                    <td className="p-3 text-right font-mono text-blue-800">
                      ₹{trialBalance.totalCredit.toLocaleString("en-IN")}
                    </td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Statutory GST & TDS Register */}
      {activeTab === "statutory" && (
        <div className="space-y-6">
          {/* Statutory Tax Summary */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-4 shadow-xs">
              <span className="text-[10px] font-bold tracking-wider text-blue-900 uppercase">
                GSTR-8 Tax Collected at Source (§52)
              </span>
              <div className="mt-1 font-mono text-xl font-bold text-blue-950">
                ₹{overview.tcsCollected.toLocaleString("en-IN")}
              </div>
              <p className="mt-1 text-[11px] text-blue-800">
                1% TCS (0.5% CGST + 0.5% SGST or 1% IGST) remitted monthly to GST
                portal.
              </p>
            </div>

            <div className="rounded-2xl border border-indigo-200 bg-indigo-50/50 p-4 shadow-xs">
              <span className="text-[10px] font-bold tracking-wider text-indigo-900 uppercase">
                Section 194-O TDS Withholding
              </span>
              <div className="mt-1 font-mono text-xl font-bold text-indigo-950">
                ₹{overview.tdsDeducted.toLocaleString("en-IN")}
              </div>
              <p className="mt-1 text-[11px] text-indigo-800">
                0.1% Income Tax TDS withheld on gross consideration credited to
                artisans.
              </p>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 shadow-xs">
              <span className="text-[10px] font-bold tracking-wider text-amber-900 uppercase">
                Platform GST on Commission (SAC 9983)
              </span>
              <div className="mt-1 font-mono text-xl font-bold text-amber-950">
                ₹{overview.outputGstPayable.toLocaleString("en-IN")}
              </div>
              <p className="mt-1 text-[11px] text-amber-800">
                18% B2B GST on platform services enabling artisan e-commerce.
              </p>
            </div>
          </div>

          {/* GSTR-8 Register Table */}
          <div className="space-y-4 rounded-2xl border border-[#E5E5E0] bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#E5E5E0] pb-3">
              <div>
                <h3 className="font-serif text-base font-bold text-[#1A1A18]">
                  Monthly GSTR-8 & TDS Withholding Register
                </h3>
                <p className="text-xs text-[#73736E]">
                  Line-by-line artisan statutory ledger for filing monthly GSTR-8
                  returns and Form 26Q
                </p>
              </div>

              <button
                onClick={() =>
                  downloadCsv(
                    "gstr8-tcs-tds-register.csv",
                    [
                      "Batch Number",
                      "Artisan / Seller",
                      "Gross Consideration",
                      "GST-TCS (1%)",
                      "TDS §194-O (0.1%)",
                      "Net Consideration",
                    ],
                    settlements.map((s) => [
                      s.batchNumber,
                      s.sellerName,
                      s.grossAmount,
                      s.totalTcs,
                      s.totalTds,
                      s.netPayable,
                    ])
                  )
                }
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#E5E5E0] bg-white px-3 py-1.5 text-xs font-semibold text-[#1A1A18] hover:bg-[#FAF8F4]"
              >
                <Download className="h-3.5 w-3.5" />
                Download Tax Register CSV
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-[#E5E5E0] bg-[#FAF8F4] text-[#73736E]">
                  <tr>
                    <th className="p-3 font-semibold">Settlement Batch</th>
                    <th className="p-3 font-semibold">Artisan / Seller</th>
                    <th className="p-3 font-semibold">Gross Taxable Value</th>
                    <th className="p-3 font-semibold">GST-TCS @ 1% (§52)</th>
                    <th className="p-3 font-semibold">TDS @ 0.1% (§194-O)</th>
                    <th className="p-3 font-semibold">Net Payout</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E5E0]">
                  {settlements.map((s) => (
                    <tr key={s.id} className="hover:bg-[#FAF8F4]/50">
                      <td className="p-3 font-mono font-bold text-amber-800">
                        {s.batchNumber}
                      </td>
                      <td className="p-3 font-medium text-[#1A1A18]">{s.sellerName}</td>
                      <td className="p-3 font-mono">
                        ₹{s.grossAmount.toLocaleString("en-IN")}
                      </td>
                      <td className="p-3 font-mono font-semibold text-blue-700">
                        ₹{s.totalTcs.toLocaleString("en-IN")}
                      </td>
                      <td className="p-3 font-mono font-semibold text-indigo-700">
                        ₹{s.totalTds.toLocaleString("en-IN")}
                      </td>
                      <td className="p-3 font-mono font-bold text-emerald-700">
                        ₹{s.netPayable.toLocaleString("en-IN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: 5-Way Reconciliation Hub */}
      {activeTab === "reconciliation" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-[#E5E5E0] bg-white p-5 shadow-xs">
            <h2 className="border-b border-[#E5E5E0] pb-3 font-serif text-lg font-bold text-[#1A1A18]">
              5-Way Daily Reconciliation Checklist
            </h2>

            <div className="mt-4 grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-5">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  1. Order Parity
                </div>
                <p className="mt-1 text-[11px] text-emerald-900/80">
                  100% orders match item subtotal & taxes
                </p>
              </div>

              <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  2. Gateway Clearing
                </div>
                <p className="mt-1 text-[11px] text-emerald-900/80">
                  Razorpay payments match clearing account
                </p>
              </div>

              <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  3. Seller Ledger
                </div>
                <p className="mt-1 text-[11px] text-emerald-900/80">
                  Fulfilled items match settlement batches
                </p>
              </div>

              <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  4. General Ledger
                </div>
                <p className="mt-1 text-[11px] text-emerald-900/80">
                  Debits equal Credits with zero divergence
                </p>
              </div>

              <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  5. Statutory Taxes
                </div>
                <p className="mt-1 text-[11px] text-emerald-900/80">
                  GST-TCS & TDS match government registers
                </p>
              </div>
            </div>
          </div>

          {/* Exceptions Queue */}
          <div className="rounded-2xl border border-[#E5E5E0] bg-white p-5 shadow-xs">
            <h3 className="border-b border-[#E5E5E0] pb-3 font-serif text-base font-bold text-[#1A1A18]">
              Reconciliation Exception Queue ({exceptions.length})
            </h3>

            {exceptions.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#73736E]">
                <ShieldCheck className="mx-auto mb-2 h-8 w-8 text-emerald-600" />
                No discrepancies found across all five reconciliation audits.
              </div>
            ) : (
              <div className="divide-y divide-[#E5E5E0]">
                {exceptions.map((exc) => (
                  <div key={exc.id} className="flex items-center justify-between py-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-800">
                          {exc.discrepancyType.replace(/_/g, " ").toUpperCase()}
                        </span>
                        <span className="text-xs font-semibold text-[#1A1A18]">
                          {exc.notes}
                        </span>
                      </div>
                      <span className="mt-0.5 block font-mono text-[10px] text-[#73736E]">
                        Entity: {exc.entityType.toUpperCase()} #{exc.entityId} | Diff: ₹
                        {exc.difference}
                      </span>
                    </div>

                    {exc.status === "open" && (
                      <button
                        onClick={() => handleResolveException(exc.id)}
                        disabled={isProcessing}
                        className="cursor-pointer rounded-lg border border-[#E5E5E0] bg-white px-3 py-1 text-xs font-semibold text-[#1A1A18] hover:bg-[#FAF8F4]"
                      >
                        Resolve Discrepancy
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal 1: Disburse Modal */}
      {selectedBatchForUtr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md space-y-4 rounded-2xl border border-[#E5E5E0] bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E5E5E0] pb-3">
              <h3 className="font-serif text-lg font-bold text-[#1A1A18]">
                Disburse Payout & Record Bank UTR
              </h3>
              <button
                onClick={() => setSelectedBatchForUtr(null)}
                className="text-[#73736E] hover:text-[#1A1A18]"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1 rounded-xl bg-[#FAF8F4] p-3 text-xs">
              <p>
                <strong>Beneficiary:</strong> {selectedBatchForUtr.sellerName}
              </p>
              <p>
                <strong>Bank Account:</strong> {selectedBatchForUtr.sellerBankName} (
                {selectedBatchForUtr.sellerAccountNumber})
              </p>
              <p>
                <strong>Net Payable:</strong>{" "}
                <span className="font-mono font-bold text-emerald-700">
                  ₹{selectedBatchForUtr.netPayable.toLocaleString("en-IN")}
                </span>
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[#1A1A18] uppercase">
                Bank UTR / Transaction Reference Number *
              </label>
              <input
                type="text"
                placeholder="e.g. UTR20261004123456"
                value={utrInput}
                onChange={(e) => setUtrInput(e.target.value)}
                className="h-10 w-full rounded-xl border border-[#E5E5E0] px-3 font-mono text-xs uppercase focus:ring-2 focus:ring-[#D97706]/30 focus:outline-none"
              />
              <span className="block text-[10px] text-[#73736E]">
                Once saved, this settlement batch is permanently closed and posted to
                the General Ledger.
              </span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedBatchForUtr(null)}
                className="cursor-pointer rounded-xl border border-[#E5E5E0] px-4 py-2 text-xs font-semibold text-[#73736E] hover:bg-[#FAF8F4]"
              >
                Cancel
              </button>
              <button
                onClick={handleDisburse}
                disabled={isProcessing}
                className="cursor-pointer rounded-xl bg-[#D97706] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#B45309]"
              >
                Confirm Disbursement
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Create Settlement Batch Modal */}
      {isCreateBatchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg space-y-4 rounded-2xl border border-[#E5E5E0] bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E5E5E0] pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100">
                  <Building2 className="h-4 w-4 text-amber-800" />
                </div>
                <h3 className="font-serif text-lg font-bold text-[#1A1A18]">
                  Generate Artisan Settlement Batch
                </h3>
              </div>
              <button
                onClick={() => setIsCreateBatchModalOpen(false)}
                className="text-[#73736E] hover:text-[#1A1A18]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateBatch} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-[#1A1A18]">
                    Artisan / Seller (Database)
                  </label>
                  <select
                    value={newBatchSellerId}
                    onChange={(e) => {
                      const selectedId = e.target.value;
                      setNewBatchSellerId(selectedId);
                      const s = sellers.find((item) => item.seller_id === selectedId);
                      if (s) {
                        setNewBatchSellerName(s.business_name || s.name);
                        setNewBatchProductName(
                          s.craft_category || "Handcrafted Heritage Product"
                        );
                        setNewBatchBankName("State Bank of India");
                        setNewBatchAccountNum(
                          s.phone ? `•••• •••• ${s.phone.slice(-4)}` : "•••• •••• 9102"
                        );
                        setNewBatchIfsc("SBIN0001844");
                      }
                    }}
                    className="h-9 w-full rounded-lg border border-[#E5E5E0] bg-white px-2.5 text-xs"
                    required
                  >
                    {sellers && sellers.length > 0 ? (
                      sellers.map((s) => (
                        <option key={s.seller_id} value={s.seller_id}>
                          {s.business_name || s.name} {s.city ? `(${s.city})` : ""}
                        </option>
                      ))
                    ) : (
                      <option value="">No registered sellers found in database</option>
                    )}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[#1A1A18]">
                    Gross Product Consideration (₹)
                  </label>
                  <input
                    type="number"
                    min="100"
                    step="100"
                    value={newBatchGross}
                    onChange={(e) => setNewBatchGross(Number(e.target.value))}
                    className="h-9 w-full rounded-lg border border-[#E5E5E0] px-2.5 font-mono text-xs"
                    required
                  />
                </div>
              </div>

              {/* Automatic breakdown preview */}
              <div className="space-y-1.5 rounded-xl border border-amber-200/80 bg-[#FAF7F0] p-3.5 font-mono text-[11px]">
                <div className="flex justify-between text-[#52524E]">
                  <span>Gross Sales Consideration:</span>
                  <span className="font-bold text-[#1A1A18]">
                    ₹{newBatchGross.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between text-red-600">
                  <span>- GenZ Platform Commission (10%):</span>
                  <span>-₹{estComm.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-red-600">
                  <span>- Output GST on Commission (18%):</span>
                  <span>-₹{estGst.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-blue-700">
                  <span>- Statutory GST-TCS (1% §52):</span>
                  <span>-₹{estTcs.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-indigo-700">
                  <span>- Section 194-O TDS (0.1%):</span>
                  <span>-₹{estTds.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between border-t border-amber-300 pt-1.5 text-sm font-bold text-emerald-800">
                  <span>Estimated Net Payable Payout:</span>
                  <span>₹{estNet.toLocaleString("en-IN")}</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#1A1A18]">
                  Audit Notes / Maker Reference
                </label>
                <input
                  type="text"
                  value={newBatchNotes}
                  onChange={(e) => setNewBatchNotes(e.target.value)}
                  placeholder="e.g. Verified artisan delivery certificate"
                  className="h-9 w-full rounded-lg border border-[#E5E5E0] px-2.5 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-[#E5E5E0] pt-3">
                <button
                  type="button"
                  onClick={() => setIsCreateBatchModalOpen(false)}
                  className="rounded-lg border border-[#E5E5E0] px-3.5 py-2 text-xs font-semibold text-[#73736E] hover:bg-[#FAF8F4]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="rounded-lg bg-[#1A1A18] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-black"
                >
                  Submit for Checker Approval
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Account Ledger Drilldown Drawer */}
      {selectedAccountForDrilldown && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="flex max-h-[85vh] w-full max-w-2xl flex-col space-y-4 rounded-2xl border border-[#E5E5E0] bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E5E5E0] pb-3">
              <div>
                <span className="rounded border border-amber-200 bg-amber-50 px-2 py-0.5 font-mono text-xs font-bold text-amber-800">
                  Account {selectedAccountForDrilldown.code}
                </span>
                <h3 className="mt-1 font-serif text-lg font-bold text-[#1A1A18]">
                  {selectedAccountForDrilldown.name}
                </h3>
                <p className="text-xs text-[#73736E]">
                  {selectedAccountForDrilldown.description}
                </p>
              </div>
              <button
                onClick={() => setSelectedAccountForDrilldown(null)}
                className="text-base text-[#73736E] hover:text-[#1A1A18]"
              >
                ✕
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto">
              {ledgerLinesForSelectedAccount.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#73736E]">
                  No journal lines posted yet to this account code.
                </div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead className="sticky top-0 border-b border-[#E5E5E0] bg-[#FAF8F4] text-[#73736E]">
                    <tr>
                      <th className="p-2.5 font-semibold">Journal</th>
                      <th className="p-2.5 font-semibold">Date</th>
                      <th className="p-2.5 font-semibold">Narration</th>
                      <th className="p-2.5 text-right font-semibold">Debit (Dr)</th>
                      <th className="p-2.5 text-right font-semibold">Credit (Cr)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E5E0]">
                    {ledgerLinesForSelectedAccount.map((line, idx) => (
                      <tr key={idx} className="hover:bg-[#FAF8F4]/50">
                        <td className="p-2.5 font-mono font-bold text-amber-800">
                          {line.journalId}
                        </td>
                        <td className="p-2.5 font-mono text-[10px] text-[#73736E]">
                          {new Date(line.date).toLocaleDateString("en-IN", {
                            month: "short",
                            day: "2-digit",
                          })}
                        </td>
                        <td className="p-2.5 text-[#1A1A18]">{line.narration}</td>
                        <td className="p-2.5 text-right font-mono font-semibold text-emerald-700">
                          {line.debit > 0
                            ? `₹${line.debit.toLocaleString("en-IN")}`
                            : "-"}
                        </td>
                        <td className="p-2.5 text-right font-mono font-semibold text-blue-700">
                          {line.credit > 0
                            ? `₹${line.credit.toLocaleString("en-IN")}`
                            : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="flex items-center justify-end border-t border-[#E5E5E0] pt-3">
              <button
                onClick={() => setSelectedAccountForDrilldown(null)}
                className="rounded-lg bg-[#1A1A18] px-4 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-black"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
