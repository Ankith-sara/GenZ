import * as React from "react";

import { cn } from "@genz/utils";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "border-input bg-card text-foreground placeholder:text-muted-foreground focus-visible:ring-foreground flex min-h-24 w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-sm focus-visible:ring-2 focus-visible:ring-amber-500/30 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
