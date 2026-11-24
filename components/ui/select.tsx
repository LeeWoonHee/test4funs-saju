"use client";

import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { useId, useRef, useState, type ComponentProps, type FormEvent } from "react";

type SelectProps = Pick<ComponentProps<typeof SelectPrimitive.Root>, "name" | "required" | "defaultValue" | "disabled" | "children"> & {
  id?: string;
  label?: string;
  placeholder?: string;
};

export function Select({ id, label, placeholder, children, ...props }: SelectProps) {
  const trigger = useRef<HTMLButtonElement>(null);
  const errorId = useId();
  const [invalid, setInvalid] = useState(false);

  function handleInvalid(event: FormEvent<HTMLDivElement>) {
    event.preventDefault();
    setInvalid(true);
    if (event.currentTarget.closest("form")?.querySelector("select:invalid, input:invalid") === event.target) {
      requestAnimationFrame(() => trigger.current?.focus());
    }
  }

  return (
    <div className="min-w-0" onInvalid={handleInvalid}>
      <SelectPrimitive.Root {...props} onValueChange={() => setInvalid(false)}>
        <SelectPrimitive.Trigger
          ref={trigger}
          id={id}
          aria-label={label}
          aria-invalid={invalid || undefined}
          aria-describedby={invalid ? errorId : undefined}
          data-slot="select-trigger"
          className="group flex h-12 w-full min-w-0 cursor-pointer items-center justify-between gap-1.5 rounded-2xl border border-slate/80 bg-saju-surface px-2.5 text-left text-base text-saju-ink tabular-nums hover:border-saju-accent focus-visible:border-saju-accent focus-visible:outline-saju-accent disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-saju-accent data-placeholder:text-saju-muted data-[state=open]:border-saju-accent data-[state=open]:bg-saju-canvas motion-safe:transition-colors sm:px-3.5"
        >
          <SelectPrimitive.Value placeholder={placeholder} />
          <SelectPrimitive.Icon asChild>
            <ChevronDown aria-hidden size={15} className="shrink-0 text-saju-muted group-data-[state=open]:rotate-180 group-data-[state=open]:text-saju-accent motion-safe:transition-[rotate,color] motion-safe:duration-200" />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>
        <SelectPrimitive.Portal>
          <SelectPrimitive.Content
            data-slot="select-content"
            position="popper"
            sideOffset={6}
            collisionPadding={8}
            className="z-50 flex max-h-[min(16rem,var(--radix-select-content-available-height))] min-w-(--radix-select-trigger-width) origin-(--radix-select-content-transform-origin) flex-col overflow-hidden rounded-2xl border border-saju-line bg-saju-surface text-saju-ink shadow-card motion-safe:data-[state=open]:animate-saju-reveal"
          >
            <SelectPrimitive.ScrollUpButton className="flex items-center justify-center py-1 text-saju-muted">
              <ChevronUp aria-hidden size={15} />
            </SelectPrimitive.ScrollUpButton>
            <SelectPrimitive.Viewport className="min-h-0 p-1">{children}</SelectPrimitive.Viewport>
            <SelectPrimitive.ScrollDownButton className="flex items-center justify-center py-1 text-saju-muted">
              <ChevronDown aria-hidden size={15} />
            </SelectPrimitive.ScrollDownButton>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
      {invalid && <p id={errorId} className="mt-1 text-xs text-saju-accent-hover">선택해 주세요.</p>}
    </div>
  );
}

export function SelectItem({ children, ...props }: ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className="relative flex min-h-11 cursor-pointer items-center rounded-xl py-2 pr-7 pl-2 text-sm tabular-nums outline-none select-none data-disabled:pointer-events-none data-disabled:opacity-50 data-highlighted:bg-saju-accent-light data-highlighted:text-saju-accent-hover data-[state=checked]:font-semibold data-[state=checked]:text-saju-accent-hover motion-safe:transition-colors"
      {...props}
    >
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator className="absolute right-2 flex items-center">
        <Check aria-hidden size={14} />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  );
}
