import * as React from "react";

import { cn } from "@/lib/utils";

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "group relative overflow-hidden rounded-3xl border border-white/[0.06] text-card-foreground transition-all duration-500",
        "bg-[linear-gradient(180deg,color-mix(in_oklab,white_5%,transparent),transparent_55%),color-mix(in_oklab,var(--card)_55%,transparent)]",
        "backdrop-blur-2xl backdrop-saturate-150",
        "shadow-[0_1px_0_0_rgb(255_255_255/0.10)_inset,0_0_0_1px_rgb(255_255_255/0.03)_inset,0_2px_4px_rgb(0_0_0/0.2),0_24px_60px_-20px_rgb(0_0_0/0.6)]",
        "hover:border-primary/30 hover:-translate-y-0.5",
        "hover:shadow-[0_1px_0_0_rgb(255_255_255/0.14)_inset,0_0_0_1px_color-mix(in_oklab,var(--primary)_22%,transparent)_inset,0_4px_8px_rgb(0_0_0/0.25),0_32px_80px_-20px_rgb(0_0_0/0.7),0_0_60px_-10px_color-mix(in_oklab,var(--primary)_35%,transparent)]",
        "before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-primary/40 before:to-transparent",
        "after:pointer-events-none after:absolute after:-right-20 after:-top-20 after:size-56 after:rounded-full after:bg-primary/10 after:blur-3xl after:opacity-0 after:transition-opacity after:duration-500 group-hover:after:opacity-100",
        className,
      )}
      {...props}
    />
  ),
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
  ),
);
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("font-semibold leading-none tracking-tight", className)}
      {...props}
    />
  ),
);
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
  ),
);
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
  ),
);
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
  ),
);
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
