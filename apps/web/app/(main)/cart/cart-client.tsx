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
  const shipping = subtotal > 1500 || subtotal === 0 ? 0 : 80;
  const total = subtotal + shipping;

  if (!isMounted) return null;

  if (cartItems.length === 0) {
    return (
      <div className="py-16 text-center bg-white rounded-2xl border border-[#E5E5E0] p-10 shadow-xs max-w-xl mx-auto">
        <div className="bg-[#FAF7F0] text-[#D97706] border border-[#E5E5E0] mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl">
          <ShoppingBag className="h-8 w-8" />
        </div>
        <h2 className="font-serif text-[#1A1A18] text-2xl font-normal">
          Your basket is empty
        </h2>
        <p className="text-sm text-[#73736E] mx-auto mt-2 max-w-sm leading-relaxed">
          Looks like you haven&apos;t added any quality Indian crafts to your basket yet.
        </p>
        <Button
          asChild
          className="bg-[#D97706] hover:bg-[#B45309] mt-6 h-11 rounded-xl px-8 text-xs font-semibold tracking-wider text-white uppercase shadow-sm"
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
        <div className="flex items-center justify-between border-b border-[#E5E5E0] pb-3">
          <h2 className="font-serif text-[#1A1A18] text-xl font-normal">
            Your Basket ({cartItems.length} {cartItems.length === 1 ? "item" : "items"})
          </h2>
          <span className="text-xs font-semibold text-[#D97706] bg-[#FEF3C7] px-2.5 py-1 rounded-full">
            Cash on Delivery Available
          </span>
        </div>

        <div className="border border-[#E5E5E0] bg-white divide-y divide-[#E5E5E0] rounded-2xl overflow-hidden shadow-xs">
          {cartItems.map((item) => (
            <div
              key={item.id}
              className="hover:bg-[#FAF8F4]/50 flex flex-col gap-4 p-5 transition-colors sm:flex-row"
            >
              <div className="bg-[#FAF7F0] border border-[#E5E5E0] relative h-20 w-20 shrink-0 overflow-hidden rounded-xl">
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
              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="text-sm font-semibold text-[#1A1A18] leading-snug sm:text-base">
                        {item.name}
                      </h4>
                      {item.sellerBusinessName && (
                        <p className="text-xs text-[#73736E] mt-0.5">
                          Maker: <strong className="text-[#52524E]">{item.sellerBusinessName}</strong>
                        </p>
                      )}
                      {item.variantName && item.variantValue && (
                        <span className="inline-block mt-1 text-[11px] font-medium bg-[#FAF7F0] text-[#52524E] px-2 py-0.5 rounded border border-[#E5E5E0]">
                          {item.variantName}: {item.variantValue}
                        </span>
                      )}
                    </div>
                    <span className="text-[#D97706] shrink-0 font-mono text-sm font-semibold sm:text-base">
                      ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="border border-[#E5E5E0] bg-white flex h-8 items-center rounded-lg overflow-hidden">
                    <button
                      type="button"
                      onClick={() => updateQty(item.id, -1)}
                      className="text-[#73736E] hover:text-[#1A1A18] hover:bg-[#FAF8F4] flex h-full items-center justify-center px-2.5 transition-colors"
                      title="Decrease quantity"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="text-[#1A1A18] px-3 font-mono text-xs font-semibold">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQty(item.id, 1)}
                      className="text-[#73736E] hover:text-[#1A1A18] hover:bg-[#FAF8F4] flex h-full items-center justify-center px-2.5 transition-colors"
                      title="Increase quantity"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="text-[#73736E] p-1.5 transition-colors hover:bg-red-50 hover:text-red-600 rounded-md"
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
        <div className="bg-white rounded-2xl p-4 border border-[#E5E5E0] grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[#52524E] shadow-xs">
          <div className="flex items-center gap-2">
            <Truck className="h-4 w-4 text-[#D97706] shrink-0" />
            <span>
              <strong>Safe Indian Dispatch:</strong> Direct from verified makers.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>
              <strong>100% Verified Quality:</strong> Tested and certified products.
            </span>
          </div>
        </div>
      </div>

      {/* Cart Summary & Proceed to Checkout button */}
      <div className="border border-[#E5E5E0] bg-white space-y-5 rounded-2xl p-6 lg:col-span-1 shadow-xs sticky top-20">
        <h3 className="font-serif text-[#1A1A18] border-b border-[#E5E5E0] pb-3 text-lg font-normal">
          Basket Summary
        </h3>

        <dl className="space-y-2.5 text-sm">
          <div className="flex justify-between">
            <dt className="text-[#73736E]">Subtotal</dt>
            <dd className="text-[#1A1A18] font-mono font-medium">
              ₹{subtotal.toLocaleString("en-IN")}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-[#73736E]">Shipping</dt>
            <dd className="text-[#1A1A18] font-mono font-medium">
              {shipping === 0 ? (
                <span className="text-emerald-600 font-semibold uppercase text-xs">FREE</span>
              ) : (
                `₹${shipping}`
              )}
            </dd>
          </div>
          {shipping > 0 && (
            <p className="text-[11px] text-[#73736E] italic">
              * Add ₹{1500 - subtotal} more for free delivery.
            </p>
          )}
          <div className="border-t border-[#E5E5E0] flex justify-between pt-3 text-base font-semibold">
            <dt className="text-[#1A1A18]">Estimated Total</dt>
            <dd className="text-[#D97706] font-mono">₹{total.toLocaleString("en-IN")}</dd>
          </div>
        </dl>

        <div className="border-t border-[#E5E5E0] pt-4 space-y-3">
          <Button
            type="button"
            onClick={() => router.push("/checkout")}
            className="bg-[#D97706] hover:bg-[#B45309] text-white font-semibold h-12 w-full rounded-xl text-xs tracking-wider uppercase shadow-md transition-all flex items-center justify-center gap-2"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </Button>

          <div className="flex items-center justify-center gap-2 text-xs text-[#73736E] pt-1">
            <CreditCard className="w-3.5 h-3.5 text-[#D97706]" />
            <span>Cash on Delivery (COD) available at checkout</span>
          </div>

          <Link
            href="/discover"
            className="block text-center text-xs text-[#73736E] hover:text-[#1A1A18] underline underline-offset-2 pt-1"
          >
            ← Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
