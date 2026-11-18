"use client";

import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";

import { cn } from "@genz/utils";

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, children, ...props }, ref) => {
  const formattedChildren = React.useMemo(() => {
    if (typeof children === "string" && children.includes("*")) {
      const parts = children.split("*");
      return (
        <>
          {parts[0]}
          <span className="ml-0.5 font-bold text-red-500">*</span>
          {parts.slice(1).join("*")}
        </>
      );
    }
    return children;
  }, [children]);

  return (
    <LabelPrimitive.Root
      ref={ref}
      className={cn(
        "text-muted-foreground mb-1.5 block text-xs peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className
      )}
      {...props}
    >
      {formattedChildren}
    </LabelPrimitive.Root>
  );
});
Label.displayName = LabelPrimitive.Root.displayName;

export { Label };
