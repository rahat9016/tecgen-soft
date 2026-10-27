"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { ClipboardList, ExternalLink, Image as ImageIcon, LayoutTemplate, Menu, PanelLeftClose, PanelLeftOpen, RotateCcw, Settings, Wallet, X } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/src/components/ui/dropdown-menu";
import { rangeLabel, relativeDay, todayYmd } from "@/src/lib/turf-store/format";
import { creditOf, endMs, resetDemoData, useHydrated, useNow, useTurfDB } from "@/src/lib/turf-store/store";
import { cn } from "@/src/lib/utils";
import { Loader, TurfLogo } from "../ui";
import { ADMIN } from "./ui";

const COMPACT_KEY = "turf-admin-sidebar-compact";

type NavItem = { href: string; label: string; icon: React.ComponentType<{ className?: string }>; badge?: "today" | "refunds" };

// Same layout as the hotel admin: front-desk work first, then what the public site shows.
const groups: { title: string; items: NavItem[] }[] = [
  {
    title: "Front desk",
    items: [
      { href: `${ADMIN}/bookings`, label: "Bookings", icon: ClipboardList, badge: "today" },
      { href: `${ADMIN}/payments`, label: "Payments", icon: Wallet, badge: "refunds" },
    ],
  },
  {
    title: "Website",
    items: [
      { href: `${ADMIN}/content`, label: "Content", icon: LayoutTemplate },
      { href: `${ADMIN}/gallery`, label: "Gallery", icon: ImageIcon },
    ],
  },
  {
    title: "System",
    items: [{ href: `${ADMIN}/settings`, label: "Settings", icon: Settings }],
  },
];

const isActive = (href: string, path: string) => path === href || path.startsWith(`${href}/`);

/** Pops a toast when a booking arrives from another tab (i.e. a customer), so staff never miss one. */
function useNewBookingAlerts() {
  const db = useTurfDB();
  const hydrated = useHydrated();
  const router = useRouter();
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
      toast.info(
        <button type="button" onClick={() => router.push(`${ADMIN}/bookings/${b.id}`)} className="block text-left">
          <span className="block font-semibold">New booking {b.code}</span>
          <span className="block text-xs opacity-80">
            {b.customer.name} · {relativeDay(b.date)} {rangeLabel(b.startHour, b.duration)}
          </span>
        </button>,
        { autoClose: 9000 }
      );
    }
  }, [db.bookings, hydrated, router]);
}

export default function TurfAdminShell({ children }: { children: React.ReactNode }) {
  const db = useTurfDB();
  const hydrated = useHydrated();
  const now = useNow(60_000);
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  // Desktop only: an 80px icon rail instead of the full menu, remembered in this browser.
  const [compact, setCompact] = useState(false);
  useEffect(() => {
    try {
      // Read after mount so the server HTML and first client render agree.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCompact(localStorage.getItem(COMPACT_KEY) === "1");
    } catch {}
  }, []);
  const toggleCompact = () =>
    setCompact((c) => {
      try {
        localStorage.setItem(COMPACT_KEY, c ? "0" : "1");
      } catch {}
      return !c;
    });
  useNewBookingAlerts();

  const badges = {
    // Games still to play today, so the desk sees at a glance how busy the day is.
    today: hydrated ? db.bookings.filter((b) => b.status === "confirmed" && b.date === todayYmd() && endMs(b) > now).length : 0,
    // Refunds still owed — they have to go out before kick-off.
    refunds: hydrated ? db.bookings.filter((b) => creditOf(b, now) > 0).length : 0,
  };

  const reset = () => {
    if (confirm("Reset all demo data (bookings, payments, content, gallery, settings) to the original sample?")) {
      resetDemoData();
      toast.success("Demo data reset");
    }
  };

  const sidebar = (rail: boolean) => (
    <nav className="flex h-full flex-col">
      <Link href={`${ADMIN}/bookings`} onClick={() => setOpen(false)} className={cn("block", rail ? "px-2 pb-1 pt-5 text-center" : "px-5 pb-1 pt-5")}>
        {rail ? <span className="text-xl font-extrabold text-lime-400">T<span className="text-white">H</span></span> : <TurfLogo />}
      </Link>
      <div className={cn("mt-5 flex-1 overflow-y-auto pb-4", rail ? "space-y-2 px-1.5" : "space-y-5 px-3")}>
        {groups.map((g, gi) => (
          <div key={g.title} className={cn(rail && gi > 0 && "border-t border-white/10 pt-2")}>
            {!rail && <p className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-200/40">{g.title}</p>}
            <ul className="space-y-0.5">
              {g.items.map((item) => {
                const active = isActive(item.href, pathname);
                const count = item.badge ? badges[item.badge] : 0;
                const badgeTone = item.badge === "refunds" ? "bg-violet-500 text-white" : active ? "bg-emerald-700 text-white" : "bg-emerald-500 text-white";
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      aria-current={active ? "page" : undefined}
                      title={rail ? item.label : undefined}
                      className={cn(
                        "rounded-md text-sm transition",
                        rail ? "flex h-15 flex-col items-center justify-center gap-1 px-0.5 text-center" : "flex items-center gap-3 px-3 py-2.5",
                        active ? "bg-white font-semibold text-emerald-950 shadow-sm" : "text-emerald-100/80 hover:bg-white/5 hover:text-white"
                      )}
                    >
                      <span className="relative">
                        <item.icon className={cn(rail ? "size-5" : "size-4", active && "text-emerald-700")} />
                        {rail && count > 0 && (
                          <span className={cn("absolute -right-2 -top-1.5 min-w-4 rounded-full px-1 text-center text-[9px] font-bold leading-4 tabular-nums", badgeTone)}>{count}</span>
                        )}
                      </span>
                      <span className={cn(rail && "w-full truncate text-[10px] leading-tight")}>{item.label}</span>
                      {!rail && count > 0 && <span className={cn("ml-auto rounded-md px-1.5 text-[10px] font-bold tabular-nums", badgeTone)}>{count}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
      <div className={cn("space-y-0.5 border-t border-white/10", rail ? "p-1.5" : "p-3")}>
        <Link
          href="/turf"
          target="_blank"
          title={rail ? "View booking site" : undefined}
          className={cn("rounded-md text-sm text-emerald-100/80 hover:bg-white/5 hover:text-white", rail ? "flex flex-col items-center gap-1 px-0.5 py-1.5 text-[10px]" : "flex items-center gap-3 px-3 py-2")}
        >
          <ExternalLink className="size-4" /> {rail ? "Site" : "View booking site"}
        </Link>
        <button
          onClick={reset}
          title={rail ? "Reset demo data" : undefined}
          className={cn("w-full rounded-md text-sm text-emerald-100/80 hover:bg-white/5 hover:text-white", rail ? "flex flex-col items-center gap-1 px-0.5 py-1.5 text-[10px]" : "flex items-center gap-3 px-3 py-2")}
        >
          <RotateCcw className="size-4" /> {rail ? "Reset" : "Reset demo data"}
        </button>
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen bg-neutral-50 print:bg-white">
      <aside className={cn("fixed inset-y-0 left-0 z-30 hidden bg-gradient-to-b from-emerald-950 to-neutral-950 transition-[width] duration-200 lg:block print:hidden", compact ? "w-20" : "w-64")}>
        {sidebar(compact)}
      </aside>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden print:hidden">
          <button aria-label="Close menu" className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 bg-gradient-to-b from-emerald-950 to-neutral-950">
            <button onClick={() => setOpen(false)} aria-label="Close menu" className="absolute right-3 top-5 text-white">
              <X className="size-5" />
            </button>
            {sidebar(false)}
          </aside>
        </div>
      )}
      <div className={cn("min-w-0 transition-[padding] duration-200 print:pl-0", compact ? "lg:pl-20" : "lg:pl-64")}>
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-neutral-200 bg-white/90 px-4 backdrop-blur sm:px-6 xl:px-8 print:hidden">
          <button onClick={() => setOpen(true)} aria-label="Open menu" className="flex size-10 shrink-0 items-center justify-center rounded-md border border-neutral-200 bg-white text-neutral-700 lg:hidden">
            <Menu className="size-5" />
          </button>
          <button
            onClick={toggleCompact}
            aria-label={compact ? "Expand sidebar" : "Collapse sidebar"}
            title={compact ? "Expand sidebar" : "Collapse sidebar"}
            className="hidden size-10 shrink-0 items-center justify-center rounded-md border border-neutral-200 bg-white text-neutral-700 hover:text-emerald-700 lg:flex"
          >
            {compact ? <PanelLeftOpen className="size-5" /> : <PanelLeftClose className="size-5" />}
          </button>
          <div className="ml-auto">
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger className="flex items-center gap-2 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-emerald-200">
                <span className="hidden text-right md:block">
                  <span className="block text-sm font-semibold text-neutral-900">Front Desk</span>
                  <span className="block text-xs text-neutral-500">{db.settings.venueName}</span>
                </span>
                <span className="flex size-10 items-center justify-center rounded-full bg-emerald-900 text-sm font-bold text-lime-300">FD</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" sideOffset={8} className="w-56 rounded-md">
                <DropdownMenuLabel>
                  <span className="block text-sm">Front Desk</span>
                  <span className="block text-xs font-normal text-neutral-500">{db.settings.venueName}</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link href="/turf" target="_blank">
                    <ExternalLink /> View booking site
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem variant="destructive" className="cursor-pointer" onSelect={reset}>
                  <RotateCcw /> Reset demo data
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <div className="p-4 print:p-0">{hydrated ? children : <Loader />}</div>
      </div>
    </div>
  );
}
