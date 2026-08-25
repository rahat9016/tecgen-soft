export interface BookingRecord {
  bookingId: string;
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
  guest: { name: string; email: string; phone: string; note?: string };
  createdAt: string;
}

const STORAGE_KEY = "tripwave_booking_history";

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
