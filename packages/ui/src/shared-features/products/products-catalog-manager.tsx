"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Search, ShoppingBag, Edit, EyeOff, CheckCircle2, 
  Trash2, Plus, ChevronRight, Tag, RotateCcw, 
  Save, Loader2, ExternalLink, Copy, Check,
} from "lucide-react";
import { Button } from "../../components/button";
import { StatusBadge } from "../../components/status-badge";
import { SlideOverDrawer } from "../../components/slide-over-drawer";

export interface SharedProductRecord {
  id: string;
  name: string;
  category?: string | null;
  description?: string | null;
  price_inr?: number | null;
  status?: string | null;
  cover_image_path?: string | null;
  image_url?: string | null;
  images?: string[] | null;
  materials?: string[] | null;
  inventory_count?: number | null;
  seller_id?: string | null;
  created_by?: string | null;
  updated_by?: string | null;
  sku?: string | null;
  low_stock_threshold?: number | null;
  track_inventory?: boolean;
  is_featured?: boolean;
  is_new_arrival?: boolean;
  is_best_seller?: boolean;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface ProductsCatalogManagerProps {
  role: "admin" | "seller";
  initialProducts: SharedProductRecord[];
  onUpdateStatus?: (
    productId: string,
    nextStatus: "published" | "draft"
  ) => Promise<void>;
  onUpdateProduct?: (
    productId: string,
    data: {
      name: string;
      category?: string | null;
      price_inr?: number | null;
      status?: string | null;
      description?: string | null;
    }
  ) => Promise<void>;
  onDeleteProduct?: (productId: string) => Promise<void>;
  newProductHref?: string;
  editProductHref?: (id: string) => string;
  storefrontHref?: (id: string) => string;
}

const ICON_STROKE = 1.75;
const PRESSABLE =
  "cursor-pointer transition-all duration-150 ease-out active:scale-[0.98] disabled:active:scale-100 disabled:cursor-not-allowed";
const FOCUS_RING =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#171717]/20 focus-visible:ring-offset-1 focus-visible:ring-offset-white";

function resolveProductImage(p: SharedProductRecord): string | null {
  if (p.image_url && (p.image_url.startsWith("http://") || p.image_url.startsWith("https://") || p.image_url.startsWith("/"))) {
    return p.image_url;
  }
  if (p.images && p.images.length > 0 && p.images[0]) {
    const first = p.images[0];
    if (first.startsWith("http://") || first.startsWith("https://") || first.startsWith("/")) {
      return first;
    }
  }
  if (p.cover_image_path) {
    if (
      p.cover_image_path.startsWith("http://") ||
      p.cover_image_path.startsWith("https://")
    ) {
      return p.cover_image_path;
    }
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (supabaseUrl) {
      const cleanUrl = supabaseUrl.replace(/\/+$/, "");
      const cleanPath = p.cover_image_path.replace(/^\/+/, "");
      return `${cleanUrl}/storage/v1/object/public/product-media/${cleanPath}`;
    }
    return p.cover_image_path.startsWith("/")
      ? p.cover_image_path
      : `/${p.cover_image_path}`;
  }
  return null;
}

export function ProductsCatalogManager({
  role,
  initialProducts,
  onUpdateStatus,
  onUpdateProduct,
  onDeleteProduct,
  newProductHref = role === "admin"
    ? "/admin/dashboard/products/new"
    : "/dashboard/products/new",
  editProductHref = (id) =>
    role === "admin"
      ? `/admin/dashboard/products/${id}`
      : `/dashboard/products/${id}`,
  storefrontHref = (id) => `/products/${id}`,
}: ProductsCatalogManagerProps) {
  const [products, setProducts] = useState<SharedProductRecord[]>(initialProducts);

  useEffect(() => {
    setProducts(initialProducts);
  }, [initialProducts]);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedProduct, setSelectedProduct] = useState<SharedProductRecord | null>(null);
  const [editingProduct, setEditingProduct] = useState<SharedProductRecord | null>(null);

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

  // Status counts
  const counts = useMemo(() => {
    return {
      all: products.length,
      published: products.filter((p) => p.status === "published").length,
      draft: products.filter((p) => p.status !== "published").length,
    };
  }, [products]);

  // Unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    const found = Array.from(set);
    if (found.length > 0) return found;
    return [
      "Etikoppaka Wooden Toys",
      "Kondapalli Toys",
      "Wooden Toys & Crafts",
      "Home & Furniture",
      "Handicrafts",
    ];
  }, [products]);

  // Filtered dataset
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        (p.category || "").toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        (p.materials && p.materials.some((m) => m.toLowerCase().includes(q)));

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

  const handleOpenEdit = (product: SharedProductRecord) => {
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
    const updatedData: SharedProductRecord = {
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
      if (onUpdateProduct) {
        await onUpdateProduct(editingProduct.id, {
          name: updatedData.name,
          category: updatedData.category,
          price_inr: updatedData.price_inr,
          status: updatedData.status,
          description: updatedData.description,
        });
      }
      setEditingProduct(null);
      toast.success("Product changes saved successfully!");
    } catch (err: any) {
      console.error("Failed to save product:", err);
      setProducts(initialProducts);
      toast.error("Failed to save product changes", {
        description: err?.message || "Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleStatus = async (product: SharedProductRecord) => {
    const nextStatus = product.status === "published" ? "draft" : "published";
    setLoadingId(product.id);

    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, status: nextStatus } : p))
    );
    if (selectedProduct?.id === product.id) {
      setSelectedProduct({ ...selectedProduct, status: nextStatus });
    }

    try {
      if (onUpdateStatus) {
        await onUpdateStatus(product.id, nextStatus);
      }
      toast.success(
        nextStatus === "published"
          ? `"${product.name}" published to live storefront!`
          : `"${product.name}" moved to draft`,
        {
          description:
            nextStatus === "published"
              ? "Product is now live and visible to all shoppers."
              : "Product is now hidden from the marketplace.",
        }
      );
    } catch (err: any) {
      console.error("Failed to update status:", err);
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, status: product.status } : p))
      );
      if (selectedProduct?.id === product.id) {
        setSelectedProduct(product);
      }
      toast.error("Failed to update product status", {
        description: err?.message || "Please try again.",
      });
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async (product: SharedProductRecord) => {
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
      if (onDeleteProduct) {
        await onDeleteProduct(product.id);
      }
      toast.success(`"${product.name}" deleted successfully.`);
    } catch (err: any) {
      console.error("Failed to delete product:", err);
      setProducts(previousProducts);
      toast.error("Failed to delete product", {
        description: err?.message || "Please try again.",
      });
    } finally {
      setLoadingId(null);
    }
  };

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(true);
    toast.success("Product ID copied to clipboard");
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
            <span>{role === "admin" ? "Admin" : "Seller Desk"}</span>
            <span>/</span>
            <span className="font-medium text-[#171717]">Product Catalog</span>
          </nav>
          <h1 className="text-xl font-semibold tracking-tight text-[#171717] sm:text-2xl">
            {role === "admin" ? "Product Catalog" : "Factory Product Catalog"}
          </h1>
          <p className="mt-1 text-xs text-[#737373] sm:text-sm">
            {role === "admin"
              ? "Manage catalog listings, pricing specs, and publication statuses across all sellers."
              : "Manage your manufacturing catalog listings, prices, variants, and draft publications."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href={newProductHref}>
            <Button
              className={`h-9 items-center gap-1.5 rounded-lg bg-[#171717] px-3.5 text-xs font-medium text-white shadow-xs hover:bg-[#262626] ${PRESSABLE} ${FOCUS_RING}`}
            >
              <Plus className="h-4 w-4" strokeWidth={ICON_STROKE} />
              <span>Add New Product</span>
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
            <Search
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#737373]"
              strokeWidth={ICON_STROKE}
            />
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
                <RotateCcw
                  className="h-3.5 w-3.5 text-[#737373]"
                  strokeWidth={ICON_STROKE}
                />
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
            {filteredProducts.length}{" "}
            {filteredProducts.length === 1 ? "result" : "results"}
          </span>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="flex min-h-[240px] flex-col items-center justify-center rounded-xl border border-[#E5E5E5] bg-[#FAFAF9] px-6 py-10 text-center">
            <div className="mb-3.5 flex h-10 w-10 items-center justify-center rounded-full border border-[#E5E5E5] bg-white text-[#525252] shadow-xs">
              <ShoppingBag
                className="h-5 w-5 text-[#737373]"
                strokeWidth={ICON_STROKE}
              />
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
                <RotateCcw
                  className="h-3.5 w-3.5 text-[#737373]"
                  strokeWidth={ICON_STROKE}
                />
                <span>Clear filters</span>
              </button>
            )}
          </div>
        ) : (
          <>
            {/* DESKTOP TABLE VIEW */}
            <div className="hidden sm:block overflow-hidden rounded-xl border border-[#E5E5E5] bg-white shadow-xs">
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
                      const imgThumb = resolveProductImage(p);
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
                                  <img
                                    src={imgThumb}
                                    alt={p.name}
                                    className="h-full w-full object-cover"
                                    onError={(e) => {
                                      e.currentTarget.style.display = "none";
                                    }}
                                  />
                                ) : (
                                  <ShoppingBag
                                    className="h-5 w-5 text-[#A3A3A3]"
                                    strokeWidth={ICON_STROKE}
                                  />
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
                                  day: "numeric",
                                  year: "numeric",
                                })
                              : "-"}
                          </td>

                          <td className="px-4 py-3.5 text-right">
                            <div
                              className="flex items-center justify-end gap-1"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {/* Toggle Status Button */}
                              <button
                                type="button"
                                title={isPublished ? "Set to Draft" : "Publish Listing"}
                                onClick={() => handleToggleStatus(p)}
                                disabled={isLoadingThis}
                                className={`flex h-7 w-7 items-center justify-center rounded-md border border-[#E5E5E5] bg-white text-[#525252] hover:bg-[#F5F5F4] hover:text-[#171717] ${PRESSABLE} ${FOCUS_RING}`}
                              >
                                {isLoadingThis ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin text-[#737373]" />
                                ) : isPublished ? (
                                  <EyeOff className="h-3.5 w-3.5 text-[#737373]" strokeWidth={ICON_STROKE} />
                                ) : (
                                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" strokeWidth={ICON_STROKE} />
                                )}
                              </button>

                              {/* Quick Edit */}
                              <button
                                type="button"
                                title="Quick Edit"
                                onClick={() => handleOpenEdit(p)}
                                className={`flex h-7 w-7 items-center justify-center rounded-md border border-[#E5E5E5] bg-white text-[#525252] hover:bg-[#F5F5F4] hover:text-[#171717] ${PRESSABLE} ${FOCUS_RING}`}
                              >
                                <Edit className="h-3.5 w-3.5 text-[#737373]" strokeWidth={ICON_STROKE} />
                              </button>

                              {/* Delete */}
                              <button
                                type="button"
                                title="Delete Product"
                                onClick={() => handleDelete(p)}
                                disabled={isLoadingThis}
                                className={`flex h-7 w-7 items-center justify-center rounded-md border border-[#E5E5E5] bg-white text-rose-600 hover:border-rose-200 hover:bg-rose-50 ${PRESSABLE} ${FOCUS_RING}`}
                              >
                                <Trash2 className="h-3.5 w-3.5" strokeWidth={ICON_STROKE} />
                              </button>

                              {/* View Details Drawer */}
                              <button
                                type="button"
                                title="View Details"
                                onClick={() => setSelectedProduct(p)}
                                className={`flex h-7 w-7 items-center justify-center rounded-md border border-[#E5E5E5] bg-white text-[#525252] hover:bg-[#F5F5F4] hover:text-[#171717] ${PRESSABLE} ${FOCUS_RING}`}
                              >
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

            {/* MOBILE CARDS VIEW (< sm) */}
            <div className="space-y-3 sm:hidden">
              {filteredProducts.map((p) => {
                const imgThumb = resolveProductImage(p);
                const isPublished = p.status === "published";
                const isLoadingThis = loadingId === p.id;

                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedProduct(p)}
                    className="cursor-pointer space-y-3 rounded-xl border border-[#E5E5E5] bg-white p-4 shadow-xs transition-colors hover:border-[#D4D4D4]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[#E5E5E5] bg-[#FAFAF9]">
                          {imgThumb ? (
                            <img
                              src={imgThumb}
                              alt={p.name}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                          ) : (
                            <ShoppingBag className="h-5 w-5 text-[#A3A3A3]" strokeWidth={ICON_STROKE} />
                          )}
                        </div>
                        <div>
                          <span className="block text-sm font-semibold text-[#171717]">
                            {p.name}
                          </span>
                          <span className="block font-mono text-[10px] text-[#737373]">
                            {p.category || "General"} · ID: {p.id.slice(0, 8)}...
                          </span>
                        </div>
                      </div>

                      <StatusBadge
                        status={isPublished ? "published" : "draft"}
                        label={isPublished ? "Published" : "Draft"}
                      />
                    </div>

                    <div className="flex items-center justify-between border-t border-[#F0F0EC] pt-2.5 text-xs">
                      <div>
                        <span className="block text-[10px] font-semibold text-[#8C8C85]">
                          Price
                        </span>
                        <span className="font-mono text-xs font-bold text-[#1A1A18]">
                          ₹{p.price_inr ? p.price_inr.toLocaleString() : "—"}
                        </span>
                      </div>

                      <div
                        className="flex items-center gap-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(p)}
                          disabled={isLoadingThis}
                          className={`flex h-7 items-center gap-1 rounded-md border border-[#E5E5E5] bg-white px-2 text-[11px] font-medium text-[#525252] ${PRESSABLE}`}
                        >
                          {isPublished ? "Draft" : "Publish"}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenEdit(p)}
                          className={`flex h-7 items-center gap-1 rounded-md border border-[#E5E5E5] bg-white px-2 text-[11px] font-medium text-[#525252] ${PRESSABLE}`}
                        >
                          <Edit className="h-3 w-3" />
                          <span>Edit</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* SLIDE-OVER DRAWER: PRODUCT DETAILS INSPECTION */}
      <SlideOverDrawer
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        title={selectedProduct ? selectedProduct.name : "Product Details"}
      >
        {selectedProduct && (
          <div className="space-y-6 pb-6">
            {/* Product Image preview */}
            <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-[#E5E5E5] bg-[#FAFAF9]">
              {resolveProductImage(selectedProduct) ? (
                <img
                  src={resolveProductImage(selectedProduct)!}
                  alt={selectedProduct.name}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-[#A3A3A3]">
                  <ShoppingBag className="h-10 w-10" strokeWidth={ICON_STROKE} />
                </div>
              )}
            </div>

            {/* Quick Actions Strip */}
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenEdit(selectedProduct)}
                className={`h-8 gap-1.5 text-xs ${PRESSABLE}`}
              >
                <Edit className="h-3.5 w-3.5" />
                <span>Quick Edit</span>
              </Button>

              <Link href={editProductHref(selectedProduct.id)}>
                <Button
                  variant="outline"
                  size="sm"
                  className={`h-8 gap-1.5 text-xs ${PRESSABLE}`}
                >
                  <Tag className="h-3.5 w-3.5" />
                  <span>Full Studio Edit</span>
                </Button>
              </Link>

              <Link
                href={storefrontHref(selectedProduct.id)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  variant="outline"
                  size="sm"
                  className={`h-8 gap-1.5 text-xs ${PRESSABLE}`}
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>View Storefront</span>
                </Button>
              </Link>

              <button
                type="button"
                onClick={() => handleToggleStatus(selectedProduct)}
                className={`ml-auto flex h-8 items-center gap-1.5 rounded-lg border border-[#E5E5E5] bg-white px-3 text-xs font-medium text-[#525252] hover:bg-[#F5F5F4] hover:text-[#171717] ${PRESSABLE}`}
              >
                {selectedProduct.status === "published" ? (
                  <>
                    <EyeOff className="h-3.5 w-3.5" />
                    <span>Set Draft</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Publish</span>
                  </>
                )}
              </button>
            </div>

            {/* Specifications Card */}
            <div className="space-y-3 rounded-xl border border-[#E5E5E5] bg-white p-4">
              <h4 className="text-xs font-semibold text-[#171717] uppercase tracking-wider">
                Product Specifications
              </h4>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="block text-[#737373]">Category</span>
                  <span className="font-medium text-[#171717]">
                    {selectedProduct.category || "—"}
                  </span>
                </div>

                <div>
                  <span className="block text-[#737373]">Price (INR)</span>
                  <span className="font-mono font-semibold text-[#171717]">
                    ₹{selectedProduct.price_inr ? selectedProduct.price_inr.toLocaleString() : "—"}
                  </span>
                </div>

                <div>
                  <span className="block text-[#737373]">Status</span>
                  <StatusBadge
                    status={selectedProduct.status === "published" ? "published" : "draft"}
                    label={selectedProduct.status === "published" ? "Published" : "Draft"}
                  />
                </div>

                <div>
                  <span className="block text-[#737373]">Product ID</span>
                  <div className="flex items-center gap-1">
                    <span className="font-mono text-[10px] text-[#525252]">
                      {selectedProduct.id.slice(0, 12)}...
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyId(selectedProduct.id)}
                      className="text-[#737373] hover:text-[#171717]"
                      title="Copy full ID"
                    >
                      {copiedId ? (
                        <Check className="h-3 w-3 text-emerald-600" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </button>
                  </div>
                </div>

                {selectedProduct.sku && (
                  <div>
                    <span className="block text-[#737373]">SKU</span>
                    <span className="font-mono font-medium text-[#171717]">
                      {selectedProduct.sku}
                    </span>
                  </div>
                )}

                {selectedProduct.inventory_count !== null && selectedProduct.inventory_count !== undefined && (
                  <div>
                    <span className="block text-[#737373]">Stock Level</span>
                    <span className="font-mono font-medium text-[#171717]">
                      {selectedProduct.inventory_count} units
                    </span>
                  </div>
                )}


                {selectedProduct.created_by && (
                  <div>
                    <span className="block text-[#737373]">Created By</span>
                    <span className="font-mono text-[10px] text-[#525252]">
                      {selectedProduct.created_by.slice(0, 10)}...
                    </span>
                  </div>
                )}

                {selectedProduct.updated_by && (
                  <div>
                    <span className="block text-[#737373]">Last Updated By</span>
                    <span className="font-mono text-[10px] text-[#525252]">
                      {selectedProduct.updated_by.slice(0, 10)}...
                    </span>
                  </div>
                )}

                {selectedProduct.materials && selectedProduct.materials.length > 0 && (
                  <div className="col-span-2">
                    <span className="block text-[#737373] mb-1">Materials</span>
                    <div className="flex flex-wrap gap-1">
                      {selectedProduct.materials.map((m, i) => (
                        <span
                          key={i}
                          className="rounded-md bg-[#F5F5F4] px-2 py-0.5 text-[10px] font-medium text-[#525252]"
                        >
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2 rounded-xl border border-[#E5E5E5] bg-white p-4">
              <h4 className="text-xs font-semibold text-[#171717] uppercase tracking-wider">
                Craft Story & Description
              </h4>
              <p className="text-xs leading-relaxed text-[#525252] whitespace-pre-wrap">
                {selectedProduct.description || "No description provided for this listing."}
              </p>
            </div>

            {/* Danger Zone */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => handleDelete(selectedProduct)}
                className={`w-full flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50/50 p-2.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 ${PRESSABLE}`}
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete This Product</span>
              </button>
            </div>
          </div>
        )}
      </SlideOverDrawer>

      {/* QUICK EDIT DRAWER / MODAL */}
      <SlideOverDrawer
        isOpen={!!editingProduct}
        onClose={() => setEditingProduct(null)}
        title="Quick Edit Product"
      >
        {editingProduct && (
          <form onSubmit={handleSaveEdit} className="space-y-5 pb-6">
            <p className="text-xs text-[#737373]">
              Update basic listing details quickly without navigating to the full editor studio.
            </p>

            <div>
              <label className="block text-xs font-semibold text-[#171717] mb-1">
                Product Title *
              </label>
              <input
                type="text"
                required
                value={editForm.name}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, name: e.target.value }))
                }
                className={`h-9 w-full rounded-lg border border-[#E5E5E5] bg-white px-3 text-xs text-[#171717] ${FOCUS_RING}`}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#171717] mb-1">
                Category
              </label>
              <select
                value={editForm.category}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, category: e.target.value }))
                }
                className={`h-9 w-full rounded-lg border border-[#E5E5E5] bg-white px-3 text-xs text-[#171717] ${FOCUS_RING}`}
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#171717] mb-1">
                Wholesale Price (INR ₹)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={editForm.price_inr}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, price_inr: e.target.value }))
                }
                className={`h-9 w-full rounded-lg border border-[#E5E5E5] bg-white px-3 text-xs text-[#171717] ${FOCUS_RING}`}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#171717] mb-1">
                Status
              </label>
              <select
                value={editForm.status}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, status: e.target.value }))
                }
                className={`h-9 w-full rounded-lg border border-[#E5E5E5] bg-white px-3 text-xs text-[#171717] ${FOCUS_RING}`}
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#171717] mb-1">
                Description
              </label>
              <textarea
                rows={4}
                value={editForm.description}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, description: e.target.value }))
                }
                className={`w-full rounded-lg border border-[#E5E5E5] bg-white p-3 text-xs text-[#171717] ${FOCUS_RING}`}
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#E5E5E5]">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingProduct(null)}
                className={`h-9 text-xs ${PRESSABLE}`}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={isSaving}
                className={`h-9 gap-1.5 bg-[#171717] text-xs font-medium text-white hover:bg-[#262626] ${PRESSABLE}`}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-3.5 w-3.5" />
                    <span>Save Changes</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </SlideOverDrawer>
    </div>
  );
}
