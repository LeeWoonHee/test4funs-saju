"use client";

import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import type { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";

export function Checkbox({ className, ...props }: ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={twMerge(
        "inline-flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-[7px] border border-slate/80 bg-saju-surface text-saju-surface hover:border-saju-accent focus-visible:outline-saju-accent disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-saju-accent data-[state=checked]:bg-saju-accent motion-safe:transition-[background-color,border-color,scale] motion-safe:enabled:active:scale-90",
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator className="flex items-center justify-center motion-safe:animate-saju-check">
        <Check aria-hidden size={14} strokeWidth={2.5} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}
