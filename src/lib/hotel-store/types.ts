export type RoomTypeRecord = {
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
  amenities: string[];
  images: string[];
  /** Inactive types are hidden from the website and can't be booked online. */
  active: boolean;
};

export type Housekeeping = "clean" | "dirty" | "inspected";

/** A physical room, e.g. "204" on floor 2. Bookings are assigned to these. */
export type RoomUnit = {
  id: string;
  number: string;
  floor: number;
  typeId: string;
  housekeeping: Housekeeping;
  outOfService: boolean;
  oosReason?: string;
  note?: string;
};

export type BookingStatus = "pending" | "confirmed" | "checked-in" | "checked-out" | "cancelled" | "no-show";
export type BookingSource = "website" | "walk-in" | "phone" | "agent";
export type PayMethod = "bkash" | "nagad" | "rocket" | "card" | "cash" | "bank";
export type OnlineMethod = "bkash" | "nagad" | "rocket" | "card";
export type PaymentKind = "deposit" | "payment" | "refund";
export type PaymentPlan = "deposit" | "full";

export type Payment = {
  id: string;
  amount: number;
  method: PayMethod;
  kind: PaymentKind;
  /** Gateway transaction id, card auth code, cheque no. … */
  ref?: string;
  note?: string;
  at: string;
  /** Staff name, or "Guest (online)". */
  by: string;
  /** Voided payments stay on the folio for the audit trail but no longer count. */
  void?: { at: string; by: string; reason: string };
};

export type ChargeCategory =
  | "restaurant"
  | "room-service"
  | "minibar"
  | "laundry"
  | "transport"
  | "spa"
  | "extra-bed"
  | "damage"
  | "other"
  | "discount";

/** Extra folio line on top of the room charge. Discounts are stored as negative amounts. */
export type Charge = {
  id: string;
  category: ChargeCategory;
  description: string;
  amount: number;
  at: string;
  by: string;
};

export type GuestInfo = {
  name: string;
  email: string;
  phone: string;
  country?: string;
  idType?: "nid" | "passport";
  idNumber?: string;
  arrivalTime?: string;
  airportPickup?: boolean;
  note?: string;
};

export type BookingEvent = { at: string; text: string; by: string };

export type Booking = {
  id: string;
  code: string;
  /** Account that owns the booking — a registered guest, or a guest profile created at booking time. */
  userId?: string;
  roomTypeId: string;
  /** Room type name when booked, so history survives renames. */
  roomName: string;
  rooms: number;
  /** Physical rooms given to this booking; may be shorter than `rooms` until staff assign them. */
  unitIds: string[];
  /** yyyy-MM-dd, local calendar days. The guest sleeps the nights from checkIn up to (not including) checkOut. */
  checkIn: string;
  checkOut: string;
  nights: number;
  adults: number;
  children: number;
  pricePerNight: number;
  subtotal: number;
  serviceFee: number;
  tax: number;
  /** Room charge incl. service fee and VAT. Extras live in `charges`. */
  total: number;
  charges: Charge[];
  payments: Payment[];
  paymentPlan?: PaymentPlan;
  guest: GuestInfo;
  status: BookingStatus;
  source: BookingSource;
  /** Kept by the hotel when a booking is cancelled late or is a no-show. */
  cancellationFee?: number;
  cancelReason?: string;
  internalNote?: string;
  createdAt: string;
  updatedAt: string;
  checkedInAt?: string;
  checkedOutAt?: string;
  log: BookingEvent[];
};

export type Role = "guest" | "admin" | "manager" | "receptionist";
export type StaffRole = Exclude<Role, "guest">;

export type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  /** Null for guest profiles created by a booking — they can claim it by signing up with the same email. */
  passwordHash: string | null;
  country?: string;
  status: "active" | "blocked";
  /** Private staff note about the guest (VIP, preferences …). */
  note?: string;
  createdAt: string;
  lastLoginAt?: string;
};

export type NoticeKind = "booking" | "payment" | "cancel" | "checkin" | "checkout" | "review" | "user" | "system";

/** In-app notification. `to` is "staff" (shared by the front office) or a guest's user id. */
export type Notice = {
  id: string;
  to: string;
  kind: NoticeKind;
  title: string;
  body: string;
  bookingId?: string;
  at: string;
  read: boolean;
};

export type ReviewStatus = "published" | "pending" | "hidden";

export type Review = {
  id: string;
  roomId: string;
  name: string;
  location: string;
  rating: number;
  date: string;
  comment: string;
  /** pravatar.cc image number for seeded reviews. */
  avatar?: number;
  status: ReviewStatus;
  bookingId?: string;
  userId?: string;
  reply?: string;
};

export type GalleryCategory = "hotel" | "rooms" | "pool" | "dining" | "beach" | "events";

export type GalleryImage = {
  id: string;
  src: string;
  title: string;
  subtitle: string;
  category: GalleryCategory;
  visible: boolean;
};

export type NearbyPlace = {
  name: string;
  distance: string;
  type: "beach" | "temple" | "airport" | "park";
};

export type HotelInfo = {
  name: string;
  location: string;
  address: string;
  phone: string;
  email: string;
  whatsapp: string;
  description: string;
  rating: number;
  reviewsCount: number;
};

export type Content = {
  hotel: HotelInfo;
  hero: { title: string; highlight: string; slides: { id: string; src: string; alt: string }[] };
  facilities: { name: string; detail: string }[];
  whyChoose: string[];
  /** House rules. Check-in/out times and the cancellation line are generated from settings. */
  policies: string[];
  nearby: NearbyPlace[];
  gallery: GalleryImage[];
};

export type Settings = {
  /** Percent of the room charge. */
  serviceFeeRate: number;
  vatRate: number;
  /** Percent of the total taken online to confirm a booking. */
  depositRate: number;
  checkInTime: string;
  checkOutTime: string;
  /** Free cancellation until this many hours before check-in. 0 = no free cancellation. */
  freeCancellationHours: number;
  /** Percent of the total the hotel keeps on a late cancellation or no-show. */
  lateCancellationFeeRate: number;
  /** Online bookings wait for staff to confirm them instead of confirming instantly. */
  requireConfirmation: boolean;
  onlineMethods: Record<OnlineMethod, boolean>;
  notifySound: boolean;
  browserNotifications: boolean;
};

export type HotelDB = {
  version: number;
  seeded: boolean;
  settings: Settings;
  content: Content;
  roomTypes: RoomTypeRecord[];
  units: RoomUnit[];
  bookings: Booking[];
  users: User[];
  reviews: Review[];
  notices: Notice[];
  seq: { booking: number };
};

/** Per-browser login state, kept apart from the shared data. */
export type Session = {
  guestId?: string;
  staffId?: string;
  /** Bookings made in this browser without an account, so "My bookings" can still list them. */
  bookingIds: string[];
};
