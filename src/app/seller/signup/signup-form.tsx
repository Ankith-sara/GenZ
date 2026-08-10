"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Check, ShieldCheck, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/atoms/button";
import { Input } from "@/components/ui/atoms/input";
import { Label } from "@/components/ui/atoms/label";
import { Textarea } from "@/components/ui/atoms/textarea";
import { signupSeller, type SellerSignupState } from "./actions";
import { LocationSelectGroup } from "@/components/ui/molecules/location-select";
import { PhoneInputWithCountryCode } from "@/components/ui/molecules/phone-input";
import { validateGstOrTradeId } from "@/lib/validation";

type BusinessType = "seller" | "startup" | "artisan";

export function SellerSignupForm() {
  const [businessType, setBusinessType] = useState<BusinessType>("seller");
  const [formValues, setFormValues] = useState<Record<string, string>>({});

  // Form action state
  const [state, formAction, isPending] = useActionState<SellerSignupState, FormData>(
    signupSeller,
    {}
  );

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const finalValue = name === "gst_number" ? value.toUpperCase() : value;
    setFormValues((prev) => ({ ...prev, [name]: finalValue }));
  };

  const gstVal = formValues["gst_number"] || "";
  const gstCheck = validateGstOrTradeId(gstVal);

  // SUCCESS SCREEN: Shows ONLY the requested message
  if (state?.success) {
    return (
      <div className="animate-fade-in py-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-black text-white">
          <Check className="h-7 w-7" />
        </div>
        <h3 className="font-nantes mb-2 text-2xl font-normal text-black">
          Application Received!
        </h3>
        <p className="mx-auto max-w-md text-sm leading-relaxed text-neutral-600">
          Our Admin team will review your business details.
        </p>

        <div className="mt-6 flex justify-center">
          <Button
            asChild
            className="rounded-none bg-black px-6 py-2.5 font-medium tracking-wider text-white hover:bg-black/90"
          >
            <Link href="/">Return Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} noValidate className="animate-fade-in text-left">
      <input type="hidden" name="role" value="seller" />

      <div className="space-y-4">
        {/* Business Category Dropdown */}
        <div>
          <Label htmlFor="business_type">Business Category *</Label>
          <select
            id="business_type"
            name="business_type"
            value={businessType}
            onChange={(e) => {
              const val = e.target.value as BusinessType;
              setBusinessType(val);
              handleInputChange(e);
            }}
            className="flex h-10 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 focus:ring-1 focus:ring-black focus:outline-none"
          >
            <option value="seller">Manufacturer / Factory</option>
            <option value="startup">Startup / Brand</option>
            <option value="artisan">Artisan / MSME</option>
          </select>
        </div>

        {/* Company & Contact Name */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="business_name">Company / Business Name *</Label>
            <Input
              id="business_name"
              name="business_name"
              required
              value={formValues["business_name"] || ""}
              onChange={handleInputChange}
              placeholder="e.g. Bharat Industries"
              className="border-neutral-200"
            />
          </div>
          <div>
            <Label htmlFor="owner_name">Owner / Contact Name *</Label>
            <Input
              id="owner_name"
              name="owner_name"
              required
              value={formValues["owner_name"] || ""}
              onChange={handleInputChange}
              placeholder="Full Name"
              className="border-neutral-200"
            />
          </div>
        </div>

        {/* Email & Phone Number with Asian Country Codes */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="email">Official Email *</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              value={formValues["email"] || ""}
              onChange={handleInputChange}
              placeholder="owner@business.com"
              className="border-neutral-200"
            />
          </div>
          <PhoneInputWithCountryCode
            countryCodeValue={formValues["country_code"] || "+91"}
            phoneValue={formValues["phone"] || ""}
            onPhoneChange={handleInputChange}
          />
        </div>

        {/* Location Select Group */}
        <LocationSelectGroup
          addressValue={formValues["address"] || ""}
          countryValue={formValues["country"] || "India"}
          stateValue={formValues["state"] || "Tamil Nadu"}
          cityValue={formValues["city"] || "Coimbatore"}
          pincodeValue={formValues["pincode"] || ""}
          onChange={handleInputChange}
        />

        {/* Required GSTIN & Optional Categories */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="gst_number">GSTIN / Trade ID *</Label>
            <div className="relative">
              <Input
                id="gst_number"
                name="gst_number"
                required
                value={gstVal}
                onChange={handleInputChange}
                placeholder="22AAAAA0000A1Z5"
                maxLength={20}
                className={`border-neutral-200 font-mono tracking-wider uppercase ${
                  gstVal && gstCheck.isValid
                    ? "border-emerald-500 focus:ring-emerald-500"
                    : gstVal && !gstCheck.isValid
                      ? "border-amber-500 focus:ring-amber-500"
                      : ""
                }`}
              />
              {gstVal && gstCheck.isValid && (
                <ShieldCheck className="absolute top-2.5 right-3 h-5 w-5 text-emerald-600" />
              )}
            </div>
            {gstVal ? (
              <p
                className={`mt-1.5 flex items-center gap-1 text-xs ${
                  gstCheck.isValid ? "font-medium text-emerald-700" : "text-amber-700"
                }`}
              >
                {!gstCheck.isValid && <AlertCircle className="h-3.5 w-3.5 shrink-0" />}
                <span>{gstCheck.message}</span>
              </p>
            ) : (
              <p className="mt-1 text-[11px] text-neutral-500">
                Enter 15-character GSTIN (e.g. 22AAAAA0000A1Z5) or official Trade
                License ID.
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="product_categories">Product Categories (Optional)</Label>
            <Input
              id="product_categories"
              name="product_categories"
              value={formValues["product_categories"] || ""}
              onChange={handleInputChange}
              placeholder="e.g. Textiles, Electronics, Hardware"
              className="border-neutral-200"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <Label htmlFor="description">Business Overview (Optional)</Label>
          <Textarea
            id="description"
            name="description"
            rows={3}
            value={formValues["description"] || ""}
            onChange={handleInputChange}
            placeholder="Brief description of your products or manufacturing facilities..."
            className="border-neutral-200"
          />
        </div>
      </div>

      {state?.error && (
        <p role="alert" className="mt-4 text-sm font-semibold text-red-600">
          {state.error}
        </p>
      )}

      <Button
        type="submit"
        disabled={isPending}
        className="mt-6 h-12 w-full rounded-none bg-black font-medium tracking-wider text-white uppercase hover:bg-black/90"
      >
        {isPending ? "Submitting Application..." : "Submit Seller Application"}
      </Button>
    </form>
  );
}
