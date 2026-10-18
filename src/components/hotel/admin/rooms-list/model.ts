import { unitBookingOn, unitToday } from "@/src/lib/hotel-store/store";
import type { Booking, HotelDB, RoomTypeRecord, RoomUnit } from "@/src/lib/hotel-store/types";

/** What guests see, set on the room form. */
export type Web = "published" | "hidden" | "draft";
/**
 * Where the room stands for tonight, from its assigned bookings. Vacant only means nobody is booked into it —
 * housekeeping decides whether it's ready, so it's never shown as "ready for check-in".
 */
export type Tonight = "occupied" | "reserved" | "vacant" | "oos" | "draft";
export type OpsFilter = "all" | "in" | "oos";
export type WebFilter = "all" | Web;

export type Row = {
  u: RoomUnit;
  t?: RoomTypeRecord;
  web: Web;
  tonight: Tonight;
  /** The booking worth opening from this room: in house, arriving tonight, or the next one coming up. */
  booking?: Booking;
  missing: string[];
};

export const byNumber = (a: RoomUnit, b: RoomUnit) => a.number.localeCompare(b.number, undefined, { numeric: true });

/** Published is the normal state, so it stays quiet next to the room number. */
export const webStyles: Record<Web, { label: string; chip: string; dot: string }> = {
  published: { label: "Published", chip: "bg-white text-neutral-600 ring-neutral-200", dot: "bg-emerald-500" },
  hidden: { label: "Hidden", chip: "bg-neutral-100 text-neutral-700 ring-neutral-300", dot: "bg-neutral-500" },
  draft: { label: "Draft", chip: "bg-violet-50 text-violet-800 ring-violet-200", dot: "bg-violet-500" },
};

export const tonightStyles: Record<Tonight, { label: string; chip: string; dot: string }> = {
  occupied: { label: "Occupied now", chip: "bg-sky-50 text-sky-800 ring-sky-200", dot: "bg-sky-600" },
  reserved: { label: "Booked tonight", chip: "bg-indigo-50 text-indigo-800 ring-indigo-200", dot: "bg-indigo-500" },
  vacant: { label: "Not booked tonight", chip: "bg-white text-neutral-600 ring-neutral-200", dot: "bg-neutral-400" },
  oos: { label: "Out of service", chip: "bg-amber-50 text-amber-900 ring-amber-300", dot: "bg-amber-500" },
  draft: { label: "Not bookable", chip: "bg-neutral-50 text-neutral-600 ring-neutral-200", dot: "bg-neutral-300" },
};

/** Same requirements the room form checks before publishing. */
export function missingOf(t?: RoomTypeRecord) {
  if (!t) return ["Room details"];
  return [
    !t.name.trim() && "Room name",
    !t.beds.trim() && "Beds",
    !(t.capacity > 0) && "Maximum occupancy",
    !(t.price > 0) && "Nightly rate",
    !t.images.length && "Photos",
  ].filter(Boolean) as string[];
}

export function roomRows(db: HotelDB, today: string): Row[] {
  return [...db.units].sort(byNumber).map((u) => {
    const t = db.roomTypes.find((r) => r.id === u.typeId);
    const web: Web = !t || t.draft ? "draft" : t.active ? "published" : "hidden";
    const { occupant, next } = unitToday(db, u.id, today);
    const night = unitBookingOn(db, u.id, today);
    const arriving = night && (night.status === "pending" || night.status === "confirmed") ? night : undefined;
    const tonight: Tonight = u.outOfService ? "oos" : web === "draft" ? "draft" : occupant ? "occupied" : arriving ? "reserved" : "vacant";
    return { u, t, web, tonight, booking: occupant ?? arriving ?? next, missing: web === "draft" ? missingOf(t) : [] };
  });
}

