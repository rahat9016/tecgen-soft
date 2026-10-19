import { hotelDayOf, stayNights } from "./format";
import { effectiveCheckOut, isLive } from "./store";
import type { Booking, HotelDB, Payment } from "./types";

/** Rooms in service (out-of-order rooms can't be sold). */
export const roomsInService = (db: HotelDB) => db.units.filter((u) => !u.outOfService).length;

const sells = (b: Booking) => isLive(b);

/** Rooms sold for a night, counting everything that holds a room that night. */
export const roomsSoldOn = (db: HotelDB, night: string) =>
  db.bookings.filter((b) => sells(b) && b.checkIn <= night && night < effectiveCheckOut(b)).reduce((s, b) => s + b.rooms, 0);

export const occupancyOn = (db: HotelDB, night: string) => {
  const total = roomsInService(db);
  return total ? Math.min(100, (roomsSoldOn(db, night) / total) * 100) : 0;
};

export type LedgerRow = Payment & { booking: Booking; signed: number; day: string };

/** Every payment and refund across all bookings, newest first. */
export function ledger(db: HotelDB): LedgerRow[] {
  return db.bookings
    .flatMap((booking) =>
      booking.payments.map((p) => ({ ...p, booking, signed: p.void ? 0 : p.kind === "refund" ? -p.amount : p.amount, day: hotelDayOf(p.at) }))
    )
    .sort((a, b) => b.at.localeCompare(a.at));
}

/** Net payments (payments − refunds) per hotel day. */
export function collectedByDay(rows: LedgerRow[]) {
  const map = new Map<string, number>();
  rows.forEach((r) => map.set(r.day, (map.get(r.day) ?? 0) + r.signed));
  return map;
}

/** Room revenue earned on the nights in [from, to): price × rooms for every sold night (excl. fees & VAT). */
export function roomRevenue(db: HotelDB, from: string, to: string) {
  const byType = new Map<string, { revenue: number; nights: number }>();
  let revenue = 0;
  let nights = 0;
  for (const b of db.bookings) {
    if (!sells(b) || b.status === "pending" || b.checkIn >= to || effectiveCheckOut(b) <= from) continue;
    const n = stayNights(b.checkIn, effectiveCheckOut(b)).filter((d) => d >= from && d < to).length * b.rooms;
    if (!n) continue;
    const r = n * b.pricePerNight;
    revenue += r;
    nights += n;
    const row = byType.get(b.roomTypeId) ?? { revenue: 0, nights: 0 };
    byType.set(b.roomTypeId, { revenue: row.revenue + r, nights: row.nights + n });
  }
  return { revenue, nights, byType };
}
