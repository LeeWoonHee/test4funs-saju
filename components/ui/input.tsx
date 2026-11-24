import type { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";

export function Input({ className, type, ...props }: ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={twMerge(
        "block h-12 w-full min-w-0 rounded-2xl border border-slate/80 bg-saju-surface px-3.5 text-base text-saju-ink tabular-nums hover:border-saju-accent focus:border-saju-accent focus:bg-saju-canvas focus-visible:outline-saju-accent disabled:cursor-not-allowed disabled:opacity-50 motion-safe:transition-colors",
        className,
      )}
      {...props}
    />
  );
}
