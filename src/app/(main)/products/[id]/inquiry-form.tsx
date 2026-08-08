"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/atoms/button";
import { Input } from "@/components/ui/atoms/input";
import { Label } from "@/components/ui/atoms/label";
import { Textarea } from "@/components/ui/atoms/textarea";
import { submitInquiry, type InquiryFormState } from "./inquiry-actions";

export function InquiryForm({
  productId,
  sellerId,
  productName,
}: {
  productId: string;
  sellerId: string;
  productName: string;
}) {
  const action = submitInquiry.bind(null, productId, sellerId);
  const [state, formAction, isPending] = useActionState<InquiryFormState, FormData>(
    action,
    {}
  );

  if (state?.success) {
    return (
      <div className="border-border bg-card rounded-[4px] border p-6">
        <p className="font-medium">Message sent</p>
        <p className="text-muted-foreground mt-1 text-sm">
          The seller will get back to you directly at the email you provided.
        </p>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      className="border-border bg-card rounded-[4px] border p-6"
    >
      <p className="font-medium">Ask about this product</p>
      <p className="text-muted-foreground mt-1 mb-4 text-sm">
        Send {productName}&apos;s seller a question — bulk orders, customization, lead
        times, anything.
      </p>

      <div className="mb-3">
        <Label htmlFor="inquiry-name">Name</Label>
        <Input id="inquiry-name" name="name" required />
      </div>
      <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor="inquiry-email">Email</Label>
          <Input id="inquiry-email" name="email" type="email" required />
        </div>
        <div>
          <Label htmlFor="inquiry-phone">Phone (optional)</Label>
          <Input id="inquiry-phone" name="phone" type="tel" />
        </div>
      </div>
      <div className="mb-4">
        <Label htmlFor="inquiry-message">Message</Label>
        <Textarea id="inquiry-message" name="message" rows={4} required />
      </div>

      {state?.error && (
        <p role="alert" className="text-destructive mb-4 text-sm">
          {state.error}
        </p>
      )}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Sending…" : "Send inquiry"}
      </Button>
    </form>
  );
}
