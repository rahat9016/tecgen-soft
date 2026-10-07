import type { RoomReservation } from "@/src/data/hotels";
import { toDayKey } from "@/src/lib/hotelDates";

export interface BookingRecord {
  bookingId: string;
  /** Missing on bookings saved before rooms had their own pages. */
  roomId?: string;
  hotelSlug: string;
  hotelName: string;
  hotelLocation: string;
  hotelImage: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  adults: number;
  children: number;
  rooms: number;
  pricePerNight: number;
  subtotal: number;
  serviceFee: number;
  tax: number;
  total: number;
  guest: {
    name: string;
    email: string;
    phone: string;
    note?: string;
    country?: string;
    idType?: "nid" | "passport";
    idNumber?: string;
    arrivalTime?: string;
    airportPickup?: boolean;
  };
  paymentMethod?: "hotel" | "card" | "wallet";
  createdAt: string;
}

export const STORAGE_KEY = "tripwave_booking_history";

export function getBookingHistory(): BookingRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as BookingRecord[]) : [];
  } catch {
    return [];
  }
}

export function getBookingById(bookingId: string): BookingRecord | undefined {
  return getBookingHistory().find((b) => b.bookingId === bookingId);
}

export function saveBooking(record: BookingRecord): void {
  try {
    const history = getBookingHistory();
    localStorage.setItem(STORAGE_KEY, JSON.stringify([record, ...history]));
  } catch {
    // localStorage unavailable — booking still succeeds, just isn't persisted
  }
}

/** Bookings made in this browser that hold units of the given room type. */
export function reservationsFromHistory(history: BookingRecord[], roomId: string): RoomReservation[] {
  return history
    .filter((b) => b.roomId === roomId)
    .map((b) => ({
      checkIn: toDayKey(new Date(b.checkIn)),
      checkOut: toDayKey(new Date(b.checkOut)),
      rooms: b.rooms,
    }));
}
