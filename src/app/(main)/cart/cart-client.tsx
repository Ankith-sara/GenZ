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
    // Trigger custom header event to update header badge
    window.dispatchEvent(new Event("cart-updated"));
  }

  function updateQty(id: string, delta: number) {
    const updated = cartItems
      .map((item) => {
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

    const selectedAddr = userAddresses.find((a) => a.id === selectedAddressId) || userAddresses[0];

    // Create order object
    const order = {
      // eslint-disable-next-line react-hooks/purity
      orderId: `GZ-${Math.floor(100000 + Math.random() * 900000)}`,
      date: new Date().toISOString(),
      items: cartItems,
      subtotal,
      tax,
      shipping,
      total,
      status: "processing", // processing -> packed -> shipped -> delivered
      shippingAddress: selectedAddr,
      paymentMethod: paymentMethod === "cod" ? "Cash on Delivery" : "UPI/Card Online",
    };

    // Save to orders list in localStorage
    const storedOrders = localStorage.getItem("genz-orders");
    let ordersList = [];
    if (storedOrders) {
      try {
        ordersList = JSON.parse(storedOrders);
      } catch {}
    }
    ordersList.unshift(order);
    localStorage.setItem("genz-orders", JSON.stringify(ordersList));

    // Clear cart
    saveCart([]);
    setIsCheckingOut(false);

    // Redirect to orders
    router.push("/orders");
  }

  if (!isMounted) return null;

  if (cartItems.length === 0) {
    return (
      <div className="text-center py-16 animate-fade-in">
        <div className="mx-auto w-16 h-16 bg-forest-green/5 text-forest-green flex items-center justify-center rounded-full mb-4">
          <ShoppingBag className="h-8 w-8" />
        </div>
        <h2 className="font-serif text-2xl text-forest-green font-normal">Your cart is empty</h2>
        <p className="text-sm text-smoke mt-2 max-w-sm mx-auto leading-relaxed">
          Looks like you haven&apos;t added any quality Indian toys or crafts to your basket yet.
        </p>
        <Button asChild className="mt-8 bg-forest-green text-white hover:bg-forest-green/90 rounded-[4px] font-medium uppercase tracking-wider h-11 px-8">
          <Link href="/discover">Continue Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
      {/* Cart Items List */}
      <div className="lg:col-span-2 space-y-6">
        <h2 className="font-serif text-xl text-forest-green font-normal mb-4 border-b pb-2">Your Items ({cartItems.length})</h2>

        <div className="divide-y border border-black/5 bg-paper-white rounded-[4px] overflow-hidden">
          {cartItems.map((item) => (
            <div key={item.id} className="flex flex-col sm:flex-row gap-4 p-5 hover:bg-gray-50/50 transition-colors">
              <div className="w-20 h-20 rounded-[4px] overflow-hidden bg-gray-100 shrink-0 border relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h4 className="font-semibold text-neutral-800 text-sm sm:text-base leading-snug">{item.name}</h4>
                      <span className="text-[10px] text-smoke uppercase font-semibold block mt-0.5">{item.category}</span>
                    </div>
                    <span className="font-mono text-sm sm:text-base font-semibold text-forest-green shrink-0">₹{item.price * item.quantity}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-4">
                  <div className="flex items-center border rounded-[4px] h-9 bg-white">
                    <button
                      onClick={() => updateQty(item.id, -1)}
                      className="px-2.5 h-full text-smoke hover:text-forest-green hover:bg-black/5 flex items-center justify-center transition-colors"
                      title="Decrease quantity"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="px-3 text-sm font-semibold text-neutral-800 font-mono">{item.quantity}</span>
                    <button
                      onClick={() => updateQty(item.id, 1)}
                      className="px-2.5 h-full text-smoke hover:text-forest-green hover:bg-black/5 flex items-center justify-center transition-colors"
                      title="Increase quantity"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-smoke hover:text-red-600 p-2 hover:bg-red-50 rounded transition-colors"
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
      <div className="lg:col-span-1 border border-black/5 bg-paper-white rounded-[4px] p-6 space-y-6">
        <h3 className="font-serif text-lg text-forest-green font-normal border-b pb-2">Order Summary</h3>

        <dl className="space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-smoke">Subtotal</dt>
            <dd className="font-mono font-medium text-neutral-800">₹{subtotal.toLocaleString()}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-smoke">GST (18%)</dt>
            <dd className="font-mono font-medium text-neutral-800">₹{tax.toLocaleString()}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-smoke">Shipping</dt>
            <dd className="font-mono font-medium text-neutral-800">{shipping === 0 ? "FREE" : `₹${shipping}`}</dd>
          </div>
          {shipping > 0 && (
            <p className="text-[10px] text-smoke leading-relaxed italic">
              * Add ₹{(1500 - subtotal)} more for free delivery.
            </p>
          )}
          <div className="border-t pt-3 flex justify-between font-semibold text-base">
            <dt className="text-forest-green">Total Amount</dt>
            <dd className="font-mono text-forest-green">₹{total.toLocaleString()}</dd>
          </div>
        </dl>

        <form onSubmit={handleCheckout} className="space-y-4 pt-4 border-t">
          {/* Shipping Address Selection */}
          <div>
            <Label htmlFor="address-select" className="text-xs font-bold text-smoke uppercase mb-1.5 block">
              Deliver To
            </Label>
            {userAddresses.length === 0 ? (
              <div className="p-3 border rounded border-dashed bg-amber-50 border-amber-200 text-xs text-amber-800">
                No addresses found.{" "}
                <Link href="/profile" className="underline font-semibold text-forest-green">
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
                  className="w-full h-11 border border-black/10 rounded-[4px] px-3 bg-white text-xs text-neutral-700 focus:outline-none focus:border-forest-green"
                  required
                >
                  {userAddresses.map((addr) => (
                    <option key={addr.id} value={addr.id}>
                      {addr.recipientName} - {addr.city}, {addr.pincode}
                    </option>
                  ))}
                </select>
                <MapPin className="absolute right-3 top-3.5 h-4 w-4 text-smoke pointer-events-none" />
              </div>
            )}
          </div>

          {/* Payment Method Selector */}
          <div>
            <Label className="text-xs font-bold text-smoke uppercase mb-1.5 block">
              Payment Method
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod("cod")}
                className={`flex h-11 items-center justify-center gap-1.5 rounded-[4px] border text-xs font-semibold uppercase tracking-wider transition-colors ${
                  paymentMethod === "cod"
                    ? "border-forest-green bg-forest-green text-white"
                    : "border-black/10 bg-white text-smoke hover:border-forest-green"
                }`}
              >
                <CreditCard className="h-4 w-4" /> Cash on Delivery
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod("online")}
                className={`flex h-11 items-center justify-center gap-1.5 rounded-[4px] border text-xs font-semibold uppercase tracking-wider transition-colors ${
                  paymentMethod === "online"
                    ? "border-forest-green bg-forest-green text-white"
                    : "border-black/10 bg-white text-smoke hover:border-forest-green"
                }`}
              >
                <CreditCard className="h-4 w-4" /> UPI / Cards
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-forest-green text-white hover:bg-forest-green/90 rounded-[4px] font-semibold uppercase tracking-wider h-11 mt-4"
            disabled={isCheckingOut || userAddresses.length === 0}
          >
            {isCheckingOut ? "Processing..." : "Place Order"}
          </Button>
        </form>
      </div>
    </div>
  );
}
