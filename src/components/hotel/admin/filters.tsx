"use client";

import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/src/components/ui/popover";
import { useT } from "@/src/lib/hotel-store/i18n";
import { cn } from "@/src/lib/utils";
import { focusRing, hbtn } from "./ui";

export type FilterChip = { key: string; label: string; clear: () => void };

/** List filters behind one button: a badge counts the active ones, the panel applies changes live. */
export function FilterPopover({
  active,
  applyLabel,
  onClear,
  className,
  children,
}: {
  active: number;
  /** Footer button that closes the panel, e.g. "Show 8 rooms". */
  applyLabel: string;
  onClear: () => void;
  className?: string;
  children: React.ReactNode;
}) {
  const t = useT();
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "relative flex h-10 shrink-0 items-center gap-1.5 rounded-md border border-neutral-300 bg-white px-3 text-sm font-medium text-neutral-800 transition hover:border-sky-400",
            focusRing,
            "focus-visible:ring-offset-0",
            (open || active > 0) && "border-sky-500 bg-sky-50 text-sky-900",
            className
          )}
        >
          <SlidersHorizontal className="size-4" aria-hidden />
          <span className="sr-only sm:not-sr-only">{t("Filters")}</span>
          {active > 0 && (
            <span className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-sky-600 text-[11px] font-bold text-white">{active}</span>
          )}
        </button>
      </PopoverTrigger>
      {/* Scrolls inside itself on short screens instead of running off the bottom. */}
      <PopoverContent
        align="end"
        sideOffset={8}
        collisionPadding={16}
        className="flex max-h-(--radix-popover-content-available-height) w-[min(22rem,calc(100vw-2rem))] flex-col bg-white p-0"
      >
        <div className="min-h-0 space-y-4 overflow-y-auto p-4">{children}</div>
        <div className="flex items-center gap-3 border-t border-neutral-100 px-4 py-3">
          <button
            type="button"
            onClick={onClear}
            disabled={active === 0}
            className={cn("shrink-0 rounded-sm px-1 text-sm font-medium text-neutral-600 hover:text-sky-800 disabled:text-neutral-300", focusRing)}
          >
            {t("Clear all")}
          </button>
          <button type="button" onClick={() => setOpen(false)} className={cn(hbtn.primary, "flex-1 whitespace-nowrap px-3")}>
            {applyLabel}
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

/** One filter as tap-sized options that wrap and stretch to fill each row, so every choice stays visible and edges line up. */
export function ChoiceGroup<T extends string>({
  label,
  value,
  onChange,
  options,
  grid,
}: {
  label: string;
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
  /** Short, same-size options (like floor numbers) sit in an even grid instead of stretching. */
  grid?: boolean;
}) {
  const t = useT();
  return (
    <div role="group" aria-label={t(label)}>
      <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-neutral-500">{t(label)}</p>
      <div className={grid ? "grid grid-cols-[repeat(auto-fill,minmax(2.75rem,1fr))] gap-1.5" : "flex flex-wrap gap-1.5"}>
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            aria-pressed={value === o.value}
            onClick={() => onChange(o.value)}
            className={cn(
              "h-9 rounded-md border text-sm font-medium transition",
              grid ? "px-1" : "min-w-12 grow px-3",
              focusRing,
              "focus-visible:ring-offset-0",
              value === o.value ? "border-sky-600 bg-sky-600 text-white" : "border-neutral-200 bg-white text-neutral-700 hover:border-sky-300"
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Result count, one removable chip per active filter, and Clear all. */
export function FilterChips({ count, chips, onClear, className }: { count: number; chips: FilterChip[]; onClear: () => void; className?: string }) {
  const t = useT();
  return (
    <div className={cn("flex flex-wrap items-center gap-2 text-sm", className)}>
      <span className="text-neutral-700">
        <b className="font-semibold text-neutral-900">{count}</b> {count === 1 ? t("result") : t("results")}
      </span>
      {chips.map((c) => (
        <button
          key={c.key}
          type="button"
          onClick={c.clear}
          aria-label={`${t("Remove filter")} ${c.label}`}
          className={cn("inline-flex h-7 items-center gap-1 rounded-full bg-sky-50 pl-3 pr-2 text-[13px] font-medium text-sky-900 ring-1 ring-inset ring-sky-200 transition hover:bg-sky-100", focusRing)}
        >
          {c.label}
          <X className="size-3.5" aria-hidden />
        </button>
      ))}
      <button type="button" onClick={onClear} className={cn("rounded-sm font-medium text-neutral-600 hover:text-sky-800 hover:underline", focusRing)}>
        {t("Clear all")}
      </button>
    </div>
  );
}
