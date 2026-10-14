"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "react-toastify";
import {
  Bell,
  BedDouble,
  CalendarDays,
  CalendarRange,
  CheckCheck,
  ClipboardList,
  ExternalLink,
  Image as ImageIcon,
  LayoutDashboard,
  LayoutTemplate,
  LogOut,
  Menu,
  Plus,
  RotateCcw,
  Settings,
  Star,
  Users,
  Wallet,
  X,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { can, type Permission } from "@/src/lib/hotel-store/auth";
import { initials, roleLabels, timeAgo } from "@/src/lib/hotel-store/format";
import {
  creditOf,
  logOut,
  markNoticesRead,
  resetDemoData,
  STORAGE_FULL_EVENT,
  useCurrentStaff,
  useHotelDB,
  useHydrated,
  useNow,
} from "@/src/lib/hotel-store/store";
import type { Notice } from "@/src/lib/hotel-store/types";
import { cn } from "@/src/lib/utils";
import { ADMIN, LiveDot, Loader, NoAccess } from "./ui";


type NavItem = { href: string; label: string; icon: React.ComponentType<{ className?: string }>; perm?: Permission; badge?: "pending" | "refunds" | "reviews" | "notices" };

const groups: { title: string; items: NavItem[] }[] = [
  {
    title: "Front office",
    items: [
      { href: ADMIN, label: "Dashboard", icon: LayoutDashboard },
      { href: `${ADMIN}/bookings`, label: "Bookings", icon: ClipboardList, perm: "bookings.manage", badge: "pending" },
      { href: `${ADMIN}/rooms`, label: "Rooms board", icon: BedDouble, perm: "rooms.housekeeping" },
      { href: `${ADMIN}/calendar`, label: "Calendar", icon: CalendarRange, perm: "bookings.manage" },
      { href: `${ADMIN}/payments`, label: "Payments", icon: Wallet, perm: "payments.record", badge: "refunds" },
      { href: `${ADMIN}/users`, label: "Guests & staff", icon: Users, perm: "guests.view" },
    ],
  },
  {
    title: "Website",
    items: [
      { href: `${ADMIN}/room-types`, label: "Room types", icon: CalendarDays, perm: "rooms.manage" },
      { href: `${ADMIN}/content`, label: "Content", icon: LayoutTemplate, perm: "content.manage" },
      { href: `${ADMIN}/gallery`, label: "Gallery", icon: ImageIcon, perm: "content.manage" },
      { href: `${ADMIN}/reviews`, label: "Reviews", icon: Star, perm: "reviews.manage", badge: "reviews" },
    ],
  },
  {
    title: "System",
    items: [
      { href: `${ADMIN}/notifications`, label: "Notifications", icon: Bell, badge: "notices" },
      { href: `${ADMIN}/settings`, label: "Settings", icon: Settings, perm: "settings.manage" },
    ],
  },
];

const allItems = groups.flatMap((g) => g.items);
const isActive = (href: string, path: string) => (href === ADMIN ? path === ADMIN : path === href || path.startsWith(`${href}/`));

/** A short two-note chime made on the fly, so there's no audio file to ship. */
function chime() {
  try {
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    [880, 1318.5].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      const t = ctx.currentTime + i * 0.16;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.25, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.55);
    });
    setTimeout(() => ctx.close(), 1000);
  } catch {
    // Audio blocked until the user interacts with the page — the toast still shows.
  }
}

/** Alerts staff the moment a guest books, cancels, signs up or writes a review — even from another tab. */
function useStaffAlerts(onOpen: (n: Notice) => void) {
  const db = useHotelDB();
  const hydrated = useHydrated();
  const seen = useRef<Set<string> | null>(null);
  const open = useRef(onOpen);
  useEffect(() => {
    open.current = onOpen;
  });
  const { notifySound, browserNotifications } = db.settings;

  useEffect(() => {
    if (!hydrated) return;
    const staffNotices = db.notices.filter((n) => n.to === "staff");
    if (!seen.current) {
      seen.current = new Set(staffNotices.map((n) => n.id));
      return;
    }
    const fresh = staffNotices.filter((n) => !seen.current!.has(n.id));
    if (!fresh.length) return;
    fresh.forEach((n) => {
      seen.current!.add(n.id);
      toast.info(
        <button type="button" onClick={() => open.current(n)} className="block text-left">
          <span className="block font-semibold">{n.title}</span>
          <span className="block text-xs opacity-80">{n.body}</span>
        </button>,
        { autoClose: 9000 }
      );
      if (browserNotifications && "Notification" in window && Notification.permission === "granted" && document.hidden) {
        const sys = new Notification(n.title, { body: n.body, icon: "/TripWaveLogo.webp", tag: n.id });
        sys.onclick = () => {
          window.focus();
          open.current(n);
        };
      }
    });
    if (notifySound) chime();
  }, [db.notices, hydrated, notifySound, browserNotifications]);
}

function NotificationBell() {
  const db = useHotelDB();
  const router = useRouter();
  const now = useNow(60_000);
  const notices = db.notices.filter((n) => n.to === "staff");
  const unread = notices.filter((n) => !n.read).length;

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger
        aria-label={unread ? `${unread} unread notifications` : "Notifications"}
        className="relative flex size-10 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-600 outline-none transition hover:border-sky-300 hover:text-sky-700 focus-visible:ring-2 focus-visible:ring-sky-200"
      >
        <Bell className="size-4.5" />
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold leading-5 text-white ring-2 ring-white">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8} className="w-[min(24rem,calc(100vw-2rem))] rounded-md p-0">
        <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-3">
          <DropdownMenuLabel className="p-0 text-sm font-semibold">Notifications</DropdownMenuLabel>
          {unread > 0 && (
            <button onClick={() => markNoticesRead("staff")} className="flex items-center gap-1 text-xs font-medium text-sky-700 hover:underline">
              <CheckCheck className="size-3.5" /> Mark all read
            </button>
          )}
        </div>
        <div className="max-h-96 overflow-y-auto py-1">
          {notices.length === 0 && <p className="px-4 py-8 text-center text-sm text-neutral-500">No notifications yet.</p>}
          {notices.slice(0, 10).map((n) => (
            <DropdownMenuItem
              key={n.id}
              onSelect={() => {
                markNoticesRead("staff", [n.id]);
                if (n.bookingId) router.push(`${ADMIN}/bookings/${n.bookingId}`);
                else if (n.kind === "review") router.push(`${ADMIN}/reviews`);
                else router.push(`${ADMIN}/notifications`);
              }}
              className="mx-1 flex cursor-pointer items-start gap-3 rounded-md px-3 py-2.5"
            >
              <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", n.read ? "bg-neutral-200" : "bg-sky-500")} />
              <span className="min-w-0 flex-1">
                <span className={cn("block truncate text-sm", n.read ? "text-neutral-700" : "font-semibold text-neutral-900")}>{n.title}</span>
                <span className="line-clamp-2 block text-xs text-neutral-500">{n.body}</span>
                <span className="mt-0.5 block text-[11px] text-neutral-400">{timeAgo(n.at, now || undefined)}</span>
              </span>
            </DropdownMenuItem>
          ))}
        </div>
        <DropdownMenuSeparator className="m-0" />
        <Link href={`${ADMIN}/notifications`} className="block px-4 py-2.5 text-center text-sm font-medium text-sky-700 hover:bg-neutral-50">
          View all notifications
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const db = useHotelDB();
  const staff = useCurrentStaff();
  const hydrated = useHydrated();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const isLogin = pathname === `${ADMIN}/login`;

  useStaffAlerts((n) => {
    markNoticesRead("staff", [n.id]);
    router.push(n.bookingId ? `${ADMIN}/bookings/${n.bookingId}` : n.kind === "review" ? `${ADMIN}/reviews` : `${ADMIN}/notifications`);
  });

  useEffect(() => {
    const onFull = () => toast.error("Browser storage is full — the last change is kept only until you reload. Use image links instead of uploads.");
    window.addEventListener(STORAGE_FULL_EVENT, onFull);
    return () => window.removeEventListener(STORAGE_FULL_EVENT, onFull);
  }, []);

  useEffect(() => {
    if (hydrated && !staff && !isLogin) router.replace(`${ADMIN}/login?next=${encodeURIComponent(pathname)}`);
  }, [hydrated, staff, isLogin, pathname, router]);

  if (isLogin) return <>{children}</>;
  if (!hydrated || !staff) return <Loader />;

  const badges = {
    pending: db.bookings.filter((b) => b.status === "pending").length,
    refunds: db.bookings.filter((b) => creditOf(b) > 0).length,
    reviews: db.reviews.filter((r) => r.status === "pending").length,
    notices: db.notices.filter((n) => n.to === "staff" && !n.read).length,
  };
  const current = [...allItems].sort((a, b) => b.href.length - a.href.length).find((i) => isActive(i.href, pathname));
  const allowed = !current?.perm || can(staff.role, current.perm);

  const sidebar = (
    <nav className="flex h-full flex-col">
      <Link href={ADMIN} className="block px-5 pb-1 pt-5" onClick={() => setOpen(false)}>
        <Image src="/TripWaveLogo-light.webp" alt="TripWave" width={614} height={192} className="h-10 w-auto" />
      </Link>
      <p className="px-5 text-[10px] font-semibold uppercase tracking-[0.2em] text-sky-200/50">Hotel admin</p>
      <div className="mt-5 flex-1 space-y-5 overflow-y-auto px-3 pb-4">
        {groups.map((g) => {
          const items = g.items.filter((i) => !i.perm || can(staff.role, i.perm));
          if (!items.length) return null;
          return (
            <div key={g.title}>
              <p className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-sky-200/40">{g.title}</p>
              <ul className="space-y-0.5">
                {items.map((item) => {
                  const active = isActive(item.href, pathname);
                  const count = item.badge ? badges[item.badge] : 0;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setOpen(false)}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition",
                          active ? "bg-white font-semibold text-sky-950 shadow-sm" : "text-sky-100/80 hover:bg-white/5 hover:text-white"
                        )}
                      >
                        <item.icon className={cn("size-4", active ? "text-sky-600" : "")} />
                        {item.label}
                        {count > 0 && (
                          <span
                            className={cn(
                              "ml-auto rounded-md px-1.5 text-[10px] font-bold tabular-nums",
                              item.badge === "notices" ? "bg-rose-500 text-white" : active ? "bg-sky-600 text-white" : "bg-amber-400 text-sky-950"
                            )}
                          >
                            {count}
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
      <div className="space-y-0.5 border-t border-white/10 p-3">
        <Link href="/hotel-management" target="_blank" className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-sky-100/80 hover:bg-white/5 hover:text-white">
          <ExternalLink className="size-4" /> View website
        </Link>
        {can(staff.role, "settings.manage") && (
          <button
            onClick={() => {
              if (confirm("Reset all demo data (bookings, guests, payments, content) to the original sample?")) {
                resetDemoData();
                toast.success("Demo data reset");
              }
            }}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-sky-100/80 hover:bg-white/5 hover:text-white"
          >
            <RotateCcw className="size-4" /> Reset demo data
          </button>
        )}
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen bg-neutral-50 print:bg-white">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 bg-gradient-to-b from-sky-950 to-slate-950 lg:block print:hidden">{sidebar}</aside>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden print:hidden">
          <button aria-label="Close menu" className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 bg-gradient-to-b from-sky-950 to-slate-950">
            <button onClick={() => setOpen(false)} aria-label="Close menu" className="absolute right-3 top-5 text-white">
              <X className="size-5" />
            </button>
            {sidebar}
          </aside>
        </div>
      )}
      <div className="min-w-0 lg:pl-64 print:pl-0">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-neutral-200 bg-white/90 px-4 backdrop-blur md:px-8 print:hidden">
          <button onClick={() => setOpen(true)} aria-label="Open menu" className="lg:hidden">
            <Menu className="size-6" />
          </button>
          <p className="hidden items-center gap-2 text-sm text-neutral-500 md:flex">
            <LiveDot /> Live — bookings from the website appear instantly
          </p>
          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            {can(staff.role, "bookings.manage") && (
              <Link
                href={`${ADMIN}/bookings/new`}
                className="inline-flex h-10 items-center gap-1.5 rounded-md bg-sky-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700"
              >
                <Plus className="size-4" /> <span className="hidden sm:inline">New booking</span>
              </Link>
            )}
            <NotificationBell />
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger className="flex items-center gap-2 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-sky-200">
                <span className="hidden text-right sm:block">
                  <span className="block text-sm font-semibold text-neutral-900">{staff.name}</span>
                  <span className="block text-xs text-neutral-500">{roleLabels[staff.role]}</span>
                </span>
                <span className="flex size-10 items-center justify-center rounded-full bg-sky-900 text-sm font-bold text-white">{initials(staff.name)}</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" sideOffset={8} className="w-56 rounded-md">
                <DropdownMenuLabel>
                  <span className="block text-sm">{staff.name}</span>
                  <span className="block text-xs font-normal text-neutral-500">{staff.email}</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link href="/hotel-management" target="_blank">
                    <ExternalLink /> View website
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  variant="destructive"
                  className="cursor-pointer"
                  onSelect={() => {
                    logOut("staff");
                    router.replace(`${ADMIN}/login`);
                  }}
                >
                  <LogOut /> Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        {/* The root layout already provides <main>. */}
        <div className="p-4 md:p-8 print:p-0">{allowed ? children : <NoAccess />}</div>
      </div>
    </div>
  );
}
