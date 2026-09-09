"use client";

import { useState, useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@genz/ui";
import { Label } from "@genz/ui";
import { Input } from "@genz/ui";
import {
  MapPin,
  Truck,
  ShieldCheck,
  Check,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Package,
  ArrowLeft,
  Copy,
  QrCode,
  CheckCircle2,
  Smartphone,
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

const emptySubscribe = () => () => {};

export function CheckoutClient({ userAddresses }: CheckoutClientProps) {
  const router = useRouter();
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [isManualAddress, setIsManualAddress] = useState<boolean>(
    userAddresses.length === 0
  );
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [showItemsReview, setShowItemsReview] = useState(false);

  // Address inputs
  const [recipientName, setRecipientName] = useState("");
  const [phone, setPhone] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [city, setCity] = useState("");
  const [stateVal, setStateVal] = useState("Karnataka");
  const [pincode, setPincode] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Payment inputs
  const [utrNumber, setUtrNumber] = useState("");
  const [payerAccount, setPayerAccount] = useState("");
  const [copiedUpi, setCopiedUpi] = useState(false);

  const upiIdDisplay = "7794893768@ibl";

  useEffect(() => {
    const timer = setTimeout(() => {
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
    }, 0);

    return () => clearTimeout(timer);
  }, [userAddresses, router]);

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shipping = cartItems.length > 0 ? 200 : 0;
  const total = subtotal + shipping;

  function copyUpiId() {
    navigator.clipboard.writeText(upiIdDisplay);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2500);
  }

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
        setErrorMessage("Please complete all required delivery address fields.");
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
      const selected =
        userAddresses.find((a) => a.id === selectedAddressId) || userAddresses[0];
      finalAddress = {
        recipientName: selected.recipientName,
        phone: selected.phone,
        addressLine: selected.addressLine,
        city: selected.city,
        state: selected.state,
        pincode: selected.pincode,
      };
    }

    const cleanUtr = utrNumber.trim();
    if (!cleanUtr) {
      setErrorMessage(
        "Please enter the 12-digit UPI Reference / UTR Number from your PhonePe/UPI payment receipt to confirm the order."
      );
      return;
    }

    if (cleanUtr.length < 8) {
      setErrorMessage(
        "Please enter a valid UPI Reference / UTR Number (typically 12 digits, e.g., 425689123456)."
      );
      return;
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
        paymentMethod: "upi_qr",
        notes: `PhonePe UPI QR | UTR: ${cleanUtr}${payerAccount.trim() ? ` | Payer: ${payerAccount.trim()}` : ""}`,
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
    <div className="space-y-6 sm:space-y-8">
      {/* Checkout Progress Stepper */}
      <div className="flex flex-col justify-between gap-3 border-b border-[#E5E5E0] pb-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <Link
            href="/cart"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#73736E] hover:text-[#1A1A18]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Basket</span>
          </Link>
          <span className="text-[#E5E5E0]">/</span>
          <span className="text-xs font-bold tracking-wider text-[#1A1A18] uppercase">
            Checkout Step 2 of 2
          </span>
        </div>

        <div className="flex items-center gap-2 text-[11px] sm:text-xs">
          <span className="flex items-center gap-1 font-medium text-emerald-600">
            <Check className="h-3.5 w-3.5" /> Basket
          </span>
          <span className="text-[#73736E]">→</span>
          <span className="font-bold text-[#D97706]">Delivery &amp; UPI QR</span>
          <span className="text-[#73736E]">→</span>
          <span className="text-[#73736E]">Track Order</span>
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
        {/* Left Form: Delivery Address & Payment Method */}
        <div className="space-y-6 lg:col-span-7">
          <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-6">
            {errorMessage && (
              <div className="flex items-center gap-2.5 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* 1. Delivery Address Card */}
            <div className="space-y-4 rounded-2xl border border-[#E5E5E0] bg-white p-4 shadow-xs sm:p-6">
              <div className="flex items-center justify-between border-b border-[#E5E5E0] pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full border border-[#E5E5E0] bg-[#FAF7F0] text-xs font-bold text-[#D97706]">
                    1
                  </div>
                  <h3 className="font-serif text-lg text-[#1A1A18]">
                    Delivery Destination
                  </h3>
                </div>

                {userAddresses.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setIsManualAddress((prev) => !prev)}
                    className="cursor-pointer text-xs font-semibold text-[#D97706] hover:underline"
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
                    className="h-11 w-full rounded-xl border border-[#E5E5E0] bg-white px-3 text-xs text-[#1A1A18] focus:ring-2 focus:ring-[#D97706]/30 focus:outline-none"
                    required
                  >
                    {userAddresses.map((addr) => (
                      <option key={addr.id} value={addr.id}>
                        {addr.recipientName} - {addr.city}, {addr.pincode}
                      </option>
                    ))}
                  </select>
                  <MapPin className="pointer-events-none absolute top-3.5 right-3 h-4 w-4 text-[#73736E]" />
                </div>
              ) : (
                <div className="space-y-3.5 rounded-xl border border-[#E5E5E0] bg-[#FAF8F4]/50 p-4">
                  <div>
                    <Label className="text-[11px] font-semibold text-[#73736E] uppercase">
                      Recipient Full Name *
                    </Label>
                    <Input
                      required
                      placeholder="e.g. Aarav Sharma"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      className="mt-1 h-10 rounded-xl bg-white text-xs"
                    />
                  </div>

                  <div>
                    <Label className="text-[11px] font-semibold text-[#73736E] uppercase">
                      Phone Number (Required for shipment tracking) *
                    </Label>
                    <Input
                      required
                      placeholder="e.g. +91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="mt-1 h-10 rounded-xl bg-white text-xs"
                    />
                  </div>

                  <div>
                    <Label className="text-[11px] font-semibold text-[#73736E] uppercase">
                      Delivery Address / House / Street *
                    </Label>
                    <Input
                      required
                      placeholder="e.g. 104 Craft Lane, Indiranagar"
                      value={addressLine}
                      onChange={(e) => setAddressLine(e.target.value)}
                      className="mt-1 h-10 rounded-xl bg-white text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                    <div>
                      <Label className="text-[11px] font-semibold text-[#73736E] uppercase">
                        City *
                      </Label>
                      <Input
                        required
                        placeholder="Bengaluru"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="mt-1 h-10 rounded-xl bg-white text-xs"
                      />
                    </div>
                    <div>
                      <Label className="text-[11px] font-semibold text-[#73736E] uppercase">
                        State *
                      </Label>
                      <Input
                        placeholder="Karnataka"
                        value={stateVal}
                        onChange={(e) => setStateVal(e.target.value)}
                        className="mt-1 h-10 rounded-xl bg-white text-xs"
                      />
                    </div>
                    <div>
                      <Label className="text-[11px] font-semibold text-[#73736E] uppercase">
                        Pincode *
                      </Label>
                      <Input
                        required
                        placeholder="560038"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        className="mt-1 h-10 rounded-xl bg-white text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 2. Official PhonePe UPI QR Code Payment Card */}
            <div className="space-y-5 rounded-2xl border border-[#E5E5E0] bg-white p-4 shadow-xs sm:p-6">
              <div className="flex items-center justify-between border-b border-[#E5E5E0] pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full border border-[#E5E5E0] bg-[#FAF7F0] text-xs font-bold text-[#D97706]">
                    2
                  </div>
                  <div>
                    <h3 className="font-serif text-lg text-[#1A1A18]">
                      UPI QR Code Payment
                    </h3>
                    <p className="text-[11px] text-[#73736E]">
                      PhonePe / Google Pay / Paytm / BHIM UPI
                    </p>
                  </div>
                </div>

                <span className="flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-800">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Instant Verification
                </span>
              </div>

              {/* QR Code Presentation Box */}
              <div className="rounded-2xl border border-neutral-200 bg-[#0A0A0A] p-4 text-white shadow-md sm:p-6">
                <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
                  {/* QR Image Container */}
                  <div className="flex flex-col items-center">
                    <div className="relative h-64 w-52 overflow-hidden rounded-2xl border-2 border-neutral-700 bg-black p-1 shadow-xl sm:h-72 sm:w-60">
                      <Image
                        src="/payment_qr.png"
                        alt="PhonePe UPI QR Code"
                        fill
                        className="object-contain"
                        priority
                      />
                    </div>
                    <span className="mt-2 flex items-center gap-1 text-[10px] font-medium text-neutral-400">
                      <QrCode className="h-3 w-3 text-amber-400" /> Scan using any UPI
                      application
                    </span>
                  </div>

                  {/* Payment Details & Instructions */}
                  <div className="w-full flex-1 space-y-4 text-left">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold tracking-widest text-amber-400 uppercase">
                        Verified Beneficiary
                      </span>
                      <h4 className="font-serif text-xl font-bold tracking-wide text-white">
                        Appala Sairam
                      </h4>
                      <p className="text-xs text-neutral-300">
                        GenZ Official Artisan Settlement Merchant
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-2 rounded-xl border border-neutral-800 bg-neutral-900/90 p-3">
                      <div>
                        <span className="block text-[10px] font-medium text-neutral-400 uppercase">
                          Exact Amount to Pay
                        </span>
                        <span className="font-mono text-2xl font-bold text-amber-400">
                          ₹{total.toLocaleString("en-IN")}
                        </span>
                      </div>
                      <span className="font-mono text-[11px] text-neutral-400">
                        (Includes ₹200 Shipping)
                      </span>
                    </div>

                    {/* Supported apps */}
                    <div>
                      <span className="mb-1.5 block text-[10px] font-semibold text-neutral-400 uppercase">
                        Accepted UPI Apps:
                      </span>
                      <div className="flex flex-wrap gap-1.5 text-[10px] font-semibold">
                        <span className="rounded-lg border border-[#5F259F]/60 bg-[#5F259F]/30 px-2.5 py-1 text-purple-200">
                          PhonePe
                        </span>
                        <span className="rounded-lg border border-blue-800/60 bg-blue-950/40 px-2.5 py-1 text-blue-200">
                          Google Pay
                        </span>
                        <span className="rounded-lg border border-cyan-800/60 bg-cyan-950/40 px-2.5 py-1 text-cyan-200">
                          Paytm
                        </span>
                        <span className="rounded-lg border border-emerald-800/60 bg-emerald-950/40 px-2.5 py-1 text-emerald-200">
                          BHIM UPI / Any App
                        </span>
                      </div>
                    </div>

                    {/* Copy UPI Option */}
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={copyUpiId}
                        className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-medium text-amber-400 transition-colors hover:text-amber-300"
                      >
                        {copiedUpi ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-emerald-400" />
                            <span className="font-semibold text-emerald-400">
                              UPI ID Copied to Clipboard!
                            </span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" />
                            <span>Copy UPI ID ({upiIdDisplay})</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Confirmation Input */}
              <div className="space-y-3.5 rounded-xl border border-amber-200/80 bg-[#FAF8F4] p-4">
                <div className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4 text-[#D97706]" />
                  <h4 className="text-xs font-bold tracking-wider text-[#1A1A18] uppercase">
                    Confirm Your Payment Transaction
                  </h4>
                </div>
                <p className="text-[11px] leading-relaxed text-[#73736E]">
                  After completing the transfer of{" "}
                  <strong>₹{total.toLocaleString("en-IN")}</strong> on PhonePe or your
                  UPI app, enter the{" "}
                  <strong>12-digit UPI Reference Number / UTR</strong> from the payment
                  receipt.
                </p>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-[11px] font-bold text-[#1A1A18] uppercase">
                      12-Digit UPI Reference Number (UTR) *
                    </Label>
                    {utrNumber.trim().length >= 12 && (
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                        <CheckCircle2 className="h-3 w-3" /> Valid UTR Length
                      </span>
                    )}
                  </div>
                  <Input
                    required
                    placeholder="e.g. 425689123456"
                    value={utrNumber}
                    onChange={(e) =>
                      setUtrNumber(
                        e.target.value.replace(/[^0-9a-zA-Z]/g, "").slice(0, 18)
                      )
                    }
                    className="h-11 rounded-xl border-amber-300 bg-white font-mono text-xs tracking-wider"
                  />
                  <span className="block text-[10px] text-[#73736E]">
                    Located in your PhonePe / GPay payment details screen as &ldquo;UPI
                    Ref ID&rdquo; or &ldquo;UTR&rdquo;.
                  </span>
                </div>

                <div className="pt-1">
                  <Label className="text-[11px] font-semibold text-[#73736E] uppercase">
                    Sender UPI Mobile or Account Name (Optional)
                  </Label>
                  <Input
                    placeholder="e.g. 9876543210 or yourname@upi"
                    value={payerAccount}
                    onChange={(e) => setPayerAccount(e.target.value)}
                    className="mt-1 h-10 rounded-xl bg-white text-xs"
                  />
                </div>
              </div>
            </div>

            {/* 3. Items Review Collapsible */}
            <div className="overflow-hidden rounded-2xl border border-[#E5E5E0] bg-white shadow-xs">
              <button
                type="button"
                onClick={() => setShowItemsReview((prev) => !prev)}
                className="flex w-full cursor-pointer items-center justify-between p-4 text-left transition-colors hover:bg-[#FAF8F4]/50"
              >
                <div className="flex items-center gap-2 text-xs font-semibold text-[#1A1A18]">
                  <Package className="h-4 w-4 text-[#D97706]" />
                  <span>Review Items in this Order ({cartItems.length})</span>
                </div>
                {showItemsReview ? (
                  <ChevronUp className="h-4 w-4 text-[#73736E]" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-[#73736E]" />
                )}
              </button>

              {showItemsReview && (
                <div className="divide-y divide-[#E5E5E0] border-t border-[#E5E5E0] bg-[#FAF8F4]/30 p-4">
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between py-2.5 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        {item.image && (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-10 w-10 rounded-lg border border-[#E5E5E0] object-cover"
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
                        <span className="block font-mono font-bold text-[#1A1A18]">
                          ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                        </span>
                        <span className="text-[10px] text-[#73736E]">
                          Qty: {item.quantity}
                        </span>
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
          <div className="sticky top-20 space-y-5 rounded-2xl border border-[#E5E5E0] bg-white p-5 shadow-xs sm:p-6">
            <h3 className="border-b border-[#E5E5E0] pb-3 font-serif text-lg font-normal text-[#1A1A18]">
              Payment Summary
            </h3>

            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-[#73736E]">Subtotal ({cartItems.length} items)</dt>
                <dd className="font-mono font-medium text-[#1A1A18]">
                  ₹{subtotal.toLocaleString("en-IN")}
                </dd>
              </div>

              <div className="flex justify-between">
                <div>
                  <dt className="text-[#73736E]">Shipping Fee</dt>
                  <span className="block text-[10px] text-[#73736E]">
                    Flat Pan-India Delivery
                  </span>
                </div>
                <dd className="font-mono font-medium text-[#1A1A18]">₹{shipping}</dd>
              </div>

              <div className="flex items-baseline justify-between border-t border-[#E5E5E0] pt-3">
                <div>
                  <dt className="text-base font-bold text-[#1A1A18]">Total Due</dt>
                  <span className="block text-[11px] text-[#73736E]">
                    PhonePe / UPI QR Payment
                  </span>
                </div>
                <dd className="font-mono text-2xl font-bold text-[#D97706]">
                  ₹{total.toLocaleString("en-IN")}
                </dd>
              </div>
            </dl>

            <Button
              form="checkout-form"
              type="submit"
              disabled={isCheckingOut}
              className="mt-2 h-13 w-full cursor-pointer rounded-xl bg-[#D97706] text-xs font-semibold tracking-wider text-white uppercase shadow-md transition-all hover:bg-[#B45309]"
            >
              {isCheckingOut
                ? "Verifying & Confirming..."
                : `Verify & Place Order (₹${total.toLocaleString("en-IN")})`}
            </Button>

            {/* Trust highlights */}
            <div className="space-y-2.5 border-t border-[#E5E5E0] pt-4 text-xs text-[#52524E]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600" />
                <span>
                  <strong>100% Verified UPI Merchant:</strong> Direct artisan
                  settlement.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 shrink-0 text-[#D97706]" />
                <span>
                  <strong>Real-Time Tracking:</strong> Follow shipment from artisan
                  workshop to your doorstep.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
