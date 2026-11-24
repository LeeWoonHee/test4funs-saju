import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { twMerge } from "tailwind-merge";
import type { ComponentProps } from "react";

const buttonVariants = cva(
  "inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-[20px] px-6 py-2.5 text-sm font-semibold transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-45 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-sunlit-yellow text-ink-black shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:bg-primary-hover active:bg-primary-active",
        secondary: "bg-charcoal text-paper-white hover:bg-midnight-navy active:bg-[#132949]",
        outline: "border border-ink-black/80 bg-paper-white text-ink-black hover:bg-soft-vellum active:bg-linen-cream",
        ghost: "text-graphite hover:bg-linen-cream hover:text-ink-black",
        danger: "bg-[#a62626] text-paper-white shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:bg-[#8c1f1f]",
      },
    },
    defaultVariants: { variant: "primary" },
  },
);

type ButtonProps = ComponentProps<"button"> & VariantProps<typeof buttonVariants> & { asChild?: boolean };

export function Button({ asChild, className, variant, type, ...props }: ButtonProps) {
  const Component = asChild ? Slot : "button";
  return (
    <Component
      className={twMerge(buttonVariants({ variant }), className)}
      type={asChild ? undefined : type ?? "button"}
      {...props}
    />
  );
}
