"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  saveManufacturerProfile,
  submitForVerification,
  type ProfileFormState,
} from "./actions";
import type { ManufacturerProfile } from "@/types/database";

export function OnboardingForm({ profile }: { profile: ManufacturerProfile | null }) {
  const [state, formAction, isPending] = useActionState<ProfileFormState, FormData>(
    saveManufacturerProfile,
    {}
  );

  const canSubmitForReview =
    !!profile && (profile.status === "not_submitted" || profile.status === "rejected");

  return (
    <form action={formAction} noValidate>
      <div className="mb-4">
        <Label htmlFor="business_name">Business name</Label>
        <Input
          id="business_name"
          name="business_name"
          required
          defaultValue={profile?.business_name ?? ""}
        />
      </div>

      <div className="mb-4">
        <Label htmlFor="gst_number">GSTIN</Label>
        <Input
          id="gst_number"
          name="gst_number"
          required
          placeholder="22AAAAA0000A1Z5"
          maxLength={15}
          className="uppercase"
          defaultValue={profile?.gst_number ?? ""}
        />
        <p className="text-muted-foreground mt-1.5 text-xs">
          15-character GST Identification Number.
        </p>
      </div>

      <div className="mb-4">
        <Label htmlFor="factory_address">Factory address</Label>
        <Textarea
          id="factory_address"
          name="factory_address"
          rows={2}
          defaultValue={profile?.factory_address ?? ""}
        />
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <Label htmlFor="city">City</Label>
          <Input id="city" name="city" defaultValue={profile?.city ?? ""} />
        </div>
        <div>
          <Label htmlFor="state">State</Label>
          <Input id="state" name="state" defaultValue={profile?.state ?? ""} />
        </div>
        <div>
          <Label htmlFor="pincode">Pincode</Label>
          <Input id="pincode" name="pincode" defaultValue={profile?.pincode ?? ""} />
        </div>
      </div>

      <div className="mb-4">
        <Label htmlFor="established_year">Established year</Label>
        <Input
          id="established_year"
          name="established_year"
          type="number"
          min={1900}
          max={new Date().getFullYear()}
          defaultValue={profile?.established_year ?? ""}
        />
      </div>

      <div className="mb-2">
        <Label htmlFor="description">
          What do you make? <span className="text-muted-foreground">(optional)</span>
        </Label>
        <Textarea
          id="description"
          name="description"
          rows={4}
          defaultValue={profile?.description ?? ""}
        />
      </div>

      {state?.error && (
        <p role="alert" className="text-destructive mt-2 mb-4 text-sm">
          {state.error}
        </p>
      )}
      {state?.success && (
        <p role="status" className="mt-2 mb-4 text-sm text-[#2f5c3a]">
          Saved.
        </p>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving…" : "Save details"}
        </Button>
        <Button asChild variant="outline">
          <Link href="/dashboard/manufacturer/documents">Upload documents →</Link>
        </Button>
      </div>

      {profile?.status === "rejected" && profile.rejection_reason && (
        <div className="border-destructive/40 bg-destructive/5 mt-6 rounded-[4px] border p-4 text-sm">
          <p className="text-destructive font-medium">Changes requested</p>
          <p className="text-foreground mt-1">{profile.rejection_reason}</p>
        </div>
      )}

      {canSubmitForReview && <SubmitForReview />}
    </form>
  );
}

function SubmitForReview() {
  return (
    <div className="border-border mt-6 border-t pt-6">
      <p className="text-muted-foreground mb-3 text-sm">
        Once your details and documents are ready, submit for admin review.
      </p>
      <SubmitButton />
    </div>
  );
}

function SubmitButton() {
  return (
    <form action={submitForVerification}>
      <Button type="submit" variant="outline">
        Submit for Verification
      </Button>
    </form>
  );
}
