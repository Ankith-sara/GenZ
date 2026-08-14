import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@genz/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wider uppercase transition-colors",
  {
    variants: {
      variant: {
        default: "border-neutral-300 text-neutral-800 bg-neutral-100/80",
        pending: "border-amber-400/50 text-amber-900 bg-amber-50 shadow-2xs",
        verified: "border-emerald-400/50 text-emerald-900 bg-emerald-50 shadow-2xs",
        rejected: "border-red-300 text-red-800 bg-red-50 shadow-2xs",
        not_submitted: "border-neutral-300 text-neutral-500 bg-neutral-50",
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
