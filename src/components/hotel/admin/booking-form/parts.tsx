"use client";

import { useId, useState } from "react";
import {
  get,
  useController,
  useFormContext,
  useFormState,
} from "react-hook-form";
import { ChevronDown, Minus, Plus } from "lucide-react";
import { useT } from "@/src/lib/hotel-store/i18n";
import { cn } from "@/src/lib/utils";
import { Card } from "../ui";
import type { BookingFormValues } from "./schema";

/** Translates plain-text labels; anything richer (JSX) is passed through as is. */
const tx = (t: ReturnType<typeof useT>, node: React.ReactNode) => (typeof node === "string" ? t(node) : node);

/** Keyboard focus ring shared by the form's custom controls. */
export const focusRing =
  "outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-1";

/** Field label: darker and heavier than hint text so labels scan quickly. */
export const fieldLabel =
  "mb-1.5 block text-[13px] font-medium text-neutral-800";

/** Numbered form section; `id` lets a failed submit scroll to it. */
export function Section({
  id,
  step,
  title,
  sub,
  aside,
  children,
}: {
  id: string;
  step: number;
  title: string;
  sub?: React.ReactNode;
  aside?: React.ReactNode;
  children: React.ReactNode;
}) {
  const t = useT();
  return (
    <section
      id={`bf-${id}`}
      aria-labelledby={`bf-${id}-title`}
      className="scroll-mt-24"
    >
      <Card className="p-0">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-neutral-100 px-4 py-3 sm:px-5">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-sky-600 text-xs font-bold text-white">
              {step}
            </span>
            <h2
              id={`bf-${id}-title`}
              className="text-[15px] font-semibold text-neutral-900"
            >
              {t(title)}
            </h2>
            {sub && (
              <span className="hidden truncate text-xs text-neutral-500 sm:inline">
                {tx(t, sub)}
              </span>
            )}
          </div>
          {aside}
        </div>
        <div className="p-4 sm:p-5">{children}</div>
      </Card>
    </section>
  );
}

/** Collapsed-by-default area for optional details; `forceOpen` reveals it when its fields become required or invalid. */
export function Disclosure({
  title,
  summary,
  defaultOpen = false,
  forceOpen = false,
  className,
  children,
}: {
  title: string;
  /** Short note of what's filled in, shown while collapsed. */
  summary?: React.ReactNode;
  defaultOpen?: boolean;
  forceOpen?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  const t = useT();
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();
  const shown = open || forceOpen;
  return (
    <div className={cn("rounded-md border border-neutral-200", className)}>
      <button
        type="button"
        aria-expanded={shown}
        aria-controls={id}
        onClick={() => setOpen(!shown)}
        className={cn(
          "flex w-full items-center justify-between gap-3 rounded-md px-3.5 py-2.5 text-left text-sm font-medium text-neutral-800 transition hover:bg-neutral-50",
          focusRing
        )}
      >
        <span className="flex min-w-0 items-center gap-2">
          {t(title)}
          {!shown && summary && (
            <span className="truncate text-xs font-normal text-neutral-500">
              {tx(t, summary)}
            </span>
          )}
        </span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-neutral-500 transition",
            shown && "rotate-180"
          )}
        />
      </button>
      {shown && (
        <div id={id} className="border-t border-neutral-100 px-3.5 py-4">
          {children}
        </div>
      )}
    </div>
  );
}

export function FieldError({ name }: { name: string }) {
  const t = useT();
  const { errors } = useFormState();
  const message = get(errors, name)?.message as string | undefined;
  return message ? (
    <p role="alert" className="mt-1 text-xs font-medium text-rose-600">
      {t(message)}
    </p>
  ) : null;
}

/** Label + control + hint, with the field's validation error underneath. */
export function FormField({
  label,
  name,
  hint,
  className,
  children,
}: {
  label: React.ReactNode;
  name?: string;
  hint?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  const t = useT();
  const { errors } = useFormState();
  const hasError = !!(name && get(errors, name));
  return (
    <div className={className}>
      <span className={fieldLabel}>{tx(t, label)}</span>
      {children}
      {name && <FieldError name={name} />}
      {hint && !hasError && (
        <span className="mt-1 block text-xs text-neutral-500">{tx(t, hint)}</span>
      )}
    </div>
  );
}

/** Red border for native inputs registered with `register`. */
export function useErrorClass(name: string) {
  const { errors } = useFormState();
  return get(errors, name)
    ? "border-rose-400 focus:border-rose-500 focus:ring-rose-100"
    : "";
}

/** − value + counter for small whole numbers. */
export function Stepper({
  name,
  min = 0,
  max = 99,
  label,
  size = "md",
}: {
  name:
    | "adults"
    | "children"
    | "extraBeds"
    | `lines.${number}.rooms`
    | `lines.${number}.party.adults`
    | `lines.${number}.party.children`;
  min?: number;
  max?: number;
  label: string;
  size?: "sm" | "md";
}) {
  const t = useT();
  const { control } = useFormContext<BookingFormValues>();
  const {
    field: { ref, name: fieldName, value: raw, onChange, onBlur },
    fieldState,
  } = useController({ control, name });
  const value = Number(raw) || 0;
  const set = (n: number) => onChange(Math.min(max, Math.max(min, n)));
  const btn = cn(
    "flex shrink-0 items-center justify-center text-neutral-600 transition hover:bg-neutral-50 hover:text-sky-700 disabled:opacity-30 disabled:hover:bg-transparent",
    size === "sm" ? "size-8" : "size-10",
    focusRing
  );
  return (
    <div
      className={cn(
        "flex items-center overflow-hidden rounded-md border bg-white",
        size === "sm" ? "h-8" : "h-10",
        fieldState.error ? "border-rose-400" : "border-neutral-200"
      )}
    >
      <button
        type="button"
        onClick={() => set(value - 1)}
        disabled={value <= min}
        aria-label={`${t("Fewer")} ${t(label)}`}
        className={btn}
      >
        <Minus className="size-3.5" />
      </button>
      <input
        ref={ref}
        name={fieldName}
        inputMode="numeric"
        value={value}
        onChange={(e) => set(Number(e.target.value.replace(/\D/g, "")) || 0)}
        onBlur={onBlur}
        aria-label={t(label)}
        className="h-full w-full min-w-0 border-x border-neutral-100 text-center text-sm font-semibold tabular-nums outline-none focus-visible:bg-sky-50"
      />
      <button
        type="button"
        onClick={() => set(value + 1)}
        disabled={value >= max}
        aria-label={`${t("More")} ${t(label)}`}
        className={btn}
      >
        <Plus className="size-3.5" />
      </button>
    </div>
  );
}

/** Compact segmented control for a handful of options; arrow keys move the choice. */
export function Segmented<T extends string>({
  value,
  onChange,
  options,
  label,
  className,
}: {
  value: T;
  onChange: (v: T) => void;
  options: {
    value: T;
    label: React.ReactNode;
    icon?: React.ComponentType<{ className?: string }>;
    disabled?: boolean;
  }[];
  label?: string;
  className?: string;
}) {
  const t = useT();
  const enabled = options.filter((o) => !o.disabled);
  const move = (dir: 1 | -1) => {
    const i = enabled.findIndex((o) => o.value === value);
    const next = enabled[(i + dir + enabled.length) % enabled.length];
    if (next) onChange(next.value);
  };
  return (
    <div
      role="radiogroup"
      aria-label={label && t(label)}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight" || e.key === "ArrowDown") {
          e.preventDefault();
          move(1);
        } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
          e.preventDefault();
          move(-1);
        }
      }}
      className={cn(
        "inline-flex h-9 gap-0.5 rounded-md border border-neutral-200 bg-neutral-50 p-0.5 text-[13px] font-medium",
        className
      )}
    >
      {options.map(({ value: v, label: text, icon: Icon, disabled }) => {
        const on = value === v;
        return (
          <button
            key={v}
            type="button"
            role="radio"
            aria-checked={on}
            tabIndex={on ? 0 : -1}
            disabled={disabled}
            onClick={() => onChange(v)}
            className={cn(
              "inline-flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded px-3 transition disabled:cursor-not-allowed disabled:opacity-40",
              on
                ? "bg-sky-600 text-white shadow-sm"
                : "text-neutral-700 hover:bg-white hover:text-neutral-900",
              focusRing
            )}
          >
            {Icon && <Icon className="size-4" />}
            {tx(t, text)}
          </button>
        );
      })}
    </div>
  );
}
