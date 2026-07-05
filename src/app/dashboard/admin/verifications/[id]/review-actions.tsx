"use client";

import { useActionState, useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { approveManufacturer, rejectManufacturer, type ReviewState } from "../actions";
import type { VerificationStatus } from "@/types/database";

export function ReviewActions({
  manufacturerId,
  status,
}: {
  manufacturerId: string;
  status: VerificationStatus;
}) {
  const [showReject, setShowReject] = useState(false);
  const [state, formAction, isPending] = useActionState<ReviewState, FormData>(
    rejectManufacturer,
    {}
  );

  if (status === "verified") {
    return (
      <p className="text-muted-foreground mt-8 text-sm">
        This manufacturer is verified. No action needed.
      </p>
    );
  }

  return (
    <div className="border-border mt-8 border-t pt-8">
      <div className="flex flex-wrap gap-3">
        <form action={approveManufacturer.bind(null, manufacturerId)}>
          <Button type="submit">
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            Approve
          </Button>
        </form>
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowReject((s) => !s)}
        >
          <XCircle className="h-4 w-4" aria-hidden="true" />
          Request Changes
        </Button>
      </div>

      {showReject && (
        <form action={formAction} className="mt-4 max-w-md">
          <input type="hidden" name="manufacturerId" value={manufacturerId} />
          <Textarea
            name="reason"
            rows={3}
            placeholder="What needs to change before this can be approved?"
            required
          />
          {state?.error && (
            <p role="alert" className="text-destructive mt-2 text-sm">
              {state.error}
            </p>
          )}
          <Button type="submit" variant="outline" className="mt-3" disabled={isPending}>
            {isPending ? "Sending…" : "Send back for changes"}
          </Button>
        </form>
      )}
    </div>
  );
}
