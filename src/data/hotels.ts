import { addDays } from "date-fns";
import { toDayKey } from "@/src/lib/hotelDates";

// The hotel's content, rooms and bookings live in the hotel store (src/lib/hotel-store) and are edited in
// the admin panel. These are the shapes the guest-facing components read, built by `siteHotel()`.

/** A booking that holds `rooms` units of a room type for the nights from checkIn up to (not including) checkOut. */
export interface RoomReservation {
  checkIn: string;
  checkOut: string;
  rooms: number;
}

export interface RoomType {
  id: string;
  name: string;
  description: string;
  size: string;
  beds: string;
  capacity: number;
  price: number;
  originalPrice: number;
  /** Short label shown on the room card, e.g. "Most popular". */
  highlight: string;
  rating: number;
  reviewsCount: number;
  /** How many physical rooms of this type are in service. */
  totalRooms: number;
  reservations: RoomReservation[];
  amenities: string[];
  images: string[];
}

export interface HotelReview {
  /** The room type this guest stayed in. */
  roomId: string;
  name: string;
  location: string;
  rating: number;
  date: string;
  comment: string;
  /** pravatar.cc image number; reviews written by guests on the site have none. */
  avatar?: number;
  /** The hotel's public reply. */
  reply?: string;
}

export interface NearbyPlace {
  name: string;
  distance: string;
  type: "beach" | "temple" | "airport" | "park";
}

export interface Hotel {
  slug: string;
  name: string;
  location: string;
  address: string;
  phone: string;
  rating: number;
  reviewsCount: number;
  description: string;
  images: string[];
  amenities: string[];
  rooms: RoomType[];
  policies: string[];
  nearby: NearbyPlace[];
  reviews: HotelReview[];
}

/** Rooms of this type still free for every night of the stay — the busiest night decides. */
export function availableRooms(room: RoomType, checkIn: Date, checkOut: Date) {
  let free = room.totalRooms;
  for (let night = checkIn; toDayKey(night) < toDayKey(checkOut); night = addDays(night, 1)) {
    const key = toDayKey(night);
    const booked = room.reservations
      .filter((r) => r.checkIn <= key && key < r.checkOut)
      .reduce((sum, r) => sum + r.rooms, 0);
    free = Math.min(free, room.totalRooms - booked);
  }
  return Math.max(0, free);
}

export const roomDiscount = (room: Pick<RoomType, "price" | "originalPrice">) =>
  room.originalPrice > room.price ? Math.round(((room.originalPrice - room.price) / room.originalPrice) * 100) : 0;
