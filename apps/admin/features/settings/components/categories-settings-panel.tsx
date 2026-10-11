"use client";

import React, { useState, useTransition } from "react";
import {
  Tag,
  Plus,
  Trash2,
  Search,
  FolderPlus,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  Boxes,
  Layers,
  Sparkles,
} from "lucide-react";
import type { Category } from "@genz/types";
import {
  addCategoryAction,
  deleteCategoryAction,
} from "@/app/dashboard/settings/actions";

interface CategoriesSettingsPanelProps {
  initialCategories?: Category[];
  onNotify?: (msg: string) => void;
}

export function CategoriesSettingsPanel({
  initialCategories = [],
  onNotify,
}: CategoriesSettingsPanelProps) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [newCatName, setNewCatName] = useState("");
  const [newCatDesc, setNewCatDesc] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [isAdding, startAddTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();

  // Filter categories by search query
  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
  );

  const totalProducts = categories.reduce(
    (acc, curr) => acc + (curr.productCount || 0),
    0
  );

  // 1. Handle Category Addition
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newCatName.trim();
    if (!name) {
      setErrorMessage("Please enter a category name.");
      return;
    }

    if (categories.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
      setErrorMessage(`Category "${name}" already exists.`);
      return;
    }

    setErrorMessage(null);
    startAddTransition(async () => {
      const formData = new FormData();
      formData.set("name", name);
      if (newCatDesc.trim()) formData.set("description", newCatDesc.trim());

      const res = await addCategoryAction(null, formData);
      if (res.success && res.category) {
        setCategories((prev) =>
          [...prev, res.category!].sort((a, b) => a.name.localeCompare(b.name))
        );
        setNewCatName("");
        setNewCatDesc("");
        onNotify?.(`Category "${name}" added successfully.`);
      } else {
        setErrorMessage(res.error || "Failed to add category.");
      }
    });
  };

  // 2. Handle Category Subtraction (Deletion)
  const confirmDeleteCategory = () => {
    if (!deleteTarget) return;

    const target = deleteTarget;
    setErrorMessage(null);
    startDeleteTransition(async () => {
      const formData = new FormData();
      formData.set("identifier", target.id || target.name);

      const res = await deleteCategoryAction(null, formData);
      if (res.success) {
        setCategories((prev) => prev.filter((c) => c.name !== target.name && c.id !== target.id));
        setDeleteTarget(null);
        onNotify?.(`Category "${target.name}" removed from platform.`);
      } else {
        setErrorMessage(res.error || "Failed to remove category.");
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="border-outline-variant/60 bg-surface-container-low flex items-center gap-4 rounded-2xl border p-5">
          <div className="bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-xl">
            <Tag className="h-6 w-6" />
          </div>
          <div>
            <p className="text-on-surface-variant text-xs font-medium">
              Total Categories
            </p>
            <p className="text-on-surface text-2xl font-bold">{categories.length}</p>
          </div>
        </div>

        <div className="border-outline-variant/60 bg-surface-container-low flex items-center gap-4 rounded-2xl border p-5">
          <div className="bg-success-container text-on-success-container flex h-12 w-12 items-center justify-center rounded-xl">
            <Boxes className="h-6 w-6" />
          </div>
          <div>
            <p className="text-on-surface-variant text-xs font-medium">
              Categorized Products
            </p>
            <p className="text-on-surface text-2xl font-bold">{totalProducts}</p>
          </div>
        </div>

        <div className="border-outline-variant/60 bg-surface-container-low flex items-center gap-4 rounded-2xl border p-5">
          <div className="bg-secondary-container text-on-secondary-container flex h-12 w-12 items-center justify-center rounded-xl">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <p className="text-on-surface-variant text-xs font-medium">
              Database Sync
            </p>
            <p className="text-success text-sm font-semibold">Active &amp; Live</p>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="border-error/20 bg-error-container text-on-error-container flex items-center gap-3 rounded-2xl border p-4 text-xs font-medium">
          <AlertTriangle className="text-error h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 1. Category Addition Form */}
      <div className="border-outline-variant/60 bg-surface-container-lowest shadow-elevation-1 space-y-4 rounded-3xl border p-6">
        <div className="flex items-center gap-2.5">
          <FolderPlus className="text-primary h-5 w-5" />
          <div>
            <h3 className="text-on-surface text-base font-semibold">
              Add New Category
            </h3>
            <p className="text-on-surface-variant text-xs">
              Add a distinct product taxonomy to make it immediately selectable in seller
              catalogs and customer discovery facets.
            </p>
          </div>
        </div>

        <form onSubmit={handleAddCategory} className="space-y-4 pt-2">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="cat-name-input"
                className="text-on-surface-variant mb-1.5 block text-xs font-medium"
              >
                Category Name <span className="text-error">*</span>
              </label>
              <input
                id="cat-name-input"
                type="text"
                required
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="e.g. Kondapalli Toys, Bidriware, Kalamkari Art"
                className="border-outline-variant bg-surface-container-lowest text-on-surface focus:border-primary focus:ring-primary h-12 w-full rounded-xl border px-4 text-sm transition focus:ring-1 focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="cat-desc-input"
                className="text-on-surface-variant mb-1.5 block text-xs font-medium"
              >
                Description / Lineage (Optional)
              </label>
              <input
                id="cat-desc-input"
                type="text"
                value={newCatDesc}
                onChange={(e) => setNewCatDesc(e.target.value)}
                placeholder="e.g. GI-certified wooden lacquer craft from Andhra Pradesh"
                className="border-outline-variant bg-surface-container-lowest text-on-surface focus:border-primary focus:ring-primary h-12 w-full rounded-xl border px-4 text-sm transition focus:ring-1 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={isAdding || !newCatName.trim()}
              className="bg-primary text-on-primary hover:shadow-elevation-2 inline-flex h-11 cursor-pointer items-center gap-2 rounded-xl px-5 text-sm font-semibold tracking-wide uppercase transition-shadow disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isAdding ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              Add Category
            </button>
          </div>
        </form>
      </div>

      {/* 2. Category Subtraction & Directory */}
      <div className="border-outline-variant/60 bg-surface-container-lowest shadow-elevation-1 space-y-4 rounded-3xl border p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h3 className="text-on-surface text-base font-semibold">
              Platform Categories Directory
            </h3>
            <p className="text-on-surface-variant text-xs">
              Manage and subtract (delete) categories currently stored in the database.
            </p>
          </div>

          {/* Search filter */}
          <div className="relative w-full sm:w-72">
            <Search className="text-on-surface-variant absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter categories…"
              className="border-outline-variant bg-surface-container-low text-on-surface focus:border-primary focus:ring-primary h-10 w-full rounded-xl border pr-4 pl-10 text-xs transition focus:ring-1 focus:outline-none"
            />
          </div>
        </div>

        {/* Categories List */}
        <div className="divide-outline-variant/40 divide-y overflow-hidden rounded-2xl border border-outline-variant/50">
          {filteredCategories.length === 0 ? (
            <div className="text-on-surface-variant py-12 text-center text-xs">
              {searchQuery
                ? `No categories match "${searchQuery}".`
                : "No categories in database yet. Add one above."}
            </div>
          ) : (
            filteredCategories.map((c) => {
              const productCount = c.productCount || 0;
              return (
                <div
                  key={c.id || c.name}
                  className="hover:bg-surface-container-low/50 flex items-center justify-between gap-4 p-4 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2.5">
                      <span className="text-on-surface text-sm font-semibold">
                        {c.name}
                      </span>
                      <span className="border-outline-variant/60 bg-surface-container-high text-on-surface-variant rounded-full border px-2 py-0.5 font-mono text-[11px]">
                        {c.slug}
                      </span>
                      {productCount > 0 ? (
                        <span className="bg-primary-container text-on-primary-container rounded-full px-2.5 py-0.5 text-[11px] font-medium">
                          {productCount} {productCount === 1 ? "product" : "products"}
                        </span>
                      ) : (
                        <span className="text-on-surface-variant/70 text-[11px]">
                          0 products
                        </span>
                      )}
                    </div>
                    {c.description && (
                      <p className="text-on-surface-variant mt-1 line-clamp-1 text-xs">
                        {c.description}
                      </p>
                    )}
                  </div>

                  {/* Subtraction Button */}
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(c)}
                    className="text-on-surface-variant hover:text-error hover:bg-error-container/40 inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-outline-variant/60 px-3 text-xs font-medium transition-colors"
                    title={`Subtract / Delete ${c.name}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Subtract</span>
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Delete / Subtraction Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="border-outline-variant bg-surface-container-lowest shadow-elevation-3 w-full max-w-md space-y-4 rounded-3xl border p-6">
            <div className="flex items-start gap-3">
              <div className="bg-error-container text-on-error-container flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-on-surface text-base font-bold">
                  Subtract Category?
                </h4>
                <p className="text-on-surface-variant mt-1 text-xs leading-relaxed">
                  Are you sure you want to delete{" "}
                  <strong className="text-on-surface font-semibold">
                    &quot;{deleteTarget.name}&quot;
                  </strong>{" "}
                  from the platform database?
                </p>
                {deleteTarget.productCount && deleteTarget.productCount > 0 ? (
                  <div className="border-error/20 bg-error-container/30 text-on-error-container mt-2.5 flex items-start gap-2 rounded-xl border p-2.5 text-xs">
                    <AlertTriangle className="text-error mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span>
                      Notice: <strong>{deleteTarget.productCount} products</strong> are
                      currently assigned to this category.
                    </span>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="border-outline-variant text-on-surface hover:bg-surface-container-low h-10 cursor-pointer rounded-xl border px-4 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={confirmDeleteCategory}
                className="bg-error text-on-error hover:bg-error/90 inline-flex h-10 cursor-pointer items-center gap-1.5 rounded-xl px-4 text-xs font-semibold shadow-xs transition-colors"
              >
                {isDeleting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5" />
                )}
                Confirm Subtraction
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
