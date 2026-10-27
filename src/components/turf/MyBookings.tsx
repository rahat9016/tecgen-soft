"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { ArrowUpRight, Phone, Search, Ticket as TicketIcon } from "lucide-react";
import { dateLabel, formatDuration, hourLabel, payLabels, rangeLabel, relativeDay, taka } from "@/src/lib/turf-store/format";
import { dueOf, endMs, paidOf, startMs, useHydrated, useNow, useTurfDB } from "@/src/lib/turf-store/store";
import type { Booking } from "@/src/lib/turf-store/types";
import { cn } from "@/src/lib/utils";
import { BookingStatusBadge, Loader, tbtn } from "./ui";

const EASE = [0.22, 1, 0.36, 1] as const;

/** Fade-and-rise used for each result block; `delay` staggers blocks after a search. */
function Reveal({ delay = 0, className, children }: { delay?: number; className?: string; children: React.ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

const PHONE_KEY = "turfhub:phone";
const BD_PHONE = /^01[3-9]\d{8}$/;

function savedPhone() {
  try {
    return localStorage.getItem(PHONE_KEY) ?? "";
  } catch {
    return "";
  }
}

/** What the visitor is looking up: every booking on a mobile number, or a single booking by its code. */
type Query = { kind: "phone"; value: string } | { kind: "code"; value: string } | null;

/** "01712345678" → phone; "TH-1042", "th1042" or "1042" → code "TH-1042". */
function parseQuery(raw: string): Query | { error: string } {
  const v = raw.trim().toUpperCase().replace(/\s+/g, "");
  if (!v) return { error: "Enter your mobile number or booking code." };
  // Booking codes never start with 0, so a leading 0 always means a mobile number.
  if (/^\+?(88)?0[\d-]*$/.test(v)) {
    const digits = v.replace(/\D/g, "").replace(/^88/, "");
    return BD_PHONE.test(digits) ? { kind: "phone", value: digits } : { error: "That mobile number doesn't look right — use 11 digits, e.g. 01712345678." };
  }
  const code = v.match(/^(?:TH-?)?(\d{3,6})$/);
  if (code) return { kind: "code", value: `TH-${code[1]}` };
  return { error: "Enter an 11-digit mobile number (01XXXXXXXXX) or a booking code like TH-1042." };
}

export default function MyBookings() {
  const db = useTurfDB();
  const hydrated = useHydrated();
  const now = useNow(1000);
  const params = useSearchParams();
  const freshCode = params.get("code");
  // The page renders a loader until hydrated, so reading storage in the initializers is safe.
  const [query, setQuery] = useState<Query>(() => {
    const p = savedPhone();
    return p ? { kind: "phone", value: p } : freshCode ? { kind: "code", value: freshCode } : null;
  });
  const [input, setInput] = useState(() => savedPhone() || freshCode || "");
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"phone" | "code">(() => (!savedPhone() && freshCode ? "code" : "phone"));
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  // After a search, results appear under the form on the same page; scroll them into view.
  const scrollToResults = useRef(false);
  useEffect(() => {
    if (!scrollToResults.current) return;
    scrollToResults.current = false;
    document.getElementById("mb-results")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [query]);

  if (!hydrated) return <Loader />;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = parseQuery(input);
    if (q && "error" in q) return setError(q.error);
    if (q && q.kind !== mode)
      return setError(mode === "phone" ? "Enter the 11-digit mobile number you booked with, e.g. 01712345678." : "Enter a booking code like TH-1042.");
    setError("");
    scrollToResults.current = true;
    setQuery(q);
    setTab("upcoming");
    if (q?.kind === "phone") {
      try {
        localStorage.setItem(PHONE_KEY, q.value);
      } catch {}
    }
  };

  const mine =
    query?.kind === "phone"
      ? db.bookings.filter((b) => b.customer.phone === query.value)
      : query?.kind === "code"
        ? db.bookings.filter((b) => b.code === query.value)
        : [];
  const isUpcoming = (b: Booking) => endMs(b) > now && b.status !== "cancelled";
  const upcoming = mine.filter(isUpcoming).sort((a, b) => startMs(a) - startMs(b));
  const past = mine.filter((b) => !isUpcoming(b)).sort((a, b) => startMs(b) - startMs(a));
  const featured = query?.kind === "code" ? mine[0] : upcoming[0];
  // Only tabs with bookings in them; the whole list disappears when there's nothing beyond the featured ticket.
  const groups = (
    [
      { k: "upcoming", label: "More upcoming", items: upcoming.slice(query?.kind === "phone" ? 1 : 0) },
      { k: "past", label: "Past", items: past },
    ] as const
  ).filter((g) => g.items.length > 0);
  const shown = groups.find((g) => g.k === tab) ?? groups[0];

  return (
    <div className="bg-neutral-50">
      {/* Search stays on top; with no search yet it fills the screen, after a search it shrinks and results follow below. */}
      <div className={cn("relative isolate flex overflow-hidden bg-emerald-950 pt-32", query ? "pb-14" : "min-h-svh items-center pb-16")}>
        <PitchBackdrop />
        <div className="mx-auto w-full max-w-2xl px-4 text-center">
          <h1 className="text-fluid-6xl font-semibold tracking-tight text-white">Find your booking</h1>
          <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-white/65">
            Your mobile number shows every booking you&apos;ve made. A booking code shows just that one.
          </p>

          <form onSubmit={submit} noValidate className="mt-10 text-left">
            <div role="tablist" aria-label="Look up by" className="mx-auto flex w-fit rounded-full bg-white/[0.07] p-1 ring-1 ring-white/10">
              {(
                [
                  ["phone", "Mobile number"],
                  ["code", "Booking code"],
                ] as const
              ).map(([k, l]) => (
                <button
                  key={k}
                  type="button"
                  role="tab"
                  aria-selected={mode === k}
                  onClick={() => {
                    setMode(k);
                    setInput("");
                    setError("");
                  }}
                  className={cn(
                    "rounded-full px-5 py-2 text-sm font-medium transition",
                    mode === k ? "bg-white text-emerald-950" : "text-white/70 hover:text-white"
                  )}
                >
                  {l}
                </button>
              ))}
            </div>

            <div
              className={cn(
                "mt-5 flex items-center gap-2 rounded-2xl bg-white p-2 shadow-2xl shadow-black/30 ring-2 transition",
                error ? "ring-rose-400" : "ring-transparent focus-within:ring-white/40"
              )}
            >
              {mode === "phone" ? (
                <Phone className="ml-3 size-5 shrink-0 text-neutral-400" />
              ) : (
                <TicketIcon className="ml-3 size-5 shrink-0 text-neutral-400" />
              )}
              <input
                id="mb-q"
                autoFocus={!query}
                aria-label={mode === "phone" ? "Mobile number" : "Booking code"}
                autoComplete={mode === "phone" ? "tel" : "off"}
                inputMode={mode === "phone" ? "tel" : "text"}
                className="h-14 min-w-0 flex-1 bg-transparent text-lg tracking-wide text-neutral-900 outline-none placeholder:text-neutral-400"
                placeholder={mode === "phone" ? "01XXXXXXXXX" : "TH-1042"}
                value={input}
                onChange={(e) => {
                  const v = e.target.value.slice(0, 16);
                  // Typing letters means it's a code; a leading 0 means it's a phone number.
                  if (mode === "phone" && /[a-z]/i.test(v)) setMode("code");
                  if (mode === "code" && /^0/.test(v)) setMode("phone");
                  setInput(v);
                  setError("");
                }}
                aria-invalid={!!error}
                aria-describedby="mb-hint"
              />
              <button className={cn(tbtn.lime, "h-14 px-7 text-base")}>
                <Search className="size-4" /> Find
              </button>
            </div>
            <p id="mb-hint" className={cn("mt-3 text-center text-sm", error ? "text-rose-300" : "text-white/50")}>
              {error || (mode === "phone" ? "The number you entered when you booked." : "Shown after you paid the advance — looks like TH-1042.")}
            </p>
          </form>
        </div>
      </div>

      {query && (
        <div key={`${query.kind}:${query.value}`} id="mb-results" className="mx-auto min-h-[40vh] max-w-7xl scroll-mt-24 px-4 pb-20 pt-10 md:px-8">
          {query && !mine.length && (
            <Reveal className="mt-12 text-center">
              <p className="text-lg font-medium text-neutral-900">
                {query.kind === "phone" ? "No bookings on this number yet." : `No booking found with code ${query.value}.`}
              </p>
              <p className="mt-1 text-sm text-neutral-500">
                {query.kind === "phone" ? "Booked with a different number? Change it above." : "Check the code, or look up with your mobile number instead."}
              </p>
              <Link href="/turf/book" className={cn(tbtn.green, "mt-6")}>
                Book a slot
              </Link>
            </Reveal>
          )}

          {featured && (
            <Reveal delay={0.05} className="mt-10">
              <Ticket b={featured} now={now} />
            </Reveal>
          )}

          {query?.kind === "phone" && shown && (
            <Reveal delay={0.25} className="mt-12">
              <div className="flex gap-6 border-b border-neutral-200 text-sm">
                {groups.map((g) => (
                  <button
                    key={g.k}
                    onClick={() => setTab(g.k)}
                    aria-pressed={shown.k === g.k}
                    className={cn(
                      "-mb-px border-b-2 pb-3",
                      shown.k === g.k ? "border-emerald-800 font-semibold text-neutral-900" : "border-transparent text-neutral-500 hover:text-neutral-900"
                    )}
                  >
                    {g.label} ({g.items.length})
                  </button>
                ))}
              </div>
              {/* Keyed by tab so switching tabs replays the row stagger. */}
              <ul key={shown.k} className="divide-y divide-neutral-200">
                {shown.items.map((b, i) => (
                  <Row key={b.id} b={b} index={i} />
                ))}
              </ul>
            </Reveal>
          )}
        </div>
      )}
    </div>
  );
}

/** Faint pitch markings (centre circle + halfway line) behind the dark bands. */
function PitchBackdrop() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 800 400"
      preserveAspectRatio="xMidYMid slice"
      className="pointer-events-none absolute inset-0 -z-10 size-full text-white/[0.05]"
      fill="none"
    >
      <g stroke="currentColor" strokeWidth="2">
        <path d="M400 0V400" />
        <circle cx="400" cy="200" r="110" />
        <path d="M0 110H90V290H0M800 110H710V290H800" />
      </g>
      <circle cx="400" cy="200" r="5" fill="currentColor" />
    </svg>
  );
}

/** The featured booking, styled as a match ticket with a tear-off stub carrying the code. */
function Ticket({ b, now }: { b: Booking; now: number }) {
  const db = useTurfDB();
  const court = db.courts.find((c) => c.id === b.courtId);
  const until = startMs(b) - now;
  const live = until <= 0 && endMs(b) > now && b.status !== "cancelled";
  const paid = paidOf(b);
  const due = dueOf(b);
  const directions = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(db.settings.address)}`;
  const ended = endMs(b) <= now;
  const reduce = useReducedMotion();

  return (
    <article className="relative grid overflow-hidden rounded-3xl bg-white ring-1 ring-neutral-200 md:grid-cols-[1fr_15rem]">
      <div className="p-6 md:p-8">
        {/* Status and countdown only matter until the game is over. */}
        {!ended && (
          <div className="mb-5 flex flex-wrap items-center gap-3">
            {b.status !== "pending" && <BookingStatusBadge booking={b} />}
            {b.status !== "cancelled" && (
              <span className="text-sm font-medium text-emerald-700">{live ? "Playing now" : `Kick-off in ${formatDuration(until)}`}</span>
            )}
          </div>
        )}
        <p className="text-3xl font-semibold tracking-tight text-neutral-900 md:text-4xl">
          {relativeDay(b.date) === dateLabel(b.date)
            ? dateLabel(b.date, { weekday: "long", day: "numeric", month: "long" })
            : `${relativeDay(b.date)}, ${dateLabel(b.date, { day: "numeric", month: "long" })}`}
        </p>
        <p className="mt-1 text-xl text-neutral-700">
          {rangeLabel(b.startHour, b.duration)} <span className="text-neutral-400">·</span> {b.duration} hr{b.duration > 1 ? "s" : ""}
        </p>
        <p className="mt-1 text-sm text-neutral-500">
          {court?.name ?? "Ground"}
          {court && ` · ${court.size.split(" · ")[0]}`}
          {b.customer.team && ` · ${b.customer.team}`}
        </p>

        <dl className="mt-6 grid grid-cols-3 border-t border-neutral-200 pt-4 text-sm">
          <div>
            <dt className="text-neutral-500">Total</dt>
            <dd className="mt-0.5 font-semibold text-neutral-900">{taka(b.total)}</dd>
          </div>
          <div>
            <dt className="text-neutral-500">Paid</dt>
            <dd className="mt-0.5 font-semibold text-neutral-900">
              {taka(paid)}
              {b.payments[0] && <span className="font-normal text-neutral-500"> · {payLabels[b.payments[0].method]}</span>}
            </dd>
          </div>
          <div>
            <dt className="text-neutral-500">Due at venue</dt>
            <dd className={cn("mt-0.5 font-semibold", due > 0 ? "text-orange-600" : "text-emerald-700")}>{due > 0 ? taka(due) : "Nothing"}</dd>
          </div>
        </dl>

        <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm">
          <a href={directions} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-semibold text-emerald-800 hover:underline">
            Get directions <ArrowUpRight className="size-4" />
          </a>
        </div>
      </div>

      {/* Tear-off stub: slides in after the ticket lands */}
      <motion.div
        initial={reduce ? false : { opacity: 0, x: 28 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.35, ease: EASE }}
        className="relative flex flex-col items-center justify-center gap-1 border-t-2 border-dashed border-neutral-200 bg-emerald-950 p-6 text-center text-white md:border-l-2 md:border-t-0"
      >
        <span className="absolute -left-3 -top-3 hidden size-6 rounded-full bg-neutral-50 md:block" />
        <span className="absolute -bottom-3 -left-3 hidden size-6 rounded-full bg-neutral-50 md:block" />
        <p className="text-xs uppercase tracking-[0.16em] text-white/50">Booking code</p>
        <p className="font-mono text-3xl font-semibold tracking-wider text-white">{b.code}</p>
        <p className="mt-2 text-xs text-white/60">Show this at the front desk</p>
        <p className="mt-4 text-xs text-white/50">Kick-off {hourLabel(b.startHour)}</p>
      </motion.div>
    </article>
  );
}

function Row({ b, index }: { b: Booking; index: number }) {
  const due = dueOf(b);
  const reduce = useReducedMotion();
  return (
    <motion.li
      initial={reduce ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.4), ease: EASE }}
      className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 py-5 md:grid-cols-[11rem_1fr_9rem_auto]"
    >
      <div>
        <p className="font-semibold text-neutral-900">{dateLabel(b.date)}</p>
        <p className="text-sm text-neutral-500">{rangeLabel(b.startHour, b.duration)}</p>
      </div>
      <div className="order-last col-span-2 flex flex-wrap items-center gap-3 md:order-none md:col-span-1">
        {b.status !== "pending" && <BookingStatusBadge booking={b} />}
        <span className="font-mono text-xs text-neutral-500">{b.code}</span>
      </div>
      <p className="text-sm text-neutral-500 max-md:hidden">{b.status === "cancelled" ? "—" : due > 0 ? `${taka(due)} due at venue` : "Fully paid"}</p>
      <p className="text-right font-semibold text-neutral-900">{taka(b.total)}</p>
    </motion.li>
  );
}
