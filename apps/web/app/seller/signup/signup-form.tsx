"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Button, Input, Label, Textarea, LocationSelectGroup, PhoneInputWithCountryCode } from "@genz/ui";
import { signupSeller, type SellerSignupState } from "./actions";
import { validateGstOrTradeId } from "@genz/validation";

type BusinessType = "manufacturer" | "startup" | "artisan";

export function SellerSignupForm() {
  const [businessType, setBusinessType] = useState<BusinessType>("manufacturer");
  const [formValues, setFormValues] = useState<Record<string, string>>({});

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

  if (state?.success) {
    return (
      <div className="animate-fade-in py-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <h3 className="font-nantes mb-2 text-2xl font-bold text-black">
          Application Submitted Successfully!
        </h3>
        <p className="mx-auto max-w-md text-sm leading-relaxed text-neutral-600">
          Thank you for applying to sell on GenZ. Our onboarding team will verify your business details and contact you via email with your dashboard access.
        </p>

        <div className="mt-8 flex justify-center gap-4">
          <Button
            asChild
            className="rounded-lg bg-black px-6 py-2.5 font-medium tracking-wider text-white hover:bg-neutral-850"
          >
            <Link href="/">Return to Marketplace</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-6">
      {state?.error && (
        <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
          <p>{state.error}</p>
        </div>
      )}

      {/* Business Type Selector */}
      <div className="space-y-2">
        <Label className="text-xs font-semibold text-neutral-700">
          I am registering as:
        </Label>
        <div className="grid grid-cols-3 gap-2">
          {(
            [
              { id: "manufacturer", label: "Manufacturer" },
              { id: "artisan", label: "Artisan / Craft" },
              { id: "startup", label: "Brand / Startup" },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setBusinessType(item.id)}
              className={`rounded-lg border px-3 py-2 text-xs font-semibold transition-all ${
                businessType === item.id
                  ? "border-black bg-black text-white shadow-xs"
                  : "border-[#E5E5E0] bg-white text-neutral-600 hover:border-neutral-400"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
        <input type="hidden" name="business_type" value={businessType} />
      </div>

      {/* Basic Details */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="business_name" className="text-xs font-semibold text-neutral-700">
            Business / Factory Name *
          </Label>
          <Input
            id="business_name"
            name="business_name"
            required
            placeholder="e.g. Kaveri Handicrafts & Works"
            onChange={handleInputChange}
            className="h-11 rounded-lg border-[#E5E5E0] bg-white text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="owner_name" className="text-xs font-semibold text-neutral-700">
            Founder / Owner Name *
          </Label>
          <Input
            id="owner_name"
            name="owner_name"
            required
            placeholder="e.g. Rameshwar Prasad"
            onChange={handleInputChange}
            className="h-11 rounded-lg border-[#E5E5E0] bg-white text-sm"
          />
        </div>
      </div>

      {/* Email & Phone */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-xs font-semibold text-neutral-700">
            Work Email Address *
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            placeholder="contact@factory.com"
            onChange={handleInputChange}
            className="h-11 rounded-lg border-[#E5E5E0] bg-white text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="phone" className="text-xs font-semibold text-neutral-700">
            Phone / WhatsApp Number *
          </Label>
          <PhoneInputWithCountryCode
            id="phone"
            name="phone"
            required
            placeholder="9876543210"
            value={formValues["phone"] || ""}
            onChange={handleInputChange}
          />
        </div>
      </div>

      {/* GST / Business Registration Number */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="gst_number" className="text-xs font-semibold text-neutral-700">
            GSTIN / MSME / Trade ID
          </Label>
          <span className="text-[11px] text-neutral-400">Optional for artisans</span>
        </div>
        <Input
          id="gst_number"
          name="gst_number"
          placeholder="22AAAAA0000A1Z5"
          value={formValues["gst_number"] || ""}
          onChange={handleInputChange}
          className="h-11 rounded-lg border-[#E5E5E0] bg-white font-mono text-sm uppercase"
        />
        {gstVal && !gstCheck.isValid && (
          <p className="text-[11px] text-amber-600">{gstCheck.message}</p>
        )}
      </div>

      {/* Location Selector */}
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-neutral-700">
          Factory / Workshop Location *
        </Label>
        <LocationSelectGroup
          countryValue={formValues["country"] || "India"}
          stateValue={formValues["state"] || "Telangana"}
          cityValue={formValues["city"] || "Hyderabad"}
          addressValue={formValues["address"] || ""}
          pincodeValue={formValues["pincode"] || ""}
          onChange={handleInputChange}
        />
      </div>

      {/* Business Bio / Description */}
      <div className="space-y-1.5">
        <Label htmlFor="description" className="text-xs font-semibold text-neutral-700">
          About Your Products & Production Capacity
        </Label>
        <Textarea
          id="description"
          name="description"
          rows={3}
          placeholder="Briefly describe what you manufacture, materials used, and your craft or factory experience..."
          className="rounded-lg border-[#E5E5E0] bg-white text-sm"
        />
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isPending}
        className="h-12 w-full rounded-lg bg-black text-sm font-semibold tracking-wide text-white transition-all hover:bg-neutral-850 disabled:opacity-50"
      >
        {isPending ? "Submitting Application..." : "Submit Seller Application"}
      </Button>
    </form>
  );
}
