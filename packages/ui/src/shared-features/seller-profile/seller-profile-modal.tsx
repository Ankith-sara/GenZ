"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";
import {
  SellerProfileView,
  type SellerProfileViewData,
  type SellerProductItem,
  type SellerReelItem,
} from "./seller-profile-view";

export interface SellerProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  seller: SellerProfileViewData | null;
  products?: SellerProductItem[];
  reels?: SellerReelItem[];
}

export function SellerProfileModal({
  isOpen,
  onClose,
  seller,
  products = [],
  reels = [],
}: SellerProfileModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !seller) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
      {/* Translucent Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative z-10 max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl sm:rounded-3xl bg-white shadow-2xl">
        {/* Floating Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100 text-[#171717] hover:bg-neutral-200 transition-colors shadow-xs cursor-pointer"
          aria-label="Close Profile Modal"
        >
          <X className="h-5 w-5" />
        </button>

        <SellerProfileView
          seller={seller}
          products={products}
          reels={reels}
          isModal={true}
          onClose={onClose}
          fullProfileHref={`/sellers/${seller.id}`}
        />
      </div>
    </div>
  );
}
