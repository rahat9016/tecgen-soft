"use client";

import { ChevronLeft, ChevronRight, Loader2, ShieldAlert } from "lucide-react";
import { statusLabels, statusStyles } from "@/src/lib/hotel-store/format";
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
  neutral: { icon: "bg-slate-100 text-slate-700", art: "text-slate-400", bar: "bg-slate-500" },
  sky: { icon: "bg-sky-50 text-sky-600", art: "text-sky-500", bar: "bg-sky-600" },
  orange: { icon: "bg-orange-50 text-orange-600", art: "text-orange-400", bar: "bg-orange-500" },
  green: { icon: "bg-emerald-50 text-emerald-600", art: "text-emerald-500", bar: "bg-emerald-500" },
  rose: { icon: "bg-rose-50 text-rose-600", art: "text-rose-400", bar: "bg-rose-500" },
  violet: { icon: "bg-violet-50 text-violet-600", art: "text-violet-500", bar: "bg-violet-500" },
};

/** Animations sit paused until the parent `group/card` is hovered. */
const onHover = "[animation-play-state:paused] group-hover/card:[animation-play-state:running] motion-reduce:animate-none";
/** One wave per 200 units across 800, so sliding the double-width svg by half loops seamlessly. */
const wave = (y: number, dip: number) => `M0 ${y}Q50 ${y + dip} 100 ${y}T200 ${y}T300 ${y}T400 ${y}T500 ${y}T600 ${y}T700 ${y}T800 ${y}V80H0z`;

/** Decorative sea-wave backdrop (with optional rings), tinted through currentColor; drifts while the card is hovered. Parent needs `group/card relative isolate overflow-hidden`. */
export function CardArt({ className, rings = true }: { className?: string; rings?: boolean }) {
  return (
    <span aria-hidden className={cn("pointer-events-none absolute inset-0 -z-10", className)}>
      {rings && (
        <svg viewBox="0 0 120 120" fill="none" className="absolute -right-10 -top-10 size-36 transition-transform duration-700 ease-out group-hover/card:scale-110">
          <circle cx="60" cy="60" r="58" stroke="currentColor" strokeOpacity=".12" strokeWidth="1.5" />
          <circle
            cx="60"
            cy="60"
            r="42"
            stroke="currentColor"
            strokeOpacity=".16"
            strokeWidth="1.5"
            strokeDasharray="5 7"
            className={cn("origin-center [transform-box:fill-box] animate-[spin_14s_linear_infinite]", onHover)}
          />
          <circle cx="60" cy="60" r="26" fill="currentColor" fillOpacity=".06" />
        </svg>
      )}
      <span className="absolute inset-x-0 bottom-0 h-14 origin-bottom overflow-hidden transition-transform duration-500 ease-out group-hover/card:scale-y-125">
        <svg viewBox="0 0 800 80" preserveAspectRatio="none" fill="currentColor" className={cn("absolute bottom-0 left-0 h-full w-[200%] animate-[marquee_9s_linear_infinite]", onHover)}>
          <path fillOpacity=".07" d={wave(36, -16)} />
        </svg>
        <svg viewBox="0 0 800 80" preserveAspectRatio="none" fill="currentColor" className={cn("absolute bottom-0 left-0 h-full w-[200%] animate-[marquee-reverse_6s_linear_infinite]", onHover)}>
          <path fillOpacity=".11" d={wave(56, 12)} />
        </svg>
      </span>
    </span>
  );
}

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "neutral",
  meter,
  className,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
  icon: React.ComponentType<{ className?: string }>;
  tone?: keyof typeof statTones;
  /** Optional 0–100 fill shown as a slim bar under the value. */
  meter?: number;
  className?: string;
}) {
  const t = statTones[tone];
  return (
    <section
      className={cn(
        "group/card relative isolate flex min-h-36 min-w-0 flex-col overflow-hidden rounded-md border border-neutral-200 bg-white p-4 transition duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-neutral-900/5 motion-reduce:hover:translate-y-0",
        className
      )}
    >
      <CardArt className={t.art} />
      <div className="flex items-center gap-2.5">
        <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-md transition-transform duration-300 group-hover/card:scale-110", t.icon)}>
          <Icon className="size-4.5" />
        </span>
        <p className="text-sm font-medium leading-tight text-neutral-600">{label}</p>
      </div>
      <p className="mt-auto pt-4 text-2xl font-bold tabular-nums tracking-tight text-neutral-900">{value}</p>
      {meter !== undefined && (
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-neutral-100">
          <div className={cn("h-full rounded-full", t.bar)} style={{ width: `${Math.min(100, Math.max(0, meter))}%` }} />
        </div>
      )}
      {hint && <p className="mt-1.5 truncate text-xs text-neutral-500">{hint}</p>}
    </section>
  );
}

export const hbtn = {
  primary:
    "inline-flex h-10 items-center justify-center gap-2 rounded-md bg-sky-600 px-4 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50",
  dark: "inline-flex h-10 items-center justify-center gap-2 rounded-md bg-sky-950 px-4 text-sm font-semibold text-white transition hover:bg-sky-900 disabled:cursor-not-allowed disabled:opacity-50",
  success:
    "inline-flex h-10 items-center justify-center gap-2 rounded-md bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50",
  outline:
    "inline-flex h-10 items-center justify-center gap-2 rounded-md border border-neutral-200 bg-white px-4 text-sm font-medium text-neutral-700 transition hover:border-sky-400 hover:text-sky-700 disabled:cursor-not-allowed disabled:opacity-50",
  danger:
    "inline-flex h-10 items-center justify-center gap-2 rounded-md border border-rose-200 bg-white px-4 text-sm font-medium text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50",
  small:
    "inline-flex h-8 items-center justify-center gap-1.5 rounded-md border border-neutral-200 bg-white px-2.5 text-xs font-medium text-neutral-700 transition hover:border-sky-400 hover:text-sky-700 disabled:opacity-50",
  icon: "inline-flex size-8 items-center justify-center rounded-md text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-800",
  iconDanger: "inline-flex size-8 items-center justify-center rounded-md text-neutral-400 transition hover:bg-rose-50 hover:text-rose-600",
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
    <span className={cn("inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset", statusStyles[status], className)}>
      {status === "checked-in" && <LiveDot className="size-1.5" />}
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

export function Pills<T extends string>({ value, options, onChange }: { value: T; options: { value: T; label: string; count?: number }[]; onChange: (v: T) => void }) {
  return (
    <div className="flex gap-1.5 overflow-x-auto [scrollbar-width:none]">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          aria-pressed={value === o.value}
          className={cn(
            "shrink-0 rounded-md px-3.5 py-1.5 text-xs font-medium transition",
            value === o.value ? "bg-sky-950 text-white" : "bg-white text-neutral-600 ring-1 ring-neutral-200 hover:ring-sky-300"
          )}
        >
          {o.label}
          {o.count !== undefined && <span className="ml-1.5 opacity-60">{o.count}</span>}
        </button>
      ))}
    </div>
  );
}
