"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { PageHeader } from "@/components/ui/organisms/page-header";
import { StatusBadge } from "@/components/ui/atoms/status-badge";
import { SlideOverDrawer } from "@/components/ui/organisms/slide-over-drawer";
import { EmptyState } from "@/components/ui/organisms/empty-state";
import { Button } from "@/components/ui/atoms/button";
import {
  Search,
  Filter,
  ShoppingBag,
  Eye,
  Edit,
  EyeOff,
  CheckCircle2,
  Trash2,
  Copy,
  Plus,
  ChevronRight,
  ExternalLink,
  Tag,
  Clock,
  Info,
} from "lucide-react";
import { adminSetProductStatus, adminDeleteProduct } from "./actions";

export interface ProductRecord {
  id: string;
  name: string;
  category?: string | null;
  age_group?: string | null;
  description?: string | null;
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
  const [products, setProducts] = useState<ProductRecord[]>(initialProducts);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedProduct, setSelectedProduct] = useState<ProductRecord | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
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
  }, [products, searchQuery, statusFilter, categoryFilter]);

  const handleToggleStatus = async (product: ProductRecord) => {
    const nextStatus = product.status === "published" ? "draft" : "published";
    setLoadingId(product.id);

    // Optimistic UI update
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, status: nextStatus } : p))
    );
    if (selectedProduct?.id === product.id) {
      setSelectedProduct({ ...selectedProduct, status: nextStatus });
    }

    try {
      await adminSetProductStatus(product.id, nextStatus);
    } catch (err) {
      console.error("Failed to update status:", err);
      // rollback
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, status: product.status } : p))
      );
      if (selectedProduct?.id === product.id) {
        setSelectedProduct(product);
      }
      alert("Failed to update product status. Please try again.");
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async (product: ProductRecord) => {
    if (
      !confirm(
        `Are you sure you want to delete "${product.name}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    setLoadingId(product.id);
    const previousProducts = [...products];

    // Optimistic UI update
    setProducts((prev) => prev.filter((p) => p.id !== product.id));
    if (selectedProduct?.id === product.id) {
      setSelectedProduct(null);
    }

    try {
      await adminDeleteProduct(product.id);
    } catch (err) {
      console.error("Failed to delete product:", err);
      setProducts(previousProducts);
      alert("Failed to delete product. Please try again.");
    } finally {
      setLoadingId(null);
    }
  };

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform Product Portfolio"
        description="Catalog directory of seller listings, pricing specs, and publication statuses."
        breadcrumbs={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Products" },
        ]}
        actions={
          <Link href="/admin/dashboard/products/new">
            <Button className="font-graphik h-9 rounded-lg bg-black px-3.5 text-xs font-semibold text-white shadow-2xs hover:bg-neutral-800">
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              <span>Add New Product</span>
            </Button>
          </Link>
        }
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
                  <th className="p-3.5 pr-4 text-right">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F0EC] bg-white">
                {filteredProducts.map((p) => {
                  const imgThumb =
                    p.image_url ||
                    (p.images && p.images.length > 0 ? p.images[0] : null);

                  const isPublished = p.status === "published";
                  const isLoadingThis = loadingId === p.id;
                  const isSelected = selectedProduct?.id === p.id;

                  return (
                    <tr
                      key={p.id}
                      onClick={() => setSelectedProduct(p)}
                      className={`group h-16 cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-[#FAF7F0] font-medium"
                          : "hover:bg-[#FAF7F0]/70"
                      } ${isLoadingThis ? "pointer-events-none opacity-50" : ""}`}
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
                          status={isPublished ? "active" : "draft"}
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
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedProduct(p);
                          }}
                          className="inline-flex items-center gap-1 rounded-lg border border-[#E5E5E0] bg-white px-2.5 py-1.5 text-xs font-bold text-black transition-all hover:border-black hover:bg-[#FAF8F4]"
                        >
                          <span>View Details</span>
                          <ChevronRight className="h-3.5 w-3.5 text-[#73736E]" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SLIDE-OVER DRAWER FOR PRODUCT DETAILS & ACTIONS */}
      {selectedProduct && (
        <SlideOverDrawer
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
          title={selectedProduct.name}
          subtitle={`Product ID: ${selectedProduct.id}`}
          maxWidth="xl"
        >
          <div className="space-y-6">
            {/* HERO PRODUCT MEDIA & STATUS */}
            <div className="relative flex flex-col items-center justify-center overflow-hidden rounded-2xl border border-[#E5E5E0] bg-[#FAF8F4] p-6 text-center">
              <div className="relative mb-4 h-44 w-44 overflow-hidden rounded-2xl border border-[#E5E5E0] bg-white shadow-md">
                {selectedProduct.image_url ||
                (selectedProduct.images && selectedProduct.images.length > 0) ? (
                  <Image
                    src={selectedProduct.image_url || selectedProduct.images![0]}
                    alt={selectedProduct.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[#8C8C85]">
                    <ShoppingBag className="h-12 w-12" />
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2">
                <StatusBadge
                  status={selectedProduct.status === "published" ? "active" : "draft"}
                  label={selectedProduct.status || "draft"}
                />
                {selectedProduct.category && (
                  <span className="font-graphik inline-flex items-center gap-1 rounded-full border border-[#E5E5E0] bg-white px-2.5 py-0.5 text-[11px] font-bold text-black">
                    <Tag className="h-3 w-3 text-[#73736E]" />
                    {selectedProduct.category}
                  </span>
                )}
                {selectedProduct.price_inr !== undefined && (
                  <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 font-mono text-xs font-bold text-emerald-900">
                    ₹{selectedProduct.price_inr?.toLocaleString()}
                  </span>
                )}
              </div>
            </div>

            {/* PRODUCT SPECIFICATIONS GRID */}
            <div className="space-y-4 rounded-2xl border border-[#E5E5E0] bg-white p-5 shadow-2xs">
              <h3 className="font-graphik flex items-center gap-2 text-xs font-bold tracking-wider text-[#1A1A18] uppercase">
                <Info className="h-4 w-4 text-black" />
                <span>Product Specifications</span>
              </h3>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <span className="block font-semibold text-[#73736E]">Category</span>
                  <span className="block font-bold text-[#1A1A18]">
                    {selectedProduct.category || "Uncategorized"}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="block font-semibold text-[#73736E]">
                    Price (INR)
                  </span>
                  <span className="block font-mono font-bold text-[#1A1A18]">
                    ₹{selectedProduct.price_inr?.toLocaleString() ?? "—"}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="block font-semibold text-[#73736E]">Age Group</span>
                  <span className="block font-bold text-[#1A1A18]">
                    {selectedProduct.age_group || "All Ages"}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="block font-semibold text-[#73736E]">
                    Publication Status
                  </span>
                  <span className="block font-bold text-[#1A1A18] capitalize">
                    {selectedProduct.status || "draft"}
                  </span>
                </div>

                <div className="col-span-2 space-y-1">
                  <span className="block font-semibold text-[#73736E]">Product ID</span>
                  <div className="flex items-center justify-between rounded-lg border border-[#E5E5E0] bg-[#FAF8F4] px-3 py-2 font-mono text-[11px] text-[#1A1A18]">
                    <span className="truncate">{selectedProduct.id}</span>
                    <button
                      type="button"
                      onClick={() => handleCopyId(selectedProduct.id)}
                      className="font-graphik ml-2 flex items-center gap-1 text-[10px] font-bold text-black hover:underline"
                    >
                      <Copy className="h-3 w-3" />
                      <span>{copiedId ? "Copied!" : "Copy"}</span>
                    </button>
                  </div>
                </div>

                {selectedProduct.updated_at && (
                  <div className="col-span-2 space-y-1">
                    <span className="flex items-center gap-1 font-semibold text-[#73736E]">
                      <Clock className="h-3 w-3" />
                      <span>Last Updated</span>
                    </span>
                    <span className="block font-mono text-xs text-[#1A1A18]">
                      {new Date(selectedProduct.updated_at).toLocaleString("en-US", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </span>
                  </div>
                )}

                {selectedProduct.description && (
                  <div className="col-span-2 space-y-1 border-t border-[#F0F0EC] pt-3">
                    <span className="block font-semibold text-[#73736E]">
                      Description
                    </span>
                    <p className="font-graphik leading-relaxed text-[#1A1A18]">
                      {selectedProduct.description}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* MANAGEMENT ACTIONS CARD */}
            <div className="space-y-3 rounded-2xl border border-[#E5E5E0] bg-[#FAF8F4] p-5">
              <h4 className="font-graphik text-xs font-bold text-[#1A1A18]">
                Admin Actions
              </h4>

              <div className="grid grid-cols-1 gap-2.5">
                {/* View Storefront Page */}
                <button
                  type="button"
                  onClick={() =>
                    window.open(`/products/${selectedProduct.id}`, "_blank")
                  }
                  className="flex w-full items-center justify-between rounded-xl border border-[#E5E5E0] bg-white px-4 py-3 text-xs font-bold text-[#1A1A18] shadow-2xs transition-all hover:border-black hover:bg-[#FAF8F4]"
                >
                  <div className="flex items-center gap-2.5">
                    <Eye className="h-4 w-4 text-[#73736E]" />
                    <span>View Storefront Listing</span>
                  </div>
                  <ExternalLink className="h-4 w-4 text-[#73736E]" />
                </button>

                {/* Edit Product */}
                <button
                  type="button"
                  onClick={() =>
                    (window.location.href = `/seller/dashboard/products/${selectedProduct.id}`)
                  }
                  className="flex w-full items-center justify-between rounded-xl border border-[#E5E5E0] bg-white px-4 py-3 text-xs font-bold text-[#1A1A18] shadow-2xs transition-all hover:border-black hover:bg-[#FAF8F4]"
                >
                  <div className="flex items-center gap-2.5">
                    <Edit className="h-4 w-4 text-[#73736E]" />
                    <span>Edit Product Details</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[#73736E]" />
                </button>

                {/* Toggle Status (Publish / Unpublish) */}
                <button
                  type="button"
                  onClick={() => handleToggleStatus(selectedProduct)}
                  disabled={loadingId === selectedProduct.id}
                  className="flex w-full items-center justify-between rounded-xl border border-[#E5E5E0] bg-white px-4 py-3 text-xs font-bold text-[#1A1A18] shadow-2xs transition-all hover:border-black hover:bg-[#FAF8F4] disabled:opacity-50"
                >
                  <div className="flex items-center gap-2.5">
                    {selectedProduct.status === "published" ? (
                      <EyeOff className="h-4 w-4 text-amber-600" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    )}
                    <span>
                      {selectedProduct.status === "published"
                        ? "Unpublish Product (Set to Draft)"
                        : "Publish Product (Make Public)"}
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-[#73736E]">
                    {selectedProduct.status === "published" ? "DRAFT" : "PUBLISHED"}
                  </span>
                </button>

                {/* Delete Product */}
                <button
                  type="button"
                  onClick={() => handleDelete(selectedProduct)}
                  disabled={loadingId === selectedProduct.id}
                  className="flex w-full items-center justify-between rounded-xl border border-rose-200 bg-rose-50/70 px-4 py-3 text-xs font-bold text-rose-700 transition-all hover:border-rose-300 hover:bg-rose-100 disabled:opacity-50"
                >
                  <div className="flex items-center gap-2.5">
                    <Trash2 className="h-4 w-4 text-rose-600" />
                    <span>Delete Product</span>
                  </div>
                  <span className="text-[10px] font-medium text-rose-600">
                    PERMANENT
                  </span>
                </button>
              </div>
            </div>
          </div>
        </SlideOverDrawer>
      )}
    </div>
  );
}
