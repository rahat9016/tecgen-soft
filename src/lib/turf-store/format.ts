import type { BookingStatus, PayMethod, Sport } from "./types";

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
  cricket: "Cricket",
  badminton: "Badminton",
  tennis: "Tennis",
  basketball: "Basketball",
};

export const statusLabels: Record<BookingStatus, string> = {
  pending: "Awaiting verification",
  confirmed: "Confirmed",
  "checked-in": "Playing",
  completed: "Completed",
  cancelled: "Cancelled",
  "no-show": "No-show",
};

export const statusStyles: Record<BookingStatus, string> = {
  pending: "bg-amber-50 text-amber-700 ring-amber-200",
  confirmed: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  "checked-in": "bg-lime-100 text-lime-800 ring-lime-300",
  completed: "bg-neutral-100 text-neutral-600 ring-neutral-200",
  cancelled: "bg-rose-50 text-rose-600 ring-rose-200",
  "no-show": "bg-neutral-800 text-white ring-neutral-800",
};

/** Fill colours for booking blocks on the schedule board. */
export const statusBlock: Record<BookingStatus, string> = {
  pending: "border-amber-300 bg-amber-50 text-amber-900",
  confirmed: "border-emerald-300 bg-emerald-50 text-emerald-900",
  "checked-in": "border-lime-400 bg-lime-200 text-lime-950",
  completed: "border-neutral-200 bg-neutral-100 text-neutral-600",
  cancelled: "border-rose-200 bg-rose-50 text-rose-700",
  "no-show": "border-neutral-700 bg-neutral-700 text-white",
};

export const payLabels: Record<PayMethod, string> = {
  bkash: "bKash",
  nagad: "Nagad",
  card: "Card",
  cash: "Cash",
};
