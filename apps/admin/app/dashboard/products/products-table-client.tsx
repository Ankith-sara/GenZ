"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { StatusBadge } from "@genz/ui";
import { SlideOverDrawer } from "@genz/ui";
import {
  Search, ShoppingBag, Edit, EyeOff, CheckCircle2, Trash2, 
  Plus, ChevronRight, Tag, RotateCcw, Save, Loader2,
} from "lucide-react";
import { Button } from "@genz/ui";
import {
  adminSetProductStatus,
  adminDeleteProduct,
  adminUpdateProduct,
} from "./actions";

export interface ProductRecord {
  id: string;
  name: string;
  category?: string | null;
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

const ICON_STROKE = 1.75;
const PRESSABLE =
  "cursor-pointer transition-all duration-150 ease-out active:scale-[0.98] disabled:active:scale-100 disabled:cursor-not-allowed";
const FOCUS_RING =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#171717]/20 focus-visible:ring-offset-1 focus-visible:ring-offset-white";

export function ProductsTableClient({ initialProducts }: ProductsTableClientProps) {
  const [products, setProducts] = useState<ProductRecord[]>(initialProducts);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedProduct, setSelectedProduct] = useState<ProductRecord | null>(null);
  const [editingProduct, setEditingProduct] = useState<ProductRecord | null>(null);

  const [editForm, setEditForm] = useState<{
    name: string;
    category: string;
    price_inr: string;
    status: string;
    description: string;
  }>({
    name: "",
    category: "",
    price_inr: "",
    status: "published",
    description: "",
  });

  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  const counts = useMemo(() => {
    return {
      all: products.length,
      published: products.filter((p) => p.status === "published").length,
      draft: products.filter((p) => p.status !== "published").length,
    };
  }, [products]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    const found = Array.from(set);
    if (found.length > 0) return found;
    return ["Clothing", "Footwear", "Accessories", "Streetwear", "Outerwear"];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        !searchQuery ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.category || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.id.toLowerCase().includes(searchQuery.toLowerCase());

      const isPublished = p.status === "published";
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "published" && isPublished) ||
        (statusFilter === "draft" && !isPublished);

      const matchesCategory =
        categoryFilter === "all" || p.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [products, searchQuery, statusFilter, categoryFilter]);

  const handleOpenEdit = (product: ProductRecord) => {
    setEditingProduct(product);
    setEditForm({
      name: product.name || "",
      category: product.category || "",
      price_inr: product.price_inr ? String(product.price_inr) : "",
      status: product.status || "published",
      description: product.description || "",
    });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    const parsedPrice = editForm.price_inr ? Number(editForm.price_inr) : null;
    const updatedData: ProductRecord = {
      ...editingProduct,
      name: editForm.name.trim(),
      category: editForm.category.trim() || null,
      price_inr: parsedPrice,
      status: editForm.status,
      description: editForm.description.trim() || null,
      updated_at: new Date().toISOString(),
    };

    setIsSaving(true);

    // Optimistic UI update
    setProducts((prev) =>
      prev.map((p) => (p.id === editingProduct.id ? updatedData : p))
    );
    if (selectedProduct?.id === editingProduct.id) {
      setSelectedProduct(updatedData);
    }

    try {
      await adminUpdateProduct(editingProduct.id, {
        name: updatedData.name,
        category: updatedData.category,
        price_inr: updatedData.price_inr,
        status: updatedData.status,
        description: updatedData.description,
      });
      setEditingProduct(null);
    } catch (err) {
      console.error("Failed to save product:", err);
      // Rollback
      setProducts(initialProducts);
      alert("Failed to save product changes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleStatus = async (product: ProductRecord) => {
    const nextStatus = product.status === "published" ? "draft" : "published";
    setLoadingId(product.id);

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

  const tabs = [
    { label: "All Products", value: "all", count: counts.all },
    { label: "Published", value: "published", count: counts.published },
    { label: "Drafts", value: "draft", count: counts.draft },
  ];

  return (
    <div className="mx-auto max-w-[1440px] space-y-6 pb-12">
      {/* PAGE HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <nav className="mb-1.5 flex items-center gap-1.5 text-xs text-[#737373]">
            <span>Admin</span>
            <span>/</span>
            <span className="font-medium text-[#171717]">Product Catalog</span>
          </nav>
          <h1 className="text-xl font-semibold tracking-tight text-[#171717] sm:text-2xl">
            Product Catalog
          </h1>
          <p className="mt-1 text-xs text-[#737373] sm:text-sm">
            Manage catalog listings, pricing specs, and publication statuses across all sellers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/admin/dashboard/products/new">
            <Button className={`h-9 items-center gap-1.5 rounded-lg bg-[#171717] px-3.5 text-xs font-medium text-white shadow-xs hover:bg-[#262626] ${PRESSABLE} ${FOCUS_RING}`}>
              <Plus className="h-4 w-4" strokeWidth={ICON_STROKE} />
              <span>Add Product</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* SEGMENTED TAB NAVIGATION & SEARCH TOOLBAR */}
      <div className="space-y-3">
        {/* Navigation Tabs */}
        <div className="flex items-center overflow-x-auto pb-1 scrollbar-none">
          <div className="inline-flex items-center gap-1 rounded-xl border border-[#E5E5E5] bg-[#F5F5F4] p-1">
            {tabs.map((tab) => {
              const isActive = statusFilter === tab.value;
              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setStatusFilter(tab.value)}
                  className={`flex h-8 shrink-0 items-center gap-2 rounded-lg px-3 text-xs font-medium ${PRESSABLE} ${FOCUS_RING} ${
                    isActive
                      ? "bg-[#171717] text-white shadow-xs"
                      : "bg-transparent text-[#525252] hover:bg-white hover:text-[#171717]"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.25 font-mono text-[10px] font-semibold ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-[#E5E5E5] text-[#525252]"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#737373]" strokeWidth={ICON_STROKE} />
            <input
              type="text"
              placeholder="Search by product name, category, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`h-9 w-full rounded-lg border border-[#E5E5E5] bg-white pl-9 pr-3 text-xs text-[#171717] placeholder-[#A3A3A3] hover:border-[#D4D4D4] ${FOCUS_RING}`}
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className={`h-9 rounded-lg border border-[#E5E5E5] bg-white px-3 py-1.5 text-xs font-medium text-[#171717] shadow-xs hover:border-[#A3A3A3] ${PRESSABLE} ${FOCUS_RING}`}
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {(searchQuery || categoryFilter !== "all" || statusFilter !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                  setCategoryFilter("all");
                }}
                className={`inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#E5E5E5] bg-white px-3 text-xs font-medium text-[#525252] hover:bg-[#F5F5F4] hover:text-[#171717] ${PRESSABLE} ${FOCUS_RING}`}
              >
                <RotateCcw className="h-3.5 w-3.5 text-[#737373]" strokeWidth={ICON_STROKE} />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* TABLE DATA DISPLAY / EMPTY STATE */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-semibold text-[#171717] sm:text-base">
            Catalog Listings
          </h2>
          <span className="text-xs text-[#737373]">
            {filteredProducts.length} {filteredProducts.length === 1 ? "result" : "results"}
          </span>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="flex min-h-[240px] flex-col items-center justify-center rounded-xl border border-[#E5E5E5] bg-[#FAFAF9] px-6 py-10 text-center">
            <div className="mb-3.5 flex h-10 w-10 items-center justify-center rounded-full border border-[#E5E5E5] bg-white text-[#525252] shadow-xs">
              <ShoppingBag className="h-5 w-5 text-[#737373]" strokeWidth={ICON_STROKE} />
            </div>
            <h3 className="text-sm font-semibold text-[#171717] sm:text-base">
              No products found
            </h3>
            <p className="mt-1 max-w-sm text-xs text-[#737373] sm:text-sm">
              There are no catalog products matching the selected status, category, or search term.
            </p>
            {(searchQuery || statusFilter !== "all" || categoryFilter !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                  setCategoryFilter("all");
                }}
                className={`mt-4 inline-flex h-8 items-center gap-1.5 rounded-lg border border-[#E5E5E5] bg-white px-3 text-xs font-medium text-[#171717] hover:bg-[#F5F5F4] ${PRESSABLE} ${FOCUS_RING}`}
              >
                <RotateCcw className="h-3.5 w-3.5 text-[#737373]" strokeWidth={ICON_STROKE} />
                <span>Clear filters</span>
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-[#E5E5E5] bg-white shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[768px] text-left text-xs">
                <thead className="border-b border-[#E5E5E5] bg-[#FAFAF9] text-[11px] font-semibold text-[#737373] uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Product Details</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Price (INR)</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Last Updated</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E5E5] bg-white">
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
                        className={`group cursor-pointer transition-colors duration-150 ${
                          isSelected
                            ? "bg-[#FAFAF9]"
                            : "hover:bg-[#FAFAF9]/80"
                        } ${isLoadingThis ? "pointer-events-none opacity-50" : ""}`}
                      >
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[#E5E5E5] bg-[#FAFAF9]">
                              {imgThumb ? (
                                <Image
                                  src={imgThumb}
                                  alt={p.name}
                                  fill
                                  className="object-cover"
                                  unoptimized
                                />
                              ) : (
                                <ShoppingBag className="h-5 w-5 text-[#A3A3A3]" strokeWidth={ICON_STROKE} />
                              )}
                            </div>
                            <div className="min-w-0">
                              <span className="block font-semibold text-[#171717] group-hover:underline truncate">
                                {p.name}
                              </span>
                              <span className="block font-mono text-[10px] text-[#737373]">
                                ID: {p.id.slice(0, 10)}...
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3.5 text-[#525252]">
                          {p.category || "-"}
                        </td>

                        <td className="px-4 py-3.5 font-mono text-xs font-semibold text-[#171717]">
                          ₹{p.price_inr ? p.price_inr.toLocaleString() : "—"}
                        </td>

                        <td className="px-4 py-3.5">
                          <StatusBadge
                            status={isPublished ? "published" : "draft"}
                            label={isPublished ? "Published" : "Draft"}
                          />
                        </td>

                        <td className="px-4 py-3.5 font-mono text-[11px] text-[#737373]">
                          {p.updated_at
                            ? new Date(p.updated_at).toLocaleDateString("en-US", {
                                month: "short",
                                day: "2-digit",
                                year: "numeric",
                              })
                            : "-"}
                        </td>

                        <td className="px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(p)}
                              className={`inline-flex items-center gap-1 rounded-lg border border-[#E5E5E5] bg-white px-2.5 py-1 text-xs font-medium text-[#171717] hover:bg-[#F5F5F4] ${PRESSABLE} ${FOCUS_RING}`}
                            >
                              <Edit className="h-3.5 w-3.5 text-[#737373]" strokeWidth={ICON_STROKE} />
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setSelectedProduct(p)}
                              className={`inline-flex items-center gap-1 rounded-lg border border-[#E5E5E5] bg-white px-2.5 py-1 text-xs font-medium text-[#171717] hover:bg-[#F5F5F4] ${PRESSABLE} ${FOCUS_RING}`}
                            >
                              <span>Details</span>
                              <ChevronRight className="h-3.5 w-3.5 text-[#737373]" strokeWidth={ICON_STROKE} />
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
        )}
      </div>

      {/* SLIDE-OVER DRAWER FOR PRODUCT DETAILS */}
      {selectedProduct && !editingProduct && (
        <SlideOverDrawer
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
          title={selectedProduct.name}
          subtitle={`Product ID: ${selectedProduct.id}`}
          maxWidth="lg"
        >
          <div className="space-y-6">
            {/* Hero Image & Status Header */}
            <div className="flex flex-col items-center justify-center rounded-xl border border-[#E5E5E5] bg-[#FAFAF9] p-6 text-center">
              <div className="relative mb-4 h-40 w-40 overflow-hidden rounded-xl border border-[#E5E5E5] bg-white shadow-xs">
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
                  <div className="flex h-full w-full items-center justify-center text-[#A3A3A3]">
                    <ShoppingBag className="h-10 w-10" strokeWidth={ICON_STROKE} />
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2">
                <StatusBadge
                  status={selectedProduct.status === "published" ? "published" : "draft"}
                />
                {selectedProduct.category && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-[#E5E5E5] bg-white px-2.5 py-0.5 text-[10px] font-semibold text-[#171717]">
                    <Tag className="h-3 w-3 text-[#737373]" strokeWidth={ICON_STROKE} />
                    {selectedProduct.category}
                  </span>
                )}
                {selectedProduct.price_inr !== undefined && (
                  <span className="rounded-full border border-[#6EE7B7] bg-[#ECFDF5] px-2.5 py-0.5 font-mono text-[10px] font-semibold text-[#047857]">
                    ₹{selectedProduct.price_inr?.toLocaleString()}
                  </span>
                )}
              </div>
            </div>

            {/* Specifications Card */}
            <div className="space-y-3 rounded-xl border border-[#E5E5E5] bg-white p-4">
              <h3 className="border-b border-[#E5E5E5] pb-2 text-[10px] font-semibold tracking-wider text-[#171717] uppercase">
                Product Details
              </h3>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="block text-[#737373]">Category</span>
                  <span className="block font-semibold text-[#171717]">
                    {selectedProduct.category || "-"}
                  </span>
                </div>

                <div>
                  <span className="block text-[#737373]">Price (INR)</span>
                  <span className="block font-mono font-semibold text-[#171717]">
                    ₹{selectedProduct.price_inr?.toLocaleString() ?? "—"}
                  </span>
                </div>



                <div>
                  <span className="block text-[#737373]">Publication Status</span>
                  <span className="block font-semibold text-[#171717] capitalize">
                    {selectedProduct.status || "draft"}
                  </span>
                </div>

                <div className="col-span-2">
                  <span className="block text-[#737373]">Product ID</span>
                  <div className="mt-1 flex items-center justify-between rounded-lg border border-[#E5E5E5] bg-[#FAFAF9] px-3 py-1.5 font-mono text-[11px] text-[#171717]">
                    <span className="truncate">{selectedProduct.id}</span>
                    <button
                      type="button"
                      onClick={() => handleCopyId(selectedProduct.id)}
                      className={`ml-2 text-[10px] font-medium text-[#171717] hover:underline ${PRESSABLE}`}
                    >
                      {copiedId ? "Copied!" : "Copy"}
                    </button>
                  </div>
                </div>

                {selectedProduct.description && (
                  <div className="col-span-2 border-t border-[#E5E5E5] pt-3">
                    <span className="block text-[#737373]">Description</span>
                    <p className="mt-1 text-[#171717] leading-relaxed">
                      {selectedProduct.description}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Admin Actions */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-[#171717]">
                Management Actions
              </h4>

              <button
                type="button"
                onClick={() => handleOpenEdit(selectedProduct)}
                className={`flex w-full items-center justify-between rounded-xl border border-[#E5E5E5] bg-white px-4 py-2.5 text-xs font-medium text-[#171717] hover:bg-[#F5F5F4] ${PRESSABLE} ${FOCUS_RING}`}
              >
                <div className="flex items-center gap-2">
                  <Edit className="h-4 w-4 text-[#737373]" strokeWidth={ICON_STROKE} />
                  <span>Edit Product Details</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleToggleStatus(selectedProduct)}
                disabled={loadingId === selectedProduct.id}
                className={`flex w-full items-center justify-between rounded-xl border border-[#E5E5E5] bg-white px-4 py-2.5 text-xs font-medium text-[#171717] hover:bg-[#F5F5F4] ${PRESSABLE} ${FOCUS_RING}`}
              >
                <div className="flex items-center gap-2">
                  {selectedProduct.status === "published" ? (
                    <EyeOff className="h-4 w-4 text-amber-600" strokeWidth={ICON_STROKE} />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" strokeWidth={ICON_STROKE} />
                  )}
                  <span>
                    {selectedProduct.status === "published"
                      ? "Unpublish Product (Draft)"
                      : "Publish Product (Make Public)"}
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleDelete(selectedProduct)}
                disabled={loadingId === selectedProduct.id}
                className={`flex w-full items-center justify-between rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-medium text-rose-800 hover:bg-rose-100 ${PRESSABLE} ${FOCUS_RING}`}
              >
                <div className="flex items-center gap-2">
                  <Trash2 className="h-4 w-4 text-rose-600" strokeWidth={ICON_STROKE} />
                  <span>Delete Product Permanently</span>
                </div>
              </button>
            </div>
          </div>
        </SlideOverDrawer>
      )}

      {/* EDIT PRODUCT SLIDE-OVER DRAWER */}
      {editingProduct && (
        <SlideOverDrawer
          isOpen={!!editingProduct}
          onClose={() => setEditingProduct(null)}
          title={`Edit: ${editingProduct.name}`}
          subtitle={`Product ID: ${editingProduct.id}`}
          maxWidth="lg"
        >
          <form onSubmit={handleSaveEdit} className="space-y-5">
            <div className="space-y-4 rounded-xl border border-[#E5E5E5] bg-white p-4">
              <h3 className="border-b border-[#E5E5E5] pb-2 text-[10px] font-semibold tracking-wider text-[#171717] uppercase">
                Product Details Form
              </h3>

              {/* Title Input */}
              <div className="space-y-1">
                <label className="block text-xs font-medium text-[#171717]">
                  Product Title *
                </label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className={`h-9 w-full rounded-lg border border-[#E5E5E5] bg-white px-3 text-xs text-[#171717] placeholder-[#A3A3A3] ${FOCUS_RING}`}
                  placeholder="e.g. Vintage Oversized Hoodie"
                />
              </div>

              {/* Category & Price */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-[#171717]">
                    Category
                  </label>
                  <input
                    type="text"
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    className={`h-9 w-full rounded-lg border border-[#E5E5E5] bg-white px-3 text-xs text-[#171717] placeholder-[#A3A3A3] ${FOCUS_RING}`}
                    placeholder="e.g. Streetwear"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-medium text-[#171717]">
                    Price (INR)
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    value={editForm.price_inr}
                    onChange={(e) => setEditForm({ ...editForm, price_inr: e.target.value })}
                    className={`h-9 w-full rounded-lg border border-[#E5E5E5] bg-white px-3 text-xs text-[#171717] placeholder-[#A3A3A3] ${FOCUS_RING}`}
                    placeholder="e.g. 1499"
                  />
                </div>
              </div>

              {/* Status & Age Group */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-[#171717]">
                    Status
                  </label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className={`h-9 w-full rounded-lg border border-[#E5E5E5] bg-white px-3 text-xs text-[#171717] ${FOCUS_RING} ${PRESSABLE}`}
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>


              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="block text-xs font-medium text-[#171717]">
                  Description
                </label>
                <textarea
                  rows={4}
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className={`w-full rounded-lg border border-[#E5E5E5] bg-white p-3 text-xs text-[#171717] placeholder-[#A3A3A3] ${FOCUS_RING}`}
                  placeholder="Enter product description and specifications..."
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                disabled={isSaving}
                className={`h-9 rounded-lg border border-[#E5E5E5] bg-white px-4 text-xs font-medium text-[#525252] hover:bg-[#F5F5F4] ${PRESSABLE} ${FOCUS_RING}`}
              >
                Cancel
              </button>
              <Button
                type="submit"
                disabled={isSaving}
                className={`h-9 items-center gap-1.5 rounded-lg bg-[#171717] px-4 text-xs font-medium text-white shadow-xs hover:bg-[#262626] ${PRESSABLE} ${FOCUS_RING}`}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-3.5 w-3.5" strokeWidth={ICON_STROKE} />
                    <span>Save Changes</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </SlideOverDrawer>
      )}
    </div>
  );
}
