import type { HotelDB, RoomTypeRecord, RoomUnit, Settings } from "@/src/lib/hotel-store/types";
import { taka } from "@/src/lib/hotel-store/format";

export const BED_TYPES = ["King bed", "Queen bed", "Double bed", "Single bed", "Bunk bed", "Sofa bed"];
export const SIZE_UNITS = ["sq ft", "m²"] as const;
export type SizeUnit = (typeof SIZE_UNITS)[number];

/** Shown as one-tap chips; `value` is what's stored, so older rooms keep matching. */
export const COMMON_FACILITIES = [
  { label: "Wi-Fi", value: "Free WiFi" },
  { label: "AC", value: "AC" },
  { label: "Attached bathroom", value: "Attached Bathroom" },
  { label: "Hot water", value: "Hot Water" },
  { label: "TV", value: "TV" },
  { label: "Balcony", value: "Balcony" },
  { label: "Sea view", value: "Sea View" },
];
export const facilityLabel = (v: string) => COMMON_FACILITIES.find((c) => c.value === v)?.label ?? v;

export type Bed = { type: string; qty: number };

export type Photo = {
  id: string;
  /** Data/https URL once ready; a blob URL while uploading. */
  src: string;
  status: "uploading" | "ready" | "error";
  progress: number;
  file?: File;
  error?: string;
};

export type FormValues = {
  number: string;
  floor: string;
  name: string;
  description: string;
  beds: Bed[];
  sizeValue: string;
  sizeUnit: SizeUnit;
  capacity: string;
  amenities: string[];
  price: string;
  originalPrice: string;
  showCompare: boolean;
  highlight: string;
  active: boolean;
  outOfService: boolean;
  oosReason: string;
  /** Editing only: older rooms may still share details with others. */
  shareDetails: boolean;
};

export type FieldName = keyof FormValues | "photos";

/** "2,400" → 2400; blank or junk → NaN. */
export const toNumber = (s: string) => (s.trim() === "" ? NaN : Number(s.replace(/[,\s৳]/g, "")));

/** Room 208 is on floor 2; anything that isn't a 3+ digit number gives no hint. */
export const floorFromNumber = (number: string) => {
  const n = Number(number);
  return Number.isInteger(n) && n >= 100 ? Math.floor(n / 100) : undefined;
};

export const floorLabel = (f: number) => (f === 0 ? "Ground floor" : `Floor ${f}`);

/** The next unused number on a floor, e.g. 207 when 201–206 exist. */
export function nextNumber(db: HotelDB, floor: number) {
  const nums = db.units
    .filter((u) => u.floor === floor)
    .map((u) => Number(u.number))
    .filter(Number.isFinite);
  return String(nums.length ? Math.max(...nums) + 1 : (floor || 0) * 100 + 1);
}

const plural = (type: string, qty: number) => (qty > 1 && !/s$/i.test(type) ? `${type}s` : type);

export const formatBeds = (beds: Bed[]) =>
  beds
    .filter((b) => b.type)
    .map((b) => `${b.qty} ${plural(b.type, b.qty)}`)
    .join(" + ");

/** "1 Queen + 1 Single Bed" → [{1, Queen bed}, {1, Single bed}]. Unknown wording is kept as its own bed type. */
export function parseBeds(s: string): Bed[] {
  const parts = s.split(/\s*(?:\+|,|&|\band\b)\s*/i).filter(Boolean);
  const beds = parts.map((p) => {
    const m = p.match(/^(\d+)\s*[x×]?\s*(.+)$/i);
    const qty = m ? Number(m[1]) : 1;
    const raw = (m ? m[2] : p).replace(/\bbeds?\b/i, "").trim();
    const type = raw ? (BED_TYPES.find((t) => t.toLowerCase().startsWith(raw.toLowerCase().replace(/s$/, ""))) ?? `${raw} bed`) : "";
    return { type, qty: Math.max(1, qty) };
  });
  return beds.length ? beds : [{ type: "", qty: 1 }];
}

export function parseSize(s: string): { sizeValue: string; sizeUnit: SizeUnit } {
  const m = s.match(/([\d.,]+)\s*(.*)/);
  const unit: SizeUnit = /m²|m2|sq\s*m\b|sqm/i.test(m?.[2] ?? "") ? "m²" : "sq ft";
  return { sizeValue: m ? m[1].replace(/,/g, "") : "", sizeUnit: unit };
}

export const formatSize = (v: Pick<FormValues, "sizeValue" | "sizeUnit">) => (v.sizeValue.trim() ? `${v.sizeValue.trim()} ${v.sizeUnit}` : "");

export function defaultValues(t?: RoomTypeRecord, unit?: RoomUnit): FormValues {
  return {
    number: unit?.number ?? "",
    floor: unit ? String(unit.floor) : "",
    name: t?.name ?? "",
    description: t?.description ?? "",
    beds: t?.beds ? parseBeds(t.beds) : [{ type: "", qty: 1 }],
    ...parseSize(t?.size ?? ""),
    capacity: t ? String(t.capacity || "") : "2",
    amenities: t?.amenities ?? [],
    price: t?.price ? String(t.price) : "",
    originalPrice: t && t.originalPrice > t.price ? String(t.originalPrice) : "",
    showCompare: !!t && t.originalPrice > t.price,
    highlight: t?.highlight ?? "",
    active: t?.active ?? true,
    outOfService: unit?.outOfService ?? false,
    oosReason: unit?.oosReason ?? "",
    shareDetails: true,
  };
}

export type Issue = { field: FieldName; message: string; /** Needed to publish, not to save a draft. */ required?: boolean };

/**
 * Everything wrong with the form. Drafts only need a valid room number and floor;
 * the `required` issues are what's left before the room can be published.
 */
export function findIssues(v: FormValues, photos: Photo[], db: HotelDB, unitId?: string): Issue[] {
  const out: Issue[] = [];
  const number = v.number.trim();
  if (!number) out.push({ field: "number", message: "Enter a room number" });
  else if (db.units.some((u) => u.number.toLowerCase() === number.toLowerCase() && u.id !== unitId)) out.push({ field: "number", message: `Room ${number} already exists` });

  const floor = toNumber(v.floor);
  if (v.floor.trim() === "") out.push({ field: "floor", message: "Enter the floor" });
  else if (!Number.isInteger(floor) || floor < 0) out.push({ field: "floor", message: "Use a whole number, 0 for ground" });

  if (!v.name.trim()) out.push({ field: "name", message: "Enter the name guests see", required: true });
  if (!v.beds.some((b) => b.type)) out.push({ field: "beds", message: "Choose at least one bed", required: true });
  if (v.beds.some((b) => b.type && !(b.qty >= 1))) out.push({ field: "beds", message: "Bed quantity must be 1 or more" });

  if (v.sizeValue.trim() && !(toNumber(v.sizeValue) > 0)) out.push({ field: "sizeValue", message: "Enter a number, e.g. 350" });

  const cap = toNumber(v.capacity);
  if (v.capacity.trim() === "") out.push({ field: "capacity", message: "Enter how many guests can stay", required: true });
  else if (!Number.isInteger(cap) || cap < 1) out.push({ field: "capacity", message: "At least 1 guest" });

  const price = toNumber(v.price);
  if (v.price.trim() === "") out.push({ field: "price", message: "Enter the nightly rate", required: true });
  else if (!(price > 0)) out.push({ field: "price", message: "Enter an amount in taka, e.g. 2,400" });

  if (v.showCompare && v.originalPrice.trim()) {
    const was = toNumber(v.originalPrice);
    if (!(was > 0)) out.push({ field: "originalPrice", message: "Enter an amount in taka" });
    else if (price > 0 && was <= price) out.push({ field: "originalPrice", message: `Must be higher than the nightly rate (${taka(price)})` });
  }

  if (photos.some((p) => p.status === "uploading")) out.push({ field: "photos", message: "Wait for photos to finish uploading" });
  else if (photos.some((p) => p.status === "error")) out.push({ field: "photos", message: "Retry or remove the photos that failed" });
  else if (!photos.length) out.push({ field: "photos", message: "Add at least one photo", required: true });

  if (v.outOfService && unitId) {
    const guest = db.bookings.find((b) => b.status === "checked-in" && b.unitIds.includes(unitId));
    if (guest) out.push({ field: "outOfService", message: `${guest.guest.name} is staying here — move them first` });
  }
  return out;
}

/** What a guest pays per night once service charge and VAT are added (both are worked out on the rate). */
export const guestNightly = (rate: number, s: Pick<Settings, "serviceFeeRate" | "vatRate">) =>
  rate + Math.round((rate * s.serviceFeeRate) / 100) + Math.round((rate * s.vatRate) / 100);
