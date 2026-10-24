"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { BadgeCheck, CalendarDays, ChevronDown, ChevronRight, ClipboardList, Download, LogIn, LogOut, Plus, Search, SlidersHorizontal, Wallet, X } from "lucide-react";
import { Calendar } from "@/src/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/src/components/ui/popover";
import { dateLabel, downloadCsv, formatDateTime, initials, rangeLabel, shortRange, sourceLabels, statusDots, statusLabels, statusStyles, taka, todayKey } from "@/src/lib/hotel-store/format";
import { isArrival } from "@/src/lib/hotel-store/frontDesk";
import { confirmBooking, creditOf, dueOf, folioTotal, isLive, paidOf, paymentStatus, unitNumbers, useHotelDB } from "@/src/lib/hotel-store/store";
import type { Booking, BookingSource } from "@/src/lib/hotel-store/types";
import { parseDayKey, toDayKey } from "@/src/lib/hotelDates";
import { useT } from "@/src/lib/hotel-store/i18n";
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
  const t = useT();
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
  const [showFilters, setShowFilters] = useState(false);
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

  const counts = Object.fromEntries((Object.keys(tabTest) as Tab[]).map((k) => [k, base.filter((b) => tabTest[k](b, today)).length])) as Record<Tab, number>;
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
    source !== "any" && { key: "source", label: `${t("Source")}: ${t(sourceLabels[source])}`, clear: () => setSource("any") },
    pay !== "any" && { key: "pay", label: `${t("Payment")}: ${t(payLabels[pay])}`, clear: () => setPay("any") },
    (from || to) && {
      key: "stay",
      label: `${t("Staying")}: ${stayLabel(from, to)}`,
      clear: () => {
        setFrom("");
        setTo("");
      },
    },
  ].filter(Boolean) as { key: string; label: string; clear: () => void }[];
  const filtering = chips.length > 0 || !!q.trim();
  const activeFilters = chips.length + (sort !== "created" ? 1 : 0) + (tab !== "all" ? 1 : 0);
  const clearAll = () => {
    setQ("");
    setSource("any");
    setPay("any");
    setFrom("");
    setTo("");
    resetPage();
  };
  const pickTab = (v: Tab) => {
    setTab(v);
    resetPage();
  };

  return (
    <div className="mx-auto max-w-[1600px]">
      {/* White header card, same as the Rooms page. */}
      <div className="mb-3 flex items-center justify-between gap-3 rounded-md border border-neutral-200 bg-white px-4 py-3 sm:mb-4 sm:px-5 sm:py-3.5">
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-neutral-900 sm:text-2xl">{t("Bookings")}</h1>
          <p className="mt-0.5 truncate text-[13px] text-neutral-600 sm:text-sm">
            {t("{n} bookings · {p} waiting for confirmation", { n: db.bookings.length, p: db.bookings.filter((b) => b.status === "pending").length })}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button onClick={exportCsv} className={cn(hbtn.outline, "size-10 px-0 sm:w-auto sm:px-4")}>
            <Download className="size-4" aria-hidden /> <span className="hidden sm:inline">{t("Export CSV")}</span>
            <span className="sr-only sm:hidden">{t("Export CSV")}</span>
          </button>
          <Link href={`${ADMIN}/bookings/new`} className={hbtn.primary}>
            <Plus className="size-4" aria-hidden /> <span className="sm:hidden">{t("New")}</span>
            <span className="hidden sm:inline">{t("New booking")}</span>
          </Link>
        </div>
      </div>

      <div className={tableCardClass}>
        <div className="hidden lg:block">
          <ViewPills tab={tab} counts={counts} onChange={pickTab} />
        </div>

        <div className="space-y-3 border-b border-neutral-100 p-3 sm:p-4">
          <div className="flex flex-col gap-2 lg:grid lg:grid-cols-[minmax(16rem,1fr)_repeat(4,auto)]">
            <div className="flex gap-2">
            <label className="relative block min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-500" aria-hidden />
              <input
                type="search"
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  resetPage();
                }}
                placeholder={t("Search guest, phone, booking code or room no.")}
                aria-label={t("Search bookings")}
                className={cn(control, "w-full pl-9 pr-3 placeholder:text-neutral-500")}
              />
            </label>
            {/* Phones: the four filters fold away behind one button. */}
            <button
              type="button"
              onClick={() => setShowFilters((v) => !v)}
              aria-expanded={showFilters}
              className={cn(control, "relative flex shrink-0 items-center gap-1.5 px-3 font-medium lg:hidden", (showFilters || activeFilters > 0) && "border-sky-500 bg-sky-50 text-sky-900")}
            >
              <SlidersHorizontal className="size-4" aria-hidden />
              <span className="sr-only sm:not-sr-only">{t("Filters")}</span>
              {activeFilters > 0 && <span className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-sky-600 text-[11px] font-bold text-white">{activeFilters}</span>}
            </button>
            </div>
            <div className={cn("grid grid-cols-2 gap-2 lg:contents", !showFilters && "hidden")}>
            {/* Phones and tablets: the booking views live here instead of the pill row. */}
            <div className="col-span-2 lg:hidden">
              <ToolbarSelect
                label="Booking views"
                value={tab}
                active={tab !== "all"}
                onChange={pickTab}
                options={views.map((v) => ({ value: v.tab, label: v.label, count: v.group < 2 ? counts[v.tab] : undefined }))}
              />
            </div>
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
              onChange={(f, tt) => {
                setFrom(f);
                setTo(tt);
                resetPage();
              }}
            />
            <ToolbarSelect label="Sort" value={sort} onChange={setSort} options={(Object.keys(sortLabels) as Sort[]).map((s) => ({ value: s, label: sortLabels[s] }))} />
            </div>
          </div>

          {filtering && (
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="text-neutral-700">
                <b className="font-semibold text-neutral-900">{list.length}</b> {list.length === 1 ? t("result") : t("results")}
              </span>
              {chips.map((c) => (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => {
                    c.clear();
                    resetPage();
                  }}
                  aria-label={`${t("Remove filter")} ${c.label}`}
                  className={cn("inline-flex h-8 items-center gap-1 rounded-full bg-sky-50 pl-3 pr-2 font-medium text-sky-900 ring-1 ring-inset ring-sky-200 transition hover:bg-sky-100", focusRing)}
                >
                  {c.label}
                  <X className="size-3.5" aria-hidden />
                </button>
              ))}
              <button type="button" onClick={clearAll} className={cn("rounded-sm font-medium text-neutral-600 hover:text-sky-800 hover:underline", focusRing)}>
                {t("Clear all")}
              </button>
            </div>
          )}
        </div>

        {list.length === 0 ? (
          <Empty
            icon={ClipboardList}
            title={filtering ? "No bookings match" : tab === "all" ? "No bookings yet" : t("Nothing in “{view}”", { view: t(views.find((v) => v.tab === tab)?.label ?? "") })}
            text={filtering ? "Try another search, or clear the filters." : tab === "all" ? "New bookings will show up here." : "Pick another view above."}
          >
            {filtering && (
              <button onClick={clearAll} className={cn(hbtn.outline, "mt-2")}>
                {t("Clear filters")}
              </button>
            )}
          </Empty>
        ) : (
          <>
            {/* Phones and small tablets: one card per booking instead of a sideways-scrolling table. */}
            <ul className="divide-y divide-neutral-100 md:hidden">
              {page.rows.map((b) => (
                <li key={b.id}>
                  <Link href={detail(b)} className={cn("flex items-center gap-3 px-4 py-3 transition active:bg-sky-50/60", focusRing, "focus-visible:ring-inset")}>
                    <DateTile b={b} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate font-semibold text-neutral-900">{b.guest.name}</p>
                        <StatusText status={b.status} />
                      </div>
                      <div className="mt-1 flex items-center justify-between gap-2 text-[13px]">
                        <p className="truncate text-neutral-600">
                          <RoomShort b={b} /> · {shortRange(b.checkIn, b.checkOut)}
                        </p>
                        <PayShort b={b} />
                      </div>
                    </div>
                    <ChevronRight className="size-4 shrink-0 text-neutral-300" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>

            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[880px] text-sm">
                <thead className="border-b border-neutral-200 bg-neutral-50/80 text-left text-xs uppercase tracking-wide text-neutral-500">
                  <tr>
                    <th className="py-3 pl-4 pr-3 font-medium">{t("Guest")}</th>
                    <th className="px-3 py-3 font-medium">{t("Stay")}</th>
                    <th className="px-3 py-3 font-medium">{t("Room")}</th>
                    <th className="px-3 py-3 font-medium">{t("Status")}</th>
                    <th className="px-3 py-3 font-medium">{t("Payment")}</th>
                    <th className="py-3 pr-4 text-right font-medium">
                      <span className="sr-only">{t("Actions")}</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {page.rows.map((b) => {
                    const arrivesToday = b.checkIn === today && (b.status === "confirmed" || b.status === "pending");
                    const leavesToday = b.checkOut === today && b.status === "checked-in";
                    return (
                      <tr key={b.id} onClick={() => router.push(detail(b))} className="group cursor-pointer transition hover:bg-sky-50/50">
                        <td className="py-4 pl-4 pr-3">
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
                                {b.groupId && <span className="ml-1.5 rounded bg-violet-50 px-1.5 py-px text-xs font-medium text-violet-800">{t("Group")}</span>}
                                {" · "}
                                {t(sourceLabels[b.source])}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-4">
                          <p className="flex flex-wrap items-center gap-1.5 whitespace-nowrap text-neutral-900">
                            {rangeLabel(b.checkIn, b.checkOut)}
                            {arrivesToday && <TodayTag>{t("Arrives today")}</TodayTag>}
                            {leavesToday && <TodayTag>{t("Leaves today")}</TodayTag>}
                          </p>
                          <p className="text-[13px] text-neutral-600">{nightsGuests(b, t)}</p>
                        </td>
                        <td className="px-3 py-4">
                          <RoomCell b={b} />
                        </td>
                        <td className="px-3 py-4">
                          <StatusBadge status={b.status} />
                        </td>
                        <td className="px-3 py-4">
                          <PayLine b={b} />
                        </td>
                        <td className="py-4 pr-4">
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
  const t = useT();
  return (
    // Phones swipe through the views in one line; wider screens wrap them.
    <div role="group" aria-label={t("Booking views")} className="flex items-center gap-1.5 overflow-x-auto border-b border-neutral-100 p-3 [scrollbar-width:none] sm:flex-wrap sm:px-4">
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
              {t(v.label)}
              {v.group < 2 && (
                <span
                  className={cn(
                    "min-w-6 rounded-full px-1.5 text-center text-[13px] font-semibold tabular-nums leading-5",
                    selected ? "bg-white/20 text-white" : v.tab === "pending" && n > 0 ? "bg-violet-100 text-violet-800" : "bg-neutral-100 text-neutral-700"
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
  options: { value: T; label: string; count?: number }[];
  /** A filter that's narrowing the list gets the brand outline, so it's easy to spot. */
  active?: boolean;
}) {
  const t = useT();
  return (
    <label className="relative block min-w-0">
      <span className="sr-only">{t(label)}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className={cn(control, "w-full appearance-none pl-3 pr-9 lg:w-auto", active && "border-sky-500 bg-sky-50 font-medium text-sky-900")}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {`${t(o.label)}${o.count !== undefined ? ` (${o.count})` : ""}`}
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
  const t = useT();
  const [open, setOpen] = useState(false);
  const active = !!(from || to);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button type="button" aria-label={active ? `${t("Staying between")} ${stayLabel(from, to)}` : t("Filter by stay dates")} className={cn(control, "flex w-full items-center gap-2 pl-3 pr-3 lg:w-auto", active && "border-sky-500 bg-sky-50 font-medium text-sky-900")}>
          <CalendarDays className="size-4 shrink-0 text-neutral-500" aria-hidden />
          <span className="whitespace-nowrap">{active ? stayLabel(from, to) : t("Any dates")}</span>
          <ChevronDown className="ml-auto size-4 shrink-0 text-neutral-500" aria-hidden />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-auto bg-white p-3">
        <p className="px-1 text-sm font-semibold text-neutral-900">{t("Staying between")}</p>
        <p className="px-1 text-[13px] text-neutral-600">{t("Shows stays that overlap these dates.")}</p>
        <Calendar
          mode="range"
          selected={{ from: parseDayKey(from) ?? undefined, to: parseDayKey(to) ?? undefined }}
          onSelect={(r) => onChange(r?.from ? toDayKey(r.from) : "", r?.to ? toDayKey(r.to) : "")}
          defaultMonth={parseDayKey(from) ?? undefined}
          className="mt-1"
        />
        <div className="mt-2 flex justify-between gap-2">
          <button type="button" onClick={() => onChange("", "")} disabled={!active} className={hbtn.outline}>
            {t("Clear")}
          </button>
          <button type="button" onClick={() => setOpen(false)} className={hbtn.primary}>
            {t("Done")}
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

const nightsGuests = (b: Booking, t: ReturnType<typeof useT>) =>
  `${t(b.nights > 1 ? "{n} nights" : "{n} night", { n: b.nights })} · ${t(b.adults + b.children > 1 ? "{n} guests" : "{n} guest", { n: b.adults + b.children })}`;

/** Room number first — that's what the desk works with — and the room's name underneath. */
function RoomCell({ b }: { b: Booking }) {
  const t = useT();
  const db = useHotelDB();
  const rooms = unitNumbers(db, b.unitIds);
  const missing = rooms.length < b.rooms && b.status !== "cancelled" && b.status !== "no-show";
  return (
    <div className="min-w-0">
      <p className={missing && !rooms.length ? "font-medium text-rose-700" : "font-medium text-neutral-900"}>
        {rooms.length ? `${t("Room")} ${rooms.join(", ")}` : t("Not assigned")}
        {missing && rooms.length > 0 && <span className="ml-1.5 text-[13px] font-medium text-rose-700">{t("+{n} to assign", { n: b.rooms - rooms.length })}</span>}
      </p>
      <p className="text-[13px] text-neutral-600">
        {b.roomName}
        {b.rooms > 1 ? ` ×${b.rooms}` : ""}
      </p>
    </div>
  );
}

/** Phone list: "6–8 Nov" in the same month, otherwise "30 Oct – 2 Nov". */
/** Phone list: room number only, or a red "No room" when one still needs assigning. */
function RoomShort({ b }: { b: Booking }) {
  const t = useT();
  const db = useHotelDB();
  const rooms = unitNumbers(db, b.unitIds);
  if (rooms.length) return <span>{`${t("Room")} ${rooms.join(", ")}`}</span>;
  return <span className={isLive(b) ? "font-medium text-rose-700" : undefined}>{t("No room")}</span>;
}

/** Phone list: small coloured status pill. */
function StatusText({ status }: { status: Booking["status"] }) {
  const t = useT();
  return (
    <span className={cn("inline-flex max-w-[50%] shrink-0 items-center gap-1 truncate rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset", statusStyles[status])}>
      <span aria-hidden className={cn("size-1.5 shrink-0 rounded-full", statusDots[status])} />
      <span className="truncate">{t(statusLabels[status])}</span>
    </span>
  );
}

const tileTones: Record<Booking["status"], string> = {
  pending: "bg-violet-50 text-violet-700",
  confirmed: "bg-sky-50 text-sky-700",
  "checked-in": "bg-emerald-50 text-emerald-700",
  "checked-out": "bg-neutral-100 text-neutral-500",
  cancelled: "bg-rose-50 text-rose-600",
  "no-show": "bg-slate-100 text-slate-600",
};

/** Phone list: check-in day as a small calendar tile, tinted by status so the list scans at a glance. */
function DateTile({ b }: { b: Booking }) {
  return (
    <span aria-hidden className={cn("flex size-11 shrink-0 flex-col items-center justify-center rounded-xl leading-none", tileTones[b.status])}>
      <span className="text-[17px] font-bold tabular-nums">{Number(b.checkIn.slice(8))}</span>
      <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide">{dateLabel(b.checkIn, "MMM")}</span>
    </span>
  );
}

/** Phone list: only what needs attention — what's owed or to refund; settled bookings show their total quietly. */
function PayShort({ b }: { b: Booking }) {
  const t = useT();
  const due = dueOf(b);
  const credit = creditOf(b);
  if (credit > 0) return <span className="shrink-0 font-medium tabular-nums text-violet-700">{t("{amount} to refund", { amount: taka(credit) })}</span>;
  if (isLive(b) && due > 0) return <span className="shrink-0 font-medium tabular-nums text-rose-700">{t("{amount} due", { amount: taka(due) })}</span>;
  return <span className="shrink-0 tabular-nums text-neutral-500">{taka(folioTotal(b))}</span>;
}

/** Total and one plain line on what's owed — no badge, no bar. */
function PayLine({ b }: { b: Booking }) {
  const t = useT();
  const due = dueOf(b);
  const credit = creditOf(b);
  const live = isLive(b);
  const paid = paidOf(b);
  const [text, tone] =
    credit > 0
      ? [t("{amount} to refund", { amount: taka(credit) }), "text-violet-700"]
      : !live
        ? [paid > 0 ? t("{amount} kept", { amount: taka(paid) }) : t("No charge"), "text-neutral-600"]
        : due === 0
          ? [t("Paid in full"), "text-emerald-700"]
          : paid > 0
            ? [t("{amount} due", { amount: taka(due) }), "text-rose-700"]
            : [t("Not paid"), "text-rose-700"];
  return (
    <div className="whitespace-nowrap">
      <p className="font-semibold tabular-nums text-neutral-900">{taka(folioTotal(b))}</p>
      <p className={cn("text-[13px] font-medium tabular-nums", tone)}>{text}</p>
    </div>
  );
}

const actionBase = cn("inline-flex h-8 items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 text-[13px] font-semibold shadow-sm transition active:scale-[0.98]", focusRing);
const actionBtn = cn(actionBase, "bg-sky-600 text-white hover:bg-sky-700");
const actionTones = {
  confirm: cn(actionBase, "bg-emerald-600 text-white hover:bg-emerald-700"),
  checkout: cn(actionBase, "bg-neutral-900 text-white hover:bg-neutral-700"),
  collect: cn(actionBase, "border border-neutral-300 bg-white text-neutral-800 shadow-none hover:border-sky-400 hover:text-sky-800"),
};

/** The one thing the desk most likely wants to do with this booking next. */
function RowAction({ b, today, from }: { b: Booking; today: string; from: string }) {
  const t = useT();
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
          if (r.ok) toast.success(t("{code} confirmed", { code: b.code }));
          else toast.error(r.error);
        }}
        className={actionTones.confirm}
      >
        <BadgeCheck className="size-4" aria-hidden /> {t("Confirm")}
      </button>
    );
  if (b.status === "confirmed" && b.checkIn <= today && today < b.checkOut)
    return (
      <button type="button" onClick={(e) => go(e, "checkin")} className={actionBtn}>
        <LogIn className="size-4" aria-hidden /> {t("Check in")}
      </button>
    );
  if (b.status === "checked-in" && b.checkOut <= today)
    return (
      <button type="button" onClick={(e) => go(e, "checkout")} className={actionTones.checkout}>
        <LogOut className="size-4" aria-hidden /> {t("Check out")}
      </button>
    );
  // Upcoming stays settle at check-in, so collecting is offered once the guest has arrived.
  if ((b.status === "checked-in" || b.status === "checked-out") && dueOf(b) > 0)
    return (
      <button type="button" onClick={(e) => go(e, "pay")} className={actionTones.collect}>
        <Wallet className="size-4" aria-hidden /> {t("Collect")}
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
