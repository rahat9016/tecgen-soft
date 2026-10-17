"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import { AlertTriangle, CalendarPlus, Check, Loader2, LogOut, Moon } from "lucide-react";
import { Calendar } from "@/src/components/ui/calendar";
import { parseDayKey, toDayKey } from "@/src/lib/hotelDates";
import { dateLabel, nightsBetween, payLabels, shiftDay, taka, todayKey } from "@/src/lib/hotel-store/format";
import { addPayment, changeStay, dueOf, groupOf, quoteStay, unitBookingOn, unitNumbers, useHotelDB } from "@/src/lib/hotel-store/store";
import type { Booking, HotelDB, PayMethod } from "@/src/lib/hotel-store/types";
import { cn } from "@/src/lib/utils";
import { hbtn, inputClass, Modal } from "./ui";

const methods: PayMethod[] = ["cash", "card", "bkash", "nagad", "rocket", "bank"];
const LOOKAHEAD = 60;

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

  const [checkOut, setCheckOut] = useState(shiftDay(b.checkOut, 1));
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
    const q = quoteStay(db.settings, rates[x.id] || x.pricePerNight, nightsBetween(x.checkIn, checkOut), x.rooms, x.discount);
    return { x, q, diff: q.total - x.total };
  });
  const diff = priced.reduce((s, p) => s + p.diff, 0);
  const dueNow = targets.reduce((s, x) => s + dueOf(x), 0);
  const dueAfter = Math.max(0, dueNow + diff);
  const tooLate = !!limit && checkOut > limit.l!.date;
  const valid = nights >= 1 && checkOut >= earliest && checkOut !== b.checkOut && !tooLate;

  const pick = (key: string) => setCheckOut(key < earliest ? earliest : limit && key > limit.l!.date ? limit.l!.date : key);
  const quick = [1, 2, 3, 7].map((n) => ({ n, key: shiftDay(b.checkOut, n) }));

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
    <Modal open onClose={onClose} title={added >= 0 ? "Extend stay" : "Shorten stay"} wide>
      <div className="grid gap-5 md:grid-cols-[auto_1fr]">
        <div className="rounded-md border border-neutral-200 p-2">
          <Calendar
            mode="single"
            selected={parseDayKey(checkOut) ?? undefined}
            onSelect={(d) => d && pick(toDayKey(d))}
            defaultMonth={parseDayKey(b.checkOut) ?? undefined}
            disabled={[{ before: parseDayKey(earliest)! }, ...(limit ? [{ after: parseDayKey(limit.l!.date)! }] : [])]}
            modifiers={{ stay: { from: parseDayKey(b.checkIn)!, to: parseDayKey(b.checkOut)! } }}
            modifiersClassNames={{ stay: "bg-sky-50" }}
          />
        </div>

        <div className="min-w-0 space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Quick extend</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {quick.map(({ n, key }) => (
                <button
                  key={n}
                  type="button"
                  disabled={!!limit && key > limit.l!.date}
                  onClick={() => pick(key)}
                  className={cn(hbtn.small, checkOut === key && "border-sky-500 bg-sky-50 text-sky-700")}
                >
                  +{n === 7 ? "1 week" : `${n} night${n > 1 ? "s" : ""}`}
                </button>
              ))}
              {nightsBetween(b.checkIn, b.checkOut) > 1 && shiftDay(b.checkOut, -1) >= earliest && (
                <button type="button" onClick={() => pick(shiftDay(b.checkOut, -1))} className={cn(hbtn.small, checkOut === shiftDay(b.checkOut, -1) && "border-amber-500 bg-amber-50 text-amber-700")}>
                  −1 night (leave early)
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-sm">
            <div className="rounded-md border border-neutral-200 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">Was</p>
              <p className="mt-1 font-bold text-neutral-900">{dateLabel(b.checkOut)}</p>
              <p className="text-xs text-neutral-500">{b.nights} night{b.nights > 1 ? "s" : ""}</p>
            </div>
            <span className={cn("flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-bold text-white", added >= 0 ? "bg-sky-600" : "bg-amber-500")}>
              <Moon className="size-3" /> {added >= 0 ? `+${added}` : added}
            </span>
            <div className="rounded-md border border-sky-200 bg-sky-50/60 p-3">
              <p className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-sky-700">
                <LogOut className="size-3" /> New check-out
              </p>
              <p className="mt-1 font-bold text-neutral-900">{dateLabel(checkOut)}</p>
              <p className="text-xs text-neutral-500">
                {nights} night{nights !== 1 ? "s" : ""} · until {db.settings.checkOutTime}
              </p>
            </div>
          </div>

          {limit ? (
            <p className="flex gap-2 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800">
              <AlertTriangle className="size-4 shrink-0" />
              Room {limit.l!.room} is {limit.l!.by ? `booked by ${limit.l!.by.code} (${limit.l!.by.guest.name})` : "out of service"} from {dateLabel(limit.l!.date)} — the latest check-out in the same room is{" "}
              {dateLabel(limit.l!.date)}. For longer, move the guest to another room first.
            </p>
          ) : (
            <p className="flex items-center gap-2 text-xs text-emerald-700">
              <Check className="size-4" /> Room {unitNumbers(db, targets.flatMap((x) => x.unitIds)).join(", ") || "—"} stays free for the next {LOOKAHEAD} nights.
            </p>
          )}

          {siblings.length > 0 && (
            <div className="rounded-md border border-neutral-200 p-3 text-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Booked together</p>
              {siblings.map((x) => (
                <label key={x.id} className="mt-2 flex items-center gap-2">
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

          <div className="overflow-hidden rounded-md border border-neutral-200 text-sm">
            <div className="divide-y divide-neutral-100">
              {priced.map((p) => (
                <div key={p.x.id} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2">
                  <span className="text-neutral-600">
                    {targets.length > 1 && <b className="text-neutral-800">{p.x.roomName} · </b>}
                    Rate / night
                  </span>
                  <span className="relative w-28">
                    <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-neutral-400">৳</span>
                    <input
                      type="number"
                      min={1}
                      value={rates[p.x.id] ?? ""}
                      onChange={(e) => setRates((r) => ({ ...r, [p.x.id]: Number(e.target.value) }))}
                      className={cn(inputClass, "h-8 pl-6 text-right tabular-nums")}
                    />
                  </span>
                </div>
              ))}
              <div className="flex justify-between px-3 py-2 text-neutral-600">
                <span>New room total</span>
                <span className="tabular-nums text-neutral-900">{taka(priced.reduce((s, p) => s + p.q.total, 0))}</span>
              </div>
              <div className={cn("flex justify-between px-3 py-2 font-semibold", diff >= 0 ? "text-neutral-900" : "text-emerald-700")}>
                <span>{diff >= 0 ? "Extra to pay" : "Less to pay"}</span>
                <span className="tabular-nums">
                  {diff >= 0 ? "+" : "−"}
                  {taka(Math.abs(diff))}
                </span>
              </div>
            </div>
            <div className={cn("flex justify-between px-3 py-2.5 font-semibold", dueAfter ? "bg-amber-50 text-amber-900" : "bg-emerald-50 text-emerald-800")}>
              <span>Balance after change</span>
              <span className="tabular-nums">{taka(collect && diff > 0 ? dueNow : dueAfter)}</span>
            </div>
          </div>

          {diff > 0 && (
            <div className="rounded-md border border-neutral-200 p-3">
              <label className="flex items-center gap-2 text-sm font-medium text-neutral-800">
                <input type="checkbox" checked={collect} onChange={(e) => setCollect(e.target.checked)} className="size-4 accent-sky-600" />
                Collect {taka(diff)} for the extra nights now
              </label>
              {collect && (
                <>
                  <div className="mt-3 grid grid-cols-3 gap-1.5 sm:grid-cols-6">
                    {methods.map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setMethod(m)}
                        className={cn("h-8 rounded-md border text-xs font-medium", method === m ? "border-sky-500 bg-sky-50 text-sky-800" : "border-neutral-200 text-neutral-600")}
                      >
                        {payLabels[m]}
                      </button>
                    ))}
                  </div>
                  {method !== "cash" && <input value={payRef} onChange={(e) => setPayRef(e.target.value)} placeholder="Transaction ID / reference" className={cn(inputClass, "mt-2")} />}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="mt-5 flex justify-end gap-2">
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
