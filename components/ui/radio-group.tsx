"use client";

import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import type { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";

export function RadioGroup({ className, ...props }: ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      className={twMerge("relative isolate flex rounded-full border border-saju-line bg-saju-canvas p-1", className)}
      {...props}
    />
  );
}

export function RadioGroupItem({ className, children, ...props }: ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={twMerge(
        "relative flex min-h-11 min-w-0 flex-1 cursor-pointer items-center justify-center rounded-full px-3 text-sm font-medium text-saju-muted hover:text-saju-accent focus-visible:z-10 focus-visible:outline-saju-accent disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:font-semibold data-[state=checked]:text-saju-accent-hover motion-safe:transition-colors",
        className,
      )}
      {...props}
    >
      {children}
    </RadioGroupPrimitive.Item>
  );
}
