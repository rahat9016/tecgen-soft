import { hashPassword } from "./auth";
import { dateLabel, hotelInstant, hotelMinutesOf, nightsBetween, payLabels, shiftDay, stayNights, todayKey } from "./format";
import type {
  Booking,
  BookingSource,
  BookingStatus,
  Charge,
  ChargeCategory,
  Content,
  HotelDB,
  Notice,
  OnlineMethod,
  PayMethod,
  Payment,
  Review,
  RoomTypeRecord,
  RoomUnit,
  Settings,
  User,
} from "./types";

/** Bump to reset every visitor's demo data on their next page load. */
export const DB_VERSION = 5;

const photo = (id: string, width = 1200) => `https://images.unsplash.com/photo-${id}?w=${width}&q=80&auto=format&fit=crop`;

export const defaultSettings: Settings = {
  serviceFeeRate: 3,
  vatRate: 5,
  depositRate: 20,
  checkInTime: "2:00 PM",
  checkOutTime: "12:00 PM",
  freeCancellationHours: 24,
  lateCancellationFeeRate: 20,
  requireConfirmation: false,
  onlineMethods: { bkash: true, nagad: true, rocket: true, card: true },
  notifySound: true,
  browserNotifications: false,
};

export const seedRoomTypes: RoomTypeRecord[] = [
  {
    id: "standard-twin",
    highlight: "Best value",
    rating: 4.3,
    reviewsCount: 92,
    name: "Standard Twin Room",
    description:
      "A cosy twin room facing our tropical garden — great value for friends or colleagues travelling together.",
    size: "280 sq ft",
    beds: "2 Twin Beds",
    capacity: 2,
    price: 2400,
    originalPrice: 3200,
    amenities: ["Garden View", "Free WiFi", "AC", "Breakfast Included"],
    images: [photo("1595576508898-0ad5c879a061"), photo("1522771739844-6a9f6d5f14af"), photo("1552321554-5fefe8c9ef14")],
    active: true,
  },
  {
    id: "deluxe-sea-view",
    highlight: "Most popular",
    rating: 4.5,
    reviewsCount: 156,
    name: "Deluxe Sea View Room",
    description:
      "A bright, calm room with a king bed and wide windows facing the Bay of Bengal. Ideal for couples or solo travellers who want to wake up to the sea.",
    size: "350 sq ft",
    beds: "1 King Bed",
    capacity: 2,
    price: 3200,
    originalPrice: 4900,
    amenities: ["Sea View", "Free WiFi", "AC", "Breakfast Included"],
    images: [photo("1602002418082-a4443e081dd1"), photo("1611892440504-42a792e24d32"), photo("1631049307264-da0ec9d70304")],
    active: true,
  },
  {
    id: "superior-triple",
    highlight: "Great for small groups",
    rating: 4.4,
    reviewsCount: 57,
    name: "Superior Triple Room",
    description:
      "A queen bed plus a single, a sitting corner and partial sea views — room for three without booking two rooms.",
    size: "420 sq ft",
    beds: "1 Queen + 1 Single Bed",
    capacity: 3,
    price: 3900,
    originalPrice: 5200,
    amenities: ["Sea View", "Free WiFi", "AC", "Breakfast Included"],
    images: [photo("1591088398332-8a7791972843"), photo("1540518614846-7eded433c457"), photo("1584622650111-993a426fbf0a")],
    active: true,
  },
  {
    id: "family-suite",
    highlight: "Best for families",
    rating: 4.7,
    reviewsCount: 118,
    name: "Family Suite",
    description:
      "Two queen beds, a separate living area and a private balcony with sea views — plenty of space for a family of four to spread out.",
    size: "520 sq ft",
    beds: "2 Queen Beds",
    capacity: 4,
    price: 4800,
    originalPrice: 6500,
    amenities: ["Sea View", "Free WiFi", "AC", "Balcony", "Breakfast Included"],
    images: [photo("1590490360182-c33d57733427"), photo("1560448204-e02f11c3d0e2"), photo("1618773928121-c32242e63f39")],
    active: true,
  },
  {
    id: "honeymoon-suite",
    highlight: "Couples' favourite",
    rating: 4.8,
    reviewsCount: 68,
    name: "Honeymoon Suite",
    description: "Our most romantic room: a king bed, in-room jacuzzi and a sea-view balcony made for sunsets together.",
    size: "450 sq ft",
    beds: "1 King Bed",
    capacity: 2,
    price: 5600,
    originalPrice: 7200,
    amenities: ["Sea View", "Jacuzzi", "Free WiFi", "AC", "Couple Friendly"],
    images: [photo("1578683010236-d716f9a3f461"), photo("1519449556851-5720b33024e7"), photo("1512918728675-ed5a9ecdebfd")],
    active: true,
  },
  {
    id: "premium-ocean-suite",
    highlight: "Top-floor views",
    rating: 4.9,
    reviewsCount: 41,
    name: "Premium Ocean Suite",
    description:
      "Our top-floor suite: a wraparound balcony, separate lounge and a deep soaking tub with panoramic views over the Bay of Bengal.",
    size: "650 sq ft",
    beds: "1 King + 1 Sofa Bed",
    capacity: 3,
    price: 7500,
    originalPrice: 9500,
    amenities: ["Sea View", "Balcony", "Bathtub", "Free WiFi", "AC", "Breakfast Included"],
    images: [photo("1590490359683-658d3d23f972"), photo("1600011689032-8b628b8a8747"), photo("1620626011761-996317b8d101")],
    active: true,
  },
];

const unit = (number: string, typeId: string): RoomUnit => ({
  id: `u${number}`,
  number,
  floor: Number(number[0]),
  typeId,
  housekeeping: "clean",
  outOfService: false,
});

export const seedUnits: RoomUnit[] = [
  ...["101", "102", "103", "104", "105", "106", "107", "108"].map((n) => unit(n, "standard-twin")),
  ...["201", "202", "203", "204", "205", "206"].map((n) => unit(n, "deluxe-sea-view")),
  ...["301", "302", "303", "304"].map((n) => unit(n, "superior-triple")),
  ...["305", "306", "307"].map((n) => unit(n, "family-suite")),
  ...["401", "402"].map((n) => unit(n, "honeymoon-suite")),
  ...["501", "502"].map((n) => unit(n, "premium-ocean-suite")),
].map((u) => (u.number === "108" ? { ...u, outOfService: true, oosReason: "AC unit being replaced" } : u));

export const seedContent: Content = {
  hotel: {
    name: "TripWave Hotel",
    location: "Cox's Bazar",
    address: "Marine Drive Road, Kolatoli, Cox's Bazar",
    phone: "+8801880982822",
    email: "info@tripwave.com",
    whatsapp: "8801880982822",
    rating: 4.6,
    reviewsCount: 532,
    description:
      "TripWave Hotel sits right on the world's longest natural sea beach, with panoramic ocean views, private beach access and an outdoor pool. Comfortable rooms for couples, families and groups — a relaxed beachfront stay in Cox's Bazar.",
  },
  hero: {
    title: "Your Beachfront Stay",
    highlight: "in Cox's Bazar",
    slides: [
      { id: "s1", src: photo("1542314831-068cd1dbfeeb", 1920), alt: "Luxury hotel pool lit up at dusk" },
      { id: "s2", src: photo("1540541338287-41700207dee6", 1920), alt: "Clifftop pool overlooking the ocean" },
      { id: "s3", src: photo("1584132967334-10e028bd69f7", 1920), alt: "Infinity pool by the sea" },
      { id: "s4", src: photo("1571003123894-1f0594d2b5d9", 1920), alt: "Poolside cabanas at sunset" },
      { id: "s5", src: photo("1566073771259-6a8506099945", 1920), alt: "Beachfront deck with sun loungers" },
    ],
  },
  facilities: [
    { name: "Free WiFi", detail: "Fast WiFi in every room and public area" },
    { name: "Swimming Pool", detail: "Outdoor pool with sun loungers" },
    { name: "Free Breakfast", detail: "Daily breakfast with most rooms" },
    { name: "Beach Access", detail: "A short walk to Laboni Beach" },
    { name: "AC Rooms", detail: "Air-conditioned rooms throughout" },
    { name: "Free Parking", detail: "On-site parking at no extra cost" },
    { name: "Couple Friendly", detail: "Private, relaxed stays for couples" },
    { name: "Family Friendly", detail: "Family rooms and kids of all ages welcome" },
    { name: "Sea View", detail: "Ocean views from our rooms" },
    { name: "24/7 Room Service", detail: "Food and help whenever you need it" },
  ],
  whyChoose: [
    "0.5 km from Laboni Beach",
    "Sea-view rooms & top-floor suites",
    "Free cancellation up to 24 hours",
    "Free breakfast with most rooms",
    "24/7 room service & front desk",
  ],
  policies: [
    "Children of all ages are welcome",
    "Pets are not allowed",
    "Smoking is only allowed in designated outdoor areas",
    "Valid photo ID required at check-in",
  ],
  nearby: [
    { name: "Laboni Beach Point", distance: "0.5 km", type: "beach" },
    { name: "Aggmeda Khyang", distance: "3 km", type: "temple" },
    { name: "Cox's Bazar Airport", distance: "6 km", type: "airport" },
    { name: "Himchari National Park", distance: "12 km", type: "park" },
  ],
  gallery: [
    { id: "g1", src: photo("1582719508461-905c673771fd"), title: "TripWave Hotel", subtitle: "Beachfront exterior", category: "hotel", visible: true },
    { id: "g2", src: photo("1540541338287-41700207dee6"), title: "Infinity pool", subtitle: "Open 7 AM – 10 PM", category: "pool", visible: true },
    { id: "g3", src: photo("1602002418082-a4443e081dd1"), title: "Deluxe Sea View Room", subtitle: "1 King Bed · 350 sq ft", category: "rooms", visible: true },
    { id: "g4", src: photo("1584132967334-10e028bd69f7"), title: "Sunset deck", subtitle: "Hotel & facilities", category: "pool", visible: true },
    { id: "g5", src: photo("1590490360182-c33d57733427"), title: "Family Suite", subtitle: "2 Queen Beds · 520 sq ft", category: "rooms", visible: true },
    { id: "g6", src: photo("1571896349842-33c89424de2d"), title: "Lobby & lounge", subtitle: "Hotel & facilities", category: "hotel", visible: true },
    { id: "g7", src: photo("1578683010236-d716f9a3f461"), title: "Honeymoon Suite", subtitle: "Jacuzzi with a sea view", category: "rooms", visible: true },
    { id: "g8", src: photo("1568084680786-a84f91d1153c"), title: "Garden walkway", subtitle: "Hotel & facilities", category: "hotel", visible: true },
    { id: "g9", src: photo("1566073771259-6a8506099945"), title: "Beach deck", subtitle: "Steps from Laboni Beach", category: "beach", visible: true },
    { id: "g10", src: photo("1414235077428-338989a2e8c0"), title: "Sea Breeze Restaurant", subtitle: "Breakfast 7 – 10:30 AM", category: "dining", visible: true },
    { id: "g11", src: photo("1590490359683-658d3d23f972"), title: "Premium Ocean Suite", subtitle: "Wraparound balcony", category: "rooms", visible: true },
    { id: "g12", src: photo("1595576508898-0ad5c879a061"), title: "Standard Twin Room", subtitle: "2 Twin Beds · 280 sq ft", category: "rooms", visible: true },
  ],
};

export const seedReviews: Review[] = (
  [
    ["premium-ocean-suite", "Tasnim Chowdhury", "Dhaka, Bangladesh", 5, "2026-07-05", "The wraparound balcony is incredible — we watched sunrise and sunset from the same suite.", 32],
    ["standard-twin", "Farhan Kabir", "Rajshahi, Bangladesh", 4, "2026-06-30", "Good value twin room for our work trip — clean, quiet and the garden view was a nice surprise.", 59],
    ["superior-triple", "Imran Hossain", "Mymensingh, Bangladesh", 4, "2026-06-18", "Three of us shared the room comfortably. Comfortable beds and a generous breakfast.", 68],
    ["family-suite", "Shahana Begum", "Khulna, Bangladesh", 5, "2026-07-02", "Plenty of room for our two kids, and the balcony sea view was the highlight of the trip.", 44],
    ["honeymoon-suite", "Rafiq Ahmed", "Dhaka, Bangladesh", 5, "2026-06-25", "Jacuzzi with a sea view at sunset — perfect for our anniversary. Staff added flowers too.", 51],
    ["honeymoon-suite", "Mahmudul Hasan", "Chattogram, Bangladesh", 5, "2026-06-20", "The view from the balcony is unreal, best sunrise I've ever seen.", 15],
    ["deluxe-sea-view", "Tamim Rahman", "Dhaka, Bangladesh", 5, "2026-06-12", "Amazing experience! The booking process was so easy and the hotel was perfect.", 12],
    ["deluxe-sea-view", "Kamrul Hasan", "Sylhet, Bangladesh", 5, "2026-06-08", "Great location for business trips, breakfast spread was excellent.", 22],
    ["family-suite", "Nusrat Jahan", "Chattogram, Bangladesh", 5, "2026-05-28", "Best beachfront hotel I've stayed at in Cox's Bazar. Great customer service.", 47],
    ["family-suite", "Sadia Islam", "Dhaka, Bangladesh", 4, "2026-04-30", "Clean rooms and responsive front desk. Would stay again.", 9],
    ["deluxe-sea-view", "Arif Hossain", "Rajshahi, Bangladesh", 4, "2026-04-15", "Very comfortable stay and quick support. Highly recommended!", 33],
  ] as const
).map(([roomId, name, location, rating, date, comment, avatar], i) => ({
  id: `rv${i + 1}`,
  roomId,
  name,
  location,
  rating,
  date,
  comment,
  avatar,
  status: "published" as const,
}));

/** What the server and first paint see: the site content, with no bookings or accounts. */
export const staticState: HotelDB = {
  version: DB_VERSION,
  seeded: false,
  settings: defaultSettings,
  content: seedContent,
  roomTypes: seedRoomTypes,
  units: seedUnits,
  bookings: [],
  users: [],
  reviews: seedReviews,
  notices: [],
  seq: { booking: 10240 },
};

/* ───────────── sample data generator ───────────── */

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const GUESTS: [string, string][] = [
  ["Nusrat Jahan", "Bangladesh"],
  ["Farhan Kabir", "Bangladesh"],
  ["Sadia Islam", "Bangladesh"],
  ["Arif Hossain", "Bangladesh"],
  ["Mahmudul Hasan", "Bangladesh"],
  ["Shahana Begum", "Bangladesh"],
  ["Imran Hossain", "Bangladesh"],
  ["Kamrul Hasan", "Bangladesh"],
  ["Tasnim Chowdhury", "Bangladesh"],
  ["Rafiq Ahmed", "Bangladesh"],
  ["Fahim Mahmud", "Bangladesh"],
  ["Ayesha Siddiqua", "Bangladesh"],
  ["Rakib Hasan", "Bangladesh"],
  ["Mithila Sarkar", "Bangladesh"],
  ["Jannatul Ferdous", "Bangladesh"],
  ["Sabbir Ahmed", "Bangladesh"],
  ["Rubina Akter", "Bangladesh"],
  ["Zahid Hasan", "Bangladesh"],
  ["Nadia Islam", "Bangladesh"],
  ["Lamia Haque", "Bangladesh"],
  ["Towhid Alam", "Bangladesh"],
  ["Priya Das", "Bangladesh"],
  ["Anik Barua", "Bangladesh"],
  ["Sumon Roy", "Bangladesh"],
  ["Mehedi Hasan", "Bangladesh"],
  ["Farzana Yasmin", "Bangladesh"],
  ["Rezaul Karim", "Bangladesh"],
  ["Mou Akter", "Bangladesh"],
  ["Shafiqul Islam", "Bangladesh"],
  ["Tahmina Khatun", "Bangladesh"],
  ["Daniel Smith", "United Kingdom"],
  ["Aiko Tanaka", "Japan"],
  ["Rahul Mehta", "India"],
  ["Sara Lindqvist", "Sweden"],
  ["Omar Al-Farsi", "United Arab Emirates"],
];

const emailOf = (name: string) => `${name.toLowerCase().replace(/[^a-z]+/g, ".").replace(/(^\.|\.$)/g, "")}@example.com`;

/** ISO string for a day + time on the hotel's clock (Asia/Dhaka), whatever the browser's time zone. */
const at = (day: string, hour: number, minute = 0) => new Date(hotelInstant(day, hour * 60 + minute)).toISOString();

const txnRef = (method: PayMethod, rand: () => number) => {
  const code = Array.from({ length: 10 }, () => "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789"[Math.floor(rand() * 34)]).join("");
  if (method === "card") return `VISA •••• ${1000 + Math.floor(rand() * 9000)} · Auth ${code.slice(0, 6)}`;
  if (method === "bank") return `BEFTN ${code}`;
  if (method === "cash") return undefined;
  return `TrxID ${code}`;
};

const quoteFor = (price: number, nights: number, rooms: number, s: Settings) => {
  const subtotal = price * nights * rooms;
  const serviceFee = Math.round((subtotal * s.serviceFeeRate) / 100);
  const tax = Math.round((subtotal * s.vatRate) / 100);
  return { subtotal, serviceFee, tax, total: subtotal + serviceFee + tax };
};

const chargeMenu: [ChargeCategory, string, number][] = [
  ["restaurant", "Sea Breeze Restaurant — dinner", 1850],
  ["restaurant", "Seafood platter", 2400],
  ["room-service", "Room service — late snack", 650],
  ["minibar", "Minibar", 420],
  ["laundry", "Laundry (5 items)", 550],
  ["transport", "Airport pickup", 1200],
  ["transport", "Himchari day trip car", 3500],
  ["spa", "Couples massage", 4000],
];

export function createSeed(): HotelDB {
  const rand = mulberry32(20261013);
  const pick = <T,>(list: readonly T[]) => list[Math.floor(rand() * list.length)];
  const s = defaultSettings;
  const today = todayKey();
  const nowMs = Date.now();
  /** A time that would still be in the future happened a little while ago instead (never "just now"), but not before `floor`. */
  const pastOr = (iso: string, floor: string) => {
    if (new Date(iso).getTime() <= nowMs) return iso;
    const t = Math.max(new Date(floor).getTime(), nowMs - (5 + Math.floor(rand() * 90)) * 60_000);
    return new Date(Math.min(t, nowMs - 60_000)).toISOString();
  };
  // How far through today's arrivals and departures the desk is, judged by the hotel's clock.
  const nowMin = hotelMinutesOf(nowMs);
  const arrivedShare = nowMin < 13 * 60 ? 0.1 : nowMin < 17 * 60 ? 0.4 : nowMin < 21 * 60 ? 0.7 : 0.85;
  const leftShare = nowMin < 9 * 60 ? 0.1 : nowMin < 12 * 60 ? 0.5 : 0.9;

  const busy = new Map<string, Set<string>>(seedUnits.map((u) => [u.id, new Set()]));
  const isFree = (unitId: string, nights: string[]) => nights.every((n) => !busy.get(unitId)!.has(n));
  const occupy = (unitId: string, nights: string[]) => nights.forEach((n) => busy.get(unitId)!.add(n));

  const users: User[] = [
    { id: "us1", name: "Nusrat Akter", email: "admin@tripwave.com", phone: "+880 1711-200100", role: "admin", passwordHash: hashPassword("admin@tripwave.com", "admin123"), status: "active", createdAt: at(shiftDay(today, -400), 10) },
    { id: "us2", name: "Rashed Karim", email: "manager@tripwave.com", phone: "+880 1711-200200", role: "manager", passwordHash: hashPassword("manager@tripwave.com", "manager123"), status: "active", createdAt: at(shiftDay(today, -300), 10) },
    { id: "us3", name: "Sumaiya Islam", email: "frontdesk@tripwave.com", phone: "+880 1711-200300", role: "receptionist", passwordHash: hashPassword("frontdesk@tripwave.com", "desk123"), status: "active", createdAt: at(shiftDay(today, -120), 10) },
    { id: "ug1", name: "Tamim Rahman", email: "tamim@example.com", phone: "+880 1712-345678", role: "guest", passwordHash: hashPassword("tamim@example.com", "guest123"), country: "Bangladesh", status: "active", note: "Repeat guest — prefers a high floor.", createdAt: at(shiftDay(today, -200), 18) },
  ];
  const staffNames = ["Sumaiya Islam", "Sumaiya Islam", "Rashed Karim", "Nusrat Akter"];

  const userFor = (name: string, country: string, registered: boolean): User => {
    const email = emailOf(name);
    const existing = users.find((u) => u.email === email);
    if (existing) {
      if (registered && !existing.passwordHash) existing.passwordHash = hashPassword(email, "guest123");
      return existing;
    }
    const user: User = {
      id: `ug${users.length + 1}`,
      name,
      email,
      phone: country === "Bangladesh" ? `+880 1${pick(["7", "8", "9", "5", "3"])}${String(Math.floor(rand() * 1e8)).padStart(8, "0").replace(/^(\d{2})(\d+)$/, "$1-$2")}` : `+${pick(["44 7700", "81 90", "91 98", "46 70", "971 50"])} ${Math.floor(1e5 + rand() * 9e5)}`,
      role: "guest",
      passwordHash: registered ? hashPassword(email, "guest123") : null,
      country,
      status: "active",
      createdAt: at(shiftDay(today, -Math.floor(60 + rand() * 300)), 12),
    };
    users.push(user);
    return user;
  };

  const bookings: Booking[] = [];

  const makeBooking = (opts: {
    unitIds: string[];
    typeId: string;
    checkIn: string;
    checkOut: string;
    user: User;
    source: BookingSource;
    status: BookingStatus;
    assign?: boolean;
  }) => {
    const type = seedRoomTypes.find((t) => t.id === opts.typeId)!;
    const nights = nightsBetween(opts.checkIn, opts.checkOut);
    const rooms = opts.unitIds.length;
    const q = quoteFor(type.price, nights, rooms, s);
    const adults = Math.max(1, Math.min(type.capacity, 1 + Math.floor(rand() * type.capacity))) * rooms;
    const children = type.capacity >= 3 && rand() < 0.5 ? Math.floor(1 + rand() * 2) * rooms : 0;
    const lead = opts.source === "walk-in" ? 0 : Math.floor(1 + rand() * 25);
    const planned = opts.source === "walk-in" ? at(opts.checkIn, 13 + Math.floor(rand() * 6), Math.floor(rand() * 60)) : at(shiftDay(opts.checkIn, -lead), 9 + Math.floor(rand() * 13), Math.floor(rand() * 60));
    // Future stays were booked some time in the past few weeks, not "right now".
    const createdAt = new Date(planned).getTime() > nowMs ? new Date(nowMs - Math.floor(2 + rand() * 500) * 3600_000).toISOString() : planned;
    const staff = pick(staffNames);
    const payments: Payment[] = [];
    const charges: Charge[] = [];
    const log: Booking["log"] = [];
    const pay = (amount: number, method: PayMethod, kind: Payment["kind"], when: string, by: string) => {
      if (amount <= 0) return;
      payments.push({ id: `p${bookings.length}-${payments.length}`, amount, method, kind, ref: txnRef(method, rand), at: when, by });
      log.push({ at: when, text: `${kind === "refund" ? "Refunded" : "Received"} ৳${amount.toLocaleString("en-IN")} via ${method}`, by });
    };

    log.push({ at: createdAt, text: opts.source === "website" ? "Booked on the website" : `Booking taken (${opts.source})`, by: opts.source === "website" ? "Guest" : staff });

    let plan: Booking["paymentPlan"];
    if (opts.source === "website") {
      plan = rand() < 0.72 ? "deposit" : "full";
      const amount = plan === "full" ? q.total : Math.ceil((q.total * s.depositRate) / 100);
      pay(amount, pick<OnlineMethod>(["bkash", "bkash", "nagad", "rocket", "card", "card"]), plan === "full" ? "payment" : "deposit", createdAt, "Guest (online)");
    } else if (opts.source !== "walk-in" && opts.status !== "pending" && rand() < 0.6) {
      pay(Math.ceil((q.total * s.depositRate) / 100), pick<PayMethod>(["bkash", "bank", "nagad"]), "deposit", createdAt, staff);
    }

    const booking: Booking = {
      id: `bk${bookings.length + 1}`,
      code: "",
      userId: opts.user.id,
      roomTypeId: type.id,
      roomName: type.name,
      rooms,
      unitIds: opts.assign === false ? [] : opts.unitIds,
      checkIn: opts.checkIn,
      checkOut: opts.checkOut,
      nights,
      adults,
      children,
      pricePerNight: type.price,
      ...q,
      charges,
      payments,
      paymentPlan: plan,
      guest: {
        name: opts.user.name,
        email: opts.user.email,
        phone: opts.user.phone,
        country: opts.user.country,
        idType: opts.user.country === "Bangladesh" ? "nid" : "passport",
        idNumber: opts.user.country === "Bangladesh" ? String(Math.floor(1e9 + rand() * 9e9)) : `P${Math.floor(1e7 + rand() * 9e7)}`,
        arrivalTime: rand() < 0.5 ? pick(["12:00 PM – 2:00 PM", "2:00 PM – 4:00 PM", "4:00 PM – 6:00 PM", "6:00 PM – 9:00 PM"]) : "",
        airportPickup: rand() < 0.15,
        note: rand() < 0.25 ? pick(["High floor", "Late check-out", "Extra bed", "Quiet room", "Anniversary — flowers please", "Baby cot"]) : "",
      },
      status: opts.status,
      source: opts.source,
      createdAt,
      updatedAt: createdAt,
      log,
    };

    const paidSoFar = () => payments.reduce((sum, p) => sum + (p.kind === "refund" ? -p.amount : p.amount), 0);
    const folio = () => booking.total + charges.reduce((sum, c) => sum + c.amount, 0);

    if (opts.status !== "pending" && opts.source !== "website" && opts.source !== "walk-in") log.push({ at: createdAt, text: "Confirmed", by: staff });
    if (opts.status === "checked-in" || opts.status === "checked-out") {
      const inAt = pastOr(at(opts.checkIn, 14 + Math.floor(rand() * 6), Math.floor(rand() * 60)), at(opts.checkIn, 12));
      booking.checkedInAt = inAt;
      log.push({ at: inAt, text: `Checked in to room ${opts.unitIds.map((id) => id.slice(1)).join(", ")}`, by: staff });
      if (opts.source === "walk-in" || rand() < 0.3) {
        const amount = opts.source === "walk-in" && rand() < 0.6 ? q.total : Math.ceil(q.total * 0.5);
        pay(Math.min(amount, q.total - paidSoFar()), pick<PayMethod>(["cash", "cash", "card", "bkash"]), "payment", inAt, staff);
      }
      // A few extras during the stay.
      stayNights(opts.checkIn, opts.checkOut).forEach((night) => {
        if (night > today || rand() > 0.35) return;
        const [category, description, amount] = pick(chargeMenu);
        const when = pastOr(at(night, 19 + Math.floor(rand() * 3), Math.floor(rand() * 60)), at(night, 12));
        charges.push({ id: `c${bookings.length}-${charges.length}`, category, description, amount, at: when, by: staff });
      });
    }
    if (opts.status === "checked-out") {
      const outAt = pastOr(at(opts.checkOut, 10 + Math.floor(rand() * 2), Math.floor(rand() * 60)), at(opts.checkOut, 7));
      pay(folio() - paidSoFar(), pick<PayMethod>(["cash", "card", "card", "bkash", "nagad"]), "payment", outAt, staff);
      booking.checkedOutAt = outAt;
      log.push({ at: outAt, text: "Checked out", by: staff });
    }
    if (opts.status === "cancelled") {
      // A few days before the stay, never in the future, and some hours after the booking was made.
      const made = new Date(createdAt).getTime();
      const planned = new Date(at(shiftDay(opts.checkIn, -Math.floor(1 + rand() * 6)), 11)).getTime();
      const latest = nowMs - Math.floor(1 + rand() * 40) * 3600_000;
      const cancelAt = new Date(Math.max(Math.min(planned, latest), Math.min(made + 3 * 3600_000, nowMs - 20 * 60_000), made + 60_000)).toISOString();
      const paid = paidSoFar();
      const late = rand() < 0.3;
      booking.cancellationFee = late ? Math.min(paid, Math.ceil((q.total * s.lateCancellationFeeRate) / 100)) : 0;
      booking.cancelReason = pick(["Change of travel plans", "Family emergency", "Found a different date", "Flight cancelled"]);
      log.push({ at: cancelAt, text: `Cancelled — ${booking.cancelReason}`, by: pick(["Guest", staff]) });
      // Most refunds are already processed; a couple are left for the demo's "Refunds due" queue.
      if (paid - booking.cancellationFee > 0 && rand() < 0.8) pay(paid - booking.cancellationFee, payments[0]?.method ?? "bkash", "refund", new Date(Math.max(new Date(cancelAt).getTime() + 60_000, Math.min(new Date(cancelAt).getTime() + 20 * 3600_000, nowMs - 10 * 60_000))).toISOString(), "Rashed Karim");
      booking.updatedAt = cancelAt;
    }
    if (opts.status === "no-show") {
      booking.cancellationFee = Math.min(paidSoFar(), Math.ceil((q.total * s.lateCancellationFeeRate) / 100));
      booking.cancelReason = "Guest did not arrive";
      log.push({ at: pastOr(at(shiftDay(opts.checkIn, 1), 9), at(shiftDay(opts.checkIn, 1), 0)), text: "Marked as no-show", by: staff });
    }
    booking.updatedAt = log[log.length - 1].at;
    bookings.push(booking);
    return booking;
  };

  // The demo guest account: one past stay (ready for a review) and one coming up.
  const tamim = users.find((u) => u.id === "ug1")!;
  const pastIn = shiftDay(today, -21);
  const pastOut = shiftDay(today, -18);
  occupy("u203", stayNights(pastIn, pastOut));
  makeBooking({ unitIds: ["u203"], typeId: "deluxe-sea-view", checkIn: pastIn, checkOut: pastOut, user: tamim, source: "website", status: "checked-out" });
  const nextIn = shiftDay(today, 9);
  const nextOut = shiftDay(today, 12);
  occupy("u401", stayNights(nextIn, nextOut));
  makeBooking({ unitIds: ["u401"], typeId: "honeymoon-suite", checkIn: nextIn, checkOut: nextOut, user: tamim, source: "website", status: "confirmed" });

  const start = shiftDay(today, -50);
  const end = shiftDay(today, 40);
  for (const u of seedUnits) {
    if (u.outOfService) continue;
    let cursor = shiftDay(start, Math.floor(rand() * 4));
    while (cursor < end) {
      const len = pick([1, 1, 2, 2, 2, 3, 3, 4, 5]);
      const checkIn = cursor;
      const checkOut = shiftDay(cursor, len);
      const ahead = checkIn > today ? nightsBetween(today, checkIn) : 0;
      if (rand() < 0.14 + ahead / 45) {
        cursor = shiftDay(cursor, 1 + Math.floor(rand() * 2));
        continue;
      }
      const nights = stayNights(checkIn, checkOut);
      if (!isFree(u.id, nights)) {
        cursor = shiftDay(cursor, 1);
        continue;
      }
      const ended = checkOut < today || (checkOut === today && rand() < leftShare);
      const started = checkIn <= today;
      // One stay at a time per guest, so the same name doesn't turn up in two rooms on the same night.
      let [name, country] = pick(GUESTS);
      for (let tries = 0; tries < 8 && bookings.some((b) => b.guest.name === name && b.checkIn < checkOut && checkIn < b.checkOut); tries++) [name, country] = pick(GUESTS);
      // Walk-ins for today only once the afternoon check-ins have begun.
      const walkInOk = checkIn < today || (checkIn === today && nowMin >= 13 * 60);
      const source: BookingSource = started && walkInOk && rand() < 0.18 ? "walk-in" : pick(["website", "website", "website", "website", "phone", "phone", "agent"]);
      let status: BookingStatus;
      if (source !== "walk-in" && rand() < 0.07) status = "cancelled";
      else if (ended) status = checkIn < today && source !== "walk-in" && rand() < 0.04 ? "no-show" : "checked-out";
      else if (started) status = checkIn === today && source !== "walk-in" && rand() >= arrivedShare ? "confirmed" : "checked-in";
      // Phone and agent bookings stay tentative until the guest sends a deposit.
      else status = source !== "website" && ahead < 10 && rand() < 0.35 ? "pending" : "confirmed";

      // Now and then a party takes two rooms of the same type.
      const partner =
        status !== "cancelled" && rand() < 0.09
          ? seedUnits.find((o) => o.id !== u.id && o.typeId === u.typeId && !o.outOfService && isFree(o.id, nights))
          : undefined;
      const unitIds = partner ? [u.id, partner.id] : [u.id];
      if (status !== "cancelled") unitIds.forEach((id) => occupy(id, nights));
      const user = userFor(name, country, source === "website" && rand() < 0.45);
      makeBooking({ unitIds, typeId: u.typeId, checkIn, checkOut, user, source, status, assign: !(ahead > 4 && rand() < 0.2) });
      cursor = shiftDay(checkOut, Math.floor(rand() * 3));
    }
  }

  // Booking codes follow the order bookings were made in.
  bookings.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  let seq = 10240;
  bookings.forEach((b) => (b.code = `TW-${++seq}`));

  // One of today's phone or agent arrivals hasn't been given a room yet, as often happens with late bookings.
  const roomless = bookings.filter((b) => b.status === "confirmed" && b.checkIn === today && b.rooms === 1 && b.source !== "website").at(-1);
  if (roomless) roomless.unitIds = [];

  // Rooms vacated today need cleaning; a few occupied rooms are waiting for their daily service.
  const units = seedUnits.map((u) => {
    const leftToday = bookings.some((b) => b.status === "checked-out" && b.checkOut === today && b.unitIds.includes(u.id));
    const inHouse = bookings.some((b) => b.status === "checked-in" && b.unitIds.includes(u.id));
    return { ...u, housekeeping: leftToday ? ("dirty" as const) : inHouse && rand() < 0.4 ? ("dirty" as const) : rand() < 0.5 ? ("inspected" as const) : ("clean" as const) };
  });

  // Recent activity becomes the notification feed.
  const notices: Notice[] = [];
  const recent = nowMs - 3 * 86_400_000;
  bookings.forEach((b) => {
    const made = new Date(b.createdAt).getTime();
    const online = b.source === "website";
    if (made > recent) {
      const paid = b.payments.find((p) => p.kind !== "refund");
      notices.push({
        id: `n${notices.length + 1}`,
        to: "staff",
        kind: "booking",
        title: b.status === "pending" && online ? `New booking to confirm · ${b.code}` : `New booking · ${b.code}`,
        body: `${b.guest.name} · ${b.roomName} · ${b.nights} night${b.nights > 1 ? "s" : ""} from ${dateLabel(b.checkIn, "d MMM")}${online ? (paid ? ` · ৳${paid.amount.toLocaleString("en-IN")} paid` : "") : ` · ${b.source === "walk-in" ? "Walk-in" : b.source === "phone" ? "Phone" : "Travel agent"}`}`,
        bookingId: b.id,
        at: b.createdAt,
        // Staff see their own bookings as already read.
        read: !online || nowMs - made > 6 * 3600_000,
      });
    }
    b.payments
      .filter((p) => p.kind === "payment" && p.by !== "Guest (online)" && new Date(p.at).getTime() > nowMs - 86_400_000)
      .forEach((p) =>
        notices.push({ id: `n${notices.length + 1}`, to: "staff", kind: "payment", title: `Payment received · ${b.code}`, body: `৳${p.amount.toLocaleString("en-IN")} via ${payLabels[p.method]} from ${b.guest.name}`, bookingId: b.id, at: p.at, read: true })
      );
    const cancelled = b.status === "cancelled" ? b.log.find((e) => e.text.startsWith("Cancelled")) : undefined;
    if (cancelled && new Date(cancelled.at).getTime() > recent) {
      const byGuest = cancelled.by === "Guest";
      notices.push({
        id: `n${notices.length + 1}`,
        to: "staff",
        kind: "cancel",
        title: byGuest ? `Cancelled by guest · ${b.code}` : `Booking cancelled · ${b.code}`,
        body: `${b.guest.name}${byGuest ? " cancelled" : " ·"} ${b.roomName}, ${dateLabel(b.checkIn, "d MMM")} — ${b.cancelReason}.`,
        bookingId: b.id,
        at: cancelled.at,
        read: !byGuest || nowMs - new Date(cancelled.at).getTime() > 6 * 3600_000,
      });
    }
  });
  const tamimPast = bookings.find((b) => b.userId === "ug1" && b.status === "checked-out")!;
  const tamimNext = bookings.find((b) => b.userId === "ug1" && b.status === "confirmed")!;
  notices.push(
    { id: `n${notices.length + 1}`, to: "ug1", kind: "booking", title: `Booking confirmed · ${tamimNext.code}`, body: `${tamimNext.roomName}, ${tamimNext.nights} nights from ${tamimNext.checkIn}. See you soon!`, bookingId: tamimNext.id, at: tamimNext.createdAt, read: false },
    { id: `n${notices.length + 2}`, to: "ug1", kind: "review", title: "How was your stay?", body: `Tell other guests about the ${tamimPast.roomName} — it only takes a minute.`, bookingId: tamimPast.id, at: tamimPast.checkedOutAt ?? tamimPast.updatedAt, read: false }
  );
  notices.sort((a, b) => b.at.localeCompare(a.at));

  // Two fresh reviews waiting for moderation.
  const reviewable = bookings.filter((b) => b.status === "checked-out" && b.userId !== "ug1").slice(-2);
  const pendingReviews: Review[] = reviewable.map((b, i) => ({
    id: `rv${seedReviews.length + i + 1}`,
    roomId: b.roomTypeId,
    name: b.guest.name,
    location: b.guest.country === "Bangladesh" ? "Dhaka, Bangladesh" : b.guest.country ?? "",
    rating: i === 0 ? 5 : 3,
    date: b.checkOut,
    comment: i === 0 ? "Lovely sea view and very friendly front desk. Breakfast could start a little earlier." : "Room was fine but the AC was noisy at night. Location is unbeatable though.",
    status: "pending",
    bookingId: b.id,
    userId: b.userId,
  }));

  return {
    ...staticState,
    seeded: true,
    units,
    bookings,
    users,
    reviews: [...seedReviews, ...pendingReviews],
    notices,
    seq: { booking: seq },
  };
}
