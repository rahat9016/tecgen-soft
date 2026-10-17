import * as yup from "yup";
import {
  nightsBetween,
  shiftDay,
  todayKey,
} from "@/src/lib/hotel-store/format";
import {
  discountRate,
  freeRooms,
  quoteStay,
  type DiscountInput,
} from "@/src/lib/hotel-store/store";
import type {
  DiscountKind,
  GuestInfo,
  HotelDB,
  PayMethod,
  RoomTypeRecord,
  User,
} from "@/src/lib/hotel-store/types";
import { countries, getCountry } from "@/src/data/countries";

export const MAX_NIGHTS = 60;
export const OTHER_REASON = "Other";
export const discountReasons = [
  "Corporate rate",
  "Returning guest",
  "Long stay",
  "Promotion / offer",
  "Service recovery",
  "Manager approval",
  OTHER_REASON,
];
export const payMethods: PayMethod[] = [
  "cash",
  "card",
  "bkash",
  "nagad",
  "rocket",
  "bank",
];

export type BookingStatusChoice = "confirmed" | "tentative" | "check-in";
export type GuestMode = "new" | "returning";
export type PayPlan = "none" | "deposit" | "full" | "custom";

/** One room type in the booking; each becomes its own linked booking when saved. */
export type StayLine = {
  typeId: string;
  rooms: number;
  rate: number | string;
  unitIds: string[];
};

export const titles = ["Mr", "Ms", "Mrs", "Dr"] as const;
export const AIRPORT_PICKUP = "Airport pickup";
export const requestOptions = [
  "Early check-in",
  "Late check-out",
  "High floor",
  "Extra bed",
  "Baby cot",
  "Quiet room",
  AIRPORT_PICKUP,
];
export const arrivalOptions = [
  "Before 12:00 PM (early check-in)",
  "12:00 PM – 2:00 PM",
  "2:00 PM – 4:00 PM",
  "4:00 PM – 6:00 PM",
  "6:00 PM – 9:00 PM",
  "After 9:00 PM",
];

/** Same shape as the website's guest form, so staff and guests fill in the same details. */
export type GuestForm = {
  title: (typeof titles)[number];
  firstName: string;
  lastName: string;
  email: string;
  /** Country code, or "OTHER". */
  country: string;
  otherCountry: string;
  phoneCountry: string;
  customDial: string;
  phone: string;
  idType: "nid" | "passport";
  idNumber: string;
  arrivalTime: string;
  requests: string[];
  note: string;
};

export type CommissionForm = {
  enabled: boolean;
  to: "agency" | "person";
  name: string;
  phone: string;
  kind: DiscountKind;
  value: number | string;
};

export const newLine = (
  t: RoomTypeRecord,
  unitIds: string[] = []
): StayLine => ({ typeId: t.id, rooms: 1, rate: t.price, unitIds });

export type BookingFormValues = {
  source: "walk-in" | "phone" | "agent";
  commission: CommissionForm;
  checkIn: string;
  checkOut: string;
  lines: StayLine[];
  adults: number;
  children: number;
  guestMode: GuestMode;
  userId: string;
  guest: GuestForm;
  updateProfile: boolean;
  discountKind: DiscountKind;
  discountValue: number | string;
  discountReason: string;
  discountNote: string;
  payPlan: PayPlan;
  /** Only used with the "custom" plan; the other plans follow the live total. */
  payAmount: number | string;
  payMethod: PayMethod;
  payRef: string;
  status: BookingStatusChoice;
  internalNote: string;
};

export const emptyGuest: GuestForm = {
  title: "Mr",
  firstName: "",
  lastName: "",
  email: "",
  country: "BD",
  otherCountry: "",
  phoneCountry: "BD",
  customDial: "",
  phone: "",
  idType: "nid",
  idNumber: "",
  arrivalTime: "",
  requests: [],
  note: "",
};

export const emptyCommission: CommissionForm = {
  enabled: false,
  to: "agency",
  name: "",
  phone: "",
  kind: "percent",
  value: "",
};

/** The guest details the store keeps, built from the form. */
export function composeGuest(g: GuestForm): GuestInfo {
  const dial =
    g.phoneCountry === "OTHER"
      ? g.customDial.replace(/^\+/, "")
      : (getCountry(g.phoneCountry)?.dial ?? "880");
  const local = g.phone.replace(/[\s()-]/g, "").replace(/^0/, "");
  return {
    name: [g.title, g.firstName.trim(), g.lastName.trim()]
      .filter(Boolean)
      .join(" "),
    email: g.email.trim(),
    phone: local ? `+${dial} ${local}` : "",
    country:
      g.country === "OTHER"
        ? g.otherCountry.trim() || undefined
        : getCountry(g.country)?.name,
    idType: g.country === "BD" ? g.idType : "passport",
    idNumber: g.idNumber.trim().toUpperCase() || undefined,
    arrivalTime: g.arrivalTime || undefined,
    airportPickup: g.requests.includes(AIRPORT_PICKUP),
    note:
      [...g.requests.filter((r) => r !== AIRPORT_PICKUP), g.note.trim()]
        .filter(Boolean)
        .join(", ") || undefined,
  };
}

const byDialLength = [...countries].sort(
  (a, b) => b.dial.length - a.dial.length
);

/** Fills the form from a saved guest profile (and the ID they showed last time). */
export function guestFromUser(user: User, last?: GuestInfo): GuestForm {
  const words = user.name.trim().split(/\s+/);
  const maybeTitle = words[0]?.replace(/\.$/, "") as GuestForm["title"];
  const title = titles.includes(maybeTitle)
    ? (words.shift(), maybeTitle)
    : "Mr";
  const country =
    countries.find((c) => c.name === user.country)?.code ??
    (user.country ? "OTHER" : "BD");
  const raw = user.phone.trim();
  const digits = raw.replace(/\D/g, "");
  let phone = { phoneCountry: "BD", customDial: "", phone: digits };
  if (raw.startsWith("+") || digits.startsWith("880")) {
    const match = byDialLength.find((c) => digits.startsWith(c.dial));
    const rest = match ? digits.slice(match.dial.length) : digits;
    phone = match
      ? {
          phoneCountry: match.code,
          customDial: "",
          phone: match.code === "BD" ? `0${rest}` : rest,
        }
      : { phoneCountry: "OTHER", customDial: "", phone: digits };
  }
  return {
    ...emptyGuest,
    title,
    firstName: words.shift() ?? "",
    lastName: words.join(" "),
    email: user.email,
    country,
    otherCountry: country === "OTHER" ? (user.country ?? "") : "",
    ...phone,
    idType: last?.idType ?? "nid",
    idNumber: last?.idNumber ?? "",
  };
}

/** Number inputs hand back strings; empty counts as 0. */
export const toNum = (v: unknown) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

/** Splits the party over the room types: an adult in each first, then fill rooms in order up to what they sleep. */
export function allocateGuests(
  capacities: number[],
  adults: number,
  children: number
) {
  const out = capacities.map(() => ({ adults: 0, children: 0 }));
  if (!out.length) return out;
  let a = adults;
  let c = children;
  out.forEach((o) => {
    if (a > 0) {
      o.adults = 1;
      a--;
    }
  });
  out.forEach((o, i) => {
    const add = Math.min(Math.max(0, capacities[i] - o.adults), a);
    o.adults += add;
    a -= add;
  });
  out.forEach((o, i) => {
    const add = Math.min(Math.max(0, capacities[i] - o.adults), c);
    o.children += add;
    c -= add;
  });
  // Anyone left over goes in the last room type; validation reports the overflow.
  out[out.length - 1].adults += a;
  out[out.length - 1].children += c;
  return out;
}

type StayInput = Pick<
  BookingFormValues,
  | "lines"
  | "checkIn"
  | "checkOut"
  | "adults"
  | "children"
  | "discountKind"
  | "discountValue"
> & {
  source?: BookingFormValues["source"];
  commission?: CommissionForm;
};

/** Commission is on: always for agents, by choice for anyone else who referred the guest. */
export const commissionActive = (v: {
  source?: BookingFormValues["source"];
  commission?: CommissionForm;
}) => v.source === "agent" || !!v.commission?.enabled;

/** Everything the form and the summary derive from the current values: per room type and for the whole booking. */
export function computeStay(db: HotelDB, v: StayInput) {
  const nights =
    v.checkIn && v.checkOut ? nightsBetween(v.checkIn, v.checkOut) : 0;
  const n = Math.max(0, nights);
  const base = (v.lines ?? []).map((line) => {
    const type = db.roomTypes.find((t) => t.id === line.typeId);
    const rate =
      toNum(line.rate) > 0 ? Math.round(toNum(line.rate)) : (type?.price ?? 0);
    const rooms = Math.max(1, toNum(line.rooms));
    const free =
      type && nights > 0 ? freeRooms(db, type.id, v.checkIn, v.checkOut) : 0;
    return { line, type, rate, rooms, free, gross: rate * n * rooms };
  });
  const gross = base.reduce((s, b) => s + b.gross, 0);
  const dv = toNum(v.discountValue);
  // A flat discount is shared out in proportion to each room type's charge.
  const flat =
    v.discountKind === "amount" ? Math.min(Math.round(dv), gross) : 0;
  let left = flat;
  const lines = base.map((b, i) => {
    let discount: DiscountInput | undefined;
    if (dv > 0 && v.discountKind === "percent")
      discount = { kind: "percent", value: dv };
    if (flat > 0) {
      const share = Math.min(
        b.gross,
        Math.max(
          0,
          i === base.length - 1
            ? left
            : Math.round((flat * b.gross) / (gross || 1))
        )
      );
      left -= share;
      discount = { kind: "amount", value: share };
    }
    return {
      ...b,
      discount,
      quote: quoteStay(db.settings, b.rate, n, b.rooms, discount),
    };
  });
  const sum = (k: keyof (typeof lines)[number]["quote"]) =>
    lines.reduce((s, l) => s + l.quote[k], 0);
  const quote = {
    subtotal: sum("subtotal"),
    discount: sum("discount"),
    net: sum("net"),
    serviceFee: sum("serviceFee"),
    tax: sum("tax"),
    total: sum("total"),
    deposit: sum("deposit"),
  };
  // Commission is worked out on the room charge after discount and shared out like a flat discount.
  const cv = commissionActive(v) ? toNum(v.commission?.value) : 0;
  const flatC =
    v.commission?.kind === "amount" ? Math.min(Math.round(cv), quote.net) : 0;
  let leftC = flatC;
  const commissions = lines.map((l, i) => {
    if (!cv) return 0;
    if (v.commission?.kind === "percent")
      return Math.round((l.quote.net * Math.min(cv, 100)) / 100);
    const share = Math.min(
      l.quote.net,
      Math.max(
        0,
        i === lines.length - 1
          ? leftC
          : Math.round((flatC * l.quote.net) / (quote.net || 1))
      )
    );
    leftC -= share;
    return share;
  });
  const capacities = lines.map((l) => (l.type?.capacity ?? 0) * l.rooms);
  const party = allocateGuests(capacities, toNum(v.adults), toNum(v.children));
  return {
    nights,
    lines: lines.map((l, i) => ({
      ...l,
      ...party[i],
      commission: commissions[i],
    })),
    commission: commissions.reduce((s, c) => s + c, 0),
    rooms: lines.reduce((s, l) => s + l.rooms, 0),
    capacity: capacities.reduce((s, c) => s + c, 0),
    quote,
    discountPct: discountRate(quote.subtotal, quote.discount),
  };
}

/** What the guest pays at the desk now, following the total when the rate or discount changes. */
export const payNowOf = (
  v: Pick<BookingFormValues, "payPlan" | "payAmount">,
  quote: { total: number; deposit: number }
) =>
  v.payPlan === "full"
    ? quote.total
    : v.payPlan === "deposit"
      ? quote.deposit
      : v.payPlan === "custom"
        ? Math.min(Math.max(0, Math.round(toNum(v.payAmount))), quote.total)
        : 0;

/** The payment taken now, split over the linked bookings so each folio shows its share. */
export function splitPayment(
  v: Pick<BookingFormValues, "payPlan" | "payAmount">,
  lines: { quote: { total: number; deposit: number } }[]
) {
  if (v.payPlan === "deposit") return lines.map((l) => l.quote.deposit);
  if (v.payPlan === "full") return lines.map((l) => l.quote.total);
  if (v.payPlan !== "custom") return lines.map(() => 0);
  const total = lines.reduce((s, l) => s + l.quote.total, 0);
  let left = payNowOf(v, { total, deposit: 0 });
  return lines.map((l, i) => {
    const share = Math.min(
      l.quote.total,
      i === lines.length - 1
        ? left
        : Math.round((left * l.quote.total) / (total || 1))
    );
    left -= share;
    return share;
  });
}

export type SchemaContext = { db: HotelDB; limit: number };

const num = (label: string) =>
  yup
    .number()
    .transform((v, raw) =>
      raw === "" || raw === null || raw === undefined ? 0 : v
    )
    .typeError(`${label} must be a number`);

const digits = (v?: string) => (v ?? "").replace(/[^\d]/g, "");
const NID = /^(\d{10}|\d{13}|\d{17})$/;
const PASSPORT = /^[A-Z0-9]{6,12}$/i;

const LOCAL_MOBILE = /^0?1[3-9]\d{8}$/;
const INTL_NUMBER = /^\d{5,14}$/;

const guestSchema = yup.object({
  title: yup
    .mixed<GuestForm["title"]>()
    .oneOf([...titles])
    .required(),
  firstName: yup.string().trim().required("Enter the first name"),
  lastName: yup.string().trim().default(""),
  email: yup.string().trim().default("").email("Enter a valid email"),
  country: yup.string().required("Select the country"),
  otherCountry: yup
    .string()
    .trim()
    .default("")
    .when("country", {
      is: "OTHER",
      then: (s) => s.required("Enter the country"),
    }),
  phoneCountry: yup.string().required(),
  customDial: yup
    .string()
    .trim()
    .default("")
    .when("phoneCountry", {
      is: "OTHER",
      then: (s) => s.required("Code").matches(/^\+?\d{1,4}$/, "e.g. +971"),
    }),
  phone: yup
    .string()
    .required("Enter a mobile number")
    .test("phone", function (v) {
      const d = digits(v);
      if (this.parent.phoneCountry === "BD")
        return (
          LOCAL_MOBILE.test(d) ||
          this.createError({
            message: "Enter a valid mobile, e.g. 01712345678",
          })
        );
      return (
        INTL_NUMBER.test(d) ||
        this.createError({ message: "Enter a valid phone number" })
      );
    }),
  idType: yup.mixed<"nid" | "passport">().oneOf(["nid", "passport"]).required(),
  idNumber: yup
    .string()
    .trim()
    .default("")
    .test("id", function (v) {
      const root = this.from?.[1]?.value as BookingFormValues | undefined;
      if (!v)
        return (
          root?.status !== "check-in" ||
          this.createError({ message: "ID is required to check a guest in" })
        );
      if (this.parent.country === "BD" && this.parent.idType === "nid")
        return (
          NID.test(v) ||
          this.createError({ message: "NID has 10, 13 or 17 digits" })
        );
      return (
        PASSPORT.test(v) ||
        this.createError({ message: "Enter a valid passport number" })
      );
    }),
  arrivalTime: yup.string().default(""),
  requests: yup.array(yup.string().required()).default([]),
  note: yup.string().default(""),
});

const ctxOf = (o: { options: { context?: unknown } }) =>
  o.options.context as SchemaContext;
const stayOf = (
  o: { options: { context?: unknown } },
  root: BookingFormValues
) => computeStay(ctxOf(o).db, root);

/** The whole form; availability, capacity and discount limits are checked against live hotel data passed as context. */
export const bookingSchema = yup.object({
  source: yup
    .mixed<BookingFormValues["source"]>()
    .oneOf(["walk-in", "phone", "agent"])
    .required(),
  commission: yup.object({
    enabled: yup.boolean().default(false),
    to: yup
      .mixed<CommissionForm["to"]>()
      .oneOf(["agency", "person"])
      .required(),
    name: yup
      .string()
      .trim()
      .default("")
      .test("name", function (v) {
        const root = this.from?.[1]?.value as BookingFormValues | undefined;
        if (!root || !commissionActive(root) || v) return true;
        return this.createError({
          message:
            this.parent.to === "agency"
              ? "Enter the agency name"
              : "Enter the person's name",
        });
      }),
    phone: yup.string().trim().default(""),
    kind: yup.mixed<DiscountKind>().oneOf(["percent", "amount"]).required(),
    value: num("Commission")
      .min(0, "Can't be negative")
      .test("range", function (v) {
        if (!v) return true;
        if (this.parent.kind === "percent")
          return (
            v <= 100 || this.createError({ message: "Can't be more than 100%" })
          );
        const root = this.from?.[1]?.value as BookingFormValues;
        const s = stayOf(this, root);
        return (
          v <= s.quote.net ||
          this.createError({ message: "Larger than the room charge" })
        );
      }),
  }),

  checkIn: yup
    .string()
    .required("Pick a check-in date")
    .test(
      "future",
      "Check-in can't be in the past",
      (v) => !v || v >= todayKey()
    ),
  checkOut: yup
    .string()
    .required("Pick a check-out date")
    .test("after", "Check-out must be after check-in", function (v) {
      return !v || !this.parent.checkIn || v > this.parent.checkIn;
    })
    .test("max", `Stays are limited to ${MAX_NIGHTS} nights`, function (v) {
      return (
        !v ||
        !this.parent.checkIn ||
        v <= shiftDay(this.parent.checkIn, MAX_NIGHTS)
      );
    }),
  lines: yup
    .array(
      yup.object({
        typeId: yup.string().required(),
        rooms: num("Rooms")
          .integer()
          .min(1, "At least one room")
          .test("free", function (v) {
            const s = stayOf(this, this.from?.[1]?.value as BookingFormValues);
            const l = s.lines.find((x) => x.line.typeId === this.parent.typeId);
            if (!l?.type || s.nights < 1 || !v || l.free >= v) return true;
            return this.createError({
              message: l.free
                ? `Only ${l.free} free for these dates`
                : "Fully booked for these dates",
            });
          }),
        rate: num("Rate").min(1, "Enter the rate"),
        unitIds: yup
          .array(yup.string().required())
          .default([])
          .test("all", function (v) {
            const root = this.from?.[1]?.value as BookingFormValues | undefined;
            if (root?.status !== "check-in") return true;
            const missing = toNum(this.parent.rooms) - (v?.length ?? 0);
            return (
              missing <= 0 ||
              this.createError({
                message: `No clean room free for ${missing} of these — can't check in yet`,
              })
            );
          }),
      })
    )
    .min(1, "Choose at least one room type"),
  adults: num("Adults")
    .integer()
    .min(1, "At least one adult")
    .test("capacity", function (v) {
      const s = stayOf(this, this.parent);
      if (!s.lines.length) return true;
      const guests = (v ?? 0) + toNum(this.parent.children);
      return (
        guests <= s.capacity ||
        this.createError({
          message: `These ${s.rooms} room${s.rooms > 1 ? "s" : ""} sleep up to ${s.capacity} — add a room`,
        })
      );
    }),
  children: num("Children").integer().min(0),

  guestMode: yup.mixed<GuestMode>().oneOf(["new", "returning"]).required(),
  userId: yup
    .string()
    .default("")
    .when("guestMode", {
      is: "returning",
      then: (s) => s.required("Find and select the returning guest"),
    }),
  // Until a returning guest is picked there are no guest fields on screen — only "pick a guest" applies.
  guest: yup
    .object()
    .when(["guestMode", "userId"], ([mode, userId]: string[]) =>
      mode === "returning" && !userId ? yup.object() : guestSchema
    ),
  updateProfile: yup.boolean().default(false),

  discountKind: yup
    .mixed<DiscountKind>()
    .oneOf(["percent", "amount"])
    .required(),
  discountValue: num("Discount")
    .min(0, "Discount can't be negative")
    .test("range", function (v) {
      if (!v) return true;
      if (this.parent.discountKind === "percent" && v > 100)
        return this.createError({ message: "Can't be more than 100%" });
      const s = stayOf(this, this.parent);
      if (
        this.parent.discountKind === "amount" &&
        s.quote.subtotal > 0 &&
        v > s.quote.subtotal
      )
        return this.createError({ message: "Larger than the room charge" });
      const { limit } = ctxOf(this);
      return (
        s.discountPct <= limit + 0.001 ||
        this.createError({
          message: `Your limit is ${limit}% of the room charge — ask a manager`,
        })
      );
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
      return (
        this.parent.discountReason !== OTHER_REASON ||
        !toNum(this.parent.discountValue) ||
        !!v
      );
    }),

  payPlan: yup
    .mixed<PayPlan>()
    .oneOf(["none", "deposit", "full", "custom"])
    .required(),
  payAmount: num("Amount")
    .min(0, "Amount can't be negative")
    .test("custom", function (v) {
      if (this.parent.payPlan !== "custom") return true;
      if (!v) return this.createError({ message: "Enter the amount received" });
      const s = stayOf(this, this.parent);
      return (
        v <= s.quote.total ||
        this.createError({
          message: `More than the total (${s.quote.total.toLocaleString("en-IN")})`,
        })
      );
    }),
  payMethod: yup.mixed<PayMethod>().oneOf(payMethods).required(),
  payRef: yup
    .string()
    .trim()
    .default("")
    .test("ref", "Enter the transaction ID or reference", function (v) {
      return (
        this.parent.payMethod === "cash" ||
        this.parent.payPlan === "none" ||
        !!v
      );
    }),

  status: yup
    .mixed<BookingStatusChoice>()
    .oneOf(["confirmed", "tentative", "check-in"])
    .required()
    .test(
      "today",
      "Only a stay starting today can be checked in",
      function (v) {
        return v !== "check-in" || this.parent.checkIn === todayKey();
      }
    ),
  internalNote: yup.string().default(""),
});

/** Which on-page section holds a field, so a failed submit can scroll to it. */
export const sectionOf = (field: string) =>
  /^(guest|userId|guestMode|updateProfile)/.test(field)
    ? "guest"
    : /^pay/.test(field)
      ? "payment"
      : /^(discount|status|internalNote)/.test(field)
        ? "summary"
        : "stay";

export const sectionOrder = ["stay", "guest", "payment", "summary"];

/** Puts an error message from the store back on the field it belongs to. */
export function fieldForStoreError(
  msg: string
):
  | "discountValue"
  | "adults"
  | "checkIn"
  | "guest.firstName"
  | "guest.phone"
  | null {
  if (/discount/i.test(msg)) return "discountValue";
  if (/sleeps up to|adult/i.test(msg)) return "adults";
  if (/check-in can|check-out must|past/i.test(msg)) return "checkIn";
  if (/name is required/i.test(msg)) return "guest.firstName";
  if (/phone|email/i.test(msg)) return "guest.phone";
  return null;
}
