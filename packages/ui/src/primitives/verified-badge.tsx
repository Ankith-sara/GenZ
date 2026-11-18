import { ShieldCheck } from "lucide-react";
import { Badge } from "./badge";

export function VerifiedBadge({ className = "" }: { className?: string }) {
  return (
    <Badge variant="verified" className={className}>
      <ShieldCheck className="h-3 w-3" aria-hidden="true" />
      GST Verified
    </Badge>
  );
}
