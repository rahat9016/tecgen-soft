"use client";

import { useCallback, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2, ShieldAlert } from "lucide-react";
import { statusDots, statusLabels, statusStyles } from "@/src/lib/hotel-store/format";
import { paymentStatus } from "@/src/lib/hotel-store/store";
import type { Booking, BookingStatus } from "@/src/lib/hotel-store/types";
import { cn } from "@/src/lib/utils";

import { Card as KitCard } from "@/src/components/gadgets/admin/kit";

export { AdminHeader, Drawer, Modal, Switch, Table, td, th, usePagination } from "@/src/components/gadgets/admin/kit";

export const ADMIN = "/hotel-management/admin";

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <KitCard className={cn("rounded-md", className)}>{children}</KitCard>;
}

const statTones = {
  neutral: "bg-slate-100 text-slate-700",
  sky: "bg-sky-50 text-sky-700",
  orange: "bg-orange-50 text-orange-700",
  green: "bg-emerald-50 text-emerald-700",
  rose: "bg-rose-50 text-rose-700",
  violet: "bg-violet-50 text-violet-700",
};

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "neutral",
  className,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
  icon: React.ComponentType<{ className?: string }>;
  tone?: keyof typeof statTones;
  className?: string;
}) {
  return (
    <section className={cn("flex min-w-0 flex-col rounded-md border border-neutral-200 bg-white p-4", className)}>
      <div className="flex items-start justify-between gap-2">
        <p className="min-w-0 pt-1 text-sm font-medium text-neutral-600">{label}</p>
        <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-md", statTones[tone])}>
          <Icon className="size-4.5" />
        </span>
      </div>
      <p className="mt-auto pt-3 text-2xl font-bold tabular-nums tracking-tight text-neutral-900">{value}</p>
      {hint && <p className="mt-1 text-[13px] text-neutral-600">{hint}</p>}
    </section>
  );
}

/** Keyboard focus ring shared by every admin control. */
export const focusRing = "outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2";

/**
 * Runs one save at a time: clicks while it's in flight are ignored, and `saving` drives the button's busy state.
 * Works the same once the store's actions become network calls.
 */
export function useSaving() {
  const lock = useRef(false);
  const [saving, setSaving] = useState(false);
  const run = useCallback(async (fn: () => unknown) => {
    if (lock.current) return;
    lock.current = true;
    setSaving(true);
    try {
      await fn();
    } finally {
      lock.current = false;
      setSaving(false);
    }
  }, []);
  return { saving, run };
}

export const hbtn = {
  primary:
    `inline-flex h-10 items-center justify-center gap-2 rounded-md bg-sky-600 px-4 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`,
  dark: `inline-flex h-10 items-center justify-center gap-2 rounded-md bg-sky-950 px-4 text-sm font-semibold text-white transition hover:bg-sky-900 disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`,
  success:
    `inline-flex h-10 items-center justify-center gap-2 rounded-md bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`,
  outline:
    `inline-flex h-10 items-center justify-center gap-2 rounded-md border border-neutral-200 bg-white px-4 text-sm font-medium text-neutral-700 transition hover:border-sky-400 hover:text-sky-700 disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`,
  danger:
    `inline-flex h-10 items-center justify-center gap-2 rounded-md border border-rose-200 bg-white px-4 text-sm font-medium text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`,
  small:
    `inline-flex h-8 items-center justify-center gap-1.5 rounded-md border border-neutral-200 bg-white px-2.5 text-xs font-medium text-neutral-700 transition hover:border-sky-400 hover:text-sky-700 disabled:opacity-50 ${focusRing}`,
  icon: `inline-flex size-8 items-center justify-center rounded-md text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-800 ${focusRing}`,
  iconDanger: `inline-flex size-8 items-center justify-center rounded-md text-neutral-400 transition hover:bg-rose-50 hover:text-rose-600 ${focusRing}`,
};

export const inputClass =
  "h-10 w-full rounded-md border border-neutral-200 bg-white px-3 text-sm outline-none transition placeholder:text-neutral-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 disabled:bg-neutral-50 disabled:text-neutral-500";
export const textareaClass =
  "w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm outline-none transition placeholder:text-neutral-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-100";
export const labelClass = "mb-1 block text-xs font-medium text-neutral-600";

export function Field({ label, hint, className, children }: { label: string; hint?: string; className?: string; children: React.ReactNode }) {
  return (
    <label className={cn("block", className)}>
      <span className={labelClass}>{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[11px] text-neutral-400">{hint}</span>}
    </label>
  );
}

export function StatusBadge({ status, className }: { status: BookingStatus; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset", statusStyles[status], className)}>
      {status === "checked-in" ? <LiveDot className="size-1.5" /> : <span aria-hidden className={cn("size-1.5 rounded-full", statusDots[status])} />}
      {statusLabels[status]}
    </span>
  );
}

export function PayBadge({ booking }: { booking: Booking }) {
  const s = paymentStatus(booking);
  return <span className={cn("inline-flex whitespace-nowrap rounded-md px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset", s.tone)}>{s.label}</span>;
}

export function LiveDot({ className }: { className?: string }) {
  return (
    <span className={cn("relative flex size-2", className)}>
      <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
      <span className="relative inline-flex size-full rounded-full bg-emerald-500" />
    </span>
  );
}

export function Loader() {
  return (
    <div className="flex min-h-60 items-center justify-center text-neutral-400">
      <Loader2 className="size-6 animate-spin" />
    </div>
  );
}

export function NoAccess() {
  return (
    <div className="mx-auto mt-16 flex max-w-md flex-col items-center gap-3 rounded-md border border-dashed border-neutral-300 bg-white p-10 text-center">
      <ShieldAlert className="size-8 text-amber-500" />
      <p className="font-semibold text-neutral-900">You don&rsquo;t have access to this page</p>
      <p className="text-sm text-neutral-500">Ask an administrator to change your role if you need it.</p>
    </div>
  );
}

export function Empty({ icon: Icon, title, text, children }: { icon: React.ComponentType<{ className?: string }>; title: string; text?: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2 px-6 py-14 text-center">
      <Icon className="size-8 text-neutral-300" />
      <p className="font-medium text-neutral-800">{title}</p>
      {text && <p className="max-w-sm text-sm text-neutral-500">{text}</p>}
      {children}
    </div>
  );
}

/** Underlined tab strip with counts, used at the top of table cards. */
export function Tabs<T extends string>({
  value,
  onChange,
  tabs,
  className,
}: {
  value: T;
  onChange: (v: T) => void;
  tabs: { value: T; label: string; count?: number; dot?: string }[];
  className?: string;
}) {
  return (
    <div role="tablist" className={cn("flex gap-1 overflow-x-auto border-b border-neutral-100 px-3 [scrollbar-width:none]", className)}>
      {tabs.map((t) => {
        const selected = value === t.value;
        return (
          <button
            key={t.value}
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(t.value)}
            className={cn("relative flex shrink-0 items-center gap-2 px-3 py-3.5 text-sm font-medium transition", selected ? "text-neutral-900" : "text-neutral-500 hover:text-neutral-800")}
          >
            {t.dot && <span className={cn("size-2 rounded-full", t.dot)} />}
            {t.label}
            {t.count !== undefined && (
              <span className={cn("rounded-md px-1.5 text-[11px] tabular-nums", selected ? "bg-sky-600 text-white" : "bg-neutral-100 text-neutral-500")}>{t.count}</span>
            )}
            {selected && <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-sky-600" />}
          </button>
        );
      })}
    </div>
  );
}

export function Pager({
  page,
  pages,
  setPage,
  from,
  to,
  total,
  noun = "items",
}: {
  page: number;
  pages: number;
  setPage: (n: number) => void;
  from: number;
  to: number;
  total: number;
  noun?: string;
}) {
  if (!total) return null;
  const nums = Array.from({ length: pages }, (_, i) => i + 1).filter((n) => n === 1 || n === pages || Math.abs(n - page) <= 1);
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-100 px-4 py-3 text-sm text-neutral-500">
      <p>
        <b className="text-neutral-800">{from}</b>–<b className="text-neutral-800">{to}</b> of <b className="text-neutral-800">{total}</b> {noun}
      </p>
      {pages > 1 && (
        <div className="flex items-center gap-1">
          <button onClick={() => setPage(page - 1)} disabled={page === 1} aria-label="Previous page" className="flex size-8 items-center justify-center rounded-md border border-neutral-200 hover:border-sky-400 disabled:opacity-40">
            <ChevronLeft className="size-4" />
          </button>
          {nums.map((n, i) => (
            <span key={n} className="flex items-center gap-1">
              {i > 0 && n - nums[i - 1] > 1 && <span className="px-1 text-neutral-400">…</span>}
              <button
                onClick={() => setPage(n)}
                aria-current={n === page ? "page" : undefined}
                className={cn("size-8 rounded-md text-xs font-medium", n === page ? "bg-sky-600 text-white" : "border border-neutral-200 hover:border-sky-400")}
              >
                {n}
              </button>
            </span>
          ))}
          <button onClick={() => setPage(page + 1)} disabled={page === pages} aria-label="Next page" className="flex size-8 items-center justify-center rounded-md border border-neutral-200 hover:border-sky-400 disabled:opacity-40">
            <ChevronRight className="size-4" />
          </button>
        </div>
      )}
    </div>
  );
}

export function SearchBox({ value, onChange, placeholder, className }: { value: string; onChange: (v: string) => void; placeholder: string; className?: string }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      aria-label={placeholder}
      type="search"
      className={cn("h-9 w-full rounded-md border border-neutral-200 bg-white px-4 text-sm outline-none transition placeholder:text-neutral-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 sm:w-72", className)}
    />
  );
}

export function Select<T extends string>({
  value,
  onChange,
  options,
  label,
  className,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
  label: string;
  className?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
      aria-label={label}
      className={cn("h-9 rounded-md border border-neutral-200 bg-white px-3 text-sm text-neutral-700 outline-none focus:border-sky-500", className)}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export const toolbarClass = "flex flex-wrap items-center gap-2 border-b border-neutral-100 bg-neutral-50/50 p-3";
export const tableCardClass = "overflow-hidden rounded-md border border-neutral-200 bg-white";
export const linkClass = "font-medium text-sky-700 hover:underline";

export function Pills<T extends string>({
  value,
  options,
  onChange,
  size = "sm",
}: {
  value: T;
  options: { value: T; label: string; count?: number }[];
  onChange: (v: T) => void;
  /** "md" matches the 36px search box and selects in a toolbar. */
  size?: "sm" | "md";
}) {
  return (
    <div className="flex gap-1.5 overflow-x-auto [scrollbar-width:none]">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          aria-pressed={value === o.value}
          className={cn(
            // A border, not a ring: rings draw outside the box and get clipped by the scroll container.
            "flex shrink-0 items-center rounded-md border font-medium transition",
            size === "md" ? "h-9 px-4 text-sm" : "px-3.5 py-1.5 text-xs",
            value === o.value ? "border-sky-950 bg-sky-950 text-white" : "border-neutral-200 bg-white text-neutral-600 hover:border-sky-300"
          )}
        >
          {o.label}
          {o.count !== undefined && <span className="ml-1.5 opacity-60">{o.count}</span>}
        </button>
      ))}
    </div>
  );
}
