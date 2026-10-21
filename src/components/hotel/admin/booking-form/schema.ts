import * as yup from "yup";
import {
  nightsBetween,
  shiftDay,
  todayKey,
} from "@/src/lib/hotel-store/format";
import {
  discountRate,
  freeRooms,
  freeUnits,
  quoteStay,
  type DiscountInput,
} from "@/src/lib/hotel-store/store";
import { housekeepingLabels } from "@/src/lib/hotel-store/format";
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
/** What the front desk takes; Rocket stays available to website bookings. */
export const payMethods: PayMethod[] = [
  "cash",
  "bkash",
  "nagad",
  "card",
  "bank",
];
/** BDT per extra bed per night, added to the folio as a charge. */
export const EXTRA_BED_RATE = 1000;
export const MAX_EXTRA_BEDS = 4;

export type BookingStatusChoice = "confirmed" | "tentative" | "check-in";
export type GuestMode = "new" | "returning";
export type PayPlan = "none" | "deposit" | "full" | "custom";

/** Guests staying in one room type's rooms when staff split the party by hand. */
export type LineParty = { adults: number | string; children: number | string };

/** One room type in the booking; each becomes its own linked booking when saved. */
export type StayLine = {
  typeId: string;
  rooms: number;
  rate: number | string;
  unitIds: string[];
  /** Reservations only: leave unpicked rooms for the desk to assign before arrival. */
  assignLater: boolean;
  /** null = share the party out automatically. */
  party: LineParty | null;
};

export const AIRPORT_PICKUP = "Airport pickup";
/** Asked for, not promised — the desk confirms them later. */
export const requestOptions = [
  "Early check-in",
  "Late check-out",
  "High floor",
  "Quiet room",
  "Baby cot",
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
  fullName: string;
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
): StayLine => ({
  typeId: t.id,
  rooms: 1,
  rate: t.price,
  unitIds,
  assignLater: false,
  party: null,
});

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
  extraBeds: number;
  /** Per bed per night — starts at EXTRA_BED_RATE, staff can change it. */
  extraBedRate: number | string;
  discountKind: DiscountKind;
  discountValue: number | string;
  /** Service charge and VAT percent for this booking only; start at 0. */
  serviceFeeRate: number | string;
  vatRate: number | string;
  discountReason: string;
  discountNote: string;
  payPlan: PayPlan;
  /** Only used with the "custom" plan; the other plans follow the live total. */
  payAmount: number | string;
  /** Staff confirmed the money is in hand. Choosing a plan alone records nothing. */
  payCollected: boolean;
  payMethod: PayMethod;
  payRef: string;
  status: BookingStatusChoice;
  internalNote: string;
};

export const emptyGuest: GuestForm = {
  fullName: "",
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
    name: g.fullName.trim() ? g.fullName.trim().replace(/\s+/g, " ") : "",
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
    fullName: user.name.trim().replace(/\s+/g, " "),
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
  serviceFeeRate?: number | string;
  vatRate?: number | string;
  extraBeds?: number | string;
  extraBedRate?: number | string;
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
  const pct = (x?: number | string) => Math.min(100, Math.max(0, toNum(x)));
  const settings = {
    ...db.settings,
    serviceFeeRate: pct(v.serviceFeeRate),
    vatRate: pct(v.vatRate),
  };
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
      quote: quoteStay(settings, b.rate, n, b.rooms, discount),
    };
  });
  // Rooms of one type at one rate are saved as a single booking, so money is worked out per booking:
  // service charge and VAT round once per booking, exactly as its folio will.
  const keyOf = (l: (typeof lines)[number]) => `${l.line.typeId}|${l.rate}`;
  const groups = [...new Set(lines.map(keyOf))].map((key) => {
    const members = lines.flatMap((l, i) => (keyOf(l) === key ? [i] : []));
    const first = lines[members[0]];
    const rooms = members.reduce((s, i) => s + lines[i].rooms, 0);
    const flatShare = members.reduce(
      (s, i) =>
        s +
        (lines[i].discount?.kind === "amount" ? lines[i].discount!.value : 0),
      0
    );
    const discount: DiscountInput | undefined =
      first.discount?.kind === "percent"
        ? first.discount
        : flatShare > 0
          ? { kind: "amount", value: flatShare }
          : undefined;
    return {
      members,
      typeId: first.line.typeId,
      rate: first.rate,
      rooms,
      discount,
      quote: quoteStay(settings, first.rate, n, rooms, discount),
    };
  });
  const sum = (k: keyof (typeof groups)[number]["quote"]) =>
    groups.reduce((s, g) => s + g.quote[k], 0);
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
  const commissions = groups.map((g, i) => {
    if (!cv) return 0;
    if (v.commission?.kind === "percent")
      return Math.round((g.quote.net * Math.min(cv, 100)) / 100);
    const share = Math.min(
      g.quote.net,
      Math.max(
        0,
        i === groups.length - 1
          ? leftC
          : Math.round((flatC * g.quote.net) / (quote.net || 1))
      )
    );
    leftC -= share;
    return share;
  });
  const capacities = lines.map((l) => (l.type?.capacity ?? 0) * l.rooms);
  const adults = toNum(v.adults);
  const children = toNum(v.children);
  // Hand-set rooms keep their guests; everyone else is shared over the rest.
  const manual = lines.map((l) =>
    lines.length > 1 && l.line.party
      ? {
          adults: Math.max(0, Math.round(toNum(l.line.party.adults))),
          children: Math.max(0, Math.round(toNum(l.line.party.children))),
        }
      : null
  );
  const fixed = manual.reduce<{ adults: number; children: number }>(
    (s, m) => ({
      adults: s.adults + (m?.adults ?? 0),
      children: s.children + (m?.children ?? 0),
    }),
    { adults: 0, children: 0 }
  );
  const autoIdx = manual.flatMap((m, i) => (m ? [] : [i]));
  const auto = allocateGuests(
    autoIdx.map((i) => capacities[i]),
    Math.max(0, adults - fixed.adults),
    Math.max(0, children - fixed.children)
  );
  const party = manual.map((m, i) => m ?? auto[autoIdx.indexOf(i)]);
  const placed = party.reduce((s, p) => s + p.adults + p.children, 0);
  const extraBeds = Math.max(0, Math.round(toNum(v.extraBeds)));
  const extraBedRate = Math.max(0, toNum(v.extraBedRate ?? EXTRA_BED_RATE));
  const extras = extraBeds * extraBedRate * n;
  const total = quote.total + extras;
  return {
    nights,
    lines: lines.map((l, i) => ({
      ...l,
      ...party[i],
      capacity: capacities[i],
      manual: !!manual[i],
    })),
    /** What gets saved: one booking per room type and rate, holding every room picked for it. */
    groups: groups.map((g, i) => ({
      ...g,
      adults: g.members.reduce((s, m) => s + party[m].adults, 0),
      children: g.members.reduce((s, m) => s + party[m].children, 0),
      unitIds: g.members.flatMap((m) => lines[m].line.unitIds),
      assignLater: g.members.some((m) => lines[m].line.assignLater),
      commission: commissions[i],
    })),
    commission: commissions.reduce((s, c) => s + c, 0),
    rooms: lines.reduce((s, l) => s + l.rooms, 0),
    capacity: capacities.reduce((s, c) => s + c, 0),
    /** Guests placed in rooms minus the party size; non-zero when a hand split doesn't add up. */
    partyGap: lines.length ? placed - (adults + children) : 0,
    quote,
    /** Percent applied, after clamping to 0–100. */
    serviceFeeRate: settings.serviceFeeRate,
    vatRate: settings.vatRate,
    extraBeds,
    extraBedRate,
    extras,
    /** Room charge with tax plus paid extras — what the guest owes. */
    total,
    deposit: Math.ceil((total * db.settings.depositRate) / 100),
    discountPct: discountRate(quote.subtotal, quote.discount),
  };
}

/** The amount the chosen plan asks for, following the total when the rate or discount changes. */
export const planAmountOf = (
  v: Pick<BookingFormValues, "payPlan" | "payAmount">,
  t: { total: number; deposit: number }
) =>
  v.payPlan === "full"
    ? t.total
    : v.payPlan === "deposit"
      ? t.deposit
      : v.payPlan === "custom"
        ? Math.min(Math.max(0, Math.round(toNum(v.payAmount))), t.total)
        : 0;

/** Money actually in hand — only once staff mark it as received. */
export const receivedOf = (
  v: Pick<BookingFormValues, "payPlan" | "payAmount" | "payCollected">,
  t: { total: number; deposit: number }
) => (v.payCollected ? planAmountOf(v, t) : 0);

/** Shares `amount` over the linked bookings in proportion to what each owes, so each folio shows its part. */
export function splitAmount(amount: number, dues: number[]) {
  const total = dues.reduce((s, d) => s + d, 0);
  let left = Math.min(amount, total);
  return dues.map((d, i) => {
    const share = Math.min(
      d,
      i === dues.length - 1 ? left : Math.round((amount * d) / (total || 1))
    );
    left -= share;
    return share;
  });
}

export type SchemaContext = { db: HotelDB; limit: number };

/** Index of the line a nested field belongs to, from a yup path like "lines[2].party". */
const lineIndex = (path: string) =>
  Number(/lines\[(\d+)\]/.exec(path)?.[1] ?? -1);

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
  fullName: yup.string().trim().required("Enter the guest's full name"),
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
        rooms: num("Rooms").integer().min(1, "At least one room"),
        rate: num("Rate").min(1, "Enter the rate"),
        assignLater: yup.boolean().default(false),
        party: yup
          .object({
            adults: num("Adults").min(0),
            children: num("Children").min(0),
          })
          .nullable()
          .default(null)
          .test("fits", function (p) {
            if (!p) return true;
            const s = stayOf(this, this.from?.[1]?.value as BookingFormValues);
            const l = s.lines[lineIndex(this.path)];
            if (!l || l.adults + l.children <= l.capacity) return true;
            return this.createError({
              message: `${l.rooms > 1 ? "These rooms sleep" : "This room sleeps"} up to ${l.capacity}`,
            });
          }),
        unitIds: yup
          .array(yup.string().required())
          .default([])
          .test("free", function (v) {
            const root = this.from?.[1]?.value as BookingFormValues | undefined;
            if (
              !root?.checkIn ||
              !root.checkOut ||
              root.checkOut <= root.checkIn
            )
              return true;
            const { db } = ctxOf(this);
            const free = new Set(
              freeUnits(
                db,
                this.parent.typeId,
                root.checkIn,
                root.checkOut
              ).map((u) => u.id)
            );
            const taken = (v ?? [])
              .map((id) => db.units.find((u) => u.id === id))
              .find((u) => !u || !free.has(u.id));
            if (!taken) return true;
            return this.createError({
              message: taken?.outOfService
                ? `Room ${taken.number} is out of service — pick another room`
                : `Room ${taken?.number ?? ""} is booked for these dates — pick another room`,
            });
          })
          .test("ready", function (v) {
            const root = this.from?.[1]?.value as BookingFormValues | undefined;
            if (root?.status !== "check-in") return true;
            const missing = toNum(this.parent.rooms) - (v?.length ?? 0);
            if (missing > 0)
              return this.createError({
                message: `Assign ${missing === 1 ? "a ready room" : `${missing} ready rooms`} to check in now`,
              });
            const { db } = ctxOf(this);
            const notReady = (v ?? [])
              .map((id) => db.units.find((u) => u.id === id))
              .find((u) => !u || u.outOfService || u.housekeeping === "dirty");
            return (
              !notReady ||
              this.createError({
                message: `Room ${notReady.number} is ${notReady.outOfService ? "out of service" : housekeepingLabels.dirty.toLowerCase()} — pick a ready room to check in`,
              })
            );
          }),
      })
    )
    .min(1, "Select at least one room")
    .test("available", function (lines) {
      // Rooms held without a number still need a free room of that kind.
      const root = this.parent as BookingFormValues;
      const s = stayOf(this, root);
      if (s.nights < 1) return true;
      const types = [...new Set((lines ?? []).map((l) => l.typeId))];
      for (const typeId of types) {
        const mine = s.lines.filter((l) => l.line.typeId === typeId);
        const unnumbered = mine.filter((l) => !l.line.unitIds.length).length;
        const numbered = mine.length - unnumbered;
        if (unnumbered && mine[0].free - numbered < unnumbered)
          return this.createError({
            message: `Not enough free ${mine[0].type?.name ?? "rooms"} to assign later — pick room numbers instead`,
          });
      }
      return true;
    })
    .test("party", function () {
      const root = this.parent as BookingFormValues;
      const s = stayOf(this, root);
      if (!s.partyGap) return true;
      const guests = toNum(root.adults) + toNum(root.children);
      return this.createError({
        message: `Rooms list ${guests + s.partyGap} guests but the party is ${guests} — adjust the split`,
      });
    }),
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
  extraBeds: num("Extra beds")
    .integer()
    .min(0)
    .max(MAX_EXTRA_BEDS, `Up to ${MAX_EXTRA_BEDS} extra beds`),
  extraBedRate: num("Extra bed price").min(0, "Price can't be negative"),

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
  serviceFeeRate: num("Service charge")
    .min(0, "Can't be negative")
    .max(100, "Can't be more than 100%"),
  vatRate: num("VAT")
    .min(0, "Can't be negative")
    .max(100, "Can't be more than 100%"),
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
      if (!v) return this.createError({ message: "Enter an amount" });
      const s = stayOf(this, this.parent);
      return (
        v <= s.total ||
        this.createError({
          message: `More than the total (৳${s.total.toLocaleString("en-IN")})`,
        })
      );
    }),
  payCollected: yup.boolean().default(false),
  payMethod: yup.mixed<PayMethod>().oneOf(payMethods).required(),
  payRef: yup
    .string()
    .trim()
    .default("")
    .test("ref", "Enter the transaction ID or reference", function (v) {
      return (
        this.parent.payMethod === "cash" ||
        this.parent.payPlan === "none" ||
        !this.parent.payCollected ||
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
  /^(guest|userId|guestMode|updateProfile|extraBed)/.test(field)
    ? "guest"
    : /^lines/.test(field)
      ? "rooms"
      : /^pay/.test(field)
        ? "payment"
        : /^(discount|internalNote)/.test(field)
          ? "summary"
          : "stay";

export const sectionOrder = ["stay", "rooms", "guest", "payment", "summary"];

/** Puts an error message from the store back on the field it belongs to. */
export function fieldForStoreError(
  msg: string
):
  | "discountValue"
  | "adults"
  | "checkIn"
  | "lines"
  | "guest.fullName"
  | "guest.phone"
  | null {
  if (/discount/i.test(msg)) return "discountValue";
  // Someone else took a room or the last free one while this form was open.
  if (
    /taken by|fully booked|out of service|are free|is free|assign a room/i.test(
      msg
    )
  )
    return "lines";
  if (/sleeps up to|adult/i.test(msg)) return "adults";
  if (/check-in can|check-out must|past/i.test(msg)) return "checkIn";
  if (/name is required/i.test(msg)) return "guest.fullName";
  if (/phone|email/i.test(msg)) return "guest.phone";
  return null;
}
