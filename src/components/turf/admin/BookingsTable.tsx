"use client";

import { useMemo, useState } from "react";
import { CalendarRange, Plus, SquareStack } from "lucide-react";
import { FilterMenu, Pagination, SearchField, Table, td, th, usePagination } from "@/src/components/gadgets/admin/kit";
import { dateLabel, rangeLabel, statusLabels, taka, todayYmd } from "@/src/lib/turf-store/format";
import { dueOf, endMs, paidOf, startMs, useNow, useTurfDB } from "@/src/lib/turf-store/store";
import type { BookingStatus } from "@/src/lib/turf-store/types";
import { cn } from "@/src/lib/utils";
import { BookingStatusBadge, SportIcon, tbtn } from "../ui";
import BookingDrawer from "./BookingDrawer";
import NewBookingModal, { type SlotDraft } from "./NewBookingModal";

type Tab = "all" | BookingStatus | "unpaid";
type When = "all" | "today" | "upcoming" | "past";

export default function BookingsTable() {
  const db = useTurfDB();
  const now = useNow(30_000);
  const [tab, setTab] = useState<Tab>("all");
  const [when, setWhen] = useState<When>("all");
  const [courtId, setCourtId] = useState("all");
  const [q, setQ] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [draft, setDraft] = useState<SlotDraft | null>(null);
  const today = todayYmd();

  const scoped = useMemo(() => {
    const term = q.trim().toLowerCase();
    return db.bookings
      .filter((b) => courtId === "all" || b.courtId === courtId)
      .filter((b) =>
        when === "today" ? b.date === today : when === "upcoming" ? startMs(b) > now : when === "past" ? endMs(b) <= now : true
      )
      .filter((b) => !term || [b.code, b.customer.name, b.customer.phone, b.customer.team ?? ""].some((v) => v.toLowerCase().includes(term)));
  }, [db.bookings, courtId, when, q, today, now]);

  const rows = useMemo(
    () =>
      scoped
        .filter((b) => (tab === "all" ? true : tab === "unpaid" ? dueOf(b) > 0 && b.status !== "no-show" : b.status === tab))
        .sort((a, b) => (when === "upcoming" ? startMs(a) - startMs(b) : startMs(b) - startMs(a))),
    [scoped, tab, when]
  );
  const page = usePagination(rows, 15);

  const count = (t: Tab) => scoped.filter((b) => (t === "all" ? true : t === "unpaid" ? dueOf(b) > 0 && b.status !== "no-show" : b.status === t)).length;
  const tabs: { v: Tab; l: string }[] = [
    { v: "all", l: "All" },
    { v: "pending", l: "To verify" },
    { v: "confirmed", l: "Confirmed" },
    { v: "checked-in", l: "Playing" },
    { v: "completed", l: "Completed" },
    { v: "unpaid", l: "Due" },
    { v: "cancelled", l: "Cancelled" },
    { v: "no-show", l: "No-show" },
  ];

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Bookings</h1>
          <p className="mt-1 text-sm text-neutral-500">Verify advances, collect balances, check teams in and handle cancellations.</p>
        </div>
        <button onClick={() => setDraft({ courtId: db.courts[0]?.id ?? "", date: today, startHour: Math.max(db.settings.openHour, new Date().getHours() + 1) })} className={tbtn.green}>
          <Plus className="size-4" /> New booking
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        <div role="tablist" className="flex gap-1 overflow-x-auto border-b border-neutral-100 px-3 [scrollbar-width:none]">
          {tabs.map((t) => (
            <button
              key={t.v}
              role="tab"
              aria-selected={tab === t.v}
              onClick={() => setTab(t.v)}
              className={cn("relative flex shrink-0 items-center gap-2 px-3 py-3.5 text-sm font-medium", tab === t.v ? "text-neutral-900" : "text-neutral-500 hover:text-neutral-800")}
            >
              {t.l}
              <span className={cn("rounded-full px-1.5 text-[11px] tabular-nums", tab === t.v ? "bg-emerald-800 text-white" : "bg-neutral-100 text-neutral-500")}>{count(t.v)}</span>
              {tab === t.v && <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-lime-500" />}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2 border-b border-neutral-100 bg-neutral-50/50 p-3">
          <SearchField value={q} onChange={setQ} placeholder="Code, name, phone, team…" />
          <FilterMenu
            label="When"
            icon={CalendarRange}
            value={when}
            defaultValue="all"
            onChange={setWhen}
            options={[
              { value: "all", label: "Any time" },
              { value: "today", label: "Today" },
              { value: "upcoming", label: "Upcoming" },
              { value: "past", label: "Past" },
            ]}
          />
          <FilterMenu
            label="Court"
            icon={SquareStack}
            value={courtId}
            defaultValue="all"
            onChange={setCourtId}
            options={[{ value: "all", label: "All courts" }, ...db.courts.map((c) => ({ value: c.id, label: c.name }))]}
          />
        </div>
        <Table className="rounded-none border-0">
          <thead className="bg-neutral-50">
            <tr>
              <th className={th}>Booking</th>
              <th className={th}>Customer</th>
              <th className={th}>Court</th>
              <th className={th}>Slot</th>
              <th className={cn(th, "text-right")}>Total</th>
              <th className={cn(th, "text-right")}>Due</th>
              <th className={th}>Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {page.rows.map((b) => {
              const court = db.courts.find((c) => c.id === b.courtId);
              const due = dueOf(b);
              return (
                <tr key={b.id} onClick={() => setOpenId(b.id)} className="cursor-pointer hover:bg-neutral-50">
                  <td className={td}>
                    <p className="font-mono text-xs font-semibold text-neutral-900">{b.code}</p>
                    <p className="text-[11px] capitalize text-neutral-500">{b.source}</p>
                  </td>
                  <td className={td}>
                    <p className="font-medium text-neutral-900">{b.customer.name}</p>
                    <p className="text-xs text-neutral-500">{b.customer.phone || "—"}</p>
                  </td>
                  <td className={td}>
                    <span className="flex items-center gap-1.5">
                      {court && <SportIcon sport={court.sport} className="size-3.5 text-emerald-700" />}
                      {court?.name}
                    </span>
                  </td>
                  <td className={td}>
                    <p>{dateLabel(b.date)}</p>
                    <p className="text-xs text-neutral-500">{rangeLabel(b.startHour, b.duration)}</p>
                  </td>
                  <td className={cn(td, "text-right tabular-nums")}>
                    {taka(b.total)}
                    <p className="text-[11px] text-neutral-500">paid {taka(paidOf(b))}</p>
                  </td>
                  <td className={cn(td, "text-right tabular-nums", due > 0 ? "font-semibold text-rose-600" : "text-neutral-400")}>{due > 0 ? taka(due) : "—"}</td>
                  <td className={td}>
                    <BookingStatusBadge status={b.status} />
                  </td>
                </tr>
              );
            })}
            {!page.rows.length && (
              <tr>
                <td colSpan={7} className="py-14 text-center text-sm text-neutral-500">
                  No {tab === "all" ? "" : (statusLabels[tab as BookingStatus] ?? "due").toLowerCase()} bookings match.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
        <Pagination {...page} noun="bookings" />
      </div>

      <BookingDrawer id={openId} onClose={() => setOpenId(null)} />
      <NewBookingModal draft={draft} onClose={() => setDraft(null)} />
    </div>
  );
}
