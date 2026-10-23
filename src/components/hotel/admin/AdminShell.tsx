"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "react-toastify";
import {
  Bell,
  CheckCheck,
  ClipboardList,
  DoorOpen,
  ExternalLink,
  Image as ImageIcon,
  LayoutTemplate,
  LogOut,
  Menu,
  MessagesSquare,
  PanelLeftClose,
  PanelLeftOpen,
  RotateCcw,
  Settings,
  Star,
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
  threadsOf,
  markNoticesRead,
  resetDemoData,
  STORAGE_FULL_EVENT,
  useCurrentStaff,
  useHotelDB,
  useHydrated,
  useNow,
} from "@/src/lib/hotel-store/store";
import type { Notice } from "@/src/lib/hotel-store/types";
import { setLang, useLang, useT } from "@/src/lib/hotel-store/i18n";
import { cn } from "@/src/lib/utils";
import { ADMIN, Loader, NoAccess } from "./ui";


const COMPACT_KEY = "hotel-admin-sidebar-compact";

type NavItem = { href: string; label: string; icon: React.ComponentType<{ className?: string }>; perm?: Permission; badge?: "pending" | "refunds" | "reviews" | "notices" | "messages" };

const groups: { title: string; items: NavItem[] }[] = [
  {
    title: "Front office",
    items: [
      { href: `${ADMIN}/bookings`, label: "Bookings", icon: ClipboardList, perm: "bookings.manage", badge: "pending" },
      { href: `${ADMIN}/payments`, label: "Payments", icon: Wallet, perm: "payments.record", badge: "refunds" },
      { href: `${ADMIN}/messages`, label: "Messages", icon: MessagesSquare, perm: "guests.message", badge: "messages" },
    ],
  },
  {
    title: "Website",
    items: [
      { href: `${ADMIN}/rooms`, label: "Rooms", icon: DoorOpen, perm: "rooms.manage" },
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

/** Where a notification leads: its booking, the conversation it came from, or the review queue. */
const noticeHref = (n: Notice) =>
  n.bookingId
    ? `${ADMIN}/bookings/${n.bookingId}`
    : n.kind === "message" && n.phone
      ? `${ADMIN}/messages?phone=${encodeURIComponent(n.phone)}`
      : n.kind === "review"
        ? `${ADMIN}/reviews`
        : `${ADMIN}/notifications`;
const isActive = (href: string, path: string) => path === href || path.startsWith(`${href}/`);

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
    fresh.forEach((n) => seen.current!.add(n.id));
    // Staff's own actions arrive already read: they belong in the activity feed, not in a pop-up.
    const alerts = fresh.filter((n) => !n.read);
    if (!alerts.length) return;
    alerts.forEach((n) => {
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
  const t = useT();
  const db = useHotelDB();
  const router = useRouter();
  const now = useNow(60_000);
  const notices = db.notices.filter((n) => n.to === "staff");
  const unread = notices.filter((n) => !n.read).length;

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger
        aria-label={unread ? t("{n} unread notifications", { n: unread }) : t("Notifications")}
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
          <DropdownMenuLabel className="p-0 text-sm font-semibold">{t("Notifications")}</DropdownMenuLabel>
          {unread > 0 && (
            <button onClick={() => markNoticesRead("staff")} className="flex items-center gap-1 text-xs font-medium text-sky-700 hover:underline">
              <CheckCheck className="size-3.5" /> {t("Mark all read")}
            </button>
          )}
        </div>
        <div className="max-h-96 overflow-y-auto py-1">
          {notices.length === 0 && <p className="px-4 py-8 text-center text-sm text-neutral-500">{t("No notifications yet.")}</p>}
          {notices.slice(0, 10).map((n) => (
            <DropdownMenuItem
              key={n.id}
              onSelect={() => {
                markNoticesRead("staff", [n.id]);
                router.push(noticeHref(n));
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
          {t("View all notifications")}
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const t = useT();
  const db = useHotelDB();
  const staff = useCurrentStaff();
  const hydrated = useHydrated();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  // Desktop only: an 80px icon rail instead of the full menu, remembered in this browser.
  // The shell renders only after hydration, so reading storage up front can't mismatch the server HTML.
  const [compact, setCompact] = useState(() => {
    try {
      return typeof window !== "undefined" && localStorage.getItem(COMPACT_KEY) === "1";
    } catch {
      return false;
    }
  });
  const toggleCompact = () =>
    setCompact((c) => {
      try {
        localStorage.setItem(COMPACT_KEY, c ? "0" : "1");
      } catch {}
      return !c;
    });
  const isLogin = pathname === `${ADMIN}/login`;

  useStaffAlerts((n) => {
    markNoticesRead("staff", [n.id]);
    router.push(noticeHref(n));
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
    messages: threadsOf(db).filter((th) => th.staffUnread > 0).length,
  };
  const current = [...allItems].sort((a, b) => b.href.length - a.href.length).find((i) => isActive(i.href, pathname));
  const allowed = !current?.perm || can(staff.role, current.perm);

  const sidebar = (rail: boolean) => (
    <nav className="flex h-full flex-col">
      <Link href={`${ADMIN}/bookings`} className={cn("block", rail ? "px-2 pb-1 pt-4" : "px-5 pb-1 pt-5")} onClick={() => setOpen(false)}>
        <Image src="/TripWaveLogo-light.webp" alt="TripWave" width={614} height={192} className={rail ? "h-auto w-full object-contain" : "h-10 w-auto"} />
      </Link>
      <div className={cn("mt-5 flex-1 overflow-y-auto pb-4", rail ? "space-y-2 px-1.5" : "space-y-5 px-3")}>
        {groups.map((g, gi) => {
          const items = g.items.filter((i) => !i.perm || can(staff.role, i.perm));
          if (!items.length) return null;
          return (
            <div key={g.title} className={cn(rail && gi > 0 && "border-t border-white/10 pt-2")}>
              {!rail && <p className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-sky-200/40">{t(g.title)}</p>}
              <ul className="space-y-0.5">
                {items.map((item) => {
                  const active = isActive(item.href, pathname);
                  const count = item.badge ? badges[item.badge] : 0;
                  const badgeTone = item.badge === "notices" || item.badge === "messages" ? "bg-rose-500 text-white" : active ? "bg-sky-600 text-white" : "bg-sky-500 text-white";
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setOpen(false)}
                        aria-current={active ? "page" : undefined}
                        title={rail ? t(item.label) : undefined}
                        className={cn(
                          "rounded-md text-sm transition",
                          rail ? "flex h-15 flex-col items-center justify-center gap-1 px-0.5 text-center" : "flex items-center gap-3 px-3 py-2.5",
                          active ? "bg-white font-semibold text-sky-950 shadow-sm" : "text-sky-100/80 hover:bg-white/5 hover:text-white"
                        )}
                      >
                        <span className="relative">
                          <item.icon className={cn(rail ? "size-5" : "size-4", active ? "text-sky-600" : "")} />
                          {rail && count > 0 && (
                            <span className={cn("absolute -right-2 -top-1.5 min-w-4 rounded-full px-1 text-center text-[9px] font-bold leading-4 tabular-nums", badgeTone)}>
                              {count}
                            </span>
                          )}
                        </span>
                        <span className={cn(rail && "w-full truncate text-[10px] leading-tight")}>{t(item.label)}</span>
                        {!rail && count > 0 && <span className={cn("ml-auto rounded-md px-1.5 text-[10px] font-bold tabular-nums", badgeTone)}>{count}</span>}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
      <div className={cn("space-y-0.5 border-t border-white/10", rail ? "p-1.5" : "p-3")}>
        <Link
          href="/hotel-management"
          target="_blank"
          title={rail ? t("View website") : undefined}
          className={cn(
            "rounded-md text-sm text-sky-100/80 hover:bg-white/5 hover:text-white",
            rail ? "flex flex-col items-center gap-1 px-0.5 py-1.5 text-[10px]" : "flex items-center gap-3 px-3 py-2"
          )}
        >
          <ExternalLink className="size-4" /> {rail ? t("Website") : t("View website")}
        </Link>
        {can(staff.role, "settings.manage") && (
          <button
            onClick={() => {
              if (confirm(t("Reset all demo data (bookings, guests, payments, content) to the original sample?"))) {
                resetDemoData();
                toast.success(t("Demo data reset"));
              }
            }}
            title={rail ? t("Reset demo data") : undefined}
            className={cn(
              "w-full rounded-md text-sm text-sky-100/80 hover:bg-white/5 hover:text-white",
              rail ? "flex flex-col items-center gap-1 px-0.5 py-1.5 text-[10px]" : "flex items-center gap-3 px-3 py-2"
            )}
          >
            <RotateCcw className="size-4" /> {rail ? t("Reset") : t("Reset demo data")}
          </button>
        )}
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen bg-neutral-50 print:bg-white">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 hidden bg-gradient-to-b from-sky-950 to-slate-950 transition-[width] duration-200 lg:block print:hidden",
          compact ? "w-20" : "w-64"
        )}
      >
        {sidebar(compact)}
      </aside>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden print:hidden">
          <button aria-label={t("Close menu")} className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 bg-gradient-to-b from-sky-950 to-slate-950">
            <button onClick={() => setOpen(false)} aria-label={t("Close menu")} className="absolute right-3 top-5 text-white">
              <X className="size-5" />
            </button>
            {sidebar(false)}
          </aside>
        </div>
      )}
      <div className={cn("min-w-0 transition-[padding] duration-200 print:pl-0", compact ? "lg:pl-20" : "lg:pl-64")}>
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-neutral-200 bg-white/90 px-4 backdrop-blur sm:px-6 xl:px-8 print:hidden">
          <button
            onClick={() => setOpen(true)}
            aria-label={t("Open menu")}
            className="flex size-10 shrink-0 items-center justify-center rounded-md border border-neutral-200 bg-white text-neutral-700 lg:hidden"
          >
            <Menu className="size-5" />
          </button>
          <button
            onClick={toggleCompact}
            aria-label={compact ? t("Expand sidebar") : t("Collapse sidebar")}
            title={compact ? t("Expand sidebar") : t("Collapse sidebar")}
            className="hidden size-10 shrink-0 items-center justify-center rounded-md border border-neutral-200 bg-white text-neutral-700 hover:text-sky-700 lg:flex"
          >
            {compact ? <PanelLeftOpen className="size-5" /> : <PanelLeftClose className="size-5" />}
          </button>
          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <LanguageSwitch />
            <NotificationBell />
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger className="flex items-center gap-2 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-sky-200">
                <span className="hidden text-right md:block">
                  <span className="block text-sm font-semibold text-neutral-900">{staff.name}</span>
                  <span className="block text-xs text-neutral-500">{t(roleLabels[staff.role])}</span>
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
                    <ExternalLink /> {t("View website")}
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
                  <LogOut /> {t("Log out")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        {/* The root layout already provides <main>. */}
        <div className="p-4 print:p-0">{allowed ? children : <NoAccess />}</div>
      </div>
    </div>
  );
}

/** EN / বাংলা switch; the choice is remembered in this browser. */
function LanguageSwitch() {
  const lang = useLang();
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  return (
    <div role="radiogroup" aria-label="Language / ভাষা" className="flex h-9 items-center rounded-full border border-neutral-200 bg-white p-0.5 text-xs font-semibold sm:h-10 sm:p-1 sm:text-[13px]">
      {(
        [
          ["en", "EN"],
          ["bn", "বাংলা"],
        ] as const
      ).map(([value, label]) => (
        <button
          key={value}
          type="button"
          role="radio"
          aria-checked={lang === value}
          onClick={() => setLang(value)}
          className={cn("h-7.5 rounded-full px-2.5 transition sm:h-8 sm:px-3", lang === value ? "bg-sky-600 text-white" : "text-neutral-600 hover:text-sky-700")}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
