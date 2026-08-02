"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import {
  Building2,
  ArrowRight,
  ArrowLeft,
  Check,
  Upload,
  ShieldAlert,
  CheckCircle2,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { signupManufacturer, type ManufacturerSignupState } from "./actions";
import { LocationSelectGroup } from "@/components/location-select";
import { PhoneInputWithCountryCode } from "@/components/phone-input";

type BusinessType = "manufacturer" | "startup" | "artisan";

export function ManufacturerSignupForm() {
  const [businessType, setBusinessType] = useState<BusinessType>("manufacturer");
  const [step, setStep] = useState(0); // 0: Select Type, 1-6: Manufacturer Steps, 1: Startup/Artisan
  const [showPassword, setShowPassword] = useState(false);

  // Controlled form state so inputs NEVER reset on re-render
  const [formValues, setFormValues] = useState<Record<string, string>>({});

  // Form action state
  const [state, formAction, isPending] = useActionState<
    ManufacturerSignupState,
    FormData
  >(signupManufacturer, {});

  // Upload simulation state
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, string>>({});

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const simulateFileUpload = (fieldId: string, fileName: string) => {
    setUploadProgress((prev) => ({ ...prev, [fieldId]: 10 }));

    let current = 10;
    const interval = setInterval(() => {
      current += Math.floor(Math.random() * 30) + 15;
      if (current >= 100) {
        current = 100;
        clearInterval(interval);
        setUploadedFiles((prev) => ({ ...prev, [fieldId]: fileName }));
      }
      setUploadProgress((prev) => ({ ...prev, [fieldId]: current }));
    }, 120);
  };

  const handleFileChange = (
    fieldId: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      simulateFileUpload(fieldId, file.name);
    }
  };

  const renderUploadField = (
    fieldId: string,
    label: string,
    description: string,
    accept = "image/*,.pdf",
    required = false
  ) => {
    const isDone = !!uploadedFiles[fieldId];
    const progress = uploadProgress[fieldId] || 0;

    return (
      <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-xs transition-all hover:border-black/30">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-black">{label}</span>
              {required ? (
                <span className="text-[10px] font-bold text-red-500">*</span>
              ) : (
                <span className="text-[10px] font-medium text-neutral-400">
                  (Optional)
                </span>
              )}
            </div>
            <p className="mt-0.5 text-xs text-neutral-500">{description}</p>
          </div>

          <label className="relative inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-md bg-black px-4 py-2 text-xs font-medium text-white transition-all hover:bg-neutral-800">
            <Upload className="h-3.5 w-3.5" />
            <span>{isDone ? "Replace File" : "Choose File"}</span>
            <input
              type="file"
              accept={accept}
              onChange={(e) => handleFileChange(fieldId, e)}
              className="sr-only"
            />
          </label>
        </div>

        {/* Progress & Upload status indicator */}
        {progress > 0 && (
          <div className="mt-3 border-t border-neutral-100 pt-3">
            <div className="mb-1.5 flex items-center justify-between text-xs">
              <span className="max-w-[240px] truncate font-mono text-neutral-600">
                {uploadedFiles[fieldId] || "Uploading document..."}
              </span>
              {isDone ? (
                <span className="flex items-center gap-1 font-semibold text-emerald-600">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Attached
                </span>
              ) : (
                <span className="font-mono text-neutral-500">{progress}%</span>
              )}
            </div>

            <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-100">
              <div
                className={`h-full transition-all duration-200 ${
                  isDone ? "bg-emerald-500" : "bg-black"
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Hidden Form Input for submission */}
        {isDone && (
          <input type="hidden" name={fieldId} value={uploadedFiles[fieldId]} />
        )}
      </div>
    );
  };

  const handleNextStep = () => {
    setStep((s) => s + 1);
  };

  const handlePrevStep = () => {
    setStep((s) => s - 1);
  };

  if (state?.success) {
    return (
      <div className="animate-fade-in py-8 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-black/10 bg-black/5 text-black">
          <Check className="h-8 w-8 text-black" />
        </div>
        <h3 className="font-nantes mb-2 text-3xl font-normal text-black">
          Registration Submitted Successfully!
        </h3>
        <p className="mx-auto max-w-md text-sm leading-relaxed text-neutral-600">
          Your manufacturer application has been received and is currently under review
          by the GenZ administration team.
        </p>

        <div className="mx-auto my-6 max-w-md space-y-2 rounded-lg border border-neutral-200 bg-neutral-50/80 p-5 text-left text-xs leading-relaxed text-neutral-700">
          <h4 className="mb-2 text-[11px] font-semibold tracking-wider text-black uppercase">
            What Happens Next?
          </h4>
          <div className="flex items-start gap-2">
            <span className="font-bold text-black">1.</span>
            <span>
              Check your email inbox to confirm your account address if prompted.
            </span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-bold text-black">2.</span>
            <span>
              Our verification team will review your submitted documents and factory
              proof (24–48 hours).
            </span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-bold text-black">3.</span>
            <span>
              Sign in to your Manufacturer Dashboard anytime to check status and set up
              your products.
            </span>
          </div>
        </div>

        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button
            asChild
            className="w-full rounded-none bg-black px-6 py-2.5 font-medium tracking-wider text-white hover:bg-black/90 sm:w-auto"
          >
            <Link href="/login/manufacturer">Sign In to Dashboard</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="w-full rounded-none border-neutral-300 px-6 py-2.5 font-medium tracking-wider text-neutral-800 hover:bg-neutral-100 sm:w-auto"
          >
            <Link href="/">Return Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Step 0: Choose business profile type
  if (step === 0) {
    return (
      <div className="animate-fade-in text-left">
        <fieldset className="mb-6 border-0 p-0">
          <legend className="mb-4 text-xs font-semibold tracking-widest text-neutral-500 uppercase">
            Select Your Business Category
          </legend>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {[
              {
                id: "manufacturer" as BusinessType,
                title: "Regular Manufacturer",
                desc: "You own and operate a registered production facility or industrial factory in India.",
              },
              {
                id: "startup" as BusinessType,
                title: "Startup / Brand",
                desc: "Innovative D2C or emerging brand. You own product designs and trademarks.",
              },
              {
                id: "artisan" as BusinessType,
                title: "Artisan / MSME",
                desc: "Handcrafted workshops, traditional weavers, regional artisans, or micro enterprises.",
              },
            ].map((type) => {
              const isSelected = businessType === type.id;
              return (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setBusinessType(type.id)}
                  className={`flex h-full cursor-pointer flex-col justify-between rounded-lg border-2 p-5 text-left transition-all ${
                    isSelected
                      ? "border-black bg-black/5 shadow-sm ring-1 ring-black"
                      : "border-neutral-200 bg-white hover:border-black/40"
                  }`}
                >
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <h4 className="font-nantes text-lg font-semibold text-black">
                        {type.title}
                      </h4>
                      <div
                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                          isSelected
                            ? "border-black bg-black"
                            : "border-neutral-300 bg-transparent"
                        }`}
                      >
                        {isSelected && (
                          <div className="h-1.5 w-1.5 rounded-full bg-white" />
                        )}
                      </div>
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-neutral-500">
                      {type.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </fieldset>

        <Button
          type="button"
          onClick={() => setStep(1)}
          className="mt-4 flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-none bg-black font-medium tracking-wider text-white uppercase hover:bg-black/90"
        >
          Continue to Application <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  // STARTUP / BRAND FORM
  if (businessType === "startup") {
    return (
      <form action={formAction} noValidate className="animate-fade-in text-left">
        <input type="hidden" name="business_type" value="startup" />
        <input type="hidden" name="role" value="manufacturer" />

        <div className="mb-6 flex items-center justify-between border-b border-neutral-200 pb-4">
          <button
            type="button"
            onClick={handlePrevStep}
            className="flex items-center gap-1 text-xs font-medium text-neutral-500 hover:text-black"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Business Category
          </button>
          <span className="text-[11px] font-semibold tracking-widest text-black uppercase">
            Startup / Brand Profile
          </span>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="brand_name">Brand Name *</Label>
            <Input
              id="brand_name"
              name="business_name"
              required
              value={formValues["business_name"] || ""}
              onChange={handleInputChange}
              placeholder="e.g. Artisanal Crafted Co."
              className="border-neutral-200"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="founder_name">Founder / Owner Name *</Label>
              <Input
                id="founder_name"
                name="founder_name"
                required
                value={formValues["founder_name"] || ""}
                onChange={handleInputChange}
                placeholder="Full Name"
                className="border-neutral-200"
              />
            </div>
            <PhoneInputWithCountryCode
              countryCodeValue={formValues["country_code"] || "+91"}
              phoneValue={formValues["phone"] || ""}
              onPhoneChange={handleInputChange}
            />
          </div>

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
                placeholder="founder@brand.com"
                className="border-neutral-200"
              />
            </div>
            <div>
              <Label htmlFor="password">Password *</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formValues["password"] || ""}
                  onChange={handleInputChange}
                  placeholder="At least 6 characters"
                  className="border-neutral-200 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-neutral-400 hover:text-black"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="website">Brand Website / Store URL</Label>
              <Input
                id="website"
                name="website"
                value={formValues["website"] || ""}
                onChange={handleInputChange}
                placeholder="https://mybrand.com"
                className="border-neutral-200"
              />
            </div>
            <div>
              <Label htmlFor="gst_number">GST Number (If available)</Label>
              <Input
                id="gst_number"
                name="gst_number"
                value={formValues["gst_number"] || ""}
                onChange={handleInputChange}
                placeholder="22AAAAA0000A1Z5"
                className="border-neutral-200 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="product_categories">Product Categories</Label>
              <Input
                id="product_categories"
                name="product_categories"
                value={formValues["product_categories"] || ""}
                onChange={handleInputChange}
                placeholder="e.g. Textiles, Sustainable Fashion"
                className="border-neutral-200"
              />
            </div>
            <div>
              <Label htmlFor="owns_factory">Production Setup</Label>
              <select
                id="owns_factory"
                name="owns_factory"
                value={formValues["owns_factory"] || "Contract Manufacturing"}
                onChange={handleInputChange}
                className="flex h-10 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 focus:ring-1 focus:ring-black focus:outline-none"
              >
                <option value="Contract Manufacturing">Contract Manufacturing</option>
                <option value="In-house Small Batch">In-house Small Batch</option>
                <option value="Own Factory">Own Factory</option>
              </select>
            </div>
          </div>

          <LocationSelectGroup
            countryValue={formValues["country"] || "India"}
            stateValue={formValues["state"] || "Tamil Nadu"}
            cityValue={formValues["city"] || "Coimbatore"}
            pincodeValue={formValues["pincode"] || ""}
            onChange={handleInputChange}
          />

          <div>
            <Label htmlFor="description">Brand Vision & Description</Label>
            <Textarea
              id="description"
              name="description"
              rows={3}
              value={formValues["description"] || ""}
              onChange={handleInputChange}
              placeholder="Tell us about your brand vision, target audience, and craftsmanship..."
              className="border-neutral-200"
            />
          </div>

          <div className="pt-2">
            <Label className="mb-2 block">Brand Attachments</Label>
            {renderUploadField(
              "brand_logo",
              "Brand Logo / Identity",
              "Upload your brand logo (PNG, JPG)",
              "image/*"
            )}
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
          {isPending ? "Submitting Registration..." : "Submit Startup Application"}
        </Button>
      </form>
    );
  }

  // ARTISAN / MSME FORM
  if (businessType === "artisan") {
    return (
      <form action={formAction} noValidate className="animate-fade-in text-left">
        <input type="hidden" name="business_type" value="artisan" />
        <input type="hidden" name="role" value="manufacturer" />

        <div className="mb-6 flex items-center justify-between border-b border-neutral-200 pb-4">
          <button
            type="button"
            onClick={handlePrevStep}
            className="flex items-center gap-1 text-xs font-medium text-neutral-500 hover:text-black"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Business Category
          </button>
          <span className="text-[11px] font-semibold tracking-widest text-black uppercase">
            Artisan / MSME Profile
          </span>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="artisan_name">Workshop / Unit Name *</Label>
              <Input
                id="artisan_name"
                name="business_name"
                required
                value={formValues["business_name"] || ""}
                onChange={handleInputChange}
                placeholder="e.g. Heritage Handlooms Workshop"
                className="border-neutral-200"
              />
            </div>
            <div>
              <Label htmlFor="owner_name">Master Artisan / Owner Name *</Label>
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

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <PhoneInputWithCountryCode
              countryCodeValue={formValues["country_code"] || "+91"}
              phoneValue={formValues["phone"] || ""}
              onPhoneChange={handleInputChange}
            />
            <div>
              <Label htmlFor="email">Official Email *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                value={formValues["email"] || ""}
                onChange={handleInputChange}
                placeholder="artisan@crafts.in"
                className="border-neutral-200"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="password">Password *</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                value={formValues["password"] || ""}
                onChange={handleInputChange}
                placeholder="At least 6 characters"
                className="border-neutral-200 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-neutral-400 hover:text-black"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <LocationSelectGroup
            countryValue={formValues["country"] || "India"}
            stateValue={formValues["state"] || "Tamil Nadu"}
            cityValue={formValues["city"] || "Coimbatore"}
            pincodeValue={formValues["pincode"] || ""}
            onChange={handleInputChange}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="product_categories">Craft Categories</Label>
              <Input
                id="product_categories"
                name="product_categories"
                value={formValues["product_categories"] || ""}
                onChange={handleInputChange}
                placeholder="e.g. Wood Carving, Pottery, Handloom"
                className="border-neutral-200"
              />
            </div>
            <div>
              <Label htmlFor="handmade_machine">Crafting Technique</Label>
              <select
                id="handmade_machine"
                name="handmade_machine"
                value={formValues["handmade_machine"] || "100% Handcrafted"}
                onChange={handleInputChange}
                className="flex h-10 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 focus:ring-1 focus:ring-black focus:outline-none"
              >
                <option value="100% Handcrafted">100% Handcrafted</option>
                <option value="Semi-Mechanized / Hybrid">
                  Semi-Mechanized / Hybrid
                </option>
                <option value="Traditional Loom / Wheel">
                  Traditional Loom / Wheel
                </option>
              </select>
            </div>
          </div>

          <div>
            <Label htmlFor="udyam_optional">
              UDYAM / Artisan Registration ID (Optional)
            </Label>
            <Input
              id="udyam_optional"
              name="udyam_optional"
              value={formValues["udyam_optional"] || ""}
              onChange={handleInputChange}
              placeholder="UDYAM-XX-00-0000000"
              className="border-neutral-200 font-mono"
            />
          </div>

          <div className="space-y-3 pt-2">
            <Label className="block font-semibold text-black">
              Workshop & Craft Uploads
            </Label>
            {renderUploadField(
              "workshop_photos",
              "Workshop Photo",
              "Photo of your workstation or loom",
              "image/*"
            )}
            {renderUploadField(
              "artisan_products",
              "Crafted Products Photo",
              "Showcase photos of your finished craft products",
              "image/*"
            )}
            {renderUploadField(
              "crafting_video",
              "Short Crafting Video",
              "Optional 30-sec video showing crafting process",
              "video/*"
            )}
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
          {isPending ? "Submitting Registration..." : "Submit Artisan Application"}
        </Button>
      </form>
    );
  }

  // REGULAR MANUFACTURER (MULTI-STEP)
  const TOTAL_STEPS = 6;
  const isLastStep = step === TOTAL_STEPS;

  return (
    <form action={formAction} noValidate className="animate-fade-in text-left">
      <input type="hidden" name="business_type" value="manufacturer" />
      <input type="hidden" name="role" value="manufacturer" />

      {/* Header & Step Bar */}
      <div className="mb-6 border-b border-neutral-200 pb-4">
        <div className="mb-3 flex items-center justify-between">
          <button
            type="button"
            onClick={step === 1 ? () => setStep(0) : handlePrevStep}
            className="flex items-center gap-1 text-xs font-medium text-neutral-500 hover:text-black"
          >
            <ArrowLeft className="h-3.5 w-3.5" />{" "}
            {step === 1 ? "Back to Category" : "Previous Step"}
          </button>
          <span className="text-[11px] font-semibold tracking-widest text-black uppercase">
            Step {step} of {TOTAL_STEPS}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-neutral-100">
          <div
            className="h-full bg-black transition-all duration-300"
            style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
          />
        </div>

        {/* Step Headings */}
        {step === 1 && (
          <div>
            <h3 className="font-nantes text-xl font-semibold text-black">
              Company & Basic Details
            </h3>
            <p className="mt-0.5 text-xs text-neutral-500">
              Primary information about your manufacturing business.
            </p>
          </div>
        )}
        {step === 2 && (
          <div>
            <h3 className="font-nantes text-xl font-semibold text-black">
              Factory Location & Setup
            </h3>
            <p className="mt-0.5 text-xs text-neutral-500">
              Physical facility address and employee capacity.
            </p>
          </div>
        )}
        {step === 3 && (
          <div>
            <h3 className="font-nantes text-xl font-semibold text-black">
              Production & Capabilities
            </h3>
            <p className="mt-0.5 text-xs text-neutral-500">
              Product categories, MOQ, and monthly capacity.
            </p>
          </div>
        )}
        {step === 4 && (
          <div>
            <h3 className="font-nantes text-xl font-semibold text-black">
              Legal & Compliance Documents
            </h3>
            <p className="mt-0.5 text-xs text-neutral-500">
              GSTIN and MSME registration certificates.
            </p>
          </div>
        )}
        {step === 5 && (
          <div>
            <h3 className="font-nantes text-xl font-semibold text-black">
              Factory Inspection Photos
            </h3>
            <p className="mt-0.5 text-xs text-neutral-500">
              Upload photos of exterior, machinery, and production lines.
            </p>
          </div>
        )}
        {step === 6 && (
          <div>
            <h3 className="font-nantes text-xl font-semibold text-black">
              Factory Video Walkthrough
            </h3>
            <p className="mt-0.5 text-xs text-neutral-500">
              Upload a short walkthrough video of your active facility.
            </p>
          </div>
        )}
      </div>

      {/* STEP 1: BASIC DETAILS */}
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <Label htmlFor="business_name">Company / Factory Name *</Label>
            <Input
              id="business_name"
              name="business_name"
              required
              value={formValues["business_name"] || ""}
              onChange={handleInputChange}
              placeholder="e.g. Apex Industrial Polymers Pvt Ltd"
              className="border-neutral-200"
            />
          </div>
          <div>
            <Label htmlFor="owner_name">Owner / Authorized Representative *</Label>
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
          <PhoneInputWithCountryCode
            countryCodeValue={formValues["country_code"] || "+91"}
            phoneValue={formValues["phone"] || ""}
            onPhoneChange={handleInputChange}
          />
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
                placeholder="contact@factory.com"
                className="border-neutral-200"
              />
            </div>
            <div>
              <Label htmlFor="password">Password *</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formValues["password"] || ""}
                  onChange={handleInputChange}
                  placeholder="At least 6 characters"
                  className="border-neutral-200 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-neutral-400 hover:text-black"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: FACTORY LOCATION */}
      {step === 2 && (
        <div className="space-y-4">
          <div>
            <Label htmlFor="factory_address">Factory Address / Premises *</Label>
            <Input
              id="factory_address"
              name="factory_address"
              required
              value={formValues["factory_address"] || ""}
              onChange={handleInputChange}
              placeholder="Plot No., Industrial Area, Phase II"
              className="border-neutral-200"
            />
          </div>

          <LocationSelectGroup
            countryValue={formValues["country"] || "India"}
            stateValue={formValues["state"] || "Tamil Nadu"}
            cityValue={formValues["city"] || "Coimbatore"}
            pincodeValue={formValues["pincode"] || ""}
            onChange={handleInputChange}
          />
          <div>
            <Label htmlFor="google_maps_location">Google Maps Link</Label>
            <Input
              id="google_maps_location"
              name="google_maps_location"
              value={formValues["google_maps_location"] || ""}
              onChange={handleInputChange}
              placeholder="https://maps.google.com/..."
              className="border-neutral-200"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="established_year">Established Year</Label>
              <Input
                id="established_year"
                name="established_year"
                type="number"
                value={formValues["established_year"] || ""}
                onChange={handleInputChange}
                placeholder="2012"
                className="border-neutral-200"
              />
            </div>
            <div>
              <Label htmlFor="employee_count">Workforce Size</Label>
              <Input
                id="employee_count"
                name="employee_count"
                value={formValues["employee_count"] || ""}
                onChange={handleInputChange}
                placeholder="50–100 Workers"
                className="border-neutral-200"
              />
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: CAPABILITIES */}
      {step === 3 && (
        <div className="space-y-4">
          <div>
            <Label htmlFor="product_categories">Product Categories</Label>
            <Input
              id="product_categories"
              name="product_categories"
              value={formValues["product_categories"] || ""}
              onChange={handleInputChange}
              placeholder="e.g. Precision Components, Die Casting"
              className="border-neutral-200"
            />
          </div>
          <div>
            <Label htmlFor="products_manufactured">Key Products Manufactured</Label>
            <Textarea
              id="products_manufactured"
              name="products_manufactured"
              rows={2}
              value={formValues["products_manufactured"] || ""}
              onChange={handleInputChange}
              placeholder="List top products or materials handled..."
              className="border-neutral-200"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="manufacturing_capacity">Monthly Capacity</Label>
              <Input
                id="manufacturing_capacity"
                name="manufacturing_capacity"
                value={formValues["manufacturing_capacity"] || ""}
                onChange={handleInputChange}
                placeholder="e.g. 50,000 units/mo"
                className="border-neutral-200"
              />
            </div>
            <div>
              <Label htmlFor="moq">Minimum Order Quantity (MOQ)</Label>
              <Input
                id="moq"
                name="moq"
                value={formValues["moq"] || ""}
                onChange={handleInputChange}
                placeholder="e.g. 500 units"
                className="border-neutral-200"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="oem_odm">OEM / ODM Support</Label>
              <select
                id="oem_odm"
                name="oem_odm"
                value={formValues["oem_odm"] || "Both Available"}
                onChange={handleInputChange}
                className="flex h-10 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 focus:ring-1 focus:ring-black focus:outline-none"
              >
                <option value="Both Available">Both Available</option>
                <option value="OEM Only">OEM Only</option>
                <option value="ODM Only">ODM Only</option>
                <option value="Standard Off-the-shelf">Standard Off-the-shelf</option>
              </select>
            </div>
            <div>
              <Label htmlFor="export_available">Export Ready?</Label>
              <select
                id="export_available"
                name="export_available"
                value={formValues["export_available"] || "Yes"}
                onChange={handleInputChange}
                className="flex h-10 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 focus:ring-1 focus:ring-black focus:outline-none"
              >
                <option value="Yes">Yes</option>
                <option value="In Progress">In Progress</option>
                <option value="Domestic Only">Domestic Only</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: LEGAL DOCUMENTS */}
      {step === 4 && (
        <div className="space-y-4">
          <div>
            <Label htmlFor="gst_number">GSTIN (GST Registration Number) *</Label>
            <Input
              id="gst_number"
              name="gst_number"
              required
              value={formValues["gst_number"] || ""}
              onChange={handleInputChange}
              placeholder="33AAAAA0000A1Z5"
              className="border-neutral-200 font-mono"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="pan_number">Company PAN</Label>
              <Input
                id="pan_number"
                name="pan_number"
                value={formValues["pan_number"] || ""}
                onChange={handleInputChange}
                placeholder="ABCDE1234F"
                className="border-neutral-200 font-mono"
              />
            </div>
            <div>
              <Label htmlFor="cin_number">CIN / LLPIN (Optional)</Label>
              <Input
                id="cin_number"
                name="cin_number"
                value={formValues["cin_number"] || ""}
                onChange={handleInputChange}
                placeholder="U12345TN2012PTC000000"
                className="border-neutral-200 font-mono"
              />
            </div>
          </div>
          <div className="space-y-3 pt-2">
            <Label className="block font-semibold text-black">
              Compliance Attachments
            </Label>
            {renderUploadField(
              "gst_certificate_file",
              "GST Certificate",
              "Upload GST registration document",
              "application/pdf,image/*",
              true
            )}
            {renderUploadField(
              "udyam_certificate_file",
              "UDYAM / MSME Certificate",
              "Optional MSME registration proof",
              "application/pdf,image/*"
            )}
            {renderUploadField(
              "factory_license_file",
              "Factory License / Trade Permit",
              "Upload factory license or consent to operate",
              "application/pdf,image/*"
            )}
          </div>
        </div>
      )}

      {/* STEP 5: FACTORY PHOTOS */}
      {step === 5 && (
        <div className="space-y-3">
          <Label className="block font-semibold text-black">
            Facility & Infrastructure Proofs
          </Label>
          {renderUploadField(
            "company_logo",
            "Company Logo",
            "Official logo asset (PNG, SVG, JPG)",
            "image/*"
          )}
          {renderUploadField(
            "factory_exterior",
            "Factory Exterior Photo",
            "Photo showing main entrance and factory signage",
            "image/*",
            true
          )}
          {renderUploadField(
            "factory_interior",
            "Factory Floor / Assembly Line",
            "Photo showing active production line floor",
            "image/*"
          )}
          {renderUploadField(
            "machinery_photo",
            "Key Machinery Photo",
            "Photo of heavy machinery or equipment",
            "image/*"
          )}
        </div>
      )}

      {/* STEP 6: VIDEO WALKTHROUGH */}
      {step === 6 && (
        <div className="space-y-4">
          <div className="rounded-md border border-amber-200 bg-amber-50/70 p-4 text-xs leading-relaxed text-amber-900">
            <span className="mb-1 block font-semibold">Verification Note:</span>A
            30-to-60 second video walkthrough of your production facility speeds up your
            GenZ verification badge status significantly.
          </div>
          {renderUploadField(
            "walkthrough_video",
            "Factory Walkthrough Video",
            "Upload MP4/MOV walkthrough video of active facility",
            "video/*"
          )}
        </div>
      )}

      {/* Error Display */}
      {state?.error && isLastStep && (
        <p role="alert" className="mt-4 text-sm font-semibold text-red-600">
          {state.error}
        </p>
      )}

      {/* Step Action Buttons */}
      <div className="mt-8 flex gap-3">
        {step > 1 && (
          <Button
            type="button"
            variant="outline"
            onClick={handlePrevStep}
            className="h-11 flex-1 rounded-none border-neutral-300 text-neutral-800 hover:bg-neutral-100"
          >
            Previous
          </Button>
        )}

        {!isLastStep ? (
          <Button
            type="button"
            onClick={handleNextStep}
            className="flex h-11 flex-1 items-center justify-center gap-1 rounded-none bg-black font-medium tracking-wider text-white uppercase hover:bg-black/90"
          >
            Next Step <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            type="submit"
            disabled={isPending}
            className="h-11 flex-1 rounded-none bg-black font-medium tracking-wider text-white uppercase hover:bg-black/90"
          >
            {isPending ? "Submitting Registration..." : "Submit Registration"}
          </Button>
        )}
      </div>
    </form>
  );
}
