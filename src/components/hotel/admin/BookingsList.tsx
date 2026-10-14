"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { ClipboardList, Download, Plus } from "lucide-react";
import { downloadCsv, formatDateTime, rangeLabel, sourceLabels, statusLabels, taka, todayKey } from "@/src/lib/hotel-store/format";
import { creditOf, dueOf, folioTotal, paidOf, paymentStatus, unitNumbers, useHotelDB } from "@/src/lib/hotel-store/store";
import type { Booking, BookingSource } from "@/src/lib/hotel-store/types";
import { ADMIN, AdminHeader, Empty, hbtn, Pager, PayBadge, SearchBox, Select, StatusBadge, tableCardClass, Tabs, toolbarClass, usePagination } from "./ui";

type Tab = "all" | "arrivals" | "in-house" | "upcoming" | "pending" | "checked-out" | "cancelled";

const tabTest: Record<Tab, (b: Booking, today: string) => boolean> = {
  all: () => true,
  arrivals: (b, t) => (b.status === "confirmed" || b.status === "pending") && b.checkIn <= t && t < b.checkOut,
  "in-house": (b) => b.status === "checked-in",
  upcoming: (b, t) => (b.status === "confirmed" || b.status === "pending") && b.checkIn > t,
  pending: (b) => b.status === "pending",
  "checked-out": (b) => b.status === "checked-out",
  cancelled: (b) => b.status === "cancelled" || b.status === "no-show",
};

const tabLabels: Record<Tab, string> = {
  all: "All",
  arrivals: "Arriving today",
  "in-house": "In house",
  upcoming: "Upcoming",
  pending: "To confirm",
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

export default function BookingsList() {
  const db = useHotelDB();
  const router = useRouter();
  const params = useSearchParams();
  const initial = params.get("status");
  const [tab, setTab] = useState<Tab>(initial === "pending" ? "pending" : initial === "checked-in" ? "in-house" : initial && initial in tabTest ? (initial as Tab) : "all");
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

  const filtered = q || type !== "any" || source !== "any" || pay !== "any" || from || to;

  return (
    <div>
      <AdminHeader
        title="Bookings"
        subtitle={`${db.bookings.length} bookings · ${counts.pending} waiting for confirmation`}
        actions={
          <>
            <button onClick={exportCsv} className={hbtn.outline}>
              <Download className="size-4" /> Export CSV
            </button>
            <Link href={`${ADMIN}/bookings/new`} className={hbtn.primary}>
              <Plus className="size-4" /> New booking
            </Link>
          </>
        }
      />

      <div className={tableCardClass}>
        <Tabs
          value={tab}
          onChange={(t) => {
            setTab(t);
            page.setPage(1);
          }}
          tabs={(Object.keys(tabLabels) as Tab[]).map((t) => ({ value: t, label: tabLabels[t], count: counts[t], dot: t === "pending" && counts.pending ? "bg-amber-400" : undefined }))}
        />
        <div className={toolbarClass}>
          <SearchBox value={q} onChange={(v) => { setQ(v); page.setPage(1); }} placeholder="Search code, guest, phone, room no." />
          <Select label="Room type" value={type} onChange={setType} options={[{ value: "any", label: "All room types" }, ...db.roomTypes.map((t) => ({ value: t.id, label: t.name }))]} />
          <Select label="Source" value={source} onChange={setSource} options={[{ value: "any", label: "All sources" }, ...(Object.keys(sourceLabels) as BookingSource[]).map((s) => ({ value: s, label: sourceLabels[s] }))]} />
          <Select
            label="Payment"
            value={pay}
            onChange={setPay}
            options={[
              { value: "any", label: "Any payment" },
              { value: "unpaid", label: "Unpaid" },
              { value: "partly", label: "Partly paid" },
              { value: "paid", label: "Paid in full" },
              { value: "refund", label: "Refund due" },
            ]}
          />
          <span className="flex items-center gap-1 text-xs text-neutral-500">
            Stay
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} aria-label="Stay from" className="h-9 rounded-md border border-neutral-200 bg-white px-3 text-sm" />
            –
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} aria-label="Stay to" className="h-9 rounded-md border border-neutral-200 bg-white px-3 text-sm" />
          </span>
          <Select
            label="Sort"
            value={sort}
            onChange={setSort}
            className="ml-auto"
            options={[
              { value: "created", label: "Newest first" },
              { value: "checkin", label: "Check-in ↑" },
              { value: "checkin-desc", label: "Check-in ↓" },
            ]}
          />
          {filtered && (
            <button
              onClick={() => {
                setQ("");
                setType("any");
                setSource("any");
                setPay("any");
                setFrom("");
                setTo("");
              }}
              className="text-xs font-medium text-sky-700 hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>

        {list.length === 0 ? (
          <Empty icon={ClipboardList} title="No bookings match" text="Try another tab or clear the filters." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px] text-sm">
              <thead className="bg-neutral-50 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                <tr>
                  <th className="px-4 py-3">Booking</th>
                  <th className="px-4 py-3">Guest</th>
                  <th className="px-4 py-3">Stay</th>
                  <th className="px-4 py-3">Room</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="px-4 py-3">Payment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {page.rows.map((b) => {
                  const rooms = unitNumbers(db, b.unitIds);
                  const due = dueOf(b);
                  return (
                    <tr
                      key={b.id}
                      onClick={() => router.push(`${ADMIN}/bookings/${b.id}`)}
                      className="cursor-pointer transition hover:bg-sky-50/40"
                    >
                      <td className="px-4 py-3">
                        <Link href={`${ADMIN}/bookings/${b.id}`} onClick={(e) => e.stopPropagation()} className="font-mono font-semibold text-sky-700 hover:underline">
                          {b.code}
                        </Link>
                        <p className="text-xs text-neutral-500">
                          {sourceLabels[b.source]} · {format(new Date(b.createdAt), "dd MMM")}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-neutral-900">{b.guest.name}</p>
                        <p className="text-xs text-neutral-500">{b.guest.phone}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-neutral-800">{rangeLabel(b.checkIn, b.checkOut)}</p>
                        <p className="text-xs text-neutral-500">
                          {b.nights} night{b.nights > 1 ? "s" : ""} · {b.adults + b.children} guest{b.adults + b.children > 1 ? "s" : ""}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-neutral-800">
                          {b.roomName}
                          {b.rooms > 1 ? ` ×${b.rooms}` : ""}
                        </p>
                        <p className={rooms.length < b.rooms && b.status !== "cancelled" && b.status !== "no-show" ? "text-xs font-medium text-amber-600" : "text-xs text-neutral-500"}>
                          {rooms.length ? `Room ${rooms.join(", ")}` : "Not assigned"}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={b.status} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <p className="font-semibold tabular-nums text-neutral-900">{taka(folioTotal(b))}</p>
                        {due > 0 && <p className="text-xs font-medium tabular-nums text-rose-600">{taka(due)} due</p>}
                      </td>
                      <td className="px-4 py-3">
                        <PayBadge booking={b} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <Pager {...page} noun="bookings" />
      </div>
    </div>
  );
}
