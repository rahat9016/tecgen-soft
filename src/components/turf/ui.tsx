"use client";

import { Loader2, Trophy } from "lucide-react";
import { GiBasketballBall, GiCricketBat, GiShuttlecock, GiSoccerBall, GiTennisRacket } from "react-icons/gi";
import { statusLabels, statusStyles } from "@/src/lib/turf-store/format";
import type { BookingStatus, Sport } from "@/src/lib/turf-store/types";
import { cn } from "@/src/lib/utils";

export const tbtn = {
  lime: "inline-flex h-11 items-center justify-center gap-2 rounded-full bg-lime-400 px-5 text-sm font-semibold text-emerald-950 transition hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-50",
  green:
    "inline-flex h-10 items-center justify-center gap-2 rounded-full bg-emerald-800 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50",
  outline:
    "inline-flex h-10 items-center justify-center gap-2 rounded-full border border-neutral-200 bg-white px-4 text-sm font-medium text-neutral-700 transition hover:border-emerald-600 hover:text-emerald-800 disabled:opacity-50",
  danger:
    "inline-flex h-10 items-center justify-center gap-2 rounded-full border border-rose-200 bg-white px-4 text-sm font-medium text-rose-600 transition hover:bg-rose-50 disabled:opacity-50",
  icon: "inline-flex size-10 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-700 transition hover:border-emerald-600 hover:text-emerald-800 disabled:opacity-40",
};

export const inputClass =
  "h-11 w-full rounded-xl border border-neutral-200 bg-white px-3.5 text-sm outline-none transition placeholder:text-neutral-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100";

export const labelClass = "mb-1.5 block text-xs font-medium text-neutral-600";

export function TurfLogo({ className }: { className?: string }) {
  return (
    <span className={cn("text-2xl font-extrabold tracking-tight text-lime-400", className)}>
      Turf<span className="text-white">Hub</span>
    </span>
  );
}

export function LiveDot({ className }: { className?: string }) {
  return (
    <span className={cn("relative flex size-2", className)}>
      <span className="absolute inline-flex size-full animate-ping rounded-full bg-lime-400 opacity-75" />
      <span className="relative inline-flex size-2 rounded-full bg-lime-500" />
    </span>
  );
}

export function LiveBadge({ now, dark }: { now: number; dark?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium",
        dark ? "bg-white/10 text-white ring-1 ring-white/15" : "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200"
      )}
    >
      <LiveDot />
      Live
      {now > 0 && (
        <span className="tabular-nums opacity-70">
          · {new Date(now).toLocaleTimeString("en-GB", { hour: "numeric", minute: "2-digit", second: "2-digit", hour12: true })}
        </span>
      )}
    </span>
  );
}

export function BookingStatusBadge({ status, className }: { status: BookingStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        statusStyles[status],
        className
      )}
    >
      {status === "checked-in" && <LiveDot className="size-1.5" />}
      {statusLabels[status]}
    </span>
  );
}

const sportIcons: Record<Sport, React.ComponentType<{ className?: string }>> = {
  football: GiSoccerBall,
  cricket: GiCricketBat,
  badminton: GiShuttlecock,
  tennis: GiTennisRacket,
  basketball: GiBasketballBall,
};

export function SportIcon({ sport, className }: { sport: Sport; className?: string }) {
  const Icon = sportIcons[sport] ?? Trophy;
  return <Icon className={cn("size-4", className)} />;
}

export function Loader() {
  return (
    <div className="flex min-h-60 items-center justify-center text-neutral-400">
      <Loader2 className="size-6 animate-spin" />
    </div>
  );
}

export function Chip({
  active,
  onClick,
  children,
  dark,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  dark?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full px-4 text-xs font-medium transition",
        active
          ? "bg-emerald-800 text-white"
          : dark
            ? "bg-white/10 text-white ring-1 ring-white/15 hover:bg-white/20"
            : "bg-white text-neutral-700 ring-1 ring-neutral-200 hover:ring-emerald-500"
      )}
    >
      {children}
    </button>
  );
}
