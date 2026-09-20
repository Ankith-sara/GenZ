"use client";

import React, { useState, useRef, useCallback } from "react";
import {
  Upload,
  Link2,
  X,
  GripVertical,
  Loader2,
  AlertCircle,
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

export interface MediaCardProps {
  images: ProductImageItem[];
  onImagesChange: (images: ProductImageItem[]) => void;
  maxImages?: number;
  isUploading?: boolean;
}

export function MediaCard({
  images,
  onImagesChange,
  maxImages = 8,
  isUploading = false,
}: MediaCardProps) {
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // URL inline state
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInputValue, setUrlInputValue] = useState("");
  const [isUrlLoading, setIsUrlLoading] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);

  // Hidden file input ref
  const fileInputRef = useRef<HTMLInputElement>(null);

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

    onImagesChange(updated);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleItemDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Remove photo
  const handleRemoveImage = (idToRemove: string) => {
    onImagesChange(images.filter((img) => img.id !== idToRemove));
  };

  // Add from remote URL
  const handleAddFromUrl = async () => {
    const trimmed = urlInputValue.trim();
    if (!trimmed) return;

    if (isMaxReached) {
      setUrlError(`Maximum limit of ${maxImages} images reached.`);
      return;
    }

    setIsUrlLoading(true);
    setUrlError(null);

    try {
      await new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () =>
          reject(
            new Error(
              "Unable to load image from this URL. Check format or access restrictions."
            )
          );
        img.src = trimmed;
      });

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
        // Fallback: previewUrl will be used
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
    <section
      id="sec-media"
      className="scroll-mt-24 overflow-hidden rounded-xl border border-[#E5E5E0] bg-white shadow-xs"
    >
      {/* Section Head */}
      <div className="flex items-start justify-between gap-3 border-b border-[#E5E5E0] p-5 pb-3 sm:p-6 sm:pb-3">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 text-[#52524E]">
            <ImageIcon className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <h2 className="flex items-center gap-1.5 text-base font-semibold text-[#1A1A18]">
              <span>Media &amp; photos</span>
              <span className="text-rose-600">*</span>
            </h2>
            <p className="mt-0.5 max-w-[60ch] text-xs text-[#52524E]">
              The first photo is the storefront cover. Drag a photo to reorder, or use
              the controls on mobile.
            </p>
          </div>
        </div>
        {isUploading && (
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[#E5E5E0] bg-[#FAF8F4] px-2.5 py-1 text-xs font-medium text-[#52524E]">
            <Loader2 className="h-3 w-3 animate-spin text-[#1A1A18]" />
            <span>Uploading...</span>
          </span>
        )}
      </div>

      {/* Section Body */}
      <div className="p-5 sm:p-6">
        <div className="space-y-3">
          {/* Dropzone */}
          <div
            onClick={() => {
              if (!isMaxReached) fileInputRef.current?.click();
            }}
            onDragOver={handleZoneDragOver}
            onDragLeave={handleZoneDragLeave}
            onDrop={handleZoneDrop}
            tabIndex={0}
            role="button"
            aria-label="Add product photos"
            className={`relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-7 text-center transition-all ${
              isMaxReached
                ? "cursor-not-allowed border-[#E5E5E0] bg-[#FAF8F4]/50 opacity-60"
                : isDraggingOver
                  ? "cursor-pointer border-[#1A1A18] bg-[#F4F4F5]"
                  : "cursor-pointer border-[#E5E5E0] bg-[#FAF8F4] hover:border-[#1A1A18]/40 hover:bg-[#F5F3ED]"
            }`}
          >
            <span className="text-[#52524E]">
              <Upload className="h-7 w-7 stroke-[1.75]" />
            </span>
            <b className="text-sm font-medium text-[#1A1A18]">
              Drag &amp; drop product photos here
            </b>
            <small className="text-xs text-[#52524E]">
              or click to browse, or add from a URL
            </small>

            {/* Metadata Badges */}
            <div className="mt-1 flex flex-wrap justify-center gap-1.5">
              <span className="inline-flex h-[22px] items-center rounded border border-[#E5E5E0] bg-white px-2 text-[11px] font-medium text-[#52524E]">
                PNG · JPG · WEBP
              </span>
              <span className="inline-flex h-[22px] items-center rounded border border-[#E5E5E0] bg-white px-2 text-[11px] font-medium text-[#52524E]">
                Max 5MB each
              </span>
              <span className="inline-flex h-[22px] items-center rounded border border-[#E5E5E0] bg-white px-2 text-[11px] font-medium text-[#52524E]">
                {images.length} / {maxImages} images
              </span>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/avif"
              multiple
              className="hidden"
              onChange={onFileInputChange}
              disabled={isMaxReached}
            />
          </div>

          {/* Add from URL Toggle Button */}
          {!isMaxReached && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowUrlInput(!showUrlInput);
                  setUrlError(null);
                }}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-[#1A1A18] transition-colors hover:bg-black/5"
              >
                <Link2 className="h-3.5 w-3.5 text-[#52524E]" />
                <span>Add from URL</span>
              </button>
            </div>
          )}

          {/* Inline URL Input Row */}
          {showUrlInput && !isMaxReached && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <input
                  type="url"
                  placeholder="https://example.com/photo.jpg"
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
                  className="h-10 flex-1 rounded-lg border border-[#E5E5E0] bg-white px-3.5 text-sm text-[#1A1A18] placeholder:text-[#52524E]/50 focus:border-[#1A1A18] focus:ring-1 focus:ring-[#1A1A18] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddFromUrl}
                  disabled={isUrlLoading || !urlInputValue.trim()}
                  className="inline-flex h-10 cursor-pointer items-center justify-center rounded-full bg-[#F4F4F5] px-4 text-xs font-semibold text-[#1A1A18] transition-colors hover:bg-[#E5E5E0] disabled:opacity-40"
                >
                  {isUrlLoading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    "Add"
                  )}
                </button>
              </div>

              {urlError && (
                <p className="flex items-center gap-1 text-[11px] text-rose-600">
                  <AlertCircle className="h-3 w-3 shrink-0" />
                  <span>{urlError}</span>
                </p>
              )}
            </div>
          )}

          {/* Media Grid */}
          {images.length > 0 && (
            <div className="mt-3.5 grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-5">
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
                    className={`group relative aspect-square cursor-grab overflow-hidden rounded-xl border bg-[#FAF8F4] transition-all active:cursor-grabbing ${
                      isCover
                        ? "border-[#1A1A18] ring-1 ring-[#1A1A18]"
                        : "border-[#E5E5E0] hover:border-[#1A1A18]/40"
                    } ${isDragging ? "scale-95 opacity-30" : "opacity-100"} ${
                      isDragTarget ? "scale-102 ring-2 ring-[#1A1A18]" : ""
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.previewUrl}
                      alt={item.name || `Photo ${idx + 1}`}
                      className="h-full w-full object-cover select-none"
                    />

                    {/* Cover Pill */}
                    {isCover && (
                      <span className="absolute top-1.5 left-1.5 flex h-5 items-center rounded bg-[#1A1A18] px-2 text-[10px] font-semibold tracking-wider text-white shadow-xs">
                        COVER
                      </span>
                    )}

                    {/* Remove Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveImage(item.id);
                      }}
                      className="absolute top-1.5 right-1.5 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white shadow-xs transition-colors hover:bg-black/80"
                      title="Remove photo"
                      aria-label="Remove photo"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>

                    {/* Bottom Drag Handle */}
                    <div className="absolute inset-x-0 bottom-0 flex h-6 items-center justify-center bg-gradient-to-t from-black/60 to-transparent text-white/90">
                      <GripVertical className="h-3.5 w-3.5" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
