import { addDays } from "date-fns";
import { toDayKey } from "@/src/lib/hotelDates";

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
  /** How many physical rooms of this type the hotel has. */
  totalRooms: number;
  reservations: RoomReservation[];
  amenities: string[];
  images: string[];
}

export interface HotelReview {
  name: string;
  location: string;
  rating: number;
  date: string;
  comment: string;
  avatar: number;
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
  nearby: { name: string; distance: string }[];
  reviews: HotelReview[];
}

// Sample reservations are placed relative to today so the demo always has busy and free dates.
const today = new Date();
const day = (offset: number) => toDayKey(addDays(today, offset));

const photo = (id: string, width = 1200) =>
  `https://images.unsplash.com/photo-${id}?w=${width}&q=80&auto=format&fit=crop`;

export const hotel: Hotel = {
  slug: "sea-paradise-hotel",
  name: "Sea Paradise Hotel",
  location: "Cox's Bazar",
  address: "Marine Drive Road, Kolatoli, Cox's Bazar",
  phone: "+8801880982822",
  rating: 4.6,
  reviewsCount: 342,
  description:
    "Sea Paradise Hotel sits right on the world's longest natural sea beach, with panoramic ocean views, private beach access and an outdoor pool. Comfortable rooms for couples, families and groups — a relaxed beachfront stay in Cox's Bazar.",
  images: [
    photo("1582719508461-905c673771fd"),
    photo("1540541338287-41700207dee6"),
    photo("1584132967334-10e028bd69f7"),
    photo("1571896349842-33c89424de2d"),
    photo("1568084680786-a84f91d1153c"),
  ],
  amenities: [
    "Free WiFi",
    "Swimming Pool",
    "Free Breakfast",
    "Beach Access",
    "AC Rooms",
    "Free Parking",
    "Couple Friendly",
    "Family Friendly",
    "Sea View",
    "24/7 Room Service",
  ],
  rooms: [
    {
      id: "deluxe-sea-view",
      name: "Deluxe Sea View Room",
      description:
        "A bright, calm room with a king bed and wide windows facing the Bay of Bengal. Ideal for couples or solo travellers who want to wake up to the sea.",
      size: "350 sq ft",
      beds: "1 King Bed",
      capacity: 2,
      price: 3200,
      originalPrice: 4900,
      totalRooms: 6,
      reservations: [
        { checkIn: day(2), checkOut: day(5), rooms: 3 },
        { checkIn: day(3), checkOut: day(4), rooms: 2 },
        { checkIn: day(20), checkOut: day(23), rooms: 6 },
      ],
      amenities: ["Sea View", "Free WiFi", "AC", "Breakfast Included"],
      images: [
        photo("1602002418082-a4443e081dd1"),
        photo("1611892440504-42a792e24d32"),
        photo("1631049307264-da0ec9d70304"),
      ],
    },
    {
      id: "family-suite",
      name: "Family Suite",
      description:
        "Two queen beds, a separate living area and a private balcony with sea views — plenty of space for a family of four to spread out.",
      size: "520 sq ft",
      beds: "2 Queen Beds",
      capacity: 4,
      price: 4800,
      originalPrice: 6500,
      totalRooms: 3,
      reservations: [
        { checkIn: day(1), checkOut: day(4), rooms: 2 },
        { checkIn: day(10), checkOut: day(13), rooms: 3 },
      ],
      amenities: ["Sea View", "Free WiFi", "AC", "Balcony", "Breakfast Included"],
      images: [
        photo("1590490360182-c33d57733427"),
        photo("1560448204-e02f11c3d0e2"),
        photo("1618773928121-c32242e63f39"),
      ],
    },
    {
      id: "honeymoon-suite",
      name: "Honeymoon Suite",
      description:
        "Our most romantic room: a king bed, in-room jacuzzi and a sea-view balcony made for sunsets together.",
      size: "450 sq ft",
      beds: "1 King Bed",
      capacity: 2,
      price: 5600,
      originalPrice: 7200,
      totalRooms: 2,
      reservations: [
        { checkIn: day(0), checkOut: day(7), rooms: 2 },
        { checkIn: day(14), checkOut: day(16), rooms: 1 },
      ],
      amenities: ["Sea View", "Jacuzzi", "Free WiFi", "AC", "Couple Friendly"],
      images: [
        photo("1578683010236-d716f9a3f461"),
        photo("1519449556851-5720b33024e7"),
        photo("1512918728675-ed5a9ecdebfd"),
      ],
    },
  ],
  policies: [
    "Check-in from 2:00 PM, Check-out until 12:00 PM",
    "Free cancellation up to 24 hours before check-in",
    "Children of all ages are welcome",
    "Pets are not allowed",
    "Smoking is only allowed in designated outdoor areas",
    "Valid photo ID required at check-in",
  ],
  nearby: [
    { name: "Laboni Beach Point", distance: "0.5 km" },
    { name: "Aggmeda Khyang", distance: "3 km" },
    { name: "Cox's Bazar Airport", distance: "6 km" },
    { name: "Himchari National Park", distance: "12 km" },
  ],
  reviews: [
    {
      name: "Mahmudul Hasan",
      location: "Chattogram, Bangladesh",
      rating: 5,
      date: "2026-06-20",
      comment: "The view from the balcony is unreal, best sunrise I've ever seen.",
      avatar: 15,
    },
    {
      name: "Tamim Rahman",
      location: "Dhaka, Bangladesh",
      rating: 5,
      date: "2026-06-12",
      comment: "Amazing experience! The booking process was so easy and the hotel was perfect.",
      avatar: 12,
    },
    {
      name: "Kamrul Hasan",
      location: "Sylhet, Bangladesh",
      rating: 5,
      date: "2026-06-08",
      comment: "Great location for business trips, breakfast spread was excellent.",
      avatar: 22,
    },
    {
      name: "Nusrat Jahan",
      location: "Chattogram, Bangladesh",
      rating: 5,
      date: "2026-05-28",
      comment: "Best beachfront hotel I've stayed at in Cox's Bazar. Great customer service.",
      avatar: 47,
    },
    {
      name: "Sadia Islam",
      location: "Dhaka, Bangladesh",
      rating: 4,
      date: "2026-04-30",
      comment: "Clean rooms and responsive front desk. Would stay again.",
      avatar: 9,
    },
    {
      name: "Arif Hossain",
      location: "Rajshahi, Bangladesh",
      rating: 4,
      date: "2026-04-15",
      comment: "Very comfortable stay and quick support. Highly recommended!",
      avatar: 33,
    },
  ],
};

export function getRoomById(id: string) {
  return hotel.rooms.find((room) => room.id === id);
}

/**
 * Rooms of this type still free for every night of the stay — the busiest night decides.
 * `extra` adds bookings held elsewhere (e.g. ones the guest made in this browser).
 */
export function availableRooms(
  room: RoomType,
  checkIn: Date,
  checkOut: Date,
  extra: RoomReservation[] = []
) {
  const reservations = [...room.reservations, ...extra];
  let free = room.totalRooms;
  for (let night = checkIn; toDayKey(night) < toDayKey(checkOut); night = addDays(night, 1)) {
    const key = toDayKey(night);
    const booked = reservations
      .filter((r) => r.checkIn <= key && key < r.checkOut)
      .reduce((sum, r) => sum + r.rooms, 0);
    free = Math.min(free, room.totalRooms - booked);
  }
  return Math.max(0, free);
}

export const roomDiscount = (room: RoomType) =>
  Math.round(((room.originalPrice - room.price) / room.originalPrice) * 100);
