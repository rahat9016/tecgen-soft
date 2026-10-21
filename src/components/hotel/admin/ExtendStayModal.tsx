"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import { ArrowRight, BedDouble, CalendarPlus, Loader2 } from "lucide-react";
import { Calendar } from "@/src/components/ui/calendar";
import { parseDayKey, toDayKey } from "@/src/lib/hotelDates";
import { dateLabel, nightsBetween, payLabels, shiftDay, taka, todayKey } from "@/src/lib/hotel-store/format";
import { addPayment, changeStay, dueOf, groupOf, quoteStay, ratesFor, unitBookingOn, unitNumbers, useHotelDB } from "@/src/lib/hotel-store/store";
import type { Booking, HotelDB, PayMethod } from "@/src/lib/hotel-store/types";
import { cn } from "@/src/lib/utils";
import { hbtn, inputClass, Modal } from "./ui";

const methods: PayMethod[] = ["cash", "card", "bkash", "nagad", "rocket", "bank"];
const LOOKAHEAD = 60;

const nightsText = (n: number) => `${n} night${Math.abs(n) === 1 ? "" : "s"}`;
const sectionLabel = "mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500";
const chip = "h-9 rounded-md border px-3 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 disabled:cursor-not-allowed disabled:opacity-40";

/** The latest check-out the booking's rooms allow: the first night someone else holds one of them. */
function latestCheckOut(db: HotelDB, b: Booking) {
  let night = b.checkOut;
  for (let i = 0; i < LOOKAHEAD; i++) {
    for (const unitId of b.unitIds) {
      const unit = db.units.find((u) => u.id === unitId);
      const other = unitBookingOn(db, unitId, night, b.id);
      if (other || unit?.outOfService) return { date: night, by: other, room: unit?.number };
    }
    night = shiftDay(night, 1);
  }
  return null;
}

/** Add or take off nights for a guest who is staying: same rooms, same rate unless changed, extra cost shown up front. */
export default function ExtendStayModal({ booking: b, onClose }: { booking: Booking; onClose: () => void }) {
  const db = useHotelDB();
  const today = todayKey();
  // Linked bookings for the same guest that leave on the same day can be moved together.
  const siblings = groupOf(db, b).filter((x) => x.status === b.status && x.checkOut === b.checkOut);
  const [withIds, setWithIds] = useState<string[]>(siblings.map((x) => x.id));
  const targets = [b, ...siblings.filter((x) => withIds.includes(x.id))];

  // Start one night later, unless someone else already has the room from the current check-out day.
  const [checkOut, setCheckOut] = useState(() => (latestCheckOut(db, b)?.date === b.checkOut ? b.checkOut : shiftDay(b.checkOut, 1)));
  const [rates, setRates] = useState<Record<string, number>>(() => Object.fromEntries([b, ...siblings].map((x) => [x.id, x.pricePerNight])));
  const [collect, setCollect] = useState(true);
  const [method, setMethod] = useState<PayMethod>("cash");
  const [payRef, setPayRef] = useState("");
  const [saving, setSaving] = useState(false);

  const earliest = shiftDay(b.checkIn > today ? b.checkIn : today, 1);
  const limit =
    targets
      .map((x) => ({ x, l: latestCheckOut(db, x) }))
      .filter((t) => t.l)
      .sort((p, q) => p.l!.date.localeCompare(q.l!.date))[0] ?? null;

  const nights = nightsBetween(b.checkIn, checkOut);
  const added = nightsBetween(b.checkOut, checkOut);
  const priced = targets.map((x) => {
    const q = quoteStay(ratesFor(db.settings, x), rates[x.id] || x.pricePerNight, nightsBetween(x.checkIn, checkOut), x.rooms, x.discount);
    return { x, q, diff: q.total - x.total };
  });
  const diff = priced.reduce((s, p) => s + p.diff, 0);
  const totalBefore = targets.reduce((s, x) => s + x.total, 0);
  const totalAfter = priced.reduce((s, p) => s + p.q.total, 0);
  const dueNow = targets.reduce((s, x) => s + dueOf(x), 0);
  const dueAfter = Math.max(0, dueNow + diff);
  const balanceAfter = collect && diff > 0 ? dueNow : dueAfter;
  const tooLate = !!limit && checkOut > limit.l!.date;
  const blocked = !!limit && limit.l!.date <= b.checkOut;
  const valid = nights >= 1 && checkOut >= earliest && checkOut !== b.checkOut && !tooLate;
  // Shown on hover over dates and picks that the room can't reach.
  const limitReason = limit ? `Room ${limit.l!.room} is ${limit.l!.by ? "booked" : "out of service"} from ${dateLabel(limit.l!.date, "dd MMM")}` : undefined;
  const roomLabel = (x: Booking) => {
    const nums = unitNumbers(db, x.unitIds);
    const missing = x.rooms - nums.length;
    if (!nums.length) return `${x.rooms > 1 ? `${x.rooms} rooms` : "Room"} not assigned yet`;
    return `${nums.length > 1 ? "Rooms" : "Room"} ${nums.join(", ")}${missing > 0 ? ` + ${missing} not assigned` : ""}`;
  };

  const pick = (key: string) => setCheckOut(key < earliest ? earliest : limit && key > limit.l!.date ? limit.l!.date : key);
  const quick = [1, 2, 3, 7].map((n) => ({ label: n === 7 ? "+1 week" : `+${nightsText(n)}`, key: shiftDay(b.checkOut, n) }));
  const early = shiftDay(b.checkOut, -1);
  const canLeaveEarly = nightsBetween(b.checkIn, b.checkOut) > 1 && early >= earliest;

  const submit = () => {
    if (!valid || saving) return;
    setSaving(true);
    for (const p of priced) {
      const r = changeStay(p.x.id, {
        checkIn: p.x.checkIn,
        checkOut,
        roomTypeId: p.x.roomTypeId,
        rooms: p.x.rooms,
        adults: p.x.adults,
        children: p.x.children,
        pricePerNight: rates[p.x.id] || p.x.pricePerNight,
      });
      if (!r.ok) {
        setSaving(false);
        return toast.error(`${p.x.code}: ${r.error}`);
      }
      // The extra nights are paid on each booking's own folio.
      if (collect && p.diff > 0) {
        const amount = Math.min(p.diff, dueOf(r.value));
        if (amount > 0) {
          const pr = addPayment(p.x.id, { amount, method, kind: "payment", ref: payRef.trim() || undefined, note: `Stay extension to ${checkOut}` });
          if (!pr.ok) toast.error(`${p.x.code}: ${pr.error}`);
        }
      }
    }
    toast.success(`${targets.map((x) => x.code).join(", ")} now check${targets.length > 1 ? "" : "s"} out ${dateLabel(checkOut)}`);
    onClose();
  };

  return (
    <Modal open onClose={onClose} title={added >= 0 ? "Extend stay" : "Shorten stay"} wide className="max-w-4xl">
      <div className="grid gap-6 md:grid-cols-[340px_1fr]">
        {/* Choosing the date */}
        <div className="space-y-5">
          <div>
            <p className={sectionLabel}>New check-out date</p>
            {/* Day cells are fixed 44px touch targets, so the frame only appears where there's room for it. */}
            <div className="flex justify-center sm:rounded-lg sm:border sm:border-neutral-200 sm:p-1">
              <Calendar
                mode="single"
                showOutsideDays={false}
                selected={parseDayKey(checkOut) ?? undefined}
                onSelect={(d) => d && pick(toDayKey(d))}
                defaultMonth={parseDayKey(b.checkOut) ?? undefined}
                disabled={[{ before: parseDayKey(earliest)! }, ...(limit ? [{ after: parseDayKey(limit.l!.date)! }] : [])]}
                modifiers={{ stay: { from: parseDayKey(b.checkIn)!, to: parseDayKey(b.checkOut)! } }}
                modifiersClassNames={{ stay: "bg-sky-50" }}
                className="p-0 sm:p-2"
              />
            </div>
            <div className="mt-2 flex items-center gap-4 text-xs text-neutral-500">
              <span className="flex items-center gap-1.5">
                <span className="size-3 rounded-sm bg-sky-50 ring-1 ring-sky-100" aria-hidden /> Current stay
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-3 rounded-sm bg-primary" aria-hidden /> New check-out
              </span>
            </div>
          </div>

          <div>
            <p className={sectionLabel}>Quick pick</p>
            <div className="grid grid-cols-2 gap-2">
              {quick.map(({ label, key }) => (
                <button
                  key={key}
                  type="button"
                  disabled={!!limit && key > limit.l!.date}
                  title={!!limit && key > limit.l!.date ? limitReason : undefined}
                  onClick={() => pick(key)}
                  aria-pressed={checkOut === key}
                  className={cn(chip, checkOut === key ? "border-sky-500 bg-sky-50 text-sky-800" : "border-neutral-200 bg-white text-neutral-700 hover:border-sky-300")}
                >
                  {label}
                </button>
              ))}
              {canLeaveEarly && (
                <button
                  type="button"
                  onClick={() => pick(early)}
                  aria-pressed={checkOut === early}
                  className={cn(chip, "col-span-2", checkOut === early ? "border-sky-500 bg-sky-50 text-sky-800" : "border-neutral-200 bg-white text-neutral-700 hover:border-sky-300")}
                >
                  Leave 1 night early
                </button>
              )}
            </div>
          </div>
        </div>

        {/* What changes */}
        <div className="min-w-0 space-y-4">
          <div className="overflow-hidden rounded-lg border border-neutral-200">
            <div className="p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Check-out</p>
                {blocked && added === 0 ? (
                  <span title={limitReason} className="whitespace-nowrap rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700">
                    Can&apos;t extend
                  </span>
                ) : (
                  <span className={cn("whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold", added > 0 ? "bg-sky-50 text-sky-700" : "bg-neutral-100 text-neutral-700")}>
                    {added === 0 ? "No change" : `${added > 0 ? "+" : ""}${nightsText(added)}`}
                  </span>
                )}
              </div>
              <div className="mt-2 grid grid-cols-[1fr_auto_1fr] items-start gap-3">
                <div>
                  <p className={cn("font-semibold text-neutral-500", added !== 0 && "line-through decoration-neutral-300")}>{dateLabel(b.checkOut, "EEE dd MMM")}</p>
                  <p className="text-xs text-neutral-500">{nightsText(b.nights)}</p>
                </div>
                <ArrowRight className="mt-1 size-4 text-neutral-400" aria-label="changes to" />
                <div className="text-right">
                  <p className="font-semibold text-sky-800">{dateLabel(checkOut, "EEE dd MMM")}</p>
                  <p className="text-xs text-neutral-500">
                    {nightsText(nights)} · by {db.settings.checkOutTime}
                  </p>
                </div>
              </div>
            </div>
            {/* Every room on the booking moves to the new check-out together. */}
            <ul className="divide-y divide-neutral-100 border-t border-neutral-100 bg-neutral-50 text-xs">
              {targets.map((x) => (
                <li key={x.id} className="flex items-center gap-2 px-4 py-2.5 text-neutral-600">
                  <BedDouble className="size-4 shrink-0 text-neutral-400" aria-hidden />
                  <span className="min-w-0">
                    <b className="font-semibold text-neutral-800">{roomLabel(x)}</b> · {x.roomName}
                    {x.rooms > 1 ? ` × ${x.rooms}` : ""}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {siblings.length > 0 && (
            <div className="rounded-lg border border-neutral-200 p-4 text-sm">
              <p className={sectionLabel}>Booked together</p>
              {siblings.map((x) => (
                <label key={x.id} className="mt-2 flex items-center gap-2 text-neutral-700">
                  <input
                    type="checkbox"
                    checked={withIds.includes(x.id)}
                    onChange={(e) => setWithIds((ids) => (e.target.checked ? [...ids, x.id] : ids.filter((i) => i !== x.id)))}
                    className="size-4 accent-sky-600"
                  />
                  Also change {x.code} · {x.roomName} (room {unitNumbers(db, x.unitIds).join(", ") || "—"})
                </label>
              ))}
            </div>
          )}

          <div className="overflow-hidden rounded-lg border border-neutral-200 text-sm">
            <div className="divide-y divide-neutral-100">
              {priced.map((p) => (
                <label key={p.x.id} className="flex items-center justify-between gap-3 px-4 py-3">
                  <span className="min-w-0">
                    <span className="block text-neutral-700">
                      {targets.length > 1 && <b className="font-semibold text-neutral-900">{p.x.roomName} · </b>}
                      Rate {p.x.rooms > 1 ? "per room / night" : "per night"}
                    </span>
                    <span className="block text-xs tabular-nums text-neutral-500">
                      × {nightsText(nightsBetween(p.x.checkIn, checkOut))}
                      {p.x.rooms > 1 ? ` × ${p.x.rooms} rooms` : ""} = {taka(p.q.subtotal)}
                    </span>
                  </span>
                  <span className="relative w-32">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-neutral-400">৳</span>
                    <input
                      type="number"
                      min={1}
                      inputMode="numeric"
                      value={rates[p.x.id] || ""}
                      onChange={(e) => setRates((r) => ({ ...r, [p.x.id]: Number(e.target.value) }))}
                      className={cn(inputClass, "h-9 pl-7 text-right tabular-nums")}
                    />
                  </span>
                </label>
              ))}
            </div>
            <dl className="space-y-2 border-t border-neutral-100 px-4 py-3">
              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-neutral-600">Stay total</dt>
                <dd className="tabular-nums">
                  {totalAfter !== totalBefore && <span className="mr-2 text-neutral-400 line-through">{taka(totalBefore)}</span>}
                  <span className="font-medium text-neutral-900">{taka(totalAfter)}</span>
                </dd>
              </div>
              <div className={cn("flex items-baseline justify-between gap-3 font-semibold", diff > 0 ? "text-neutral-900" : diff < 0 ? "text-emerald-700" : "text-neutral-600")}>
                <dt>{diff >= 0 ? "Extra to pay" : "Less to pay"}</dt>
                <dd className="text-base tabular-nums">
                  {diff > 0 ? "+" : diff < 0 ? "−" : ""}
                  {taka(Math.abs(diff))}
                </dd>
              </div>
            </dl>
            <div className={cn("flex items-baseline justify-between gap-3 px-4 py-2.5 font-semibold", balanceAfter ? "bg-rose-50 text-rose-800" : "bg-emerald-50 text-emerald-800")}>
              <span>Balance after change</span>
              <span className="tabular-nums">{taka(balanceAfter)}</span>
            </div>
          </div>

          {diff > 0 && (
            <div className={cn("rounded-lg border p-4", collect ? "border-sky-200 bg-sky-50/40" : "border-neutral-200")}>
              <label className="flex items-center gap-3">
                <input type="checkbox" checked={collect} onChange={(e) => setCollect(e.target.checked)} className="size-4 accent-sky-600" />
                <span className="text-sm font-semibold text-neutral-900">Collect {taka(diff)} now</span>
              </label>
              {collect && (
                <div className="mt-3 pl-7">
                  <div className="grid grid-cols-3 gap-2">
                    {methods.map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setMethod(m)}
                        aria-pressed={method === m}
                        className={cn(chip, "px-2", method === m ? "border-sky-500 bg-white text-sky-800 ring-2 ring-sky-100" : "border-neutral-200 bg-white text-neutral-700 hover:border-sky-300")}
                      >
                        {payLabels[m]}
                      </button>
                    ))}
                  </div>
                  {method !== "cash" && (
                    <input value={payRef} onChange={(e) => setPayRef(e.target.value)} placeholder="Transaction ID / reference" aria-label="Transaction ID / reference" className={cn(inputClass, "mt-2")} />
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap justify-end gap-2 border-t border-neutral-100 pt-4">
        <button type="button" onClick={onClose} className={hbtn.outline}>
          Cancel
        </button>
        <button type="button" onClick={submit} disabled={!valid || saving || (collect && diff > 0 && method !== "cash" && !payRef.trim())} className={hbtn.primary}>
          {saving ? <Loader2 className="size-4 animate-spin" /> : <CalendarPlus className="size-4" />}
          {added >= 0 ? `Extend to ${dateLabel(checkOut, "dd MMM")}` : `Shorten to ${dateLabel(checkOut, "dd MMM")}`}
          {collect && diff > 0 ? ` & collect ${taka(diff)}` : ""}
        </button>
      </div>
    </Modal>
  );
}
