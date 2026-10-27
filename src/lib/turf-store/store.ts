"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { addDays, slotTime, todayYmd } from "./format";
import { createSeed, DB_VERSION, staticState } from "./seed";
import type { Block, Booking, BookingStatus, Court, GalleryImage, Hold, PayMethod, Payment, Phase, Settings, SiteContent, TurfDB } from "./types";

/**
 * Demo backend for TurfHub: one JSON document in localStorage shared by the booking site and the
 * admin panel. Every write re-reads the latest copy first and other tabs pick changes up through
 * the `storage` event — so a slot held or booked in one tab disappears from every other tab live.
 */
const KEY = "turfhub:db";

let state: TurfDB | null = null;
const listeners = new Set<() => void>();

function read(): TurfDB | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as TurfDB;
    return parsed.version === DB_VERSION && parsed.seeded ? parsed : null;
  } catch {
    return null;
  }
}

function persist(next: TurfDB) {
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Storage full or blocked — keep working in memory.
  }
}

function load(): TurfDB {
  const existing = read();
  if (existing) return existing;
  const fresh = createSeed();
  persist(fresh);
  return fresh;
}

function getState(): TurfDB {
  if (typeof window === "undefined") return staticState;
  if (!state) state = load();
  return state;
}

function emit() {
  listeners.forEach((l) => l());
}

function onStorage(e: StorageEvent) {
  if (e.key !== KEY) return;
  state = read() ?? load();
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

function update(fn: (s: TurfDB) => TurfDB) {
  // Start from what is on disk, not our cached copy: another tab may have written a moment ago
  // and its storage event has not reached us yet.
  const base = read() ?? getState();
  const now = Date.now();
  state = fn({ ...base, holds: base.holds.filter((h) => h.expiresAt > now) });
  persist(state);
  emit();
}

export function useTurfDB(): TurfDB {
  return useSyncExternalStore(subscribe, getState, () => staticState);
}

const noop = () => () => {};
export function useHydrated() {
  return useSyncExternalStore(noop, () => true, () => false);
}

/** Current time, re-rendering every `ms`. Returns 0 on the server so markup stays stable. */
export function useNow(ms = 15_000) {
  const hydrated = useHydrated();
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(t);
  }, [ms]);
  return hydrated ? now : 0;
}

/** Stable per-tab id, so a customer's own hold is shown as "your selection" and not as taken. */
export function getClientId() {
  if (typeof window === "undefined") return "";
  try {
    let id = sessionStorage.getItem("turfhub:client");
    if (!id) {
      id = uid("cl");
      sessionStorage.setItem("turfhub:client", id);
    }
    return id;
  } catch {
    return "anon";
  }
}

export function resetDemoData() {
  state = createSeed();
  persist(state);
  emit();
}

const uid = (p: string) => `${p}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
const nowIso = () => new Date().toISOString();

/* ───────────── selectors ───────────── */

export const priceAt = (court: Court, hour: number, settings: Settings) =>
  hour >= settings.peakStartHour ? court.peakPrice : court.price;

export function quote(court: Court, startHour: number, duration: number, settings: Settings) {
  let total = 0;
  for (let h = startHour; h < startHour + duration; h++) total += priceAt(court, h, settings);
  const advance = Math.ceil((total * settings.advancePercent) / 100 / 10) * 10;
  return { total, advance };
}

export const paidOf = (b: Booking) => b.payments.reduce((s, p) => s + (p.kind === "refund" ? -p.amount : p.amount), 0);
export const dueOf = (b: Booking) => (b.status === "cancelled" ? 0 : Math.max(0, b.total - paidOf(b)));

/**
 * Money owed back to the customer: what a cancelled booking still holds (unless the venue kept it), or an
 * overpayment. Refunds are only given before kick-off — once the game's start time passes, nothing is owed.
 */
export const creditOf = (b: Booking, now: number) => {
  if (startMs(b) <= now) return 0;
  return b.status === "cancelled" ? (b.refundWaived ? 0 : Math.max(0, paidOf(b))) : Math.max(0, paidOf(b) - b.total);
};
export const refundedOf = (b: Booking) => b.payments.reduce((s, p) => s + (p.kind === "refund" ? p.amount : 0), 0);

/** Refund state of a cancelled booking, for the customer and the desk. */
export function refundState(b: Booking, now: number): { kind: "owed" | "refunded" | "kept" | "none"; amount: number } {
  const owed = creditOf(b, now);
  if (owed > 0) return { kind: "owed", amount: owed };
  const back = refundedOf(b);
  if (back > 0) return { kind: "refunded", amount: back };
  // Kept on purpose, or the refund window closed at kick-off.
  return paidOf(b) > 0 ? { kind: "kept", amount: paidOf(b) } : { kind: "none", amount: 0 };
}

/** Whether cancelling now is inside the free-cancellation window from Settings (full refund by default). */
export const freeToCancel = (b: Booking, settings: Settings, now: number) => startMs(b) - now >= settings.cancelCutoffHours * 3600_000;

/** Cancelled bookings free their slot; everything else keeps it. */
export const occupies = (b: Booking) => b.status !== "cancelled";

export const startMs = (b: Pick<Booking, "date" | "startHour">) => slotTime(b.date, b.startHour);
export const endMs = (b: Pick<Booking, "date" | "startHour" | "duration">) => slotTime(b.date, b.startHour + b.duration);

export function phaseOf(b: Booking, now: number): Phase {
  if (b.status === "cancelled") return "cancelled";
  if (endMs(b) <= now) return "played";
  return startMs(b) <= now ? "playing" : "booked";
}

const overlaps = (aStart: number, aDur: number, bStart: number, bDur: number) => aStart < bStart + bDur && bStart < aStart + aDur;

export type SlotRequest = { courtId: string; date: string; startHour: number; duration: number };

export type Conflict =
  | { kind: "booking"; booking: Booking }
  | { kind: "block"; block: Block }
  | { kind: "hold"; hold: Hold }
  | { kind: "past" }
  | { kind: "closed" }
  | { kind: "inactive" };

export const conflictMessage = (c: Conflict) =>
  ({
    booking: "Someone just booked this slot.",
    block: "This court is closed for that time.",
    hold: "Another player is paying for this slot right now.",
    past: "That time has already started.",
    closed: "The venue is closed at that time.",
    inactive: "This court is not taking bookings.",
  })[c.kind];

export function findConflict(
  db: TurfDB,
  req: SlotRequest,
  opts: { clientId?: string; ignoreBookingId?: string; now?: number; allowPast?: boolean } = {}
): Conflict | null {
  const now = opts.now ?? Date.now();
  const court = db.courts.find((c) => c.id === req.courtId);
  if (!court || !court.active) return { kind: "inactive" };
  if (req.startHour < db.settings.openHour || req.startHour + req.duration > db.settings.closeHour) return { kind: "closed" };
  if (!opts.allowPast && slotTime(req.date, req.startHour) <= now) return { kind: "past" };
  const booking = db.bookings.find(
    (b) =>
      b.id !== opts.ignoreBookingId &&
      occupies(b) &&
      b.courtId === req.courtId &&
      b.date === req.date &&
      overlaps(b.startHour, b.duration, req.startHour, req.duration)
  );
  if (booking) return { kind: "booking", booking };
  const block = db.blocks.find(
    (b) => b.courtId === req.courtId && b.date === req.date && overlaps(b.startHour, b.duration, req.startHour, req.duration)
  );
  if (block) return { kind: "block", block };
  const hold = db.holds.find(
    (h) =>
      h.expiresAt > now &&
      h.clientId !== opts.clientId &&
      h.courtId === req.courtId &&
      h.date === req.date &&
      overlaps(h.startHour, h.duration, req.startHour, req.duration)
  );
  if (hold) return { kind: "hold", hold };
  return null;
}

export type SlotInfo =
  | { kind: "free"; price: number }
  | { kind: "past" }
  | { kind: "booked"; booking: Booking }
  | { kind: "blocked"; block: Block }
  | { kind: "held"; hold: Hold; mine: boolean };

/** State of the one-hour cell `hour` on a court. */
export function slotInfo(db: TurfDB, court: Court, date: string, hour: number, now: number, clientId: string): SlotInfo {
  const booking = db.bookings.find(
    (b) => occupies(b) && b.courtId === court.id && b.date === date && hour >= b.startHour && hour < b.startHour + b.duration
  );
  if (booking) return { kind: "booked", booking };
  const block = db.blocks.find((b) => b.courtId === court.id && b.date === date && hour >= b.startHour && hour < b.startHour + b.duration);
  if (block) return { kind: "blocked", block };
  if (slotTime(date, hour) <= now) return { kind: "past" };
  const hold = db.holds.find(
    (h) => h.expiresAt > now && h.courtId === court.id && h.date === date && hour >= h.startHour && hour < h.startHour + h.duration
  );
  if (hold) return { kind: "held", hold, mine: hold.clientId === clientId };
  return { kind: "free", price: priceAt(court, hour, db.settings) };
}

export function hoursOf(settings: Settings) {
  return Array.from({ length: settings.closeHour - settings.openHour }, (_, i) => settings.openHour + i);
}

/** Free one-hour slots left on a court for a date (ignoring the past). */
export function freeSlots(db: TurfDB, court: Court, date: string, now: number) {
  return hoursOf(db.settings).filter((h) => slotInfo(db, court, date, h, now, "").kind === "free").length;
}

/** First day in the booking window with a free slot on a court, and that day's free start hours. */
export function nextFreeDay(db: TurfDB, court: Court, now: number) {
  const today = todayYmd();
  for (let i = 0; i < db.settings.bookingWindowDays; i++) {
    const date = addDays(today, i);
    const hours = hoursOf(db.settings).filter((h) => slotInfo(db, court, date, h, now, "").kind === "free");
    if (hours.length) return { date, hours };
  }
  return null;
}

/** The venue's one ground: the first active court. */
export const groundOf = (db: TurfDB) => db.courts.find((c) => c.active);

/** The booking being played on a court right now, if any, and the next one today. */
export function courtLive(db: TurfDB, courtId: string, now: number) {
  const today = todayYmd();
  const list = db.bookings
    .filter((b) => b.courtId === courtId && b.date === today && occupies(b))
    .sort((a, b) => a.startHour - b.startHour);
  const current = list.find((b) => startMs(b) <= now && endMs(b) > now);
  const next = list.find((b) => startMs(b) > now);
  return { current, next };
}

/* ───────────── customer actions ───────────── */

type Result<T> = { ok: true; value: T } | { ok: false; error: string };

export function holdSlot(req: SlotRequest, clientId: string): Result<Hold> {
  let result: Result<Hold> = { ok: false, error: "Could not hold the slot." };
  update((s) => {
    const conflict = findConflict(s, req, { clientId });
    if (conflict) {
      result = { ok: false, error: conflictMessage(conflict) };
      return s;
    }
    const hold: Hold = { id: uid("hd"), ...req, clientId, expiresAt: Date.now() + s.settings.holdMinutes * 60_000 };
    result = { ok: true, value: hold };
    // A customer has one selection at a time.
    return { ...s, holds: [...s.holds.filter((h) => h.clientId !== clientId), hold] };
  });
  return result;
}

export function releaseHold(clientId: string) {
  update((s) => ({ ...s, holds: s.holds.filter((h) => h.clientId !== clientId) }));
}

export type OnlineBookingInput = SlotRequest & {
  customer: Booking["customer"];
  method: Exclude<PayMethod, "cash">;
  amount: number;
  ref: string;
  note?: string;
};

/** Whether a wallet transaction ID has already paid for a booking — one transfer can't pay twice. */
export function trxUsed(db: TurfDB, method: PayMethod, ref: string) {
  return db.bookings.some((b) => b.payments.some((p) => p.method === method && p.ref === ref));
}

export function createOnlineBooking(input: OnlineBookingInput, clientId: string): Result<Booking> {
  let result: Result<Booking> = { ok: false, error: "Booking failed." };
  update((s) => {
    const conflict = findConflict(s, input, { clientId });
    if (conflict) {
      result = { ok: false, error: conflictMessage(conflict) };
      return s;
    }
    if (input.method !== "card" && trxUsed(s, input.method, input.ref)) {
      result = { ok: false, error: "This transaction ID has already been used for a booking." };
      return s;
    }
    const court = s.courts.find((c) => c.id === input.courtId)!;
    const { total, advance } = quote(court, input.startHour, input.duration, s.settings);
    if (input.amount < advance) {
      result = { ok: false, error: `Minimum advance is ৳${advance}.` };
      return s;
    }
    const seq = s.seq.booking + 1;
    const at = nowIso();
    const booking: Booking = {
      id: uid("bk"),
      code: `TH-${seq}`,
      courtId: input.courtId,
      date: input.date,
      startHour: input.startHour,
      duration: input.duration,
      customer: input.customer,
      total,
      advanceDue: advance,
      payments: [{ id: uid("p"), amount: Math.min(input.amount, total), method: input.method, kind: "advance", ref: input.ref, at }],
      status: "confirmed",
      source: "online",
      note: input.note,
      createdAt: at,
      updatedAt: at,
    };
    result = { ok: true, value: booking };
    return {
      ...s,
      bookings: [...s.bookings, booking],
      holds: s.holds.filter((h) => h.clientId !== clientId),
      seq: { ...s.seq, booking: seq },
    };
  });
  return result;
}

export function cancelByCustomer(code: string, phone: string): Result<Booking> {
  let result: Result<Booking> = { ok: false, error: "Booking not found." };
  update((s) => {
    const b = s.bookings.find((x) => x.code === code && x.customer.phone === phone);
    if (!b) return s;
    if (b.status === "cancelled") {
      result = { ok: false, error: "This booking is already cancelled." };
      return s;
    }
    if (startMs(b) - Date.now() < s.settings.cancelCutoffHours * 3600_000) {
      result = { ok: false, error: `Online cancellation closes ${s.settings.cancelCutoffHours}h before kick-off. Please call us.` };
      return s;
    }
    const next = { ...b, status: "cancelled" as const, cancelReason: "Cancelled by customer", updatedAt: nowIso() };
    result = { ok: true, value: next };
    return { ...s, bookings: s.bookings.map((x) => (x.id === b.id ? next : x)) };
  });
  return result;
}

/* ───────────── admin actions ───────────── */

function patchBooking(id: string, fn: (b: Booking) => Booking) {
  update((s) => ({ ...s, bookings: s.bookings.map((b) => (b.id === id ? { ...fn(b), updatedAt: nowIso() } : b)) }));
}

export function setBookingStatus(id: string, status: BookingStatus, cancelReason?: string) {
  patchBooking(id, (b) => ({ ...b, status, cancelReason: status === "cancelled" ? cancelReason || b.cancelReason : b.cancelReason }));
}

/** Cancel a booking; `keepMoney` means the venue keeps what was paid (no refund owed). */
export function cancelBooking(id: string, reason: string | undefined, keepMoney: boolean) {
  patchBooking(id, (b) => ({ ...b, status: "cancelled", cancelReason: reason, refundWaived: keepMoney || undefined }));
}

export function addPayment(id: string, amount: number, method: PayMethod, kind: Payment["kind"], ref?: string) {
  patchBooking(id, (b) => ({ ...b, payments: [...b.payments, { id: uid("p"), amount, method, kind, ref: ref || undefined, at: nowIso() }] }));
}

export type AdminBookingInput = SlotRequest & {
  customer: Booking["customer"];
  source: "walk-in" | "phone";
  total: number;
  paid: number;
  method: PayMethod;
  /** Wallet transaction ID or card slip reference. */
  ref?: string;
  note?: string;
};

export function createAdminBooking(input: AdminBookingInput): Result<Booking> {
  let result: Result<Booking> = { ok: false, error: "Booking failed." };
  update((s) => {
    // Staff may record a game that is already under way, so past start times are allowed.
    const conflict = findConflict(s, input, { allowPast: true });
    if (conflict) {
      result = { ok: false, error: conflictMessage(conflict) };
      return s;
    }
    if (input.ref && (input.method === "bkash" || input.method === "nagad") && trxUsed(s, input.method, input.ref)) {
      result = { ok: false, error: "This transaction ID has already been used for a booking." };
      return s;
    }
    const seq = s.seq.booking + 1;
    const at = nowIso();
    const booking: Booking = {
      id: uid("bk"),
      code: `TH-${seq}`,
      courtId: input.courtId,
      date: input.date,
      startHour: input.startHour,
      duration: input.duration,
      customer: input.customer,
      total: input.total,
      advanceDue: Math.ceil((input.total * s.settings.advancePercent) / 100 / 10) * 10,
      payments: input.paid > 0 ? [{ id: uid("p"), amount: input.paid, method: input.method, kind: "advance", ref: input.ref || undefined, at }] : [],
      status: "confirmed",
      source: input.source,
      note: input.note,
      createdAt: at,
      updatedAt: at,
    };
    result = { ok: true, value: booking };
    return { ...s, bookings: [...s.bookings, booking], seq: { ...s.seq, booking: seq } };
  });
  return result;
}

export function rescheduleBooking(id: string, req: SlotRequest): Result<Booking> {
  let result: Result<Booking> = { ok: false, error: "Booking not found." };
  update((s) => {
    const b = s.bookings.find((x) => x.id === id);
    if (!b) return s;
    const conflict = findConflict(s, req, { ignoreBookingId: id });
    if (conflict) {
      result = { ok: false, error: conflictMessage(conflict) };
      return s;
    }
    const next = { ...b, ...req, updatedAt: nowIso() };
    result = { ok: true, value: next };
    return { ...s, bookings: s.bookings.map((x) => (x.id === id ? next : x)) };
  });
  return result;
}

// The patches below merge into the latest copy, so the Content and Settings pages never overwrite
// each other's fields with what they loaded earlier.

export function updateCourt(id: string, patch: Partial<Court>) {
  update((s) => ({ ...s, courts: s.courts.map((c) => (c.id === id ? { ...c, ...patch } : c)) }));
}

export function saveSettings(patch: Partial<Settings>) {
  update((s) => ({ ...s, settings: { ...s.settings, ...patch } }));
}

export function saveContent(content: SiteContent) {
  update((s) => ({ ...s, content }));
}

export function addGalleryImage(img: Omit<GalleryImage, "id">) {
  update((s) => ({ ...s, gallery: [...s.gallery, { ...img, id: uid("gl") }] }));
}

export function updateGalleryImage(id: string, patch: Partial<GalleryImage>) {
  update((s) => ({ ...s, gallery: s.gallery.map((g) => (g.id === id ? { ...g, ...patch } : g)) }));
}

export function removeGalleryImage(id: string) {
  update((s) => ({ ...s, gallery: s.gallery.filter((g) => g.id !== id) }));
}

/** Swap a photo with its neighbour; `dir` −1 moves it earlier, 1 later. */
export function moveGalleryImage(id: string, dir: -1 | 1) {
  update((s) => {
    const i = s.gallery.findIndex((g) => g.id === id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= s.gallery.length) return s;
    const gallery = [...s.gallery];
    [gallery[i], gallery[j]] = [gallery[j], gallery[i]];
    return { ...s, gallery };
  });
}
