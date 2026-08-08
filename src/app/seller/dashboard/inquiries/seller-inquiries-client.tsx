"use client";

import React, { useState, useTransition } from "react";
import { PageHeader } from "@/components/ui/organisms/page-header";
import { StatusBadge } from "@/components/ui/atoms/status-badge";
import { EmptyState } from "@/components/ui/organisms/empty-state";
import { updateInquiryStatus } from "./actions";
import {
  MessageSquare,
  Search,
  User,
  Mail,
  Phone,
  Package,
  Send,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/atoms/button";
import type { InquiryStatus } from "@/types/database";

export interface SellerInquiryRecord {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  message: string;
  product_id?: string | null;
  product_name?: string | null;
  status: InquiryStatus;
  created_at: string;
}

interface SellerInquiriesClientProps {
  initialInquiries: SellerInquiryRecord[];
}

export function SellerInquiriesClient({
  initialInquiries,
}: SellerInquiriesClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(
    initialInquiries[0]?.id || null
  );
  const [isPending, startTransition] = useTransition();

  const filtered = initialInquiries.filter((inq) => {
    return (
      !searchQuery ||
      inq.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inq.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inq.message.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const activeInquiry = initialInquiries.find((i) => i.id === selectedId);

  const handleStatusChange = (newStatus: InquiryStatus) => {
    if (!activeInquiry) return;
    startTransition(async () => {
      await updateInquiryStatus(activeInquiry.id, newStatus);
    });
  };

  return (
    <div className="space-y-6 select-none">
      <PageHeader
        title="Buyer Procurement Inquiries"
        description="Direct sourcing requirements, RFQs, and product inquiries from buyers."
        breadcrumbs={[
          { label: "Seller Desk", href: "/seller/dashboard" },
          { label: "Inquiries" },
        ]}
      />

      {/* TWO PANE MESSAGING LAYOUT */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* LEFT COLUMN: INQUIRY LIST (4 Columns) */}
        <div className="space-y-4 lg:col-span-4">
          <div className="relative">
            <Search className="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-[#73736E]" />
            <input
              type="text"
              placeholder="Search buyer name, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="font-graphik h-9 w-full rounded-lg border border-[#E5E5E0] bg-white pr-3 pl-9 text-xs text-black placeholder:text-[#A3A39D] focus:border-black focus:outline-none"
            />
          </div>

          <div className="max-h-[620px] space-y-2 overflow-y-auto pr-1">
            {filtered.length === 0 ? (
              <EmptyState
                icon={<MessageSquare className="h-6 w-6 text-[#73736E]" />}
                title="No Inquiries Received"
                description="No buyer communications found matching search criteria."
              />
            ) : (
              filtered.map((inq) => {
                const isSelected = inq.id === selectedId;
                return (
                  <div
                    key={inq.id}
                    onClick={() => setSelectedId(inq.id)}
                    className={`group cursor-pointer rounded-xl border p-4 transition-all ${
                      isSelected
                        ? "border-black bg-[#FAF7F0] shadow-xs"
                        : "border-[#E5E5E0] bg-white hover:border-black/30 hover:bg-[#FAF8F4]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-graphik text-xs font-bold text-[#1A1A18] group-hover:underline">
                          {inq.name}
                        </h4>
                        <p className="font-graphik max-w-[180px] truncate text-[11px] text-[#73736E]">
                          {inq.email}
                        </p>
                      </div>
                      <StatusBadge
                        status={
                          inq.status === "responded"
                            ? "active"
                            : inq.status === "closed"
                              ? "offline"
                              : "processing"
                        }
                        label={inq.status}
                      />
                    </div>

                    <p className="font-graphik mt-2 line-clamp-2 text-xs text-[#52524E]">
                      &ldquo;{inq.message}&rdquo;
                    </p>

                    <div className="mt-2.5 flex items-center justify-between border-t border-[#F0F0EC] pt-2 font-mono text-[10px] text-[#8C8C85]">
                      <span>{inq.product_name || "General RFQ"}</span>
                      <span>
                        {new Date(inq.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: TRANSCRIPT VIEW (8 Columns) */}
        <div className="lg:col-span-8">
          {!activeInquiry ? (
            <EmptyState
              icon={<MessageSquare className="h-7 w-7 text-[#73736E]" />}
              title="Select an Inquiry"
              description="Click any buyer message thread on the left to read specs and reply."
            />
          ) : (
            <div className="flex min-h-[500px] flex-col justify-between space-y-6 rounded-2xl border border-[#E5E5E0] bg-white p-6 shadow-2xs">
              <div>
                {/* Header Thread */}
                <div className="flex flex-col justify-between gap-4 border-b border-[#F0F0EC] pb-4 sm:flex-row sm:items-center">
                  <div>
                    <h3 className="font-graphik text-lg font-bold text-[#1A1A18]">
                      Buyer RFQ #{activeInquiry.id.slice(0, 8)}
                    </h3>
                    <p className="font-mono text-xs text-[#73736E]">
                      Received on{" "}
                      {new Date(activeInquiry.created_at).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>

                  {/* Status Toggle Control */}
                  <div className="flex items-center gap-2">
                    <span className="font-graphik text-xs text-[#73736E]">Status:</span>
                    <select
                      value={activeInquiry.status}
                      disabled={isPending}
                      onChange={(e) =>
                        handleStatusChange(e.target.value as InquiryStatus)
                      }
                      className="font-graphik h-8 rounded-lg border border-[#E5E5E0] bg-[#FAF8F4] px-2.5 text-xs font-bold text-black focus:border-black focus:outline-none"
                    >
                      <option value="new">New Inquiry</option>
                      <option value="responded">Responded</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                </div>

                {/* Buyer Meta Cards */}
                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="font-graphik space-y-1.5 rounded-xl border border-[#E5E5E0] bg-[#FAF8F4] p-3.5 text-xs">
                    <div className="flex items-center gap-2 font-bold text-[#1A1A18]">
                      <User className="h-3.5 w-3.5 text-[#73736E]" />
                      <span>{activeInquiry.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#52524E]">
                      <Mail className="h-3.5 w-3.5 text-[#73736E]" />
                      <span>{activeInquiry.email}</span>
                    </div>
                    {activeInquiry.phone && (
                      <div className="flex items-center gap-2 text-[#52524E]">
                        <Phone className="h-3.5 w-3.5 text-[#73736E]" />
                        <span>{activeInquiry.phone}</span>
                      </div>
                    )}
                  </div>

                  <div className="font-graphik space-y-1.5 rounded-xl border border-[#E5E5E0] bg-[#FAF8F4] p-3.5 text-xs">
                    <div className="flex items-center gap-2 font-bold text-[#1A1A18]">
                      <Package className="h-3.5 w-3.5 text-[#73736E]" />
                      <span>Inquired Product Item</span>
                    </div>
                    <p className="font-semibold text-black">
                      {activeInquiry.product_name || "General Catalog Inquiry"}
                    </p>
                  </div>
                </div>

                {/* Buyer Message Text */}
                <div className="mt-5 space-y-2">
                  <h4 className="font-graphik text-xs font-bold tracking-wider text-[#8C8C85] uppercase">
                    Procurement Requirement Details
                  </h4>
                  <div className="font-graphik rounded-xl border border-[#E5E5E0] bg-[#FAF7F0]/60 p-4 text-sm leading-relaxed text-[#1A1A18]">
                    {activeInquiry.message}
                  </div>
                </div>
              </div>

              {/* Reply Email Box */}
              <div className="space-y-3 border-t border-[#F0F0EC] pt-4">
                <textarea
                  rows={3}
                  placeholder={`Write your quotation / reply to ${activeInquiry.name}...`}
                  className="font-graphik w-full rounded-xl border border-[#E5E5E0] bg-[#FAF8F4] p-3 text-xs text-black placeholder:text-[#A3A39D] focus:border-black focus:bg-white focus:outline-none"
                />
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-[#8C8C85]">
                    Reply will be sent to {activeInquiry.email}
                  </span>
                  <Button
                    onClick={() => {
                      handleStatusChange("responded");
                      alert(`Quotation dispatched to ${activeInquiry.email}!`);
                    }}
                    disabled={isPending}
                    className="font-graphik h-9 rounded-lg bg-black px-4 text-xs font-semibold text-white shadow-2xs hover:bg-neutral-800"
                  >
                    {isPending ? (
                      <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Send className="mr-1.5 h-3.5 w-3.5" />
                    )}
                    <span>Send Quote</span>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
