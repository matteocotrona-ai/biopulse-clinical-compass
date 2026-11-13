import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "group/btn relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-sm)] text-sm font-medium cursor-pointer select-none transition-[background,color,box-shadow,border-color,transform] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-40 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:transition-transform [&_svg]:duration-300",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-glow hover:bg-primary-glow hover:text-background hover:[&_svg]:translate-x-0.5",
        hero: "bg-foreground text-background hover:bg-primary-glow hover:shadow-glow hover:[&_svg]:translate-x-0.5 hover:[&_svg]:-translate-y-0.5",
        glass:
          "glass text-foreground hover:border-primary/50 hover:bg-accent hover:text-accent-foreground",
        outline:
          "border border-border-strong bg-transparent text-foreground hover:border-primary/60 hover:bg-primary/10",
        secondary:
          "bg-secondary text-secondary-foreground border border-border hover:bg-surface-raised",
        destructive:
          "border border-destructive/40 bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground",
        ghost: "text-muted-foreground hover:bg-secondary hover:text-foreground",
        link: "rounded-none px-0 text-primary-glow underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-5",
        sm: "h-8 px-3.5 text-xs",
        lg: "h-12 px-7 text-[0.9375rem]",
        icon: "h-10 w-10",
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
