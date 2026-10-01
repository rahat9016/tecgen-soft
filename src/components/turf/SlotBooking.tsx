"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  Hourglass,
  LayoutGrid,
  Lock,
  Rows3,
  ShieldCheck,
  Sun,
  Sunrise,
  Sunset,
  MoonStar,
} from "lucide-react";
import { addDays, dateLabel, formatDuration, hourLabel, hourShort, payLabels, rangeLabel, sportLabels, taka, todayYmd } from "@/src/lib/turf-store/format";
import {
  createOnlineBooking,
  findConflict,
  freeSlots,
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
import type { Court, PayMethod, Sport } from "@/src/lib/turf-store/types";
import { cn } from "@/src/lib/utils";
import { Chip, inputClass, labelClass, LiveBadge, Loader, SportIcon, tbtn } from "./ui";

const PHONE_KEY = "turfhub:phone";

const periods = [
  { label: "Morning", icon: Sunrise, from: 0, to: 12 },
  { label: "Afternoon", icon: Sun, from: 12, to: 17 },
  { label: "Evening", icon: Sunset, from: 17, to: 21 },
  { label: "Night", icon: MoonStar, from: 21, to: 25 },
];

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
  info.kind === "free" ? taka(info.price) : info.kind === "held" ? (info.mine ? "Yours" : "On hold") : info.kind === "booked" ? "Booked" : info.kind === "blocked" ? "Closed" : "Past";

export default function SlotBooking() {
  const db = useTurfDB();
  const hydrated = useHydrated();
  const now = useNow(1000);
  const router = useRouter();
  const params = useSearchParams();
  const [clientId] = useState(getClientId);

  const courts = db.courts.filter((c) => c.active);
  const sports = [...new Set(courts.map((c) => c.sport))];

  const [courtId, setCourtId] = useState(params.get("court") ?? "");
  const [sport, setSport] = useState<Sport | "all">("all");
  const [date, setDate] = useState(params.get("date") ?? "");
  const [start, setStart] = useState<number | null>(params.get("start") ? Number(params.get("start")) : null);
  const [duration, setDuration] = useState(Number(params.get("duration")) || 1);
  const [view, setView] = useState<"court" | "all">("court");
  const [paying, setPaying] = useState(false);

  const today = hydrated ? todayYmd() : "";
  const day = date || today;
  const days = hydrated ? Array.from({ length: db.settings.bookingWindowDays }, (_, i) => addDays(today, i)) : [];
  const court = courts.find((c) => c.id === courtId) ?? courts[0];
  const hours = hoursOf(db.settings);

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

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <LiveBadge now={now} />
          <h1 className="mt-3 text-3xl font-semibold text-neutral-900 md:text-4xl">Live slot checker</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Availability updates the moment anyone books, holds or cancels. Lock a slot with a {db.settings.advancePercent}% advance.
          </p>
        </div>
        {!paying && (
          <div className="flex rounded-full bg-neutral-100 p-1">
            {[
              { v: "court" as const, l: "By court", i: Rows3 },
              { v: "all" as const, l: "All courts", i: LayoutGrid },
            ].map((o) => (
              <button
                key={o.v}
                onClick={() => setView(o.v)}
                className={cn("flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium", view === o.v ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500")}
              >
                <o.i className="size-3.5" /> {o.l}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className={cn("mt-8 grid gap-6", !paying && "lg:grid-cols-[1fr_360px]")}>
        <div className="min-w-0 space-y-6">
          {paying && selection && price ? (
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
                router.push(`/turf/my-bookings?code=${code}`);
              }}
            />
          ) : (
            <>
              {/* Date strip */}
              <div>
                <p className="mb-2 flex items-center gap-1.5 text-sm font-medium text-neutral-900">
                  <CalendarDays className="size-4 text-emerald-700" /> Date
                </p>
                <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:thin]">
                  {days.map((d, i) => {
                    const dt = new Date(`${d}T00:00`);
                    const active = d === day;
                    return (
                      <button
                        key={d}
                        onClick={() => {
                          setDate(d);
                          setStart(null);
                        }}
                        className={cn(
                          "flex w-16 shrink-0 flex-col items-center rounded-2xl py-2.5 ring-1 transition",
                          active ? "bg-emerald-800 text-white ring-emerald-800" : "bg-white text-neutral-700 ring-neutral-200 hover:ring-emerald-500"
                        )}
                      >
                        <span className={cn("text-[11px]", active ? "text-lime-300" : "text-neutral-500")}>
                          {i === 0 ? "Today" : dt.toLocaleDateString("en-GB", { weekday: "short" })}
                        </span>
                        <span className="text-lg font-semibold">{dt.getDate()}</span>
                        <span className={cn("text-[11px]", active ? "text-white/70" : "text-neutral-400")}>{dt.toLocaleDateString("en-GB", { month: "short" })}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {view === "court" ? (
                <>
                  <div>
                    <div className="mb-2 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
                      <Chip active={sport === "all"} onClick={() => setSport("all")}>
                        All sports
                      </Chip>
                      {sports.map((s) => (
                        <Chip key={s} active={sport === s} onClick={() => setSport(s)}>
                          <SportIcon sport={s} className="size-3.5" /> {sportLabels[s]}
                        </Chip>
                      ))}
                    </div>
                    <div className="flex gap-3 overflow-x-auto pb-2 [scrollbar-width:thin]">
                      {courts
                        .filter((c) => sport === "all" || c.sport === sport)
                        .map((c) => {
                          const free = freeSlots(db, c, day, now);
                          const active = c.id === court.id;
                          return (
                            <button
                              key={c.id}
                              onClick={() => {
                                setCourtId(c.id);
                                setStart(null);
                              }}
                              className={cn(
                                "flex w-60 shrink-0 items-center gap-3 rounded-2xl p-2 text-left ring-1 transition",
                                active ? "bg-emerald-950 text-white ring-emerald-950" : "bg-white ring-neutral-200 hover:ring-emerald-500"
                              )}
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={c.image} alt="" className="size-14 rounded-xl object-cover" />
                              <span className="min-w-0">
                                <span className={cn("flex items-center gap-1 text-[11px]", active ? "text-lime-300" : "text-neutral-500")}>
                                  <SportIcon sport={c.sport} className="size-3" /> {sportLabels[c.sport]}
                                </span>
                                <span className="block truncate text-sm font-semibold">{c.name}</span>
                                <span className={cn("text-[11px]", free === 0 ? "text-rose-400" : active ? "text-white/70" : "text-emerald-700")}>
                                  {free === 0 ? "Fully booked" : `${free} slots free`}
                                </span>
                              </span>
                            </button>
                          );
                        })}
                    </div>
                  </div>

                  <div className="rounded-3xl border border-neutral-200 bg-white p-4 md:p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-neutral-900">{court.name}</p>
                        <p className="text-xs text-neutral-500">
                          {dateLabel(day, { weekday: "long", day: "numeric", month: "long" })} · {court.size}
                        </p>
                      </div>
                      <Legend />
                    </div>
                    <div className="mt-5 space-y-5">
                      {periods.map((p) => {
                        const hs = hours.filter((h) => h >= p.from && h < p.to);
                        if (!hs.length) return null;
                        return (
                          <div key={p.label}>
                            <p className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-neutral-500">
                              <p.icon className="size-3.5" /> {p.label}
                            </p>
                            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 xl:grid-cols-6">
                              {hs.map((h) => {
                                const info = slotInfo(db, court, day, h, now, clientId);
                                const selected = start !== null && h >= start && h < start + duration;
                                const clickable = info.kind === "free" || (info.kind === "held" && info.mine);
                                return (
                                  <button
                                    key={h}
                                    disabled={!clickable}
                                    onClick={() => pickCell(court, h)}
                                    className={cn("rounded-xl px-2 py-2.5 text-center ring-1 transition disabled:cursor-not-allowed", cellTone(info, selected))}
                                  >
                                    <span className="block text-sm font-semibold">{hourLabel(h)}</span>
                                    <span className={cn("block text-[11px]", selected ? "text-lime-300" : "opacity-80")}>{selected ? "Selected" : cellNote(info)}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              ) : (
                <Matrix day={day} now={now} clientId={clientId} selection={selection} onPick={(c, h) => {
                  pickCell(c, h);
                  setView("court");
                }} />
              )}
            </>
          )}
        </div>

        {/* Summary */}
        {!paying && (
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="overflow-hidden rounded-3xl bg-emerald-950 text-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={court.image} alt="" className="h-36 w-full object-cover opacity-80" />
              <div className="space-y-4 p-5">
                <div>
                  <p className="text-xs text-lime-300">{sportLabels[court.sport]} · {court.surface}</p>
                  <p className="text-lg font-semibold">{court.name}</p>
                </div>
                <dl className="space-y-2 text-sm">
                  <Row k="Date" v={dateLabel(day, { weekday: "short", day: "numeric", month: "short" })} />
                  <Row k="Time" v={start === null ? "Pick a start time" : rangeLabel(start, duration)} />
                </dl>
                <div>
                  <p className="mb-1.5 text-xs text-white/60">Duration</p>
                  <div className="flex gap-1.5">
                    {Array.from({ length: db.settings.maxDuration }, (_, i) => i + 1).map((d) => {
                      const bad = start !== null && !!findConflict(db, { courtId: court.id, date: day, startHour: start, duration: d }, { clientId, now });
                      return (
                        <button
                          key={d}
                          disabled={bad}
                          onClick={() => setDuration(d)}
                          className={cn(
                            "h-9 flex-1 rounded-lg text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-30",
                            d === duration ? "bg-lime-400 text-emerald-950" : "bg-white/10 hover:bg-white/20"
                          )}
                        >
                          {d} hr
                        </button>
                      );
                    })}
                  </div>
                </div>
                {price && (
                  <dl className="space-y-2 border-t border-white/10 pt-4 text-sm">
                    <Row k="Court fee" v={taka(price.total)} />
                    <Row k={`Advance (${db.settings.advancePercent}%)`} v={taka(price.advance)} strong />
                    <Row k="Pay at venue" v={taka(price.total - price.advance)} />
                  </dl>
                )}
                {conflict && start !== null && (
                  <p className="rounded-xl bg-rose-500/15 px-3 py-2 text-xs text-rose-200">This selection is no longer available. Pick another time.</p>
                )}
                <button onClick={proceed} disabled={!selection || !!conflict} className={cn(tbtn.lime, "w-full")}>
                  <Lock className="size-4" /> Hold slot & pay advance
                </button>
                <p className="flex items-center gap-1.5 text-[11px] text-white/50">
                  <Hourglass className="size-3" /> Slot is reserved for {db.settings.holdMinutes} minutes while you pay.
                </p>
              </div>
            </div>
          </aside>
        )}
      </div>

      {/* Mobile quick bar */}
      {!paying && selection && price && !conflict && (
        <div className="fixed inset-x-3 bottom-3 z-30 flex items-center justify-between gap-3 rounded-2xl bg-emerald-950 p-3 pl-4 text-white shadow-xl lg:hidden">
          <div className="min-w-0 text-sm">
            <p className="truncate font-semibold">{rangeLabel(selection.startHour, duration)}</p>
            <p className="text-xs text-white/70">{taka(price.advance)} advance</p>
          </div>
          <button onClick={proceed} className={tbtn.lime}>
            Continue <ArrowRight className="size-4" />
          </button>
        </div>
      )}
    </div>
  );
}

function Row({ k, v, strong }: { k: string; v: string; strong?: boolean }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-white/60">{k}</dt>
      <dd className={cn("text-right", strong && "font-semibold text-lime-300")}>{v}</dd>
    </div>
  );
}

function Legend() {
  const items = [
    { c: "bg-white ring-neutral-300", l: "Free" },
    { c: "bg-emerald-800 ring-emerald-800", l: "Selected" },
    { c: "bg-amber-100 ring-amber-300", l: "On hold" },
    { c: "bg-neutral-200 ring-neutral-200", l: "Booked" },
  ];
  return (
    <div className="flex flex-wrap gap-3 text-[11px] text-neutral-500">
      {items.map((i) => (
        <span key={i.l} className="flex items-center gap-1.5">
          <span className={cn("size-3 rounded ring-1", i.c)} /> {i.l}
        </span>
      ))}
    </div>
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
        <Legend />
      </div>
      <div className="relative overflow-x-auto">
        <table className="w-full border-separate border-spacing-1">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 min-w-36 bg-white" />
              {hours.map((h) => (
                <th key={h} className="min-w-11 text-[10px] font-medium text-neutral-500">
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
  const [form, setForm] = useState(() => {
    let phone = "";
    try {
      phone = localStorage.getItem(PHONE_KEY) ?? "";
    } catch {}
    return { name: "", phone, email: "", team: "", note: "" };
  });
  const [method, setMethod] = useState<Exclude<PayMethod, "cash">>("bkash");
  const [full, setFull] = useState(false);
  const [ref, setRef] = useState("");
  const [card, setCard] = useState({ number: "", exp: "", cvc: "" });
  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);

  const amount = full ? price.total : price.advance;
  const left = expiresAt - now;
  const cardDigits = card.number.replace(/\D/g, "");

  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    if (form.name.trim().length < 2) e.name = "Enter your name";
    if (!BD_PHONE.test(form.phone.trim())) e.phone = "Enter a valid 11-digit mobile number";
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Enter a valid email";
    if (method === "card") {
      if (cardDigits.length !== 16) e.card = "Card number must be 16 digits";
      else if (!/^\d{2}\/\d{2}$/.test(card.exp)) e.card = "Expiry as MM/YY";
      else if (!/^\d{3,4}$/.test(card.cvc)) e.card = "Enter the CVC";
    } else if (ref.trim().length < 6) e.ref = "Enter the transaction ID from your SMS";
    return e;
  }, [form, method, ref, card, cardDigits]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (Object.keys(errors).length) return;
    setBusy(true);
    const r = createOnlineBooking(
      {
        ...selection,
        customer: { name: form.name.trim(), phone: form.phone.trim(), email: form.email.trim() || undefined, team: form.team.trim() || undefined },
        method,
        amount,
        ref: method === "card" ? `CARD •••• ${cardDigits.slice(-4)}` : ref.trim().toUpperCase(),
        note: form.note.trim() || undefined,
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

  const err = (k: string) => touched && errors[k] && <p className="mt-1 text-xs text-rose-600">{errors[k]}</p>;

  return (
    <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[1fr_360px]" noValidate>
      <div className="space-y-6">
        <div className={cn("flex items-center gap-3 rounded-2xl px-4 py-3 text-sm", left < 120_000 ? "bg-rose-50 text-rose-700" : "bg-lime-50 text-emerald-900")}>
          <Hourglass className="size-5 shrink-0" />
          <p>
            Slot locked for you — complete payment within <b className="tabular-nums">{formatDuration(left)}</b>.
          </p>
        </div>

        <section className="rounded-3xl border border-neutral-200 bg-white p-5">
          <h2 className="font-semibold text-neutral-900">Your details</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="pf-name" className={labelClass}>Full name *</label>
              <input id="pf-name" className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoComplete="name" />
              {err("name")}
            </div>
            <div>
              <label htmlFor="pf-phone" className={labelClass}>Mobile number *</label>
              <input id="pf-phone" className={inputClass} inputMode="numeric" placeholder="01XXXXXXXXX" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/[^\d]/g, "").slice(0, 11) })} autoComplete="tel" />
              {err("phone")}
            </div>
            <div>
              <label htmlFor="pf-email" className={labelClass}>Email (optional)</label>
              <input id="pf-email" className={inputClass} type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="email" />
              {err("email")}
            </div>
            <div>
              <label htmlFor="pf-team" className={labelClass}>Team name (optional)</label>
              <input id="pf-team" className={inputClass} value={form.team} onChange={(e) => setForm({ ...form, team: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="pf-note" className={labelClass}>Note for the venue (optional)</label>
              <input id="pf-note" className={inputClass} placeholder="e.g. need 14 bibs" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-neutral-200 bg-white p-5">
          <h2 className="font-semibold text-neutral-900">Payment</h2>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {[
              { v: false, t: `Advance ${db.settings.advancePercent}%`, a: price.advance },
              { v: true, t: "Pay in full", a: price.total },
            ].map((o) => (
              <button
                type="button"
                key={String(o.v)}
                onClick={() => setFull(o.v)}
                className={cn("rounded-2xl p-3 text-left ring-1 transition", full === o.v ? "bg-emerald-50 ring-2 ring-emerald-600" : "ring-neutral-200 hover:ring-emerald-400")}
              >
                <span className="block text-xs text-neutral-500">{o.t}</span>
                <span className="text-lg font-semibold text-neutral-900">{taka(o.a)}</span>
              </button>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            {(["bkash", "nagad", "card"] as const).map((m) => (
              <button
                type="button"
                key={m}
                onClick={() => setMethod(m)}
                className={cn(
                  "flex h-12 items-center justify-center gap-2 rounded-xl text-sm font-semibold ring-1 transition",
                  method === m
                    ? m === "bkash"
                      ? "bg-pink-600 text-white ring-pink-600"
                      : m === "nagad"
                        ? "bg-orange-500 text-white ring-orange-500"
                        : "bg-neutral-900 text-white ring-neutral-900"
                    : "bg-white text-neutral-700 ring-neutral-200 hover:ring-neutral-400"
                )}
              >
                {m === "card" && <CreditCard className="size-4" />} {payLabels[m]}
              </button>
            ))}
          </div>

          {method === "card" ? (
            <div className="mt-4 grid grid-cols-[1fr_90px_80px] gap-2">
              <input aria-label="Card number" className={inputClass} inputMode="numeric" placeholder="Card number" value={card.number} onChange={(e) => setCard({ ...card, number: e.target.value.replace(/\D/g, "").slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 ") })} />
              <input aria-label="Expiry" className={inputClass} placeholder="MM/YY" value={card.exp} onChange={(e) => {
                const v = e.target.value.replace(/\D/g, "").slice(0, 4);
                setCard({ ...card, exp: v.length > 2 ? `${v.slice(0, 2)}/${v.slice(2)}` : v });
              }} />
              <input aria-label="CVC" className={inputClass} inputMode="numeric" placeholder="CVC" value={card.cvc} onChange={(e) => setCard({ ...card, cvc: e.target.value.replace(/\D/g, "").slice(0, 4) })} />
              <div className="col-span-3">{err("card")}</div>
            </div>
          ) : (
            <div className="mt-4 rounded-2xl bg-neutral-50 p-4 text-sm text-neutral-700">
              <ol className="list-decimal space-y-1 pl-5">
                <li>
                  Open {payLabels[method]} and <b>Send Money</b> {taka(amount)} to <b>{db.settings.phone}</b>
                </li>
                <li>Use reference <b>{court.name.split(" ").pop()}</b></li>
                <li>Enter the transaction ID you receive by SMS below</li>
              </ol>
              <input aria-label="Transaction ID" className={cn(inputClass, "mt-3 uppercase")} placeholder="Transaction ID e.g. 9AX4KQ7Z1" value={ref} onChange={(e) => setRef(e.target.value)} />
              {err("ref")}
            </div>
          )}
        </section>
      </div>

      <aside className="space-y-3 lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-3xl border border-neutral-200 bg-white p-5">
          <div className="flex gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={court.image} alt="" className="size-16 rounded-xl object-cover" />
            <div>
              <p className="text-xs text-neutral-500">{sportLabels[court.sport]}</p>
              <p className="font-semibold text-neutral-900">{court.name}</p>
              <p className="text-xs text-neutral-500">{court.size}</p>
            </div>
          </div>
          <dl className="mt-4 space-y-2 border-t border-neutral-100 pt-4 text-sm">
            {[
              ["Date", dateLabel(selection.date, { weekday: "short", day: "numeric", month: "short", year: "numeric" })],
              ["Time", rangeLabel(selection.startHour, selection.duration)],
              ["Court fee", taka(price.total)],
              ["Pay now", taka(amount)],
              ["Pay at venue", taka(price.total - amount)],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between">
                <dt className="text-neutral-500">{k}</dt>
                <dd className={cn("font-medium text-neutral-900", k === "Pay now" && "text-emerald-700")}>{v}</dd>
              </div>
            ))}
          </dl>
          <button type="submit" disabled={busy} className={cn(tbtn.lime, "mt-5 w-full")}>
            <CheckCircle2 className="size-4" /> Pay {taka(amount)} & book
          </button>
          <button type="button" onClick={onBack} className="mt-2 flex w-full items-center justify-center gap-1.5 py-2 text-sm text-neutral-500 hover:text-neutral-800">
            <ArrowLeft className="size-4" /> Change slot
          </button>
        </div>
        <p className="flex gap-2 px-2 text-xs text-neutral-500">
          <ShieldCheck className="size-4 shrink-0 text-emerald-700" />
          Our team verifies your advance and confirms the booking. Free cancellation up to {db.settings.cancelCutoffHours} hours before kick-off.
        </p>
      </aside>
    </form>
  );
}
