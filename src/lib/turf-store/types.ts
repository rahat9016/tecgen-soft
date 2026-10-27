/** TurfHub is a football-only venue; kept as a type so a sport can be added later. */
export type Sport = "football";

export type Court = {
  id: string;
  name: string;
  sport: Sport;
  surface: string;
  indoor: boolean;
  size: string;
  image: string;
  /** Per hour, before the evening peak starts. */
  price: number;
  peakPrice: number;
  players: string;
  rating: number;
  active: boolean;
  features: string[];
  description: string;
};

export type Settings = {
  venueName: string;
  phone: string;
  address: string;
  /** First bookable hour (0–23). */
  openHour: number;
  /** Hour the venue closes; the last slot starts at closeHour − 1. Up to 24 (midnight). */
  closeHour: number;
  /** Slots starting at or after this hour use the court's peak price. */
  peakStartHour: number;
  /** Share of the total the customer must pay online to lock a slot. */
  advancePercent: number;
  /** Minutes a slot stays reserved while a customer is paying. */
  holdMinutes: number;
  maxDuration: number;
  /** How many days ahead customers may book. */
  bookingWindowDays: number;
  /** Customers can cancel online up to this many hours before the start. */
  cancelCutoffHours: number;
};

/**
 * Book, pay the booking money, play — no check-in and no verification step: a booking is confirmed the
 * moment it's made. Whether it's still to come, under way or played follows from the clock (see `phaseOf`).
 */
export type BookingStatus = "confirmed" | "cancelled";

/** What a booking shows as: its status, with confirmed games split by time. */
export type Phase = "booked" | "playing" | "played" | "cancelled";

export type PayMethod = "bkash" | "nagad" | "card" | "cash";

export type Payment = {
  id: string;
  amount: number;
  method: PayMethod;
  kind: "advance" | "balance" | "refund";
  ref?: string;
  at: string;
};

export type Booking = {
  id: string;
  code: string;
  courtId: string;
  /** Local date, yyyy-mm-dd. */
  date: string;
  startHour: number;
  /** Whole hours. */
  duration: number;
  customer: { name: string; phone: string; email?: string; team?: string };
  total: number;
  advanceDue: number;
  payments: Payment[];
  status: BookingStatus;
  source: "online" | "walk-in" | "phone";
  note?: string;
  cancelReason?: string;
  /** The venue cancelled but kept the money (a late cancellation), so nothing is owed back. */
  refundWaived?: boolean;
  createdAt: string;
  updatedAt: string;
};

/** Admin-made closure of a court for part of a day (maintenance, tournament …). */
export type Block = {
  id: string;
  courtId: string;
  date: string;
  startHour: number;
  duration: number;
  reason: string;
};

/** Short-lived lock taken while a customer is on the payment step. */
export type Hold = {
  id: string;
  courtId: string;
  date: string;
  startHour: number;
  duration: number;
  clientId: string;
  expiresAt: number;
};

export type Service = {
  title: string;
  text: string;
  /** Short line beside the title; empty on an online service shows the hourly price. */
  detail: string;
  /** Booked through the site; otherwise the row calls the venue. */
  online: boolean;
};

/** Home page copy the admin can edit. */
export type SiteContent = {
  heroTitle: string;
  heroText: string;
  heroImage: string;
  aboutTitle: string;
  aboutText: string;
  services: Service[];
};

/** Photo in the site's gallery section, shown in list order. */
export type GalleryImage = {
  id: string;
  /** Public path, https link, or a downscaled upload as a data URL. */
  src: string;
  title: string;
  visible: boolean;
};

export type TurfDB = {
  version: number;
  seeded: boolean;
  settings: Settings;
  content: SiteContent;
  gallery: GalleryImage[];
  courts: Court[];
  bookings: Booking[];
  blocks: Block[];
  holds: Hold[];
  seq: { booking: number; court: number };
};
