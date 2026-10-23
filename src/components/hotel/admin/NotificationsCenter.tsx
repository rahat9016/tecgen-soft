"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import {
  Bell,
  BellOff,
  BellRing,
  CalendarCheck,
  CalendarX,
  Check,
  CheckCheck,
  Info,
  LogIn,
  LogOut,
  MessagesSquare,
  Star,
  UserPlus,
  Volume2,
  VolumeX,
  Wallet,
} from "lucide-react";
import {
  formatDateTime,
  hotelDayOf,
  noticeKindLabels,
  relativeDay,
  timeAgo,
} from "@/src/lib/hotel-store/format";
import { useT } from "@/src/lib/hotel-store/i18n";
import {
  markNoticesRead,
  saveSettings,
  useHotelDB,
  useNow,
} from "@/src/lib/hotel-store/store";
import type { Notice, NoticeKind } from "@/src/lib/hotel-store/types";
import { cn } from "@/src/lib/utils";
import { ADMIN, Empty, Pager, Pills, usePagination } from "./ui";

const kindStyle: Record<
  NoticeKind,
  { icon: React.ComponentType<{ className?: string }>; tone: string }
> = {
  booking: { icon: CalendarCheck, tone: "bg-sky-50 text-sky-600 ring-sky-100" },
  payment: {
    icon: Wallet,
    tone: "bg-emerald-50 text-emerald-600 ring-emerald-100",
  },
  cancel: { icon: CalendarX, tone: "bg-rose-50 text-rose-600 ring-rose-100" },
  checkin: { icon: LogIn, tone: "bg-teal-50 text-teal-600 ring-teal-100" },
  checkout: {
    icon: LogOut,
    tone: "bg-neutral-100 text-neutral-600 ring-neutral-200",
  },
  review: { icon: Star, tone: "bg-amber-50 text-amber-600 ring-amber-100" },
  user: {
    icon: UserPlus,
    tone: "bg-violet-50 text-violet-600 ring-violet-100",
  },
  message: {
    icon: MessagesSquare,
    tone: "bg-indigo-50 text-indigo-600 ring-indigo-100",
  },
  system: {
    icon: Info,
    tone: "bg-neutral-100 text-neutral-600 ring-neutral-200",
  },
};

/** Where a notification leads: its booking, the conversation it came from, or the review queue. */
const hrefOf = (n: Notice) =>
  n.bookingId
    ? `${ADMIN}/bookings/${n.bookingId}`
    : n.kind === "message" && n.phone
      ? `${ADMIN}/messages?phone=${encodeURIComponent(n.phone)}`
      : n.kind === "review"
        ? `${ADMIN}/reviews`
        : undefined;

export default function NotificationsCenter() {
  const t = useT();
  const db = useHotelDB();
  const now = useNow(60_000);
  const [filter, setFilter] = useState<"all" | "unread" | NoticeKind>("all");
  const notices = db.notices.filter((n) => n.to === "staff");
  const list = notices.filter((n) =>
    filter === "all" ? true : filter === "unread" ? !n.read : n.kind === filter
  );
  const page = usePagination(list, 25);
  const unread = notices.filter((n) => !n.read).length;
  const { notifySound, browserNotifications } = db.settings;
  const kinds = [...new Set(notices.map((n) => n.kind))];

  const toggleBrowser = async () => {
    if (browserNotifications)
      return saveSettings({ ...db.settings, browserNotifications: false });
    if (!("Notification" in window))
      return toast.error(t("This browser doesn't support notifications."));
    const permission =
      Notification.permission === "granted"
        ? "granted"
        : await Notification.requestPermission();
    if (permission !== "granted")
      return toast.error(
        t("Notifications are blocked for this site in your browser settings.")
      );
    saveSettings({ ...db.settings, browserNotifications: true });
    toast.success(
      t(
        "Desktop alerts on — you'll be notified even when this tab is in the background."
      )
    );
  };

  // The page's rows under "Today", "Yesterday", "21 Oct" … headings.
  const days: { day: string; rows: Notice[] }[] = [];
  for (const n of page.rows) {
    const day = hotelDayOf(n.at);
    if (days[days.length - 1]?.day === day) days[days.length - 1].rows.push(n);
    else days.push({ day, rows: [n] });
  }

  const toggleClass = (on: boolean) =>
    cn(
      "inline-flex h-9 items-center gap-2 rounded-full border px-3 text-xs font-semibold transition",
      on
        ? "border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100"
        : "border-neutral-200 bg-white text-neutral-500 hover:border-neutral-300 hover:text-neutral-700"
    );

  return (
    <div>
      <div className="mb-3 space-y-4 rounded-lg border border-neutral-200 bg-white p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-neutral-900 sm:text-2xl">
              {t("Notifications")}
            </h1>
            {unread > 0 && (
              <span className="rounded-full bg-rose-500 px-2 text-xs font-bold leading-5 text-white">
                {t("{n} new", { n: unread })}
              </span>
            )}
          </div>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <button
              onClick={() =>
                saveSettings({ ...db.settings, notifySound: !notifySound })
              }
              aria-pressed={notifySound}
              className={toggleClass(notifySound)}
            >
              {notifySound ? (
                <Volume2 className="size-4" />
              ) : (
                <VolumeX className="size-4" />
              )}
              <span className="hidden sm:inline">{t("Sound")}</span>
            </button>
            <button
              onClick={toggleBrowser}
              aria-pressed={browserNotifications}
              className={toggleClass(browserNotifications)}
            >
              {browserNotifications ? (
                <BellRing className="size-4" />
              ) : (
                <BellOff className="size-4" />
              )}
              <span className="hidden sm:inline">{t("Desktop alerts")}</span>
            </button>
            {unread > 0 && (
              <button
                onClick={() => markNoticesRead("staff")}
                className="inline-flex h-9 items-center gap-2 rounded-full bg-sky-600 px-3.5 text-xs font-semibold text-white transition hover:bg-sky-700"
              >
                <CheckCheck className="size-4" /> {t("Mark all read")}
              </button>
            )}
          </div>
        </div>

        <Pills
          value={filter}
          onChange={(v) => {
            setFilter(v);
            page.setPage(1);
          }}
          options={[
            { value: "all" as const, label: "All", count: notices.length },
            { value: "unread" as const, label: "Unread", count: unread },
            ...kinds.map((k) => ({
              value: k,
              label: noticeKindLabels[k],
              count: notices.filter((n) => n.kind === k).length,
            })),
          ]}
        />
      </div>

      <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
        {list.length === 0 ? (
          <Empty
            icon={Bell}
            title={filter === "unread" ? "Nothing unread" : "No notifications"}
          />
        ) : (
          days.map(({ day, rows }) => (
            <section key={day}>
              <h2 className="border-b border-neutral-100 bg-neutral-50 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                {t(relativeDay(day))}
              </h2>
              <ul className="divide-y divide-neutral-100">
                {rows.map((n) => (
                  <Row key={n.id} n={n} now={now} />
                ))}
              </ul>
            </section>
          ))
        )}
        {list.length > 0 && (
          <div className="border-t border-neutral-100">
            <Pager {...page} noun="notifications" />
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ n, now }: { n: Notice; now: number }) {
  const t = useT();
  const { icon: Icon, tone } = kindStyle[n.kind];
  const href = hrefOf(n);
  const body = (
    <>
      <span
        className={cn(
          "relative flex size-10 shrink-0 items-center justify-center rounded-full ring-1",
          tone
        )}
      >
        <Icon className="size-4.5" />
        {!n.read && (
          <span className="absolute -right-0.5 -top-0.5 size-3 rounded-full bg-sky-500 ring-2 ring-white" />
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-baseline gap-x-2">
          <span
            className={cn(
              "text-sm",
              n.read
                ? "font-medium text-neutral-700"
                : "font-semibold text-neutral-900"
            )}
          >
            {n.title}
          </span>
          <span className="text-[11px] font-medium text-neutral-400">
            {t(noticeKindLabels[n.kind])}
          </span>
        </span>
        <span
          className={cn(
            "mt-0.5 line-clamp-2 block text-[13px]",
            n.read ? "text-neutral-500" : "text-neutral-600"
          )}
        >
          {n.body}
        </span>
        <span
          className="mt-1 block text-[11px] text-neutral-400 sm:hidden"
          title={formatDateTime(n.at)}
        >
          {timeAgo(n.at, now || undefined)}
        </span>
      </span>
    </>
  );

  return (
    <li
      className={cn(
        "group relative flex items-start gap-2 transition",
        n.read ? "hover:bg-neutral-50" : "bg-sky-50/50 hover:bg-sky-50"
      )}
    >
      {!n.read && (
        <span
          aria-hidden
          className="absolute inset-y-0 left-0 w-0.5 bg-sky-500"
        />
      )}
      {href ? (
        <Link
          href={href}
          onClick={() => markNoticesRead("staff", [n.id])}
          className="flex min-w-0 flex-1 items-start gap-3 py-3 pl-4"
        >
          {body}
        </Link>
      ) : (
        <div className="flex min-w-0 flex-1 items-start gap-3 py-3 pl-4">
          {body}
        </div>
      )}
      <div className="flex shrink-0 items-center gap-1 py-3 pr-3">
        <span
          className="hidden w-16 text-right text-xs text-neutral-400 sm:block"
          title={formatDateTime(n.at)}
        >
          {timeAgo(n.at, now || undefined)}
        </span>
        {/* Mark-read shows on hover with a mouse; always visible on touch screens. Read rows keep the space so times line up. */}
        <span className="flex size-8 items-center justify-center transition sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
          {!n.read && (
            <button
              onClick={() => markNoticesRead("staff", [n.id])}
              aria-label={t("Mark read")}
              title={t("Mark read")}
              className="flex size-8 items-center justify-center rounded-full text-neutral-400 transition hover:bg-white hover:text-sky-700 hover:shadow-sm"
            >
              <Check className="size-4" />
            </button>
          )}
        </span>
      </div>
    </li>
  );
}
