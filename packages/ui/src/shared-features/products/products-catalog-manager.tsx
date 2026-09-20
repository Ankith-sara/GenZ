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
  CheckCircle2,
  Trash2,
  Plus,
  ChevronDown,
  RotateCcw,
  Save,
  Loader2,
  ExternalLink,
  Copy,
  Check,
  AlertTriangle,
  ArrowUpDown,
  LayoutGrid,
  List,
  Sparkles,
  Star,
  Flame,
  X,
} from "lucide-react";
import { Button } from "../../components/button";
import { SlideOverDrawer } from "../../components/slide-over-drawer";
import { ActionDropdown, type ActionItem } from "../../components/action-dropdown";
import { Select } from "../../components/select";
import { DEFAULT_PRODUCT_CATEGORIES } from "./form/components/product-info-cards";

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

function resolveProductImage(p: SharedProductRecord): string | null {
  const candidate =
    p.image_url ||
    (p.images && p.images.length > 0 ? p.images[0] : null) ||
    p.cover_image_path;

  if (!candidate) return null;

  if (
    candidate.startsWith("http://") ||
    candidate.startsWith("https://") ||
    candidate.startsWith("/")
  ) {
    return candidate;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (supabaseUrl) {
    const cleanUrl = supabaseUrl.replace(/\/+$/, "");
    let cleanPath = candidate.replace(/^\/+/, "");
    if (cleanPath.startsWith("product-media/")) {
      cleanPath = cleanPath.slice("product-media/".length);
    }
    return `${cleanUrl}/storage/v1/object/public/product-media/${cleanPath}`;
  }

  return `/${candidate.replace(/^\/+/, "")}`;
}

function QuickEditThumbnail({ product }: { product: SharedProductRecord }) {
  const [errorUrl, setErrorUrl] = useState<string | null>(null);
  const imgThumb = resolveProductImage(product);
  const hasError = Boolean(imgThumb && errorUrl === imgThumb);

  return (
    <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[#E5E5E0] bg-white">
      {imgThumb && !hasError ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          key={imgThumb}
          src={imgThumb}
          alt=""
          className="h-full w-full object-cover"
          onError={() => setErrorUrl(imgThumb)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-[#FAF8F4] text-[#52524E]/40">
          <ShoppingBag className="h-5 w-5" />
        </div>
      )}
    </div>
  );
}

function formatDate(iso?: string | null): string {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "—";
    const day = d.getDate();
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return `${day} ${months[d.getMonth()]} ${d.getFullYear()}`;
  } catch {
    return "—";
  }
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
          "inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border px-3 text-xs font-medium shadow-xs transition-all select-none",
          isActive
            ? "border-primary/40 bg-secondary-container text-on-secondary-container font-semibold"
            : "border-outline-variant/60 bg-surface-container-lowest text-on-surface hover:bg-surface-container-low",
          isOpen && "ring-primary/20 border-primary/40 ring-2"
        )}
      >
        {icon && (
          <span
            className={clsx(
              "h-3.5 w-3.5 shrink-0",
              isActive ? "text-primary" : "text-on-surface-variant"
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
                ? "bg-primary/10 text-primary"
                : "bg-surface-container text-on-surface-variant"
            )}
          >
            {selectedOption.count}
          </span>
        )}
        <ChevronDown
          className={clsx(
            "h-3 w-3 shrink-0 transition-transform duration-200",
            isActive ? "text-primary" : "text-on-surface-variant",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {isOpen && (
        <div
          className={clsx(
            "border-outline-variant/60 bg-surface-container-lowest/98 animate-in fade-in-80 zoom-in-95 shadow-elevation-2 absolute z-50 mt-1.5 max-w-[320px] min-w-[220px] overflow-hidden rounded-xl border p-1.5 backdrop-blur-xl duration-150",
            align === "right" ? "right-0" : "left-0"
          )}
        >
          <div className="text-on-surface-variant px-2.5 py-1.5 text-[10px] font-bold tracking-wider uppercase">
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
                    "flex w-full cursor-pointer items-center justify-between gap-3 rounded-lg px-2.5 py-2 text-left text-xs font-medium transition-colors select-none",
                    isOptionSelected
                      ? "bg-secondary-container text-on-secondary-container font-semibold"
                      : "text-on-surface hover:bg-surface-container-low"
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
                      <span className="text-on-surface-variant h-3.5 w-3.5 shrink-0">
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
                            ? "bg-primary/10 text-primary font-bold"
                            : "bg-surface-container text-on-surface-variant font-medium"
                        )}
                      >
                        {option.count}
                      </span>
                    )}
                    {isOptionSelected && (
                      <Check className="text-primary h-3.5 w-3.5 stroke-[2.5]" />
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

/* Material 3 Switch Component */
function MaterialSwitch({
  checked,
  onChange,
  disabled,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
  label?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        onChange();
      }}
      className={clsx(
        "focus-visible:outline-primary relative h-8 w-13 shrink-0 cursor-pointer rounded-full border-2 transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        checked
          ? "border-primary bg-primary"
          : "border-outline-variant bg-surface-container-highest"
      )}
    >
      <span
        className={clsx(
          "absolute top-1/2 flex -translate-y-1/2 items-center justify-center rounded-full transition-all duration-200",
          checked
            ? "bg-on-primary text-primary left-5 h-6 w-6"
            : "bg-outline left-1.5 h-4 w-4 text-transparent"
        )}
      >
        <Check
          className={clsx(
            "h-3.5 w-3.5 stroke-[3] transition-opacity",
            checked ? "opacity-100" : "opacity-0"
          )}
        />
      </span>
    </button>
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

  const [viewMode, setViewMode] = useState<"list" | "tiles">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [priceRangeFilter, setPriceRangeFilter] = useState("all");
  const [badgeFilter, setBadgeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Slide-over Quick Edit
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

  // Category options for Quick Edit drawer
  const editingCategory = editingProduct?.category?.trim();
  const quickEditCategoryOptions = useMemo(() => {
    const categoriesSet = new Set<string>(DEFAULT_PRODUCT_CATEGORIES);
    if (editingCategory) {
      categoriesSet.add(editingCategory);
    }
    products.forEach((p) => {
      if (p.category && p.category.trim()) {
        categoriesSet.add(p.category.trim());
      }
    });
    return Array.from(categoriesSet).map((cat) => ({
      value: cat,
      label: cat,
    }));
  }, [editingCategory, products]);

  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isBulkLoading, setIsBulkLoading] = useState(false);

  // Status counts & KPI metrics
  const kpis = useMemo(() => {
    const totalCount = products.length;
    const publishedCount = products.filter((p) => p.status === "published").length;
    const draftCount = products.filter((p) => p.status !== "published").length;

    const outOfStockCount = products.filter(
      (p) => (p.inventory_count ?? 0) === 0
    ).length;
    const lowStockCount = products.filter((p) => {
      const count = p.inventory_count ?? 0;
      const threshold = p.low_stock_threshold ?? 5;
      return count > 0 && count <= threshold;
    }).length;
    const inStockCount = products.filter((p) => {
      const count = p.inventory_count ?? 0;
      const threshold = p.low_stock_threshold ?? 5;
      return count > threshold;
    }).length;

    const totalUnits = products.reduce((sum, p) => sum + (p.inventory_count ?? 0), 0);
    const catalogValuation = products.reduce((sum, p) => {
      const price = p.price_inr || 0;
      const units = p.inventory_count ?? 0;
      return sum + price * units;
    }, 0);

    const featuredCount = products.filter((p) => Boolean(p.is_featured)).length;
    const newArrivalCount = products.filter((p) => Boolean(p.is_new_arrival)).length;
    const bestSellerCount = products.filter((p) => Boolean(p.is_best_seller)).length;

    return {
      totalCount,
      publishedCount,
      draftCount,
      outOfStockCount,
      lowStockCount,
      inStockCount,
      totalUnits,
      catalogValuation,
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
    return Array.from(set);
  }, [products]);

  // Filtered & sorted products
  const filteredProducts = useMemo(() => {
    const list = products.filter((p) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        (p.category || "").toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        (p.sku || "").toLowerCase().includes(q);

      const isPublished = p.status === "published";
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "published" && isPublished) ||
        (statusFilter === "draft" && !isPublished);

      const matchesCategory = categoryFilter === "all" || p.category === categoryFilter;

      const count = p.inventory_count ?? 0;
      const threshold = p.low_stock_threshold ?? 5;
      const matchesStock =
        stockFilter === "all" ||
        (stockFilter === "in_stock" && count > threshold) ||
        (stockFilter === "low_stock" && count > 0 && count <= threshold) ||
        (stockFilter === "out_of_stock" && count === 0) ||
        (stockFilter === "attention" && count <= threshold);

      const price = p.price_inr || 0;
      const matchesPrice =
        priceRangeFilter === "all" ||
        (priceRangeFilter === "lt300" && price < 300) ||
        (priceRangeFilter === "300_500" && price >= 300 && price <= 500) ||
        (priceRangeFilter === "gt500" && price > 500);

      const matchesBadge =
        badgeFilter === "all" ||
        (badgeFilter === "new_arrival" && p.is_new_arrival) ||
        (badgeFilter === "featured" && p.is_featured) ||
        (badgeFilter === "best_seller" && p.is_best_seller);

      return (
        matchesSearch &&
        matchesStatus &&
        matchesCategory &&
        matchesStock &&
        matchesPrice &&
        matchesBadge
      );
    });

    // Sorting
    return list.sort((a, b) => {
      if (sortBy === "name_asc") return a.name.localeCompare(b.name);
      if (sortBy === "price_asc") return (a.price_inr || 0) - (b.price_inr || 0);
      if (sortBy === "price_desc") return (b.price_inr || 0) - (a.price_inr || 0);
      if (sortBy === "stock_asc")
        return (a.inventory_count || 0) - (b.inventory_count || 0);
      if (sortBy === "stock_desc")
        return (b.inventory_count || 0) - (a.inventory_count || 0);
      if (sortBy === "oldest") {
        const da = a.created_at ? new Date(a.created_at).getTime() : 0;
        const db = b.created_at ? new Date(b.created_at).getTime() : 0;
        return da - db;
      }
      // default: newest
      const da = a.updated_at
        ? new Date(a.updated_at).getTime()
        : a.created_at
          ? new Date(a.created_at).getTime()
          : 0;
      const db = b.updated_at
        ? new Date(b.updated_at).getTime()
        : b.created_at
          ? new Date(b.created_at).getTime()
          : 0;
      return db - da;
    });
  }, [
    products,
    searchQuery,
    statusFilter,
    categoryFilter,
    stockFilter,
    priceRangeFilter,
    badgeFilter,
    sortBy,
  ]);

  const needAttentionCount = kpis.outOfStockCount + kpis.lowStockCount;

  // Single-product status toggle
  const handleToggleStatus = async (product: SharedProductRecord) => {
    const nextStatus = product.status === "published" ? "draft" : "published";
    setLoadingId(product.id);

    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, status: nextStatus } : p))
    );

    try {
      if (onUpdateStatus) {
        await onUpdateStatus(product.id, nextStatus);
      }
      toast.success(
        nextStatus === "published"
          ? `"${product.name}" published`
          : `"${product.name}" moved to drafts`
      );
    } catch {
      setProducts(initialProducts);
      toast.error("Failed to update status");
    } finally {
      setLoadingId(null);
    }
  };

  // Bulk Status Update
  const handleBulkUpdateStatus = async (nextStatus: "published" | "draft") => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;

    setIsBulkLoading(true);
    const prevProducts = [...products];

    setProducts((prev) =>
      prev.map((p) => (selectedIds.has(p.id) ? { ...p, status: nextStatus } : p))
    );

    try {
      if (onUpdateStatus) {
        await Promise.all(ids.map((id) => onUpdateStatus(id, nextStatus)));
      }
      toast.success(
        ids.length === 1
          ? `Listing ${nextStatus === "published" ? "published" : "moved to drafts"}`
          : `${ids.length} listings ${nextStatus === "published" ? "published" : "moved to drafts"}`
      );
      setSelectedIds(new Set());
    } catch {
      setProducts(prevProducts);
      toast.error("Failed to update selected listings");
    } finally {
      setIsBulkLoading(false);
    }
  };

  // Delete product
  const handleDelete = async (product: SharedProductRecord) => {
    if (
      !confirm(
        `Are you sure you want to delete "${product.name}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    setLoadingId(product.id);
    const prevProducts = [...products];
    setProducts((prev) => prev.filter((p) => p.id !== product.id));

    try {
      if (onDeleteProduct) {
        await onDeleteProduct(product.id);
      }
      toast.success(`"${product.name}" deleted.`);
    } catch {
      setProducts(prevProducts);
      toast.error("Failed to delete product");
    } finally {
      setLoadingId(null);
    }
  };

  // Quick edit drawer handlers
  const handleOpenEdit = (product: SharedProductRecord) => {
    setEditingProduct(product);
    setEditForm({
      name: product.name,
      category: product.category || "",
      price_inr: product.price_inr ? String(product.price_inr) : "",
      status: product.status || "published",
      description: product.description || "",
    });
  };

  const handleSaveEdit = async () => {
    if (!editingProduct) return;
    setIsSaving(true);
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

    setProducts((prev) =>
      prev.map((p) => (p.id === editingProduct.id ? updatedData : p))
    );

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
      toast.success("Product changes saved!");
    } catch {
      setProducts(initialProducts);
      toast.error("Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

  // Selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(filteredProducts.map((p) => p.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleToggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const isAllSelected =
    filteredProducts.length > 0 && selectedIds.size === filteredProducts.length;
  const isIndeterminate =
    selectedIds.size > 0 && selectedIds.size < filteredProducts.length;

  const isAnyFilterActive =
    Boolean(searchQuery) ||
    statusFilter !== "all" ||
    categoryFilter !== "all" ||
    stockFilter !== "all" ||
    priceRangeFilter !== "all" ||
    badgeFilter !== "all" ||
    sortBy !== "newest";

  const handleResetFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setCategoryFilter("all");
    setStockFilter("all");
    setPriceRangeFilter("all");
    setBadgeFilter("all");
    setSortBy("newest");
  };

  // Filter dropdown configurations
  const statusOptions: FilterOption[] = [
    { value: "all", label: "All statuses", count: kpis.totalCount },
    { value: "published", label: "Published", count: kpis.publishedCount },
    { value: "draft", label: "Draft", count: kpis.draftCount },
  ];

  const stockOptions: FilterOption[] = [
    { value: "all", label: "All stock", count: kpis.totalCount },
    { value: "in_stock", label: "In stock", count: kpis.inStockCount },
    { value: "low_stock", label: "Low stock", count: kpis.lowStockCount },
    { value: "out_of_stock", label: "Out of stock", count: kpis.outOfStockCount },
    {
      value: "attention",
      label: "Low or out of stock",
      count: needAttentionCount,
    },
  ];

  const categoryOptions: FilterOption[] = [
    { value: "all", label: "All categories", count: kpis.totalCount },
    ...categories.map((c) => ({
      value: c,
      label: c,
      count: products.filter((p) => p.category === c).length,
    })),
  ];

  const priceOptions: FilterOption[] = [
    { value: "all", label: "Any price" },
    { value: "lt300", label: "Under ₹300" },
    { value: "300_500", label: "₹300 to ₹500" },
    { value: "gt500", label: "Over ₹500" },
  ];

  const badgeOptions: FilterOption[] = [
    { value: "all", label: "All listings" },
    {
      value: "new_arrival",
      label: "New",
      icon: <Sparkles className="h-3 w-3 text-indigo-500" />,
    },
    {
      value: "featured",
      label: "Featured",
      icon: <Star className="h-3 w-3 fill-amber-400 text-amber-500" />,
    },
    {
      value: "best_seller",
      label: "Best Seller",
      icon: <Flame className="h-3 w-3 fill-rose-500 text-rose-500" />,
    },
  ];

  const sortOptions: FilterOption[] = [
    { value: "newest", label: "Newest first" },
    { value: "oldest", label: "Oldest first" },
    { value: "name_asc", label: "Name A to Z" },
    { value: "price_asc", label: "Price, low to high" },
    { value: "price_desc", label: "Price, high to low" },
    { value: "stock_asc", label: "Stock, low to high" },
  ];

  const getActionItems = (p: SharedProductRecord): ActionItem[] => [
    {
      label: "Quick Edit",
      icon: <Edit className="h-3.5 w-3.5" />,
      onClick: () => handleOpenEdit(p),
    },
    {
      label: "Full Editor",
      icon: <ExternalLink className="h-3.5 w-3.5" />,
      onClick: () => {
        window.location.href = editProductHref(p.id);
      },
    },
    {
      label: "View in Storefront",
      icon: <Eye className="h-3.5 w-3.5" />,
      onClick: () => {
        window.open(storefrontHref(p.id), "_blank");
      },
    },
    {
      label: "Copy Product ID",
      icon: <Copy className="h-3.5 w-3.5" />,
      onClick: () => {
        navigator.clipboard.writeText(p.id);
        toast.success("Product ID copied to clipboard");
      },
    },
    {
      label: "Delete Listing",
      icon: <Trash2 className="text-error h-3.5 w-3.5" />,
      variant: "destructive",
      onClick: () => handleDelete(p),
    },
  ];

  return (
    <div className="w-full space-y-4 sm:space-y-5">
      {/* 1. PAGE HEADER */}
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-on-surface text-2xl font-normal tracking-tight sm:text-3xl">
            {role === "admin" ? "Platform catalog" : "Product catalog"}
          </h1>
          <p className="text-on-surface-variant mt-0.5 max-w-2xl text-sm leading-relaxed">
            Manage your listings, prices, stock and drafts. Switch a listing on to show
            it in your storefront.
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <Link href={newProductHref}>
            <Button
              className={`bg-primary-container text-on-primary-container shadow-elevation-2 h-11 items-center gap-2 rounded-xl px-5 text-sm font-semibold hover:opacity-95 ${PRESSABLE}`}
            >
              <Plus className="h-4 w-4" strokeWidth={ICON_STROKE} />
              <span>Add product</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. CATALOG SUMMARY & STOCK ALERT */}
      <section
        className="grid grid-cols-1 gap-4 lg:grid-cols-12"
        aria-label="Catalog summary"
      >
        {/* 4-Item Stat Grid */}
        <div className="border-outline-variant/60 bg-outline-variant/60 shadow-elevation-1 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border sm:grid-cols-4 lg:col-span-7 xl:col-span-8">
          <button
            type="button"
            onClick={() => {
              setStatusFilter("all");
              setStockFilter("all");
            }}
            className="bg-surface-container-lowest hover:bg-surface-container-low flex cursor-pointer flex-col gap-0.5 p-5 text-left transition-colors"
          >
            <span className="text-on-surface-variant text-xs font-semibold">
              Listings
            </span>
            <span className="text-on-surface mt-1 font-mono text-2xl font-bold sm:text-3xl">
              {kpis.totalCount}
            </span>
            <span className="text-on-surface-variant text-[11px]">In your catalog</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setStatusFilter("published");
              setStockFilter("all");
            }}
            className="bg-surface-container-lowest hover:bg-surface-container-low flex cursor-pointer flex-col gap-0.5 p-5 text-left transition-colors"
          >
            <span className="text-on-surface-variant text-xs font-semibold">Live</span>
            <span className="text-on-surface mt-1 font-mono text-2xl font-bold sm:text-3xl">
              {kpis.publishedCount}
            </span>
            <span className="text-on-surface-variant text-[11px]">
              Visible to buyers
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setStatusFilter("draft");
              setStockFilter("all");
            }}
            className="bg-surface-container-lowest hover:bg-surface-container-low flex cursor-pointer flex-col gap-0.5 p-5 text-left transition-colors"
          >
            <span className="text-on-surface-variant text-xs font-semibold">
              Drafts
            </span>
            <span className="text-on-surface mt-1 font-mono text-2xl font-bold sm:text-3xl">
              {kpis.draftCount}
            </span>
            <span className="text-on-surface-variant text-[11px]">
              {kpis.draftCount > 0 ? "Ready to publish" : "Nothing waiting"}
            </span>
          </button>

          <div className="bg-surface-container-lowest flex flex-col gap-0.5 p-5 text-left">
            <span className="text-on-surface-variant text-xs font-semibold">
              Inventory value
            </span>
            <span className="text-on-surface mt-1 font-mono text-2xl font-bold sm:text-3xl">
              ₹{kpis.catalogValuation.toLocaleString("en-IN")}
            </span>
            <span className="text-on-surface-variant text-[11px]">
              {kpis.totalUnits} units in stock
            </span>
          </div>
        </div>

        {/* Dynamic Stock Health Alert Box */}
        <div
          className={clsx(
            "shadow-elevation-1 flex flex-col justify-between gap-3 rounded-2xl p-5 lg:col-span-5 xl:col-span-4",
            needAttentionCount > 0
              ? "bg-warning-container text-on-warning-container"
              : "bg-secondary-container text-on-secondary-container"
          )}
        >
          <div className="flex items-center gap-2.5">
            {needAttentionCount > 0 ? (
              <AlertTriangle className="text-warning h-5 w-5 shrink-0" />
            ) : (
              <CheckCircle2 className="text-success h-5 w-5 shrink-0" />
            )}
            <span className="text-sm font-bold tracking-tight">
              {needAttentionCount > 0 ? "Stock needs attention" : "Stock looks healthy"}
            </span>
          </div>

          <p className="text-lg leading-snug font-normal">
            {needAttentionCount > 0
              ? `${needAttentionCount} of ${kpis.totalCount} listings are low or out of stock`
              : "Every listing has more than 5 units in stock"}
          </p>

          {/* Proportional Segmented Progress Bar */}
          <div
            className="flex h-3 w-full gap-1 overflow-hidden rounded-full bg-black/10"
            aria-hidden="true"
          >
            {kpis.totalCount > 0 ? (
              <>
                {kpis.outOfStockCount > 0 && (
                  <div
                    style={{
                      width: `${(kpis.outOfStockCount / kpis.totalCount) * 100}%`,
                    }}
                    className="bg-error rounded-full transition-all"
                  />
                )}
                {kpis.lowStockCount > 0 && (
                  <div
                    style={{
                      width: `${(kpis.lowStockCount / kpis.totalCount) * 100}%`,
                    }}
                    className="bg-warning rounded-full transition-all"
                  />
                )}
                {kpis.inStockCount > 0 && (
                  <div
                    style={{
                      width: `${(kpis.inStockCount / kpis.totalCount) * 100}%`,
                    }}
                    className="bg-success rounded-full transition-all"
                  />
                )}
              </>
            ) : (
              <div className="w-full bg-black/5" />
            )}
          </div>

          {/* Legend and Action */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
              {kpis.outOfStockCount > 0 && (
                <span className="flex items-center gap-1.5">
                  <span className="bg-error h-2 w-2 rounded-full" />
                  {kpis.outOfStockCount} out of stock
                </span>
              )}
              {kpis.lowStockCount > 0 && (
                <span className="flex items-center gap-1.5">
                  <span className="bg-warning h-2 w-2 rounded-full" />
                  {kpis.lowStockCount} low (≤ 5)
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <span className="bg-success h-2 w-2 rounded-full" />
                {kpis.inStockCount} healthy
              </span>
            </div>

            {needAttentionCount > 0 && (
              <button
                type="button"
                onClick={() => setStockFilter("attention")}
                className="bg-on-warning-container text-warning-container inline-flex h-8 cursor-pointer items-center justify-center rounded-full px-3.5 text-xs font-semibold transition-opacity hover:opacity-90"
              >
                Review {needAttentionCount} listing
                {needAttentionCount === 1 ? "" : "s"}
              </button>
            )}
          </div>
        </div>
      </section>

      {/* 3. MAIN LISTINGS WORKSPACE CARD */}
      <section
        className="border-outline-variant/60 bg-surface-container-lowest shadow-elevation-1 overflow-hidden rounded-2xl border"
        aria-label="Listings"
      >
        {/* Dynamic Head: Normal List-Head OR Bulk Selection Bar */}
        {selectedIds.size > 0 ? (
          <div className="bg-secondary-container text-on-secondary-container flex min-h-16 flex-wrap items-center gap-3 px-5 py-3">
            <button
              type="button"
              onClick={() => setSelectedIds(new Set())}
              aria-label="Clear selection"
              className="hover:bg-on-secondary-container/10 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
            <span className="mr-auto text-base font-medium">
              {selectedIds.size} selected
            </span>
            <button
              type="button"
              disabled={isBulkLoading}
              onClick={() => handleBulkUpdateStatus("published")}
              className="hover:bg-on-secondary-container/10 inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full px-4 text-xs font-semibold transition-colors disabled:opacity-50"
            >
              {isBulkLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Check className="h-3.5 w-3.5" />
              )}
              <span>Publish</span>
            </button>
            <button
              type="button"
              disabled={isBulkLoading}
              onClick={() => handleBulkUpdateStatus("draft")}
              className="hover:bg-on-secondary-container/10 inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full px-4 text-xs font-semibold transition-colors disabled:opacity-50"
            >
              <span>Move to drafts</span>
            </button>
          </div>
        ) : (
          <div className="border-outline-variant/40 flex min-h-16 flex-col gap-3 border-b px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-on-surface text-lg font-bold tracking-tight">
                Listings
              </h2>
              <span className="text-on-surface-variant text-xs">
                {filteredProducts.length === products.length
                  ? `${products.length} listings`
                  : `${filteredProducts.length} of ${products.length} listings`}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Search input */}
              <div className="relative flex items-center">
                <Search className="text-on-surface-variant absolute left-3 h-3.5 w-3.5" />
                <input
                  type="search"
                  placeholder="Search listings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-surface-container-high text-on-surface placeholder:text-on-surface-variant focus:ring-primary h-9 w-48 rounded-full pr-3 pl-8 text-xs outline-none focus:ring-2 sm:w-60"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="text-on-surface-variant hover:text-on-surface absolute right-2.5 cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Sort Menu Button */}
              <FilterDropdown
                label="Sort"
                icon={<ArrowUpDown className="h-3.5 w-3.5" />}
                value={sortBy}
                options={sortOptions}
                onChange={setSortBy}
                align="right"
              />

              {/* Segmented View Mode Toggle */}
              <div
                className="border-outline-variant/80 inline-flex h-9 items-center overflow-hidden rounded-full border p-0.5"
                role="group"
                aria-label="View mode"
              >
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  aria-pressed={viewMode === "list"}
                  className={clsx(
                    "inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full px-3 text-xs font-semibold transition-all select-none",
                    viewMode === "list"
                      ? "bg-secondary-container text-on-secondary-container shadow-xs"
                      : "text-on-surface-variant hover:text-on-surface"
                  )}
                >
                  <List className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">List</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("tiles")}
                  aria-pressed={viewMode === "tiles"}
                  className={clsx(
                    "inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full px-3 text-xs font-semibold transition-all select-none",
                    viewMode === "tiles"
                      ? "bg-secondary-container text-on-secondary-container shadow-xs"
                      : "text-on-surface-variant hover:text-on-surface"
                  )}
                >
                  <LayoutGrid className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Tiles</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Filter Chips Bar */}
        <div className="border-outline-variant/40 flex flex-wrap items-center gap-2 border-b px-5 py-3">
          <FilterDropdown
            label="Status"
            value={statusFilter}
            options={statusOptions}
            onChange={setStatusFilter}
          />
          <FilterDropdown
            label="Stock"
            value={stockFilter}
            options={stockOptions}
            onChange={setStockFilter}
          />
          <FilterDropdown
            label="Category"
            value={categoryFilter}
            options={categoryOptions}
            onChange={setCategoryFilter}
          />
          <FilterDropdown
            label="Price"
            value={priceRangeFilter}
            options={priceOptions}
            onChange={setPriceRangeFilter}
          />
          <FilterDropdown
            label="Highlights"
            value={badgeFilter}
            options={badgeOptions}
            onChange={setBadgeFilter}
          />

          {isAnyFilterActive && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-primary inline-flex h-9 cursor-pointer items-center gap-1 rounded-lg px-2.5 text-xs font-semibold hover:underline"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Clear filters</span>
            </button>
          )}
        </div>

        {/* 4. WORKSPACE CONTENT: TABLE / TILES / EMPTY */}
        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="bg-surface-container text-on-surface-variant mb-3 flex h-12 w-12 items-center justify-center rounded-full">
              <ShoppingBag className="h-6 w-6 stroke-[1.5]" />
            </div>
            <h3 className="text-on-surface text-base font-bold">No listings match</h3>
            <p className="text-on-surface-variant mt-1 max-w-sm text-xs leading-relaxed">
              Remove a filter or search for a different name, ID, or category to find
              what you are looking for.
            </p>
            {isAnyFilterActive && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="bg-secondary-container text-on-secondary-container mt-4 inline-flex h-9 cursor-pointer items-center rounded-full px-5 text-xs font-semibold shadow-xs"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : viewMode === "list" ? (
          /* TABLE VIEW */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs" role="table">
              <thead>
                <tr className="border-outline-variant/50 bg-surface-container-low text-on-surface-variant border-b text-[11px] font-semibold tracking-wider uppercase">
                  <th className="w-12 px-4 py-3 text-center">
                    <label className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full">
                      <input
                        type="checkbox"
                        checked={isAllSelected}
                        ref={(el) => {
                          if (el) el.indeterminate = isIndeterminate;
                        }}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="border-outline-variant text-primary accent-primary h-4 w-4 rounded border-2"
                        aria-label="Select all listings"
                      />
                    </label>
                  </th>
                  <th className="min-w-[240px] px-4 py-3">Product</th>
                  <th className="hidden px-4 py-3 md:table-cell">Category</th>
                  <th className="px-4 py-3 text-right">Price</th>
                  <th className="px-4 py-3">Stock</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="hidden px-4 py-3 lg:table-cell">Updated</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-outline-variant/30 divide-y">
                {filteredProducts.map((p) => {
                  const imgThumb = resolveProductImage(p);
                  const isPublished = p.status === "published";
                  const isSelected = selectedIds.has(p.id);
                  const count = p.inventory_count ?? 0;
                  const threshold = p.low_stock_threshold ?? 5;

                  return (
                    <tr
                      key={p.id}
                      className={clsx(
                        "group transition-colors duration-150",
                        isSelected
                          ? "bg-primary/5 hover:bg-primary/8"
                          : "hover:bg-surface-container-low/60"
                      )}
                    >
                      {/* Checkbox */}
                      <td className="w-12 px-4 py-3 text-center">
                        <label className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSelect(p.id)}
                            className="border-outline-variant text-primary accent-primary h-4 w-4 rounded border-2"
                            aria-label={`Select ${p.name}`}
                          />
                        </label>
                      </td>

                      {/* Product Thumbnail + Name + Badges */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="border-outline-variant/40 bg-surface-container relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border">
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
                              <ShoppingBag className="text-on-surface-variant/40 h-6 w-6" />
                            )}
                          </div>

                          <div className="min-w-0">
                            <span className="text-on-surface block truncate text-sm font-semibold">
                              {p.name}
                            </span>
                            <div className="mt-0.5 flex flex-wrap items-center gap-2">
                              <span className="text-on-surface-variant font-mono text-[10px]">
                                ID {p.id.slice(0, 8)}
                              </span>
                              {p.is_new_arrival && (
                                <span className="bg-tertiary-container text-on-tertiary-container py-0.2 inline-flex items-center gap-1 rounded-sm px-1.5 text-[10px] font-bold">
                                  <Sparkles className="h-2.5 w-2.5" /> New
                                </span>
                              )}
                              {p.is_featured && (
                                <span className="py-0.2 inline-flex items-center gap-1 rounded-sm bg-amber-100 px-1.5 text-[10px] font-bold text-amber-800">
                                  <Star className="h-2.5 w-2.5 fill-current" /> Featured
                                </span>
                              )}
                              {p.is_best_seller && (
                                <span className="py-0.2 inline-flex items-center gap-1 rounded-sm bg-rose-100 px-1.5 text-[10px] font-bold text-rose-800">
                                  <Flame className="h-2.5 w-2.5 fill-current" /> Best
                                  Seller
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="text-on-surface-variant hidden px-4 py-3 md:table-cell">
                        {p.category || "—"}
                      </td>

                      {/* Price */}
                      <td className="text-on-surface px-4 py-3 text-right font-mono text-sm font-semibold tabular-nums">
                        ₹{(p.price_inr || 0).toLocaleString("en-IN")}
                      </td>

                      {/* Stock */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-on-surface font-mono text-sm font-semibold tabular-nums">
                            {count}
                          </span>
                          {count === 0 ? (
                            <span className="bg-error-container text-on-error-container inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-semibold">
                              Out of stock
                            </span>
                          ) : count <= threshold ? (
                            <span className="bg-warning-container text-on-warning-container inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-semibold">
                              Low
                            </span>
                          ) : (
                            <span className="bg-secondary-container text-on-secondary-container inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-semibold">
                              In stock
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status with Inline Switch */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <MaterialSwitch
                            checked={isPublished}
                            disabled={loadingId === p.id}
                            onChange={() => handleToggleStatus(p)}
                            label={`Published: ${p.name}`}
                          />
                          <span className="text-on-surface-variant text-xs">
                            {isPublished ? "Published" : "Draft"}
                          </span>
                        </div>
                      </td>

                      {/* Updated Date */}
                      <td className="text-on-surface-variant hidden px-4 py-3 lg:table-cell">
                        {formatDate(p.updated_at || p.created_at)}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(p)}
                            aria-label={`Edit ${p.name}`}
                            className="text-on-surface-variant hover:bg-surface-container hover:text-on-surface flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition-colors"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <ActionDropdown align="right" actions={getActionItems(p)} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          /* TILES / GRID VIEW */
          <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((p) => {
              const imgThumb = resolveProductImage(p);
              const isPublished = p.status === "published";
              const isSelected = selectedIds.has(p.id);
              const count = p.inventory_count ?? 0;
              const threshold = p.low_stock_threshold ?? 5;

              return (
                <article
                  key={p.id}
                  className={clsx(
                    "border-outline-variant/60 bg-surface-container-lowest shadow-elevation-1 flex flex-col overflow-hidden rounded-xl border transition-all",
                    isSelected && "ring-primary border-primary ring-2"
                  )}
                >
                  {/* Media Container */}
                  <div className="bg-surface-container relative aspect-4/3 w-full overflow-hidden">
                    {imgThumb ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={imgThumb}
                        alt={p.name}
                        className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="text-on-surface-variant/40 flex h-full w-full items-center justify-center">
                        <ShoppingBag className="h-10 w-10" />
                      </div>
                    )}

                    {/* Checkbox overlay top-left */}
                    <div className="absolute top-2 left-2">
                      <label className="bg-surface/85 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full shadow-xs backdrop-blur-xs">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(p.id)}
                          className="border-outline-variant text-primary accent-primary h-4 w-4 rounded border-2"
                          aria-label={`Select ${p.name}`}
                        />
                      </label>
                    </div>

                    {/* Badges top-right */}
                    <div className="absolute top-2.5 right-2.5 flex flex-col items-end gap-1">
                      {p.is_new_arrival && (
                        <span className="bg-tertiary-container text-on-tertiary-container inline-flex items-center gap-1 rounded-sm px-2 py-0.5 text-[10px] font-bold shadow-xs">
                          <Sparkles className="h-2.5 w-2.5" /> New
                        </span>
                      )}
                      {p.is_featured && (
                        <span className="inline-flex items-center gap-1 rounded-sm bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-xs">
                          <Star className="h-2.5 w-2.5 fill-current" /> Featured
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Body */}
                  <div className="flex flex-1 flex-col p-4">
                    <h3
                      className="text-on-surface line-clamp-2 text-sm font-semibold"
                      title={p.name}
                    >
                      {p.name}
                    </h3>
                    <p className="text-on-surface-variant mt-1 text-xs">
                      {p.category || "General"}
                    </p>

                    <div className="mt-auto flex items-center justify-between pt-3">
                      <span className="text-on-surface font-mono text-base font-bold tabular-nums">
                        ₹{(p.price_inr || 0).toLocaleString("en-IN")}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <span className="text-on-surface font-mono text-xs font-semibold">
                          {count}
                        </span>
                        {count === 0 ? (
                          <span className="bg-error-container text-on-error-container inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-semibold">
                            Out of stock
                          </span>
                        ) : count <= threshold ? (
                          <span className="bg-warning-container text-on-warning-container inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-semibold">
                            Low
                          </span>
                        ) : (
                          <span className="bg-secondary-container text-on-secondary-container inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-semibold">
                            In stock
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="border-outline-variant/40 flex items-center gap-2 border-t px-4 py-2.5">
                    <MaterialSwitch
                      checked={isPublished}
                      disabled={loadingId === p.id}
                      onChange={() => handleToggleStatus(p)}
                      label={`Published: ${p.name}`}
                    />
                    <span className="text-on-surface-variant text-xs">
                      {isPublished ? "Published" : "Draft"}
                    </span>

                    <div className="ml-auto flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(p)}
                        aria-label={`Edit ${p.name}`}
                        className="text-on-surface-variant hover:bg-surface-container hover:text-on-surface flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <ActionDropdown align="right" actions={getActionItems(p)} />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* 5. SLIDE-OVER QUICK EDIT DRAWER */}
      {editingProduct && (
        <SlideOverDrawer
          isOpen={Boolean(editingProduct)}
          onClose={() => setEditingProduct(null)}
          title="Quick Edit Listing"
          subtitle="Update core listing details without leaving the catalog."
          maxWidth="lg"
          footer={
            <>
              <Link
                href={editProductHref(editingProduct.id)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1A1A18] transition-colors hover:text-[#C89D32]"
              >
                <span>Open full product editor</span>
                <ExternalLink className="h-3.5 w-3.5 text-[#52524E]" />
              </Link>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingProduct(null)}
                  className="rounded-full border border-[#E5E5E0] bg-white px-4 py-2 text-xs font-medium text-[#1A1A18] hover:bg-[#FAF8F4]"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="sm"
                  disabled={isSaving}
                  onClick={handleSaveEdit}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#1A1A18] px-5 py-2 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-[#2E2E2B] disabled:opacity-60"
                >
                  {isSaving ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Save className="h-3.5 w-3.5" />
                  )}
                  <span>Save changes</span>
                </Button>
              </div>
            </>
          }
        >
          <div className="space-y-5">
            {/* Product Context Card */}
            <div className="flex items-center gap-3.5 rounded-xl border border-[#E5E5E0] bg-[#FAF8F4] p-3">
              <QuickEditThumbnail product={editingProduct} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold text-[#1A1A18]">
                  {editingProduct.name}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-1.5 font-mono text-[10px] text-[#52524E]">
                  <span>
                    SKU:{" "}
                    {editingProduct.sku || editingProduct.id.slice(0, 8).toUpperCase()}
                  </span>
                  <span>•</span>
                  <span>{editingProduct.inventory_count ?? 0} in stock</span>
                </div>
                <div className="mt-1.5 flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      editingProduct.status === "published"
                        ? "border border-[#E5E5E0] bg-white text-[#1A1A18]"
                        : "border border-amber-300 bg-amber-50 text-amber-800"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        editingProduct.status === "published"
                          ? "bg-[#1A1A18]"
                          : "bg-amber-500"
                      }`}
                    />
                    {editingProduct.status === "published" ? "Live" : "Draft"}
                  </span>
                  <span className="text-xs font-bold text-[#1A1A18]">
                    ₹{editingProduct.price_inr?.toLocaleString("en-IN") ?? "0"}
                  </span>
                </div>
              </div>
            </div>

            {/* Product Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#1A1A18]">
                Product Name
              </label>
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                placeholder="Product title"
                className="w-full rounded-xl border border-[#E5E5E0] bg-[#FAF8F4]/50 px-3.5 py-2.5 text-xs text-[#1A1A18] transition-colors placeholder:text-[#52524E]/50 focus:border-[#1A1A18] focus:bg-white focus:ring-1 focus:ring-[#1A1A18] focus:outline-none"
              />
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#1A1A18]">
                Marketplace Category
              </label>
              <Select
                value={editForm.category}
                onChange={(val) => setEditForm({ ...editForm, category: val })}
                options={quickEditCategoryOptions}
                placeholder="Select category"
              />
            </div>

            {/* Price & Status Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#1A1A18]">
                  Price (INR)
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-xs font-semibold text-[#52524E]">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={editForm.price_inr}
                    onChange={(e) =>
                      setEditForm({ ...editForm, price_inr: e.target.value })
                    }
                    placeholder="0"
                    className="w-full rounded-xl border border-[#E5E5E0] bg-[#FAF8F4]/50 py-2.5 pr-3.5 pl-7 font-mono text-xs text-[#1A1A18] transition-colors placeholder:text-[#52524E]/50 focus:border-[#1A1A18] focus:bg-white focus:ring-1 focus:ring-[#1A1A18] focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#1A1A18]">
                  Listing Status
                </label>
                <Select
                  value={editForm.status}
                  onChange={(val) => setEditForm({ ...editForm, status: val })}
                  options={[
                    { value: "published", label: "Published (Live)" },
                    { value: "draft", label: "Draft (Hidden)" },
                    { value: "archived", label: "Archived" },
                  ]}
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[#1A1A18]">
                  Short Description
                </label>
                <span className="text-[10px] text-[#52524E]">
                  {editForm.description.length} characters
                </span>
              </div>
              <textarea
                rows={4}
                value={editForm.description}
                onChange={(e) =>
                  setEditForm({ ...editForm, description: e.target.value })
                }
                placeholder="Brief craft summary and buyer specifications..."
                className="w-full rounded-xl border border-[#E5E5E0] bg-[#FAF8F4]/50 p-3 text-xs leading-relaxed text-[#1A1A18] transition-colors placeholder:text-[#52524E]/50 focus:border-[#1A1A18] focus:bg-white focus:ring-1 focus:ring-[#1A1A18] focus:outline-none"
              />
              <p className="text-[10px] text-[#52524E]">
                Shown in product search previews and category recommendation feeds.
              </p>
            </div>
          </div>
        </SlideOverDrawer>
      )}
    </div>
  );
}
