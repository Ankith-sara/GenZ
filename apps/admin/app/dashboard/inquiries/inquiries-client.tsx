"use client";

import React, { useState } from "react";
import { PageHeader } from "@genz/ui";
import { StatusBadge } from "@genz/ui";
import { EmptyState } from "@genz/ui";
import { MessageSquare, Search, User, Mail, ShoppingBag, Send } from "lucide-react";
import { Button } from "@genz/ui";

export interface InquiryRecord {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  message: string;
  product_id?: string | null;
  status: string;
  created_at: string;
}

interface InquiriesClientProps {
  initialInquiries: InquiryRecord[];
}

export function InquiriesClient({ initialInquiries }: InquiriesClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(
    initialInquiries[0]?.id || null
  );

  const filtered = initialInquiries.filter((inq) => {
    return (
      !searchQuery ||
      inq.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inq.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inq.message.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const activeInquiry = initialInquiries.find((i) => i.id === selectedId);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Buyer Sourcing & Inquiry Stream"
        description="Direct procurement inquiries submitted by wholesale buyers."
        breadcrumbs={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Inquiries" },
        ]}
      />

      {/* TWO PANE MESSAGING LAYOUT */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* LEFT STREAM LIST (4 Columns) */}
        <div className="space-y-4 lg:col-span-4">
          <div className="relative">
            <Search className="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-[#73736E]" />
            <input
              type="text"
              placeholder="Search sender, email, inquiry content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="font-graphik h-9 w-full rounded-lg border border-[#E5E5E0] bg-white pr-3 pl-9 text-xs text-black placeholder:text-[#A3A39D] focus:border-black focus:outline-none"
            />
          </div>

          <div className="max-h-[620px] space-y-2 overflow-y-auto pr-1">
            {filtered.length === 0 ? (
              <EmptyState
                icon={<MessageSquare className="h-6 w-6 text-[#73736E]" />}
                title="No Inquiries"
                description="No buyer messages found matching criteria."
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
                      <StatusBadge status={inq.status || "active"} />
                    </div>

                    <p className="font-graphik mt-2 line-clamp-2 text-xs text-[#52524E]">
                      &ldquo;{inq.message}&rdquo;
                    </p>

                    <div className="mt-2.5 flex items-center justify-between border-t border-[#F0F0EC] pt-2 font-mono text-[10px] text-[#8C8C85]">
                      <span>
                        Prod: {inq.product_id ? inq.product_id.slice(0, 8) : "General"}
                      </span>
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

        {/* RIGHT CONVERSATION TRANSCRIPT (8 Columns) */}
        <div className="lg:col-span-8">
          {!activeInquiry ? (
            <EmptyState
              icon={<MessageSquare className="h-7 w-7 text-[#73736E]" />}
              title="Select an Inquiry"
              description="Click any conversation thread on the left to read buyer sourcing requirements."
            />
          ) : (
            <div className="flex min-h-[500px] flex-col justify-between space-y-6 rounded-2xl border border-[#E5E5E0] bg-white p-6 shadow-2xs">
              <div>
                {/* Transcript Header */}
                <div className="flex flex-col justify-between gap-4 border-b border-[#F0F0EC] pb-4 sm:flex-row sm:items-center">
                  <div>
                    <h3 className="font-graphik text-lg font-bold text-[#1A1A18]">
                      Inquiry Thread #{activeInquiry.id.slice(0, 8)}
                    </h3>
                    <p className="font-mono text-xs text-[#73736E]">
                      Submitted on{" "}
                      {new Date(activeInquiry.created_at).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <StatusBadge status={activeInquiry.status || "active"} />
                </div>

                {/* Sender Cards */}
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
                  </div>

                  <div className="font-graphik space-y-1.5 rounded-xl border border-[#E5E5E0] bg-[#FAF8F4] p-3.5 text-xs">
                    <div className="flex items-center gap-2 font-bold text-[#1A1A18]">
                      <ShoppingBag className="h-3.5 w-3.5 text-[#73736E]" />
                      <span>Catalog Reference</span>
                    </div>
                    <p className="font-mono text-xs text-[#52524E]">
                      Target Product: {activeInquiry.product_id || "Direct Storefront"}
                    </p>
                  </div>
                </div>

                {/* Message Body Box */}
                <div className="mt-5 space-y-2">
                  <h4 className="font-graphik text-xs font-bold tracking-wider text-[#8C8C85] uppercase">
                    Buyer Procurement Request
                  </h4>
                  <div className="font-graphik rounded-xl border border-[#E5E5E0] bg-[#FAF7F0]/60 p-4 text-sm leading-relaxed text-[#1A1A18]">
                    {activeInquiry.message}
                  </div>
                </div>
              </div>

              {/* Reply Box */}
              <div className="space-y-3 border-t border-[#F0F0EC] pt-4">
                <textarea
                  rows={3}
                  placeholder="Type an admin reply or dispatch to seller..."
                  className="font-graphik w-full rounded-xl border border-[#E5E5E0] bg-[#FAF8F4] p-3 text-xs text-black placeholder:text-[#A3A39D] focus:border-black focus:bg-white focus:outline-none"
                />
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-[#8C8C85]">
                    Notification will be emailed to {activeInquiry.email}
                  </span>
                  <Button
                    onClick={() => alert("Admin reply dispatched!")}
                    className="font-graphik h-9 rounded-lg bg-black px-4 text-xs font-semibold text-white shadow-2xs hover:bg-neutral-800"
                  >
                    <Send className="mr-1.5 h-3.5 w-3.5" />
                    <span>Send Reply</span>
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
