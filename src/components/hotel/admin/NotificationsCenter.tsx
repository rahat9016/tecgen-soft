"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import { Bell, BellRing, CheckCheck, Trash2, Volume2, VolumeX } from "lucide-react";
import { formatDateTime, noticeKindLabels, timeAgo } from "@/src/lib/hotel-store/format";
import { deleteNotice, markNoticesRead, saveSettings, useHotelDB, useNow } from "@/src/lib/hotel-store/store";
import type { NoticeKind } from "@/src/lib/hotel-store/types";
import { cn } from "@/src/lib/utils";
import { ADMIN, AdminHeader, Empty, hbtn, Pager, Pills, tableCardClass, usePagination } from "./ui";

const kindTone: Record<NoticeKind, string> = {
  booking: "bg-sky-50 text-sky-700",
  payment: "bg-emerald-50 text-emerald-700",
  cancel: "bg-rose-50 text-rose-600",
  checkin: "bg-emerald-50 text-emerald-700",
  checkout: "bg-neutral-100 text-neutral-600",
  review: "bg-amber-50 text-amber-700",
  user: "bg-violet-50 text-violet-700",
  system: "bg-neutral-100 text-neutral-600",
};

export default function NotificationsCenter() {
  const db = useHotelDB();
  const now = useNow(60_000);
  const [filter, setFilter] = useState<"all" | "unread" | NoticeKind>("all");
  const notices = db.notices.filter((n) => n.to === "staff");
  const list = notices.filter((n) => (filter === "all" ? true : filter === "unread" ? !n.read : n.kind === filter));
  const page = usePagination(list, 25);
  const unread = notices.filter((n) => !n.read).length;
  const { notifySound, browserNotifications } = db.settings;
  const kinds = [...new Set(notices.map((n) => n.kind))];

  const toggleBrowser = async () => {
    if (browserNotifications) return saveSettings({ ...db.settings, browserNotifications: false });
    if (!("Notification" in window)) return toast.error("This browser doesn't support notifications.");
    const permission = Notification.permission === "granted" ? "granted" : await Notification.requestPermission();
    if (permission !== "granted") return toast.error("Notifications are blocked for this site in your browser settings.");
    saveSettings({ ...db.settings, browserNotifications: true });
    toast.success("Desktop alerts on — you'll be notified even when this tab is in the background.");
  };

  return (
    <div>
      <AdminHeader
        title="Notifications"
        subtitle="New bookings, cancellations, guest sign-ups and reviews arrive here the moment they happen."
        actions={
          <>
            <button onClick={() => saveSettings({ ...db.settings, notifySound: !notifySound })} className={hbtn.outline}>
              {notifySound ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />} Sound {notifySound ? "on" : "off"}
            </button>
            <button onClick={toggleBrowser} className={cn(hbtn.outline, browserNotifications && "border-sky-300 text-sky-700")}>
              <BellRing className="size-4" /> Desktop alerts {browserNotifications ? "on" : "off"}
            </button>
            {unread > 0 && (
              <button onClick={() => markNoticesRead("staff")} className={hbtn.primary}>
                <CheckCheck className="size-4" /> Mark all read
              </button>
            )}
          </>
        }
      />

      <div className="mb-4">
        <Pills
          value={filter}
          onChange={(v) => {
            setFilter(v);
            page.setPage(1);
          }}
          options={[
            { value: "all" as const, label: "All", count: notices.length },
            { value: "unread" as const, label: "Unread", count: unread },
            ...kinds.map((k) => ({ value: k, label: noticeKindLabels[k], count: notices.filter((n) => n.kind === k).length })),
          ]}
        />
      </div>

      <div className={tableCardClass}>
        {list.length === 0 ? (
          <Empty icon={Bell} title="No notifications" />
        ) : (
          <ul className="divide-y divide-neutral-100">
            {page.rows.map((n) => {
              const b = db.bookings.find((x) => x.id === n.bookingId);
              const href = b ? `${ADMIN}/bookings/${b.id}` : n.kind === "review" ? `${ADMIN}/reviews` : n.kind === "user" ? `${ADMIN}/users` : undefined;
              return (
                <li key={n.id} className={cn("flex items-start gap-3 px-4 py-3", !n.read && "bg-sky-50/40")}>
                  <span className={cn("mt-2 size-2 shrink-0 rounded-full", n.read ? "bg-transparent" : "bg-sky-500")} />
                  <span className={cn("mt-0.5 shrink-0 rounded-md px-2 py-0.5 text-[11px] font-semibold", kindTone[n.kind])}>{noticeKindLabels[n.kind]}</span>
                  <div className="min-w-0 flex-1">
                    {href ? (
                      <Link href={href} onClick={() => markNoticesRead("staff", [n.id])} className={cn("block text-sm hover:text-sky-700", n.read ? "text-neutral-800" : "font-semibold text-neutral-900")}>
                        {n.title}
                      </Link>
                    ) : (
                      <p className={cn("text-sm", n.read ? "text-neutral-800" : "font-semibold text-neutral-900")}>{n.title}</p>
                    )}
                    <p className="text-sm text-neutral-500">{n.body}</p>
                  </div>
                  <span className="shrink-0 text-right text-xs text-neutral-400" title={formatDateTime(n.at)}>
                    {timeAgo(n.at, now || undefined)}
                  </span>
                  <span className="flex shrink-0">
                    {!n.read && (
                      <button onClick={() => markNoticesRead("staff", [n.id])} aria-label="Mark read" className={hbtn.icon}>
                        <CheckCheck className="size-4" />
                      </button>
                    )}
                    <button onClick={() => deleteNotice(n.id)} aria-label="Delete notification" className={hbtn.iconDanger}>
                      <Trash2 className="size-4" />
                    </button>
                  </span>
                </li>
              );
            })}
          </ul>
        )}
        <Pager {...page} noun="notifications" />
      </div>
    </div>
  );
}
