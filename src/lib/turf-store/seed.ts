import { addDays, slotTime, todayYmd } from "./format";
import type { Booking, BookingStatus, Court, GalleryImage, PayMethod, Payment, Settings, SiteContent, TurfDB } from "./types";

// Bumped when the seed changes so stored demo data is replaced.
export const DB_VERSION = 10;

/** Photos in /public/turf the admin can pick for the hero and the ground. */
export const turfImages = ["hero", "field", "boots", "kickoff", "player", "night-match", "kids", "stadium", "night"].map((n) => `/turf/${n}.webp`);

export const defaultContent: SiteContent = {
  heroTitle: "Book Our Football Turf\nin Under a Minute.",
  heroText:
    "Pick a date and time, see instantly if the ground is free, and lock it with a small advance. No phone calls, no double bookings — just show up and play.",
  heroImage: "/turf/hero.webp",
  aboutTitle: "Built for the people\nwho actually play.",
  aboutText:
    "One well-kept pitch in Bashundhara, run by people who play on it. Book online in a minute, turn up, and the ground is ready — lines marked, lights on, bibs waiting.",
  services: [
    { title: "Hourly hire", text: "Your squad, the whole pitch, by the hour. Pick a free time and lock it with a small advance.", detail: "", online: true },
    { title: "Coaching", text: "Sessions for kids and adults — fitness, passing, finishing and goalkeeping.", detail: "Coach on request", online: false },
    { title: "Private events", text: "Office matches and birthday games. We block the ground and have it ready when you arrive.", detail: "Evening or full day", online: false },
    { title: "Tournaments", text: "7-a-side cups with fixtures drawn up and the ground held for every round.", detail: "Ask about dates", online: false },
  ],
};

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

export const seedGallery: GalleryImage[] = [
  ["field", "The pitch at golden hour"],
  ["night-match", "Floodlit night match"],
  ["kickoff", "Kick-off"],
  ["kids", "Saturday kids' coaching"],
  ["stadium", "Tournament day"],
  ["boots", "Shock-pad grass up close"],
].map(([n, title], i) => ({ id: `gl${i + 1}`, src: `/turf/${n}.webp`, title, visible: true }));

/** The venue has a single ground. */
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
  content: defaultContent,
  gallery: seedGallery,
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
 * Demo history around today: games already played, matches being played right now and upcoming
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
        const total = (peak ? court.peakPrice : court.price) * duration;
        const advanceDue = Math.ceil((total * s.advancePercent) / 100 / 10) * 10;
        const source: Booking["source"] = rand() < 0.75 ? "online" : rand() < 0.5 ? "walk-in" : "phone";
        const method: PayMethod = source === "online" ? pick(["bkash", "bkash", "nagad", "card"] as PayMethod[]) : "cash";
        // Booked 1–72 hours before kick-off; games further out were booked some time in the last two days.
        const lead = (1 + Math.floor(rand() * 72)) * 3600_000;
        const created = new Date(start - lead < now ? start - lead : now - (1 + Math.floor(rand() * 47)) * 3600_000).toISOString();

        // A few bookings are called off; everything else stands.
        const status: BookingStatus = rand() >= 0.94 ? "cancelled" : "confirmed";

        const payments: Payment[] = [];
        const pay = (amount: number, kind: Payment["kind"], m: PayMethod, at: string) =>
          payments.push({ id: `p${seq}${payments.length}`, amount, kind, method: m, at, ref: m === "cash" ? undefined : `TX${Math.floor(rand() * 1e8)}` });
        if (source === "online") pay(advanceDue, "advance", method, created);
        else if (status !== "cancelled") pay(advanceDue, "advance", "cash", created);
        // Games already played or under way have had their balance collected at the ground.
        if (status === "confirmed" && start <= now) pay(total - advanceDue, "balance", rand() < 0.7 ? "cash" : "bkash", new Date(start).toISOString());
        // Cancelled online bookings: about half refunded already, some kept (late cancellations); upcoming ones
        // left over are still waiting for their refund.
        let refundWaived: true | undefined;
        if (status === "cancelled" && payments.length) {
          const r = rand();
          if (r < 0.5) pay(advanceDue, "refund", method, new Date(Math.min(now, start)).toISOString());
          else if (r < 0.75) refundWaived = true;
        }

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
          refundWaived,
          createdAt: created,
          updatedAt: created,
        });
        h += duration;
      }
    }
  }

  return { ...staticState, seeded: true, bookings, seq: { booking: seq, court: seedCourts.length } };
}
