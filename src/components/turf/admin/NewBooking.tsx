"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { ArrowLeft } from "lucide-react";
import { addDays, dateLabel, hourLabel, payLabels, rangeLabel, relativeDay, taka, todayYmd } from "@/src/lib/turf-store/format";
import { conflictMessage, createAdminBooking, findConflict, groundOf, hoursOf, quote, slotInfo, useNow, useTurfDB } from "@/src/lib/turf-store/store";
import type { PayMethod } from "@/src/lib/turf-store/types";
import { cn } from "@/src/lib/utils";
import { abtn, ADMIN, cardClass, Field, inputClass } from "./ui";

function Section({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section className={cardClass}>
      <h2 className="flex items-center gap-3 border-b border-neutral-100 px-4 py-3.5 font-semibold text-neutral-900 sm:px-5">
        <span className="flex size-7 items-center justify-center rounded-full bg-emerald-700 text-xs font-bold text-white">{n}</span>
        {title}
      </h2>
      <div className="p-4 sm:p-5">{children}</div>
    </section>
  );
}

/** Front-desk booking for a walk-in or a phone call. */
export default function NewBooking() {
  const db = useTurfDB();
  const router = useRouter();
  const now = useNow(30_000);
  const ground = groundOf(db);
  const today = todayYmd();
  const [date, setDate] = useState(today);
  const [start, setStart] = useState<number | null>(null);
  const [duration, setDuration] = useState(1);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [team, setTeam] = useState("");
  const [source, setSource] = useState<"walk-in" | "phone">("walk-in");
  const [price, setPrice] = useState("");
  const [paid, setPaid] = useState("");
  const [method, setMethod] = useState<PayMethod>("cash");
  const [note, setNote] = useState("");

  if (!ground) return <p className="text-sm text-neutral-500">No ground is open for booking.</p>;

  const hours = hoursOf(db.settings);
  // The admin shell renders pages only after hydration, so `now` is the real clock here.
  const thisHour = new Date(now).getHours();
  const listPrice = start !== null ? quote(ground, start, duration, db.settings).total : 0;
  const total = price === "" ? listPrice : Number(price);
  const received = paid === "" ? 0 : Number(paid);
  const req = start !== null ? { courtId: ground.id, date, startHour: start, duration } : null;
  // Staff may record a game that is already under way, so past start times are allowed.
  const conflict = req ? findConflict(db, req, { now, allowPast: true }) : null;

  const save = () => {
    if (!req) return toast.error("Pick a start time");
    if (name.trim().length < 2) return toast.error("Enter the customer's name");
    if (received > total) return toast.error("Received is more than the price");
    const r = createAdminBooking({ ...req, customer: { name: name.trim(), phone: phone.trim(), team: team.trim() || undefined }, source, total, paid: received, method, note: note.trim() || undefined });
    if (!r.ok) return toast.error(r.error);
    toast.success(`Booking ${r.value.code} created`);
    router.push(`${ADMIN}/bookings/${r.value.id}`);
  };

  return (
    <div className="mx-auto max-w-[1400px]">
      <div className="mb-3 flex items-center gap-3 rounded-md border border-neutral-200 bg-white px-4 py-3 sm:mb-4 sm:px-5">
        <Link href={`${ADMIN}/bookings`} aria-label="Back to bookings" className={cn(abtn.outline, "size-10 shrink-0 px-0")}>
          <ArrowLeft className="size-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-neutral-900 sm:text-2xl">New booking</h1>
          <p className="text-[13px] text-neutral-600 sm:text-sm">Walk-in or phone booking for {ground.name}</p>
        </div>
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-4">
          <Section n={1} title="Date & time">
            <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
              {Array.from({ length: 7 }, (_, i) => addDays(today, i)).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => {
                    setDate(d);
                    setStart(null);
                  }}
                  className={cn(
                    "flex w-16 shrink-0 flex-col items-center rounded-md border py-2 text-xs transition",
                    d === date ? "border-emerald-700 bg-emerald-700 text-white" : "border-neutral-200 bg-white text-neutral-700 hover:border-emerald-400"
                  )}
                >
                  <span className="font-medium">{dayChip(d)}</span>
                  <span className="text-lg font-bold leading-tight">{Number(d.slice(8))}</span>
                </button>
              ))}
              <label className="flex shrink-0 items-center">
                <span className="sr-only">Other date</span>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => {
                    if (!e.target.value) return;
                    setDate(e.target.value);
                    setStart(null);
                  }}
                  className={cn(inputClass, "h-[58px] w-40")}
                />
              </label>
            </div>

            <div className="mt-4 flex items-center justify-between gap-2">
              <p className="text-sm font-medium text-neutral-700">Start time · {relativeDay(date)}</p>
              <label className="flex items-center gap-2 text-sm text-neutral-600">
                Hours
                <select value={duration} onChange={(e) => setDuration(Number(e.target.value))} className={cn(inputClass, "h-9 w-20")}>
                  {Array.from({ length: db.settings.maxDuration }, (_, i) => i + 1).map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-6">
              {hours.map((h) => {
                const info = slotInfo(db, ground, date, h, now, "");
                // The hour being played right now can still be booked for a walk-in.
                const nowHour = date === today && h === thisHour;
                const free = info.kind === "free" || (info.kind === "past" && nowHour);
                const selected = start !== null && h >= start && h < start + duration;
                return (
                  <button
                    key={h}
                    type="button"
                    disabled={!free}
                    onClick={() => setStart(h)}
                    className={cn(
                      "rounded-md border px-2 py-2 text-left transition disabled:cursor-not-allowed",
                      selected ? "border-emerald-700 bg-emerald-700 text-white" : free ? "border-neutral-200 bg-white hover:border-emerald-400" : "border-neutral-100 bg-neutral-50 text-neutral-400"
                    )}
                  >
                    <span className="block text-sm font-semibold">{hourLabel(h)}</span>
                    <span className={cn("block text-[11px]", selected ? "text-white/80" : free ? "text-emerald-700" : "")}>
                      {info.kind === "booked" ? info.booking.customer.name.split(" ")[0] : info.kind === "blocked" ? "Closed" : info.kind === "held" ? "Being paid" : free ? taka(h >= db.settings.peakStartHour ? ground.peakPrice : ground.price) : "Past"}
                    </span>
                  </button>
                );
              })}
            </div>
            {conflict && (
              <p className="mt-3 rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-800">
                {conflict.kind === "booking" ? `${duration} hours from ${hourLabel(start!)} clashes with ${conflict.booking.code} (${conflict.booking.customer.name}).` : conflictMessage(conflict)}
              </p>
            )}
          </Section>

          <Section n={2} title="Customer">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Mobile number">
                <input value={phone} inputMode="numeric" placeholder="01712 345678" onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 11))} className={inputClass} />
              </Field>
              <Field label="Full name">
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Tamim Rahman" className={inputClass} />
              </Field>
              <Field label="Team" hint="Optional">
                <input value={team} onChange={(e) => setTeam(e.target.value)} placeholder="e.g. Friday FC" className={inputClass} />
              </Field>
              <Field label="Booked by">
                <div className="grid h-10 grid-cols-2 gap-1 rounded-md bg-neutral-100 p-1 text-sm font-medium">
                  {(
                    [
                      ["walk-in", "Walk-in"],
                      ["phone", "Phone call"],
                    ] as const
                  ).map(([v, l]) => (
                    <button key={v} type="button" onClick={() => setSource(v)} className={cn("rounded", source === v ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500")}>
                      {l}
                    </button>
                  ))}
                </div>
              </Field>
            </div>
          </Section>

          <Section n={3} title="Payment">
            <div className="grid gap-3 sm:grid-cols-3">
              <Field label="Price (৳)" hint={start !== null ? `List price ${taka(listPrice)}` : "Pick a time first"}>
                <input value={price} placeholder={String(listPrice || "")} inputMode="numeric" onChange={(e) => setPrice(e.target.value.replace(/\D/g, ""))} className={inputClass} />
              </Field>
              <Field label="Received now (৳)">
                <input value={paid} placeholder="0" inputMode="numeric" onChange={(e) => setPaid(e.target.value.replace(/\D/g, ""))} className={inputClass} />
              </Field>
              <Field label="Method">
                <select value={method} onChange={(e) => setMethod(e.target.value as PayMethod)} className={inputClass}>
                  {Object.entries(payLabels).map(([v, l]) => (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <Field label="Note" hint="Staff only" className="mt-3">
              <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Needs extra bibs" className={inputClass} />
            </Field>
          </Section>
        </div>

        <aside className={cn(cardClass, "lg:sticky lg:top-20")}>
          <h2 className="border-b border-neutral-100 px-4 py-3.5 font-semibold text-neutral-900">Booking summary</h2>
          <dl className="space-y-2.5 px-4 py-4 text-sm">
            {[
              ["Date", dateLabel(date, { weekday: "short", day: "numeric", month: "short", year: "numeric" })],
              ["Time", start !== null ? rangeLabel(start, duration) : "—"],
              ["Hours", String(duration)],
              ["Price", start !== null ? taka(total) : "—"],
              ["Received", taka(received)],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-3">
                <dt className="text-neutral-600">{k}</dt>
                <dd className="text-right font-medium text-neutral-900">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="flex justify-between border-t border-neutral-100 bg-neutral-50 px-4 py-3 font-semibold">
            <span>Balance at the venue</span>
            <span className="tabular-nums">{taka(Math.max(0, total - received))}</span>
          </div>
          <div className="p-4">
            <button onClick={save} disabled={start === null || !!conflict} className={cn(abtn.primary, "h-11 w-full text-base")}>
              Create booking
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}

const dayChip = (d: string) => (d === todayYmd() ? "Today" : dateLabel(d, { weekday: "short" }));
