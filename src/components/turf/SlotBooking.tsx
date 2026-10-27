"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardPaste,
  Clock,
  Copy,
  Hourglass,
  LayoutGrid,
  Lock,
  Rows3,
  Users,
} from "lucide-react";
import {
  addDays,
  dateLabel,
  formatDuration,
  hourLabel,
  hourShort,
  payLabels,
  slotTime,
  taka,
  todayYmd,
} from "@/src/lib/turf-store/format";
import {
  createOnlineBooking,
  findConflict,
  freeSlots,
  trxUsed,
  getClientId,
  holdSlot,
  hoursOf,
  quote,
  releaseHold,
  slotInfo,
  useHydrated,
  useNow,
  useTurfDB,
  type SlotInfo,
} from "@/src/lib/turf-store/store";
import type { Court, PayMethod } from "@/src/lib/turf-store/types";
import { cn } from "@/src/lib/utils";
import DateCalendar from "./DateCalendar";
import { inputClass, labelClass, Loader, SportIcon } from "./ui";

const PHONE_KEY = "turfhub:phone";

function cellTone(info: SlotInfo, selected: boolean) {
  if (selected) return "bg-emerald-800 text-white ring-emerald-800";
  switch (info.kind) {
    case "free":
      return "bg-white text-neutral-800 ring-neutral-200 hover:ring-emerald-500 hover:bg-emerald-50";
    case "held":
      return info.mine ? "bg-emerald-800 text-white ring-emerald-800" : "bg-amber-50 text-amber-700 ring-amber-200";
    case "booked":
      return "bg-neutral-100 text-neutral-400 ring-neutral-100 line-through decoration-neutral-300";
    case "blocked":
      return "bg-[repeating-linear-gradient(45deg,#f5f5f5,#f5f5f5_6px,#ebebeb_6px,#ebebeb_12px)] text-neutral-400 ring-neutral-100";
    case "past":
      return "bg-neutral-50 text-neutral-300 ring-neutral-100";
  }
}

const cellNote = (info: SlotInfo) =>
  info.kind === "free"
    ? taka(info.price)
    : info.kind === "held"
      ? info.mine
        ? "Yours"
        : "On hold"
      : info.kind === "booked"
        ? "Booked"
        : info.kind === "blocked"
          ? "Closed"
          : "Past";

export default function SlotBooking() {
  const db = useTurfDB();
  const hydrated = useHydrated();
  const now = useNow(1000);
  const router = useRouter();
  const params = useSearchParams();
  const [clientId] = useState(getClientId);

  const courts = db.courts.filter((c) => c.active);

  const [courtId, setCourtId] = useState(params.get("court") ?? "");
  const [date, setDate] = useState(params.get("date") ?? "");
  const [start, setStart] = useState<number | null>(params.get("start") ? Number(params.get("start")) : null);
  const [duration, setDuration] = useState(Number(params.get("duration")) || 1);
  const [view, setView] = useState<"court" | "all">("court");
  // With a single ground the ground picker and the all-courts grid add nothing.
  const multiCourt = courts.length > 1;
  const [paying, setPaying] = useState(false);
  // Week shown in the day picker; until the visitor pages, it follows the selected date.
  const [weekPick, setWeekPick] = useState<number | null>(null);

  const today = hydrated ? todayYmd() : "";
  const day = date || today;
  const days = hydrated ? Array.from({ length: db.settings.bookingWindowDays }, (_, i) => addDays(today, i)) : [];
  const court = courts.find((c) => c.id === courtId) ?? courts[0];
  const hours = hoursOf(db.settings);
  // Hours that have started can never be booked again, so today's grid only lists what is still ahead.
  const upcoming = hours.filter((h) => slotTime(day, h) > now);

  const myHold = db.holds.find((h) => h.clientId === clientId && h.expiresAt > now);

  // A refresh mid-payment brings the customer straight back to the payment step.
  useEffect(() => {
    if (!myHold || paying) return;
    setCourtId(myHold.courtId);
    setDate(myHold.date);
    setStart(myHold.startHour);
    setDuration(myHold.duration);
    setPaying(true);
    // Only on first sight of the hold.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myHold?.id]);

  useEffect(() => {
    if (paying && hydrated && clientId && !myHold) {
      setPaying(false);
      toast.warn("Your slot hold expired. Pick the slot again to continue.");
    }
  }, [paying, myHold, hydrated, clientId]);

  const selection = court && start !== null ? { courtId: court.id, date: day, startHour: start, duration } : null;
  const conflict = selection && hydrated ? findConflict(db, selection, { clientId, now }) : null;
  const price = selection && court ? quote(court, selection.startHour, selection.duration, db.settings) : null;
  const peakHours = selection
    ? Array.from({ length: selection.duration }, (_, i) => selection.startHour + i).filter((h) => h >= db.settings.peakStartHour).length
    : 0;

  const pickCell = (c: Court, h: number) => {
    const info = slotInfo(db, c, day, h, now, clientId);
    if (info.kind !== "free" && !(info.kind === "held" && info.mine)) return;
    setCourtId(c.id);
    setStart(h);
    // Keep the chosen length if it still fits, otherwise shrink to what does.
    let d = duration;
    while (d > 1 && findConflict(db, { courtId: c.id, date: day, startHour: h, duration: d }, { clientId, now })) d--;
    setDuration(d);
  };

  const proceed = () => {
    if (!selection) return;
    const r = holdSlot(selection, clientId);
    if (!r.ok) {
      toast.error(r.error);
      return;
    }
    setPaying(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!hydrated || !clientId || !court) return <Loader />;

  const weeks = Math.ceil(days.length / 7);
  const week = weekPick ?? Math.max(0, Math.floor(days.indexOf(day) / 7));
  const weekDays = days.slice(week * 7, week * 7 + 7);
  const { peakStartHour, advancePercent, holdMinutes, maxDuration } = db.settings;
  const groups = [
    { label: `Morning & Afternoon`, hs: upcoming.filter((h) => h < peakStartHour) },
    { label: "Evening", hs: upcoming.filter((h) => h >= peakStartHour) },
  ];
  const offPeakOnly = peakHours === 0;
  const allPeak = selection ? peakHours === selection.duration : false;

  return (
    <div className="bg-[#f7f6f1]">
      <div className="mx-auto max-w-7xl px-4 pb-16 pt-6 md:px-8 md:pt-10">
        {/* The payment step opens straight on the form; its heading stays for screen readers. */}
        <h1 className={cn("text-fluid-6xl font-semibold tracking-tight text-neutral-900", paying && "sr-only")}>
          {paying ? "Complete your booking" : "Book the ground"}
        </h1>
        {!paying && <p className="mt-3 text-base text-neutral-500 md:text-lg">Pick your day. Choose your time. Get playing.</p>}

        {paying && selection && price ? (
          <div>
            <PaymentStep
              court={court}
              selection={selection}
              price={price}
              expiresAt={myHold?.expiresAt ?? now}
              now={now}
              clientId={clientId}
              onBack={() => {
                releaseHold(clientId);
                setPaying(false);
              }}
              onDone={(code, phone) => {
                try {
                  localStorage.setItem(PHONE_KEY, phone);
                } catch {}
                // Booking consumed the hold; leaving payment mode stops the "hold expired" warning from firing.
                setPaying(false);
                router.push(`/turf/my-bookings?code=${code}`);
              }}
            />
          </div>
        ) : (
          <>
            <div className="mt-6 grid gap-6 md:mt-8 lg:grid-cols-[1fr_440px] lg:items-start">
              {/* Steps */}
              <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-black/[0.04] sm:p-5 md:p-6">
                {multiCourt && (
                  <div className="mb-6 flex flex-wrap items-center gap-2 border-b border-neutral-100 pb-6">
                    <select
                      aria-label="Ground"
                      value={court.id}
                      onChange={(e) => {
                        setCourtId(e.target.value);
                        setStart(null);
                      }}
                      className="h-10 rounded-lg border border-neutral-200 bg-white px-3 text-sm"
                    >
                      {courts.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    <div className="flex rounded-lg bg-neutral-100 p-1">
                      {[
                        { v: "court" as const, l: "One ground", i: Rows3 },
                        { v: "all" as const, l: "All grounds", i: LayoutGrid },
                      ].map((o) => (
                        <button
                          key={o.v}
                          onClick={() => setView(o.v)}
                          className={cn(
                            "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium",
                            view === o.v ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500"
                          )}
                        >
                          <o.i className="size-3.5" /> {o.l}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 01 Day */}
                <Step n={1} state="done">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <StepTitle n={1}>Choose a day</StepTitle>
                    <div className="flex items-center gap-2 text-sm text-neutral-600 max-sm:w-full">
                      <DateCalendar
                        value={day}
                        first={days[0]}
                        last={days[days.length - 1]}
                        isFull={(d) => freeSlots(db, court, d, now) === 0}
                        onChange={(d) => {
                          setDate(d);
                          setStart(null);
                          setWeekPick(null);
                        }}
                      >
                        <button aria-label="Open calendar" className="-ml-2 flex h-8 items-center gap-2 rounded-lg px-2 transition hover:bg-neutral-100 hover:text-emerald-800">
                          {new Date(`${weekDays[0]}T00:00`).toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
                          <CalendarDays className="size-4" />
                        </button>
                      </DateCalendar>
                      <button
                        onClick={() => setWeekPick(week - 1)}
                        disabled={week === 0}
                        aria-label="Previous week"
                        className="flex size-8 items-center max-sm:ml-auto justify-center rounded-lg hover:bg-neutral-100 disabled:opacity-30"
                      >
                        <ChevronLeft className="size-4" />
                      </button>
                      <button
                        onClick={() => setWeekPick(week + 1)}
                        disabled={week >= weeks - 1}
                        aria-label="Next week"
                        className="flex size-8 items-center justify-center rounded-lg hover:bg-neutral-100 disabled:opacity-30"
                      >
                        <ChevronRight className="size-4" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-7 gap-1.5 sm:gap-2">
                    {weekDays.map((d) => {
                      const dt = new Date(`${d}T00:00`);
                      const active = d === day;
                      const full = freeSlots(db, court, d, now) === 0;
                      return (
                        <button
                          key={d}
                          onClick={() => {
                            setDate(d);
                            setStart(null);
                          }}
                          aria-pressed={active}
                          className={cn(
                            "relative flex flex-col items-center rounded-lg border py-2.5 transition sm:py-3",
                            active ? "border-emerald-900 bg-emerald-900 text-white" : "border-neutral-200 bg-white text-neutral-900 hover:border-emerald-700",
                            full && !active && "text-neutral-300"
                          )}
                        >
                          <span className={cn("text-[11px] font-medium uppercase", active ? "text-white/70" : "text-neutral-500")}>
                            {dt.toLocaleDateString("en-GB", { weekday: "short" })}
                          </span>
                          <span className="mt-1 text-xl font-semibold tabular-nums md:text-2xl">{String(dt.getDate()).padStart(2, "0")}</span>
                          {active && <span className="absolute bottom-2 h-0.5 w-6 rounded-full bg-lime-400" />}
                        </button>
                      );
                    })}
                  </div>
                </Step>

                {/* 02 Length */}
                <Step n={2} state="done">
                  <StepTitle n={2}>How long?</StepTitle>
                  <div className="mt-4 flex gap-2 sm:flex-wrap">
                    {Array.from({ length: maxDuration }, (_, i) => i + 1).map((d) => {
                      const bad = start !== null && !!findConflict(db, { courtId: court.id, date: day, startHour: start, duration: d }, { clientId, now });
                      return (
                        <button
                          key={d}
                          disabled={bad}
                          onClick={() => setDuration(d)}
                          aria-pressed={d === duration}
                          className={cn(
                            "h-11 flex-1 rounded-lg border px-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-30 sm:flex-none sm:px-6",
                            d === duration ? "border-emerald-900 bg-emerald-900 text-white" : "border-neutral-200 text-neutral-800 hover:border-emerald-700"
                          )}
                        >
                          {d} hour{d > 1 ? "s" : ""}
                        </button>
                      );
                    })}
                  </div>
                </Step>

                {/* 03 Kick-off */}
                <Step n={3} state={start !== null ? "done" : "active"} last>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <StepTitle n={3}>Pick your kick-off</StepTitle>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-neutral-600">
                      <span className="flex items-center gap-1.5">
                        <span className="size-3.5 rounded-full border border-neutral-300" /> Available
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="size-3.5 rounded-full bg-lime-400" /> Selected
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="size-3.5 rounded-full bg-neutral-200" /> Booked
                      </span>
                    </div>
                  </div>

                  {multiCourt && view === "all" ? (
                    <div className="mt-5">
                      <Matrix
                        day={day}
                        now={now}
                        clientId={clientId}
                        selection={selection}
                        onPick={(c, h) => {
                          pickCell(c, h);
                          setView("court");
                        }}
                      />
                    </div>
                  ) : upcoming.length === 0 ? (
                    <p className="mt-5 rounded-lg bg-neutral-50 px-4 py-8 text-center text-sm text-neutral-600">
                      No kick-off times left on this day.{" "}
                      {days[days.indexOf(day) + 1] && (
                        <button
                          onClick={() => {
                            setDate(days[days.indexOf(day) + 1]);
                            setStart(null);
                          }}
                          className="font-semibold text-emerald-800 underline"
                        >
                          See the next day
                        </button>
                      )}
                    </p>
                  ) : (
                    groups.map(
                      (g) =>
                        g.hs.length > 0 && (
                          <div key={g.label} className="mt-5">
                            <p className="mb-2.5 text-sm font-semibold text-neutral-800">{g.label}</p>
                            <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 xl:grid-cols-7">
                              {g.hs.map((h) => {
                                const info = slotInfo(db, court, day, h, now, clientId);
                                const selected = start !== null && h >= start && h < start + duration;
                                const clickable = info.kind === "free" || (info.kind === "held" && info.mine);
                                return (
                                  <button
                                    key={h}
                                    disabled={!clickable}
                                    onClick={() => pickCell(court, h)}
                                    aria-pressed={selected}
                                    className={cn(
                                      "rounded-lg border px-1.5 py-3 text-center transition disabled:cursor-not-allowed sm:px-2",
                                      selected
                                        ? "border-lime-400 bg-lime-400 text-emerald-950"
                                        : clickable
                                          ? "border-neutral-200 bg-white text-neutral-900 hover:border-emerald-700"
                                          : "border-transparent bg-neutral-100 text-neutral-400"
                                    )}
                                  >
                                    <span className={cn("block whitespace-nowrap text-sm font-semibold tabular-nums", !clickable && !selected && "line-through decoration-neutral-300")}>{clock(h)}</span>
                                    <span className={cn("mt-0.5 block text-xs leading-tight", selected ? "text-emerald-950/80" : clickable ? "text-emerald-700" : "text-neutral-400")}>
                                      {selected
                                        ? "Selected"
                                        : clickable
                                          ? "Available"
                                          : info.kind === "blocked"
                                            ? "Closed"
                                            : info.kind === "held"
                                              ? "Being paid"
                                              : "Booked"}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )
                    )
                  )}
                </Step>
              </div>

              <Ticket day={day} start={start} duration={duration}>
                <dl className="text-sm">
                  <div className="flex justify-between gap-3 py-1.5">
                    <dt className="text-white/80">
                      {offPeakOnly
                        ? `Hourly rate (before ${hourLabel(peakStartHour)})`
                        : allPeak
                          ? `Hourly rate (from ${hourLabel(peakStartHour)})`
                          : "Hourly rate (mixed)"}
                    </dt>
                    <dd className="tabular-nums">
                      {offPeakOnly ? taka(court.price) : allPeak ? taka(court.peakPrice) : `${taka(court.price)} / ${taka(court.peakPrice)}`}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3 py-1.5">
                    <dt className="text-white/80">Duration</dt>
                    <dd>
                      {duration} hour{duration > 1 ? "s" : ""}
                    </dd>
                  </div>
                  <div className="mt-3 flex items-baseline justify-between gap-3 border-y border-white/10 py-4">
                    <dt className="text-lg">Total</dt>
                    <dd className="text-2xl font-semibold tabular-nums">{price ? taka(price.total) : "—"}</dd>
                  </div>
                  <div className="flex justify-between gap-3 border-b border-white/10 py-3.5">
                    <dt className="text-white/70">Pay now ({advancePercent}%)</dt>
                    <dd className="text-lg font-semibold tabular-nums">{price ? taka(price.advance) : "—"}</dd>
                  </div>
                  <div className="flex justify-between gap-3 py-3.5">
                    <dt className="text-white/80">Pay at ground</dt>
                    <dd className="text-lg font-semibold tabular-nums">{price ? taka(price.total - price.advance) : "—"}</dd>
                  </div>
                </dl>

                {conflict && start !== null && (
                  <p className="mt-2 rounded-lg bg-rose-500/15 px-3 py-2 text-xs text-rose-200">That time was just taken. Pick another kick-off.</p>
                )}
                <button
                  onClick={proceed}
                  disabled={!selection || !!conflict}
                  className="mt-4 flex h-14 w-full items-center justify-center gap-2 rounded-lg bg-lime-400 text-base font-semibold text-emerald-950 transition hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {selection ? "Continue to payment" : "Pick a kick-off time"} <ArrowRight className="size-5" />
                </button>
                <p className="mt-4 flex items-center justify-center gap-2 text-xs text-white/70">
                  <Lock className="size-3.5" /> Slot held for {holdMinutes} minutes once you continue.
                </p>
              </Ticket>
            </div>
          </>
        )}
      </div>

      {/* Phone: keep the next step in reach while scrolling the times. */}
      {!paying && selection && price && !conflict && (
        <div className="fixed inset-x-3 bottom-3 z-30 flex items-center justify-between gap-3 rounded-lg bg-emerald-950 p-3 pl-4 text-white shadow-xl lg:hidden">
          <div className="min-w-0 text-sm">
            <p className="truncate font-semibold">
              {clock(selection.startHour)} – {clock(selection.startHour + duration)}
            </p>
            <p className="text-xs text-white/70">{taka(price.advance)} to pay now</p>
          </div>
          <button onClick={proceed} className="flex h-11 items-center gap-2 rounded-lg bg-lime-400 px-4 text-sm font-semibold text-emerald-950">
            Continue <ArrowRight className="size-4" />
          </button>
        </div>
      )}
    </div>
  );
}

/** "2:00 PM" — hours shown with minutes, as on a match ticket. */
const clock = (h: number) => {
  const hh = h % 24;
  return `${hh % 12 === 0 ? 12 : hh % 12}:00 ${hh < 12 ? "AM" : "PM"}`;
};

/** "2:00 – 3:00 PM", or "11:00 AM – 1:00 PM" when it crosses noon. */
const clockRange = (a: number, b: number) => {
  const [x, y] = [clock(a), clock(b)];
  return x.slice(-2) === y.slice(-2) ? `${x.slice(0, -3)} – ${y}` : `${x} – ${y}`;
};

function StepTitle({ n, numbered, children }: { n: number; numbered?: boolean; children: React.ReactNode }) {
  return (
    <h2 className="flex items-center gap-2.5 text-xl font-semibold leading-10 text-neutral-900">
      {/* Phones drop the stepper rail, so the step number rides with the title; `numbered` keeps it on every size. */}
      <span className={cn("flex size-7 shrink-0 items-center justify-center rounded-full bg-emerald-900 text-xs text-white", !numbered && "sm:hidden")}>{n}</span>
      {children}
    </h2>
  );
}

/** One step of the vertical stepper: numbered circle, connector line down to the next step, content on the right. */
function Step({ n, state, last, children }: { n: number; state: "done" | "active"; last?: boolean; children: React.ReactNode }) {
  return (
    <section className="grid gap-x-4 sm:grid-cols-[2.5rem_1fr]">
      <div className="relative flex justify-center max-sm:hidden">
        <span
          className={cn(
            "relative z-10 flex size-10 items-center justify-center rounded-full text-sm font-semibold transition",
            state === "done" ? "bg-emerald-900 text-white" : "bg-white text-emerald-900 ring-2 ring-emerald-900"
          )}
        >
          {state === "done" ? <Check className="size-5" strokeWidth={2.5} /> : String(n).padStart(2, "0")}
        </span>
        {!last && <span className={cn("absolute bottom-0 top-10 w-0.5", state === "done" ? "bg-emerald-900" : "bg-neutral-200")} />}
      </div>
      <div className={cn("min-w-0", !last && "mb-6 border-b border-neutral-100 pb-6 sm:mb-0 sm:border-0 sm:pb-10")}>{children}</div>
    </section>
  );
}

/** Courts × hours grid for one day — the whole venue's schedule at a glance. */
function Matrix({
  day,
  now,
  clientId,
  selection,
  onPick,
}: {
  day: string;
  now: number;
  clientId: string;
  selection: { courtId: string; startHour: number; duration: number } | null;
  onPick: (c: Court, h: number) => void;
}) {
  const db = useTurfDB();
  const courts = db.courts.filter((c) => c.active);
  const hours = hoursOf(db.settings);
  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="font-semibold text-neutral-900">{dateLabel(day, { weekday: "long", day: "numeric", month: "long" })}</p>
      </div>
      <div className="relative overflow-x-auto">
        <table className="w-full border-separate border-spacing-1">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 min-w-32 bg-white" />
              {hours.map((h) => (
                <th key={h} className={cn("min-w-8 text-[10px] font-medium", h >= db.settings.peakStartHour ? "text-orange-600" : "text-neutral-500")}>
                  {hourShort(h)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {courts.map((c) => (
              <tr key={c.id}>
                <th className="sticky left-0 z-10 bg-white pr-2 text-left">
                  <span className="flex items-center gap-1.5 text-xs font-medium text-neutral-800">
                    <SportIcon sport={c.sport} className="size-3.5 text-emerald-700" />
                    <span className="truncate">{c.name}</span>
                  </span>
                </th>
                {hours.map((h) => {
                  const info = slotInfo(db, c, day, h, now, clientId);
                  const selected = !!selection && selection.courtId === c.id && h >= selection.startHour && h < selection.startHour + selection.duration;
                  const clickable = info.kind === "free" || (info.kind === "held" && info.mine);
                  return (
                    <td key={h} className="p-0">
                      <button
                        disabled={!clickable}
                        onClick={() => onPick(c, h)}
                        title={`${c.name} · ${hourLabel(h)} · ${cellNote(info)}`}
                        aria-label={`${c.name} ${hourLabel(h)} ${cellNote(info)}`}
                        className={cn("block h-9 w-full rounded-md ring-1 transition disabled:cursor-not-allowed", cellTone(info, selected))}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-neutral-500">Tap a free cell to choose that court and time.</p>
    </div>
  );
}

const BD_PHONE = /^01[3-9]\d{8}$/;

/** bKash and Nagad transaction IDs: 8–10 capital letters and digits. */
const TRX_ID = /^[A-Z0-9]{8,10}$/;

/**
 * Takes whatever the customer pasted — the bare ID or the whole confirmation SMS ("… TrxID BJ74K3XQ2M at …")
 * — and returns the ID in canonical form.
 */
function parseTrxId(text: string) {
  const fromSms = text.match(/\b(?:trx|txn)\s*id\s*[:#.-]?\s*([a-z0-9]{8,10})\b/i);
  return (fromSms ? fromSms[1] : text.replace(/[^a-z0-9]/gi, "")).toUpperCase().slice(0, 20);
}

/** Logos on the "Pay with" tiles (files in /public/payments); sized so all three fit a 320px phone. */
const payLogos = {
  bkash: [{ src: "/payments/bkash.webp", w: 208, h: 96, cls: "h-7 sm:h-8" }],
  nagad: [{ src: "/payments/nagad.webp", w: 274, h: 96, cls: "h-7 sm:h-8" }],
  card: [
    { src: "/payments/visa.svg", w: 1000, h: 325, cls: "h-3 sm:h-3.5" },
    { src: "/payments/mastercard.svg", w: 1000, h: 618, cls: "h-4 sm:h-5" },
  ],
};

/** Dark match ticket shared by both steps: day, time and length above the perforation, the step's totals and button below. */
function Ticket({ day, start, duration, children }: { day: string; start: number | null; duration: number; children: React.ReactNode }) {
  return (
    <aside className="relative rounded-lg bg-emerald-950 p-5 text-white lg:sticky lg:top-28 md:p-8">
      <svg
        aria-hidden
        viewBox="0 0 150 110"
        className="absolute right-5 top-5 h-16 text-white/15 md:right-8 md:top-8 md:h-24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <rect x="1" y="1" width="148" height="108" />
        <path d="M75 1v108M1 30h22v50H1M149 30h-22v50h22" />
        <circle cx="75" cy="55" r="16" />
      </svg>
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-white/60">Your match</p>
      <p className="mt-4 max-w-[14rem] text-fluid-4xl font-semibold leading-tight">
        {new Date(`${day}T00:00`).toLocaleDateString("en-GB", { weekday: "long" })},
        <br />
        {dateLabel(day, { day: "numeric", month: "long" })}
      </p>
      <p className="mt-6 flex items-center gap-4 text-fluid-3xl font-semibold">
        <Clock className="size-7 shrink-0 text-white/80" />
        {start === null ? <span className="text-white/40">Pick a time</span> : clockRange(start, start + duration)}
      </p>
      <p className="mt-3 flex items-center gap-4 text-white/85">
        <Users className="size-7 shrink-0 text-white/60" />
        {duration} hour{duration > 1 ? "s" : ""} · Entire ground
      </p>

      {/* Perforation */}
      <div className="relative -mx-5 my-7 border-t-2 border-dashed border-white/20 md:-mx-8">
        <span className="absolute -left-3 -top-3 size-6 rounded-full bg-[#f7f6f1]" />
        <span className="absolute -right-3 -top-3 size-6 rounded-full bg-[#f7f6f1]" />
      </div>
      {children}
    </aside>
  );
}

function PaymentStep({
  court,
  selection,
  price,
  expiresAt,
  now,
  clientId,
  onBack,
  onDone,
}: {
  court: Court;
  selection: { courtId: string; date: string; startHour: number; duration: number };
  price: { total: number; advance: number };
  expiresAt: number;
  now: number;
  clientId: string;
  onBack: () => void;
  onDone: (code: string, phone: string) => void;
}) {
  const db = useTurfDB();
  const { advancePercent, holdMinutes, phone: venuePhone } = db.settings;
  const [form, setForm] = useState(() => {
    let phone = "";
    try {
      phone = localStorage.getItem(PHONE_KEY) ?? "";
    } catch {}
    return { name: "", phone };
  });
  const [method, setMethod] = useState<Exclude<PayMethod, "cash">>("bkash");
  const [full, setFull] = useState(false);
  const [ref, setRef] = useState("");
  const [refLeft, setRefLeft] = useState(false);
  const [card, setCard] = useState({ number: "", exp: "", cvc: "" });
  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);

  const amount = full ? price.total : price.advance;
  const left = expiresAt - now;
  const heldPct = Math.min(100, Math.max(0, (left / (holdMinutes * 60_000)) * 100));
  const urgent = left < 120_000;
  const cardDigits = card.number.replace(/\D/g, "");

  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    if (form.name.trim().length < 2) e.name = "Enter your name";
    if (!BD_PHONE.test(form.phone.trim())) e.phone = "Enter a valid 11-digit mobile number";
    if (method === "card") {
      if (cardDigits.length !== 16) e.card = "Card number must be 16 digits";
      else if (!/^\d{2}\/\d{2}$/.test(card.exp)) e.card = "Expiry as MM/YY";
      else if (!/^\d{3,4}$/.test(card.cvc)) e.card = "Enter the CVC";
    } else if (!ref) e.ref = "Enter the transaction ID from the SMS";
    else if (!TRX_ID.test(ref)) e.ref = "A transaction ID is 8–10 letters and numbers";
    else if (trxUsed(db, method, ref)) e.ref = "This transaction ID has already been used";
    return e;
  }, [db, form, method, ref, card, cardDigits]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (Object.keys(errors).length) return;
    setBusy(true);
    const r = createOnlineBooking(
      {
        ...selection,
        customer: { name: form.name.trim(), phone: form.phone.trim() },
        method,
        amount,
        ref: method === "card" ? `CARD •••• ${cardDigits.slice(-4)}` : ref,
      },
      clientId
    );
    setBusy(false);
    if (!r.ok) {
      toast.error(r.error);
      return;
    }
    toast.success(`Booking ${r.value.code} received!`);
    onDone(r.value.code, r.value.customer.phone);
  };

  // Clipboard reads need a secure origin and, on some browsers, a one-time permission.
  const canPaste = typeof navigator !== "undefined" && !!navigator.clipboard?.readText;
  const pasteRef = async () => {
    try {
      setRef(parseTrxId(await navigator.clipboard.readText()));
      setRefLeft(true);
    } catch {}
  };

  const err = (k: string) => touched && errors[k] && <p className="mt-1.5 text-xs text-rose-600">{errors[k]}</p>;
  // 16px text on phones so iOS doesn't zoom into the field.
  const input = cn(inputClass, "h-12 rounded-lg text-base sm:text-sm");

  return (
    <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[1fr_440px] lg:items-start" noValidate>
      <button
        type="button"
        onClick={onBack}
        className="-mb-2 flex w-fit items-center gap-1.5 text-sm font-medium text-neutral-600 transition hover:text-emerald-800 lg:col-span-2"
      >
        <ArrowLeft className="size-4" /> Change slot
      </button>
      <div className="overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-black/[0.04]">
        {/* Hold countdown: the bar drains as the hold runs out. */}
        <div className="border-b border-neutral-100 px-4 py-3.5 sm:px-5 md:px-6">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="flex items-center gap-2 text-neutral-600">
              <Hourglass className="size-4" /> Slot held for
            </span>
            <span className={cn("font-semibold tabular-nums", urgent ? "text-rose-600" : "text-neutral-900")}>{formatDuration(left)}</span>
          </div>
          <div className="mt-2.5 h-1 rounded-full bg-neutral-100">
            <div
              className={cn("h-full rounded-full transition-[width] duration-1000 ease-linear", urgent ? "bg-rose-500" : "bg-emerald-700")}
              style={{ width: `${heldPct}%` }}
            />
          </div>
        </div>

        <div className="p-4 sm:p-5 md:p-6">
          <StepTitle n={1} numbered>
            Your details
          </StepTitle>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="pf-name" className={labelClass}>
                Name
              </label>
              <input id="pf-name" className={input} placeholder="Your full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoComplete="name" />
              {err("name")}
            </div>
            <div>
              <label htmlFor="pf-phone" className={labelClass}>
                Mobile number
              </label>
              <input
                id="pf-phone"
                type="tel"
                className={input}
                inputMode="numeric"
                placeholder="01XXXXXXXXX"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/[^\d]/g, "").slice(0, 11) })}
                autoComplete="tel"
              />
              {err("phone")}
            </div>
          </div>

          <div className="mt-8 border-t border-neutral-100 pt-6">
            <StepTitle n={2} numbered>
              Payment
            </StepTitle>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {[
                { v: false, t: `${advancePercent}% advance`, a: price.advance },
                { v: true, t: "Full amount", a: price.total },
              ].map((o) => {
                const on = full === o.v;
                return (
                  <button
                    type="button"
                    key={String(o.v)}
                    onClick={() => setFull(o.v)}
                    aria-pressed={on}
                    className={cn(
                      "flex h-14 items-center gap-3 rounded-lg border px-4 text-left transition",
                      on ? "border-emerald-900 ring-1 ring-emerald-900" : "border-neutral-200 hover:border-emerald-700"
                    )}
                  >
                    <span className={cn("flex size-4 shrink-0 items-center justify-center rounded-full border", on ? "border-emerald-900" : "border-neutral-300")}>
                      {on && <span className="size-2 rounded-full bg-emerald-900" />}
                    </span>
                    <span className="flex-1 text-sm font-medium text-neutral-800">{o.t}</span>
                    <span className="font-semibold tabular-nums text-neutral-900">{taka(o.a)}</span>
                  </button>
                );
              })}
            </div>

            <p className="mb-2 mt-5 text-sm font-medium text-neutral-800">Pay with</p>
            <div className="flex gap-2">
              {(["bkash", "nagad", "card"] as const).map((m) => {
                const on = method === m;
                return (
                  <button
                    type="button"
                    key={m}
                    onClick={() => setMethod(m)}
                    aria-pressed={on}
                    aria-label={payLabels[m]}
                    className={cn(
                      "relative flex h-14 min-w-0 flex-1 items-center justify-center gap-1 rounded-lg border bg-white px-1.5 transition sm:gap-1.5 sm:px-3",
                      on ? "border-emerald-900 ring-1 ring-emerald-900" : "border-neutral-200 hover:border-emerald-700"
                    )}
                  >
                    {payLogos[m].map((l) => (
                      <Image
                        key={l.src}
                        src={l.src}
                        alt=""
                        width={l.w}
                        height={l.h}
                        unoptimized={l.src.endsWith(".svg")}
                        className={cn("w-auto min-w-0 max-w-full object-contain", l.cls)}
                      />
                    ))}
                    {on && (
                      <span className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-emerald-900 text-white">
                        <Check className="size-3" strokeWidth={3} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {method === "card" ? (
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label htmlFor="pf-card" className={labelClass}>
                    Card number
                  </label>
                  <input
                    id="pf-card"
                    className={input}
                    inputMode="numeric"
                    autoComplete="cc-number"
                    placeholder="0000 0000 0000 0000"
                    value={card.number}
                    onChange={(e) =>
                      setCard({
                        ...card,
                        number: e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 16)
                          .replace(/(\d{4})(?=\d)/g, "$1 "),
                      })
                    }
                  />
                </div>
                <div>
                  <label htmlFor="pf-exp" className={labelClass}>
                    Expiry
                  </label>
                  <input
                    id="pf-exp"
                    className={input}
                    inputMode="numeric"
                    autoComplete="cc-exp"
                    placeholder="MM/YY"
                    value={card.exp}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, "").slice(0, 4);
                      setCard({ ...card, exp: v.length > 2 ? `${v.slice(0, 2)}/${v.slice(2)}` : v });
                    }}
                  />
                </div>
                <div>
                  <label htmlFor="pf-cvc" className={labelClass}>
                    CVC
                  </label>
                  <input
                    id="pf-cvc"
                    className={input}
                    inputMode="numeric"
                    autoComplete="cc-csc"
                    placeholder="123"
                    value={card.cvc}
                    onChange={(e) => setCard({ ...card, cvc: e.target.value.replace(/\D/g, "").slice(0, 4) })}
                  />
                </div>
                <div className="col-span-2 -mt-1.5 empty:hidden">{err("card")}</div>
              </div>
            ) : (
              <>
                <dl className="mt-4 divide-y divide-neutral-200/70 rounded-lg bg-neutral-50 px-4 text-sm">
                  {/* Wallet apps take the local 11-digit number. */}
                  <CopyRow label="Send Money to" value={venuePhone.replace(/^\+880\s?/, "0")} copy={venuePhone.replace(/\D/g, "").replace(/^880/, "0")} />
                  <CopyRow label="Amount" value={taka(amount)} copy={String(amount)} />
                </dl>
                <div className="mt-4">
                  <label htmlFor="pf-ref" className={labelClass}>
                    {payLabels[method]} transaction ID
                  </label>
                  <div className="relative">
                    <input
                      id="pf-ref"
                      className={cn(input, "pr-20 font-medium tracking-wider placeholder:font-normal placeholder:tracking-normal")}
                      placeholder={method === "bkash" ? "e.g. BJ74K3XQ2M" : "e.g. 7A3F9K2L"}
                      value={ref}
                      onChange={(e) => setRef(parseTrxId(e.target.value))}
                      onBlur={() => setRefLeft(!!ref)}
                      autoComplete="off"
                      autoCapitalize="characters"
                      autoCorrect="off"
                      spellCheck={false}
                      enterKeyHint="done"
                      aria-invalid={(touched || refLeft) && !!errors.ref}
                      aria-describedby="pf-ref-hint"
                    />
                    <span className="absolute inset-y-0 right-2 flex items-center">
                      {ref && !errors.ref ? (
                        <CheckCircle2 className="mr-1.5 size-5 text-emerald-600" aria-label="Looks right" />
                      ) : (
                        canPaste && (
                          <button
                            type="button"
                            onClick={pasteRef}
                            className="flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-50"
                          >
                            <ClipboardPaste className="size-3.5" /> Paste
                          </button>
                        )
                      )}
                    </span>
                  </div>
                  {(touched || refLeft) && errors.ref ? (
                    <p className="mt-1.5 text-xs text-rose-600">{errors.ref}</p>
                  ) : (
                    <p id="pf-ref-hint" className="mt-1.5 text-xs text-neutral-500">
                      Paste the ID or the whole {payLabels[method]} SMS.
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <Ticket day={selection.date} start={selection.startHour} duration={selection.duration}>
        <dl className="text-sm">
          <div className="flex justify-between gap-3 py-1.5">
            <dt className="text-white/80">{court.name}</dt>
            <dd className="tabular-nums">{taka(price.total)}</dd>
          </div>
          <div className="mt-3 flex items-baseline justify-between gap-3 border-y border-white/10 py-4">
            <dt className="text-lg">Pay now</dt>
            <dd className="text-2xl font-semibold tabular-nums">{taka(amount)}</dd>
          </div>
          <div className="flex justify-between gap-3 py-3.5">
            <dt className="text-white/80">Pay at ground</dt>
            <dd className="text-lg font-semibold tabular-nums">{taka(price.total - amount)}</dd>
          </div>
        </dl>
        <button
          type="submit"
          disabled={busy}
          className="mt-4 flex h-14 w-full items-center justify-center gap-2 rounded-lg bg-lime-400 text-base font-semibold text-emerald-950 transition hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Pay {taka(amount)} &amp; book <ArrowRight className="size-5" />
        </button>
      </Ticket>
    </form>
  );
}

/** A value to type into the wallet app, with a copy button where the browser allows it. */
function CopyRow({ label, value, copy = value }: { label: string; value: string; copy?: string }) {
  const [copied, setCopied] = useState(false);
  // Clipboard is only exposed on secure origins (not on a phone hitting the dev server by LAN IP).
  const canCopy = typeof navigator !== "undefined" && !!navigator.clipboard;
  return (
    <div className="flex items-center justify-between gap-3 py-3">
      <dt className="whitespace-nowrap text-neutral-500">{label}</dt>
      <dd className="flex items-center gap-1 whitespace-nowrap font-semibold tabular-nums text-neutral-900">
        {value}
        {canCopy && (
          <button
            type="button"
            aria-label={`Copy ${label.toLowerCase()}`}
            onClick={() =>
              navigator.clipboard
                .writeText(copy)
                .then(() => {
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                })
                .catch(() => {})
            }
            className="flex size-8 items-center justify-center rounded-md text-neutral-500 transition hover:bg-white hover:text-emerald-800"
          >
            {copied ? <Check className="size-4 text-emerald-700" /> : <Copy className="size-4" />}
          </button>
        )}
      </dd>
    </div>
  );
}
