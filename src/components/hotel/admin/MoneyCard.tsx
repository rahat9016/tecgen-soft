"use client";

import { taka } from "@/src/lib/hotel-store/format";
import { cn } from "@/src/lib/utils";

export type MoneyIcon = "wallet" | "calendar" | "bill" | "refund" | "vault";

/** Outline parts of each icon; the ৳ sits at `taka`. Paths use pathLength 100 so one draw animation fits all. */
const icons: Record<MoneyIcon, { paths: string[]; taka: [number, number] }> = {
  wallet: {
    paths: ["M5 10h20a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2z", "M8 10l11-4.5 2.5 4.5", "M27 15h-4.5a2.5 2.5 0 0 0 0 5H27"],
    taka: [13, 22],
  },
  calendar: {
    paths: ["M6 8h20a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z", "M5 13h22", "M11 5v5M21 5v5"],
    taka: [16, 23.5],
  },
  bill: {
    paths: ["M8 4h11l5 5v19l-2.5-1.5L19 28l-2.5-1.5L14 28l-2.5-1.5L9 28H8z", "M19 4v5h5"],
    taka: [16, 20.5],
  },
  refund: {
    paths: ["M7.5 11.5A10 10 0 1 1 6 18", "M4 7.5l3.5 4.5 4.5-3"],
    taka: [16.5, 20.5],
  },
  vault: {
    paths: ["M8 14h16a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V15a1 1 0 0 1 1-1z", "M11 14v-3.5a5 5 0 0 1 10 0V14"],
    taka: [16, 24.5],
  },
};

const tones = {
  green: { badge: "bg-emerald-50 text-emerald-600", bar: "bg-emerald-500" },
  sky: { badge: "bg-sky-50 text-sky-600", bar: "bg-sky-500" },
  rose: { badge: "bg-rose-50 text-rose-600", bar: "bg-rose-500" },
  violet: { badge: "bg-violet-50 text-violet-600", bar: "bg-violet-500" },
  slate: { badge: "bg-slate-100 text-slate-600", bar: "bg-slate-400" },
};

export function MoneyGlyph({ icon, className }: { icon: MoneyIcon; className?: string }) {
  const { paths, taka: [x, y] } = icons[icon];
  return (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden className={className}>
      {paths.map((d, i) => (
        <path key={i} d={d} />
      ))}
      <text x={x} y={y} textAnchor="middle" fontSize={11} fontWeight={700} fill="currentColor" stroke="none">
        ৳
      </text>
    </svg>
  );
}

/** Moving backdrop behind the icon: a slowly turning dashed ring and two staggered ripples. */
function IconBackdrop({ delay }: { delay: number }) {
  return (
    <svg viewBox="0 0 56 56" aria-hidden className="absolute inset-0 size-full">
      <circle cx="28" cy="28" r="26" fill="currentColor" className="tw-ripple opacity-0" style={{ animationDelay: `${delay}ms` }} />
      <circle cx="28" cy="28" r="26" fill="currentColor" className="tw-ripple opacity-0" style={{ animationDelay: `${delay + 1400}ms` }} />
      <circle cx="28" cy="28" r="25" fill="none" stroke="currentColor" strokeWidth="1.2" strokeDasharray="3 5" strokeLinecap="round" className="tw-spin opacity-40" />
    </svg>
  );
}

/** Dashboard tile: ৳ icon on an animated backdrop, the amount and one line of context. */
export function MoneyCard({
  label,
  value,
  hint,
  icon,
  tone,
  index = 0,
}: {
  label: string;
  value: number;
  hint?: string;
  icon: MoneyIcon;
  tone: keyof typeof tones;
  /** Staggers the entrance across a row of cards. */
  index?: number;
}) {
  const t = tones[tone];
  return (
    <section className="group relative flex min-w-0 flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-md">
      <span aria-hidden className={cn("absolute inset-x-0 top-0 h-0.5 opacity-70", t.bar)} />
      <div className="flex items-start justify-between gap-2">
        <p className="min-w-0 pt-1 text-[13px] font-medium text-neutral-600">{label}</p>
        <span className={cn("relative flex size-14 shrink-0 items-center justify-center rounded-full", t.badge)}>
          <IconBackdrop delay={index * 300} />
          <MoneyGlyph icon={icon} className="relative size-7" />
        </span>
      </div>
      <p className="mt-auto pt-3 text-2xl font-bold tabular-nums tracking-tight text-neutral-900">{taka(value)}</p>
      {hint && <p className="mt-0.5 text-[13px] text-neutral-500">{hint}</p>}
    </section>
  );
}
