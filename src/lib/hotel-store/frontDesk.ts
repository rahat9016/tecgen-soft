import type { Booking, HotelDB, RoomUnit } from "./types";

/** Today's front-desk work. `today` is the hotel's calendar day (Asia/Dhaka) from `todayKey()`. */

export const awaitingArrival = (b: Booking) => b.status === "confirmed" || b.status === "pending";
/** Due in today (or earlier) and not checked in yet. */
export const isArrival = (b: Booking, today: string) => awaitingArrival(b) && b.checkIn <= today && today < b.checkOut;

export type Blocker =
  | { kind: "unassigned"; text: string }
  | { kind: "oos"; text: string; unit: RoomUnit }
  | { kind: "occupied"; text: string; unit: RoomUnit; booking: Booking }
  | { kind: "dirty"; text: string; unit: RoomUnit };

/** Everything that stops this guest being checked in right now — empty means every room is assigned, in service, vacant and clean. */
export function checkInBlockers(db: HotelDB, b: Booking): Blocker[] {
  const out: Blocker[] = [];
  const units = b.unitIds.map((id) => db.units.find((u) => u.id === id)).filter(Boolean) as RoomUnit[];
  const missing = b.rooms - units.length;
  if (missing > 0) out.push({ kind: "unassigned", text: b.rooms > 1 ? `${missing} of ${b.rooms} rooms not assigned yet.` : "No room assigned yet." });
  for (const unit of units) {
    const occupant = db.bookings.find((x) => x.id !== b.id && x.status === "checked-in" && x.unitIds.includes(unit.id));
    if (unit.outOfService) out.push({ kind: "oos", unit, text: `Room ${unit.number} is out of service${unit.oosReason ? ` — ${unit.oosReason}` : ""}.` });
    else if (occupant) out.push({ kind: "occupied", unit, booking: occupant, text: `${occupant.guest.name} hasn't checked out of room ${unit.number} yet.` });
    else if (unit.housekeeping === "dirty") out.push({ kind: "dirty", unit, text: `Room ${unit.number} still needs cleaning.` });
  }
  return out;
}
