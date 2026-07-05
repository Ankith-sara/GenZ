import { ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

/**
 * Every product that can ever be published belongs to a manufacturer whose
 * `manufacturer_profiles.status` is `verified` — that's enforced at the
 * Postgres RLS level on the `products` insert policy, not just the UI. So
 * this badge doesn't need to re-check status per product; it's a visual
 * surface for an invariant the database already guarantees.
 */
export function VerifiedBadge({ className = "" }: { className?: string }) {
  return (
    <Badge variant="verified" className={className}>
      <ShieldCheck className="h-3 w-3" aria-hidden="true" />
      GST Verified
    </Badge>
  );
}
