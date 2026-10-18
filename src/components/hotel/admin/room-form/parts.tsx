"use client";

import { CircleAlert } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { Card, inputClass } from "../ui";

/** inputClass with a stronger border and a red state for fields with an error. */
export const ctl = (invalid?: boolean) =>
  cn(inputClass, "border-neutral-300 text-neutral-900 placeholder:text-neutral-400", invalid && "border-rose-500 focus:border-rose-500 focus:ring-rose-100");

export const focusRing = "outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2";

export function Section({ id, title, sub, children, className }: { id?: string; title: string; sub?: string; children: React.ReactNode; className?: string }) {
  return (
    <Card className={cn("p-0", className)}>
      <section id={id} aria-labelledby={id ? `${id}-title` : undefined} className="p-4 sm:p-5">
        <header className="mb-4">
          <h2 id={id ? `${id}-title` : undefined} className="text-base font-semibold text-neutral-900">
            {title}
          </h2>
          {sub && <p className="mt-0.5 text-sm text-neutral-600">{sub}</p>}
        </header>
        {children}
      </section>
    </Card>
  );
}

export function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1.5 flex items-start gap-1 text-xs font-medium text-rose-700">
      <CircleAlert className="mt-px size-3.5 shrink-0" aria-hidden />
      {message}
    </p>
  );
}

/** Label, required/optional marker, the control, then either its error or its hint. */
export function Field({
  id,
  label,
  required,
  hint,
  error,
  className,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  hint?: React.ReactNode;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 flex items-baseline gap-1 text-sm font-medium text-neutral-800">
        {label}
        {required ? (
          <span className="text-rose-600" aria-hidden>
            *
          </span>
        ) : (
          <span className="text-xs font-normal text-neutral-500">(optional)</span>
        )}
      </label>
      {children}
      {error ? <FieldError id={`${id}-error`} message={error} /> : hint && <p id={`${id}-hint`} className="mt-1.5 text-xs text-neutral-600">{hint}</p>}
    </div>
  );
}

/** aria props tying an input to its error or hint. */
export const described = (id: string, error?: string, hasHint?: boolean) => ({
  id,
  "aria-invalid": error ? true : undefined,
  "aria-describedby": error ? `${id}-error` : hasHint ? `${id}-hint` : undefined,
});
