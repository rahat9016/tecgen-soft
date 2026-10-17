"use client";

import {
  get,
  useController,
  useFormContext,
  useFormState,
} from "react-hook-form";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { Card, labelClass } from "../ui";
import type { BookingFormValues } from "./schema";

/** Numbered card with an icon header; `id` lets a failed submit scroll to it. */
export function Section({
  id,
  step,
  icon: Icon,
  title,
  sub,
  aside,
  children,
}: {
  id: string;
  step: number;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  sub?: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section id={`bf-${id}`} className="scroll-mt-24">
      <Card className="p-0">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="relative flex size-9 shrink-0 items-center justify-center rounded-md bg-sky-50 text-sky-600">
              <Icon className="size-4.5" />
              <span className="absolute -right-1.5 -top-1.5 flex size-4 items-center justify-center rounded-full bg-sky-600 text-[10px] font-bold text-white">
                {step}
              </span>
            </span>
            <div>
              <h2 className="font-semibold text-neutral-900">{title}</h2>
              {sub && <p className="text-xs text-neutral-500">{sub}</p>}
            </div>
          </div>
          {aside}
        </div>
        <div className="p-5">{children}</div>
      </Card>
    </section>
  );
}

export function FieldError({ name }: { name: string }) {
  const { errors } = useFormState();
  const message = get(errors, name)?.message as string | undefined;
  return message ? (
    <p role="alert" className="mt-1 text-xs text-rose-600">
      {message}
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
  label: string;
  name?: string;
  hint?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  const { errors } = useFormState();
  const hasError = !!(name && get(errors, name));
  return (
    <div className={className}>
      <span className={labelClass}>{label}</span>
      {children}
      {name && <FieldError name={name} />}
      {hint && !hasError && (
        <span className="mt-1 block text-[11px] text-neutral-400">{hint}</span>
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
}: {
  name: "adults" | "children" | `lines.${number}.rooms`;
  min?: number;
  max?: number;
  label: string;
}) {
  const { control } = useFormContext<BookingFormValues>();
  const {
    field: { ref, name: fieldName, value: raw, onChange, onBlur },
    fieldState,
  } = useController({ control, name });
  const value = Number(raw) || 0;
  const set = (n: number) => onChange(Math.min(max, Math.max(min, n)));
  const btn =
    "flex size-10 shrink-0 items-center justify-center text-neutral-500 transition hover:bg-neutral-50 hover:text-sky-700 disabled:opacity-30 disabled:hover:bg-transparent";
  return (
    <div
      className={cn(
        "flex h-10 items-center overflow-hidden rounded-md border bg-white",
        fieldState.error ? "border-rose-400" : "border-neutral-200"
      )}
    >
      <button
        type="button"
        onClick={() => set(value - 1)}
        disabled={value <= min}
        aria-label={`Fewer ${label}`}
        className={btn}
      >
        <Minus className="size-4" />
      </button>
      <input
        ref={ref}
        name={fieldName}
        inputMode="numeric"
        value={value}
        onChange={(e) => set(Number(e.target.value.replace(/\D/g, "")) || 0)}
        onBlur={onBlur}
        aria-label={label}
        className="h-full w-full min-w-0 border-x border-neutral-100 text-center text-sm font-semibold tabular-nums outline-none"
      />
      <button
        type="button"
        onClick={() => set(value + 1)}
        disabled={value >= max}
        aria-label={`More ${label}`}
        className={btn}
      >
        <Plus className="size-4" />
      </button>
    </div>
  );
}

/** Pill toggle for a handful of options. */
export function Segmented<T extends string>({
  value,
  onChange,
  options,
  className,
}: {
  value: T;
  onChange: (v: T) => void;
  options: {
    value: T;
    label: React.ReactNode;
    icon?: React.ComponentType<{ className?: string }>;
  }[];
  className?: string;
}) {
  return (
    <div
      role="radiogroup"
      className={cn(
        "inline-flex gap-1 rounded-md bg-neutral-100 p-1 text-xs font-medium",
        className
      )}
    >
      {options.map(({ value: v, label, icon: Icon }) => (
        <button
          key={v}
          type="button"
          role="radio"
          aria-checked={value === v}
          onClick={() => onChange(v)}
          className={cn(
            "inline-flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-md px-3 py-1.5 transition",
            value === v
              ? "bg-white text-sky-700 shadow-sm"
              : "text-neutral-600 hover:text-neutral-900"
          )}
        >
          {Icon && <Icon className="size-3.5" />}
          {label}
        </button>
      ))}
    </div>
  );
}
