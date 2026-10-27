import type { PayMethod, Phase, Sport } from "./types";

export const taka = (n: number) => `${n < 0 ? "-" : ""}৳${Math.abs(n).toLocaleString("en-IN")}`;

const pad = (n: number) => String(n).padStart(2, "0");

/** Local calendar date as yyyy-mm-dd (never via toISOString, which shifts to UTC). */
export const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const parseYmd = (s: string) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
};

export const addDays = (s: string, n: number) => {
  const d = parseYmd(s);
  d.setDate(d.getDate() + n);
  return ymd(d);
};

export const todayYmd = () => ymd(new Date());

/** Epoch ms of `hour` o'clock on local date `s`. Hour 24 is the following midnight. */
export const slotTime = (s: string, hour: number) => {
  const d = parseYmd(s);
  d.setHours(hour, 0, 0, 0);
  return d.getTime();
};

export const hourLabel = (h: number) => {
  const hh = h % 24;
  const suffix = hh < 12 ? "AM" : "PM";
  return `${hh % 12 === 0 ? 12 : hh % 12} ${suffix}`;
};

export const hourShort = (h: number) => {
  const hh = h % 24;
  return `${hh % 12 === 0 ? 12 : hh % 12}${hh < 12 ? "a" : "p"}`;
};

export const rangeLabel = (start: number, duration: number) => `${hourLabel(start)} – ${hourLabel(start + duration)}`;

export const dateLabel = (s: string, opts: Intl.DateTimeFormatOptions = { weekday: "short", day: "numeric", month: "short" }) =>
  parseYmd(s).toLocaleDateString("en-GB", opts);

export const relativeDay = (s: string) => {
  const t = todayYmd();
  if (s === t) return "Today";
  if (s === addDays(t, 1)) return "Tomorrow";
  if (s === addDays(t, -1)) return "Yesterday";
  return dateLabel(s);
};

export const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit", hour12: true });

/** "12m", "1h 05m" — for countdowns. */
export const formatDuration = (ms: number) => {
  const total = Math.max(0, Math.round(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h) return `${h}h ${pad(m)}m`;
  if (m >= 10) return `${m}m`;
  return `${m}:${pad(s)}`;
};

export const sportLabels: Record<Sport, string> = {
  football: "Football",
};

export const statusLabels: Record<Phase, string> = {
  booked: "Booked",
  playing: "Playing now",
  played: "Played",
  cancelled: "Cancelled",
};

export const statusStyles: Record<Phase, string> = {
  booked: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  playing: "bg-lime-100 text-lime-800 ring-lime-300",
  played: "bg-neutral-100 text-neutral-600 ring-neutral-200",
  cancelled: "bg-rose-50 text-rose-600 ring-rose-200",
};

export const payLabels: Record<PayMethod, string> = {
  bkash: "bKash",
  nagad: "Nagad",
  card: "Card",
  cash: "Cash",
};

export const sourceLabels = { online: "Online", "walk-in": "Walk-in", phone: "Phone" } as const;
