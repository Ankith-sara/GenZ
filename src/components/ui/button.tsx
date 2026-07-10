import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-[200] tracking-[0.15px] transition-colors disabled:pointer-events-none disabled:opacity-50 disabled:bg-[#f1f1f1] disabled:border-[#dadada] disabled:text-[#6c6a6a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer",
  {
    variants: {
      variant: {
        default: "bg-[#333333] text-white rounded-none hover:bg-black border border-[#333333] hover:border-black",
        ghost: "text-[#333333] hover:underline underline-offset-4 bg-transparent",
        outline:
          "border border-[#333333] text-[#333333] rounded-none bg-white hover:bg-black hover:text-white hover:border-black",
        pill: "rounded-[40px] border border-border bg-card text-foreground hover:border-foreground data-[active=true]:bg-foreground data-[active=true]:text-background data-[active=true]:border-foreground",
        link: "text-[#333333] underline underline-offset-4 hover:text-black hover:no-underline",
      },
      size: {
        default: "h-12 px-[23px]",
        sm: "h-9 px-[20px] text-xs",
        lg: "h-12 px-8 text-base",
        icon: "h-12 w-12",
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
