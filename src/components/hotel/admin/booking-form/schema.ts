import * as yup from "yup";
import { nightsBetween, shiftDay, todayKey } from "@/src/lib/hotel-store/format";
import { discountRate, freeRooms, quoteStay } from "@/src/lib/hotel-store/store";
import type { DiscountKind, HotelDB, PayMethod } from "@/src/lib/hotel-store/types";

export const MAX_NIGHTS = 60;
export const OTHER_REASON = "Other";
export const discountReasons = ["Corporate rate", "Returning guest", "Long stay", "Promotion / offer", "Service recovery", "Manager approval", OTHER_REASON];
export const payMethods: PayMethod[] = ["cash", "card", "bkash", "nagad", "rocket", "bank"];

export type BookingStatusChoice = "confirmed" | "tentative" | "check-in";
export type GuestMode = "new" | "returning";

export type BookingFormValues = {
  source: "walk-in" | "phone" | "agent";
  agentName: string;
  typeId: string;
  checkIn: string;
  checkOut: string;
  rooms: number;
  adults: number;
  children: number;
  rate: number | string;
  unitIds: string[];
  guestMode: GuestMode;
  userId: string;
  guest: {
    name: string;
    phone: string;
    email: string;
    country: string;
    idType: "nid" | "passport";
    idNumber: string;
    note: string;
  };
  updateProfile: boolean;
  discountKind: DiscountKind;
  discountValue: number | string;
  discountReason: string;
  discountNote: string;
  payAmount: number | string;
  payMethod: PayMethod;
  payRef: string;
  status: BookingStatusChoice;
  internalNote: string;
};

export const emptyGuest: BookingFormValues["guest"] = { name: "", phone: "", email: "", country: "Bangladesh", idType: "nid", idNumber: "", note: "" };

/** Number inputs hand back strings; empty counts as 0. */
export const toNum = (v: unknown) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

/** Everything the form and the summary derive from the current values. */
export function computeStay(db: HotelDB, v: Pick<BookingFormValues, "typeId" | "checkIn" | "checkOut" | "rooms" | "rate" | "discountKind" | "discountValue">) {
  const type = db.roomTypes.find((t) => t.id === v.typeId);
  const nights = v.checkIn && v.checkOut ? nightsBetween(v.checkIn, v.checkOut) : 0;
  const rate = toNum(v.rate) > 0 ? Math.round(toNum(v.rate)) : (type?.price ?? 0);
  const rooms = Math.max(1, toNum(v.rooms));
  const quote = quoteStay(db.settings, rate, Math.max(0, nights), rooms, { kind: v.discountKind, value: toNum(v.discountValue) });
  const free = type && nights > 0 ? freeRooms(db, type.id, v.checkIn, v.checkOut) : 0;
  return { type, nights, rate, rooms, quote, free, discountPct: discountRate(quote.subtotal, quote.discount) };
}

export type SchemaContext = { db: HotelDB; limit: number };

const num = (label: string) =>
  yup
    .number()
    .transform((v, raw) => (raw === "" || raw === null || raw === undefined ? 0 : v))
    .typeError(`${label} must be a number`);

const digits = (v?: string) => (v ?? "").replace(/[^\d]/g, "");
const BD_MOBILE = /^(?:880)?01[3-9]\d{8}$/;
const NID = /^(\d{10}|\d{13}|\d{17})$/;
const PASSPORT = /^[A-Z0-9]{6,12}$/i;

const guestSchema = yup.object({
  name: yup.string().trim().required("Enter the guest's name").min(2, "Enter the guest's full name"),
  phone: yup
    .string()
    .trim()
    .required("Enter a phone number")
    .test("phone", function (v) {
      const d = digits(v);
      if (/^(0|880)/.test(d)) return BD_MOBILE.test(d) || this.createError({ message: "Enter a valid BD mobile, e.g. 01712345678" });
      return (d.length >= 7 && d.length <= 15) || this.createError({ message: "Enter a valid phone number with country code" });
    }),
  email: yup.string().trim().default("").email("Enter a valid email"),
  country: yup.string().trim().default(""),
  idType: yup.mixed<"nid" | "passport">().oneOf(["nid", "passport"]).required(),
  idNumber: yup
    .string()
    .trim()
    .default("")
    .test("id", function (v) {
      const root = this.from?.[1]?.value as BookingFormValues | undefined;
      if (!v) return root?.status !== "check-in" || this.createError({ message: "ID is required to check a guest in" });
      if (this.parent.idType === "nid") return NID.test(v) || this.createError({ message: "NID has 10, 13 or 17 digits" });
      return PASSPORT.test(v) || this.createError({ message: "Enter a valid passport number" });
    }),
  note: yup.string().default(""),
});

const ctxOf = (o: { options: { context?: unknown } }) => o.options.context as SchemaContext;
const stayOf = (o: { options: { context?: unknown } }, root: BookingFormValues) => computeStay(ctxOf(o).db, root);

/** The whole form; availability, capacity and discount limits are checked against live hotel data passed as context. */
export const bookingSchema = yup.object({
  source: yup.mixed<BookingFormValues["source"]>().oneOf(["walk-in", "phone", "agent"]).required(),
  agentName: yup
    .string()
    .trim()
    .default("")
    .when("source", { is: "agent", then: (s) => s.required("Enter the agent or company name") }),

  typeId: yup.string().required("Choose a room type"),
  checkIn: yup
    .string()
    .required("Pick a check-in date")
    .test("future", "Check-in can't be in the past", (v) => !v || v >= todayKey()),
  checkOut: yup
    .string()
    .required("Pick a check-out date")
    .test("after", "Check-out must be after check-in", function (v) {
      return !v || !this.parent.checkIn || v > this.parent.checkIn;
    })
    .test("max", `Stays are limited to ${MAX_NIGHTS} nights`, function (v) {
      return !v || !this.parent.checkIn || v <= shiftDay(this.parent.checkIn, MAX_NIGHTS);
    }),
  rooms: num("Rooms")
    .integer()
    .min(1, "Book at least one room")
    .test("free", function (v) {
      const s = stayOf(this, this.parent);
      if (!s.type || s.nights < 1 || !v) return true;
      if (s.free >= v) return true;
      return this.createError({ message: s.free ? `Only ${s.free} ${s.type.name} free for these dates` : `${s.type.name} is fully booked for these dates` });
    }),
  adults: num("Adults")
    .integer()
    .min(1, "At least one adult")
    .test("capacity", function (v) {
      const s = stayOf(this, this.parent);
      if (!s.type) return true;
      const guests = (v ?? 0) + toNum(this.parent.children);
      const max = s.type.capacity * s.rooms;
      return guests <= max || this.createError({ message: `${s.rooms} × ${s.type.name} sleeps up to ${max} — add a room` });
    }),
  children: num("Children").integer().min(0),
  rate: num("Rate").min(1, "Enter the rate per night"),
  unitIds: yup
    .array(yup.string().required())
    .default([])
    .test("max", "More rooms picked than booked", function (v) {
      return (v?.length ?? 0) <= toNum(this.parent.rooms);
    })
    .test("all", function (v) {
      if (this.parent.status !== "check-in") return true;
      const missing = toNum(this.parent.rooms) - (v?.length ?? 0);
      return missing <= 0 || this.createError({ message: `Pick ${missing} more room${missing > 1 ? "s" : ""} to check the guest in` });
    }),

  guestMode: yup.mixed<GuestMode>().oneOf(["new", "returning"]).required(),
  userId: yup
    .string()
    .default("")
    .when("guestMode", { is: "returning", then: (s) => s.required("Find and select the returning guest") }),
  // Until a returning guest is picked there are no guest fields on screen — only "pick a guest" applies.
  guest: yup.object().when(["guestMode", "userId"], ([mode, userId]: string[]) => (mode === "returning" && !userId ? yup.object() : guestSchema)),
  updateProfile: yup.boolean().default(false),

  discountKind: yup.mixed<DiscountKind>().oneOf(["percent", "amount"]).required(),
  discountValue: num("Discount")
    .min(0, "Discount can't be negative")
    .test("range", function (v) {
      if (!v) return true;
      if (this.parent.discountKind === "percent" && v > 100) return this.createError({ message: "Can't be more than 100%" });
      const s = stayOf(this, this.parent);
      if (this.parent.discountKind === "amount" && s.quote.subtotal > 0 && v > s.quote.subtotal) return this.createError({ message: "Larger than the room charge" });
      const { limit } = ctxOf(this);
      return s.discountPct <= limit + 0.001 || this.createError({ message: `Your limit is ${limit}% of the room charge — ask a manager` });
    }),
  discountReason: yup
    .string()
    .default("")
    .test("reason", "Choose a reason for the discount", function (v) {
      return !toNum(this.parent.discountValue) || !!v;
    }),
  discountNote: yup
    .string()
    .trim()
    .default("")
    .test("note", "Describe the reason", function (v) {
      return this.parent.discountReason !== OTHER_REASON || !toNum(this.parent.discountValue) || !!v;
    }),

  payAmount: num("Amount")
    .min(0, "Amount can't be negative")
    .test("max", function (v) {
      const s = stayOf(this, this.parent);
      return !v || v <= s.quote.total || this.createError({ message: `More than the total (${s.quote.total.toLocaleString("en-IN")})` });
    }),
  payMethod: yup.mixed<PayMethod>().oneOf(payMethods).required(),
  payRef: yup
    .string()
    .trim()
    .default("")
    .test("ref", "Enter the transaction ID or reference", function (v) {
      return this.parent.payMethod === "cash" || !toNum(this.parent.payAmount) || !!v;
    }),

  status: yup
    .mixed<BookingStatusChoice>()
    .oneOf(["confirmed", "tentative", "check-in"])
    .required()
    .test("today", "Only a stay starting today can be checked in", function (v) {
      return v !== "check-in" || this.parent.checkIn === todayKey();
    }),
  internalNote: yup.string().default(""),
});

/** Which on-page section holds a field, so a failed submit can scroll to it. */
export const sectionOf = (field: string) =>
  /^(guest|userId|guestMode|updateProfile)/.test(field)
    ? "guest"
    : field === "unitIds"
      ? "rooms"
      : /^(rate|discount)/.test(field)
        ? "pricing"
        : /^pay/.test(field)
          ? "payment"
          : field === "status" || field === "internalNote"
            ? "summary"
            : "stay";

export const sectionOrder = ["stay", "rooms", "guest", "pricing", "payment", "summary"];

/** Puts an error message from the store back on the field it belongs to. */
export function fieldForStoreError(msg: string): keyof BookingFormValues | "guest.name" | "guest.phone" | null {
  if (/discount/i.test(msg)) return "discountValue";
  if (/sleeps up to|adult/i.test(msg)) return "adults";
  if (/free for these dates|fully booked|at least one room/i.test(msg)) return "rooms";
  if (/^Room |Assign a room|Unknown room/i.test(msg)) return "unitIds";
  if (/check-in|check-out|past/i.test(msg)) return "checkIn";
  if (/name is required/i.test(msg)) return "guest.name";
  if (/phone|email/i.test(msg)) return "guest.phone";
  return null;
}
