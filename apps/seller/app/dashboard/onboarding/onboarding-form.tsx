"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Input, Label, Textarea } from "@genz/ui";
import { 
  CheckCircle2, AlertCircle, ArrowRight,
} from "lucide-react";
import {
  saveSellerProfile,
  submitForVerification,
  type ProfileFormState,
} from "./actions";
import type { SellerProfile } from "@genz/types";

interface OnboardingFormProps {
  profile: SellerProfile | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function OnboardingForm({ profile, onSuccess, onCancel }: OnboardingFormProps) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState<ProfileFormState, FormData>(
    saveSellerProfile,
    {}
  );

  useEffect(() => {
    if (state?.success) {
      router.refresh();
      if (onSuccess) {
        const timer = setTimeout(() => {
          onSuccess();
        }, 1200);
        return () => clearTimeout(timer);
      }
    }
  }, [state?.success, router, onSuccess]);

  const canSubmitForReview =
    !!profile && (profile.status === "not_submitted" || profile.status === "rejected");

  const currentGst =
    profile?.gst_number && profile.gst_number !== "PENDING" && profile.gst_number !== "Pending"
      ? profile.gst_number
      : "";

  return (
    <div className="space-y-6">
      <form action={formAction} noValidate className="space-y-5">
        {/* Error Alert */}
        {state?.error && (
          <div className="flex items-center gap-2.5 rounded-xl border border-rose-200 bg-rose-50/90 p-4 text-xs font-semibold text-rose-800 shadow-2xs">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <p>{state.error}</p>
          </div>
        )}

        {/* Success Alert */}
        {state?.success && (
          <div className="flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50/90 p-4 text-xs font-semibold text-emerald-800 shadow-2xs">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            <p>Factory & Business Profile details successfully saved!</p>
          </div>
        )}

        {/* Business Name & GSTIN */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="business_name" className="text-xs font-semibold text-neutral-700">
              Workshop / Business Name *
            </Label>
            <Input
              id="business_name"
              name="business_name"
              required
              defaultValue={profile?.business_name ?? ""}
              placeholder="e.g. Channapatna Crafts & Toys"
              className="h-10 rounded-lg text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="gst_number" className="text-xs font-semibold text-neutral-700">
                GSTIN / Trade ID
              </Label>
              <span className="text-[10px] text-neutral-500 font-normal">
                Optional if pending
              </span>
            </div>
            <Input
              id="gst_number"
              name="gst_number"
              placeholder="22AAAAA0000A1Z5 or PENDING"
              maxLength={15}
              className="h-10 rounded-lg text-xs font-mono uppercase"
              defaultValue={currentGst}
            />
            <p className="text-[11px] text-neutral-500">
              15-character GSTIN or Trade ID. Leave blank if awaiting certification.
            </p>
          </div>
        </div>

        {/* Factory Physical Address */}
        <div className="space-y-1.5">
          <Label htmlFor="factory_address" className="text-xs font-semibold text-neutral-700">
            Factory / Workshop Address
          </Label>
          <Textarea
            id="factory_address"
            name="factory_address"
            rows={2}
            defaultValue={profile?.factory_address ?? ""}
            placeholder="Plot number, industrial area, road, or workshop cluster address..."
            className="rounded-lg text-xs"
          />
        </div>

        {/* City, State, Pincode */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="city" className="text-xs font-semibold text-neutral-700">
              City / Cluster
            </Label>
            <Input
              id="city"
              name="city"
              defaultValue={profile?.city ?? ""}
              placeholder="e.g. Ramanagara"
              className="h-10 rounded-lg text-xs"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="state" className="text-xs font-semibold text-neutral-700">
              State
            </Label>
            <Input
              id="state"
              name="state"
              defaultValue={profile?.state ?? ""}
              placeholder="e.g. Karnataka"
              className="h-10 rounded-lg text-xs"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pincode" className="text-xs font-semibold text-neutral-700">
              Pincode
            </Label>
            <Input
              id="pincode"
              name="pincode"
              defaultValue={profile?.pincode ?? ""}
              placeholder="562160"
              className="h-10 rounded-lg text-xs font-mono"
            />
          </div>
        </div>

        {/* Established Year & Description */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="established_year" className="text-xs font-semibold text-neutral-700">
              Established Year
            </Label>
            <Input
              id="established_year"
              name="established_year"
              type="number"
              min={1800}
              max={new Date().getFullYear()}
              defaultValue={profile?.established_year ?? ""}
              placeholder="e.g. 1998"
              className="h-10 rounded-lg text-xs font-mono"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="description" className="text-xs font-semibold text-neutral-700">
              Artisan Craft & Workshop Overview <span className="text-neutral-400 font-normal">(optional)</span>
            </Label>
            <Input
              id="description"
              name="description"
              defaultValue={
                profile?.description && !profile.description.startsWith("{")
                  ? profile.description
                  : ""
              }
              placeholder="Brief summary of artisan specialties, toy making technique, or heritage..."
              className="h-10 rounded-lg text-xs"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#F0F0EC] pt-4">
          <div className="flex items-center gap-2">
            <Button
              type="submit"
              disabled={isPending}
              className="h-9 rounded-lg bg-black px-5 text-xs font-semibold text-white transition-all hover:bg-neutral-800"
            >
              {isPending ? "Saving..." : "Save Details"}
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="h-9 rounded-lg border-[#E5E5E0] bg-white px-4 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
              >
                Cancel
              </Button>
            )}
          </div>

          <Button asChild variant="outline" size="sm" className="h-9 rounded-lg border-[#E5E5E0] text-xs">
            <Link href="/dashboard/documents" className="flex items-center gap-1.5">
              <span>Verification Documents</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </Button>
        </div>

        {profile?.status === "rejected" && profile.rejection_reason && (
          <div className="rounded-xl border border-rose-200 bg-rose-50/80 p-4 text-xs">
            <p className="font-semibold text-rose-800">Verification Changes Requested</p>
            <p className="mt-1 text-rose-700">{profile.rejection_reason}</p>
          </div>
        )}
      </form>

      {/* Standalone verification submission section (NOT nested in form) */}
      {canSubmitForReview && (
        <div className="rounded-xl border border-neutral-200 bg-neutral-50/80 p-4 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="font-semibold text-neutral-800">Ready for Verification?</p>
              <p className="text-neutral-500 mt-0.5">
                Once factory details and compliance documents are up to date, submit for review.
              </p>
            </div>
            <form action={submitForVerification}>
              <Button
                type="submit"
                variant="outline"
                className="h-9 rounded-lg border-black bg-white px-4 text-xs font-semibold text-black hover:bg-black hover:text-white"
              >
                Submit for Verification
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
