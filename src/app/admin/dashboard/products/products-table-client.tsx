"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { PageHeader } from "@/components/admin/ui/page-header";
import { StatusBadge } from "@/components/admin/ui/status-badge";
import { ActionDropdown } from "@/components/admin/ui/action-dropdown";
import { EmptyState } from "@/components/admin/ui/empty-state";
import { Search, Filter, ShoppingBag, Eye, ExternalLink } from "lucide-react";

export interface ProductRecord {
  id: string;
  name: string;
  category?: string | null;
  price_inr?: number | null;
  status?: string | null;
  images?: string[] | null;
  image_url?: string | null;
  inventory_count?: number | null;
  updated_at?: string | null;
}

interface ProductsTableClientProps {
  initialProducts: ProductRecord[];
}

export function ProductsTableClient({ initialProducts }: ProductsTableClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const categories = useMemo(() => {
    const set = new Set<string>();
    initialProducts.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [initialProducts]);

  const filteredProducts = useMemo(() => {
    return initialProducts.filter((p) => {
      const matchesSearch =
        !searchQuery ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.category || "").toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        p.status?.toLowerCase() === statusFilter.toLowerCase();

      const matchesCategory = categoryFilter === "all" || p.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [initialProducts, searchQuery, statusFilter, categoryFilter]);

  return (
    <div className="space-y-6 select-none">
      <PageHeader
        title="Platform Product Portfolio"
        description="Catalog directory of seller listings, pricing specs, and publication statuses."
        breadcrumbs={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Products" },
        ]}
      />

      {/* TOOLBAR */}
      <div className="flex flex-col gap-3 border-b border-[#E5E5E0] pb-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative max-w-md flex-1">
          <Search className="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-[#73736E]" />
          <input
            type="text"
            placeholder="Search by product title or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="font-graphik h-9 w-full rounded-lg border border-[#E5E5E0] bg-white pr-3 pl-9 text-xs text-black placeholder:text-[#A3A39D] focus:border-black focus:outline-none"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-xs text-[#73736E]">
            <Filter className="h-3.5 w-3.5" />
            <span className="font-semibold text-black">Filter:</span>
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="font-graphik h-9 rounded-lg border border-[#E5E5E0] bg-white px-3 text-xs font-semibold text-black focus:border-black focus:outline-none"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="font-graphik h-9 rounded-lg border border-[#E5E5E0] bg-white px-3 text-xs font-semibold text-black focus:border-black focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </div>

      {/* DATA TABLE */}
      {filteredProducts.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag className="h-7 w-7 text-[#73736E]" />}
          title="No Products Found"
          description={`No catalog listings matching "${searchQuery || statusFilter}"`}
          primaryAction={{
            label: "Reset Filters",
            onClick: () => {
              setSearchQuery("");
              setStatusFilter("all");
              setCategoryFilter("all");
            },
          }}
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-[#E5E5E0] bg-white shadow-2xs">
          <div className="overflow-x-auto">
            <table className="font-graphik w-full text-left text-xs">
              <thead className="sticky top-0 z-10 border-b border-[#E5E5E0] bg-[#FAF8F4] text-[10px] font-bold tracking-wider text-[#73736E] uppercase">
                <tr>
                  <th className="p-3.5 pl-4">Product details</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Price (INR)</th>
                  <th className="p-3.5">Publication Status</th>
                  <th className="p-3.5">Last Updated</th>
                  <th className="p-3.5 pr-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F0EC] bg-white">
                {filteredProducts.map((p) => {
                  const imgThumb =
                    p.image_url ||
                    (p.images && p.images.length > 0 ? p.images[0] : null);

                  return (
                    <tr
                      key={p.id}
                      className="group h-16 cursor-pointer transition-colors hover:bg-[#FAF7F0]/80"
                    >
                      <td className="p-3.5 pl-4">
                        <div className="flex items-center gap-3">
                          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[#E5E5E0] bg-[#FAF7F0]">
                            {imgThumb ? (
                              <Image
                                src={imgThumb}
                                alt={p.name}
                                fill
                                className="object-cover"
                                unoptimized
                              />
                            ) : (
                              <ShoppingBag className="h-5 w-5 text-[#8C8C85]" />
                            )}
                          </div>
                          <div>
                            <span className="block font-bold text-[#1A1A18] group-hover:underline">
                              {p.name}
                            </span>
                            <span className="block font-mono text-[10px] text-[#73736E]">
                              ID: {p.id.slice(0, 10)}...
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5 text-[#52524E]">
                        {p.category || "Uncategorized"}
                      </td>

                      <td className="p-3.5 font-mono text-xs font-bold text-[#1A1A18]">
                        ₹{p.price_inr ? p.price_inr.toLocaleString() : "—"}
                      </td>

                      <td className="p-3.5">
                        <StatusBadge
                          status={p.status === "published" ? "active" : "draft"}
                          label={p.status || "draft"}
                        />
                      </td>

                      <td className="p-3.5 font-mono text-[11px] text-[#73736E]">
                        {p.updated_at
                          ? new Date(p.updated_at).toLocaleDateString("en-US", {
                              month: "short",
                              day: "2-digit",
                            })
                          : "2026"}
                      </td>

                      <td className="p-3.5 pr-4 text-right">
                        <ActionDropdown
                          actions={[
                            {
                              label: "Copy Product ID",
                              icon: <Eye className="h-3.5 w-3.5" />,
                              onClick: () => navigator.clipboard.writeText(p.id),
                            },
                            {
                              label: "Open Storefront Link",
                              icon: <ExternalLink className="h-3.5 w-3.5" />,
                              onClick: () => window.open(`/discover`, "_blank"),
                            },
                          ]}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
