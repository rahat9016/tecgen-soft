"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { ArrowLeft, Check, Search, UserRound } from "lucide-react";
import { housekeepingLabels, nightsBetween, payLabels, shiftDay, sourceLabels, taka, todayKey } from "@/src/lib/hotel-store/format";
import { createStaffBooking, freeRooms, freeUnits, quoteStay, suggestUnits, useHotelDB } from "@/src/lib/hotel-store/store";
import type { BookingSource, GuestInfo, PayMethod, User } from "@/src/lib/hotel-store/types";
import { cn } from "@/src/lib/utils";
import { ADMIN, Card, Field, hbtn, inputClass, textareaClass } from "./ui";

const methods: PayMethod[] = ["cash", "card", "bkash", "nagad", "rocket", "bank"];
const emptyGuest: GuestInfo = { name: "", phone: "", email: "", country: "Bangladesh", idType: "nid", idNumber: "", note: "" };

export default function NewBooking() {
  const db = useHotelDB();
  const router = useRouter();
  const params = useSearchParams();
  const today = todayKey();
  const activeTypes = db.roomTypes;
  const [typeId, setTypeId] = useState(params.get("type") ?? activeTypes[0]?.id ?? "");
  const [checkIn, setCheckIn] = useState(params.get("checkIn") ?? today);
  const [checkOut, setCheckOut] = useState(params.get("checkOut") ?? shiftDay(params.get("checkIn") ?? today, 1));
  const [roomsCount, setRoomsCount] = useState(1);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [rate, setRate] = useState<number | "">("");
  const [picked, setPicked] = useState<string[] | null>(params.get("unit") ? [params.get("unit")!] : null);
  const [source, setSource] = useState<Exclude<BookingSource, "website">>("walk-in");
  const [guest, setGuest] = useState<GuestInfo>(emptyGuest);
  const [userId, setUserId] = useState<string | undefined>(params.get("guest") ?? undefined);
  const [lookup, setLookup] = useState("");
  const [payAmount, setPayAmount] = useState("");
  const [payMethod, setPayMethod] = useState<PayMethod>("cash");
  const [payRef, setPayRef] = useState("");
  const [checkInNow, setCheckInNow] = useState(true);
  const [tentative, setTentative] = useState(false);
  const [note, setNote] = useState("");

  const type = db.roomTypes.find((t) => t.id === typeId);
  const nights = nightsBetween(checkIn, checkOut);
  const price = rate === "" ? (type?.price ?? 0) : rate;
  const q = quoteStay(db.settings, price, nights, roomsCount);
  const free = type && nights > 0 ? freeRooms(db, type.id, checkIn, checkOut) : 0;
  const units = type && nights > 0 ? freeUnits(db, type.id, checkIn, checkOut) : [];
  const chosen = (picked ?? (type && nights > 0 ? suggestUnits(db, type.id, checkIn, checkOut, roomsCount) : [])).filter((id) => units.some((u) => u.id === id)).slice(0, roomsCount);
  const canCheckInNow = checkIn === today;

  const preset = userId ? db.users.find((u) => u.id === userId) : undefined;
  const [presetApplied, setPresetApplied] = useState(false);
  if (preset && !presetApplied) {
    setPresetApplied(true);
    setGuest({ ...emptyGuest, name: preset.name, phone: preset.phone, email: preset.email, country: preset.country ?? "Bangladesh" });
  }

  const matches = useMemo(() => {
    const n = lookup.trim().toLowerCase();
    if (n.length < 2) return [];
    return db.users.filter((u) => u.role === "guest" && [u.name, u.phone, u.email].some((v) => v.toLowerCase().includes(n))).slice(0, 6);
  }, [db.users, lookup]);

  const pickGuest = (u: User) => {
    setUserId(u.id);
    setGuest({ ...emptyGuest, name: u.name, phone: u.phone, email: u.email, country: u.country ?? "Bangladesh" });
    setLookup("");
  };

  const toggleUnit = (id: string) => {
    const cur = chosen;
    setPicked(cur.includes(id) ? cur.filter((x) => x !== id) : cur.length >= roomsCount ? [...cur.slice(1), id] : [...cur, id]);
  };

  const submit = () => {
    if (userId && db.users.find((u) => u.id === userId)?.status === "blocked" && !confirm("This guest is blocked. Book anyway?")) return;
    const r = createStaffBooking({
      roomTypeId: typeId,
      checkIn,
      checkOut,
      rooms: roomsCount,
      adults,
      children,
      guest,
      userId,
      source,
      pricePerNight: price,
      unitIds: chosen,
      payment: Number(payAmount) > 0 ? { amount: Number(payAmount), method: payMethod, ref: payRef } : undefined,
      checkInNow: canCheckInNow && checkInNow && !tentative,
      tentative,
      internalNote: note || undefined,
    });
    if (!r.ok) return toast.error(r.error);
    toast.success(`${r.value.code} created${r.value.status === "checked-in" ? " — guest checked in" : ""}`);
    router.push(`${ADMIN}/bookings/${r.value.id}`);
  };

  return (
    <div>
      <Link href={`${ADMIN}/bookings`} className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-sky-700">
        <ArrowLeft className="size-4" /> Bookings
      </Link>
      <h1 className="mt-2 text-2xl font-bold text-neutral-900">New booking</h1>
      <p className="mt-1 text-sm text-neutral-500">For walk-in guests, phone reservations and travel agents.</p>

      <div className="mt-6 grid items-start gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <Card>
            <h2 className="font-semibold text-neutral-900">Stay</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Field label="Room type" className="sm:col-span-2">
                <select
                  value={typeId}
                  onChange={(e) => {
                    setTypeId(e.target.value);
                    setPicked(null);
                    setRate("");
                  }}
                  className={inputClass}
                >
                  {activeTypes.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} · {taka(t.price)} · sleeps {t.capacity}
                      {t.active ? "" : " (hidden on website)"}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Check-in">
                <input
                  type="date"
                  min={today}
                  value={checkIn}
                  onChange={(e) => {
                    setCheckIn(e.target.value);
                    if (e.target.value >= checkOut) setCheckOut(shiftDay(e.target.value, 1));
                    setPicked(null);
                  }}
                  className={inputClass}
                />
              </Field>
              <Field label="Check-out">
                <input
                  type="date"
                  min={shiftDay(checkIn, 1)}
                  value={checkOut}
                  onChange={(e) => {
                    setCheckOut(e.target.value);
                    setPicked(null);
                  }}
                  className={inputClass}
                />
              </Field>
              <Field label="Rooms">
                <input type="number" min={1} max={Math.max(1, free)} value={roomsCount} onChange={(e) => setRoomsCount(Math.max(1, Number(e.target.value)))} className={inputClass} />
              </Field>
              <Field label="Adults">
                <input type="number" min={1} value={adults} onChange={(e) => setAdults(Math.max(1, Number(e.target.value)))} className={inputClass} />
              </Field>
              <Field label="Children">
                <input type="number" min={0} value={children} onChange={(e) => setChildren(Math.max(0, Number(e.target.value)))} className={inputClass} />
              </Field>
              <Field label="Rate / night (BDT)" hint={type ? `Rack rate ${taka(type.price)}` : undefined}>
                <input type="number" min={1} value={rate} placeholder={String(type?.price ?? "")} onChange={(e) => setRate(e.target.value === "" ? "" : Number(e.target.value))} className={inputClass} />
              </Field>
            </div>

            <div className="mt-5">
              <p className={cn("text-sm font-medium", free >= roomsCount ? "text-emerald-700" : "text-rose-600")}>
                {nights < 1 ? "Pick valid dates" : free >= roomsCount ? `${free} ${type?.name} free · pick room${roomsCount > 1 ? "s" : ""}` : free ? `Only ${free} free for these dates` : "Fully booked for these dates"}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {units.map((u) => {
                  const on = chosen.includes(u.id);
                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => toggleUnit(u.id)}
                      aria-pressed={on}
                      className={cn("w-20 rounded-md border p-2 text-left transition", on ? "border-sky-500 bg-sky-50 ring-2 ring-sky-100" : "border-neutral-200 hover:border-sky-300")}
                    >
                      <span className="flex items-center justify-between text-base font-bold text-neutral-900">
                        {u.number} {on && <Check className="size-4 text-sky-600" />}
                      </span>
                      <span className={cn("block text-[10px]", u.housekeeping === "dirty" ? "text-amber-600" : "text-emerald-600")}>{housekeepingLabels[u.housekeeping]}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-semibold text-neutral-900">Guest</h2>
              <div className="flex gap-1 rounded-md bg-neutral-100 p-1 text-xs font-medium">
                {(["walk-in", "phone", "agent"] as const).map((s) => (
                  <button key={s} onClick={() => setSource(s)} className={cn("rounded-md px-3 py-1", source === s ? "bg-white text-sky-700 shadow-sm" : "text-neutral-600")}>
                    {sourceLabels[s]}
                  </button>
                ))}
              </div>
            </div>
            <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
              <input value={lookup} onChange={(e) => setLookup(e.target.value)} placeholder="Find a returning guest by name, phone or email" className={cn(inputClass, "pl-9")} />
              {matches.length > 0 && (
                <ul className="absolute inset-x-0 top-full z-10 mt-1 overflow-hidden rounded-md border border-neutral-200 bg-white shadow-lg">
                  {matches.map((u) => (
                    <li key={u.id}>
                      <button onClick={() => pickGuest(u)} className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-sky-50">
                        <UserRound className="size-4 text-neutral-400" />
                        <span className="flex-1">
                          <span className="font-medium text-neutral-900">{u.name}</span>
                          <span className="block text-xs text-neutral-500">
                            {u.phone} · {u.email}
                          </span>
                        </span>
                        {u.status === "blocked" && <span className="text-xs font-semibold text-rose-600">Blocked</span>}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {userId && (
              <p className="mt-2 flex items-center gap-2 text-xs text-sky-700">
                Returning guest linked.
                <button
                  onClick={() => {
                    setUserId(undefined);
                    setGuest(emptyGuest);
                  }}
                  className="font-semibold underline"
                >
                  Clear
                </button>
              </p>
            )}
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Full name">
                <input value={guest.name} onChange={(e) => setGuest({ ...guest, name: e.target.value })} className={inputClass} />
              </Field>
              <Field label="Phone">
                <input value={guest.phone} onChange={(e) => setGuest({ ...guest, phone: e.target.value })} className={inputClass} placeholder="+880 17XX-XXXXXX" />
              </Field>
              <Field label="Email (optional)">
                <input value={guest.email} onChange={(e) => setGuest({ ...guest, email: e.target.value })} className={inputClass} />
              </Field>
              <Field label="Country">
                <input value={guest.country ?? ""} onChange={(e) => setGuest({ ...guest, country: e.target.value })} className={inputClass} />
              </Field>
              <Field label="ID">
                <div className="flex gap-2">
                  <select value={guest.idType} onChange={(e) => setGuest({ ...guest, idType: e.target.value as "nid" | "passport" })} className={cn(inputClass, "w-32")}>
                    <option value="nid">NID</option>
                    <option value="passport">Passport</option>
                  </select>
                  <input value={guest.idNumber ?? ""} onChange={(e) => setGuest({ ...guest, idNumber: e.target.value })} className={inputClass} placeholder="Number" />
                </div>
              </Field>
              <Field label="Requests">
                <input value={guest.note ?? ""} onChange={(e) => setGuest({ ...guest, note: e.target.value })} className={inputClass} placeholder="e.g. Extra bed, late check-out" />
              </Field>
            </div>
          </Card>
        </div>

        <div className="space-y-6 xl:sticky xl:top-24">
          <Card>
            <h2 className="font-semibold text-neutral-900">Summary</h2>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-neutral-500">
                  {taka(price)} × {nights} night{nights !== 1 ? "s" : ""}
                  {roomsCount > 1 ? ` × ${roomsCount}` : ""}
                </dt>
                <dd className="tabular-nums">{taka(q.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-neutral-500">Service ({db.settings.serviceFeeRate}%)</dt>
                <dd className="tabular-nums">{taka(q.serviceFee)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-neutral-500">VAT ({db.settings.vatRate}%)</dt>
                <dd className="tabular-nums">{taka(q.tax)}</dd>
              </div>
              <div className="flex justify-between border-t border-neutral-100 pt-2 text-base font-bold">
                <dt>Total</dt>
                <dd className="tabular-nums">{taka(q.total)}</dd>
              </div>
            </dl>

            <h3 className="mt-5 text-xs font-semibold uppercase tracking-wide text-neutral-500">Payment now</h3>
            <div className="mt-2 grid grid-cols-3 gap-1.5">
              {methods.map((m) => (
                <button key={m} onClick={() => setPayMethod(m)} className={cn("h-8 rounded-md border text-xs font-medium", payMethod === m ? "border-sky-500 bg-sky-50 text-sky-800" : "border-neutral-200 text-neutral-600")}>
                  {payLabels[m]}
                </button>
              ))}
            </div>
            <div className="mt-2 flex gap-2">
              <input type="number" min={0} value={payAmount} onChange={(e) => setPayAmount(e.target.value)} placeholder="Amount" className={inputClass} />
              <button onClick={() => setPayAmount(String(q.deposit))} className={hbtn.small} title="Deposit">
                {db.settings.depositRate}%
              </button>
              <button onClick={() => setPayAmount(String(q.total))} className={hbtn.small}>
                Full
              </button>
            </div>
            {payMethod !== "cash" && Number(payAmount) > 0 && (
              <input value={payRef} onChange={(e) => setPayRef(e.target.value)} placeholder="Transaction / reference" className={cn(inputClass, "mt-2")} />
            )}

            <div className="mt-5 space-y-2 text-sm">
              {canCheckInNow && (
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={checkInNow && !tentative} disabled={tentative} onChange={(e) => setCheckInNow(e.target.checked)} className="size-4 accent-sky-600" />
                  Check the guest in now
                </label>
              )}
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={tentative} onChange={(e) => setTentative(e.target.checked)} className="size-4 accent-sky-600" />
                Tentative (awaiting deposit)
              </label>
            </div>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder="Staff note (optional)" className={cn(textareaClass, "mt-3")} />

            <button onClick={submit} disabled={!type || nights < 1 || free < roomsCount} className={cn(hbtn.primary, "mt-4 h-11 w-full")}>
              {canCheckInNow && checkInNow && !tentative ? "Create & check in" : "Create booking"}
            </button>
          </Card>
        </div>
      </div>
    </div>
  );
}
