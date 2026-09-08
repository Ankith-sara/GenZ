"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@genz/ui";
import { Label } from "@genz/ui";
import { Input } from "@genz/ui";
import {
  CreditCard,
  MapPin,
  Truck,
  ShieldCheck,
  Check,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Package,
  ArrowLeft,
} from "lucide-react";

import Link from "next/link";
import { placeOrderAction } from "./actions";

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

interface Address {
  id: string;
  recipientName: string;
  phone: string;
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
}

interface CheckoutClientProps {
  userAddresses: Address[];
}

export function CheckoutClient({ userAddresses }: CheckoutClientProps) {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [isManualAddress, setIsManualAddress] = useState<boolean>(userAddresses.length === 0);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [showItemsReview, setShowItemsReview] = useState(false);

  // Address inputs
  const [recipientName, setRecipientName] = useState("");
  const [phone, setPhone] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [city, setCity] = useState("");
  const [stateVal, setStateVal] = useState("Karnataka");
  const [pincode, setPincode] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
    const stored = localStorage.getItem("genz-cart");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCartItems(parsed);
        } else {
          router.push("/cart");
        }
      } catch {
        router.push("/cart");
      }
    } else {
      router.push("/cart");
    }

    if (userAddresses.length > 0) {
      setSelectedAddressId(userAddresses[0].id);
      setIsManualAddress(false);
    } else {
      setIsManualAddress(true);
    }
  }, [userAddresses, router]);

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shipping = subtotal > 1500 || subtotal === 0 ? 0 : 80;
  const total = subtotal + shipping;

  async function handlePlaceOrder(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);
    if (cartItems.length === 0) {
      router.push("/cart");
      return;
    }

    let finalAddress: {
      recipientName: string;
      phone: string;
      addressLine: string;
      city: string;
      state: string;
      pincode: string;
    };

    if (isManualAddress || userAddresses.length === 0) {
      if (
        !recipientName.trim() ||
        !phone.trim() ||
        !addressLine.trim() ||
        !city.trim() ||
        !pincode.trim()
      ) {
        setErrorMessage("Please complete all shipping address fields before placing your order.");
        return;
      }
      finalAddress = {
        recipientName: recipientName.trim(),
        phone: phone.trim(),
        addressLine: addressLine.trim(),
        city: city.trim(),
        state: stateVal.trim() || "India",
        pincode: pincode.trim(),
      };
    } else {
      const selected = userAddresses.find((a) => a.id === selectedAddressId) || userAddresses[0];
      finalAddress = {
        recipientName: selected.recipientName,
        phone: selected.phone,
        addressLine: selected.addressLine,
        city: selected.city,
        state: selected.state,
        pincode: selected.pincode,
      };
    }

    setIsCheckingOut(true);

    try {
      const orderItems = cartItems.map((item) => ({
        id: item.id,
        productId: item.id.split("-")[0],
        product_id: item.id.split("-")[0],
        name: item.name,
        category: item.category,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        sellerId: item.sellerId || item.seller_id || "default-seller",
        sellerBusinessName: item.sellerBusinessName || "Maker Factory",
        variantName: item.variantName,
        variantValue: item.variantValue,
      }));

      const res = await placeOrderAction({
        customerName: finalAddress.recipientName,
        customerEmail: "customer@example.com",
        customerPhone: finalAddress.phone,
        shippingAddress: finalAddress,
        paymentMethod: "cod",
        items: orderItems,
        subtotal,
        tax: 0,
        shippingFee: shipping,
        totalAmount: total,
      });

      if (!res.success || !res.order) {
        throw new Error(res.error || "Failed to place order. Please try again.");
      }

      // Client-side cache for instant display
      const storedOrders = localStorage.getItem("genz-orders");
      let ordersList = [];
      if (storedOrders) {
        try {
          ordersList = JSON.parse(storedOrders);
        } catch {}
      }
      ordersList.unshift(res.order);
      localStorage.setItem("genz-orders", JSON.stringify(ordersList));

      // Clear cart
      localStorage.setItem("genz-cart", JSON.stringify([]));
      window.dispatchEvent(new Event("cart-updated"));

      setIsCheckingOut(false);
      router.push("/orders");
    } catch (err: unknown) {
      setIsCheckingOut(false);
      const msg = err instanceof Error ? err.message : "Error during order placement";
      setErrorMessage(msg);
    }
  }

  if (!isMounted) return null;

  return (
    <div className="space-y-8">
      {/* Checkout Progress Stepper */}
      <div className="flex items-center justify-between border-b border-[#E5E5E0] pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/cart"
            className="inline-flex items-center gap-1.5 text-xs text-[#73736E] hover:text-[#1A1A18] font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Basket</span>
          </Link>
          <span className="text-[#E5E5E0]">/</span>
          <span className="text-xs font-bold text-[#1A1A18] uppercase tracking-wider">
            Checkout Step 2 of 2
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="flex items-center gap-1 text-emerald-600 font-medium">
            <Check className="w-3.5 h-3.5" /> Basket
          </span>
          <span className="text-[#73736E]">→</span>
          <span className="font-bold text-[#D97706]">Delivery &amp; COD</span>
          <span className="text-[#73736E]">→</span>
          <span className="text-[#73736E]">Track Order</span>
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12">
        {/* Left Form: Delivery Address & Payment Method */}
        <div className="space-y-6 lg:col-span-7">
          <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-6">
            {errorMessage && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-2xl flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* 1. Delivery Address Card */}
            <div className="bg-white rounded-2xl border border-[#E5E5E0] p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#E5E5E0] pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-[#FAF7F0] border border-[#E5E5E0] text-[#D97706] flex items-center justify-center font-bold text-xs">
                    1
                  </div>
                  <h3 className="font-serif text-lg text-[#1A1A18]">Delivery Destination</h3>
                </div>

                {userAddresses.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setIsManualAddress((prev) => !prev)}
                    className="text-xs text-[#D97706] font-semibold hover:underline"
                  >
                    {isManualAddress ? "Use saved address" : "+ Enter new address"}
                  </button>
                )}
              </div>

              {userAddresses.length > 0 && !isManualAddress ? (
                <div className="relative">
                  <select
                    value={selectedAddressId}
                    onChange={(e) => setSelectedAddressId(e.target.value)}
                    className="border border-[#E5E5E0] bg-white text-[#1A1A18] h-11 w-full rounded-xl px-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#D97706]/30"
                    required
                  >
                    {userAddresses.map((addr) => (
                      <option key={addr.id} value={addr.id}>
                        {addr.recipientName} - {addr.city}, {addr.pincode}
                      </option>
                    ))}
                  </select>
                  <MapPin className="text-[#73736E] pointer-events-none absolute top-3.5 right-3 h-4 w-4" />
                </div>
              ) : (
                <div className="space-y-3.5 bg-[#FAF8F4]/50 p-4 rounded-xl border border-[#E5E5E0]">
                  <div>
                    <Label className="text-[11px] text-[#73736E] uppercase font-semibold">
                      Recipient Full Name *
                    </Label>
                    <Input
                      required
                      placeholder="e.g. Aarav Sharma"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      className="h-10 text-xs mt-1 bg-white rounded-xl"
                    />
                  </div>

                  <div>
                    <Label className="text-[11px] text-[#73736E] uppercase font-semibold">
                      Phone Number (Required for Cash on Delivery coordination) *
                    </Label>
                    <Input
                      required
                      placeholder="e.g. +91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="h-10 text-xs mt-1 bg-white rounded-xl"
                    />
                  </div>

                  <div>
                    <Label className="text-[11px] text-[#73736E] uppercase font-semibold">
                      Delivery Address / House / Street *
                    </Label>
                    <Input
                      required
                      placeholder="e.g. 104 Craft Lane, Indiranagar"
                      value={addressLine}
                      onChange={(e) => setAddressLine(e.target.value)}
                      className="h-10 text-xs mt-1 bg-white rounded-xl"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <Label className="text-[11px] text-[#73736E] uppercase font-semibold">
                        City *
                      </Label>
                      <Input
                        required
                        placeholder="Bengaluru"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="h-10 text-xs mt-1 bg-white rounded-xl"
                      />
                    </div>
                    <div>
                      <Label className="text-[11px] text-[#73736E] uppercase font-semibold">
                        State *
                      </Label>
                      <Input
                        placeholder="Karnataka"
                        value={stateVal}
                        onChange={(e) => setStateVal(e.target.value)}
                        className="h-10 text-xs mt-1 bg-white rounded-xl"
                      />
                    </div>
                    <div>
                      <Label className="text-[11px] text-[#73736E] uppercase font-semibold">
                        Pincode *
                      </Label>
                      <Input
                        required
                        placeholder="560038"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        className="h-10 text-xs mt-1 bg-white rounded-xl"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 2. Payment Method Card */}
            <div className="bg-white rounded-2xl border border-[#E5E5E0] p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 border-b border-[#E5E5E0] pb-3">
                <div className="w-7 h-7 rounded-full bg-[#FAF7F0] border border-[#E5E5E0] text-[#D97706] flex items-center justify-center font-bold text-xs">
                  2
                </div>
                <h3 className="font-serif text-lg text-[#1A1A18]">Payment Method</h3>
              </div>

              {/* Cash on Delivery option */}
              <div className="p-4 rounded-xl border border-[#D97706] bg-[#FAF8F4] ring-2 ring-[#D97706]/20">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full border border-[#D97706] bg-[#D97706] text-white flex items-center justify-center">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-sm text-[#1A1A18]">
                          Cash on Delivery (COD)
                        </h4>
                        <span className="bg-[#FEF3C7] text-[#92400E] text-[10px] font-bold px-2 py-0.5 rounded-full">
                          Standard Delivery
                        </span>
                      </div>
                      <p className="text-xs text-[#73736E] mt-1">
                        Pay in cash to the delivery courier when your order arrives.
                      </p>
                    </div>
                  </div>
                  <CreditCard className="w-5 h-5 text-[#D97706]" />
                </div>
              </div>
            </div>

            {/* 3. Items Review Collapsible */}
            <div className="bg-white rounded-2xl border border-[#E5E5E0] overflow-hidden shadow-xs">
              <button
                type="button"
                onClick={() => setShowItemsReview((prev) => !prev)}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-[#FAF8F4]/50 transition-colors"
              >
                <div className="flex items-center gap-2 text-xs font-semibold text-[#1A1A18]">
                  <Package className="w-4 h-4 text-[#D97706]" />
                  <span>Review Items in this Order ({cartItems.length})</span>
                </div>
                {showItemsReview ? (
                  <ChevronUp className="w-4 h-4 text-[#73736E]" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[#73736E]" />
                )}
              </button>

              {showItemsReview && (
                <div className="p-4 border-t border-[#E5E5E0] divide-y divide-[#E5E5E0] bg-[#FAF8F4]/30">
                  {cartItems.map((item) => (
                    <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        {item.image && (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-10 h-10 object-cover rounded-lg border border-[#E5E5E0]"
                          />
                        )}
                        <div>
                          <p className="font-semibold text-[#1A1A18]">{item.name}</p>
                          {item.sellerBusinessName && (
                            <p className="text-[10px] text-[#73736E]">
                              Maker: {item.sellerBusinessName}
                            </p>
                          )}
                          {item.variantName && (
                            <p className="text-[10px] text-[#73736E]">
                              {item.variantName}: {item.variantValue}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-[#1A1A18] block">
                          ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                        </span>
                        <span className="text-[10px] text-[#73736E]">Qty: {item.quantity}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Right Column: Order Summary & Place Order CTA */}
        <div className="space-y-6 lg:col-span-5">
          <div className="bg-white rounded-2xl border border-[#E5E5E0] p-6 shadow-xs sticky top-20 space-y-5">
            <h3 className="font-serif text-[#1A1A18] border-b border-[#E5E5E0] pb-3 text-lg font-normal">
              Payment Summary
            </h3>

            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-[#73736E]">Subtotal ({cartItems.length} items)</dt>
                <dd className="text-[#1A1A18] font-mono font-medium">
                  ₹{subtotal.toLocaleString("en-IN")}
                </dd>
              </div>


              <div className="flex justify-between">
                <dt className="text-[#73736E]">Shipping Fee</dt>
                <dd className="text-[#1A1A18] font-mono font-medium">
                  {shipping === 0 ? (
                    <span className="text-emerald-600 font-semibold uppercase text-xs">FREE</span>
                  ) : (
                    `₹${shipping}`
                  )}
                </dd>
              </div>

              <div className="border-t border-[#E5E5E0] pt-3 flex justify-between items-baseline">
                <div>
                  <dt className="text-base font-bold text-[#1A1A18]">Total Due</dt>
                  <span className="text-[11px] text-[#73736E] block">
                    Cash on Delivery (Pay upon arrival)
                  </span>
                </div>
                <dd className="text-[#D97706] font-mono text-xl font-bold">
                  ₹{total.toLocaleString("en-IN")}
                </dd>
              </div>
            </dl>

            <Button
              form="checkout-form"
              type="submit"
              disabled={isCheckingOut}
              className="bg-[#D97706] hover:bg-[#B45309] text-white font-semibold h-13 w-full rounded-xl text-xs tracking-wider uppercase shadow-md transition-all mt-2"
            >
              {isCheckingOut ? "Confirming Order..." : "Confirm & Place Cash on Delivery Order"}
            </Button>

            {/* Trust highlights */}
            <div className="border-t border-[#E5E5E0] pt-4 space-y-2.5 text-xs text-[#52524E]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>Safe Cash on Delivery:</strong> No card needed upfront.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#D97706] shrink-0" />
                <span>
                  <strong>Real-Time Tracking:</strong> Follow status from maker to doorstep.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
