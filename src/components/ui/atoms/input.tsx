import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "bg-card text-foreground placeholder:text-muted-foreground aria-invalid:border-destructive flex h-11 w-full rounded-xl border border-neutral-300 px-4 py-2.5 text-sm shadow-2xs transition-all duration-200 focus:shadow-xs focus-visible:border-amber-500 focus-visible:ring-2 focus-visible:ring-amber-500/30 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
