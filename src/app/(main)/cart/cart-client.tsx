"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Trash2, Plus, Minus, ShoppingBag, MapPin, CreditCard } from "lucide-react";
import Link from "next/link";

interface CartItem {
  id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  image: string;
}

interface Address {
  id: string;
  recipientName: string;
  phone: string;
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
}

interface CartClientProps {
  userAddresses: Address[];
}

const DEFAULT_CART_ITEMS: CartItem[] = [
  {
    id: "prod-1",
    name: "Handcrafted Channapatna Wooden Stacker",
    category: "Wooden Toys",
    price: 899,
    quantity: 1,
    image: "https://images.unsplash.com/photo-1515488042361-404e9250afef?w=400&q=80",
  },
  {
    id: "prod-2",
    name: "DIY Organic Paint & Clay Pottery Kit",
    category: "Crafts & Kits",
    price: 450,
    quantity: 2,
    image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&q=80",
  },
];

export function CartClient({ userAddresses }: CartClientProps) {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Initialize Cart from localStorage or default
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
    const stored = localStorage.getItem("genz-cart");
    if (stored) {
      try {
        setCartItems(JSON.parse(stored));
      } catch {
        setCartItems(DEFAULT_CART_ITEMS);
      }
    } else {
      setCartItems(DEFAULT_CART_ITEMS);
      localStorage.setItem("genz-cart", JSON.stringify(DEFAULT_CART_ITEMS));
    }

    if (userAddresses.length > 0) {
      setSelectedAddressId(userAddresses[0].id);
    }
  }, [userAddresses]);

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
  const tax = Math.round(subtotal * 0.18); // 18% GST
  const shipping = subtotal > 1500 || subtotal === 0 ? 0 : 80;
  const total = subtotal + tax + shipping;

  async function handleCheckout(e: React.FormEvent) {
    e.preventDefault();
    if (cartItems.length === 0) return;

    if (userAddresses.length === 0) {
      alert("Please add a shipping address in your Profile before checking out.");
      router.push("/profile");
      return;
    }

    setIsCheckingOut(true);

    const selectedAddr =
      userAddresses.find((a) => a.id === selectedAddressId) || userAddresses[0];

    const order = {
      // eslint-disable-next-line react-hooks/purity
      orderId: `GZ-${Math.floor(100000 + Math.random() * 900000)}`,
      date: new Date().toISOString(),
      items: cartItems,
      subtotal,
      tax,
      shipping,
      total,
      status: "processing",
      shippingAddress: selectedAddr,
      paymentMethod: paymentMethod === "cod" ? "Cash on Delivery" : "UPI/Card Online",
    };

    const storedOrders = localStorage.getItem("genz-orders");
    let ordersList = [];
    if (storedOrders) {
      try {
        ordersList = JSON.parse(storedOrders);
      } catch {}
    }
    ordersList.unshift(order);
    localStorage.setItem("genz-orders", JSON.stringify(ordersList));

    saveCart([]);
    setIsCheckingOut(false);
    router.push("/orders");
  }

  if (!isMounted) return null;

  if (cartItems.length === 0) {
    return (
      <div className="py-16 text-center">
        <div className="bg-cream-paper text-brand-yellow border-ash mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-none border">
          <ShoppingBag className="h-8 w-8" />
        </div>
        <h2 className="font-nantes text-ink-black text-2xl font-normal">
          Your cart is empty
        </h2>
        <p className="text-caption font-graphik text-charcoal mx-auto mt-2 max-w-sm leading-relaxed">
          Looks like you haven&apos;t added any quality Indian toys or crafts to your
          basket yet.
        </p>
        <Button
          asChild
          className="bg-brand-yellow hover:bg-brand-yellow-hover font-graphik mt-8 h-11 rounded-none border-none px-8 text-xs font-normal tracking-[0.05em] text-white uppercase"
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
        <h2 className="font-nantes text-ink-black border-ash mb-4 border-b pb-3 text-xl font-normal">
          Your Items ({cartItems.length})
        </h2>

        <div className="divide-ash border-ash bg-pure-white divide-y overflow-hidden rounded-none border">
          {cartItems.map((item) => (
            <div
              key={item.id}
              className="hover:bg-cream-paper/40 flex flex-col gap-4 p-5 transition-colors sm:flex-row"
            >
              <div className="bg-cream-paper border-ash relative h-20 w-20 shrink-0 overflow-hidden rounded-none border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="font-graphik text-ink-black text-sm leading-snug font-semibold sm:text-base">
                        {item.name}
                      </h4>
                      <span className="text-smoke font-graphik mt-1 block text-[10px] font-medium uppercase">
                        {item.category}
                      </span>
                    </div>
                    <span className="text-brand-yellow shrink-0 font-mono text-sm font-semibold sm:text-base">
                      ₹{item.price * item.quantity}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="border-ash bg-pure-white flex h-9 items-center rounded-none border">
                    <button
                      onClick={() => updateQty(item.id, -1)}
                      className="text-smoke hover:text-ink-black hover:bg-cream-paper flex h-full items-center justify-center px-2.5 transition-colors focus:outline-none"
                      title="Decrease quantity"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="text-ink-black px-3 font-mono text-sm font-semibold">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQty(item.id, 1)}
                      className="text-smoke hover:text-ink-black hover:bg-cream-paper flex h-full items-center justify-center px-2.5 transition-colors focus:outline-none"
                      title="Increase quantity"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-smoke p-2 transition-colors hover:bg-red-50 hover:text-red-600 focus:outline-none"
                    title="Remove item"
                  >
                    <Trash2 className="h-4.5 w-4.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Checkout Summary panel */}
      <div className="border-ash bg-pure-white space-y-6 rounded-none border p-6 lg:col-span-1">
        <h3 className="font-nantes text-ink-black border-ash border-b pb-3 text-lg font-normal">
          Order Summary
        </h3>

        <dl className="font-graphik space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-charcoal">Subtotal</dt>
            <dd className="text-ink-black font-mono font-medium">
              ₹{subtotal.toLocaleString()}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-charcoal">GST (18%)</dt>
            <dd className="text-ink-black font-mono font-medium">
              ₹{tax.toLocaleString()}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-charcoal">Shipping</dt>
            <dd className="text-ink-black font-mono font-medium">
              {shipping === 0 ? "FREE" : `₹${shipping}`}
            </dd>
          </div>
          {shipping > 0 && (
            <p className="text-smoke text-[10px] leading-relaxed italic">
              * Add ₹{1500 - subtotal} more for free delivery.
            </p>
          )}
          <div className="border-ash flex justify-between border-t pt-3 text-base font-semibold">
            <dt className="text-brand-yellow font-graphik">Total Amount</dt>
            <dd className="text-brand-yellow font-mono">₹{total.toLocaleString()}</dd>
          </div>
        </dl>

        <form onSubmit={handleCheckout} className="border-ash space-y-4 border-t pt-4">
          {/* Shipping Address Selection */}
          <div>
            <Label
              htmlFor="address-select"
              className="text-smoke font-graphik mb-1.5 block text-[10px] font-medium tracking-wider uppercase"
            >
              Deliver To
            </Label>
            {userAddresses.length === 0 ? (
              <div className="bg-cream-paper border-ash text-charcoal rounded-none border border-dashed p-3 text-xs">
                No addresses found.{" "}
                <Link
                  href="/profile"
                  className="text-brand-yellow font-semibold underline"
                >
                  Add address in profile
                </Link>{" "}
                first.
              </div>
            ) : (
              <div className="relative">
                <select
                  id="address-select"
                  value={selectedAddressId}
                  onChange={(e) => setSelectedAddressId(e.target.value)}
                  className="border-ash bg-pure-white text-ink-black focus:border-ink-black font-graphik h-11 w-full rounded-none border px-3 text-xs focus:outline-none"
                  required
                >
                  {userAddresses.map((addr) => (
                    <option key={addr.id} value={addr.id}>
                      {addr.recipientName} - {addr.city}, {addr.pincode}
                    </option>
                  ))}
                </select>
                <MapPin className="text-smoke pointer-events-none absolute top-3.5 right-3 h-4 w-4" />
              </div>
            )}
          </div>

          {/* Payment Method Selector */}
          <div>
            <Label className="text-smoke font-graphik mb-1.5 block text-[10px] font-medium tracking-wider uppercase">
              Payment Method
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod("cod")}
                className={`font-graphik flex h-11 items-center justify-center gap-1.5 rounded-none border text-xs font-semibold tracking-wider uppercase transition-colors focus:outline-none ${
                  paymentMethod === "cod"
                    ? "border-brand-yellow bg-brand-yellow text-white"
                    : "border-ash bg-pure-white text-charcoal hover:border-ink-black"
                }`}
              >
                <CreditCard className="h-4 w-4" /> Cash on Delivery
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod("online")}
                className={`font-graphik flex h-11 items-center justify-center gap-1.5 rounded-none border text-xs font-semibold tracking-wider uppercase transition-colors focus:outline-none ${
                  paymentMethod === "online"
                    ? "border-brand-yellow bg-brand-yellow text-white"
                    : "border-ash bg-pure-white text-charcoal hover:border-ink-black"
                }`}
              >
                <CreditCard className="h-4 w-4" /> UPI / Cards
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="bg-brand-yellow hover:bg-brand-yellow-hover font-graphik mt-4 h-12 w-full rounded-none border-none text-xs font-normal tracking-[0.05em] text-white uppercase"
            disabled={isCheckingOut || userAddresses.length === 0}
          >
            {isCheckingOut ? "Processing..." : "Place Order"}
          </Button>
        </form>
      </div>
    </div>
  );
}
