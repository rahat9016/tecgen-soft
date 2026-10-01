"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { toast } from "react-toastify";
import { CalendarDays, ExternalLink, LayoutDashboard, ListChecks, Menu, RotateCcw, Settings, SquareStack, X } from "lucide-react";
import { rangeLabel, relativeDay } from "@/src/lib/turf-store/format";
import { resetDemoData, useHydrated, useTurfDB } from "@/src/lib/turf-store/store";
import { cn } from "@/src/lib/utils";
import { LiveDot, Loader, TurfLogo } from "../ui";

const nav = [
  { href: "/turf/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/turf/admin/schedule", label: "Schedule Board", icon: CalendarDays },
  { href: "/turf/admin/bookings", label: "Bookings", icon: ListChecks, badge: true },
  { href: "/turf/admin/courts", label: "Courts", icon: SquareStack },
  { href: "/turf/admin/settings", label: "Settings", icon: Settings },
];

/** Pops a toast when a booking arrives from another tab (i.e. a customer), so staff never miss one. */
function useNewBookingAlerts() {
  const db = useTurfDB();
  const hydrated = useHydrated();
  const seen = useRef<Set<string> | null>(null);
  useEffect(() => {
    if (!hydrated) return;
    if (!seen.current) {
      seen.current = new Set(db.bookings.map((b) => b.id));
      return;
    }
    for (const b of db.bookings) {
      if (seen.current.has(b.id)) continue;
      seen.current.add(b.id);
      if (b.source !== "online") continue;
      const court = db.courts.find((c) => c.id === b.courtId);
      toast.info(`New booking ${b.code} · ${b.customer.name} · ${court?.name ?? ""} ${relativeDay(b.date)} ${rangeLabel(b.startHour, b.duration)}`, {
        autoClose: 8000,
      });
    }
  }, [db.bookings, db.courts, hydrated]);
}

export default function TurfAdminShell({ children }: { children: React.ReactNode }) {
  const db = useTurfDB();
  const hydrated = useHydrated();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  useNewBookingAlerts();

  const pending = hydrated ? db.bookings.filter((b) => b.status === "pending").length : 0;

  const sidebar = (
    <nav className="flex h-full flex-col">
      <Link href="/turf/admin" className="px-5 pb-1 pt-6">
        <TurfLogo />
      </Link>
      <p className="px-5 text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-200/50">Venue Admin</p>
      <ul className="mt-6 flex-1 space-y-1 overflow-y-auto px-3">
        {nav.map((item) => {
          const active = item.href === "/turf/admin" ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition",
                  active ? "bg-lime-400 font-semibold text-emerald-950" : "text-emerald-100/80 hover:bg-white/5 hover:text-white"
                )}
              >
                <item.icon className="size-4" />
                {item.label}
                {item.badge && pending > 0 && (
                  <span className={cn("ml-auto rounded-full px-1.5 text-[10px] font-bold", active ? "bg-emerald-950 text-lime-300" : "bg-amber-400 text-emerald-950")}>
                    {pending}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="space-y-1 border-t border-white/10 p-3">
        <Link href="/turf" className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-emerald-100/80 hover:bg-white/5 hover:text-white">
          <ExternalLink className="size-4" /> View booking site
        </Link>
        <button
          onClick={() => {
            if (confirm("Reset all demo data (bookings, courts, settings) to the original sample?")) {
              resetDemoData();
              toast.success("Demo data reset");
            }
          }}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-emerald-100/80 hover:bg-white/5 hover:text-white"
        >
          <RotateCcw className="size-4" /> Reset demo data
        </button>
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen bg-neutral-50">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 bg-emerald-950 lg:block">{sidebar}</aside>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button aria-label="Close menu" className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-60 bg-emerald-950">
            <button onClick={() => setOpen(false)} aria-label="Close menu" className="absolute right-3 top-6 text-white">
              <X className="size-5" />
            </button>
            {sidebar}
          </aside>
        </div>
      )}
      <div className="min-w-0 lg:pl-60">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-neutral-200 bg-white/90 px-4 backdrop-blur md:px-8">
          <button onClick={() => setOpen(true)} aria-label="Open menu" className="lg:hidden">
            <Menu className="size-6" />
          </button>
          <p className="hidden items-center gap-2 text-sm text-neutral-500 sm:flex">
            <LiveDot /> Live — changes from the booking site appear instantly
          </p>
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-neutral-900">Front Desk</p>
              <p className="text-xs text-neutral-500">{db.settings.venueName}</p>
            </div>
            <span className="flex size-9 items-center justify-center rounded-full bg-emerald-800 text-sm font-bold text-lime-300">FD</span>
          </div>
        </header>
        <main className="p-4 md:p-8">{hydrated ? children : <Loader />}</main>
      </div>
    </div>
  );
}
