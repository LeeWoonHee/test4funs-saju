import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { twMerge } from "tailwind-merge";
import type { ComponentProps } from "react";

const buttonVariants = cva(
  "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full font-semibold focus-visible:outline-saju-accent disabled:cursor-not-allowed disabled:opacity-45 motion-safe:transition-[background-color,border-color,color,box-shadow,scale] motion-safe:duration-200 motion-safe:enabled:active:scale-[0.98] [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-saju-accent text-saju-surface shadow-sm shadow-saju-accent/20 enabled:hover:bg-saju-accent-hover enabled:hover:shadow-md enabled:hover:shadow-saju-accent/25 enabled:active:bg-saju-accent-hover",
        secondary: "bg-saju-accent-light text-saju-ink hover:bg-primary-hover active:bg-primary-active",
        outline: "border border-slate/80 bg-saju-surface text-saju-ink hover:border-saju-accent hover:bg-saju-canvas active:bg-saju-canvas",
        ghost: "text-graphite hover:bg-linen-cream hover:text-ink-black",
        danger: "bg-[#a62626] text-paper-white shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:bg-[#8c1f1f]",
      },
      size: {
        default: "min-h-11 px-4 py-2 text-sm",
        lg: "min-h-12 px-6 py-2.5 text-[15px]",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

type ButtonProps = ComponentProps<"button"> & VariantProps<typeof buttonVariants> & { asChild?: boolean };

export function Button({ asChild, className, variant, size, type, ...props }: ButtonProps) {
  const Component = asChild ? Slot : "button";
  return (
    <Component
      data-slot="button"
      className={twMerge(buttonVariants({ variant, size }), className)}
      type={asChild ? undefined : type ?? "button"}
      {...props}
    />
  );
}
