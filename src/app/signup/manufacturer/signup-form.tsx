"use client";

import { useActionState, useState, useEffect } from "react";
import Link from "next/link";
import {
  Building2,
  ArrowRight,
  ArrowLeft,
  Check,
  Upload,
  ShieldAlert,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { signupManufacturer, type ManufacturerSignupState } from "./actions";

type BusinessType = "manufacturer" | "startup" | "artisan";

export function ManufacturerSignupForm() {
  const [businessType, setBusinessType] = useState<BusinessType>("manufacturer");
  const [step, setStep] = useState(0); // 0: Select Type, 1+: Steps

  // Form state
  const [state, formAction, isPending] = useActionState<
    ManufacturerSignupState,
    FormData
  >(signupManufacturer, {});

  // OTP Simulation
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [otpTimer, setOtpTimer] = useState(30);

  // Upload simulation progress
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, string>>({});

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (otpSent && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpSent, otpTimer]);

  const handleSendOtp = () => {
    if (!phone) return;
    setOtpSent(true);
    setOtpTimer(30);
  };

  const handleVerifyOtp = () => {
    if (otpCode === "123456" || otpCode.length === 6) {
      setPhoneVerified(true);
      setOtpSent(false);
    } else {
      alert("Invalid OTP! Try entering 123456");
    }
  };

  const simulateFileUpload = (fieldId: string, fileName: string) => {
    setUploadProgress((prev) => ({ ...prev, [fieldId]: 5 }));

    let current = 5;
    const interval = setInterval(() => {
      current += Math.floor(Math.random() * 25) + 10;
      if (current >= 100) {
        current = 100;
        clearInterval(interval);
        setUploadedFiles((prev) => ({ ...prev, [fieldId]: fileName }));
      }
      setUploadProgress((prev) => ({ ...prev, [fieldId]: current }));
    }, 150);
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

  // Steps configuration for Regular Manufacturer (6 Steps)
  const MANUFACTURER_STEPS = [
    {
      title: "Basic Details",
      fields: (
        <div className="space-y-4">
          <div>
            <Label htmlFor="business_name">Company / Factory Name</Label>
            <Input
              id="business_name"
              name="business_name"
              required
              className="border-black/10"
            />
          </div>
          <div>
            <Label htmlFor="owner_name">Owner / Authorized Person Name</Label>
            <Input
              id="owner_name"
              name="owner_name"
              required
              className="border-black/10"
            />
          </div>
          <div>
            <Label htmlFor="phone">Mobile Number</Label>
            <div className="flex gap-2">
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={phoneVerified}
                placeholder="9876543210"
                className="border-black/10"
              />
              {!phoneVerified ? (
                <Button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={!phone || otpSent}
                  className="shrink-0 bg-black text-white hover:bg-black/90"
                >
                  {otpSent ? `Resend (${otpTimer}s)` : "Send OTP"}
                </Button>
              ) : (
                <div className="flex shrink-0 items-center gap-1 rounded-none border border-green-200 bg-green-50 px-3 py-1.5 text-sm font-semibold text-green-600">
                  <CheckCircle2 className="h-4 w-4" /> Verified
                </div>
              )}
            </div>
            {otpSent && !phoneVerified && (
              <div className="mt-2 flex items-center gap-2 rounded border bg-gray-50 p-3">
                <div className="flex-1">
                  <Label htmlFor="otp">Enter 6-digit OTP (use 123456)</Label>
                  <Input
                    id="otp"
                    type="text"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="123456"
                    className="mt-1 border-black/10"
                  />
                </div>
                <Button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={otpCode.length < 6}
                  className="mt-5 bg-black text-white hover:bg-black/90"
                >
                  Verify
                </Button>
              </div>
            )}
          </div>
          <div>
            <Label htmlFor="email">Official Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              className="border-black/10"
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              className="border-black/10"
            />
          </div>
        </div>
      ),
    },
    {
      title: "Factory Details",
      fields: (
        <div className="space-y-4">
          <div>
            <Label htmlFor="factory_address">Factory Address</Label>
            <Textarea
              id="factory_address"
              name="factory_address"
              rows={2}
              required
              className="border-black/10"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="state">State</Label>
              <Input id="state" name="state" required className="border-black/10" />
            </div>
            <div>
              <Label htmlFor="district">District</Label>
              <Input
                id="district"
                name="district"
                required
                className="border-black/10"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="pincode">Pincode</Label>
              <Input id="pincode" name="pincode" required className="border-black/10" />
            </div>
            <div>
              <Label htmlFor="established_year">Year Established</Label>
              <Input
                id="established_year"
                name="established_year"
                type="number"
                required
                className="border-black/10"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="google_maps_location">Google Maps Location Link</Label>
            <Input
              id="google_maps_location"
              name="google_maps_location"
              placeholder="https://maps.google.com/?q=..."
              className="border-black/10"
            />
          </div>
          <div>
            <Label htmlFor="employee_count">Number of Employees</Label>
            <Input
              id="employee_count"
              name="employee_count"
              type="number"
              required
              className="border-black/10"
            />
          </div>
        </div>
      ),
    },
    {
      title: "Manufacturing Details",
      fields: (
        <div className="space-y-4">
          <div>
            <Label htmlFor="product_categories">
              Product Categories (comma separated)
            </Label>
            <Input
              id="product_categories"
              name="product_categories"
              placeholder="Apparel, Handicrafts, Spares"
              required
              className="border-black/10"
            />
          </div>
          <div>
            <Label htmlFor="products_manufactured">Products Manufactured</Label>
            <Textarea
              id="products_manufactured"
              name="products_manufactured"
              placeholder="What specific items do you build?"
              required
              className="border-black/10"
            />
          </div>
          <div>
            <Label htmlFor="manufacturing_capacity">
              Monthly Manufacturing Capacity
            </Label>
            <Input
              id="manufacturing_capacity"
              name="manufacturing_capacity"
              placeholder="e.g. 50,000 units"
              required
              className="border-black/10"
            />
          </div>
          <div>
            <Label htmlFor="moq">Minimum Order Quantity (MOQ)</Label>
            <Input
              id="moq"
              name="moq"
              placeholder="e.g. 500 units"
              required
              className="border-black/10"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>OEM / ODM Capability</Label>
              <div className="mt-2 flex gap-4">
                <label className="flex items-center gap-1.5 text-sm">
                  <input type="radio" name="oem_odm" value="Yes" defaultChecked /> Yes
                </label>
                <label className="flex items-center gap-1.5 text-sm">
                  <input type="radio" name="oem_odm" value="No" /> No
                </label>
              </div>
            </div>
            <div>
              <Label>Export Available</Label>
              <div className="mt-2 flex gap-4">
                <label className="flex items-center gap-1.5 text-sm">
                  <input
                    type="radio"
                    name="export_available"
                    value="Yes"
                    defaultChecked
                  />{" "}
                  Yes
                </label>
                <label className="flex items-center gap-1.5 text-sm">
                  <input type="radio" name="export_available" value="No" /> No
                </label>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Verification Documents",
      fields: (
        <div className="space-y-4">
          {[
            "gst_certificate_file",
            "udyam_certificate_file",
            "factory_license_file",
          ].map((field) => (
            <div
              key={field}
              className="flex flex-col gap-2 rounded border bg-gray-50 p-3"
            >
              <Label className="text-charcoal text-xs font-semibold capitalize">
                {field.replace(/_/g, " ")}{" "}
                {field === "factory_license_file" ? "(Optional)" : "(Required)"}
              </Label>
              <div className="flex items-center justify-between gap-4">
                <input
                  type="file"
                  id={field}
                  onChange={(e) => handleFileChange(field, e)}
                  className="hidden"
                  accept=".pdf,.png,.jpg,.jpeg"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById(field)?.click()}
                  className="border-black text-black hover:bg-black/5"
                >
                  <Upload className="mr-1.5 h-4 w-4" /> Select File
                </Button>
                <div className="text-smoke max-w-xs truncate text-xs">
                  {uploadedFiles[field] ? (
                    <span className="font-medium text-green-600">
                      ✓ {uploadedFiles[field]}
                    </span>
                  ) : uploadProgress[field] ? (
                    <span>Uploading... {uploadProgress[field]}%</span>
                  ) : (
                    "No file chosen (PDF, PNG, JPG)"
                  )}
                </div>
              </div>
              {uploadProgress[field] !== undefined && uploadProgress[field] < 100 && (
                <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="h-full bg-black transition-all duration-300"
                    style={{ width: `${uploadProgress[field]}%` }}
                  />
                </div>
              )}
              {uploadedFiles[field] && (
                <input type="hidden" name={field} value={uploadedFiles[field]} />
              )}
            </div>
          ))}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="pan_number">PAN Number</Label>
              <Input
                id="pan_number"
                name="pan_number"
                required
                className="border-black/10 uppercase"
                maxLength={10}
              />
            </div>
            <div>
              <Label htmlFor="cin_number">CIN (If applicable)</Label>
              <Input
                id="cin_number"
                name="cin_number"
                className="border-black/10 uppercase"
                maxLength={21}
              />
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Factory Proof Photos",
      fields: (
        <div className="space-y-4">
          <p className="text-smoke text-xs">
            Upload photos of your company setup to build trust (under 10MB each).
          </p>
          {[
            "company_logo",
            "factory_exterior",
            "factory_interior",
            "machinery_photo",
            "production_line",
          ].map((field) => (
            <div
              key={field}
              className="flex flex-col gap-2 rounded border bg-gray-50 p-3"
            >
              <Label className="text-charcoal text-xs font-semibold capitalize">
                {field.replace(/_/g, " ")} (Required)
              </Label>
              <div className="flex items-center justify-between gap-4">
                <input
                  type="file"
                  id={field}
                  onChange={(e) => handleFileChange(field, e)}
                  className="hidden"
                  accept="image/*"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById(field)?.click()}
                  className="border-black text-black hover:bg-black/5"
                >
                  <Upload className="mr-1.5 h-4 w-4" /> Select Image
                </Button>
                <div className="text-smoke max-w-xs truncate text-xs">
                  {uploadedFiles[field] ? (
                    <span className="font-medium text-green-600">
                      ✓ {uploadedFiles[field]}
                    </span>
                  ) : uploadProgress[field] ? (
                    <span>Uploading... {uploadProgress[field]}%</span>
                  ) : (
                    "No image chosen (PNG, JPG)"
                  )}
                </div>
              </div>
              {uploadProgress[field] !== undefined && uploadProgress[field] < 100 && (
                <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="h-full bg-black transition-all duration-300"
                    style={{ width: `${uploadProgress[field]}%` }}
                  />
                </div>
              )}
              {uploadedFiles[field] && (
                <input type="hidden" name={field} value={uploadedFiles[field]} />
              )}
            </div>
          ))}
        </div>
      ),
    },
    {
      title: "Manufacturing Proof Video",
      fields: (
        <div className="space-y-4">
          <div className="flex gap-2 rounded-none border border-amber-500/20 bg-amber-500/5 p-4 text-xs text-neutral-800">
            <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <div>
              <p className="font-medium">Mandatory Verification Walkthrough</p>
              <p className="mt-1 leading-relaxed">
                Provide a 1 to 5 minute factory walkthrough showing raw materials
                entering the factory, the manufacturing process, machinery in operation,
                finished products, packaging, and the factory name board.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 rounded border bg-gray-50 p-3">
            <Label className="text-charcoal text-xs font-semibold">
              Factory Walkthrough Video File (Mandatory)
            </Label>
            <div className="flex items-center justify-between gap-4">
              <input
                type="file"
                id="walkthrough_video"
                onChange={(e) => handleFileChange("walkthrough_video", e)}
                className="hidden"
                accept="video/*"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => document.getElementById("walkthrough_video")?.click()}
                className="border-black text-black hover:bg-black/5"
              >
                <Upload className="mr-1.5 h-4 w-4" /> Select Video
              </Button>
              <div className="text-smoke max-w-xs truncate text-xs">
                {uploadedFiles["walkthrough_video"] ? (
                  <span className="font-medium text-green-600">
                    ✓ {uploadedFiles["walkthrough_video"]}
                  </span>
                ) : uploadProgress["walkthrough_video"] ? (
                  <span>Uploading... {uploadProgress["walkthrough_video"]}%</span>
                ) : (
                  "No video chosen (MP4, MOV)"
                )}
              </div>
            </div>
            {uploadProgress["walkthrough_video"] !== undefined &&
              uploadProgress["walkthrough_video"] < 100 && (
                <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="h-full bg-black transition-all duration-300"
                    style={{ width: `${uploadProgress["walkthrough_video"]}%` }}
                  />
                </div>
              )}
            {uploadedFiles["walkthrough_video"] && (
              <input
                type="hidden"
                name="walkthrough_video"
                value={uploadedFiles["walkthrough_video"]}
              />
            )}
          </div>

          <div className="space-y-2">
            <Label className="mb-1 block text-xs font-medium tracking-wider text-gray-500 uppercase">
              Confirm Video Inclusions
            </Label>
            {[
              "Raw material entering the factory",
              "Manufacturing process from start to finish",
              "Workers operating machinery",
              "Finished product",
              "Packaging process",
              "Factory name board visible",
              "Owner introducing the factory (optional)",
            ].map((item, idx) => (
              <label
                key={idx}
                className="text-charcoal flex cursor-pointer items-start gap-2.5 py-0.5 text-xs select-none"
              >
                <input
                  type="checkbox"
                  name={`video_inclusion_${idx}`}
                  value="Yes"
                  defaultChecked
                  className="mt-0.5 rounded border-gray-300"
                />
                <span>{item}</span>
              </label>
            ))}
          </div>
        </div>
      ),
    },
  ];

  // Startup / Brand Form (Single Step)
  const STARTUP_FIELDS = (
    <div className="space-y-4 text-left">
      <div>
        <Label htmlFor="business_name">Brand Name</Label>
        <Input
          id="business_name"
          name="business_name"
          required
          className="border-black/10"
        />
      </div>
      <div>
        <Label htmlFor="founder_name">Founder Name</Label>
        <Input
          id="founder_name"
          name="founder_name"
          required
          className="border-black/10"
        />
      </div>
      <div>
        <Label htmlFor="phone">Mobile Number</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          required
          className="border-black/10"
          placeholder="9876543210"
        />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          className="border-black/10"
        />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          className="border-black/10"
        />
      </div>
      <div>
        <Label htmlFor="gst_number">GSTIN (Optional initially)</Label>
        <Input
          id="gst_number"
          name="gst_number"
          className="border-black/10 uppercase"
          maxLength={15}
        />
      </div>
      <div>
        <Label htmlFor="website">Website (Optional)</Label>
        <Input
          id="website"
          name="website"
          placeholder="https://mybrand.com"
          className="border-black/10"
        />
      </div>
      <div>
        <Label htmlFor="product_categories">Product Categories</Label>
        <Input
          id="product_categories"
          name="product_categories"
          placeholder="Cosmetics, Clothing, Packaged Food"
          required
          className="border-black/10"
        />
      </div>
      <div>
        <Label>Do you own a factory?</Label>
        <select
          name="owns_factory"
          className="bg-paper-white mt-1 h-10 w-full rounded border border-black/10 px-3 text-sm focus:border-black focus:outline-none"
        >
          <option value="Yes">Yes, we own the production facility</option>
          <option value="No">No, looking for manufacturing partners on GenZ</option>
        </select>
      </div>
      <div>
        <Label htmlFor="description">Brand Description</Label>
        <Textarea
          id="description"
          name="description"
          rows={3}
          placeholder="Tell us about your brand vision..."
          className="border-black/10"
        />
      </div>

      {/* Logo upload */}
      <div className="flex flex-col gap-2 rounded border bg-gray-50 p-3">
        <Label className="text-charcoal text-xs font-semibold">
          Brand Logo (Required)
        </Label>
        <div className="flex items-center justify-between gap-4">
          <input
            type="file"
            id="brand_logo"
            onChange={(e) => handleFileChange("brand_logo", e)}
            className="hidden"
            accept="image/*"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => document.getElementById("brand_logo")?.click()}
            className="border-black text-black hover:bg-black/5"
          >
            <Upload className="mr-1.5 h-4 w-4" /> Upload Logo
          </Button>
          <div className="text-smoke text-xs">
            {uploadedFiles["brand_logo"] ? (
              <span className="font-medium text-green-600">
                ✓ {uploadedFiles["brand_logo"]}
              </span>
            ) : uploadProgress["brand_logo"] ? (
              <span>Uploading... {uploadProgress["brand_logo"]}%</span>
            ) : (
              "No logo uploaded"
            )}
          </div>
        </div>
        {uploadedFiles["brand_logo"] && (
          <input type="hidden" name="brand_logo" value={uploadedFiles["brand_logo"]} />
        )}
      </div>
    </div>
  );

  // Artisan / MSME Form (Single Step)
  const ARTISAN_FIELDS = (
    <div className="space-y-4 text-left">
      <div>
        <Label htmlFor="owner_name">Artisan / MSME Owner Name</Label>
        <Input id="owner_name" name="owner_name" required className="border-black/10" />
      </div>
      <div>
        <Label htmlFor="business_name">Business / Workshop Name</Label>
        <Input
          id="business_name"
          name="business_name"
          required
          className="border-black/10"
        />
      </div>
      <div>
        <Label htmlFor="phone">Mobile Number</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          required
          className="border-black/10"
          placeholder="9876543210"
        />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          className="border-black/10"
        />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          className="border-black/10"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="state">State</Label>
          <Input id="state" name="state" required className="border-black/10" />
        </div>
        <div>
          <Label htmlFor="district">District</Label>
          <Input id="district" name="district" required className="border-black/10" />
        </div>
      </div>
      <div>
        <Label htmlFor="product_categories">Product Categories</Label>
        <Input
          id="product_categories"
          name="product_categories"
          placeholder="Pottery, Handloom, Wood Carving"
          required
          className="border-black/10"
        />
      </div>
      <div>
        <Label>Production Type</Label>
        <select
          name="handmade_machine"
          className="bg-paper-white mt-1 h-10 w-full rounded border border-black/10 px-3 text-sm focus:border-black focus:outline-none"
        >
          <option value="Handmade">100% Handmade / Handcrafted</option>
          <option value="Machine">Machine Made</option>
          <option value="Both">Both (Semi-automated)</option>
        </select>
      </div>
      <div>
        <Label htmlFor="udyam_optional">UDYAM / MSME Number (Optional)</Label>
        <Input
          id="udyam_optional"
          name="udyam_optional"
          placeholder="UDYAM-XX-00-0000000"
          className="border-black/10 uppercase"
        />
      </div>

      {/* Workshop Photos */}
      <div className="flex flex-col gap-2 rounded border bg-gray-50 p-3">
        <Label className="text-charcoal text-xs font-semibold">
          Workshop Photos (Required)
        </Label>
        <div className="flex items-center justify-between gap-4">
          <input
            type="file"
            id="workshop_photos"
            onChange={(e) => handleFileChange("workshop_photos", e)}
            className="hidden"
            accept="image/*"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => document.getElementById("workshop_photos")?.click()}
            className="border-black text-black hover:bg-black/5"
          >
            <Upload className="mr-1.5 h-4 w-4" /> Upload Photo
          </Button>
          <div className="text-smoke text-xs">
            {uploadedFiles["workshop_photos"] ? (
              <span className="font-medium text-green-600">
                ✓ {uploadedFiles["workshop_photos"]}
              </span>
            ) : uploadProgress["workshop_photos"] ? (
              <span>Uploading... {uploadProgress["workshop_photos"]}%</span>
            ) : (
              "No photo uploaded"
            )}
          </div>
        </div>
        {uploadedFiles["workshop_photos"] && (
          <input
            type="hidden"
            name="workshop_photos"
            value={uploadedFiles["workshop_photos"]}
          />
        )}
      </div>

      {/* Product Photos */}
      <div className="flex flex-col gap-2 rounded border bg-gray-50 p-3">
        <Label className="text-charcoal text-xs font-semibold">
          Product Photos (Required)
        </Label>
        <div className="flex items-center justify-between gap-4">
          <input
            type="file"
            id="artisan_products"
            onChange={(e) => handleFileChange("artisan_products", e)}
            className="hidden"
            accept="image/*"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => document.getElementById("artisan_products")?.click()}
            className="border-black text-black hover:bg-black/5"
          >
            <Upload className="mr-1.5 h-4 w-4" /> Upload Photo
          </Button>
          <div className="text-smoke text-xs">
            {uploadedFiles["artisan_products"] ? (
              <span className="font-medium text-green-600">
                ✓ {uploadedFiles["artisan_products"]}
              </span>
            ) : uploadProgress["artisan_products"] ? (
              <span>Uploading... {uploadProgress["artisan_products"]}%</span>
            ) : (
              "No photo uploaded"
            )}
          </div>
        </div>
        {uploadedFiles["artisan_products"] && (
          <input
            type="hidden"
            name="artisan_products"
            value={uploadedFiles["artisan_products"]}
          />
        )}
      </div>

      {/* Crafting Process Video */}
      <div className="flex flex-col gap-2 rounded border bg-gray-50 p-3">
        <Label className="text-charcoal text-xs font-semibold">
          Short video showing the crafting/manufacturing process (Required)
        </Label>
        <div className="flex items-center justify-between gap-4">
          <input
            type="file"
            id="crafting_video"
            onChange={(e) => handleFileChange("crafting_video", e)}
            className="hidden"
            accept="video/*"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => document.getElementById("crafting_video")?.click()}
            className="border-black text-black hover:bg-black/5"
          >
            <Upload className="mr-1.5 h-4 w-4" /> Upload Video
          </Button>
          <div className="text-smoke text-xs">
            {uploadedFiles["crafting_video"] ? (
              <span className="font-medium text-green-600">
                ✓ {uploadedFiles["crafting_video"]}
              </span>
            ) : uploadProgress["crafting_video"] ? (
              <span>Uploading... {uploadProgress["crafting_video"]}%</span>
            ) : (
              "No video uploaded"
            )}
          </div>
        </div>
        {uploadedFiles["crafting_video"] && (
          <input
            type="hidden"
            name="crafting_video"
            value={uploadedFiles["crafting_video"]}
          />
        )}
      </div>
    </div>
  );

  const handleNextStep = () => {
    // If we're on the first step (business details), make sure phone is verified!
    if (businessType === "manufacturer" && step === 1 && !phoneVerified) {
      alert("Please enter and verify your phone number via simulated OTP first!");
      return;
    }
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
        <h3 className="mb-3 font-serif text-3xl text-black">Check your inbox.</h3>
        <p className="mx-auto max-w-sm text-sm leading-relaxed text-neutral-500">
          We have sent a verification email. Once you confirm, your profile will be
          submitted to the GenZ administration team for approval.
        </p>
        <Button
          asChild
          className="mt-8 rounded-none bg-black font-medium tracking-wider text-white hover:bg-black/90"
        >
          <Link href="/">Return Home</Link>
        </Button>
      </div>
    );
  }

  // Step 0: Choose business profile type
  if (step === 0) {
    return (
      <div className="animate-fade-in text-left">
        <fieldset className="mb-6 border-0 p-0">
          <legend className="mb-3 text-xs font-medium tracking-widest text-neutral-400 uppercase">
            Select Your Business Profile
          </legend>
          <div className="grid grid-cols-1 gap-3">
            {[
              {
                id: "manufacturer" as BusinessType,
                title: "Regular / Large Manufacturer",
                desc: "You own and run a production facility or factory. Includes detailed GST and factory proof verifications.",
              },
              {
                id: "startup" as BusinessType,
                title: "Startup / Brand",
                desc: "An innovative brand. You own the designs and brand rights, and may or may not own the production line.",
              },
              {
                id: "artisan" as BusinessType,
                title: "Artisan / MSME",
                desc: "Handcrafted workshops, traditional crafts, weavers, or micro-level MSME businesses.",
              },
            ].map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => setBusinessType(type.id)}
                className={`flex items-start gap-4 rounded-none border-2 p-4 text-left transition-all ${
                  businessType === type.id
                    ? "border-black bg-black/5 ring-1 ring-black"
                    : "border-ash bg-paper-white hover:border-gray-300"
                }`}
              >
                <div
                  className={`rounded-none p-2 ${businessType === type.id ? "bg-black text-white" : "bg-gray-100 text-gray-400"}`}
                >
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-serif text-base font-semibold text-black">
                    {type.title}
                  </h4>
                  <p className="text-smoke mt-1 text-xs leading-relaxed">{type.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </fieldset>

        <Button
          type="button"
          onClick={() => setStep(1)}
          className="mt-2 flex h-12 w-full items-center justify-center gap-1.5 rounded-none bg-black font-medium tracking-wider text-white uppercase hover:bg-black/90"
        >
          Continue <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  // For Startups and Artisans: Single step form submission
  if (businessType === "startup" || businessType === "artisan") {
    return (
      <form action={formAction} noValidate className="animate-fade-in">
        <input type="hidden" name="business_type" value={businessType} />

        <div className="mb-6 flex items-center gap-2 border-b pb-4">
          <button
            type="button"
            onClick={handlePrevStep}
            className="text-smoke flex items-center gap-0.5 text-xs hover:text-black"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back
          </button>
          <span className="ml-auto text-xs font-medium tracking-widest text-neutral-400 uppercase">
            {businessType === "startup"
              ? "Startup / Brand Details"
              : "Artisan / MSME Details"}
          </span>
        </div>

        {businessType === "startup" ? STARTUP_FIELDS : ARTISAN_FIELDS}

        {state?.error && (
          <p
            role="alert"
            className="text-destructive mt-4 text-left text-sm font-semibold"
          >
            {state.error}
          </p>
        )}

        <Button
          type="submit"
          disabled={isPending}
          className="mt-6 h-12 w-full rounded-none bg-black font-medium tracking-wider text-white uppercase hover:bg-black/90"
        >
          {isPending ? "Submitting Application..." : "Submit Registration"}
        </Button>
      </form>
    );
  }

  // For Regular Manufacturers: 6-step multi-step process
  const currentStepInfo = MANUFACTURER_STEPS[step - 1];
  const isLastStep = step === MANUFACTURER_STEPS.length;

  return (
    <form action={formAction} noValidate className="animate-fade-in text-left">
      <input type="hidden" name="business_type" value="manufacturer" />

      {/* Step Indicators */}
      <div className="mb-6 border-b pb-4">
        <div className="mb-3 flex items-center justify-between">
          <button
            type="button"
            onClick={handlePrevStep}
            className="text-smoke flex items-center gap-0.5 text-xs font-medium hover:text-black"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back
          </button>
          <span className="text-xs font-medium tracking-widest text-black uppercase">
            Step {step} of {MANUFACTURER_STEPS.length}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="mb-4 h-1.5 w-full overflow-hidden rounded-none bg-gray-100">
          <div
            className="h-full bg-black transition-all duration-300"
            style={{ width: `${(step / MANUFACTURER_STEPS.length) * 100}%` }}
          />
        </div>

        <h3 className="font-serif text-lg font-semibold text-black">
          {currentStepInfo.title}
        </h3>
      </div>

      {currentStepInfo.fields}

      {state?.error && isLastStep && (
        <p role="alert" className="text-destructive mt-4 text-sm font-semibold">
          {state.error}
        </p>
      )}

      <div className="mt-8 flex gap-3">
        {step > 1 && (
          <Button
            type="button"
            variant="outline"
            onClick={handlePrevStep}
            className="h-11 flex-1 rounded-none border-black text-black hover:bg-black/5"
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
            {isPending ? "Submitting..." : "Submit Registration"}
          </Button>
        )}
      </div>
    </form>
  );
}
