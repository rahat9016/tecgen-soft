import { addDays as addDaysFns, differenceInCalendarDays, format } from "date-fns";
import { parseDayKey, toDayKey } from "@/src/lib/hotelDates";
import type {
  BookingSource,
  BookingStatus,
  ChargeCategory,
  GalleryCategory,
  Housekeeping,
  NoticeKind,
  PayMethod,
  PaymentKind,
  Role,
} from "./types";

export const taka = (n: number) => `${n < 0 ? "-" : ""}৳${Math.abs(Math.round(n)).toLocaleString("en-IN")}`;
export const bdt = (n: number) => `BDT ${Math.round(n).toLocaleString("en-US")}`;

/** The hotel's clock. Bangladesh keeps no daylight saving, so it's UTC+6 all year. */
export const HOTEL_TZ = "Asia/Dhaka";
const HOTEL_OFFSET = "+06:00";

const clockParts = new Intl.DateTimeFormat("en-US", {
  timeZone: HOTEL_TZ,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});
const partsOf = (d: Date | string | number) => Object.fromEntries(clockParts.formatToParts(new Date(d)).map((p) => [p.type, p.value]));
const hotelTimeFormat = new Intl.DateTimeFormat("en-US", { timeZone: HOTEL_TZ, hour: "numeric", minute: "2-digit" });

/** The hotel's calendar day ("2026-10-19") for a moment in time, wherever the browser is. */
export const hotelDayOf = (d: Date | string | number) => {
  const p = partsOf(d);
  return `${p.year}-${p.month}-${p.day}`;
};
/** Minutes after midnight on the hotel's clock. */
export const hotelMinutesOf = (d: Date | string | number) => {
  const p = partsOf(d);
  return Number(p.hour) * 60 + Number(p.minute);
};
/** The moment a wall-clock time happens at the hotel, e.g. 2:00 PM on check-in day. */
export const hotelInstant = (day: string, minutes = 0) => Date.parse(`${day}T00:00:00${HOTEL_OFFSET}`) + minutes * 60_000;
/** "2:41 PM" on the hotel's clock. */
export const hotelTime = (d: Date | string | number) => hotelTimeFormat.format(new Date(d));

export const todayKey = () => hotelDayOf(Date.now());
export const dayOf = (key: string) => parseDayKey(key) ?? new Date();
export const shiftDay = (key: string, n: number) => toDayKey(addDaysFns(dayOf(key), n));
export const nightsBetween = (checkIn: string, checkOut: string) =>
  Math.max(0, differenceInCalendarDays(dayOf(checkOut), dayOf(checkIn)));
/** Every night of a stay as day keys. */
export const stayNights = (checkIn: string, checkOut: string) =>
  Array.from({ length: nightsBetween(checkIn, checkOut) }, (_, i) => shiftDay(checkIn, i));

export const dateLabel = (key: string, pattern = "EEE, dd MMM") => format(dayOf(key), pattern);
export const rangeLabel = (checkIn: string, checkOut: string) => {
  const a = dayOf(checkIn);
  const b = dayOf(checkOut);
  return a.getFullYear() === b.getFullYear()
    ? `${format(a, "dd MMM")} – ${format(b, "dd MMM yyyy")}`
    : `${format(a, "dd MMM yyyy")} – ${format(b, "dd MMM yyyy")}`;
};

export const relativeDay = (key: string) => {
  const t = todayKey();
  if (key === t) return "Today";
  if (key === shiftDay(t, 1)) return "Tomorrow";
  if (key === shiftDay(t, -1)) return "Yesterday";
  return dateLabel(key, "dd MMM");
};

export const formatDateTime = (iso: string) => `${dateLabel(hotelDayOf(iso), "dd MMM yyyy")}, ${hotelTime(iso)}`;

export const timeAgo = (iso: string, now = Date.now()) => {
  const s = Math.max(0, Math.round((now - new Date(iso).getTime()) / 1000));
  if (s < 45) return "just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  if (d < 7) return `${d}d ago`;
  return dateLabel(hotelDayOf(iso), "dd MMM");
};

/** "2:00 PM" → minutes after midnight. */
export const clockMinutes = (time: string) => {
  const m = time.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!m) return 14 * 60;
  let h = Number(m[1]) % 12;
  if (m[3].toUpperCase() === "PM") h += 12;
  return h * 60 + Number(m[2]);
};

export const initials = (name: string) =>
  name
    .replace(/^(Mr|Ms|Mrs|Dr)\.?\s+/i, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase() || "G";

export const statusLabels: Record<BookingStatus, string> = {
  pending: "Awaiting confirmation",
  confirmed: "Confirmed",
  "checked-in": "In house",
  "checked-out": "Checked out",
  cancelled: "Cancelled",
  "no-show": "No-show",
};

export const statusStyles: Record<BookingStatus, string> = {
  pending: "bg-amber-50 text-amber-700 ring-amber-200",
  confirmed: "bg-sky-50 text-sky-700 ring-sky-200",
  "checked-in": "bg-emerald-50 text-emerald-700 ring-emerald-200",
  "checked-out": "bg-neutral-100 text-neutral-600 ring-neutral-200",
  cancelled: "bg-rose-50 text-rose-600 ring-rose-200",
  "no-show": "bg-neutral-800 text-white ring-neutral-800",
};

export const sourceLabels: Record<BookingSource, string> = {
  website: "Website",
  "walk-in": "Walk-in",
  phone: "Phone",
  agent: "Travel agent",
};

export const payLabels: Record<PayMethod, string> = {
  bkash: "bKash",
  nagad: "Nagad",
  rocket: "Rocket",
  card: "Card",
  cash: "Cash",
  bank: "Bank transfer",
};

export const payLogos: Partial<Record<PayMethod, string>> = {
  bkash: "/payments/bkash.webp",
  nagad: "/payments/nagad.webp",
  rocket: "/payments/rocket.webp",
  card: "/payments/visa.svg",
};

export const paymentKindLabels: Record<PaymentKind, string> = {
  deposit: "Deposit",
  payment: "Payment",
  refund: "Refund",
};

export const chargeLabels: Record<ChargeCategory, string> = {
  restaurant: "Restaurant",
  "room-service": "Room service",
  minibar: "Minibar",
  laundry: "Laundry",
  transport: "Transport",
  spa: "Spa",
  "extra-bed": "Extra bed",
  damage: "Damage",
  other: "Other",
  discount: "Discount",
};

export const housekeepingLabels: Record<Housekeeping, string> = {
  clean: "Clean",
  dirty: "Needs cleaning",
  inspected: "Inspected",
};

export const roleLabels: Record<Role, string> = {
  guest: "Guest",
  admin: "Administrator",
  manager: "Manager",
  receptionist: "Front desk",
};

export const galleryCategoryLabels: Record<GalleryCategory, string> = {
  hotel: "Hotel",
  rooms: "Rooms",
  pool: "Pool",
  dining: "Dining",
  beach: "Beach",
  events: "Events",
};

export const noticeKindLabels: Record<NoticeKind, string> = {
  booking: "Booking",
  payment: "Payment",
  cancel: "Cancellation",
  checkin: "Check-in",
  checkout: "Check-out",
  review: "Review",
  user: "Account",
  system: "System",
};

/** Download rows as a CSV file (Excel opens it directly). */
export function downloadCsv(filename: string, rows: (string | number)[][]) {
  const csv = rows
    .map((r) => r.map((c) => (/[",\n]/.test(String(c)) ? `"${String(c).replace(/"/g, '""')}"` : String(c))).join(","))
    .join("\r\n");
  const url = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" }));
  const a = Object.assign(document.createElement("a"), { href: url, download: filename });
  a.click();
  URL.revokeObjectURL(url);
}
