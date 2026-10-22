"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import type { Hotel, RoomType } from "@/src/data/hotels";
import { discountLimit, hashPassword, isStaff } from "./auth";
import { clockMinutes, dateLabel, hotelDayOf, hotelInstant, nightsBetween, payLabels, shiftDay, sourceLabels, stayNights, todayKey } from "./format";
import { createSeed, DB_VERSION, staticState } from "./seed";
import type {
  Booking,
  BookingSource,
  BookingStatus,
  Charge,
  Commission,
  Content,
  DiscountKind,
  GalleryImage,
  GuestInfo,
  HotelDB,
  Housekeeping,
  Notice,
  NoticeKind,
  OnlineMethod,
  PayMethod,
  Payment,
  PaymentKind,
  PaymentPlan,
  Review,
  ReviewStatus,
  RoomTypeRecord,
  RoomUnit,
  Session,
  Settings,
  StaffRole,
  StayDiscount,
  User,
} from "./types";

/**
 * Demo backend for the TripWave hotel: one JSON document in localStorage shared by the booking site and the
 * admin panel. Every write re-reads the latest copy first and other tabs pick changes up through the `storage`
 * event — so a booking made on the website shows up (with a notification) in an open admin tab instantly.
 *
 * Swap this module for API calls to go live; components only use the hooks, selectors and actions below.
 */
const KEY = "tripwave:db";
const SESSION_KEY = "tripwave:session";
export const STORAGE_FULL_EVENT = "tripwave:storage-full";

let state: HotelDB | null = null;
let session: Session | null = null;
const listeners = new Set<() => void>();
const emptySession: Session = { bookingIds: [] };

function read(): HotelDB | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as HotelDB;
    return parsed.version === DB_VERSION && parsed.seeded ? parsed : null;
  } catch {
    return null;
  }
}

function persist(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full (usually big uploaded photos) — keep working in memory and tell the UI.
    window.dispatchEvent(new Event(STORAGE_FULL_EVENT));
  }
}

function load(): HotelDB {
  const existing = read();
  if (existing) return existing;
  const fresh = createSeed();
  persist(KEY, fresh);
  return fresh;
}

function getState(): HotelDB {
  if (typeof window === "undefined") return staticState;
  if (!state) state = load();
  return state;
}

function readSession(): Session {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? { ...emptySession, ...(JSON.parse(raw) as Session) } : emptySession;
  } catch {
    return emptySession;
  }
}

function getSession(): Session {
  if (typeof window === "undefined") return emptySession;
  if (!session) session = readSession();
  return session;
}

function emit() {
  listeners.forEach((l) => l());
}

function onStorage(e: StorageEvent) {
  if (e.key === KEY) state = read() ?? load();
  else if (e.key === SESSION_KEY) session = readSession();
  else return;
  emit();
}

function subscribe(listener: () => void) {
  if (listeners.size === 0) window.addEventListener("storage", onStorage);
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener("storage", onStorage);
  };
}

function update(fn: (s: HotelDB) => HotelDB) {
  // Start from what is on disk, not our cached copy: another tab may have written a moment ago.
  state = fn(read() ?? getState());
  persist(KEY, state);
  emit();
}

function setSession(fn: (s: Session) => Session) {
  session = fn(readSession());
  persist(SESSION_KEY, session);
  emit();
}

export function useHotelDB(): HotelDB {
  return useSyncExternalStore(subscribe, getState, () => staticState);
}

/** Re-reads the saved data, e.g. after an error or when someone asks for the latest. */
export function refreshHotelDB() {
  state = read() ?? load();
  emit();
}

export function useSession(): Session {
  return useSyncExternalStore(subscribe, getSession, () => emptySession);
}

const noop = () => () => {};
export function useHydrated() {
  return useSyncExternalStore(noop, () => true, () => false);
}

/** Current time, re-rendering every `ms`. 0 on the server so markup stays stable. */
export function useNow(ms = 30_000) {
  const hydrated = useHydrated();
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(t);
  }, [ms]);
  return hydrated ? now : 0;
}

export function useCurrentGuest(): User | undefined {
  const db = useHotelDB();
  const { guestId } = useSession();
  return db.users.find((u) => u.id === guestId && u.status === "active");
}

export function useCurrentStaff(): User | undefined {
  const db = useHotelDB();
  const { staffId } = useSession();
  return db.users.find((u) => u.id === staffId && isStaff(u.role) && u.status === "active");
}

export function resetDemoData() {
  state = createSeed();
  persist(KEY, state);
  // Keep the staff member signed in if their seeded account still exists.
  setSession((s) => ({ staffId: state!.users.some((u) => u.id === s.staffId) ? s.staffId : undefined, bookingIds: [] }));
}

const uid = (p: string) => `${p}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
const nowIso = () => new Date().toISOString();
const money = (n: number) => `৳${Math.round(n).toLocaleString("en-IN")}`;

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export type Result<T> = { ok: true; value: T } | { ok: false; error: string };
const fail = <T,>(error: string): Result<T> => ({ ok: false, error });

/* ───────────── money selectors ───────────── */

const counts = (p: Payment) => !p.void;
export const chargesOf = (b: Booking) => b.charges.reduce((s, c) => s + c.amount, 0);
export const folioTotal = (b: Booking) => b.total + chargesOf(b);
export const paidOf = (b: Booking) =>
  b.payments.filter(counts).reduce((s, p) => s + (p.kind === "refund" ? -p.amount : p.amount), 0);
export const refundedOf = (b: Booking) =>
  b.payments.filter((p) => counts(p) && p.kind === "refund").reduce((s, p) => s + p.amount, 0);
/** Bookings that still hold rooms and owe their folio. */
export const isLive = (b: Booking) => b.status !== "cancelled" && b.status !== "no-show";
export const dueOf = (b: Booking) => (isLive(b) ? Math.max(0, folioTotal(b) - paidOf(b)) : 0);
/** Money the hotel holds beyond what the guest owes — to refund. */
export const creditOf = (b: Booking) =>
  isLive(b) ? Math.max(0, paidOf(b) - folioTotal(b)) : Math.max(0, paidOf(b) - (b.cancellationFee ?? 0));

export function paymentStatus(b: Booking): { label: string; tone: string } {
  const paid = paidOf(b);
  if (creditOf(b) > 0) return { label: isLive(b) ? "Overpaid" : "Refund due", tone: "bg-violet-50 text-violet-700 ring-violet-200" };
  if (!isLive(b)) return refundedOf(b) > 0 ? { label: "Refunded", tone: "bg-neutral-100 text-neutral-600 ring-neutral-200" } : { label: paid > 0 ? "Fee kept" : "No charge", tone: "bg-neutral-100 text-neutral-600 ring-neutral-200" };
  if (dueOf(b) === 0) return { label: "Paid", tone: "bg-emerald-50 text-emerald-700 ring-emerald-200" };
  if (paid > 0) return { label: "Partly paid", tone: "bg-sky-50 text-sky-700 ring-sky-200" };
  return { label: "Unpaid", tone: "bg-rose-50 text-rose-700 ring-rose-200" };
}

export type DiscountInput = { kind: DiscountKind; value: number };

/** BDT a discount takes off a room charge — never more than the charge itself. */
export function discountAmount(subtotal: number, d?: DiscountInput) {
  if (!d || !(d.value > 0)) return 0;
  const raw = d.kind === "percent" ? (subtotal * Math.min(d.value, 100)) / 100 : d.value;
  return Math.min(subtotal, Math.round(raw));
}

/** Room charge → discount → service charge and VAT on the discounted price → total. */
export function quoteStay(settings: Settings, price: number, nights: number, rooms: number, discount?: DiscountInput) {
  const subtotal = price * nights * rooms;
  const off = discountAmount(subtotal, discount);
  const net = subtotal - off;
  const serviceFee = Math.round((net * settings.serviceFeeRate) / 100);
  const tax = Math.round((net * settings.vatRate) / 100);
  const total = net + serviceFee + tax;
  // Whole taka, rounded up so the deposit never falls below the rate.
  return { subtotal, discount: off, net, serviceFee, tax, total, deposit: Math.ceil((total * settings.depositRate) / 100) };
}

/** Settings with a booking's own service charge and VAT percent, so its money keeps the rates it was made at. */
export const ratesFor = (settings: Settings, b?: { serviceFeeRate?: number; vatRate?: number }): Settings => ({
  ...settings,
  serviceFeeRate: b?.serviceFeeRate ?? settings.serviceFeeRate,
  vatRate: b?.vatRate ?? settings.vatRate,
});

/** Discount as a percent of the room charge, for checking against a staff member's limit. */
export const discountRate = (subtotal: number, amount: number) => (subtotal > 0 ? (amount / subtotal) * 100 : 0);

/** When free cancellation ends, and what the hotel keeps if the booking is cancelled at `now`. */
export function cancellationTerms(db: HotelDB, b: Booking, now = Date.now()) {
  const arrival = hotelInstant(b.checkIn, clockMinutes(db.settings.checkInTime));
  const freeUntil = arrival - db.settings.freeCancellationHours * 3600_000;
  const free = db.settings.freeCancellationHours > 0 && now < freeUntil;
  const paid = paidOf(b);
  const fee = free ? 0 : Math.min(paid, Math.ceil((b.total * db.settings.lateCancellationFeeRate) / 100));
  return { free, freeUntil, fee, refund: Math.max(0, paid - fee) };
}

/* ───────────── rooms & availability ───────────── */

/** Booking statuses that keep their rooms off the market. */
const holdsRooms = (b: Booking) => b.status === "pending" || b.status === "confirmed" || b.status === "checked-in" || b.status === "checked-out";

/** A guest who leaves early frees the room from the day they actually left. */
export const effectiveCheckOut = (b: Booking) => {
  if (b.status !== "checked-out" || !b.checkedOutAt) return b.checkOut;
  const left = hotelDayOf(b.checkedOutAt);
  return left < b.checkOut ? (left > b.checkIn ? left : shiftDay(b.checkIn, 1)) : b.checkOut;
};

const overlaps = (b: Booking, checkIn: string, checkOut: string) => b.checkIn < checkOut && checkIn < effectiveCheckOut(b);

export const bookableUnits = (db: HotelDB, typeId: string) => db.units.filter((u) => u.typeId === typeId && !u.outOfService);

/** Rooms of a type still free for every night of the stay — the busiest night decides. */
export function freeRooms(db: HotelDB, typeId: string, checkIn: string, checkOut: string, ignoreId?: string) {
  const total = bookableUnits(db, typeId).length;
  const relevant = db.bookings.filter((b) => b.id !== ignoreId && b.roomTypeId === typeId && holdsRooms(b) && overlaps(b, checkIn, checkOut));
  let free = total;
  for (const night of stayNights(checkIn, checkOut)) {
    const booked = relevant.filter((b) => b.checkIn <= night && night < effectiveCheckOut(b)).reduce((s, b) => s + b.rooms, 0);
    free = Math.min(free, total - booked);
  }
  return Math.max(0, free);
}

/** The booking that has this physical room on a given night, if any. */
export function unitBookingOn(db: HotelDB, unitId: string, night: string, ignoreId?: string) {
  return db.bookings.find(
    (b) => b.id !== ignoreId && holdsRooms(b) && b.unitIds.includes(unitId) && b.checkIn <= night && night < effectiveCheckOut(b)
  );
}

/** Physical rooms of a type with no assigned booking over the whole stay. */
export function freeUnits(db: HotelDB, typeId: string, checkIn: string, checkOut: string, ignoreId?: string) {
  const nights = stayNights(checkIn, checkOut);
  return bookableUnits(db, typeId).filter((u) => nights.every((n) => !unitBookingOn(db, u.id, n, ignoreId)));
}

const hkRank: Record<Housekeeping, number> = { inspected: 0, clean: 1, dirty: 2 };

/** Picks free rooms for a stay: ready rooms first, then by room number. May return fewer than asked. */
export function suggestUnits(db: HotelDB, typeId: string, checkIn: string, checkOut: string, count: number, ignoreId?: string) {
  return freeUnits(db, typeId, checkIn, checkOut, ignoreId)
    .sort((a, b) => hkRank[a.housekeeping] - hkRank[b.housekeeping] || a.number.localeCompare(b.number))
    .slice(0, count)
    .map((u) => u.id);
}

export const unitNumbers = (db: HotelDB, ids: string[]) => ids.map((id) => db.units.find((u) => u.id === id)?.number ?? "—");

/** What is happening in a physical room today, for the front-desk board. */
export function unitToday(db: HotelDB, unitId: string, today = todayKey()) {
  const assigned = db.bookings.filter((b) => b.unitIds.includes(unitId));
  const occupant = assigned.find((b) => b.status === "checked-in");
  const arrival = assigned.find((b) => (b.status === "confirmed" || b.status === "pending") && b.checkIn <= today && today < b.checkOut);
  const next = assigned
    .filter((b) => (b.status === "confirmed" || b.status === "pending") && b.checkIn > today)
    .sort((a, b) => a.checkIn.localeCompare(b.checkIn))[0];
  return { occupant, arrival, next, departing: occupant && occupant.checkOut <= today ? occupant : undefined };
}

/* ───────────── website view ───────────── */

export const sitePolicies = (db: HotelDB) => [
  `Check-in from ${db.settings.checkInTime}, Check-out until ${db.settings.checkOutTime}`,
  ...(db.settings.freeCancellationHours > 0 ? [`Free cancellation up to ${db.settings.freeCancellationHours} hours before check-in`] : []),
  ...db.content.policies,
];

const siteCache = new WeakMap<HotelDB, Hotel>();

/** A room type's rating and review count, from the published guest reviews. */
export function roomRating(db: HotelDB, typeId: string) {
  const list = db.reviews.filter((r) => r.roomId === typeId && r.status === "published");
  const avg = list.length ? list.reduce((sum, r) => sum + r.rating, 0) / list.length : 0;
  return { rating: Math.round(avg * 10) / 10, reviewsCount: list.length };
}

/** The store in the shape the guest-facing components were built for. */
export function siteHotel(db: HotelDB): Hotel {
  const cached = siteCache.get(db);
  if (cached) return cached;
  const { hotel, gallery, facilities, nearby } = db.content;
  // A listing with no rooms left (every room moved to other details) has nothing to sell.
  const rooms: RoomType[] = db.roomTypes
    .filter((t) => t.active && !t.draft && db.units.some((u) => u.typeId === t.id))
    .map((t) => ({
      ...t,
      ...roomRating(db, t.id),
      totalRooms: bookableUnits(db, t.id).length,
      reservations: db.bookings
        .filter((b) => b.roomTypeId === t.id && holdsRooms(b))
        .map((b) => ({ checkIn: b.checkIn, checkOut: effectiveCheckOut(b), rooms: b.rooms })),
    }));
  const value: Hotel = {
    slug: "tripwave-hotel",
    name: hotel.name,
    location: hotel.location,
    address: hotel.address,
    phone: hotel.phone,
    rating: hotel.rating,
    reviewsCount: hotel.reviewsCount,
    description: hotel.description,
    images: gallery.filter((g) => g.visible && g.category !== "rooms").map((g) => g.src),
    amenities: facilities.map((f) => f.name),
    rooms,
    policies: sitePolicies(db),
    nearby,
    reviews: db.reviews
      .filter((r) => r.status === "published")
      .map((r) => ({ roomId: r.roomId, name: r.name, location: r.location, rating: r.rating, date: r.date, comment: r.comment, avatar: r.avatar, reply: r.reply })),
  };
  siteCache.set(db, value);
  return value;
}

export const useHotelSite = () => siteHotel(useHotelDB());

/* ───────────── notifications ───────────── */

const notice = (to: string, kind: NoticeKind, title: string, body: string, bookingId?: string): Notice => ({
  id: uid("n"),
  to,
  kind,
  title,
  body,
  bookingId,
  at: nowIso(),
  read: false,
});

/** Guest notices only go to people who can sign in to read them. */
const guestNotice = (s: HotelDB, b: Booking, kind: NoticeKind, title: string, body: string) => {
  const user = s.users.find((u) => u.id === b.userId);
  return user?.passwordHash ? [notice(user.id, kind, title, body, b.id)] : [];
};

/** Something staff did themselves: kept in the activity feed, already read, so it never pops up as an alert. */
const staffActivity = (kind: NoticeKind, title: string, body: string, bookingId?: string): Notice => ({ ...notice("staff", kind, title, body, bookingId), read: true });

const withNotices = (s: HotelDB, ...list: Notice[]) => ({ ...s, notices: [...list, ...s.notices].slice(0, 300) });

export function markNoticesRead(to: string, ids?: string[]) {
  update((s) => ({ ...s, notices: s.notices.map((n) => (n.to === to && (!ids || ids.includes(n.id)) ? { ...n, read: true } : n)) }));
}

export function deleteNotice(id: string) {
  update((s) => ({ ...s, notices: s.notices.filter((n) => n.id !== id) }));
}

/* ───────────── accounts ───────────── */

const actor = () => {
  const { staffId } = getSession();
  return getState().users.find((u) => u.id === staffId)?.name ?? "Staff";
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const normEmail = (e: string) => e.trim().toLowerCase();

export function signUp(input: { name: string; email: string; phone: string; password: string; country?: string }): Result<User> {
  const email = normEmail(input.email);
  if (!input.name.trim()) return fail("Enter your name.");
  if (!EMAIL.test(email)) return fail("Enter a valid email address.");
  if (input.password.length < 6) return fail("Password must be at least 6 characters.");
  let result: Result<User> = fail("Could not create the account.");
  update((s) => {
    const existing = s.users.find((u) => u.email === email);
    if (existing?.passwordHash) {
      result = fail("An account with this email already exists — log in instead.");
      return s;
    }
    if (existing?.status === "blocked") {
      result = fail("This email can't be used. Please contact the hotel.");
      return s;
    }
    const at = nowIso();
    // Signing up with the email used on an earlier booking claims that guest profile and its bookings.
    const user: User = {
      ...(existing ?? { id: uid("ug"), role: "guest" as const, status: "active" as const, createdAt: at }),
      name: input.name.trim(),
      email,
      phone: input.phone.trim() || existing?.phone || "",
      country: input.country ?? existing?.country,
      passwordHash: hashPassword(email, input.password),
      lastLoginAt: at,
    };
    result = { ok: true, value: user };
    const users = existing ? s.users.map((u) => (u.id === user.id ? user : u)) : [...s.users, user];
    return withNotices(
      { ...s, users },
      notice("staff", "user", "New guest account", `${user.name} (${user.email}) signed up${existing ? " and claimed earlier bookings" : ""}.`),
      notice(user.id, "user", `Welcome to ${s.content.hotel.name}!`, "Your bookings, receipts and updates will appear here.")
    );
  });
  if (result.ok) {
    const id = result.value.id;
    setSession((x) => ({ ...x, guestId: id }));
  }
  return result;
}

export function logIn(emailInput: string, password: string, scope: "guest" | "staff"): Result<User> {
  const email = normEmail(emailInput);
  const db = read() ?? getState();
  const user = db.users.find((u) => u.email === email);
  if (!user?.passwordHash || user.passwordHash !== hashPassword(email, password)) return fail("Wrong email or password.");
  if (user.status === "blocked") return fail("This account has been suspended. Please contact the hotel.");
  if (scope === "staff" && !isStaff(user.role)) return fail("This is a guest account — staff accounts only.");
  update((s) => ({ ...s, users: s.users.map((u) => (u.id === user.id ? { ...u, lastLoginAt: nowIso() } : u)) }));
  setSession((x) => (scope === "staff" ? { ...x, staffId: user.id } : { ...x, guestId: user.id }));
  return { ok: true, value: user };
}

export function logOut(scope: "guest" | "staff") {
  setSession((x) => (scope === "staff" ? { ...x, staffId: undefined } : { ...x, guestId: undefined }));
}

export function updateProfile(id: string, patch: Pick<User, "name" | "phone" | "country">): Result<User> {
  if (!patch.name.trim()) return fail("Name is required.");
  let result: Result<User> = fail("Account not found.");
  update((s) => {
    const user = s.users.find((u) => u.id === id);
    if (!user) return s;
    const next = { ...user, ...patch, name: patch.name.trim() };
    result = { ok: true, value: next };
    return { ...s, users: s.users.map((u) => (u.id === id ? next : u)) };
  });
  return result;
}

export function changePassword(id: string, current: string, next: string): Result<true> {
  const user = getState().users.find((u) => u.id === id);
  if (!user?.passwordHash || user.passwordHash !== hashPassword(user.email, current)) return fail("Current password is wrong.");
  if (next.length < 6) return fail("New password must be at least 6 characters.");
  update((s) => ({ ...s, users: s.users.map((u) => (u.id === id ? { ...u, passwordHash: hashPassword(u.email, next) } : u)) }));
  return { ok: true, value: true };
}

export type StaffInput = { id?: string; name: string; email: string; phone: string; role: StaffRole; password?: string };

export function saveStaff(input: StaffInput): Result<User> {
  const email = normEmail(input.email);
  if (!input.name.trim()) return fail("Name is required.");
  if (!EMAIL.test(email)) return fail("Enter a valid email address.");
  if (!input.id && (!input.password || input.password.length < 6)) return fail("Set a password of at least 6 characters.");
  if (input.password && input.password.length < 6) return fail("Password must be at least 6 characters.");
  let result: Result<User> = fail("Could not save.");
  update((s) => {
    if (s.users.some((u) => u.email === email && u.id !== input.id)) {
      result = fail("Another account already uses this email.");
      return s;
    }
    const existing = s.users.find((u) => u.id === input.id);
    if (existing && existing.role === "admin" && input.role !== "admin" && s.users.filter((u) => u.role === "admin" && u.status === "active").length === 1) {
      result = fail("Keep at least one active administrator.");
      return s;
    }
    const user: User = {
      ...(existing ?? { id: uid("us"), status: "active" as const, createdAt: nowIso(), passwordHash: null }),
      name: input.name.trim(),
      email,
      phone: input.phone.trim(),
      role: input.role,
      ...(input.password ? { passwordHash: hashPassword(email, input.password) } : {}),
    };
    result = { ok: true, value: user };
    return { ...s, users: existing ? s.users.map((u) => (u.id === user.id ? user : u)) : [...s.users, user] };
  });
  return result;
}

export function setUserStatus(id: string, status: User["status"]): Result<true> {
  if (id === getSession().staffId) return fail("You can't suspend your own account.");
  let result: Result<true> = { ok: true, value: true };
  update((s) => {
    const user = s.users.find((u) => u.id === id);
    if (status === "blocked" && user?.role === "admin" && s.users.filter((u) => u.role === "admin" && u.status === "active").length === 1) {
      result = fail("Keep at least one active administrator.");
      return s;
    }
    return { ...s, users: s.users.map((u) => (u.id === id ? { ...u, status } : u)) };
  });
  return result;
}

export function updateGuestProfile(id: string, patch: Partial<Pick<User, "name" | "phone" | "country" | "note">>) {
  update((s) => ({ ...s, users: s.users.map((u) => (u.id === id ? { ...u, ...patch } : u)) }));
}

const phoneDigits = (p: string) => p.replace(/\D/g, "").replace(/^880/, "0");

/** An existing guest with the same email or phone number — so staff don't create a second profile. */
export function findGuestMatch(db: HotelDB, guest: Pick<GuestInfo, "email" | "phone">, skipId?: string) {
  const email = normEmail(guest.email);
  const phone = phoneDigits(guest.phone);
  return db.users.find(
    (u) => u.role === "guest" && u.id !== skipId && ((email && u.email === email) || (phone.length >= 7 && phoneDigits(u.phone) === phone))
  );
}

/** A guest's history with the hotel, newest stay first. */
export function guestStats(db: HotelDB, userId: string) {
  const bookings = db.bookings.filter((b) => b.userId === userId).sort((a, b) => b.checkIn.localeCompare(a.checkIn));
  const stays = bookings.filter((b) => b.status === "checked-out" || b.status === "checked-in");
  return {
    bookings,
    stays: stays.length,
    nights: stays.reduce((s, b) => s + b.nights, 0),
    spent: bookings.reduce((s, b) => s + Math.max(0, paidOf(b)), 0),
    last: stays[0]?.checkIn,
    inHouse: bookings.some((b) => b.status === "checked-in"),
    upcoming: bookings.filter((b) => (b.status === "pending" || b.status === "confirmed") && b.checkIn >= todayKey()),
    noShows: bookings.filter((b) => b.status === "no-show").length,
    /** Latest ID the guest showed, to save asking again. */
    lastId: bookings.find((b) => b.guest.idNumber)?.guest,
  };
}

/** Finds the guest profile for an email (or phone), creating one if this is a first-time guest. */
function ensureGuest(s: HotelDB, guest: GuestInfo, preferId?: string): { users: User[]; user: User } {
  const byId = preferId ? s.users.find((u) => u.id === preferId) : undefined;
  if (byId) return { users: s.users, user: byId };
  const email = normEmail(guest.email);
  const phone = guest.phone.replace(/\D/g, "");
  const match = s.users.find((u) => (email && u.email === email) || (!email && phone && u.phone.replace(/\D/g, "") === phone));
  if (match) return { users: s.users, user: match };
  const user: User = {
    id: uid("ug"),
    name: guest.name,
    email,
    phone: guest.phone,
    country: guest.country,
    role: "guest",
    passwordHash: null,
    status: "active",
    createdAt: nowIso(),
  };
  return { users: [...s.users, user], user };
}

/** Bookings a guest can see: their account's, plus ones made in this browser before signing in. */
export function guestBookings(db: HotelDB, ses: Session, user?: User) {
  return db.bookings
    .filter((b) => (user && (b.userId === user.id || (user.email && b.guest.email.toLowerCase() === user.email))) || ses.bookingIds.includes(b.id))
    .sort((a, b) => b.checkIn.localeCompare(a.checkIn));
}

/* ───────────── bookings ───────────── */

const txnRef = (method: PayMethod) => {
  const code = Array.from({ length: 10 }, () => "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789"[Math.floor(Math.random() * 34)]).join("");
  return method === "card" ? `Card •••• ${Math.floor(1000 + Math.random() * 9000)} · Auth ${code.slice(0, 6)}` : `TrxID ${code}`;
};

export type OnlineBookingInput = {
  roomTypeId: string;
  checkIn: string;
  checkOut: string;
  rooms: number;
  adults: number;
  children: number;
  guest: GuestInfo;
  plan: PaymentPlan;
  method: OnlineMethod;
};

function validateStay(
  s: HotelDB,
  type: RoomTypeRecord | undefined,
  i: { checkIn: string; checkOut: string; rooms: number; adults: number; children: number },
  ignoreId?: string,
  allowPast = false,
  /** Part of a group whose adults are booked on another linked booking. */
  allowNoAdults = false
): string | null {
  if (!type) return "This room type no longer exists.";
  if (type.draft) return `${type.name || "This room"} is still a draft — finish and save it before booking.`;
  if (!allowPast && i.checkIn < todayKey()) return "Check-in can't be in the past.";
  if (nightsBetween(i.checkIn, i.checkOut) < 1) return "Check-out must be after check-in.";
  if (i.rooms < 1) return "Book at least one room.";
  if (i.adults < 1 && !allowNoAdults) return "At least one adult is required.";
  if (Math.ceil((i.adults + i.children) / i.rooms) > type.capacity) return `${type.name} sleeps up to ${type.capacity} — add a room or pick a larger room.`;
  const free = freeRooms(s, type.id, i.checkIn, i.checkOut, ignoreId);
  if (free < i.rooms) return free === 0 ? `${type.name} is fully booked for these dates.` : `Only ${free} ${type.name} ${free === 1 ? "is" : "are"} free for these dates.`;
  return null;
}

export function createOnlineBooking(input: OnlineBookingInput): Result<Booking> {
  let result: Result<Booking> = fail("Booking failed.");
  update((s) => {
    const type = s.roomTypes.find((t) => t.id === input.roomTypeId && t.active);
    const problem = validateStay(s, type, input);
    if (problem || !type) {
      result = fail(problem ?? "Room unavailable.");
      return s;
    }
    if (!s.settings.onlineMethods[input.method]) {
      result = fail("This payment method is not available right now.");
      return s;
    }
    const { guestId } = getSession();
    const { users, user } = ensureGuest(s, input.guest, guestId);
    if (user.status === "blocked") {
      result = fail("We can't take this booking online. Please call the hotel.");
      return s;
    }
    const nights = nightsBetween(input.checkIn, input.checkOut);
    const q = quoteStay(s.settings, type.price, nights, input.rooms);
    const amount = input.plan === "full" ? q.total : q.deposit;
    const at = nowIso();
    const seq = s.seq.booking + 1;
    const status: BookingStatus = s.settings.requireConfirmation ? "pending" : "confirmed";
    const unitIds = suggestUnits(s, type.id, input.checkIn, input.checkOut, input.rooms);
    const booking: Booking = {
      id: uid("bk"),
      code: `TW-${seq}`,
      userId: user.id,
      roomTypeId: type.id,
      roomName: type.name,
      rooms: input.rooms,
      unitIds,
      checkIn: input.checkIn,
      checkOut: input.checkOut,
      nights,
      adults: input.adults,
      children: input.children,
      pricePerNight: type.price,
      subtotal: q.subtotal,
      serviceFeeRate: s.settings.serviceFeeRate,
      vatRate: s.settings.vatRate,
      serviceFee: q.serviceFee,
      tax: q.tax,
      total: q.total,
      charges: [],
      payments: [{ id: uid("p"), amount, method: input.method, kind: input.plan === "full" ? "payment" : "deposit", ref: txnRef(input.method), at, by: "Guest (online)" }],
      paymentPlan: input.plan,
      guest: { ...input.guest, email: normEmail(input.guest.email) },
      status,
      source: "website",
      createdAt: at,
      updatedAt: at,
      log: [
        { at, text: "Booked on the website", by: "Guest" },
        { at, text: `Received ${money(amount)} via ${input.method} (${input.plan === "full" ? "paid in full" : `${s.settings.depositRate}% deposit`})`, by: "Guest (online)" },
        ...(status === "confirmed" ? [{ at, text: "Confirmed automatically", by: "System" }] : []),
      ],
    };
    result = { ok: true, value: booking };
    const next = { ...s, users, bookings: [...s.bookings, booking], seq: { ...s.seq, booking: seq } };
    return withNotices(
      next,
      notice(
        "staff",
        "booking",
        status === "pending" ? `New booking to confirm · ${booking.code}` : `New booking · ${booking.code}`,
        `${booking.guest.name} · ${type.name}${input.rooms > 1 ? ` ×${input.rooms}` : ""} · ${nights} night${nights > 1 ? "s" : ""} from ${input.checkIn} · ${money(amount)} paid`,
        booking.id
      ),
      ...guestNotice(
        next,
        booking,
        "booking",
        status === "pending" ? `Booking received · ${booking.code}` : `Booking confirmed · ${booking.code}`,
        status === "pending"
          ? `We've received your ${money(amount)} payment and will confirm your ${type.name} shortly.`
          : `${type.name}, ${nights} night${nights > 1 ? "s" : ""} from ${input.checkIn}. ${money(amount)} paid — see you soon!`
      )
    );
  });
  if (result.ok) {
    const id = result.value.id;
    setSession((x) => ({ ...x, bookingIds: x.guestId ? x.bookingIds : [...x.bookingIds, id] }));
  }
  return result;
}

export type StaffBookingInput = {
  roomTypeId: string;
  checkIn: string;
  checkOut: string;
  rooms: number;
  adults: number;
  children: number;
  guest: GuestInfo;
  userId?: string;
  source: Exclude<BookingSource, "website">;
  /** Negotiated or corporate rate; defaults to the room's price. */
  pricePerNight?: number;
  discount?: DiscountInput & { reason: string };
  /** Travel agent or company that made the booking. */
  agentName?: string;
  commission?: Omit<Commission, "amount">;
  unitIds?: string[];
  /** Keep only the rooms given in `unitIds`; the rest are assigned later instead of picked automatically. */
  assignLater?: boolean;
  /** Paid extras (e.g. an extra bed) added to the folio when the booking is made. */
  charges?: Pick<Charge, "category" | "description" | "amount">[];
  payment?: { amount: number; method: PayMethod; ref?: string };
  checkInNow?: boolean;
  tentative?: boolean;
  internalNote?: string;
  /** Percent for this booking; Settings when left out. */
  serviceFeeRate?: number;
  vatRate?: number;
};

/** A booking's money re-quoted for a new rate, length or room count; the discount and commission follow the new room charge. */
function requote(s: HotelDB, b: Booking, rate: number, nights: number, rooms: number) {
  const q = quoteStay(ratesFor(s.settings, b), rate, nights, rooms, b.discount);
  return {
    pricePerNight: rate,
    nights,
    subtotal: q.subtotal,
    discount: b.discount && (q.discount ? { ...b.discount, amount: q.discount } : undefined),
    commission: b.commission && {
      ...b.commission,
      amount: b.commission.kind === "percent" ? Math.round((q.net * b.commission.value) / 100) : Math.min(b.commission.value, q.net),
    },
    serviceFee: q.serviceFee,
    tax: q.tax,
    total: q.total,
  };
}

/**
 * Picking rooms of another type moves the whole booking to that type at `rate` (its rack rate by default).
 * Returns the booking as it would be, or why it can't move.
 */
function retypeForUnits(s: HotelDB, b: Booking, unitIds: string[], from: string, rate?: number): Booking | string {
  const typeIds = [...new Set(unitIds.map((id) => s.units.find((u) => u.id === id)?.typeId))];
  if (typeIds.length > 1) return "Pick rooms of one type — a booking holds a single room type.";
  const typeId = typeIds[0];
  if (!typeId || typeId === b.roomTypeId) return b;
  const type = s.roomTypes.find((t) => t.id === typeId);
  const problem = validateStay(s, type, { checkIn: from, checkOut: b.checkOut, rooms: b.rooms, adults: b.adults, children: b.children }, b.id, true, !!b.groupId);
  if (problem || !type) return problem ?? "Room unavailable.";
  const nightly = Math.max(1, Math.round(rate ?? type.price));
  return { ...b, roomTypeId: type.id, roomName: type.name, ...requote(s, b, nightly, b.nights, b.rooms) };
}

/** Log text for a room change that also moved the booking to another type. */
const retypeNote = (before: Booking, after: Booking) =>
  after.roomTypeId === before.roomTypeId ? "" : ` — now ${after.roomName} at ${money(after.pricePerNight)}/night (total ${money(before.total)} → ${money(after.total)})`;

function validateUnits(s: HotelDB, typeId: string, unitIds: string[], checkIn: string, checkOut: string, ignoreId?: string): string | null {
  for (const id of unitIds) {
    const u = s.units.find((x) => x.id === id);
    if (!u) return "Unknown room.";
    if (u.typeId !== typeId) return `Room ${u.number} is a different room type.`;
    if (u.outOfService) return `Room ${u.number} is out of service.`;
    const clash = stayNights(checkIn, checkOut)
      .map((n) => unitBookingOn(s, id, n, ignoreId))
      .find(Boolean);
    if (clash) return `Room ${u.number} is taken by ${clash.code} (${clash.guest.name}).`;
  }
  return null;
}

/** Adds one staff booking to `s`, or explains why it can't be made. */
function addStaffBooking(s: HotelDB, input: StaffBookingInput, groupId?: string): string | { state: HotelDB; booking: Booking } {
  const type = s.roomTypes.find((t) => t.id === input.roomTypeId);
  const problem = validateStay(s, type, input, undefined, false, !!groupId);
  if (problem || !type) {
    return problem ?? "Room unavailable.";
  }
  if (!input.guest.name.trim()) {
    return "Guest name is required.";
  }
  if (!input.guest.phone.trim() && !input.guest.email.trim()) {
    return "Add a phone number or email for the guest.";
  }
  const today = todayKey();
  if (input.checkInNow && input.checkIn !== today) {
    return "Only a stay starting today can be checked in now.";
  }
  // Rooms picked by hand are kept; any still missing are filled with the best free ones unless they're for later.
  const given = (input.unitIds ?? []).slice(0, input.rooms);
  const chosen = input.assignLater
    ? given
    : [
        ...given,
        ...suggestUnits(s, type.id, input.checkIn, input.checkOut, input.rooms)
          .filter((u) => !given.includes(u))
          .slice(0, input.rooms - given.length),
      ];
  const unitProblem = validateUnits(s, type.id, chosen, input.checkIn, input.checkOut);
  if (unitProblem) {
    return unitProblem;
  }
  if (input.checkInNow && chosen.length < input.rooms) {
    return "Assign a room for every room booked before checking in.";
  }
  const by = actor();
  const { users, user } = ensureGuest(s, input.guest, input.userId);
  const nights = nightsBetween(input.checkIn, input.checkOut);
  const rate = input.pricePerNight && input.pricePerNight > 0 ? Math.round(input.pricePerNight) : type.price;
  const rates = ratesFor(s.settings, input);
  const q = quoteStay(rates, rate, nights, input.rooms, input.discount);
  let discount: StayDiscount | undefined;
  if (q.discount > 0 && input.discount) {
    const reason = input.discount.reason.trim();
    if (!reason) {
      return "Give a reason for the discount.";
    }
    const limit = discountLimit(s.users.find((u) => u.id === getSession().staffId)?.role);
    // ৳1 slack: a flat discount split over linked bookings rounds each share.
    if (q.discount > Math.round((q.subtotal * limit) / 100) + 1) {
      return `Your discount limit is ${limit}% of the room charge — ask a manager for more.`;
    }
    discount = { kind: input.discount.kind, value: input.discount.value, amount: q.discount, reason, by };
  }
  const commission: Commission | undefined =
    input.commission && input.commission.value > 0 && input.commission.name.trim()
      ? {
          ...input.commission,
          name: input.commission.name.trim(),
          phone: input.commission.phone?.trim() || undefined,
          amount: input.commission.kind === "percent" ? Math.round((q.net * Math.min(input.commission.value, 100)) / 100) : Math.min(Math.round(input.commission.value), q.net),
        }
      : undefined;
  const at = nowIso();
  const charges: Charge[] = (input.charges ?? [])
    .filter((c) => c.amount > 0)
    .map((c) => ({ id: uid("c"), category: c.category, description: c.description, amount: Math.round(c.amount), at, by }));
  const extras = charges.reduce((sum, c) => sum + c.amount, 0);
  const pay = input.payment && input.payment.amount > 0 ? Math.min(Math.round(input.payment.amount), q.total + extras) : 0;
  const seq = s.seq.booking + 1;
  const status: BookingStatus = input.checkInNow ? "checked-in" : input.tentative ? "pending" : "confirmed";
  const numbers = unitNumbers(s, chosen).join(", ");
  const booking: Booking = {
    id: uid("bk"),
    code: `TW-${seq}`,
    userId: user.id,
    groupId,
    roomTypeId: type.id,
    roomName: type.name,
    rooms: input.rooms,
    unitIds: chosen,
    checkIn: input.checkIn,
    checkOut: input.checkOut,
    nights,
    adults: input.adults,
    children: input.children,
    pricePerNight: rate,
    subtotal: q.subtotal,
    discount,
    commission,
    serviceFeeRate: rates.serviceFeeRate,
    vatRate: rates.vatRate,
    serviceFee: q.serviceFee,
    tax: q.tax,
    total: q.total,
    charges,
    payments: pay ? [{ id: uid("p"), amount: pay, method: input.payment!.method, kind: input.checkInNow ? "payment" : "deposit", ref: input.payment!.ref || undefined, at, by }] : [],
    guest: { ...input.guest, email: normEmail(input.guest.email) },
    status,
    source: input.source,
    internalNote: [input.agentName?.trim() && `Agent: ${input.agentName.trim()}`, input.internalNote?.trim()].filter(Boolean).join("\n") || undefined,
    createdAt: at,
    updatedAt: at,
    checkedInAt: input.checkInNow ? at : undefined,
    log: [
      { at, text: `Booking taken (${input.source}${input.agentName?.trim() ? ` · ${input.agentName.trim()}` : ""})${rate !== type.price ? ` at ${money(rate)}/night` : ""}`, by },
      ...(discount ? [{ at, text: `Discount ${discount.kind === "percent" ? `${discount.value}% ` : ""}${money(discount.amount)} — ${discount.reason}`, by }] : []),
      ...(commission ? [{ at, text: `Commission ${money(commission.amount)} to ${commission.name} (${commission.to})`, by }] : []),
      ...charges.map((c) => ({ at, text: `Charge ${money(c.amount)} — ${c.description}`, by })),
      ...(pay ? [{ at, text: `Received ${money(pay)} via ${input.payment!.method}`, by }] : []),
      ...(input.checkInNow ? [{ at, text: `Checked in to room ${numbers}`, by }] : []),
    ],
  };
  const next = { ...s, users, bookings: [...s.bookings, booking], seq: { ...s.seq, booking: seq } };
  return {
    booking,
    state: withNotices(
      next,
      staffActivity(
        "booking",
        `New booking · ${booking.code}`,
        `${booking.guest.name} · ${type.name}${input.rooms > 1 ? ` ×${input.rooms}` : ""} · ${nights} night${nights > 1 ? "s" : ""} from ${dateLabel(input.checkIn, "d MMM")} · ${sourceLabels[input.source]}, taken by ${by}`,
        booking.id
      ),
      ...guestNotice(next, booking, "booking", `Booking confirmed · ${booking.code}`, `${type.name}, ${nights} night${nights > 1 ? "s" : ""} from ${input.checkIn}.`)
    ),
  };
}

export function createStaffBooking(input: StaffBookingInput): Result<Booking> {
  const r = createStaffBookings([input]);
  return r.ok ? { ok: true, value: r.value[0] } : r;
}

/**
 * Several room types for one guest, made together: one linked booking per room type, sharing a `groupId`.
 * All or nothing — if any part can't be booked, none are.
 */
export function createStaffBookings(inputs: StaffBookingInput[]): Result<Booking[]> {
  let result: Result<Booking[]> = fail("Booking failed.");
  if (!inputs.length) return fail("Pick at least one room.");
  update((s) => {
    const groupId = inputs.length > 1 ? uid("grp") : undefined;
    let state = s;
    const made: Booking[] = [];
    for (const input of inputs) {
      // Later parts reuse the guest profile the first part found or created.
      const out = addStaffBooking(state, made.length ? { ...input, userId: made[0].userId } : input, groupId);
      if (typeof out === "string") {
        result = fail(inputs.length > 1 ? `${s.roomTypes.find((t) => t.id === input.roomTypeId)?.name ?? "Room"}: ${out}` : out);
        return s;
      }
      state = out.state;
      made.push(out.booking);
    }
    result = { ok: true, value: made };
    return state;
  });
  return result;
}

/** Other bookings made together with this one. */
export const groupOf = (db: HotelDB, b: Booking) => (b.groupId ? db.bookings.filter((x) => x.groupId === b.groupId && x.id !== b.id) : []);

function patchBooking(id: string, fn: (b: Booking, s: HotelDB) => Booking | string, extra?: (b: Booking, s: HotelDB) => Partial<HotelDB> | Notice[]): Result<Booking> {
  let result: Result<Booking> = fail("Booking not found.");
  update((s) => {
    const b = s.bookings.find((x) => x.id === id);
    if (!b) return s;
    const out = fn(b, s);
    if (typeof out === "string") {
      result = fail(out);
      return s;
    }
    const next = { ...out, updatedAt: nowIso() };
    result = { ok: true, value: next };
    let ns: HotelDB = { ...s, bookings: s.bookings.map((x) => (x.id === id ? next : x)) };
    const more = extra?.(next, ns);
    if (Array.isArray(more)) ns = withNotices(ns, ...more);
    else if (more) ns = { ...ns, ...more };
    return ns;
  });
  return result;
}

const logged = (b: Booking, text: string, by = actor()) => [...b.log, { at: nowIso(), text, by }];

export function confirmBooking(id: string) {
  return patchBooking(
    id,
    (b) => (b.status !== "pending" ? "Only bookings awaiting confirmation can be confirmed." : { ...b, status: "confirmed", log: logged(b, "Confirmed") }),
    (b, s) => guestNotice(s, b, "booking", `Booking confirmed · ${b.code}`, `Your ${b.roomName} from ${b.checkIn} is confirmed. See you soon!`)
  );
}

/** `rate` is the nightly rate to charge if the rooms picked are of another type. */
export function checkInBooking(id: string, unitIds?: string[], rate?: number) {
  return patchBooking(
    id,
    (b, s) => {
      if (b.status !== "confirmed" && b.status !== "pending") return "Only confirmed bookings can be checked in.";
      const today = todayKey();
      if (b.checkIn > today) return `This stay starts ${b.checkIn} — change the dates for an early arrival.`;
      if (b.checkOut <= today) return "This stay has already ended — mark it as a no-show or change the dates.";
      const ids = unitIds ?? b.unitIds;
      if (ids.length < b.rooms) return `Assign ${b.rooms} room${b.rooms > 1 ? "s" : ""} before check-in.`;
      const next = retypeForUnits(s, b, ids, today, rate);
      if (typeof next === "string") return next;
      const problem = validateUnits(s, next.roomTypeId, ids, today, b.checkOut, b.id);
      if (problem) return problem;
      const occupied = ids.map((unitId) => s.bookings.find((x) => x.id !== b.id && x.status === "checked-in" && x.unitIds.includes(unitId))).find(Boolean);
      if (occupied) return `${occupied.guest.name} (${occupied.code}) hasn't checked out of that room yet.`;
      return { ...next, unitIds: ids, status: "checked-in", checkedInAt: nowIso(), log: logged(b, `Checked in to room ${unitNumbers(s, ids).join(", ")}${retypeNote(b, next)}`) };
    },
    (b, s) =>
      guestNotice(s, b, "checkin", `Welcome! You're in room ${unitNumbers(s, b.unitIds).join(", ")}`, `Check-out is ${b.checkOut} by ${s.settings.checkOutTime}. Dial 0 for the front desk any time.`)
  );
}

export function checkOutBooking(id: string, opts: { allowDue?: boolean } = {}) {
  return patchBooking(
    id,
    (b) => {
      if (b.status !== "checked-in") return "Only in-house guests can be checked out.";
      const due = dueOf(b);
      if (due > 0 && !opts.allowDue) return `Balance of ${money(due)} is still due — collect it first.`;
      return { ...b, status: "checked-out", checkedOutAt: nowIso(), log: logged(b, due > 0 ? `Checked out with ${money(due)} unpaid` : "Checked out") };
    },
    (b, s) => {
      const units = s.units.map((u) => (b.unitIds.includes(u.id) ? { ...u, housekeeping: "dirty" as const } : u));
      const notices = guestNotice(s, b, "checkout", `Thanks for staying with us, ${b.guest.name.split(" ")[0]}!`, `Your receipt for ${b.code} is in My bookings. We'd love a quick review of the ${b.roomName}.`);
      return { units, notices: [...notices, ...s.notices] };
    }
  );
}

export function cancelBooking(id: string, opts: { reason: string; fee?: number; byGuest?: boolean }) {
  return patchBooking(
    id,
    (b, s) => {
      if (b.status !== "pending" && b.status !== "confirmed") return "Only upcoming bookings can be cancelled.";
      const terms = cancellationTerms(s, b);
      const fee = Math.max(0, Math.min(paidOf(b), Math.round(opts.fee ?? terms.fee)));
      return {
        ...b,
        status: "cancelled",
        cancellationFee: fee,
        cancelReason: opts.reason || "Cancelled",
        log: logged(b, `Cancelled — ${opts.reason || "no reason given"}${fee ? ` (fee ${money(fee)} kept)` : ""}`, opts.byGuest ? "Guest" : actor()),
      };
    },
    (b, s) => {
      const refund = creditOf(b);
      return [
        opts.byGuest
          ? notice("staff", "cancel", `Cancelled by guest · ${b.code}`, `${b.guest.name} cancelled ${b.roomName} (${b.checkIn}).${refund ? ` Refund due: ${money(refund)}.` : ""}`, b.id)
          : staffActivity("cancel", `Booking cancelled · ${b.code}`, `${b.guest.name} · ${b.roomName}, ${dateLabel(b.checkIn, "d MMM")} — ${b.cancelReason}.${refund ? ` Refund due: ${money(refund)}.` : ""}`, b.id),
        ...guestNotice(s, b, "cancel", `Booking cancelled · ${b.code}`, refund ? `A refund of ${money(refund)} will be sent to your original payment method.` : "No payment was due back for this booking."),
      ];
    }
  );
}

/**
 * Takes one room off a booking that has several, before check-in. The booking is re-priced for the rooms left;
 * `unitId` names the room (none = one not assigned yet) and any fee goes on the folio.
 */
export function cancelRoom(id: string, opts: { unitId?: string; reason: string; fee?: number; adults: number; children: number }) {
  return patchBooking(id, (b, s) => {
    if (b.status !== "pending" && b.status !== "confirmed") return "Rooms can only be cancelled before check-in.";
    if (b.rooms < 2) return "This is the booking's only room — cancel the booking instead.";
    if (opts.unitId && !b.unitIds.includes(opts.unitId)) return "That room isn't on this booking.";
    if (!opts.unitId && b.unitIds.length >= b.rooms) return "Pick which room to cancel.";
    const rooms = b.rooms - 1;
    const type = s.roomTypes.find((t) => t.id === b.roomTypeId);
    const problem = validateStay(s, type, { checkIn: b.checkIn, checkOut: b.checkOut, rooms, adults: opts.adults, children: opts.children }, b.id, true, !!b.groupId);
    if (problem) return problem;
    const unitIds = opts.unitId ? b.unitIds.filter((u) => u !== opts.unitId) : b.unitIds;
    const label = opts.unitId ? `Room ${unitNumbers(s, [opts.unitId])[0]}` : "An unassigned room";
    const fee = Math.max(0, Math.round(opts.fee ?? 0));
    const by = actor();
    const charges = fee
      ? [...b.charges, { id: uid("c"), category: "other" as const, description: `Cancellation fee — ${label.toLowerCase()}`, amount: fee, at: nowIso(), by }]
      : b.charges;
    const reason = opts.reason.trim() || "Cancelled by hotel";
    return {
      ...b,
      ...requote(s, b, b.pricePerNight, b.nights, rooms),
      rooms,
      unitIds,
      adults: opts.adults,
      children: opts.children,
      charges,
      log: logged(b, `${label} cancelled — ${reason}${fee ? ` (fee ${money(fee)})` : ""}`),
    };
  });
}

export function cancelOwnBooking(id: string): Result<Booking> {
  const db = read() ?? getState();
  const ses = getSession();
  const user = db.users.find((u) => u.id === ses.guestId);
  const b = db.bookings.find((x) => x.id === id);
  if (!b || !guestBookings(db, ses, user).some((x) => x.id === id)) return fail("Booking not found.");
  return cancelBooking(id, { reason: "Cancelled by guest online", byGuest: true });
}

export function markNoShow(id: string) {
  return patchBooking(id, (b, s) => {
    if (b.status !== "confirmed" && b.status !== "pending") return "Only bookings that haven't arrived can be marked no-show.";
    if (b.checkIn > todayKey()) return "The guest isn't due yet.";
    const fee = Math.min(paidOf(b), Math.ceil((b.total * s.settings.lateCancellationFeeRate) / 100));
    return { ...b, status: "no-show", cancellationFee: fee, cancelReason: "Guest did not arrive", log: logged(b, `Marked as no-show${fee ? ` (fee ${money(fee)} kept)` : ""}`) };
  });
}

/** `rate` is the nightly rate to charge if the rooms picked are of another type. */
export function assignUnits(id: string, unitIds: string[], rate?: number) {
  return patchBooking(id, (b, s) => {
    if (!isLive(b) || b.status === "checked-out") return "Rooms can only be changed on upcoming or in-house bookings.";
    if (unitIds.length > b.rooms) return `This booking has ${b.rooms} room${b.rooms > 1 ? "s" : ""}.`;
    const from = b.status === "checked-in" ? todayKey() : b.checkIn;
    const next = retypeForUnits(s, b, unitIds, from, rate);
    if (typeof next === "string") return next;
    const problem = validateUnits(s, next.roomTypeId, unitIds, from, b.checkOut, b.id);
    if (problem) return problem;
    const text = unitIds.length ? `${b.status === "checked-in" ? "Moved to" : "Assigned"} room ${unitNumbers(s, unitIds).join(", ")}` : "Rooms unassigned";
    return { ...next, unitIds, log: logged(b, text + retypeNote(b, next)) };
  });
}

export type StayChange = { checkIn: string; checkOut: string; roomTypeId: string; rooms: number; adults: number; children: number; pricePerNight: number };

/** Change dates, room type or party size; re-prices the room charge and keeps rooms that still fit. */
export function changeStay(id: string, change: StayChange) {
  return patchBooking(id, (b, s) => {
    if (b.status !== "pending" && b.status !== "confirmed" && b.status !== "checked-in") return "This booking can no longer be changed.";
    if (b.status === "checked-in" && (change.checkIn !== b.checkIn || change.roomTypeId !== b.roomTypeId || change.rooms !== b.rooms))
      return "For in-house guests only the check-out date and party can change. Use Move room to switch rooms.";
    const type = s.roomTypes.find((t) => t.id === change.roomTypeId);
    const problem = validateStay(s, type, change, b.id, b.status === "checked-in", !!b.groupId);
    if (problem || !type) return problem ?? "Room unavailable.";
    const nights = nightsBetween(change.checkIn, change.checkOut);
    const priced = requote(s, b, Math.max(1, Math.round(change.pricePerNight)), nights, change.rooms);
    const keep =
      change.roomTypeId === b.roomTypeId
        ? b.unitIds.filter((unitId) => !validateUnits(s, type.id, [unitId], b.status === "checked-in" ? todayKey() : change.checkIn, change.checkOut, b.id)).slice(0, change.rooms)
        : [];
    if (b.status === "checked-in" && keep.length < b.unitIds.length) return "The guest's room is booked by someone else for the new dates.";
    const extra = suggestUnits(s, type.id, change.checkIn, change.checkOut, change.rooms - keep.length, b.id).filter((u) => !keep.includes(u));
    const unitIds = b.status === "pending" || b.status === "confirmed" ? [...keep, ...extra] : keep;
    return {
      ...b,
      ...change,
      ...priced,
      roomName: type.name,
      unitIds,
      log: logged(b, `Stay changed to ${type.name}${change.rooms > 1 ? ` ×${change.rooms}` : ""}, ${change.checkIn} → ${change.checkOut} (${money(priced.total)})`),
    };
  });
}

export function updateBookingGuest(id: string, guest: GuestInfo) {
  return patchBooking(id, (b) => (!guest.name.trim() ? "Guest name is required." : { ...b, guest, log: logged(b, "Guest details updated") }));
}

export function setInternalNote(id: string, internalNote: string) {
  return patchBooking(id, (b) => ({ ...b, internalNote }));
}

/* ───────────── folio: payments & charges ───────────── */

export type PaymentInput = { amount: number; method: PayMethod; kind: PaymentKind; ref?: string; note?: string };

export function addPayment(id: string, input: PaymentInput) {
  return patchBooking(
    id,
    (b) => {
      const amount = Math.round(input.amount);
      if (!(amount > 0)) return "Enter an amount above zero.";
      if (input.kind === "refund") {
        if (amount > paidOf(b)) return `Only ${money(paidOf(b))} has been paid on this booking.`;
      } else {
        if (!isLive(b)) return "This booking is closed — record refunds only.";
        if (amount > dueOf(b)) return dueOf(b) ? `Balance due is ${money(dueOf(b))}.` : "Nothing is due on this booking.";
      }
      const by = actor();
      const payment: Payment = { id: uid("p"), amount, method: input.method, kind: input.kind, ref: input.ref?.trim() || undefined, note: input.note?.trim() || undefined, at: nowIso(), by };
      return { ...b, payments: [...b.payments, payment], log: logged(b, `${input.kind === "refund" ? "Refunded" : "Received"} ${money(amount)} via ${input.method}`, by) };
    },
    (b, s) => {
      const p = b.payments[b.payments.length - 1];
      return [
        ...(p.kind === "refund" ? [] : [staffActivity("payment", `Payment received · ${b.code}`, `${money(p.amount)} via ${payLabels[p.method]} from ${b.guest.name}`, b.id)]),
        ...guestNotice(
          s,
          b,
          "payment",
          p.kind === "refund" ? `Refund sent · ${b.code}` : `Payment received · ${b.code}`,
          p.kind === "refund" ? `${money(p.amount)} has been refunded to your ${p.method} account.` : `Thank you — ${money(p.amount)} received by ${p.method}. Balance: ${money(dueOf(b))}.`
        ),
      ];
    }
  );
}

export function voidPayment(bookingId: string, paymentId: string, reason: string) {
  return patchBooking(bookingId, (b) => {
    const p = b.payments.find((x) => x.id === paymentId);
    if (!p || p.void) return "Payment not found.";
    if (!reason.trim()) return "Give a reason for voiding the payment.";
    const by = actor();
    return {
      ...b,
      payments: b.payments.map((x) => (x.id === paymentId ? { ...x, void: { at: nowIso(), by, reason: reason.trim() } } : x)),
      log: logged(b, `Voided ${money(p.amount)} ${p.kind} — ${reason.trim()}`, by),
    };
  });
}

export function addCharge(id: string, input: Pick<Charge, "category" | "description" | "amount">) {
  return patchBooking(id, (b) => {
    if (!isLive(b)) return "This booking is closed.";
    const amount = Math.round(Math.abs(input.amount)) * (input.category === "discount" ? -1 : 1);
    if (!amount) return "Enter an amount.";
    if (input.category === "discount" && -amount > folioTotal(b)) return "Discount is larger than the bill.";
    const by = actor();
    const charge: Charge = { id: uid("c"), category: input.category, description: input.description.trim() || input.category, amount, at: nowIso(), by };
    return { ...b, charges: [...b.charges, charge], log: logged(b, `${amount < 0 ? "Discount" : "Charge"} ${money(Math.abs(amount))} — ${charge.description}`, by) };
  });
}

export function removeCharge(id: string, chargeId: string) {
  return patchBooking(id, (b) => {
    const c = b.charges.find((x) => x.id === chargeId);
    if (!c) return "Charge not found.";
    return { ...b, charges: b.charges.filter((x) => x.id !== chargeId), log: logged(b, `Removed ${c.description} (${money(c.amount)})`) };
  });
}

/* ───────────── room types & rooms ───────────── */

export function saveRoomType(type: RoomTypeRecord): Result<RoomTypeRecord> {
  if (type.draft) {
    update((s) => ({ ...s, roomTypes: s.roomTypes.some((t) => t.id === type.id) ? s.roomTypes.map((t) => (t.id === type.id ? type : t)) : [...s.roomTypes, type] }));
    return { ok: true, value: type };
  }
  if (!type.name.trim()) return fail("Name is required.");
  if (!(type.price > 0)) return fail("Set a nightly price.");
  if (!(type.capacity > 0)) return fail("Set how many guests the room sleeps.");
  if (!type.images.length) return fail("Add at least one photo.");
  update((s) => ({
    ...s,
    roomTypes: s.roomTypes.some((t) => t.id === type.id) ? s.roomTypes.map((t) => (t.id === type.id ? type : t)) : [...s.roomTypes, type],
  }));
  return { ok: true, value: type };
}

export const newRoomTypeId = (db: HotelDB, name: string) => {
  const base = slugify(name) || "room";
  let id = base;
  for (let i = 2; db.roomTypes.some((t) => t.id === id); i++) id = `${base}-${i}`;
  return id;
};

export function deleteRoomType(id: string): Result<true> {
  const db = read() ?? getState();
  if (db.bookings.some((b) => b.roomTypeId === id)) return fail("This room type has bookings — hide it from the website instead.");
  update((s) => ({ ...s, roomTypes: s.roomTypes.filter((t) => t.id !== id), units: s.units.filter((u) => u.typeId !== id) }));
  return { ok: true, value: true };
}

export function saveUnit(unit: RoomUnit): Result<RoomUnit> {
  const number = unit.number.trim();
  if (!number) return fail("Room number is required.");
  let result: Result<RoomUnit> = fail("Could not save.");
  update((s) => {
    if (s.units.some((u) => u.number === number && u.id !== unit.id)) {
      result = fail(`Room ${number} already exists.`);
      return s;
    }
    const existing = s.units.find((u) => u.id === unit.id);
    if (existing && existing.typeId !== unit.typeId && s.bookings.some((b) => holdsRooms(b) && b.status !== "checked-out" && b.unitIds.includes(unit.id))) {
      result = fail(`Room ${number} has upcoming bookings — reassign them before changing its type.`);
      return s;
    }
    const next = { ...unit, number, floor: Number(unit.floor) || 0 };
    result = { ok: true, value: next };
    return { ...s, units: existing ? s.units.map((u) => (u.id === unit.id ? next : u)) : [...s.units, next].sort((a, b) => a.number.localeCompare(b.number, undefined, { numeric: true })) };
  });
  return result;
}

export const newUnitId = () => uid("u");

export function deleteUnit(id: string): Result<true> {
  const db = read() ?? getState();
  const busy = db.bookings.find((b) => (b.status === "pending" || b.status === "confirmed" || b.status === "checked-in") && b.unitIds.includes(id));
  if (busy) return fail(`Assigned to ${busy.code} (${busy.guest.name}) — move that booking first.`);
  update((s) => ({ ...s, units: s.units.filter((u) => u.id !== id) }));
  return { ok: true, value: true };
}

export function setHousekeeping(unitId: string, housekeeping: Housekeeping) {
  update((s) => ({ ...s, units: s.units.map((u) => (u.id === unitId ? { ...u, housekeeping } : u)) }));
}

/* ───────────── content, gallery, reviews, settings ───────────── */

export function saveContent(patch: Partial<Content>) {
  update((s) => ({ ...s, content: { ...s.content, ...patch } }));
}

export function addGalleryImage(image: Omit<GalleryImage, "id">) {
  update((s) => ({ ...s, content: { ...s.content, gallery: [{ ...image, id: uid("g") }, ...s.content.gallery] } }));
}

export function updateGalleryImage(id: string, patch: Partial<GalleryImage>) {
  update((s) => ({ ...s, content: { ...s.content, gallery: s.content.gallery.map((g) => (g.id === id ? { ...g, ...patch } : g)) } }));
}

export function removeGalleryImage(id: string) {
  update((s) => ({ ...s, content: { ...s.content, gallery: s.content.gallery.filter((g) => g.id !== id) } }));
}

export function moveGalleryImage(id: string, dir: -1 | 1) {
  update((s) => {
    const list = [...s.content.gallery];
    const i = list.findIndex((g) => g.id === id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= list.length) return s;
    [list[i], list[j]] = [list[j], list[i]];
    return { ...s, content: { ...s.content, gallery: list } };
  });
}

/** Guests can review a stay once they've checked out. */
export function submitReview(bookingId: string, rating: number, comment: string): Result<Review> {
  if (rating < 1 || rating > 5) return fail("Pick a rating from 1 to 5 stars.");
  if (comment.trim().length < 10) return fail("Tell us a little more (at least 10 characters).");
  let result: Result<Review> = fail("Booking not found.");
  update((s) => {
    const ses = getSession();
    const user = s.users.find((u) => u.id === ses.guestId);
    const b = guestBookings(s, ses, user).find((x) => x.id === bookingId);
    if (!b) return s;
    if (b.status !== "checked-out") {
      result = fail("You can review a stay after checking out.");
      return s;
    }
    if (s.reviews.some((r) => r.bookingId === bookingId)) {
      result = fail("You've already reviewed this stay.");
      return s;
    }
    const review: Review = {
      id: uid("rv"),
      roomId: b.roomTypeId,
      name: b.guest.name.replace(/^(Mr|Ms|Mrs|Dr)\.?\s+/i, ""),
      location: b.guest.country ?? "",
      rating,
      date: todayKey(),
      comment: comment.trim(),
      status: "pending",
      bookingId,
      userId: b.userId,
    };
    result = { ok: true, value: review };
    return withNotices(
      { ...s, reviews: [review, ...s.reviews] },
      notice("staff", "review", `New ${rating}★ review to approve`, `${review.name} on ${b.roomName}: “${review.comment.slice(0, 80)}${review.comment.length > 80 ? "…" : ""}”`, b.id)
    );
  });
  return result;
}

export function setReviewStatus(id: string, status: ReviewStatus) {
  update((s) => {
    const r = s.reviews.find((x) => x.id === id);
    if (!r) return s;
    const ns = { ...s, reviews: s.reviews.map((x) => (x.id === id ? { ...x, status } : x)) };
    const user = s.users.find((u) => u.id === r.userId);
    return status === "published" && r.status !== "published" && user?.passwordHash
      ? withNotices(ns, notice(user.id, "review", "Your review is live", "Thanks for sharing your stay — other guests can now read it.", r.bookingId))
      : ns;
  });
}

export function saveReview(review: Review) {
  update((s) => ({ ...s, reviews: s.reviews.some((r) => r.id === review.id) ? s.reviews.map((r) => (r.id === review.id ? review : r)) : [review, ...s.reviews] }));
}

export const newReviewId = () => uid("rv");

export function deleteReview(id: string) {
  update((s) => ({ ...s, reviews: s.reviews.filter((r) => r.id !== id) }));
}

export function saveSettings(settings: Settings) {
  update((s) => ({ ...s, settings }));
}
