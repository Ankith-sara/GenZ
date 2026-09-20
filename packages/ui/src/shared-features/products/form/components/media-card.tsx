"use client";

import React, { useState, useRef, useCallback } from "react";
import {
  Upload,
  Link2,
  X,
  Star,
  GripVertical,
  Maximize2,
  Loader2,
  AlertCircle,
  Plus,
  CheckCircle2,
  Image as ImageIcon,
} from "lucide-react";

export interface ProductImageItem {
  id: string;
  file?: File;
  previewUrl: string;
  source: "file" | "url";
  name?: string;
  size?: number;
}

interface MediaCardProps {
  images: ProductImageItem[];
  onImagesChange: (images: ProductImageItem[]) => void;
  maxImages?: number;
}

export function MediaCard({ images, onImagesChange, maxImages = 8 }: MediaCardProps) {
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // URL modal / inline state
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInputValue, setUrlInputValue] = useState("");
  const [isUrlLoading, setIsUrlLoading] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);

  // Lightbox preview state
  const [previewItem, setPreviewItem] = useState<ProductImageItem | null>(null);

  // Hidden file input ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  const remainingSlots = Math.max(0, maxImages - images.length);
  const isMaxReached = images.length >= maxImages;

  // Process selected or dropped files
  const handleFiles = useCallback(
    (files: FileList | File[]) => {
      const fileArr = Array.from(files);
      if (fileArr.length === 0) return;

      const validFiles: ProductImageItem[] = [];
      const currentCount = images.length;
      const slotsLeft = maxImages - currentCount;

      const allowedFiles = fileArr.slice(0, slotsLeft);

      for (const file of allowedFiles) {
        if (!file.type.startsWith("image/")) continue;
        if (file.size > 5 * 1024 * 1024) continue; // 5MB limit

        validFiles.push({
          id: `img-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          file,
          previewUrl: URL.createObjectURL(file),
          source: "file",
          name: file.name,
          size: file.size,
        });
      }

      if (validFiles.length > 0) {
        onImagesChange([...images, ...validFiles].slice(0, maxImages));
      }
    },
    [images, maxImages, onImagesChange]
  );

  // File input change
  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
    if (e.target) e.target.value = "";
  };

  // Drag and drop onto upload zone
  const handleZoneDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isMaxReached) {
      setIsDraggingOver(true);
    }
  };

  const handleZoneDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
  };

  const handleZoneDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);

    if (isMaxReached) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  // Drag & drop reordering of existing images
  const handleItemDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", `${index}`);
  };

  const handleItemDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleItemDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleItemDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    e.stopPropagation();

    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const updated = [...images];
    const [movedItem] = updated.splice(draggedIndex, 1);
    updated.splice(targetIndex, 0, movedItem);

    setDraggedIndex(null);
    setDragOverIndex(null);
    onImagesChange(updated);
  };

  const handleItemDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Quick action: Promote item to Cover (index 0)
  const handleSetCover = (index: number) => {
    if (index === 0 || index >= images.length) return;
    const updated = [...images];
    const [item] = updated.splice(index, 1);
    updated.unshift(item);
    onImagesChange(updated);
  };

  // Remove item
  const handleRemove = (index: number) => {
    const updated = images.filter((_, idx) => idx !== index);
    onImagesChange(updated);
  };

  // Add from URL handler
  const handleAddFromUrl = async () => {
    const trimmed = urlInputValue.trim();
    if (!trimmed) {
      setUrlError("Please enter a valid image URL.");
      return;
    }

    try {
      new URL(trimmed);
    } catch {
      setUrlError("Invalid URL format. Include http:// or https://");
      return;
    }

    setIsUrlLoading(true);
    setUrlError(null);

    try {
      // Validate image by loading it
      await new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () =>
          reject(
            new Error(
              "Unable to load image from this URL. Check format or CORS restrictions."
            )
          );
        img.src = trimmed;
      });

      // Try fetching as File if possible
      let fileObj: File | undefined;
      try {
        const res = await fetch(trimmed, { mode: "cors" });
        if (res.ok) {
          const blob = await res.blob();
          const ext = blob.type.split("/")[1] || "jpg";
          fileObj = new File([blob], `imported-image-${Date.now()}.${ext}`, {
            type: blob.type || "image/jpeg",
          });
        }
      } catch {
        // Fallback: If CORS blocks fetch, file remains undefined and previewUrl is used
      }

      const newItem: ProductImageItem = {
        id: `url-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        file: fileObj,
        previewUrl: trimmed,
        source: "url",
        name: trimmed.split("/").pop()?.split("?")[0] || "Remote Image",
      };

      onImagesChange([...images, newItem].slice(0, maxImages));
      setUrlInputValue("");
      setShowUrlInput(false);
    } catch (err: unknown) {
      setUrlError(
        err instanceof Error ? err.message : "Failed to load image from URL."
      );
    } finally {
      setIsUrlLoading(false);
    }
  };

  return (
    <div
      id="media"
      className="border-border bg-card space-y-5 rounded-lg border p-5 shadow-sm"
    >
      {/* SECTION HEADER */}
      <div className="border-border flex flex-col gap-2 border-b pb-3.5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-foreground flex items-center gap-2 text-sm font-bold">
              <ImageIcon className="text-muted-foreground h-4 w-4" />
              <span>Product Images</span>
            </h2>
            <span
              className={`rounded-full px-2.5 py-0.5 font-mono text-[11px] font-semibold ${
                isMaxReached
                  ? "bg-amber-500/15 text-amber-800 dark:text-amber-300"
                  : images.length > 0
                    ? "bg-muted text-foreground"
                    : "bg-muted/60 text-muted-foreground"
              }`}
            >
              {images.length} / {maxImages} images
            </span>
          </div>
          <p className="text-muted-foreground mt-0.5 text-xs">
            The first photo is automatically the{" "}
            <strong className="text-foreground font-semibold">Cover</strong>. Drag to
            reorder photos anytime.
          </p>
        </div>

        {/* Action Controls in Header (Upload & Add URL) */}
        {!isMaxReached ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setShowUrlInput(!showUrlInput);
                setUrlError(null);
              }}
              className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all ${
                showUrlInput
                  ? "border-[#18181b] !bg-[#18181b] !text-white dark:border-white dark:!bg-card dark:!text-foreground"
                  : "border-border bg-background text-foreground hover:bg-muted/40"
              }`}
            >
              <Link2 className="h-3.5 w-3.5" />
              <span>Add from URL</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full !bg-[#18181b] px-4 py-1.5 text-xs font-semibold !text-white shadow-sm transition-all hover:!bg-[#27272a] active:scale-[0.98]"
            >
              <Upload className="h-3.5 w-3.5" />
              <span>Upload Images</span>
            </button>
          </div>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Maximum capacity reached</span>
          </span>
        )}

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/avif"
          multiple
          className="sr-only"
          onChange={onFileInputChange}
        />
      </div>

      {/* INLINE "ADD FROM URL" PANEL */}
      {showUrlInput && !isMaxReached && (
        <div className="border-border bg-muted/40 animate-in fade-in slide-in-from-top-1 space-y-2.5 rounded-lg border p-4 duration-150">
          <div className="flex items-center justify-between">
            <label
              htmlFor="image-url-input"
              className="text-foreground flex items-center gap-1.5 text-xs font-semibold"
            >
              <Link2 className="text-muted-foreground h-3.5 w-3.5" />
              <span>Paste Image URL</span>
            </label>
            <button
              type="button"
              onClick={() => setShowUrlInput(false)}
              className="text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="flex gap-2">
            <input
              id="image-url-input"
              type="url"
              placeholder="https://images.unsplash.com/photo-... or direct CDN URL"
              value={urlInputValue}
              onChange={(e) => {
                setUrlInputValue(e.target.value);
                setUrlError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddFromUrl();
                }
              }}
              disabled={isUrlLoading}
              className="border-border bg-background text-foreground placeholder:text-muted-foreground focus:ring-primary/20 flex-1 rounded-lg border px-3.5 py-2 text-xs focus:ring-2 focus:outline-none"
            />
            <button
              type="button"
              onClick={handleAddFromUrl}
              disabled={isUrlLoading || !urlInputValue.trim()}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg !bg-[#18181b] px-4 py-2 text-xs font-semibold !text-white transition-all hover:!bg-[#27272a] disabled:opacity-50"
            >
              {isUrlLoading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Loading...</span>
                </>
              ) : (
                <span>Add Image</span>
              )}
            </button>
          </div>

          {urlError && (
            <p className="text-destructive flex items-center gap-1 text-[11px]">
              <AlertCircle className="h-3 w-3 shrink-0" />
              <span>{urlError}</span>
            </p>
          )}
        </div>
      )}

      {/* EMPTY STATE DRAG & DROP ZONE */}
      {images.length === 0 && (
        <div
          onDragOver={handleZoneDragOver}
          onDragLeave={handleZoneDragLeave}
          onDrop={handleZoneDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center transition-all duration-200 ${
            isDraggingOver
              ? "border-primary bg-primary/5 ring-primary/10 scale-[0.99] ring-4"
              : "border-border bg-muted/20 hover:border-foreground/20 hover:bg-muted/40"
          }`}
        >
          <div className="border-border bg-background text-muted-foreground flex h-12 w-12 items-center justify-center rounded-full border shadow-sm transition-transform group-hover:scale-105">
            <Upload className="h-5 w-5" />
          </div>

          <div className="mt-3 space-y-1">
            <p className="text-foreground text-sm font-bold">
              Drag & drop product photos here
            </p>
            <p className="text-muted-foreground text-xs">
              or click to browse from your device
            </p>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <span className="bg-background border-border text-muted-foreground inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold">
              PNG, JPG, WEBP, AVIF
            </span>
            <span className="bg-background border-border text-muted-foreground inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold">
              Max 5MB each
            </span>
            <span className="bg-background border-border text-muted-foreground inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold">
              Up to 8 images
            </span>
          </div>
        </div>
      )}

      {/* GALLERY GRID (When 1 or more images exist) */}
      {images.length > 0 && (
        <div
          onDragOver={handleZoneDragOver}
          onDragLeave={handleZoneDragLeave}
          onDrop={handleZoneDrop}
          className={`relative rounded-lg p-1 transition-all ${
            isDraggingOver ? "rounded-lg bg-neutral-50 ring-2 ring-neutral-900" : ""
          }`}
        >
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {images.map((item, idx) => {
              const isCover = idx === 0;
              const isDragging = draggedIndex === idx;
              const isDragTarget = dragOverIndex === idx;

              return (
                <div
                  key={item.id}
                  draggable
                  onDragStart={(e) => handleItemDragStart(e, idx)}
                  onDragOver={(e) => handleItemDragOver(e, idx)}
                  onDragLeave={handleItemDragLeave}
                  onDrop={(e) => handleItemDrop(e, idx)}
                  onDragEnd={handleItemDragEnd}
                  className={`group bg-muted/20 relative aspect-square overflow-hidden rounded-lg border transition-all duration-200 ${
                    isCover
                      ? "border-primary ring-primary/20 shadow-sm ring-2"
                      : "border-border hover:border-foreground/20 shadow-sm"
                  } ${isDragging ? "scale-95 opacity-30" : "opacity-100"} ${
                    isDragTarget ? "ring-primary scale-102 ring-2" : ""
                  }`}
                >
                  {/* Thumbnail Image */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.previewUrl}
                    alt={item.name || `Product image ${idx + 1}`}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />

                  {/* Gradient overlay on hover for high contrast */}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40 opacity-0 transition-opacity duration-150 group-hover:opacity-100" />

                  {/* COVER BADGE OR POSITION NUMBER (Top-Left) */}
                  <div className="absolute top-2 left-2 z-10">
                    {isCover ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-foreground/85 px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-white uppercase shadow-sm backdrop-blur-xs">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        <span>COVER</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center justify-center rounded-full bg-foreground/75 px-2 py-0.5 font-mono text-[10px] font-semibold text-white shadow-sm backdrop-blur-xs">
                        #{idx + 1}
                      </span>
                    )}
                  </div>

                  {/* TOP-RIGHT CONTROLS: Zoom & Remove */}
                  <div className="absolute top-2 right-2 z-10 flex items-center gap-1 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                    <button
                      type="button"
                      title="Preview full image"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewItem(item);
                      }}
                      className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-foreground/75 text-white backdrop-blur-xs transition-colors hover:bg-foreground"
                    >
                      <Maximize2 className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      title="Remove image"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(idx);
                      }}
                      className="hover:bg-destructive flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-foreground/75 text-white backdrop-blur-xs transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* BOTTOM ACTION BAR: Drag Handle & "Set Cover" */}
                  <div className="absolute right-2 bottom-2 left-2 z-10 flex items-center justify-between opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                    <div
                      title="Drag to reorder"
                      className="cursor-grab p-1 text-white/90 hover:text-white active:cursor-grabbing"
                    >
                      <GripVertical className="h-4 w-4" />
                    </div>

                    {!isCover && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSetCover(idx);
                        }}
                        className="inline-flex cursor-pointer items-center gap-1 rounded-full bg-card/95 px-2.5 py-1 text-[10px] font-bold text-neutral-900 shadow-sm backdrop-blur-xs transition-all hover:bg-card active:scale-95"
                      >
                        <Star className="h-2.5 w-2.5 fill-amber-500 text-amber-500" />
                        <span>Make Cover</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {/* INTERACTIVE ADD TILE (If not max reached) */}
            {!isMaxReached && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="group border-border bg-muted/20 hover:border-foreground/20 hover:bg-muted/40 relative flex aspect-square cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-3 text-center transition-all"
              >
                <div className="border-border bg-background text-muted-foreground flex h-8 w-8 items-center justify-center rounded-full border shadow-sm transition-transform group-hover:scale-105">
                  <Plus className="h-4 w-4" />
                </div>
                <span className="text-foreground mt-2 text-xs font-semibold">
                  Add Image
                </span>
                <span className="text-muted-foreground font-mono text-[10px]">
                  {remainingSlots} left
                </span>
              </button>
            )}

            {/* SUBTLE EMPTY SLOTS OUTLINES (For remaining slots up to 8) */}
            {Array.from({ length: Math.max(0, remainingSlots - 1) }).map(
              (_, emptyIdx) => (
                <div
                  key={`empty-slot-${emptyIdx}`}
                  className="border-border/60 bg-muted/10 text-muted-foreground/40 hidden aspect-square flex-col items-center justify-center rounded-lg border border-dashed sm:flex"
                >
                  <span className="font-mono text-[11px]">
                    #{images.length + emptyIdx + 2}
                  </span>
                </div>
              )
            )}
          </div>

          {/* Quick instructions bar */}
          <div className="text-muted-foreground mt-3.5 flex items-center justify-between px-1 text-[11px]">
            <span className="flex items-center gap-1.5 font-medium">
              <GripVertical className="h-3.5 w-3.5" />
              <span>Drag any photo to reorder</span>
            </span>
            <span className="font-medium">JPG, PNG, WEBP, AVIF • Up to 5MB</span>
          </div>
        </div>
      )}

      {/* LIGHTBOX PREVIEW MODAL */}
      {previewItem && (
        <div
          onClick={() => setPreviewItem(null)}
          className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-foreground/80 p-4 backdrop-blur-sm duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-card border-border text-foreground relative max-h-[90vh] max-w-2xl overflow-hidden rounded-lg border shadow-2xl"
          >
            <div className="border-border flex items-center justify-between border-b px-5 py-3.5">
              <div className="flex items-center gap-2">
                <span className="text-foreground text-xs font-bold">
                  {previewItem.name || "Product Image"}
                </span>
                {images[0]?.id === previewItem.id && (
                  <span className="rounded-full border border-amber-500/30 bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:text-amber-300">
                    COVER
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setPreviewItem(null)}
                className="text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer rounded-full p-1.5 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex max-h-[75vh] items-center justify-center bg-foreground/10 p-4 dark:bg-foreground/40">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewItem.previewUrl}
                alt={previewItem.name || "Image preview"}
                className="max-h-[70vh] w-auto max-w-full rounded-lg object-contain shadow-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
