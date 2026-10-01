"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { slotTime, todayYmd } from "./format";
import { createSeed, DB_VERSION, staticState } from "./seed";
import type { Block, Booking, BookingStatus, Court, Hold, PayMethod, Payment, Settings, TurfDB } from "./types";

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

/** Cancelled bookings free their slot; everything else keeps it. */
export const occupies = (b: Booking) => b.status !== "cancelled";

export const startMs = (b: Pick<Booking, "date" | "startHour">) => slotTime(b.date, b.startHour);
export const endMs = (b: Pick<Booking, "date" | "startHour" | "duration">) => slotTime(b.date, b.startHour + b.duration);

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

/** The booking being played on a court right now, if any, and the next one today. */
export function courtLive(db: TurfDB, courtId: string, now: number) {
  const today = todayYmd();
  const list = db.bookings
    .filter((b) => b.courtId === courtId && b.date === today && occupies(b) && b.status !== "no-show")
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

export function createOnlineBooking(input: OnlineBookingInput, clientId: string): Result<Booking> {
  let result: Result<Booking> = { ok: false, error: "Booking failed." };
  update((s) => {
    const conflict = findConflict(s, input, { clientId });
    if (conflict) {
      result = { ok: false, error: conflictMessage(conflict) };
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
      status: "pending",
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
    if (b.status !== "pending" && b.status !== "confirmed") {
      result = { ok: false, error: "This booking can no longer be cancelled." };
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

export function addPayment(id: string, amount: number, method: PayMethod, kind: Payment["kind"], ref?: string) {
  patchBooking(id, (b) => ({ ...b, payments: [...b.payments, { id: uid("p"), amount, method, kind, ref: ref || undefined, at: nowIso() }] }));
}

export type AdminBookingInput = SlotRequest & {
  customer: Booking["customer"];
  source: "walk-in" | "phone";
  total: number;
  paid: number;
  method: PayMethod;
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
    const seq = s.seq.booking + 1;
    const at = nowIso();
    const playing = slotTime(input.date, input.startHour) <= Date.now();
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
      payments: input.paid > 0 ? [{ id: uid("p"), amount: input.paid, method: input.method, kind: "advance", at }] : [],
      status: playing ? "checked-in" : "confirmed",
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

export function addBlock(block: Omit<Block, "id">): Result<Block> {
  let result: Result<Block> = { ok: false, error: "Could not block." };
  update((s) => {
    const conflict = findConflict(s, block, { allowPast: true });
    if (conflict && conflict.kind !== "hold") {
      result = { ok: false, error: conflict.kind === "booking" ? `Overlaps booking ${conflict.booking.code}.` : conflictMessage(conflict) };
      return s;
    }
    const value = { ...block, id: uid("bl") };
    result = { ok: true, value };
    return { ...s, blocks: [...s.blocks, value] };
  });
  return result;
}

export function removeBlock(id: string) {
  update((s) => ({ ...s, blocks: s.blocks.filter((b) => b.id !== id) }));
}

export function saveCourt(court: Court) {
  update((s) => {
    const exists = s.courts.some((c) => c.id === court.id);
    return exists
      ? { ...s, courts: s.courts.map((c) => (c.id === court.id ? court : c)) }
      : { ...s, courts: [...s.courts, court], seq: { ...s.seq, court: s.seq.court + 1 } };
  });
}

export const newCourtId = (db: TurfDB) => `ct${db.seq.court + 1}${Math.random().toString(36).slice(2, 5)}`;

export function saveSettings(settings: Settings) {
  update((s) => ({ ...s, settings }));
}
