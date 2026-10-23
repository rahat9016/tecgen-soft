"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import {
  ArrowLeft,
  ChevronRight,
  Info,
  MessagesSquare,
  Search,
  SendHorizontal,
  UserRound,
  X,
} from "lucide-react";
import { useAutoGrow } from "@/src/hooks/useAutoGrow";
import {
  dateLabel,
  formatMobile,
  hotelDayOf,
  hotelTime,
  initials,
  rangeLabel,
  relativeDay,
  taka,
  todayKey,
} from "@/src/lib/hotel-store/format";
import { useT } from "@/src/lib/hotel-store/i18n";
import {
  dueOf,
  findThread,
  guestStats,
  markThreadRead,
  mobileKey,
  phoneContext,
  sendStaffMessage,
  threadsOf,
  useHotelDB,
  useNow,
} from "@/src/lib/hotel-store/store";
import type {
  ChatMessage,
  ChatThread,
  Settings,
} from "@/src/lib/hotel-store/types";
import { cn } from "@/src/lib/utils";
import { ADMIN, StatusBadge } from "./ui";

const digits = (s: string) => s.replace(/\D/g, "");

/** Ready-made answers to what guests ask most. Picking one fills the box so it can be edited before sending. */
const quickReplies = (first: string, s: Settings) => [
  `Hello ${first}, thanks for reaching out! How can we help?`,
  `Check-in is from ${s.checkInTime} and check-out is until ${s.checkOutTime}.`,
  "Early check-in is possible subject to availability. We'll keep your bags safe until the room is ready.",
  "We'll arrange an airport pickup. Please share your flight number and arrival time.",
  "You can pay the balance at the front desk by cash, card, bKash or Nagad.",
  "Your booking is confirmed. We look forward to welcoming you!",
  "Let me check that for you — I'll reply in a few minutes.",
  "Thank you! Let us know if you need anything else.",
];

const avatarTones = [
  "bg-sky-600",
  "bg-emerald-600",
  "bg-violet-600",
  "bg-amber-600",
  "bg-rose-600",
  "bg-teal-600",
  "bg-indigo-600",
];
/** Same colour for a number every time, so a guest is easy to spot in the list. */
const toneFor = (key: string) =>
  avatarTones[
    [...key].reduce((s, c) => s + c.charCodeAt(0), 0) % avatarTones.length
  ];

function Avatar({
  name,
  phone,
  className,
}: {
  name: string;
  phone: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-bold text-white",
        toneFor(phone),
        className
      )}
    >
      {/^[\d+]/.test(name) ? (
        <UserRound className="size-1/2" />
      ) : (
        initials(name)
      )}
    </span>
  );
}

/** Short stamp for the list: time today, weekday this week, date before that. */
function listStamp(iso: string, now: number) {
  const day = hotelDayOf(iso);
  if (day === todayKey()) return hotelTime(iso);
  return now && now - Date.parse(iso) < 6 * 86_400_000
    ? dateLabel(day, "EEE")
    : dateLabel(day, "d MMM");
}

/** Guest conversations, one per mobile number. Opens a number from `?phone=`, e.g. linked from a booking. */
export default function MessagesInbox() {
  const t = useT();
  const db = useHotelDB();
  const now = useNow(60_000);
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const selected = mobileKey(params.get("phone") ?? "");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const threads = threadsOf(db);
  const unreadCount = threads.filter((th) => th.staffUnread > 0).length;
  const q = query.trim().toLowerCase();
  const list = threads.filter(
    (th) =>
      (filter === "all" || th.staffUnread > 0) &&
      (!q ||
        th.name.toLowerCase().includes(q) ||
        (!!digits(q) && th.phone.includes(digits(q))))
  );
  const open = (phone: string | null) =>
    router.replace(
      phone ? `${pathname}?${new URLSearchParams({ phone })}` : pathname,
      { scroll: false }
    );

  return (
    // Fills the screen under the 4rem top bar and the shell's 1rem padding.
    <div className="flex h-[calc(100dvh-6rem)] min-h-[26rem] overflow-hidden rounded-lg border border-neutral-200 bg-white">
      <aside
        className={cn(
          "w-full min-w-0 flex-col border-neutral-200 md:flex md:w-80 md:border-r lg:w-96",
          selected ? "hidden" : "flex"
        )}
      >
        <div className="space-y-3 border-b border-neutral-100 p-3 sm:p-4">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-neutral-900">
              {t("Messages")}
            </h1>
            {unreadCount > 0 && (
              <span className="rounded-full bg-rose-500 px-2 text-xs font-bold leading-5 text-white">
                {unreadCount}
              </span>
            )}
          </div>
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              type="search"
              placeholder={t("Search name or number")}
              aria-label={t("Search name or number")}
              className="h-10 w-full rounded-full border border-neutral-200 bg-neutral-50 pl-9 pr-4 text-base outline-none transition placeholder:text-neutral-400 focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-100 sm:text-sm"
            />
          </label>
          <div role="tablist" className="flex gap-1.5">
            {(
              [
                ["all", t("All"), threads.length],
                ["unread", t("Unread"), unreadCount],
              ] as const
            ).map(([value, label, n]) => (
              <button
                key={value}
                role="tab"
                aria-selected={filter === value}
                onClick={() => setFilter(value)}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-semibold transition",
                  filter === value
                    ? "bg-sky-600 text-white"
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                )}
              >
                {label} <span className="tabular-nums opacity-75">{n}</span>
              </button>
            ))}
          </div>
        </div>

        <ul className="min-h-0 flex-1 overflow-y-auto p-1.5">
          {list.length === 0 && (
            <li className="flex flex-col items-center gap-2 px-6 py-16 text-center">
              <MessagesSquare className="size-8 text-neutral-300" />
              <p className="text-sm font-medium text-neutral-700">
                {q
                  ? t("No matches")
                  : filter === "unread"
                    ? t("All caught up")
                    : t("No messages yet")}
              </p>
              {!q && filter === "all" && (
                <p className="text-xs text-neutral-500">
                  {t(
                    "Guests can write to you from the chat button on the website."
                  )}
                </p>
              )}
            </li>
          )}
          {list.map((th) => {
            const last = th.messages[th.messages.length - 1];
            const active = th.phone === selected;
            return (
              <li key={th.phone}>
                <button
                  onClick={() => open(th.phone)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-md px-2.5 py-2.5 text-left transition",
                    active
                      ? "bg-sky-50 ring-1 ring-inset ring-sky-200"
                      : "hover:bg-neutral-50"
                  )}
                >
                  <Avatar
                    name={th.name}
                    phone={th.phone}
                    className="size-11 text-sm"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline gap-2">
                      <span
                        className={cn(
                          "truncate text-sm",
                          th.staffUnread
                            ? "font-bold text-neutral-900"
                            : "font-medium text-neutral-800"
                        )}
                      >
                        {th.name}
                      </span>
                      <span
                        className={cn(
                          "ml-auto shrink-0 text-[11px] tabular-nums",
                          th.staffUnread
                            ? "font-semibold text-sky-700"
                            : "text-neutral-400"
                        )}
                      >
                        {listStamp(th.updatedAt, now)}
                      </span>
                    </span>
                    <span className="mt-0.5 flex items-center gap-2">
                      <span
                        className={cn(
                          "truncate text-[13px]",
                          th.staffUnread
                            ? "font-medium text-neutral-800"
                            : "text-neutral-500"
                        )}
                      >
                        {last?.from === "staff" && (
                          <span className="text-neutral-400">{t("You")}: </span>
                        )}
                        {last?.text ?? formatMobile(th.phone)}
                      </span>
                      {th.staffUnread > 0 && (
                        <span className="ml-auto min-w-5 shrink-0 rounded-full bg-sky-600 px-1.5 text-center text-[10px] font-bold leading-5 text-white">
                          {th.staffUnread}
                        </span>
                      )}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </aside>

      {selected ? (
        <Conversation
          key={selected}
          phone={selected}
          thread={findThread(db, selected)}
          name={params.get("name") ?? ""}
          onBack={() => open(null)}
        />
      ) : (
        <section className="hidden flex-1 flex-col items-center justify-center gap-3 bg-neutral-50/60 p-8 text-center md:flex">
          <span className="flex size-16 items-center justify-center rounded-full bg-sky-50 text-sky-600">
            <MessagesSquare className="size-7" />
          </span>
          <p className="font-semibold text-neutral-900">
            {t("Pick a conversation")}
          </p>
          <p className="max-w-xs text-sm text-neutral-500">
            {t(
              "Guests write from the chat button on the website. Their bookings show beside the chat."
            )}
          </p>
        </section>
      )}
    </div>
  );
}

/** Messages from one sender within 5 minutes read as one block: one tail and one time stamp. */
const sameBlock = (a: ChatMessage | undefined, b: ChatMessage | undefined) =>
  !!a &&
  !!b &&
  a.from === b.from &&
  a.by === b.by &&
  hotelDayOf(a.at) === hotelDayOf(b.at) &&
  Date.parse(b.at) - Date.parse(a.at) < 5 * 60_000;

function Conversation({
  phone,
  thread,
  name,
  onBack,
}: {
  phone: string;
  thread?: ChatThread;
  name: string;
  onBack: () => void;
}) {
  const t = useT();
  const db = useHotelDB();
  const [text, setText] = useState("");
  const [info, setInfo] = useState(false);
  const bottom = useRef<HTMLDivElement>(null);
  const box = useAutoGrow(text, 140);
  const ctx = phoneContext(db, phone);
  const title =
    thread?.name ||
    name ||
    ctx.users[0]?.name ||
    ctx.bookings[0]?.guest.name ||
    formatMobile(phone);
  const messages = thread?.messages ?? [];
  const unread = thread?.staffUnread ?? 0;

  // Reading the conversation clears its unread count and alerts.
  useEffect(() => {
    if (unread > 0) markThreadRead(phone, "staff");
  }, [phone, unread]);

  useEffect(() => {
    bottom.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  const send = () => {
    const r = sendStaffMessage(phone, text, title);
    if (!r.ok) return toast.error(t(r.error));
    setText("");
    box.current?.focus();
  };

  // While typing, only the replies that match; otherwise all of them.
  const typed = text.trim().toLowerCase();
  const replies = quickReplies(title.split(" ")[0], db.settings).filter(
    (r) =>
      !typed || (r.toLowerCase().includes(typed) && r.toLowerCase() !== typed)
  );

  return (
    <>
      <section className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-neutral-100 px-2 sm:gap-3 sm:px-4">
          <button
            onClick={onBack}
            aria-label={t("Back to conversations")}
            className="flex size-9 shrink-0 items-center justify-center rounded-full text-neutral-600 hover:bg-neutral-100 md:hidden"
          >
            <ArrowLeft className="size-5" />
          </button>
          <button
            onClick={() => setInfo(true)}
            className="flex min-w-0 flex-1 items-center gap-3 text-left 2xl:pointer-events-none"
          >
            <Avatar name={title} phone={phone} className="size-10 text-sm" />
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold text-neutral-900">
                {title}
              </span>
              <span className="block truncate text-xs tabular-nums text-neutral-500">
                {formatMobile(phone)}
                {ctx.bookings[0] &&
                  ` · ${ctx.bookings.length} ${t("bookings")}`}
              </span>
            </span>
          </button>
          <button
            onClick={() => setInfo((v) => !v)}
            aria-label={t("Guest details")}
            title={t("Guest details")}
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-full hover:bg-sky-50 2xl:hidden",
              info ? "bg-sky-50 text-sky-700" : "text-neutral-500"
            )}
          >
            <Info className="size-4.5" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto bg-neutral-50 px-3 py-4 sm:px-6">
          {messages.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
              <Avatar name={title} phone={phone} className="size-14 text-lg" />
              <p className="text-sm font-medium text-neutral-800">{title}</p>
              <p className="max-w-xs text-sm text-neutral-500">
                {t("No messages with this number yet. Say hello below.")}
              </p>
            </div>
          )}
          {messages.map((m, i) => {
            const prev = messages[i - 1];
            const next = messages[i + 1];
            const newDay = !prev || hotelDayOf(prev.at) !== hotelDayOf(m.at);
            const first = !sameBlock(prev, m);
            const lastInBlock = !sameBlock(m, next);
            const mine = m.from === "staff";
            return (
              <Fragment key={m.id}>
                {newDay && (
                  <div className="my-3 flex justify-center">
                    <span className="rounded-full bg-white px-3 py-0.5 text-[11px] font-medium text-neutral-500 shadow-sm ring-1 ring-neutral-200">
                      {t(relativeDay(hotelDayOf(m.at)))}
                    </span>
                  </div>
                )}
                <div
                  className={cn(
                    "flex",
                    mine ? "justify-end" : "justify-start",
                    first ? "mt-3" : "mt-0.5"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[85%] px-3.5 py-2 text-sm shadow-sm sm:max-w-[70%]",
                      mine
                        ? "rounded-2xl bg-sky-600 text-white"
                        : "rounded-2xl bg-white text-neutral-800 ring-1 ring-neutral-200",
                      lastInBlock && (mine ? "rounded-br-md" : "rounded-bl-md")
                    )}
                  >
                    {mine && first && m.by && (
                      <p className="mb-0.5 text-[11px] font-semibold text-sky-100">
                        {m.by}
                      </p>
                    )}
                    <p className="whitespace-pre-wrap break-words">{m.text}</p>
                    {lastInBlock && (
                      <p
                        className={cn(
                          "mt-1 text-right text-[10px] tabular-nums",
                          mine ? "text-sky-100" : "text-neutral-400"
                        )}
                      >
                        {hotelTime(m.at)}
                      </p>
                    )}
                  </div>
                </div>
              </Fragment>
            );
          })}
          <div ref={bottom} />
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
          className="shrink-0 border-t border-neutral-100 bg-white px-3 pb-3 pt-2 sm:px-4"
        >
          {replies.length > 0 && (
            <div
              className="-mx-3 mb-2 flex gap-1.5 overflow-x-auto px-3 [scrollbar-width:none] sm:-mx-4 sm:px-4 [&::-webkit-scrollbar]:hidden"
              aria-label={t("Quick replies")}
              // Scrollbar hidden: swipe on touch, and a mouse wheel scrolls the row sideways.
              onWheel={(e) => {
                if (e.deltaY) e.currentTarget.scrollLeft += e.deltaY;
              }}
            >
              {replies.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => {
                    setText(r);
                    box.current?.focus();
                  }}
                  title={r}
                  className="max-w-64 shrink-0 truncate rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-800 transition hover:border-sky-400 hover:bg-sky-100"
                >
                  {r}
                </button>
              ))}
            </div>
          )}
          <div className="flex items-end gap-2 rounded-2xl border border-neutral-200 bg-neutral-50 p-1.5 pl-4 transition focus-within:border-sky-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-sky-100">
            <textarea
              ref={box}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" &&
                  !e.shiftKey &&
                  !e.nativeEvent.isComposing
                ) {
                  e.preventDefault();
                  send();
                }
              }}
              rows={1}
              maxLength={1000}
              placeholder={t("Write a reply…")}
              aria-label={t("Reply")}
              className="block min-h-9 w-full resize-none bg-transparent py-1.5 text-base leading-6 outline-none placeholder:text-neutral-400 sm:text-sm sm:leading-6"
            />
            <button
              disabled={!text.trim()}
              aria-label={t("Send")}
              className="flex size-9 shrink-0 items-center justify-center rounded-full bg-sky-600 text-white transition hover:bg-sky-700 disabled:bg-neutral-300"
            >
              <SendHorizontal className="size-4" />
            </button>
          </div>
        </form>
      </section>

      {/* Guest details: a column on very wide screens, a slide-over panel everywhere else. */}
      {info && (
        <button
          aria-label={t("Close")}
          onClick={() => setInfo(false)}
          className="fixed inset-0 z-40 bg-black/30 2xl:hidden"
        />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 right-0 z-50 w-[min(22rem,100vw)] flex-col overflow-y-auto border-l border-neutral-200 bg-white shadow-xl 2xl:static 2xl:z-auto 2xl:flex 2xl:w-80 2xl:shadow-none",
          info ? "flex" : "hidden"
        )}
      >
        <GuestPanel
          phone={phone}
          title={title}
          onClose={() => setInfo(false)}
        />
      </aside>
    </>
  );
}

function GuestPanel({
  phone,
  title,
  onClose,
}: {
  phone: string;
  title: string;
  onClose: () => void;
}) {
  const t = useT();
  const db = useHotelDB();
  const ctx = phoneContext(db, phone);
  const user = ctx.users[0];
  const stats = user ? guestStats(db, user.id) : undefined;

  return (
    <>
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-neutral-100 px-4">
        <p className="text-sm font-semibold text-neutral-900">
          {t("Guest details")}
        </p>
        <button
          onClick={onClose}
          aria-label={t("Close")}
          className="flex size-8 items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-100 2xl:hidden"
        >
          <X className="size-4" />
        </button>
      </div>
      <div className="flex flex-col items-center gap-1 border-b border-neutral-100 px-4 py-5 text-center">
        <Avatar name={title} phone={phone} className="size-16 text-xl" />
        <p className="mt-2 font-semibold text-neutral-900">{title}</p>
        <a
          href={`tel:${phone}`}
          className="text-sm tabular-nums text-sky-700 hover:underline"
        >
          {formatMobile(phone)}
        </a>
        {user?.email && (
          <p className="text-xs text-neutral-500">{user.email}</p>
        )}
        {user && (
          <span className="mt-1 rounded-full bg-violet-50 px-2.5 py-0.5 text-[11px] font-medium text-violet-700">
            {user.passwordHash ? t("Has an account") : t("Guest profile")}
          </span>
        )}
      </div>

      {stats && (
        <dl className="grid grid-cols-3 divide-x divide-neutral-100 border-b border-neutral-100 text-center">
          {(
            [
              [t("Stays"), stats.stays],
              [t("Nights"), stats.nights],
              [t("Spent"), taka(stats.spent)],
            ] as const
          ).map(([label, value]) => (
            <div key={label} className="px-2 py-3">
              <dt className="text-[11px] text-neutral-500">{label}</dt>
              <dd className="text-sm font-semibold tabular-nums text-neutral-900">
                {value}
              </dd>
            </div>
          ))}
        </dl>
      )}

      {user?.note && (
        <div className="border-b border-neutral-100 px-4 py-3">
          <p className="text-[11px] font-medium uppercase tracking-wide text-neutral-400">
            {t("Note")}
          </p>
          <p className="mt-0.5 text-sm text-neutral-700">{user.note}</p>
        </div>
      )}

      <div className="px-4 py-3">
        <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-neutral-400">
          {t("Bookings")} · {ctx.bookings.length}
        </p>
        {ctx.bookings.length === 0 && (
          <p className="text-sm text-neutral-500">
            {t("No bookings with this number.")}
          </p>
        )}
        <ul className="space-y-2">
          {ctx.bookings.slice(0, 8).map((b) => {
            const due = dueOf(b);
            return (
              <li key={b.id}>
                <Link
                  href={`${ADMIN}/bookings/${b.id}`}
                  className="group flex items-center gap-2 rounded-md border border-neutral-200 p-2.5 transition hover:border-sky-300 hover:bg-sky-50/40"
                >
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-sky-800">
                        {b.code}
                      </span>
                      <StatusBadge
                        status={b.status}
                        className="px-2 py-0.5 text-[10px]"
                      />
                    </span>
                    <span className="mt-1 block truncate text-xs text-neutral-700">
                      {b.roomName}
                    </span>
                    <span className="block text-[11px] text-neutral-500">
                      {rangeLabel(b.checkIn, b.checkOut)}
                      {due > 0 && (
                        <span className="font-medium text-rose-600">
                          {" "}
                          · {t("Due")} {taka(due)}
                        </span>
                      )}
                    </span>
                  </span>
                  <ChevronRight className="size-4 shrink-0 text-neutral-300 group-hover:text-sky-600" />
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}
