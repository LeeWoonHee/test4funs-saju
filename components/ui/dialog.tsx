"use client";

import { useRef } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

export function Modal({
  open, onOpenChange, title, description, children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  const returnFocus = useRef<HTMLElement>(null);
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-charcoal/55 backdrop-blur-[2px]" />
        <Dialog.Content
          onOpenAutoFocus={() => { returnFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null; }}
          onCloseAutoFocus={(event) => {
            if (returnFocus.current?.isConnected) {
              event.preventDefault();
              returnFocus.current.focus();
            }
          }}
          className="fixed top-1/2 left-1/2 z-50 max-h-[90dvh] w-[calc(100%-2rem)] max-w-md -translate-1/2 overflow-y-auto rounded-[10px] border border-frost bg-paper-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.16)] sm:p-8">
          <Dialog.Title className="pr-9 text-2xl font-semibold tracking-[-0.02em] text-ink-black">{title}</Dialog.Title>
          <Dialog.Description className="mt-2.5 text-sm leading-6 text-smoke">{description}</Dialog.Description>
          <Dialog.Close aria-label="닫기" className="absolute top-5 right-5 flex size-9 cursor-pointer items-center justify-center rounded-full border border-frost bg-paper-white text-graphite transition-colors hover:bg-linen-cream hover:text-ink-black">
            <X size={17} />
          </Dialog.Close>
          <div className="mt-6">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
