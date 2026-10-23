"use client";

import { useEffect, useRef, useState } from "react";
import { MessagesSquare, SendHorizontal, X } from "lucide-react";
import { useAutoGrow } from "@/src/hooks/useAutoGrow";
import {
  dateLabel,
  formatMobile,
  hotelDayOf,
  hotelTime,
} from "@/src/lib/hotel-store/format";
import {
  findThread,
  markThreadRead,
  phoneContext,
  sendGuestMessage,
  startGuestChat,
  useCurrentGuest,
  useHotelDB,
  useHydrated,
  useSession,
} from "@/src/lib/hotel-store/store";
import type { HotelDB } from "@/src/lib/hotel-store/types";
import { cn } from "@/src/lib/utils";

// text-base on phones: iOS zooms into inputs smaller than 16px.
const input =
  "h-10 w-full rounded-md border border-neutral-200 bg-white px-3 text-base outline-none transition placeholder:text-neutral-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 sm:text-sm";

const quickQuestions = [
  "Can I check in early?",
  "Please arrange an airport pickup.",
  "Can I change my booking dates?",
  "What time is check-out?",
  "How can I pay the remaining balance?",
  "Is breakfast included?",
  "Do you have a sea-view room available?",
  "Can I add an extra bed?",
];

/** Questions a guest is likely to ask, led by their current booking. While typing, only the ones that match. */
function suggestionsFor(db: HotelDB, phone: string, typed: string) {
  const booking = phoneContext(db, phone).bookings.find(
    (b) =>
      b.status === "pending" ||
      b.status === "confirmed" ||
      b.status === "checked-in"
  );
  const all = [
    ...(booking ? [`I have a question about my booking ${booking.code}.`] : []),
    ...quickQuestions,
  ];
  const q = typed.trim().toLowerCase();
  if (!q) return all;
  return all
    .filter((s) => s.toLowerCase().includes(q) && s.toLowerCase() !== q)
    .slice(0, 3);
}

/**
 * Website chat with the front desk. The guest's mobile number is their identity: every time the chat opens it asks
 * for the number first (the last one used is filled in), then shows that number's earlier messages. Closing the
 * chat logs out. Staff see every booking made with the number beside the conversation.
 */
export default function GuestChat() {
  const db = useHotelDB();
  const hydrated = useHydrated();
  const { chatPhone, chatName } = useSession();
  const guest = useCurrentGuest();
  const [open, setOpen] = useState(false);
  /** Number logged in for this open chat; cleared when the chat closes. */
  const [active, setActive] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const bottom = useRef<HTMLDivElement>(null);
  const box = useAutoGrow(text);

  // The badge follows the last number used in this browser, so replies are noticed before logging in again.
  const last = chatPhone ? findThread(db, chatPhone) : undefined;
  const unread = last?.guestUnread ?? 0;
  const thread = active ? findThread(db, active) : undefined;
  const activeUnread = thread?.guestUnread ?? 0;
  const count = thread?.messages.length ?? 0;
  const who = thread?.name ?? chatName ?? "";

  useEffect(() => {
    if (open && active && activeUnread > 0) markThreadRead(active, "guest");
  }, [open, active, activeUnread]);

  useEffect(() => {
    if (open) bottom.current?.scrollIntoView({ block: "end" });
  }, [open, count]);

  if (!hydrated) return null;

  const send = (message = text) => {
    if (!active) return;
    const r = sendGuestMessage({ phone: active, name: who, text: message });
    if (!r.ok) return setError(r.error);
    setError("");
    setText("");
    box.current?.focus();
  };

  const toggle = () => {
    if (!open) {
      // Fill the login form with the last number used here, or the signed-in account.
      setName(last?.name ?? chatName ?? guest?.name ?? "");
      setPhone(chatPhone ? formatMobile(chatPhone) : (guest?.phone ?? ""));
    }
    setActive(null);
    setText("");
    setError("");
    setOpen((o) => !o);
  };

  const logIn = () => {
    const r = startGuestChat(phone, name);
    if (!r.ok) return setError(r.error);
    setError("");
    setActive(r.value);
  };

  const suggestions = active ? suggestionsFor(db, active, text) : [];

  return (
    <>
      {!open && (
        <button
          onClick={toggle}
          aria-label={unread ? `Chat with us — ${unread} new` : "Chat with us"}
          title="Chat with us"
          className="group fixed bottom-6 right-4 z-50 flex size-14 items-center justify-center rounded-full bg-sky-600 text-white shadow-lg shadow-sky-900/30 transition hover:scale-110 hover:bg-sky-700 active:scale-95 md:right-6 print:hidden [body:has([data-booking-bar])_&]:bottom-24 lg:[body:has([data-booking-bar])_&]:bottom-6"
        >
          {/* Soft pulse so the button is noticed; motion-safe respects "reduce motion". */}
          <span
            aria-hidden
            className="absolute inset-0 rounded-full bg-sky-500 opacity-60 motion-safe:animate-ping [animation-duration:2s]"
          />
          <MessagesSquare className="relative size-6 transition-transform group-hover:rotate-[-8deg]" />
          {unread > 0 && (
            <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-rose-500 px-1 text-center text-[10px] font-bold leading-5 ring-2 ring-white">
              {unread}
            </span>
          )}
        </button>
      )}

      {open && (
        <section
          aria-label="Chat with the hotel"
          className="fixed bottom-4 right-4 z-[60] flex h-[min(36rem,calc(100dvh-2rem))] w-[min(23rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-2xl md:right-6 print:hidden"
        >
          <header className="flex items-start gap-3 bg-sky-900 px-4 py-3 text-white">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">
                {db.content.hotel.name} front desk
              </p>
              <p className="truncate text-xs text-sky-100/80">
                {active
                  ? `${who || "Guest"} · ${formatMobile(active)}`
                  : "Log in with your mobile number to chat."}
              </p>
            </div>
            <button
              onClick={toggle}
              aria-label="Close chat"
              className="rounded-md p-1 text-sky-100 hover:bg-white/10 hover:text-white"
            >
              <X className="size-4" />
            </button>
          </header>

          {active ? (
            <>
              <div className="min-h-0 flex-1 space-y-2 overflow-y-auto bg-neutral-50 px-3 py-4">
                <Bubble
                  mine={false}
                  by={db.content.hotel.name}
                  text={`Hi${who ? ` ${who.split(" ")[0]}` : ""}! How can we help you today?`}
                />
                {count > 0 && (
                  <p className="py-1 text-center text-[11px] text-neutral-400">
                    Earlier messages from {formatMobile(active)}
                  </p>
                )}
                {thread?.messages.map((m, i) => {
                  const day = hotelDayOf(m.at);
                  const newDay =
                    i === 0 || hotelDayOf(thread.messages[i - 1].at) !== day;
                  return (
                    <div key={m.id}>
                      {newDay && (
                        <p className="py-1 text-center text-[11px] font-medium text-neutral-400">
                          {dateLabel(day, "EEE, d MMM")}
                        </p>
                      )}
                      <Bubble
                        mine={m.from === "guest"}
                        by={m.by}
                        text={m.text}
                        at={hotelTime(m.at)}
                      />
                    </div>
                  );
                })}
                <div ref={bottom} />
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  send();
                }}
                className="border-t border-neutral-100 bg-white p-3"
              >
                {suggestions.length > 0 && (
                  <div
                    className="-mx-3 mb-2 flex gap-1.5 overflow-x-auto px-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                    // Scrollbar hidden: swipe on touch, and a mouse wheel scrolls the row sideways.
                    onWheel={(e) => {
                      if (e.deltaY) e.currentTarget.scrollLeft += e.deltaY;
                    }}
                    aria-label="Suggested messages"
                  >
                    {suggestions.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => send(s)}
                        className="shrink-0 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-800 transition hover:border-sky-400 hover:bg-sky-100"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
                {error && <p className="mb-2 text-xs text-rose-600">{error}</p>}
                <div className="flex items-end gap-2">
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
                    placeholder="Type a message…"
                    aria-label="Message"
                    className="block min-h-10 w-full resize-none rounded-md border border-neutral-200 bg-white px-3 py-2 text-base leading-6 outline-none transition placeholder:text-neutral-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 sm:text-sm sm:leading-6"
                  />
                  <button
                    disabled={!text.trim()}
                    aria-label="Send"
                    className="flex size-10 shrink-0 items-center justify-center rounded-md bg-sky-600 text-white transition hover:bg-sky-700 disabled:opacity-50"
                  >
                    <SendHorizontal className="size-4" />
                  </button>
                </div>
                <p className="mt-2 text-[11px] text-neutral-500">
                  Logged in as {formatMobile(active)} ·{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setActive(null);
                      setText("");
                    }}
                    className="font-medium text-sky-700 hover:underline"
                  >
                    Log out
                  </button>
                </p>
              </form>
            </>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                logIn();
              }}
              className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-4"
            >
              <div>
                <p className="font-semibold text-neutral-900">
                  Log in with your mobile number
                </p>
                <p className="mt-1 text-sm text-neutral-600">
                  We use it to find your booking and reply to you. If
                  you&apos;ve chatted with us before, your earlier messages will
                  show up.
                </p>
              </div>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-neutral-600">
                  Your name
                </span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  className={input}
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-neutral-600">
                  Mobile number
                </span>
                <input
                  autoFocus
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="01712-345678"
                  className={input}
                />
              </label>
              {error && <p className="text-xs text-rose-600">{error}</p>}
              <button className="mt-auto flex h-10 items-center justify-center gap-2 rounded-md bg-sky-600 text-sm font-semibold text-white hover:bg-sky-700">
                <MessagesSquare className="size-4" /> Log in &amp; chat
              </button>
            </form>
          )}
        </section>
      )}
    </>
  );
}

function Bubble({
  mine,
  by,
  text,
  at,
}: {
  mine: boolean;
  by?: string;
  text: string;
  at?: string;
}) {
  return (
    <div className={cn("flex", mine ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[85%] rounded-lg px-3 py-2 text-sm",
          mine
            ? "rounded-br-sm bg-sky-600 text-white"
            : "rounded-bl-sm border border-neutral-200 bg-white text-neutral-800"
        )}
      >
        {!mine && by && (
          <p className="mb-0.5 text-[11px] font-semibold text-sky-700">{by}</p>
        )}
        <p className="whitespace-pre-wrap break-words">{text}</p>
        {at && (
          <p
            className={cn(
              "mt-1 text-right text-[10px]",
              mine ? "text-sky-100" : "text-neutral-400"
            )}
          >
            {at}
          </p>
        )}
      </div>
    </div>
  );
}
