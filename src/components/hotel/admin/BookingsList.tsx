"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { BadgeCheck, CalendarDays, ChevronDown, ChevronRight, ClipboardList, Download, LogIn, LogOut, Plus, Search, Wallet, X } from "lucide-react";
import { Calendar } from "@/src/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/src/components/ui/popover";
import { dateLabel, downloadCsv, formatDateTime, initials, rangeLabel, sourceLabels, statusLabels, taka, todayKey } from "@/src/lib/hotel-store/format";
import { isArrival } from "@/src/lib/hotel-store/frontDesk";
import { confirmBooking, creditOf, dueOf, folioTotal, isLive, paidOf, paymentStatus, unitNumbers, useHotelDB } from "@/src/lib/hotel-store/store";
import type { Booking, BookingSource } from "@/src/lib/hotel-store/types";
import { parseDayKey, toDayKey } from "@/src/lib/hotelDates";
import { cn } from "@/src/lib/utils";
import { ADMIN, Empty, focusRing, hbtn, Pager, StatusBadge, tableCardClass, usePagination } from "./ui";

type Tab = "all" | "arrivals" | "upcoming" | "pending" | "checked-out" | "cancelled";

const tabTest: Record<Tab, (b: Booking, today: string) => boolean> = {
  all: () => true,
  arrivals: (b, t) => isArrival(b, t),
  upcoming: (b, t) => (b.status === "confirmed" || b.status === "pending") && b.checkIn > t,
  pending: (b) => b.status === "pending",
  "checked-out": (b) => b.status === "checked-out",
  cancelled: (b) => b.status === "cancelled" || b.status === "no-show",
};

/** One row of views: everything, then today's front-desk work, then history. */
const views: { tab: Tab; label: string; group: number }[] = [
  { tab: "all", label: "All", group: 0 },
  { tab: "arrivals", label: "Arriving today", group: 1 },
  { tab: "pending", label: "To confirm", group: 1 },
  { tab: "upcoming", label: "Upcoming", group: 2 },
  { tab: "checked-out", label: "Checked out", group: 2 },
  { tab: "cancelled", label: "Cancelled", group: 2 },
];

type PayFilter = "any" | "unpaid" | "partly" | "paid" | "refund";
const payTest: Record<PayFilter, (b: Booking) => boolean> = {
  any: () => true,
  unpaid: (b) => dueOf(b) > 0 && paidOf(b) <= 0,
  partly: (b) => dueOf(b) > 0 && paidOf(b) > 0,
  paid: (b) => dueOf(b) === 0 && creditOf(b) === 0 && paidOf(b) > 0,
  refund: (b) => creditOf(b) > 0,
};
const payLabels: Record<PayFilter, string> = { any: "Any payment", unpaid: "Unpaid", partly: "Partly paid", paid: "Paid in full", refund: "Refund due" };

type Sort = "created" | "checkin" | "checkin-desc";
const sortLabels: Record<Sort, string> = { created: "Newest first", checkin: "Check-in: soonest", "checkin-desc": "Check-in: latest" };

/** Shared look for every toolbar control, so search, selects and the date button line up. */
const control = cn("h-10 rounded-md border border-neutral-300 bg-white text-sm text-neutral-800 transition hover:border-sky-400", focusRing, "focus-visible:ring-offset-0");

export default function BookingsList() {
  const db = useHotelDB();
  const router = useRouter();
  const params = useSearchParams();
  const initial = params.get("status");
  const [tab, setTab] = useState<Tab>(initial && initial in tabTest ? (initial as Tab) : "all");
  const [q, setQ] = useState("");
  const [source, setSource] = useState<"any" | BookingSource>("any");
  const [pay, setPay] = useState<PayFilter>("any");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [sort, setSort] = useState<Sort>("created");
  const today = todayKey();
  // Booking details link back to this exact view.
  const here = `${ADMIN}/bookings${tab !== "all" ? `?status=${tab}` : ""}`;
  const detail = (b: Booking) => `${ADMIN}/bookings/${b.id}?from=${encodeURIComponent(here)}`;

  const base = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return db.bookings.filter((b) => {
      if (source !== "any" && b.source !== source) return false;
      if (!payTest[pay](b)) return false;
      if (from && b.checkOut <= from) return false;
      if (to && b.checkIn > to) return false;
      if (!needle) return true;
      const rooms = unitNumbers(db, b.unitIds).join(" ");
      return [b.code, b.guest.name, b.guest.phone, b.guest.email, rooms, b.roomName].some((v) => v?.toLowerCase().includes(needle));
    });
  }, [db, q, source, pay, from, to]);

  const counts = Object.fromEntries((Object.keys(tabTest) as Tab[]).map((t) => [t, base.filter((b) => tabTest[t](b, today)).length])) as Record<Tab, number>;
  const list = base
    .filter((b) => tabTest[tab](b, today))
    .sort((a, b) => (sort === "created" ? b.createdAt.localeCompare(a.createdAt) : sort === "checkin" ? a.checkIn.localeCompare(b.checkIn) : b.checkIn.localeCompare(a.checkIn)));
  const page = usePagination(list, 15);
  const resetPage = () => page.setPage(1);

  const exportCsv = () =>
    downloadCsv(`bookings-${today}.csv`, [
      ["Booking", "Created", "Guest", "Phone", "Email", "Room name", "Rooms", "Room no.", "Check-in", "Check-out", "Nights", "Adults", "Children", "Status", "Source", "Total", "Paid", "Due", "Payment status"],
      ...list.map((b) => [
        b.code,
        formatDateTime(b.createdAt),
        b.guest.name,
        b.guest.phone,
        b.guest.email,
        b.roomName,
        b.rooms,
        unitNumbers(db, b.unitIds).join(" "),
        b.checkIn,
        b.checkOut,
        b.nights,
        b.adults,
        b.children,
        statusLabels[b.status],
        sourceLabels[b.source],
        folioTotal(b),
        paidOf(b),
        dueOf(b),
        paymentStatus(b).label,
      ]),
    ]);

  const chips = [
    source !== "any" && { key: "source", label: `Source: ${sourceLabels[source]}`, clear: () => setSource("any") },
    pay !== "any" && { key: "pay", label: `Payment: ${payLabels[pay]}`, clear: () => setPay("any") },
    (from || to) && {
      key: "stay",
      label: `Staying: ${stayLabel(from, to)}`,
      clear: () => {
        setFrom("");
        setTo("");
      },
    },
  ].filter(Boolean) as { key: string; label: string; clear: () => void }[];
  const filtering = chips.length > 0 || !!q.trim();
  const clearAll = () => {
    setQ("");
    setSource("any");
    setPay("any");
    setFrom("");
    setTo("");
    resetPage();
  };
  const pickTab = (t: Tab) => {
    setTab(t);
    resetPage();
  };

  return (
    <div className="mx-auto max-w-[1600px]">
      {/* White header card, same as the Rooms page. */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-md border border-neutral-200 bg-white px-4 py-3.5 sm:px-5">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-neutral-900">Bookings</h1>
          <p className="mt-0.5 text-sm text-neutral-600">
            {db.bookings.length} bookings · {db.bookings.filter((b) => b.status === "pending").length} waiting for confirmation
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={exportCsv} className={hbtn.outline}>
            <Download className="size-4" aria-hidden /> <span className="hidden sm:inline">Export CSV</span>
            <span className="sr-only sm:hidden">Export CSV</span>
          </button>
          <Link href={`${ADMIN}/bookings/new`} className={hbtn.primary}>
            <Plus className="size-4" aria-hidden /> New booking
          </Link>
        </div>
      </div>

      <div className={tableCardClass}>
        <ViewPills tab={tab} counts={counts} onChange={pickTab} />

        <div className="space-y-3 border-b border-neutral-100 p-3 sm:p-4">
          <div className="grid grid-cols-2 gap-2 lg:grid-cols-[minmax(16rem,1fr)_repeat(4,auto)]">
            <label className="relative col-span-2 block lg:col-span-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-500" aria-hidden />
              <input
                type="search"
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  resetPage();
                }}
                placeholder="Search guest, phone, booking code or room no."
                aria-label="Search bookings"
                className={cn(control, "w-full pl-9 pr-3 placeholder:text-neutral-500")}
              />
            </label>
            <ToolbarSelect
              label="Source"
              value={source}
              active={source !== "any"}
              onChange={(v) => {
                setSource(v);
                resetPage();
              }}
              options={[{ value: "any", label: "All sources" }, ...(Object.keys(sourceLabels) as BookingSource[]).map((s) => ({ value: s, label: sourceLabels[s] }))]}
            />
            <ToolbarSelect
              label="Payment"
              value={pay}
              active={pay !== "any"}
              onChange={(v) => {
                setPay(v);
                resetPage();
              }}
              options={(Object.keys(payLabels) as PayFilter[]).map((p) => ({ value: p, label: payLabels[p] }))}
            />
            <StayFilter
              from={from}
              to={to}
              onChange={(f, t) => {
                setFrom(f);
                setTo(t);
                resetPage();
              }}
            />
            <ToolbarSelect label="Sort" value={sort} onChange={setSort} options={(Object.keys(sortLabels) as Sort[]).map((s) => ({ value: s, label: sortLabels[s] }))} />
          </div>

          {filtering && (
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="text-neutral-700">
                <b className="font-semibold text-neutral-900">{list.length}</b> {list.length === 1 ? "result" : "results"}
              </span>
              {chips.map((c) => (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => {
                    c.clear();
                    resetPage();
                  }}
                  aria-label={`Remove filter ${c.label}`}
                  className={cn("inline-flex h-8 items-center gap-1 rounded-full bg-sky-50 pl-3 pr-2 font-medium text-sky-900 ring-1 ring-inset ring-sky-200 transition hover:bg-sky-100", focusRing)}
                >
                  {c.label}
                  <X className="size-3.5" aria-hidden />
                </button>
              ))}
              <button type="button" onClick={clearAll} className={cn("rounded-sm font-medium text-neutral-600 hover:text-sky-800 hover:underline", focusRing)}>
                Clear all
              </button>
            </div>
          )}
        </div>

        {list.length === 0 ? (
          <Empty
            icon={ClipboardList}
            title={filtering ? "No bookings match" : tab === "all" ? "No bookings yet" : `Nothing in “${views.find((v) => v.tab === tab)?.label}”`}
            text={filtering ? "Try another search, or clear the filters." : tab === "all" ? "New bookings will show up here." : "Pick another view above."}
          >
            {filtering && (
              <button onClick={clearAll} className={cn(hbtn.outline, "mt-2")}>
                Clear filters
              </button>
            )}
          </Empty>
        ) : (
          <>
            {/* Phones and small tablets: one card per booking instead of a sideways-scrolling table. */}
            <ul className="divide-y divide-neutral-100 md:hidden">
              {page.rows.map((b) => (
                <li key={b.id}>
                  <Link href={detail(b)} className={cn("block space-y-3 p-4 transition active:bg-sky-50/60", focusRing, "focus-visible:ring-inset")}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <Avatar name={b.guest.name} />
                        <div className="min-w-0">
                          <p className="font-semibold text-neutral-900">{b.guest.name}</p>
                          <p className="text-[13px] text-neutral-600">
                            <span className="font-mono font-semibold text-sky-800">{b.code}</span> · {sourceLabels[b.source]}
                          </p>
                        </div>
                      </div>
                      <StatusBadge status={b.status} />
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="min-w-0">
                        <p className="text-[13px] text-neutral-600">Stay</p>
                        <p className="font-medium text-neutral-900">{rangeLabel(b.checkIn, b.checkOut)}</p>
                        <p className="text-[13px] text-neutral-600">{nightsGuests(b)}</p>
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13px] text-neutral-600">Room</p>
                        <RoomCell b={b} />
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <PayLine b={b} />
                      <RowAction b={b} today={today} from={here} />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>

            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[880px] text-sm">
                <thead className="border-b border-neutral-200 bg-neutral-50 text-left text-[13px] font-medium text-neutral-600">
                  <tr>
                    <th className="py-3 pl-4 pr-3 font-medium">Guest</th>
                    <th className="px-3 py-3 font-medium">Stay</th>
                    <th className="px-3 py-3 font-medium">Room</th>
                    <th className="px-3 py-3 font-medium">Status</th>
                    <th className="px-3 py-3 font-medium">Payment</th>
                    <th className="py-3 pr-4 text-right font-medium">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {page.rows.map((b) => {
                    const arrivesToday = b.checkIn === today && (b.status === "confirmed" || b.status === "pending");
                    const leavesToday = b.checkOut === today && b.status === "checked-in";
                    return (
                      <tr key={b.id} onClick={() => router.push(detail(b))} className="group cursor-pointer transition hover:bg-sky-50/50">
                        <td className="py-3.5 pl-4 pr-3">
                          <div className="flex items-center gap-3">
                            <Avatar name={b.guest.name} />
                            <div className="min-w-0">
                              <Link
                                href={detail(b)}
                                onClick={(e) => e.stopPropagation()}
                                className={cn("rounded-sm font-semibold text-neutral-900 hover:text-sky-800 hover:underline", focusRing)}
                              >
                                {b.guest.name}
                              </Link>
                              <p className="text-[13px] text-neutral-600">
                                <span className="font-mono font-semibold text-sky-800">{b.code}</span>
                                {b.groupId && <span className="ml-1.5 rounded bg-violet-50 px-1.5 py-px text-xs font-medium text-violet-800">Group</span>}
                                {" · "}
                                {sourceLabels[b.source]}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3.5">
                          <p className="flex flex-wrap items-center gap-1.5 whitespace-nowrap text-neutral-900">
                            {rangeLabel(b.checkIn, b.checkOut)}
                            {arrivesToday && <TodayTag>Arrives today</TodayTag>}
                            {leavesToday && <TodayTag>Leaves today</TodayTag>}
                          </p>
                          <p className="text-[13px] text-neutral-600">{nightsGuests(b)}</p>
                        </td>
                        <td className="px-3 py-3.5">
                          <RoomCell b={b} />
                        </td>
                        <td className="px-3 py-3.5">
                          <StatusBadge status={b.status} />
                        </td>
                        <td className="px-3 py-3.5">
                          <PayLine b={b} />
                        </td>
                        <td className="py-3.5 pr-4">
                          <div className="flex items-center justify-end gap-2">
                            <RowAction b={b} today={today} from={here} />
                            <ChevronRight className="size-4 text-neutral-400 transition group-hover:translate-x-0.5 group-hover:text-sky-700" aria-hidden />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
        <Pager {...page} noun="bookings" />
      </div>
    </div>
  );
}

/** The views as one row of pills. Counts show where they drive work (all, and today's views), not on history. */
function ViewPills({ tab, counts, onChange }: { tab: Tab; counts: Record<Tab, number>; onChange: (t: Tab) => void }) {
  return (
    // Phones swipe through the views in one line; wider screens wrap them.
    <div role="group" aria-label="Booking views" className="flex items-center gap-1.5 overflow-x-auto border-b border-neutral-100 p-3 [scrollbar-width:none] sm:flex-wrap sm:px-4">
      {views.map((v, i) => {
        const selected = tab === v.tab;
        const n = counts[v.tab];
        return (
          <span key={v.tab} className="contents">
            {i > 0 && views[i - 1].group !== v.group && <span aria-hidden className="mx-0.5 h-6 w-px shrink-0 bg-neutral-200" />}
            <button
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(v.tab)}
              className={cn(
                "inline-flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3 text-sm font-medium transition",
                focusRing,
                selected ? "border-sky-600 bg-sky-600 text-white" : "border-neutral-200 bg-white text-neutral-700 hover:border-sky-300 hover:text-sky-800"
              )}
            >
              {v.label}
              {v.group < 2 && (
                <span
                  className={cn(
                    "min-w-6 rounded-full px-1.5 text-center text-[13px] font-semibold tabular-nums leading-5",
                    selected ? "bg-white/20 text-white" : v.tab === "pending" && n > 0 ? "bg-amber-100 text-amber-900" : "bg-neutral-100 text-neutral-700"
                  )}
                >
                  {n}
                </span>
              )}
            </button>
          </span>
        );
      })}
    </div>
  );
}

function ToolbarSelect<T extends string>({
  label,
  value,
  onChange,
  options,
  active,
}: {
  label: string;
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
  /** A filter that's narrowing the list gets the brand outline, so it's easy to spot. */
  active?: boolean;
}) {
  return (
    <label className="relative block min-w-0">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className={cn(control, "w-full appearance-none pl-3 pr-9 lg:w-auto", active && "border-sky-500 bg-sky-50 font-medium text-sky-900")}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-neutral-500" aria-hidden />
    </label>
  );
}

const stayLabel = (from: string, to: string) => `${from ? dateLabel(from, "d MMM") : "…"} – ${to ? dateLabel(to, "d MMM") : "…"}`;

/** "Staying between" as one button with a range calendar, instead of two bare date fields. */
function StayFilter({ from, to, onChange }: { from: string; to: string; onChange: (from: string, to: string) => void }) {
  const [open, setOpen] = useState(false);
  const active = !!(from || to);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button type="button" aria-label={active ? `Staying between ${stayLabel(from, to)}` : "Filter by stay dates"} className={cn(control, "flex w-full items-center gap-2 pl-3 pr-3 lg:w-auto", active && "border-sky-500 bg-sky-50 font-medium text-sky-900")}>
          <CalendarDays className="size-4 shrink-0 text-neutral-500" aria-hidden />
          <span className="whitespace-nowrap">{active ? stayLabel(from, to) : "Any dates"}</span>
          <ChevronDown className="ml-auto size-4 shrink-0 text-neutral-500" aria-hidden />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-auto bg-white p-3">
        <p className="px-1 text-sm font-semibold text-neutral-900">Staying between</p>
        <p className="px-1 text-[13px] text-neutral-600">Shows stays that overlap these dates.</p>
        <Calendar
          mode="range"
          selected={{ from: parseDayKey(from) ?? undefined, to: parseDayKey(to) ?? undefined }}
          onSelect={(r) => onChange(r?.from ? toDayKey(r.from) : "", r?.to ? toDayKey(r.to) : "")}
          defaultMonth={parseDayKey(from) ?? undefined}
          className="mt-1"
        />
        <div className="mt-2 flex justify-between gap-2">
          <button type="button" onClick={() => onChange("", "")} disabled={!active} className={hbtn.outline}>
            Clear
          </button>
          <button type="button" onClick={() => setOpen(false)} className={hbtn.primary}>
            Done
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

const nightsGuests = (b: Booking) =>
  `${b.nights} night${b.nights > 1 ? "s" : ""} · ${b.adults + b.children} guest${b.adults + b.children > 1 ? "s" : ""}`;

/** Room number first — that's what the desk works with — and the room's name underneath. */
function RoomCell({ b }: { b: Booking }) {
  const db = useHotelDB();
  const rooms = unitNumbers(db, b.unitIds);
  const missing = rooms.length < b.rooms && b.status !== "cancelled" && b.status !== "no-show";
  return (
    <div className="min-w-0">
      <p className={missing && !rooms.length ? "font-medium text-amber-800" : "font-medium text-neutral-900"}>
        {rooms.length ? `Room ${rooms.join(", ")}` : "Not assigned"}
        {missing && rooms.length > 0 && <span className="ml-1.5 text-[13px] font-medium text-amber-800">+{b.rooms - rooms.length} to assign</span>}
      </p>
      <p className="text-[13px] text-neutral-600">
        {b.roomName}
        {b.rooms > 1 ? ` ×${b.rooms}` : ""}
      </p>
    </div>
  );
}

/** Total and one plain line on what's owed — no badge, no bar. */
function PayLine({ b }: { b: Booking }) {
  const due = dueOf(b);
  const credit = creditOf(b);
  const live = isLive(b);
  const paid = paidOf(b);
  const [text, tone] =
    credit > 0
      ? [`${taka(credit)} to refund`, "text-violet-700"]
      : !live
        ? [paid > 0 ? `${taka(paid)} kept` : "No charge", "text-neutral-600"]
        : due === 0
          ? ["Paid in full", "text-emerald-700"]
          : paid > 0
            ? [`${taka(due)} due`, "text-amber-800"]
            : ["Not paid", "text-amber-800"];
  return (
    <div className="whitespace-nowrap">
      <p className="font-semibold tabular-nums text-neutral-900">{taka(folioTotal(b))}</p>
      <p className={cn("text-[13px] font-medium tabular-nums", tone)}>{text}</p>
    </div>
  );
}

const actionBtn = cn(
  "inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-md border border-sky-300 bg-white px-3 text-sm font-semibold text-sky-800 transition hover:border-sky-500 hover:bg-sky-50",
  focusRing
);

/** The one thing the desk most likely wants to do with this booking next. */
function RowAction({ b, today, from }: { b: Booking; today: string; from: string }) {
  const router = useRouter();
  const go = (e: React.MouseEvent, action: string) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`${ADMIN}/bookings/${b.id}?do=${action}&from=${encodeURIComponent(from)}`);
  };
  if (b.status === "pending")
    return (
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          const r = confirmBooking(b.id);
          if (r.ok) toast.success(`${b.code} confirmed`);
          else toast.error(r.error);
        }}
        className={actionBtn}
      >
        <BadgeCheck className="size-4" aria-hidden /> Confirm
      </button>
    );
  if (b.status === "confirmed" && b.checkIn <= today && today < b.checkOut)
    return (
      <button type="button" onClick={(e) => go(e, "checkin")} className={actionBtn}>
        <LogIn className="size-4" aria-hidden /> Check in
      </button>
    );
  if (b.status === "checked-in" && b.checkOut <= today)
    return (
      <button type="button" onClick={(e) => go(e, "checkout")} className={actionBtn}>
        <LogOut className="size-4" aria-hidden /> Check out
      </button>
    );
  // Upcoming stays settle at check-in, so collecting is offered once the guest has arrived.
  if ((b.status === "checked-in" || b.status === "checked-out") && dueOf(b) > 0)
    return (
      <button type="button" onClick={(e) => go(e, "pay")} className={cn(actionBtn, "border-neutral-300 text-neutral-800 hover:border-sky-400 hover:text-sky-800")}>
        <Wallet className="size-4" aria-hidden /> Collect
      </button>
    );
  return null;
}

function TodayTag({ children }: { children: React.ReactNode }) {
  return <span className="rounded-md bg-sky-50 px-1.5 py-0.5 text-xs font-medium text-sky-800 ring-1 ring-inset ring-sky-200">{children}</span>;
}

function Avatar({ name }: { name: string }) {
  return (
    <span aria-hidden className="flex size-9 shrink-0 items-center justify-center rounded-full bg-sky-100 text-[13px] font-semibold text-sky-800">
      {initials(name)}
    </span>
  );
}
