"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/organisms/page-header";
import { StatusBadge } from "@/components/ui/atoms/status-badge";
import { ActionDropdown } from "@/components/ui/molecules/action-dropdown";
import { EmptyState } from "@/components/ui/organisms/empty-state";
import { Plus, Search, Filter, Package, ExternalLink, Edit } from "lucide-react";
import { Button } from "@/components/ui/atoms/button";

export interface SellerProductRecord {
  id: string;
  name: string;
  category: string;
  price_inr?: number | null;
  status: string;
  age_group?: string | null;
  updated_at?: string | null;
}

interface SellerProductsClientProps {
  initialProducts: SellerProductRecord[];
}

export function SellerProductsClient({ initialProducts }: SellerProductsClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredProducts = useMemo(() => {
    return initialProducts.filter((p) => {
      const matchesSearch =
        !searchQuery ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || p.status.toLowerCase() === statusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [initialProducts, searchQuery, statusFilter]);

  return (
    <div className="space-y-6 select-none">
      <PageHeader
        title="Factory Product Catalog"
        description="Manage your manufacturing catalog listings, prices, variants, and draft publications."
        breadcrumbs={[
          { label: "Seller Desk", href: "/seller/dashboard" },
          { label: "Products" },
        ]}
        actions={
          <Link href="/seller/dashboard/products/new">
            <Button className="font-graphik h-9 rounded-lg bg-black px-3.5 text-xs font-semibold text-white shadow-2xs hover:bg-neutral-800">
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              <span>Add New Product</span>
            </Button>
          </Link>
        }
      />

      {/* TOOLBAR */}
      <div className="flex flex-col gap-3 border-b border-[#E5E5E0] pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-[#73736E]" />
          <input
            type="text"
            placeholder="Search by title or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="font-graphik h-9 w-full rounded-lg border border-[#E5E5E0] bg-white pr-3 pl-9 text-xs text-black placeholder:text-[#A3A39D] focus:border-black focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-xs text-[#73736E]">
            <Filter className="h-3.5 w-3.5" />
            <span className="font-semibold text-black">Status:</span>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="font-graphik h-9 rounded-lg border border-[#E5E5E0] bg-white px-3 text-xs font-semibold text-black focus:border-black focus:outline-none"
          >
            <option value="all">All Statuses ({initialProducts.length})</option>
            <option value="published">Published Only</option>
            <option value="draft">Drafts Only</option>
          </select>
        </div>
      </div>

      {/* TABLE / MOBILE CARDS */}
      {filteredProducts.length === 0 ? (
        <EmptyState
          icon={<Package className="h-7 w-7 text-[#73736E]" />}
          title="No Catalog Listings Found"
          description={`No product listing matches "${searchQuery || statusFilter}"`}
          primaryAction={{
            label: "Create New Product",
            onClick: () => (window.location.href = "/seller/dashboard/products/new"),
          }}
        />
      ) : (
        <>
          {/* MOBILE CARDS VIEW (< sm) */}
          <div className="space-y-3 sm:hidden">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="font-graphik space-y-3 rounded-xl border border-[#E5E5E0] bg-white p-4 shadow-2xs"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Link
                      href={`/seller/dashboard/products/${product.id}`}
                      className="text-sm font-bold text-[#1A1A18] hover:underline"
                    >
                      {product.name}
                    </Link>
                    <span className="block font-mono text-[10px] text-[#73736E]">
                      {product.category} · ID: {product.id.slice(0, 8)}...
                    </span>
                  </div>

                  <StatusBadge
                    status={product.status === "published" ? "active" : "draft"}
                    label={product.status}
                  />
                </div>

                <div className="flex items-center justify-between border-t border-[#F0F0EC] pt-2.5 text-xs">
                  <div>
                    <span className="block text-[10px] font-semibold text-[#8C8C85]">
                      Price
                    </span>
                    <span className="font-mono text-xs font-bold text-[#1A1A18]">
                      ₹{product.price_inr ? product.price_inr.toLocaleString() : "—"}
                    </span>
                  </div>

                  <ActionDropdown
                    actions={[
                      {
                        label: "Edit Listing Details",
                        icon: <Edit className="h-3.5 w-3.5" />,
                        onClick: () =>
                          (window.location.href = `/seller/dashboard/products/${product.id}`),
                      },
                      {
                        label: "Preview Storefront Link",
                        icon: <ExternalLink className="h-3.5 w-3.5" />,
                        onClick: () => window.open(`/discover`, "_blank"),
                      },
                    ]}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* DESKTOP TABLE VIEW (>= sm) */}
          <div className="hidden overflow-hidden rounded-xl border border-[#E5E5E0] bg-white shadow-2xs sm:block">
            <div className="overflow-x-auto">
              <table className="font-graphik w-full text-left text-xs">
                <thead className="sticky top-0 z-10 border-b border-[#E5E5E0] bg-[#FAF8F4] text-[10px] font-bold tracking-wider text-[#73736E] uppercase">
                  <tr>
                    <th className="p-3.5 pl-4">Product Name</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Price (INR)</th>
                    <th className="p-3.5">Target Demographic</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 pr-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0F0EC] bg-white">
                  {filteredProducts.map((product) => (
                    <tr
                      key={product.id}
                      className="group h-14 transition-colors hover:bg-[#FAF7F0]/80"
                    >
                      <td className="p-3.5 pl-4 font-bold text-[#1A1A18]">
                        <Link
                          href={`/seller/dashboard/products/${product.id}`}
                          className="hover:underline"
                        >
                          {product.name}
                        </Link>
                        <span className="block font-mono text-[10px] font-normal text-[#73736E]">
                          ID: {product.id.slice(0, 10)}...
                        </span>
                      </td>

                      <td className="p-3.5 text-[#52524E]">{product.category}</td>

                      <td className="p-3.5 font-mono text-xs font-bold text-[#1A1A18]">
                        ₹{product.price_inr ? product.price_inr.toLocaleString() : "—"}
                      </td>

                      <td className="p-3.5 text-[#52524E]">
                        {product.age_group || "All demographics"}
                      </td>

                      <td className="p-3.5">
                        <StatusBadge
                          status={product.status === "published" ? "active" : "draft"}
                          label={product.status}
                        />
                      </td>

                      <td className="p-3.5 pr-4 text-right">
                        <ActionDropdown
                          actions={[
                            {
                              label: "Edit Listing Details",
                              icon: <Edit className="h-3.5 w-3.5" />,
                              onClick: () =>
                                (window.location.href = `/seller/dashboard/products/${product.id}`),
                            },
                            {
                              label: "Preview Storefront Link",
                              icon: <ExternalLink className="h-3.5 w-3.5" />,
                              onClick: () => window.open(`/discover`, "_blank"),
                            },
                          ]}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
