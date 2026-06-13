import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium cursor-pointer transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed active:translate-y-px [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "relative bg-primary text-primary-foreground shadow-[0_1px_0_0_rgb(255_255_255/0.25)_inset,0_-1px_0_0_rgb(0_0_0/0.15)_inset,0_4px_12px_-2px_color-mix(in_oklab,var(--primary)_50%,transparent)] hover:shadow-[0_1px_0_0_rgb(255_255_255/0.3)_inset,0_-1px_0_0_rgb(0_0_0/0.15)_inset,0_8px_24px_-4px_color-mix(in_oklab,var(--primary)_70%,transparent),0_0_32px_-8px_var(--primary)] hover:brightness-110",
        premium:
          "relative text-primary-foreground rounded-xl bg-[linear-gradient(180deg,color-mix(in_oklab,white_18%,var(--primary)),var(--primary))] shadow-[0_1px_0_0_rgb(255_255_255/0.4)_inset,0_-1px_0_0_rgb(0_0_0/0.2)_inset,0_8px_20px_-4px_color-mix(in_oklab,var(--primary)_55%,transparent),0_0_0_1px_color-mix(in_oklab,var(--primary)_60%,transparent)] hover:shadow-[0_1px_0_0_rgb(255_255_255/0.45)_inset,0_-1px_0_0_rgb(0_0_0/0.2)_inset,0_12px_36px_-6px_color-mix(in_oklab,var(--primary)_75%,transparent),0_0_48px_-8px_var(--primary),0_0_0_1px_color-mix(in_oklab,var(--primary)_80%,transparent)] hover:brightness-110 before:absolute before:inset-x-3 before:top-px before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-white/10 bg-white/[0.04] backdrop-blur-md shadow-[0_1px_0_0_rgb(255_255_255/0.06)_inset] hover:bg-white/[0.08] hover:border-primary/40 hover:text-foreground hover:shadow-[0_1px_0_0_rgb(255_255_255/0.1)_inset,0_0_24px_-8px_var(--primary)]",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
