import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-semibold tracking-wide transition-all duration-200 ease-out disabled:pointer-events-none disabled:opacity-50 disabled:bg-[#f1f1f1] disabled:border-[#dadada] disabled:text-[#6c6a6a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 focus-visible:ring-offset-2 active:scale-[0.98] active:translate-y-[0.5px] [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-[#18181b] text-white rounded-xl hover:bg-black border border-[#18181b] hover:border-black shadow-xs hover:shadow-md",
        ghost: "text-neutral-800 hover:bg-neutral-100 hover:text-black bg-transparent",
        outline:
          "border border-neutral-300 text-neutral-900 rounded-xl bg-white hover:bg-neutral-900 hover:text-white hover:border-neutral-900 shadow-2xs hover:shadow-sm",
        pill: "rounded-full border border-border bg-card text-foreground hover:border-foreground data-[active=true]:bg-foreground data-[active=true]:text-background data-[active=true]:border-foreground",
        link: "text-neutral-900 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-5 text-xs uppercase tracking-[0.05em]",
        sm: "h-9 px-4 text-xs font-semibold",
        lg: "h-12 px-8 text-sm uppercase tracking-[0.06em]",
        icon: "h-10 w-10 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
