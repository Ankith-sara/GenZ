"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { clsx } from "clsx";
import {
  Search,
  ShoppingBag,
  Edit,
  Eye,
  EyeOff,
  CheckCircle2,
  Trash2,
  Plus,
  ChevronDown,
  Tag,
  RotateCcw,
  Save,
  Loader2,
  ExternalLink,
  Copy,
  Check,
  Package,
  Clock,
  AlertTriangle,
  ArrowUpDown,
  Boxes,
  LayoutGrid,
  List,
  Sparkles,
  Star,
  Flame,
  X,
} from "lucide-react";
import { Button } from "../../components/button";
import { StatusBadge } from "../../components/status-badge";
import { SlideOverDrawer } from "../../components/slide-over-drawer";
import { ActionDropdown, type ActionItem } from "../../components/action-dropdown";

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
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-1 focus-visible:ring-offset-background";

function resolveProductImage(p: SharedProductRecord): string | null {
  if (
    p.image_url &&
    (p.image_url.startsWith("http://") ||
      p.image_url.startsWith("https://") ||
      p.image_url.startsWith("/"))
  ) {
    return p.image_url;
  }
  if (p.images && p.images.length > 0 && p.images[0]) {
    const first = p.images[0];
    if (
      first.startsWith("http://") ||
      first.startsWith("https://") ||
      first.startsWith("/")
    ) {
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

interface FilterOption {
  value: string;
  label: string;
  count?: number;
  icon?: React.ReactNode;
  colorDot?: string;
}

interface FilterDropdownProps {
  label: string;
  icon?: React.ReactNode;
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
  align?: "left" | "right";
  placeholder?: string;
}

function FilterDropdown({
  label,
  icon,
  value,
  options,
  onChange,
  align = "left",
  placeholder,
}: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const selectedOption = options.find((o) => o.value === value);
  const isActive = value !== "all";

  return (
    <div ref={dropdownRef} className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={clsx(
          "inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg border px-3.5 text-sm font-medium shadow-sm transition-all select-none",
          isActive
            ? "border-foreground/40 bg-foreground/5 text-foreground ring-foreground/10 font-semibold ring-1"
            : "border-border bg-card text-foreground hover:border-foreground/30 hover:bg-muted/40",
          isOpen && "ring-primary/20 border-foreground/30 ring-2"
        )}
      >
        {icon && (
          <span
            className={clsx(
              "h-3.5 w-3.5 shrink-0",
              isActive ? "text-foreground" : "text-muted-foreground"
            )}
          >
            {icon}
          </span>
        )}
        <span className="whitespace-nowrap">
          {selectedOption ? selectedOption.label : placeholder || label}
        </span>
        {selectedOption?.count !== undefined && (
          <span
            className={clsx(
              "py-0.2 ml-0.5 rounded-full px-1.5 text-[10px] font-semibold",
              isActive
                ? "bg-foreground/15 text-foreground"
                : "bg-muted text-muted-foreground"
            )}
          >
            {selectedOption.count}
          </span>
        )}
        <ChevronDown
          className={clsx(
            "h-3 w-3 shrink-0 transition-transform duration-200",
            isActive ? "text-foreground" : "text-muted-foreground",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {isOpen && (
        <div
          className={clsx(
            "border-border/70 bg-card/95 backdrop-blur-xl animate-in fade-in-80 zoom-in-95 absolute z-50 mt-2 max-w-[320px] min-w-[220px] overflow-hidden rounded-xl border p-2 shadow-2xl ring-1 ring-black/5 duration-150",
            align === "right" ? "right-0" : "left-0"
          )}
        >
          <div className="text-muted-foreground px-2.5 py-1.5 text-[10px] font-bold tracking-wider uppercase">
            {label}
          </div>
          <div className="max-h-60 space-y-0.5 overflow-y-auto">
            {options.map((option) => {
              const isOptionSelected = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={clsx(
                    "flex w-full cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors select-none",
                    isOptionSelected
                      ? "bg-muted text-foreground font-semibold"
                      : "text-foreground hover:bg-muted/60"
                  )}
                >
                  <div className="flex min-w-0 items-center gap-2">
                    {option.colorDot && (
                      <span
                        className={clsx(
                          "h-2 w-2 shrink-0 rounded-full",
                          option.colorDot
                        )}
                      />
                    )}
                    {option.icon && (
                      <span className="text-muted-foreground h-3.5 w-3.5 shrink-0">
                        {option.icon}
                      </span>
                    )}
                    <span className="truncate">{option.label}</span>
                  </div>

                  <div className="flex shrink-0 items-center gap-1.5">
                    {option.count !== undefined && (
                      <span
                        className={clsx(
                          "py-0.2 rounded-full px-1.5 text-[10px]",
                          isOptionSelected
                            ? "bg-foreground/15 text-foreground font-bold"
                            : "bg-muted text-muted-foreground font-medium"
                        )}
                      >
                        {option.count}
                      </span>
                    )}
                    {isOptionSelected && (
                      <Check className="text-foreground h-3.5 w-3.5 stroke-[2.5]" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
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
    role === "admin" ? `/admin/dashboard/products/${id}` : `/dashboard/products/${id}`,
  storefrontHref = (id) => `/products/${id}`,
}: ProductsCatalogManagerProps) {
  const [products, setProducts] = useState<SharedProductRecord[]>(initialProducts);
  const [prevInitialProducts, setPrevInitialProducts] = useState(initialProducts);

  if (initialProducts !== prevInitialProducts) {
    setPrevInitialProducts(initialProducts);
    setProducts(initialProducts);
  }

  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [priceRangeFilter, setPriceRangeFilter] = useState("all");
  const [badgeFilter, setBadgeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedProduct, setSelectedProduct] = useState<SharedProductRecord | null>(
    null
  );
  const [editingProduct, setEditingProduct] = useState<SharedProductRecord | null>(
    null
  );

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

  // Status counts & KPI metrics
  const kpis = useMemo(() => {
    const totalCount = products.length;
    const publishedCount = products.filter((p) => p.status === "published").length;
    const draftCount = products.filter((p) => p.status !== "published").length;
    const featuredCount = products.filter((p) => Boolean(p.is_featured)).length;
    const newArrivalCount = products.filter((p) => Boolean(p.is_new_arrival)).length;
    const bestSellerCount = products.filter((p) => Boolean(p.is_best_seller)).length;

    return {
      totalCount,
      publishedCount,
      draftCount,
      featuredCount,
      newArrivalCount,
      bestSellerCount,
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

  // Filtered & sorted dataset
  const filteredProducts = useMemo(() => {
    const list = products.filter((p) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        (p.category || "").toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        (p.sku || "").toLowerCase().includes(q) ||
        (p.materials && p.materials.some((m) => m.toLowerCase().includes(q)));

      const isPublished = p.status === "published";
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "published" && isPublished) ||
        (statusFilter === "draft" && !isPublished);

      const matchesCategory = categoryFilter === "all" || p.category === categoryFilter;

      const price = p.price_inr || 0;
      const matchesPrice =
        priceRangeFilter === "all" ||
        (priceRangeFilter === "under_500" && price < 500) ||
        (priceRangeFilter === "500_1000" && price >= 500 && price <= 1000) ||
        (priceRangeFilter === "1000_2500" && price > 1000 && price <= 2500) ||
        (priceRangeFilter === "above_2500" && price > 2500);

      const matchesBadge =
        badgeFilter === "all" ||
        (badgeFilter === "featured" && p.is_featured) ||
        (badgeFilter === "new_arrival" && p.is_new_arrival) ||
        (badgeFilter === "best_seller" && p.is_best_seller);

      return (
        matchesSearch &&
        matchesStatus &&
        matchesCategory &&
        matchesPrice &&
        matchesBadge
      );
    });

    return list.sort((a, b) => {
      if (sortBy === "oldest") {
        return (
          new Date(a.created_at || a.updated_at || 0).getTime() -
          new Date(b.created_at || b.updated_at || 0).getTime()
        );
      }
      if (sortBy === "price_asc") {
        return (a.price_inr || 0) - (b.price_inr || 0);
      }
      if (sortBy === "price_desc") {
        return (b.price_inr || 0) - (a.price_inr || 0);
      }
        return (a.inventory_count || 0) - (b.inventory_count || 0);
      }
      if (sortBy === "name_asc") {
        return a.name.localeCompare(b.name);
      }
      // default: newest
      return (
        new Date(b.updated_at || b.created_at || 0).getTime() -
        new Date(a.updated_at || a.created_at || 0).getTime()
      );
    });
  }, [
    products,
    searchQuery,
    statusFilter,
    categoryFilter,
    priceRangeFilter,
    badgeFilter,
    sortBy,
  ]);

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
    } catch (err) {
      console.error("Failed to save product:", err);
      setProducts(initialProducts);
      toast.error("Failed to save product changes", {
        description: err instanceof Error ? err.message : "Please try again.",
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
    } catch (err) {
      console.error("Failed to update status:", err);
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, status: product.status } : p))
      );
      if (selectedProduct?.id === product.id) {
        setSelectedProduct(product);
      }
      toast.error("Failed to update product status", {
        description: err instanceof Error ? err.message : "Please try again.",
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
    } catch (err) {
      console.error("Failed to delete product:", err);
      setProducts(previousProducts);
      toast.error("Failed to delete product", {
        description: err instanceof Error ? err.message : "Please try again.",
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

  const getActionItems = (p: SharedProductRecord): ActionItem[] => [
    {
      label: "View Details",
      icon: <Eye className="h-3.5 w-3.5" />,
      onClick: () => setSelectedProduct(p),
    },
    {
      label: "Full Studio Edit",
      icon: <Tag className="h-3.5 w-3.5" />,
      onClick: () => {
        window.location.href = editProductHref(p.id);
      },
    },
    {
      label: "Quick Edit",
      icon: <Edit className="h-3.5 w-3.5" />,
      onClick: () => handleOpenEdit(p),
    },
    {
      label: p.status === "published" ? "Unpublish to Draft" : "Publish Listing",
      icon:
        p.status === "published" ? (
          <EyeOff className="h-3.5 w-3.5" />
        ) : (
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
        ),
      onClick: () => handleToggleStatus(p),
    },
    {
      label: "View Storefront",
      icon: <ExternalLink className="h-3.5 w-3.5" />,
      onClick: () => {
        window.open(storefrontHref(p.id), "_blank");
      },
    },
    {
      label: "Copy Product ID",
      icon: <Copy className="h-3.5 w-3.5" />,
      onClick: () => handleCopyId(p.id),
    },
    {
      label: "Delete Product",
      icon: <Trash2 className="h-3.5 w-3.5 text-rose-600" />,
      variant: "destructive",
      onClick: () => handleDelete(p),
    },
  ];

  const statusOptions: FilterOption[] = [
    { value: "all", label: "All Statuses", count: kpis.totalCount },
    {
      value: "published",
      label: "Published",
      count: kpis.publishedCount,
      colorDot: "bg-emerald-500",
    },
    {
      value: "draft",
      label: "Drafts",
      count: kpis.draftCount,
      colorDot: "bg-amber-500",
    },
  ];

  const categoryOptions: FilterOption[] = [
    { value: "all", label: "All Categories", count: kpis.totalCount },
    ...categories.map((c) => ({
      value: c,
      label: c,
      count: products.filter((p) => p.category === c).length,
    })),
  ];

  const priceOptions: FilterOption[] = [
    { value: "all", label: "All Prices" },
    { value: "under_500", label: "Under ₹500" },
    { value: "500_1000", label: "₹500 – ₹1,000" },
    { value: "1000_2500", label: "₹1,000 – ₹2,500" },
    { value: "above_2500", label: "Above ₹2,500" },
  ];

  const badgeOptions: FilterOption[] = [
    { value: "all", label: "All Highlights", count: kpis.totalCount },
    {
      value: "featured",
      label: "Featured Only",
      count: kpis.featuredCount,
      icon: <Star className="h-3 w-3 fill-amber-400 text-amber-500" />,
    },
    {
      value: "new_arrival",
      label: "New Arrivals",
      count: kpis.newArrivalCount,
      icon: <Sparkles className="h-3 w-3 text-indigo-500" />,
    },
    {
      value: "best_seller",
      label: "Best Sellers",
      count: kpis.bestSellerCount,
      icon: <Flame className="h-3 w-3 fill-rose-500 text-rose-500" />,
    },
  ];

  const sortOptions: FilterOption[] = [
    { value: "newest", label: "Sort: Newest First" },
    { value: "oldest", label: "Sort: Oldest First" },
    { value: "price_asc", label: "Price: Low to High" },
    { value: "price_desc", label: "Price: High to Low" },
    { value: "name_asc", label: "Name: A to Z" },
  ];

  const isAnyFilterActive =
    Boolean(searchQuery) ||
    statusFilter !== "all" ||
    categoryFilter !== "all" ||
    priceRangeFilter !== "all" ||
    badgeFilter !== "all" ||
    sortBy !== "newest";

  const handleResetFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setCategoryFilter("all");
    setPriceRangeFilter("all");
    setBadgeFilter("all");
    setSortBy("newest");
  };

  return (
    <div className="mx-auto max-w-[1440px] space-y-6 pb-12">
      {/* PAGE HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <nav className="text-muted-foreground mb-1.5 flex items-center gap-1.5 text-xs">
            <span>{role === "admin" ? "Admin" : "Seller Desk"}</span>
            <span>/</span>
            <span className="text-foreground font-medium">Product Catalog</span>
          </nav>
          <h1 className="text-foreground text-xl font-bold tracking-tight sm:text-2xl">
            {role === "admin" ? "Product Catalog" : "Factory Product Catalog"}
          </h1>
          <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
            {role === "admin"
              ? "Manage catalog listings, pricing specs, and publication statuses across all sellers."
              : "Manage your manufacturing catalog listings, prices, variants, and draft publications."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href={newProductHref}>
            <Button
              className={`h-9 items-center gap-2 rounded-full !bg-[#18181b] px-4 text-xs font-semibold !text-white shadow-xs hover:!bg-black ${PRESSABLE} ${FOCUS_RING}`}
            >
              <Plus className="h-4 w-4 text-white" strokeWidth={ICON_STROKE} />
              <span className="font-semibold text-white">Add New Product</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-5">
        <div
          onClick={() => {
            setStatusFilter("all");
                  }}
          className={`bg-card border-border hover:border-foreground/30 cursor-pointer rounded-2xl border p-4 shadow-2xs transition-all ${
            statusFilter === "all" && stockFilter === "all"
              ? "ring-primary/10 border-primary/40 ring-2"
              : ""
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-xs font-medium">
              Total Catalog
            </span>
            <Package className="text-muted-foreground h-4 w-4" />
          </div>
          <p className="text-foreground mt-1.5 text-2xl font-bold">{kpis.totalCount}</p>
          <span className="text-muted-foreground text-[11px]">All listed items</span>
        </div>

        <div
          onClick={() => {
            setStatusFilter("published");
          }}
          className={`bg-card border-border hover:border-foreground/30 cursor-pointer rounded-2xl border p-4 shadow-2xs transition-all ${
            statusFilter === "published"
              ? "border-emerald-500/40 ring-2 ring-emerald-500/10"
              : ""
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-xs font-medium">
              Published Live
            </span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="mt-1.5 text-2xl font-bold text-emerald-700">
            {kpis.publishedCount}
          </p>
          <span className="text-[11px] text-emerald-700">Active on storefront</span>
        </div>

        <div
          onClick={() => {
            setStatusFilter("draft");
          }}
          className={`bg-card border-border hover:border-foreground/30 cursor-pointer rounded-2xl border p-4 shadow-2xs transition-all ${
            statusFilter === "draft"
              ? "border-amber-500/40 ring-2 ring-amber-500/10"
              : ""
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-xs font-medium">Drafts</span>
            <Clock className="h-4 w-4 text-amber-600" />
          </div>
          <p className="mt-1.5 text-2xl font-bold text-amber-700">{kpis.draftCount}</p>
          <span className="text-[11px] text-amber-700">Needs publishing</span>
        </div>

        <div
          onClick={() => {
            setStockFilter(stockFilter === "low_stock" ? "all" : "low_stock");
          }}
          className={`bg-card border-border hover:border-foreground/30 cursor-pointer rounded-2xl border p-4 shadow-2xs transition-all ${
            stockFilter === "low_stock"
              ? "border-rose-500/40 ring-2 ring-rose-500/10"
              : ""
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-xs font-medium">
              Stock Alert
            </span>
            <AlertTriangle className="h-4 w-4 text-rose-600" />
          </div>
          <p className="mt-1.5 text-2xl font-bold text-rose-700">
            {kpis.lowStockCount}
          </p>
          <span className="text-[11px] text-rose-700">Low or out of stock</span>
        </div>

        <div className="bg-card border-border col-span-2 rounded-2xl border p-4 shadow-2xs sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-xs font-medium">
              Catalog Value
            </span>
            <Tag className="text-muted-foreground h-4 w-4" />
          </div>
          <p className="text-foreground mt-1.5 text-xl font-bold sm:text-2xl">
            ₹{kpis.catalogValuation.toLocaleString("en-IN")}
          </p>
          <span className="text-muted-foreground text-[11px]">
            Catalog value
          </span>
        </div>
      </div>

      {/* MULTI-FILTER TOOLBAR */}
      <div className="space-y-3">
        <div className="flex flex-col gap-2.5 xl:flex-row xl:items-center xl:justify-between">
          {/* Search Box */}
          <div className="relative min-w-[260px] flex-1">
            <Search
              className="text-muted-foreground absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2"
              strokeWidth={ICON_STROKE}
            />
            <input
              type="text"
              placeholder="Search by product title, SKU, category, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`border-border bg-card text-foreground placeholder:text-muted-foreground hover:border-foreground/30 h-9 w-full rounded-full border pr-4 pl-9.5 text-xs shadow-2xs ${FOCUS_RING}`}
            />
          </div>

          {/* Custom Material 3 Filter Dropdowns Row */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter */}
            <FilterDropdown
              label="Status"
              icon={<CheckCircle2 className="h-3.5 w-3.5" />}
              value={statusFilter}
              options={statusOptions}
              onChange={setStatusFilter}
            />

            {/* Category Filter */}
            <FilterDropdown
              label="Category"
              icon={<Boxes className="h-3.5 w-3.5" />}
              value={categoryFilter}
              options={categoryOptions}
              onChange={setCategoryFilter}
            />

            <FilterDropdown
              label="Price"
              icon={<Tag className="h-3.5 w-3.5" />}
              value={priceRangeFilter}
              options={priceOptions}
              onChange={setPriceRangeFilter}
            />

            {/* Badging / Highlights Filter */}
            <FilterDropdown
              label="Highlights"
              icon={<Sparkles className="h-3.5 w-3.5" />}
              value={badgeFilter}
              options={badgeOptions}
              onChange={setBadgeFilter}
            />

            {/* Sort By Filter */}
            <FilterDropdown
              label="Sort"
              icon={<ArrowUpDown className="h-3.5 w-3.5" />}
              value={sortBy}
              options={sortOptions}
              onChange={setSortBy}
              align="right"
            />

            {/* Reset All Filters Button */}
            {isAnyFilterActive && (
              <button
                type="button"
                onClick={handleResetFilters}
                className={`border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground inline-flex h-9 items-center gap-1.5 rounded-full border px-3.5 text-xs font-medium shadow-2xs ${PRESSABLE} ${FOCUS_RING}`}
              >
                <RotateCcw
                  className="text-muted-foreground h-3.5 w-3.5"
                  strokeWidth={ICON_STROKE}
                />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* ACTIVE FILTER PILLS */}
        {isAnyFilterActive && (
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            <span className="text-muted-foreground mr-1 text-[11px] font-semibold">
              Active filters:
            </span>
            {searchQuery && (
              <span className="border-border bg-card text-foreground inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium shadow-2xs">
                Search: &ldquo;{searchQuery}&rdquo;
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="ml-0.5 cursor-pointer hover:text-rose-500"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {statusFilter !== "all" && (
              <span className="border-border bg-card text-foreground inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium shadow-2xs">
                Status: {statusFilter === "published" ? "Published" : "Draft"}
                <button
                  type="button"
                  onClick={() => setStatusFilter("all")}
                  className="ml-0.5 cursor-pointer hover:text-rose-500"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {categoryFilter !== "all" && (
              <span className="border-border bg-card text-foreground inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium shadow-2xs">
                Category: {categoryFilter}
                <button
                  type="button"
                  onClick={() => setCategoryFilter("all")}
                  className="ml-0.5 cursor-pointer hover:text-rose-500"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {priceRangeFilter !== "all" && (
              <span className="border-border bg-card text-foreground inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium shadow-2xs">
                Price: {priceOptions.find((o) => o.value === priceRangeFilter)?.label}
                <button
                  type="button"
                  onClick={() => setPriceRangeFilter("all")}
                  className="ml-0.5 cursor-pointer hover:text-rose-500"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {badgeFilter !== "all" && (
              <span className="border-border bg-card text-foreground inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium shadow-2xs">
                Highlight: {badgeOptions.find((o) => o.value === badgeFilter)?.label}
                <button
                  type="button"
                  onClick={() => setBadgeFilter("all")}
                  className="ml-0.5 cursor-pointer hover:text-rose-500"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {sortBy !== "newest" && (
              <span className="border-border bg-card text-foreground inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium shadow-2xs">
                Sort: {sortOptions.find((o) => o.value === sortBy)?.label}
                <button
                  type="button"
                  onClick={() => setSortBy("newest")}
                  className="ml-0.5 cursor-pointer hover:text-rose-500"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-primary ml-1 inline-flex cursor-pointer items-center gap-1 text-[11px] font-semibold hover:underline"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* CATALOG LISTINGS / TILE VIEW CONTAINER */}
      <div className="space-y-3">
        {/* Section Header with Results count & View Mode Switcher */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-3">
            <h2 className="text-foreground text-sm font-bold tracking-tight sm:text-base">
              Catalog Listings
            </h2>
            <span className="bg-muted text-muted-foreground rounded-full px-2.5 py-0.5 text-xs font-semibold">
              {filteredProducts.length}{" "}
              {filteredProducts.length === 1 ? "result" : "results"}
            </span>
          </div>

          {/* VIEW MODE SWITCHER (List vs Tile) */}
          <div className="border-border bg-muted/40 flex items-center rounded-full border p-0.5 shadow-2xs">
            <button
              type="button"
              title="List View"
              onClick={() => setViewMode("list")}
              className={clsx(
                "flex h-7.5 cursor-pointer items-center gap-1.5 rounded-full px-3 text-xs font-medium transition-all",
                viewMode === "list"
                  ? "bg-card text-foreground font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <List className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">List</span>
            </button>
            <button
              type="button"
              title="Tile / Grid View"
              onClick={() => setViewMode("grid")}
              className={clsx(
                "flex h-7.5 cursor-pointer items-center gap-1.5 rounded-full px-3 text-xs font-medium transition-all",
                viewMode === "grid"
                  ? "bg-card text-foreground font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Tile</span>
            </button>
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="border-border bg-card flex min-h-[240px] flex-col items-center justify-center rounded-2xl border px-6 py-10 text-center shadow-2xs">
            <div className="border-border bg-muted/50 text-muted-foreground mb-3.5 flex h-10 w-10 items-center justify-center rounded-full border shadow-2xs">
              <ShoppingBag
                className="text-muted-foreground h-5 w-5"
                strokeWidth={ICON_STROKE}
              />
            </div>
            <h3 className="text-foreground text-sm font-bold sm:text-base">
              No products found
            </h3>
            <p className="text-muted-foreground mt-1 max-w-sm text-xs sm:text-sm">
              There are no catalog products matching the selected status, category,
              stock, price, or search criteria.
            </p>
            {isAnyFilterActive && (
              <button
                type="button"
                onClick={handleResetFilters}
                className={`border-border bg-card text-foreground hover:bg-muted mt-4 inline-flex h-8 items-center gap-1.5 rounded-full border px-3.5 text-xs font-medium shadow-2xs ${PRESSABLE} ${FOCUS_RING}`}
              >
                <RotateCcw
                  className="text-muted-foreground h-3.5 w-3.5"
                  strokeWidth={ICON_STROKE}
                />
                <span>Clear filters</span>
              </button>
            )}
          </div>
        ) : viewMode === "grid" ? (
          /* TILE / GRID VIEW */
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredProducts.map((p) => {
              const imgThumb = resolveProductImage(p);
              const isPublished = p.status === "published";
              const isLoadingThis = loadingId === p.id;
              const count = p.inventory_count ?? 0;
              const threshold = p.low_stock_threshold ?? 5;

              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedProduct(p)}
                  className="group border-border bg-card hover:border-foreground/30 relative flex cursor-pointer flex-col justify-between overflow-hidden rounded-2xl border shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                >
                  {/* Card Media Header */}
                  <div className="bg-muted/30 relative aspect-4/3 w-full overflow-hidden">
                    {imgThumb ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={imgThumb}
                        alt={p.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="text-muted-foreground flex h-full w-full items-center justify-center">
                        <ShoppingBag className="h-10 w-10 stroke-[1.5]" />
                      </div>
                    )}

                    {/* Floating Badges (Top-Left) */}
                    <div className="absolute top-2.5 left-2.5 flex flex-col items-start gap-1">
                      <StatusBadge
                        status={isPublished ? "published" : "draft"}
                        label={isPublished ? "Published" : "Draft"}
                      />
                      {p.is_featured && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/90 px-2 py-0.5 text-[10px] font-bold text-white shadow-xs backdrop-blur-xs">
                          <Star className="h-2.5 w-2.5 fill-white" /> Featured
                        </span>
                      )}
                      {p.is_new_arrival && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/90 px-2 py-0.5 text-[10px] font-bold text-white shadow-xs backdrop-blur-xs">
                          <Sparkles className="h-2.5 w-2.5" /> New
                        </span>
                      )}
                      {p.is_best_seller && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/90 px-2 py-0.5 text-[10px] font-bold text-white shadow-xs backdrop-blur-xs">
                          <Flame className="h-2.5 w-2.5 fill-white" /> Best Seller
                        </span>
                      )}
                    </div>

                    {/* Top-Right Quick Details Button */}
                    <button
                      type="button"
                      title="Inspect Details"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedProduct(p);
                      }}
                      className="bg-card/90 text-muted-foreground hover:bg-card hover:text-foreground absolute top-2.5 right-2.5 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full shadow-xs backdrop-blur-xs transition-all"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Card Body */}
                  <div className="flex flex-1 flex-col space-y-2 p-4">
                    <div className="text-muted-foreground flex items-center justify-between text-[11px]">
                      <span className="truncate font-medium">
                        {p.category || "General"}
                      </span>
                      <span className="shrink-0 font-mono text-[10px]">
                        {p.sku ? `SKU: ${p.sku}` : `ID: ${p.id.slice(0, 6)}...`}
                      </span>
                    </div>

                    <h3 className="text-foreground group-hover:text-primary line-clamp-2 text-sm font-semibold tracking-tight transition-colors">
                      {p.name}
                    </h3>

                    <div className="mt-auto flex items-baseline justify-between pt-2">
                      <span className="text-foreground font-mono text-base font-bold">
                        ₹{p.price_inr ? p.price_inr.toLocaleString("en-IN") : "—"}
                      </span>

                      <span
                        className={clsx(
                          "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium",
                          count === 0
                            ? "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400"
                            : count <= threshold
                              ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                              : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                        )}
                      >
                        <span
                          className={clsx(
                            "h-1.5 w-1.5 rounded-full",
                            count === 0
                              ? "bg-rose-500"
                              : count <= threshold
                                ? "bg-amber-500"
                                : "bg-emerald-500"
                          )}
                        />
                        {count === 0
                          ? "Out of stock"
                          : count <= threshold
                            ? `Low: ${count}`
                            : `${count} in stock`}
                      </span>
                    </div>
                  </div>

                  {/* Card Footer Actions */}
                  <div
                    className="border-border/60 bg-muted/20 flex items-center justify-between border-t px-4 py-2.5"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Primary Edit Button */}
                    <Link href={editProductHref(p.id)}>
                      <button
                        type="button"
                        className="border-border bg-card text-foreground hover:bg-muted hover:border-foreground/30 inline-flex h-7.5 cursor-pointer items-center gap-1.5 rounded-full border px-3 text-xs font-semibold shadow-2xs transition-all active:scale-95"
                      >
                        <Edit className="text-muted-foreground h-3 w-3" />
                        <span>Edit</span>
                      </button>
                    </Link>

                    <div className="flex items-center gap-1.5">
                      {/* Quick status toggle */}
                      <button
                        type="button"
                        title={
                          isPublished ? "Unpublish to Draft" : "Publish to Storefront"
                        }
                        onClick={() => handleToggleStatus(p)}
                        disabled={isLoadingThis}
                        className={clsx(
                          "flex h-7.5 cursor-pointer items-center gap-1 rounded-full border px-2.5 text-[11px] font-medium shadow-2xs transition-all active:scale-95",
                          isPublished
                            ? "border-emerald-200 bg-emerald-50/60 text-emerald-700 hover:bg-emerald-100/70 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-400"
                            : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                      >
                        {isLoadingThis ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : isPublished ? (
                          <>
                            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                            <span>Live</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="text-muted-foreground h-3 w-3" />
                            <span>Draft</span>
                          </>
                        )}
                      </button>

                      {/* Action Menu */}
                      <ActionDropdown align="right" actions={getActionItems(p)} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* DESKTOP TABLE VIEW + MOBILE CARDS VIEW */
          <>
            {/* DESKTOP TABLE VIEW */}
            <div className="border-border bg-card hidden overflow-hidden rounded-2xl border shadow-2xs sm:block">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[768px] text-left text-xs">
                  <thead className="border-border bg-muted/40 text-muted-foreground border-b text-[11px] font-semibold tracking-wider uppercase">
                    <tr>
                      <th className="px-4 py-3">Product Details</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3">Price (INR)</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Last Updated</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-border/60 bg-card divide-y">
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
                            isSelected ? "bg-muted/60" : "hover:bg-muted/30"
                          } ${isLoadingThis ? "pointer-events-none opacity-50" : ""}`}
                        >
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="border-border bg-muted/50 relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border">
                                {imgThumb ? (
                                  /* eslint-disable-next-line @next/next/no-img-element */
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
                                    className="text-muted-foreground h-5 w-5"
                                    strokeWidth={ICON_STROKE}
                                  />
                                )}
                              </div>
                              <div className="min-w-0">
                                <span className="text-foreground block truncate font-semibold group-hover:underline">
                                  {p.name}
                                </span>
                                <div className="text-muted-foreground flex items-center gap-2 font-mono text-[10px]">
                                  <span>ID: {p.id.slice(0, 10)}...</span>
                                  {p.is_featured && (
                                    <span className="inline-flex items-center gap-0.5 font-semibold text-amber-600">
                                      ★ Featured
                                    </span>
                                  )}
                                  {p.is_new_arrival && (
                                    <span className="inline-flex items-center gap-0.5 font-semibold text-indigo-600">
                                      ✨ New
                                    </span>
                                  )}
                                  {p.is_best_seller && (
                                    <span className="inline-flex items-center gap-0.5 font-semibold text-rose-600">
                                      🔥 Best Seller
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="text-muted-foreground px-4 py-3.5">
                            {p.category || "-"}
                          </td>

                          <td className="text-foreground px-4 py-3.5 font-mono text-xs font-bold">
                            ₹{p.price_inr ? p.price_inr.toLocaleString() : "—"}
                          </td>

                          <td className="px-4 py-3.5">
                            <StatusBadge
                              status={isPublished ? "published" : "draft"}
                              label={isPublished ? "Published" : "Draft"}
                            />
                          </td>

                          <td className="text-muted-foreground px-4 py-3.5 font-mono text-[11px]">
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
                              className="flex items-center justify-end gap-2"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {/* Quick Toggle Status */}
                              <button
                                type="button"
                                title={
                                  isPublished ? "Set to Draft" : "Publish to Storefront"
                                }
                                onClick={() => handleToggleStatus(p)}
                                disabled={isLoadingThis}
                                className={clsx(
                                  "inline-flex h-8 cursor-pointer items-center gap-1 rounded-full border px-2.5 text-xs font-medium shadow-2xs transition-all active:scale-95",
                                  isPublished
                                    ? "border-emerald-200 bg-emerald-50/60 text-emerald-700 hover:bg-emerald-100/70 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-400"
                                    : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
                                )}
                              >
                                {isLoadingThis ? (
                                  <Loader2 className="text-muted-foreground h-3.5 w-3.5 animate-spin" />
                                ) : isPublished ? (
                                  <>
                                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                                    <span className="hidden text-[11px] font-medium xl:inline">
                                      Live
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <EyeOff className="text-muted-foreground h-3.5 w-3.5" />
                                    <span className="hidden text-[11px] font-medium xl:inline">
                                      Draft
                                    </span>
                                  </>
                                )}
                              </button>

                              {/* Primary Edit Pill */}
                              <Link href={editProductHref(p.id)}>
                                <button
                                  type="button"
                                  className="border-border bg-card text-foreground hover:bg-muted hover:border-foreground/30 inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full border px-3 text-xs font-semibold shadow-2xs transition-all active:scale-95"
                                >
                                  <Edit className="text-muted-foreground h-3.5 w-3.5" />
                                  <span>Edit</span>
                                </button>
                              </Link>

                              {/* Secondary Actions Dropdown */}
                              <ActionDropdown
                                align="right"
                                actions={getActionItems(p)}
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
                    className="border-border bg-card hover:border-foreground/30 cursor-pointer space-y-3 rounded-2xl border p-4 shadow-2xs transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="border-border bg-muted/50 relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border">
                          {imgThumb ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
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
                              className="text-muted-foreground h-5 w-5"
                              strokeWidth={ICON_STROKE}
                            />
                          )}
                        </div>
                        <div>
                          <span className="text-foreground block text-sm font-semibold">
                            {p.name}
                          </span>
                          <span className="text-muted-foreground block font-mono text-[10px]">
                            {p.category || "General"} · ID: {p.id.slice(0, 8)}...
                          </span>
                        </div>
                      </div>

                      <StatusBadge
                        status={isPublished ? "published" : "draft"}
                        label={isPublished ? "Published" : "Draft"}
                      />
                    </div>

                    <div className="border-border/60 flex items-center justify-between border-t pt-2.5 text-xs">
                      <div>
                        <span className="text-muted-foreground block text-[10px] font-semibold">
                          Price
                        </span>
                        <span className="text-foreground font-mono text-xs font-bold">
                          ₹{p.price_inr ? p.price_inr.toLocaleString() : "—"}
                        </span>
                      </div>

                      <div
                        className="flex items-center gap-1.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(p)}
                          disabled={isLoadingThis}
                          className={`border-border bg-card text-foreground hover:bg-muted flex h-7.5 items-center gap-1 rounded-full border px-2.5 text-[11px] font-medium shadow-2xs ${PRESSABLE}`}
                        >
                          {isPublished ? "Draft" : "Publish"}
                        </button>

                        <Link href={editProductHref(p.id)}>
                          <button
                            type="button"
                            className={`border-border bg-card text-foreground hover:bg-muted flex h-7.5 items-center gap-1 rounded-full border px-2.5 text-[11px] font-semibold shadow-2xs ${PRESSABLE}`}
                          >
                            <Edit className="text-muted-foreground h-3 w-3" />
                            <span>Edit</span>
                          </button>
                        </Link>

                        <ActionDropdown align="right" actions={getActionItems(p)} />
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
            <div className="border-border bg-muted/40 relative aspect-video w-full overflow-hidden rounded-2xl border">
              {resolveProductImage(selectedProduct) ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={resolveProductImage(selectedProduct)!}
                  alt={selectedProduct.name}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <div className="text-muted-foreground flex h-full w-full items-center justify-center">
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
                className={`border-border bg-card text-foreground hover:bg-muted h-8 gap-1.5 rounded-full text-xs shadow-2xs ${PRESSABLE}`}
              >
                <Edit className="h-3.5 w-3.5" />
                <span>Quick Edit</span>
              </Button>

              <Link href={editProductHref(selectedProduct.id)}>
                <Button
                  variant="outline"
                  size="sm"
                  className={`border-border bg-card text-foreground hover:bg-muted h-8 gap-1.5 rounded-full text-xs shadow-2xs ${PRESSABLE}`}
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
                  className={`border-border bg-card text-foreground hover:bg-muted h-8 gap-1.5 rounded-full text-xs shadow-2xs ${PRESSABLE}`}
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>View Storefront</span>
                </Button>
              </Link>

              <button
                type="button"
                onClick={() => handleToggleStatus(selectedProduct)}
                className={`border-border bg-card text-foreground hover:bg-muted ml-auto flex h-8 items-center gap-1.5 rounded-full border px-3.5 text-xs font-medium shadow-2xs ${PRESSABLE}`}
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
            <div className="border-border bg-card space-y-3 rounded-2xl border p-4 shadow-2xs">
              <h4 className="text-foreground text-xs font-bold tracking-wider uppercase">
                Product Specifications
              </h4>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-muted-foreground block">Category</span>
                  <span className="text-foreground font-medium">
                    {selectedProduct.category || "—"}
                  </span>
                </div>

                <div>
                  <span className="text-muted-foreground block">Price (INR)</span>
                  <span className="text-foreground font-mono font-bold">
                    ₹
                    {selectedProduct.price_inr
                      ? selectedProduct.price_inr.toLocaleString()
                      : "—"}
                  </span>
                </div>

                <div>
                  <span className="text-muted-foreground block">Status</span>
                  <StatusBadge
                    status={
                      selectedProduct.status === "published" ? "published" : "draft"
                    }
                    label={
                      selectedProduct.status === "published" ? "Published" : "Draft"
                    }
                  />
                </div>

                <div>
                  <span className="text-muted-foreground block">Product ID</span>
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground font-mono text-[10px]">
                      {selectedProduct.id.slice(0, 12)}...
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyId(selectedProduct.id)}
                      className="text-muted-foreground hover:text-foreground cursor-pointer"
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
                    <span className="text-muted-foreground block">SKU</span>
                    <span className="text-foreground font-mono font-medium">
                      {selectedProduct.sku}
                    </span>
                  </div>
                )}

                {selectedProduct.inventory_count !== null &&
                  selectedProduct.inventory_count !== undefined && (
                    <div>
                      <span className="text-muted-foreground block">Stock Level</span>
                      <span className="text-foreground font-mono font-medium">
                        {selectedProduct.inventory_count} units
                      </span>
                    </div>
                  )}

                {selectedProduct.created_by && (
                  <div>
                    <span className="text-muted-foreground block">Created By</span>
                    <span className="text-muted-foreground font-mono text-[10px]">
                      {selectedProduct.created_by.slice(0, 10)}...
                    </span>
                  </div>
                )}

                {selectedProduct.updated_by && (
                  <div>
                    <span className="text-muted-foreground block">Last Updated By</span>
                    <span className="text-muted-foreground font-mono text-[10px]">
                      {selectedProduct.updated_by.slice(0, 10)}...
                    </span>
                  </div>
                )}

                {selectedProduct.materials && selectedProduct.materials.length > 0 && (
                  <div className="col-span-2">
                    <span className="text-muted-foreground mb-1 block">Materials</span>
                    <div className="flex flex-wrap gap-1">
                      {selectedProduct.materials.map((m, i) => (
                        <span
                          key={i}
                          className="bg-muted text-muted-foreground rounded-full px-2.5 py-0.5 text-[10px] font-medium"
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
            <div className="border-border bg-card space-y-2 rounded-2xl border p-4 shadow-2xs">
              <h4 className="text-foreground text-xs font-bold tracking-wider uppercase">
                Craft Story & Description
              </h4>
              <p className="text-muted-foreground text-xs leading-relaxed whitespace-pre-wrap">
                {selectedProduct.description ||
                  "No description provided for this listing."}
              </p>
            </div>

            {/* Danger Zone */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => handleDelete(selectedProduct)}
                className={`flex w-full items-center justify-center gap-2 rounded-full border border-rose-200 bg-rose-50/50 p-2.5 text-xs font-semibold text-rose-700 shadow-2xs hover:bg-rose-100 ${PRESSABLE}`}
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
            <p className="text-muted-foreground text-xs">
              Update basic listing details quickly without navigating to the full editor
              studio.
            </p>

            <div>
              <label className="text-foreground mb-1 block text-xs font-semibold">
                Product Title *
              </label>
              <input
                type="text"
                required
                value={editForm.name}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, name: e.target.value }))
                }
                className={`border-border bg-background text-foreground placeholder:text-muted-foreground h-9 w-full rounded-xl border px-3 text-xs ${FOCUS_RING}`}
              />
            </div>

            <div>
              <label className="text-foreground mb-1 block text-xs font-semibold">
                Category
              </label>
              <select
                value={editForm.category}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, category: e.target.value }))
                }
                className={`border-border bg-background text-foreground h-9 w-full rounded-xl border px-3 text-xs ${FOCUS_RING}`}
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-foreground mb-1 block text-xs font-semibold">
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
                className={`border-border bg-background text-foreground h-9 w-full rounded-xl border px-3 text-xs ${FOCUS_RING}`}
              />
            </div>

            <div>
              <label className="text-foreground mb-1 block text-xs font-semibold">
                Status
              </label>
              <select
                value={editForm.status}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, status: e.target.value }))
                }
                className={`border-border bg-background text-foreground h-9 w-full rounded-xl border px-3 text-xs ${FOCUS_RING}`}
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>

            <div>
              <label className="text-foreground mb-1 block text-xs font-semibold">
                Description
              </label>
              <textarea
                rows={4}
                value={editForm.description}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, description: e.target.value }))
                }
                className={`border-border bg-background text-foreground placeholder:text-muted-foreground w-full rounded-xl border p-3 text-xs ${FOCUS_RING}`}
              />
            </div>

            <div className="border-border flex items-center justify-end gap-2 border-t pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingProduct(null)}
                className={`border-border text-foreground hover:bg-muted h-9 rounded-full text-xs shadow-2xs ${PRESSABLE}`}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={isSaving}
                className={`bg-primary text-primary-foreground hover:bg-primary/90 h-9 gap-1.5 rounded-full text-xs font-semibold shadow-xs ${PRESSABLE}`}
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
