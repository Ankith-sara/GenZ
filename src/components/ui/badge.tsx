import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium",
  {
    variants: {
      variant: {
        default: "border-foreground text-foreground bg-transparent",
        pending: "border-[#8a6d1c] text-[#8a6d1c] bg-[#f1f29f]/40",
        verified: "border-[#2f5c3a] text-[#2f5c3a] bg-[#e4efe1]",
        rejected: "border-destructive text-destructive bg-destructive/5",
        not_submitted: "border-muted-foreground text-muted-foreground bg-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
