export type Sport = "football" | "cricket" | "badminton" | "tennis" | "basketball";

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

export type BookingStatus = "pending" | "confirmed" | "checked-in" | "completed" | "cancelled" | "no-show";

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

export type TurfDB = {
  version: number;
  seeded: boolean;
  settings: Settings;
  courts: Court[];
  bookings: Booking[];
  blocks: Block[];
  holds: Hold[];
  seq: { booking: number; court: number };
};
