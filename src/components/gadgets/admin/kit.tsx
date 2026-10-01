"use client";

import { useEffect } from "react";
import { Check, ChevronDown, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { cn } from "@/src/lib/utils";

export function AdminHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3 print:hidden">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-neutral-500">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <section className={cn("min-w-0 rounded-2xl border border-neutral-200 bg-white p-5", className)}>{children}</section>;
}

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "neutral",
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: React.ComponentType<{ className?: string }>;
  tone?: "neutral" | "orange" | "green" | "rose" | "violet";
}) {
  const tones = {
    neutral: "bg-neutral-100 text-neutral-700",
    orange: "bg-orange-50 text-orange-600",
    green: "bg-emerald-50 text-emerald-600",
    rose: "bg-rose-50 text-rose-600",
    violet: "bg-violet-50 text-violet-600",
  };
  return (
    <Card>
      <div className="flex items-start justify-between">
        <p className="text-sm text-neutral-500">{label}</p>
        <span className={cn("flex size-9 items-center justify-center rounded-xl", tones[tone])}>
          <Icon className="size-4.5" />
        </span>
      </div>
      <p className="mt-2 text-2xl font-bold tabular-nums text-neutral-900">{value}</p>
      {hint && <p className="mt-1 text-xs text-neutral-500">{hint}</p>}
    </Card>
  );
}

export const btn = {
  primary:
    "inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50",
  dark: "inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-neutral-900 px-4 text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-50",
  outline:
    "inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 text-sm font-medium text-neutral-700 hover:border-orange-400 hover:text-orange-600",
  ghostDanger: "inline-flex size-8 items-center justify-center rounded-lg text-neutral-400 hover:bg-rose-50 hover:text-rose-600",
  ghost: "inline-flex size-8 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-100 hover:text-neutral-800",
};

export const th = "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500";
export const td = "px-4 py-3 text-sm text-neutral-700";

export function Table({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("overflow-x-auto rounded-2xl border border-neutral-200 bg-white", className)}>
      <table className="w-full min-w-[640px] divide-y divide-neutral-100">{children}</table>
    </div>
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={title}>
      <button aria-label="Close" className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className={cn("relative max-h-[90vh] w-full overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl", wide ? "max-w-2xl" : "max-w-md")}>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-neutral-900">{title}</h2>
          <button onClick={onClose} aria-label="Close" className={btn.ghost}>
            <X className="size-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/** Right-hand slide-over panel for quick views; closes on Escape or backdrop click. */
export function Drawer({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 print:hidden" role="dialog" aria-modal="true">
      <button aria-label="Close" className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" onClick={onClose} />
      <div className="absolute inset-y-0 right-0 flex w-full max-w-xl flex-col bg-white shadow-2xl animate-in slide-in-from-right duration-200">
        <div className="flex items-start justify-between gap-3 border-b border-neutral-100 px-6 py-4">
          <div className="min-w-0">{title}</div>
          <button onClick={onClose} aria-label="Close" className={btn.ghost}>
            <X className="size-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer && <div className="border-t border-neutral-100 bg-neutral-50 px-6 py-4">{footer}</div>}
      </div>
    </div>
  );
}

export function SearchInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      aria-label={placeholder}
      className="h-10 w-full max-w-xs rounded-xl border border-neutral-200 bg-white px-3.5 text-sm outline-none focus:border-orange-400"
    />
  );
}

export function Pills<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string; count?: number }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex gap-1.5 overflow-x-auto [scrollbar-width:none]">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition",
            value === o.value ? "bg-neutral-900 text-white" : "bg-white text-neutral-600 ring-1 ring-neutral-200 hover:ring-orange-300"
          )}
        >
          {o.label}
          {o.count !== undefined && <span className="ml-1 opacity-60">{o.count}</span>}
        </button>
      ))}
    </div>
  );
}

/** Inclusive start of a range in days, measured from local midnight. */
export function daysAgoStart(days: number) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - (days - 1));
  return d.getTime();
}

/**
 * Pill-shaped filter dropdown: shows "Label: Value", turns orange when it differs from its default,
 * and offers an inline clear button.
 */
export function FilterMenu<T extends string>({
  label,
  icon: Icon,
  value,
  defaultValue,
  options,
  onChange,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  value: T;
  defaultValue: T;
  options: { value: T; label: string; dot?: string }[];
  onChange: (v: T) => void;
}) {
  const active = value !== defaultValue;
  const current = options.find((o) => o.value === value);
  return (
    <DropdownMenu modal={false}>
      <div
        className={cn(
          "inline-flex h-9 shrink-0 items-center rounded-full border text-sm transition",
          active
            ? "border-orange-300 bg-orange-50 text-orange-700"
            : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50"
        )}
      >
        <DropdownMenuTrigger className="flex h-full items-center gap-2 rounded-full pl-3 pr-2.5 outline-none focus-visible:ring-2 focus-visible:ring-orange-200">
          <Icon className={cn("size-4", active ? "text-orange-500" : "text-neutral-400")} />
          <span className={active ? "text-orange-600/80" : "text-neutral-500"}>{label}</span>
          {active && <span className="font-semibold">{current?.label}</span>}
          {!active && <ChevronDown className="size-3.5 text-neutral-400" />}
        </DropdownMenuTrigger>
        {active && (
          <button
            onClick={() => onChange(defaultValue)}
            aria-label={`Clear ${label} filter`}
            className="mr-1 flex size-6 items-center justify-center rounded-full text-orange-500 hover:bg-orange-100"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>
      <DropdownMenuContent align="start" sideOffset={6} className="min-w-52 rounded-xl p-1.5">
        <DropdownMenuLabel className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">{label}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {options.map((o) => (
          <DropdownMenuItem
            key={o.value}
            onSelect={() => onChange(o.value)}
            className={cn("cursor-pointer gap-2 rounded-lg py-2", o.value === value && "bg-orange-50 font-medium text-orange-700")}
          >
            {o.dot && <span className={cn("size-2 rounded-full", o.dot)} />}
            {o.label}
            {o.value === value && <Check className="ml-auto size-4 text-orange-500" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
