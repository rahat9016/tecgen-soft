"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { toast } from "react-toastify";
import { ArrowUpDown, BadgeCheck, BedDouble, ChevronDown, ChevronRight, ClipboardList, Download, LogIn, LogOut, Plus, Search, SlidersHorizontal, Wallet, X } from "lucide-react";
import { downloadCsv, formatDateTime, initials, rangeLabel, sourceLabels, statusLabels, taka, todayKey } from "@/src/lib/hotel-store/format";
import { confirmBooking, creditOf, dueOf, folioTotal, isLive, paidOf, paymentStatus, unitNumbers, useHotelDB } from "@/src/lib/hotel-store/store";
import type { Booking, BookingSource } from "@/src/lib/hotel-store/types";
import { cn } from "@/src/lib/utils";
import { ADMIN, AdminHeader, Empty, Field, hbtn, inputClass, Pager, StatusBadge, tableCardClass, Tabs, usePagination } from "./ui";

type Tab = "all" | "arrivals" | "departures" | "in-house" | "upcoming" | "pending" | "checked-out" | "cancelled";

const tabTest: Record<Tab, (b: Booking, today: string) => boolean> = {
  all: () => true,
  arrivals: (b, t) => (b.status === "confirmed" || b.status === "pending") && b.checkIn <= t && t < b.checkOut,
  departures: (b, t) => b.status === "checked-in" && b.checkOut <= t,
  "in-house": (b) => b.status === "checked-in",
  upcoming: (b, t) => (b.status === "confirmed" || b.status === "pending") && b.checkIn > t,
  pending: (b) => b.status === "pending",
  "checked-out": (b) => b.status === "checked-out",
  cancelled: (b) => b.status === "cancelled" || b.status === "no-show",
};

/** Today's front-desk work, shown as big cards above the list. */
const todayCards: { tab: Tab; label: string; icon: typeof LogIn; tone: string }[] = [
  { tab: "arrivals", label: "Arriving today", icon: LogIn, tone: "text-sky-600 bg-sky-50" },
  { tab: "departures", label: "Departing today", icon: LogOut, tone: "text-orange-600 bg-orange-50" },
  { tab: "in-house", label: "In house", icon: BedDouble, tone: "text-emerald-600 bg-emerald-50" },
  { tab: "pending", label: "To confirm", icon: BadgeCheck, tone: "text-amber-600 bg-amber-50" },
];

/** The remaining views live in the tab strip. */
const tabLabels: Partial<Record<Tab, string>> = {
  all: "All bookings",
  upcoming: "Upcoming",
  "checked-out": "Checked out",
  cancelled: "Cancelled",
};

type PayFilter = "any" | "unpaid" | "partly" | "paid" | "refund";
const payTest: Record<PayFilter, (b: Booking) => boolean> = {
  any: () => true,
  unpaid: (b) => dueOf(b) > 0 && paidOf(b) <= 0,
  partly: (b) => dueOf(b) > 0 && paidOf(b) > 0,
  paid: (b) => dueOf(b) === 0 && creditOf(b) === 0 && paidOf(b) > 0,
  refund: (b) => creditOf(b) > 0,
};
const payLabels: Record<PayFilter, string> = { any: "Any payment", unpaid: "Unpaid", partly: "Partly paid", paid: "Paid in full", refund: "Refund due" };

export default function BookingsList() {
  const db = useHotelDB();
  const router = useRouter();
  const params = useSearchParams();
  const initial = params.get("status");
  const [tab, setTab] = useState<Tab>(initial === "checked-in" ? "in-house" : initial && initial in tabTest ? (initial as Tab) : "all");
  const [q, setQ] = useState("");
  const [type, setType] = useState("any");
  const [source, setSource] = useState<"any" | BookingSource>("any");
  const [pay, setPay] = useState<PayFilter>("any");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [sort, setSort] = useState<"created" | "checkin" | "checkin-desc">("created");
  const today = todayKey();

  const base = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return db.bookings.filter((b) => {
      if (type !== "any" && b.roomTypeId !== type) return false;
      if (source !== "any" && b.source !== source) return false;
      if (!payTest[pay](b)) return false;
      if (from && b.checkOut <= from) return false;
      if (to && b.checkIn > to) return false;
      if (!needle) return true;
      const rooms = unitNumbers(db, b.unitIds).join(" ");
      return [b.code, b.guest.name, b.guest.phone, b.guest.email, rooms, b.roomName].some((v) => v?.toLowerCase().includes(needle));
    });
  }, [db, q, type, source, pay, from, to]);

  const counts = Object.fromEntries((Object.keys(tabTest) as Tab[]).map((t) => [t, base.filter((b) => tabTest[t](b, today)).length])) as Record<Tab, number>;
  const list = base
    .filter((b) => tabTest[tab](b, today))
    .sort((a, b) => (sort === "created" ? b.createdAt.localeCompare(a.createdAt) : sort === "checkin" ? a.checkIn.localeCompare(b.checkIn) : b.checkIn.localeCompare(a.checkIn)));
  const page = usePagination(list, 15);

  const exportCsv = () =>
    downloadCsv(`bookings-${today}.csv`, [
      ["Booking", "Created", "Guest", "Phone", "Email", "Room type", "Rooms", "Room no.", "Check-in", "Check-out", "Nights", "Adults", "Children", "Status", "Source", "Total", "Paid", "Due", "Payment status"],
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

  const resetPage = () => page.setPage(1);
  const typeName = db.roomTypes.find((t) => t.id === type)?.name;
  const chips = [
    type !== "any" && { key: "type", label: `Room: ${typeName ?? type}`, clear: () => setType("any") },
    source !== "any" && { key: "source", label: `Source: ${sourceLabels[source]}`, clear: () => setSource("any") },
    pay !== "any" && { key: "pay", label: `Payment: ${payLabels[pay]}`, clear: () => setPay("any") },
    (from || to) && {
      key: "stay",
      label: `Stay: ${from ? format(new Date(from), "dd MMM") : "…"} – ${to ? format(new Date(to), "dd MMM") : "…"}`,
      clear: () => {
        setFrom("");
        setTo("");
      },
    },
  ].filter(Boolean) as { key: string; label: string; clear: () => void }[];
  const clearAll = () => {
    setQ("");
    setType("any");
    setSource("any");
    setPay("any");
    setFrom("");
    setTo("");
    resetPage();
  };
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="mx-auto max-w-[1600px]">
      <AdminHeader
        title="Bookings"
        subtitle={`${db.bookings.length} bookings · ${counts.pending} waiting for confirmation`}
        actions={
          <>
            <button onClick={exportCsv} className={hbtn.outline}>
              <Download className="size-4" /> <span className="hidden sm:inline">Export CSV</span>
            </button>
            <Link href={`${ADMIN}/bookings/new`} className={hbtn.primary}>
              <Plus className="size-4" /> New booking
            </Link>
          </>
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {todayCards.map((c) => {
          const on = tab === c.tab;
          return (
            <button
              key={c.tab}
              type="button"
              onClick={() => {
                setTab(on ? "all" : c.tab);
                resetPage();
              }}
              aria-pressed={on}
              className={cn(
                "flex items-center gap-3 rounded-md border bg-white p-4 text-left transition",
                on ? "border-sky-500 ring-2 ring-sky-100" : "border-neutral-200 hover:border-sky-300"
              )}
            >
              <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-md", c.tone)}>
                <c.icon className="size-5" />
              </span>
              <span className="min-w-0">
                <span className="block text-2xl font-bold tabular-nums leading-none text-neutral-900">{counts[c.tab]}</span>
                <span className="mt-1 block truncate text-sm text-neutral-500">{c.label}</span>
              </span>
            </button>
          );
        })}
      </div>

      <div className={tableCardClass}>
        <Tabs
          value={tab in tabLabels ? tab : ("" as Tab)}
          onChange={(t) => {
            setTab(t);
            resetPage();
          }}
          tabs={(Object.keys(tabLabels) as Tab[]).map((t) => ({ value: t, label: tabLabels[t]!, count: counts[t] }))}
        />
        {!(tab in tabLabels) && (
          <div className="flex items-center justify-between gap-2 border-b border-neutral-100 bg-sky-50/50 px-4 py-2.5 text-sm">
            <span className="font-medium text-sky-900">Showing: {todayCards.find((c) => c.tab === tab)?.label}</span>
            <button type="button" onClick={() => setTab("all")} className="inline-flex items-center gap-1 text-xs font-medium text-sky-700 hover:underline">
              <X className="size-3.5" /> Show all
            </button>
          </div>
        )}

        <div className="space-y-3 border-b border-neutral-100 p-3 sm:p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <label className="relative block flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
              <input
                type="search"
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  resetPage();
                }}
                placeholder="Search by code, guest, phone, email or room no."
                aria-label="Search bookings"
                className={cn(inputClass, "pl-9")}
              />
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowFilters((v) => !v)}
                aria-expanded={showFilters}
                className={cn(hbtn.outline, "flex-1 sm:flex-none", (showFilters || chips.length > 0) && "border-sky-300 text-sky-700")}
              >
                <SlidersHorizontal className="size-4" /> Filters
                {chips.length > 0 && <span className="rounded-full bg-sky-600 px-1.5 text-[11px] font-semibold leading-5 text-white">{chips.length}</span>}
              </button>
              <label className="relative flex-1 sm:flex-none">
                <ArrowUpDown className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as typeof sort)}
                  aria-label="Sort bookings"
                  className="h-10 w-full appearance-none rounded-md border border-neutral-200 bg-white pl-9 pr-8 text-sm text-neutral-700 outline-none transition hover:border-sky-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                >
                  <option value="created">Newest first</option>
                  <option value="checkin">Check-in: soonest</option>
                  <option value="checkin-desc">Check-in: latest</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
              </label>
            </div>
          </div>

          {showFilters && (
            <div className="grid gap-3 rounded-md border border-neutral-100 bg-neutral-50/70 p-3 sm:grid-cols-2 lg:grid-cols-4">
              <Field label="Room type">
                <select value={type} onChange={(e) => { setType(e.target.value); resetPage(); }} className={inputClass}>
                  <option value="any">All room types</option>
                  {db.roomTypes.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Source">
                <select value={source} onChange={(e) => { setSource(e.target.value as typeof source); resetPage(); }} className={inputClass}>
                  <option value="any">All sources</option>
                  {(Object.keys(sourceLabels) as BookingSource[]).map((s) => (
                    <option key={s} value={s}>
                      {sourceLabels[s]}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Payment">
                <select value={pay} onChange={(e) => { setPay(e.target.value as PayFilter); resetPage(); }} className={inputClass}>
                  {(Object.keys(payLabels) as PayFilter[]).map((p) => (
                    <option key={p} value={p}>
                      {payLabels[p]}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Staying between">
                <span className="grid grid-cols-2 gap-2">
                  <input type="date" value={from} max={to || undefined} onChange={(e) => { setFrom(e.target.value); resetPage(); }} aria-label="Stay from" className={inputClass} />
                  <input type="date" value={to} min={from || undefined} onChange={(e) => { setTo(e.target.value); resetPage(); }} aria-label="Stay to" className={inputClass} />
                </span>
              </Field>
            </div>
          )}

          {(chips.length > 0 || q) && (
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-neutral-500">
                <b className="font-semibold text-neutral-800">{list.length}</b> result{list.length === 1 ? "" : "s"}
              </span>
              {chips.map((c) => (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => {
                    c.clear();
                    resetPage();
                  }}
                  className="inline-flex items-center gap-1 rounded-full bg-sky-50 py-1 pl-2.5 pr-1.5 font-medium text-sky-800 ring-1 ring-inset ring-sky-200 transition hover:bg-sky-100"
                >
                  {c.label}
                  <X className="size-3.5" aria-label="Remove filter" />
                </button>
              ))}
              <button type="button" onClick={clearAll} className="font-medium text-neutral-500 hover:text-rose-600 hover:underline">
                Clear all
              </button>
            </div>
          )}
        </div>

        {list.length === 0 ? (
          <Empty icon={ClipboardList} title="No bookings match" text="Try another tab or clear the filters.">
            {(chips.length > 0 || q) && (
              <button onClick={clearAll} className={cn(hbtn.small, "mt-2")}>
                Clear filters
              </button>
            )}
          </Empty>
        ) : (
          <>
            {/* Phones and small tablets: one card per booking instead of a sideways-scrolling table. */}
            <ul className="divide-y divide-neutral-100 md:hidden">
              {page.rows.map((b) => {
                const rooms = unitNumbers(db, b.unitIds);
                return (
                  <li key={b.id}>
                    <Link href={`${ADMIN}/bookings/${b.id}`} className="block space-y-2.5 p-4 transition active:bg-sky-50/60">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <Avatar name={b.guest.name} />
                          <div className="min-w-0">
                            <p className="truncate font-medium text-neutral-900">{b.guest.name}</p>
                            <p className="font-mono text-xs font-semibold text-sky-700">
                              {b.code}
                              {b.groupId && <span className="ml-1.5 rounded bg-violet-50 px-1 py-px font-sans text-[10px] font-semibold text-violet-700">Group</span>}
                            </p>
                          </div>
                        </div>
                        <StatusBadge status={b.status} />
                      </div>
                      <div className="grid grid-cols-2 gap-2 rounded-md bg-neutral-50 p-2.5 text-xs">
                        <div className="min-w-0">
                          <p className="text-neutral-400">Stay</p>
                          <p className="truncate font-medium text-neutral-800">{rangeLabel(b.checkIn, b.checkOut)}</p>
                          <p className="text-neutral-500">{nightsGuests(b)}</p>
                        </div>
                        <div className="min-w-0">
                          <p className="text-neutral-400">Room</p>
                          <p className="truncate font-medium text-neutral-800">{b.roomName}</p>
                          <RoomNo b={b} rooms={rooms} />
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <PayLine b={b} />
                        <RowAction b={b} today={today} />
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[880px] text-sm">
                <thead className="border-b border-neutral-100 bg-neutral-50/80 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                  <tr>
                    <th className="py-3 pl-4 pr-3">Guest</th>
                    <th className="px-3 py-3">Stay</th>
                    <th className="px-3 py-3">Room</th>
                    <th className="px-3 py-3">Status</th>
                    <th className="px-3 py-3">Payment</th>
                    <th className="py-3 pr-4 text-right" aria-label="Actions" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {page.rows.map((b) => {
                    const rooms = unitNumbers(db, b.unitIds);
                    const arrivesToday = b.checkIn === today;
                    const leavesToday = b.checkOut === today && b.status === "checked-in";
                    return (
                      <tr key={b.id} onClick={() => router.push(`${ADMIN}/bookings/${b.id}`)} className="group cursor-pointer transition hover:bg-sky-50/50">
                        <td className="py-3 pl-4 pr-3">
                          <div className="flex items-center gap-3">
                            <Avatar name={b.guest.name} />
                            <div className="min-w-0">
                              <p className="truncate font-medium text-neutral-900">{b.guest.name}</p>
                              <p className="truncate text-xs text-neutral-500">
                                <Link
                                  href={`${ADMIN}/bookings/${b.id}`}
                                  onClick={(e) => e.stopPropagation()}
                                  className="font-mono font-semibold text-sky-700 hover:underline"
                                >
                                  {b.code}
                                </Link>
                                {b.groupId && <span className="ml-1.5 rounded bg-violet-50 px-1 py-px font-sans text-[10px] font-semibold text-violet-700">Group</span>}
                                {" · "}
                                {sourceLabels[b.source]}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <p className="flex items-center gap-1.5 whitespace-nowrap text-neutral-800">
                            {rangeLabel(b.checkIn, b.checkOut)}
                            {arrivesToday && <TodayTag>Arrives today</TodayTag>}
                            {leavesToday && <TodayTag>Leaves today</TodayTag>}
                          </p>
                          <p className="text-xs text-neutral-500">{nightsGuests(b)}</p>
                        </td>
                        <td className="px-3 py-3">
                          <p className="text-neutral-800">
                            {b.roomName}
                            {b.rooms > 1 ? ` ×${b.rooms}` : ""}
                          </p>
                          <RoomNo b={b} rooms={rooms} />
                        </td>
                        <td className="px-3 py-3">
                          <StatusBadge status={b.status} />
                        </td>
                        <td className="px-3 py-3">
                          <PayLine b={b} />
                        </td>
                        <td className="py-3 pr-4">
                          <div className="flex items-center justify-end gap-2">
                            <RowAction b={b} today={today} />
                            <ChevronRight className="size-4 text-neutral-300 transition group-hover:translate-x-0.5 group-hover:text-sky-600" />
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

const nightsGuests = (b: Booking) =>
  `${b.nights} night${b.nights > 1 ? "s" : ""} · ${b.adults + b.children} guest${b.adults + b.children > 1 ? "s" : ""}`;

function RoomNo({ b, rooms }: { b: Booking; rooms: string[] }) {
  const missing = rooms.length < b.rooms && b.status !== "cancelled" && b.status !== "no-show";
  return (
    <p className={missing ? "text-xs font-medium text-amber-600" : "text-xs text-neutral-500"}>
      {rooms.length ? `Room ${rooms.join(", ")}` : "Not assigned"}
    </p>
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
        ? [paid > 0 ? `${taka(paid)} kept` : "No charge", "text-neutral-400"]
        : due === 0
          ? ["Paid in full", "text-emerald-600"]
          : paid > 0
            ? [`${taka(due)} due`, "text-amber-700"]
            : ["Not paid", "text-rose-600"];
  return (
    <div className="whitespace-nowrap">
      <p className="font-semibold tabular-nums text-neutral-900">{taka(folioTotal(b))}</p>
      <p className={cn("text-xs font-medium tabular-nums", tone)}>{text}</p>
    </div>
  );
}

/** The one thing the desk most likely wants to do with this booking next. */
function RowAction({ b, today }: { b: Booking; today: string }) {
  const router = useRouter();
  const go = (e: React.MouseEvent, action: string) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`${ADMIN}/bookings/${b.id}?do=${action}`);
  };
  const btn = "inline-flex h-8 items-center gap-1.5 whitespace-nowrap rounded-md px-3 text-xs font-semibold transition";
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
        className={cn(btn, "bg-amber-500 text-white hover:bg-amber-600")}
      >
        <BadgeCheck className="size-3.5" /> Confirm
      </button>
    );
  if (b.status === "confirmed" && b.checkIn <= today && today < b.checkOut)
    return (
      <button type="button" onClick={(e) => go(e, "checkin")} className={cn(btn, "bg-emerald-600 text-white hover:bg-emerald-700")}>
        <LogIn className="size-3.5" /> Check in
      </button>
    );
  if (b.status === "checked-in" && b.checkOut <= today)
    return (
      <button type="button" onClick={(e) => go(e, "checkout")} className={cn(btn, "bg-orange-500 text-white hover:bg-orange-600")}>
        <LogOut className="size-3.5" /> Check out
      </button>
    );
  if (isLive(b) && dueOf(b) > 0)
    return (
      <button type="button" onClick={(e) => go(e, "pay")} className={cn(btn, "border border-neutral-200 bg-white text-neutral-700 hover:border-sky-400 hover:text-sky-700")}>
        <Wallet className="size-3.5" /> Collect
      </button>
    );
  return null;
}

function TodayTag({ children }: { children: React.ReactNode }) {
  return <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 ring-1 ring-inset ring-amber-200">{children}</span>;
}

function Avatar({ name }: { name: string }) {
  return <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-sky-100 text-xs font-semibold text-sky-800">{initials(name)}</span>;
}
