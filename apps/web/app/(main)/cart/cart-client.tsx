"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@genz/ui";
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Truck,
  CreditCard,
} from "lucide-react";
import Link from "next/link";

interface CartItem {
  id: string;
  name: string;
  category?: string;
  price: number;
  quantity: number;
  image?: string;
  sellerId?: string;
  seller_id?: string;
  sellerBusinessName?: string;
  variantName?: string;
  variantValue?: string;
}

const DEFAULT_CART_ITEMS: CartItem[] = [
  {
    id: "prod-1",
    name: "Handcrafted Channapatna Wooden Stacker",
    category: "Wooden Toys",
    price: 899,
    quantity: 1,
    image: "https://images.unsplash.com/photo-1515488042361-404e9250afef?w=400&q=80",
    sellerId: "c85d85fe-ae31-419b-a3d5-e3b97b09335f",
    sellerBusinessName: "Channapatna Craft Collective",
  },
];

export function CartClient() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
    const stored = localStorage.getItem("genz-cart");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setCartItems(Array.isArray(parsed) ? parsed : DEFAULT_CART_ITEMS);
      } catch {
        setCartItems(DEFAULT_CART_ITEMS);
      }
    } else {
      setCartItems(DEFAULT_CART_ITEMS);
      localStorage.setItem("genz-cart", JSON.stringify(DEFAULT_CART_ITEMS));
    }
  }, []);

  function saveCart(items: CartItem[]) {
    setCartItems(items);
    localStorage.setItem("genz-cart", JSON.stringify(items));
    window.dispatchEvent(new Event("cart-updated"));
  }

  function updateQty(id: string, delta: number) {
    const updated = cartItems.map((item) => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        return { ...item, quantity: Math.max(1, newQty) };
      }
      return item;
    });
    saveCart(updated);
  }

  function removeItem(id: string) {
    const updated = cartItems.filter((item) => item.id !== id);
    saveCart(updated);
  }

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shipping = cartItems.length > 0 ? 200 : 0;
  const total = subtotal + shipping;

  if (!isMounted) return null;

  if (cartItems.length === 0) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-[#E5E5E0] bg-white p-10 py-16 text-center shadow-xs">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#E5E5E0] bg-[#FAF7F0] text-[#D97706]">
          <ShoppingBag className="h-8 w-8" />
        </div>
        <h2 className="font-serif text-2xl font-normal text-[#1A1A18]">
          Your basket is empty
        </h2>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-[#73736E]">
          Looks like you haven&apos;t added any quality Indian crafts to your basket
          yet.
        </p>
        <Button
          asChild
          className="mt-6 h-11 rounded-xl bg-[#D97706] px-8 text-xs font-semibold tracking-wider text-white uppercase shadow-sm hover:bg-[#B45309]"
        >
          <Link href="/discover">Continue Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-3">
      {/* Cart Items List */}
      <div className="space-y-6 lg:col-span-2">
        <div className="flex flex-col justify-between gap-2 border-b border-[#E5E5E0] pb-3 sm:flex-row sm:items-center">
          <h2 className="font-serif text-xl font-normal text-[#1A1A18]">
            Your Basket ({cartItems.length} {cartItems.length === 1 ? "item" : "items"})
          </h2>
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-600" />
            Instant UPI QR Payment
          </span>
        </div>

        <div className="divide-y divide-[#E5E5E0] overflow-hidden rounded-2xl border border-[#E5E5E0] bg-white shadow-xs">
          {cartItems.map((item) => (
            <div
              key={item.id}
              className="flex flex-row items-start gap-3 p-3.5 transition-colors hover:bg-[#FAF8F4]/50 sm:gap-4 sm:p-5"
            >
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-[#E5E5E0] bg-[#FAF7F0] sm:h-20 sm:w-20">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={
                    item.image ||
                    "https://images.unsplash.com/photo-1515488042361-404e9250afef?w=400&q=80"
                  }
                  alt={item.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex min-w-0 flex-1 flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="text-sm leading-snug font-semibold text-[#1A1A18] sm:text-base">
                        {item.name}
                      </h4>
                      {item.sellerBusinessName && (
                        <p className="mt-0.5 text-xs text-[#73736E]">
                          Maker:{" "}
                          <strong className="text-[#52524E]">
                            {item.sellerBusinessName}
                          </strong>
                        </p>
                      )}
                      {item.variantName && item.variantValue && (
                        <span className="mt-1 inline-block rounded border border-[#E5E5E0] bg-[#FAF7F0] px-2 py-0.5 text-[11px] font-medium text-[#52524E]">
                          {item.variantName}: {item.variantValue}
                        </span>
                      )}
                    </div>
                    <span className="shrink-0 font-mono text-sm font-semibold text-[#D97706] sm:text-base">
                      ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex h-8 items-center overflow-hidden rounded-lg border border-[#E5E5E0] bg-white">
                    <button
                      type="button"
                      onClick={() => updateQty(item.id, -1)}
                      className="flex h-full items-center justify-center px-2.5 text-[#73736E] transition-colors hover:bg-[#FAF8F4] hover:text-[#1A1A18]"
                      title="Decrease quantity"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="px-3 font-mono text-xs font-semibold text-[#1A1A18]">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQty(item.id, 1)}
                      className="flex h-full items-center justify-center px-2.5 text-[#73736E] transition-colors hover:bg-[#FAF8F4] hover:text-[#1A1A18]"
                      title="Increase quantity"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="rounded-md p-1.5 text-[#73736E] transition-colors hover:bg-red-50 hover:text-red-600"
                    title="Remove item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Benefits banner */}
        <div className="grid grid-cols-1 gap-3 rounded-2xl border border-[#E5E5E0] bg-white p-4 text-xs text-[#52524E] shadow-xs sm:grid-cols-2">
          <div className="flex items-center gap-2">
            <Truck className="h-4 w-4 shrink-0 text-[#D97706]" />
            <span>
              <strong>Safe Indian Dispatch:</strong> Direct from verified makers.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>
              <strong>100% Verified Quality:</strong> Tested and certified products.
            </span>
          </div>
        </div>
      </div>

      {/* Cart Summary & Proceed to Checkout button */}
      <div className="sticky top-20 space-y-5 rounded-2xl border border-[#E5E5E0] bg-white p-6 shadow-xs lg:col-span-1">
        <h3 className="border-b border-[#E5E5E0] pb-3 font-serif text-lg font-normal text-[#1A1A18]">
          Basket Summary
        </h3>

        <dl className="space-y-2.5 text-sm">
          <div className="flex justify-between">
            <dt className="text-[#73736E]">Subtotal</dt>
            <dd className="font-mono font-medium text-[#1A1A18]">
              ₹{subtotal.toLocaleString("en-IN")}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-[#73736E]">Shipping Fee</dt>
            <dd className="font-mono font-medium text-[#1A1A18]">₹{shipping}</dd>
          </div>
          <p className="text-[11px] text-[#73736E] italic">
            * Flat pan-India artisan packaging &amp; courier fee (₹200).
          </p>
          <div className="flex justify-between border-t border-[#E5E5E0] pt-3 text-base font-semibold">
            <dt className="text-[#1A1A18]">Estimated Total</dt>
            <dd className="font-mono text-[#D97706]">
              ₹{total.toLocaleString("en-IN")}
            </dd>
          </div>
        </dl>

        <div className="space-y-3 border-t border-[#E5E5E0] pt-4">
          <Button
            type="button"
            onClick={() => router.push("/checkout")}
            className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#D97706] text-xs font-semibold tracking-wider text-white uppercase shadow-md transition-all hover:bg-[#B45309]"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="h-4 w-4" />
          </Button>

          <div className="flex items-center justify-center gap-2 pt-1 text-center text-xs text-[#73736E]">
            <CreditCard className="h-3.5 w-3.5 shrink-0 text-[#D97706]" />
            <span>Secure UPI QR Scan &amp; Pay at checkout</span>
          </div>

          <Link
            href="/discover"
            className="block pt-1 text-center text-xs text-[#73736E] underline underline-offset-2 hover:text-[#1A1A18]"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
