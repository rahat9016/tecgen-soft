import { addDays, slotTime, todayYmd } from "./format";
import type { Booking, BookingStatus, Court, PayMethod, Payment, Settings, TurfDB } from "./types";

export const DB_VERSION = 1;

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
  bookingWindowDays: 14,
  cancelCutoffHours: 12,
};

export const seedCourts: Court[] = [
  {
    id: "ct1",
    name: "Baseline Ground A",
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
    features: ["LED floodlights", "Changing room", "Free bibs", "Drinking water"],
    description: "Our flagship 7-a-side pitch with shock-pad grass, full-height nets and floodlights for night matches.",
  },
  {
    id: "ct2",
    name: "Baseline Ground B",
    sport: "football",
    surface: "Futsal turf, roofed",
    indoor: true,
    size: "5-a-side · 120 × 60 ft",
    image: "/turf/boots.webp",
    price: 1600,
    peakPrice: 2400,
    players: "8–10 players",
    rating: 4.8,
    active: true,
    features: ["Rain-proof roof", "Rebound walls", "Scoreboard", "Locker room"],
    description: "Fast 5-a-side futsal under a full roof — the match goes on in the monsoon.",
  },
  {
    id: "ct3",
    name: "Box Cricket Arena",
    sport: "cricket",
    surface: "Artificial turf with mat pitch",
    indoor: false,
    size: "8-a-side · 150 × 70 ft",
    image: "/turf/cricket.webp",
    price: 1800,
    peakPrice: 2800,
    players: "12–16 players",
    rating: 4.7,
    active: true,
    features: ["Netted box", "Bowling machine on request", "Stumps & balls", "Floodlights"],
    description: "Fully netted box cricket with a true-bounce mat — perfect for office leagues.",
  },
  {
    id: "ct4",
    name: "Shuttle Court 1",
    sport: "badminton",
    surface: "BWF synthetic mat",
    indoor: true,
    size: "Doubles · 44 × 20 ft",
    image: "/turf/badminton.webp",
    price: 600,
    peakPrice: 900,
    players: "2–4 players",
    rating: 4.8,
    active: true,
    features: ["AC hall", "Anti-glare lights", "Racket rental"],
    description: "Air-conditioned hall with a tournament-grade mat and anti-glare lighting.",
  },
  {
    id: "ct5",
    name: "Hard Court Tennis",
    sport: "tennis",
    surface: "Acrylic hard court",
    indoor: false,
    size: "Singles / doubles",
    image: "/turf/tennis2.webp",
    price: 1000,
    peakPrice: 1500,
    players: "2–4 players",
    rating: 4.6,
    active: true,
    features: ["Ball machine", "Coach on request", "Floodlights"],
    description: "Cushioned acrylic court with consistent bounce, open early for morning hitters.",
  },
  {
    id: "ct6",
    name: "Hoops Court",
    sport: "basketball",
    surface: "Polyurethane sports floor",
    indoor: false,
    size: "Full court · 94 × 50 ft",
    image: "/turf/basketball.webp",
    price: 1200,
    peakPrice: 1800,
    players: "6–10 players",
    rating: 4.5,
    active: true,
    features: ["Glass backboards", "Floodlights", "Shot clock"],
    description: "Full-size outdoor court with glass boards and a working shot clock.",
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
        const duration = Math.min(court.sport === "badminton" ? 1 : rand() < 0.3 ? 2 : 1, s.closeHour - h);
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
    { id: "bl1", courtId: "ct6", date: addDays(today, 2), startHour: 6, duration: 4, reason: "Floor re-coating" },
    { id: "bl2", courtId: "ct3", date: addDays(today, 4), startHour: 15, duration: 5, reason: "Corporate tournament" },
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
