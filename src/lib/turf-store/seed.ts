import { addDays, slotTime, todayYmd } from "./format";
import type { Booking, BookingStatus, Court, PayMethod, Payment, Settings, TurfDB } from "./types";

// Bumped when the seed changes so stored demo data is replaced.
export const DB_VERSION = 3;

export const defaultSettings: Settings = {
  venueName: "TurfHub Bashundhara",
  phone: "+880 1711-000222",
  address: "Plot 12, Block C, Bashundhara R/A, Dhaka 1229",
  openHour: 6,
  closeHour: 24,
  peakStartHour: 17,
  advancePercent: 30,
  holdMinutes: 10,
  maxDuration: 3,
  bookingWindowDays: 60,
  cancelCutoffHours: 12,
};

/** The venue has a single ground; admins can still add more from the Courts page. */
export const seedCourts: Court[] = [
  {
    id: "ct1",
    name: "Baseline Ground",
    sport: "football",
    surface: "FIFA-grade artificial grass",
    indoor: false,
    size: "7-a-side · 180 × 90 ft",
    image: "/turf/field.webp",
    price: 2200,
    peakPrice: 3200,
    players: "10–14 players",
    rating: 4.9,
    active: true,
    features: ["LED floodlights", "Changing room", "Free bibs", "Drinking water", "Parking"],
    description: "Our 7-a-side pitch with shock-pad grass, full-height nets and floodlights for night matches.",
  },
];

/** Static state: identical on server and first client render, so hydration is stable. */
export const staticState: TurfDB = {
  version: DB_VERSION,
  seeded: false,
  settings: defaultSettings,
  courts: seedCourts,
  bookings: [],
  blocks: [],
  holds: [],
  seq: { booking: 1000, court: seedCourts.length },
};

function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const FIRST = ["Rahim", "Tanvir", "Sakib", "Nusrat", "Arif", "Fahim", "Mehedi", "Rafi", "Sadia", "Imran", "Nafis", "Tasnim", "Shuvo", "Asif", "Rakib", "Mim"];
const LAST = ["Uddin", "Ahmed", "Hasan", "Jahan", "Hossain", "Islam", "Rahman", "Chowdhury", "Karim", "Akter", "Kabir", "Siddique"];
const TEAMS = ["Bashundhara Blazers", "Office XI", "Gulshan Strikers", "NSU Alumni", "Friday FC", "Code Warriors", "", "", "", ""];

/**
 * Demo history around today: completed past games, matches being played right now and upcoming
 * bookings — so the live board has something to show on first visit.
 */
export function createSeed(): TurfDB {
  const rand = rng(20261001);
  const pick = <T,>(xs: T[]) => xs[Math.floor(rand() * xs.length)];
  const today = todayYmd();
  const now = Date.now();
  const s = defaultSettings;
  const bookings: Booking[] = [];
  let seq = 1000;

  for (let d = -10; d <= 6; d++) {
    const date = addDays(today, d);
    for (const court of seedCourts) {
      let h = s.openHour;
      while (h < s.closeHour) {
        const peak = h >= s.peakStartHour;
        const chance = (peak ? 0.62 : h < 9 ? 0.3 : 0.18) * (d > 2 ? 0.55 : 1);
        if (rand() > chance) {
          h++;
          continue;
        }
        const duration = Math.min(rand() < 0.3 ? 2 : 1, s.closeHour - h);
        const start = slotTime(date, h);
        const end = slotTime(date, h + duration);
        const total = (peak ? court.peakPrice : court.price) * duration;
        const advanceDue = Math.ceil((total * s.advancePercent) / 100 / 10) * 10;
        const source: Booking["source"] = rand() < 0.75 ? "online" : rand() < 0.5 ? "walk-in" : "phone";
        const method: PayMethod = source === "online" ? pick(["bkash", "bkash", "nagad", "card"] as PayMethod[]) : "cash";
        const created = new Date(start - (1 + Math.floor(rand() * 72)) * 3600_000).toISOString();

        let status: BookingStatus;
        if (end <= now) {
          const r = rand();
          status = r < 0.88 ? "completed" : r < 0.94 ? "cancelled" : "no-show";
        } else if (start <= now) status = "checked-in";
        else status = d <= 1 && source === "online" && rand() < 0.3 ? "pending" : "confirmed";

        const payments: Payment[] = [];
        const pay = (amount: number, kind: Payment["kind"], m: PayMethod, at: string) =>
          payments.push({ id: `p${seq}${payments.length}`, amount, kind, method: m, at, ref: m === "cash" ? undefined : `TX${Math.floor(rand() * 1e8)}` });
        if (source === "online") pay(advanceDue, "advance", method, created);
        else if (status !== "cancelled") pay(advanceDue, "advance", "cash", created);
        if (status === "completed" || status === "checked-in") pay(total - advanceDue, "balance", rand() < 0.7 ? "cash" : "bkash", new Date(start).toISOString());

        const name = `${pick(FIRST)} ${pick(LAST)}`;
        bookings.push({
          id: `bk${seq}`,
          code: `TH-${++seq}`,
          courtId: court.id,
          date,
          startHour: h,
          duration,
          customer: { name, phone: `01${pick(["7", "8", "9", "5", "3"])}${String(Math.floor(rand() * 1e8)).padStart(8, "0")}`, team: pick(TEAMS) || undefined },
          total,
          advanceDue,
          payments,
          status,
          source,
          cancelReason: status === "cancelled" ? pick(["Rain", "Team short of players", "Rescheduled"]) : undefined,
          createdAt: created,
          updatedAt: created,
        });
        h += duration;
      }
    }
  }

  const blocks = [
    { id: "bl1", courtId: "ct1", date: addDays(today, 2), startHour: 6, duration: 3, reason: "Turf re-brushing" },
    { id: "bl2", courtId: "ct1", date: addDays(today, 4), startHour: 15, duration: 5, reason: "Corporate tournament" },
  ];
  // Drop seeded bookings under a block so the demo has no impossible overlaps.
  const free = bookings.filter(
    (b) =>
      !blocks.some(
        (bl) =>
          bl.courtId === b.courtId &&
          bl.date === b.date &&
          b.startHour < bl.startHour + bl.duration &&
          bl.startHour < b.startHour + b.duration
      )
  );

  return { ...staticState, seeded: true, bookings: free, blocks, seq: { booking: seq, court: seedCourts.length } };
}
