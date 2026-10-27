"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { BadgeCheck, ChevronRight, ClipboardList, Download, Plus, SlidersHorizontal, Wallet } from "lucide-react";
import { dateLabel, downloadCsv, payLabels, rangeLabel, sourceLabels, statusLabels, statusStyles, taka, todayYmd } from "@/src/lib/turf-store/format";
import { dueOf, paidOf, phaseOf, setBookingStatus, startMs, useNow, useTurfDB } from "@/src/lib/turf-store/store";
import type { Booking, Phase } from "@/src/lib/turf-store/types";
import { cn } from "@/src/lib/utils";
import { abtn, ADMIN, Avatar, control, Empty, focusRing, PageHeader, Pager, SearchInput, StatusBadge, tableCardClass, ToolbarSelect, usePagination, ViewPills } from "./ui";

type View = "all" | "today" | "pending" | "upcoming" | "past" | "cancelled";
type Source = "any" | Booking["source"];
type Pay = "any" | "due" | "paid";
type Sort = "newest" | "soonest" | "latest";

const views: { value: View; label: string; group: number }[] = [
  { value: "all", label: "All", group: 0 },
  { value: "today", label: "Today", group: 0 },
  { value: "pending", label: "To verify", group: 0 },
  { value: "upcoming", label: "Upcoming", group: 1 },
  { value: "past", label: "Past", group: 1 },
  { value: "cancelled", label: "Cancelled", group: 1 },
];
const sortLabels: Record<Sort, string> = { newest: "Newest first", soonest: "Kick-off: soonest", latest: "Kick-off: latest" };

function inView(b: Booking, v: View, today: string) {
  const live = b.status !== "cancelled";
  if (v === "today") return live && b.date === today;
  if (v === "pending") return b.status === "pending";
  if (v === "upcoming") return live && b.date > today;
  if (v === "past") return live && b.date < today;
  if (v === "cancelled") return !live;
  return true;
}

const detail = (b: Booking) => `${ADMIN}/bookings/${b.id}`;

export default function BookingsList() {
  const db = useTurfDB();
  const [view, setView] = useState<View>("all");
  const [q, setQ] = useState("");
  const [source, setSource] = useState<Source>("any");
  const [pay, setPay] = useState<Pay>("any");
  const [sort, setSort] = useState<Sort>("newest");
  const [showFilters, setShowFilters] = useState(false);
  const now = useNow(60_000);
  const today = todayYmd();

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return db.bookings.filter(
      (b) =>
        (!term || [b.code, b.customer.name, b.customer.phone, b.customer.team ?? ""].some((v) => v.toLowerCase().includes(term))) &&
        (source === "any" || b.source === source) &&
        (pay === "any" || (pay === "due" ? dueOf(b) > 0 : b.status !== "cancelled" && dueOf(b) === 0))
    );
  }, [db.bookings, q, source, pay]);

  const list = useMemo(
    () =>
      filtered
        .filter((b) => inView(b, view, today))
        .sort((a, b) => (sort === "newest" ? b.createdAt.localeCompare(a.createdAt) : sort === "soonest" ? startMs(a) - startMs(b) : startMs(b) - startMs(a))),
    [filtered, view, today, sort]
  );
  const page = usePagination(list, 15);
  const counts = Object.fromEntries(views.map((v) => [v.value, filtered.filter((b) => inView(b, v.value, today)).length])) as Record<View, number>;
  const pending = db.bookings.filter((b) => b.status === "pending").length;
  const activeFilters = Number(source !== "any") + Number(pay !== "any");
  const filtering = !!q.trim() || activeFilters > 0;

  const exportCsv = () => {
    downloadCsv(`turf-bookings-${today}.csv`, [
      ["Code", "Customer", "Phone", "Team", "Date", "Time", "Hours", "Source", "Status", "Total", "Paid", "Due"],
      ...list.map((b) => [b.code, b.customer.name, b.customer.phone, b.customer.team ?? "", b.date, rangeLabel(b.startHour, b.duration), b.duration, sourceLabels[b.source], statusLabels[phaseOf(b, now)], b.total, paidOf(b), dueOf(b)]),
    ]);
  };

  return (
    <div className="mx-auto max-w-[1600px]">
      <PageHeader title="Bookings" subtitle={`${db.bookings.length} bookings · ${pending} waiting for verification`}>
        <button onClick={exportCsv} className={cn(abtn.outline, "size-10 px-0 sm:w-auto sm:px-4")}>
          <Download className="size-4" aria-hidden /> <span className="hidden sm:inline">Export CSV</span>
          <span className="sr-only sm:hidden">Export CSV</span>
        </button>
        <Link href={`${ADMIN}/bookings/new`} className={abtn.primary}>
          <Plus className="size-4" aria-hidden /> <span className="sm:hidden">New</span>
          <span className="hidden sm:inline">New booking</span>
        </Link>
      </PageHeader>

      <div className={tableCardClass}>
        <div className="hidden lg:block">
          <ViewPills
            label="Booking views"
            value={view}
            onChange={(v) => {
              setView(v);
              page.setPage(1);
            }}
            views={views.map((v) => ({ ...v, count: v.group === 0 ? counts[v.value] : undefined, alert: v.value === "pending" }))}
          />
        </div>

        <div className="border-b border-neutral-100 p-3 sm:p-4">
          <div className="flex flex-col gap-2 lg:grid lg:grid-cols-[minmax(16rem,1fr)_repeat(3,auto)]">
            <div className="flex gap-2">
              <SearchInput
                value={q}
                onChange={(v) => {
                  setQ(v);
                  page.setPage(1);
                }}
                placeholder="Search customer, phone, team or booking code"
              />
              {/* Phones: the filters fold away behind one button. */}
              <button
                type="button"
                onClick={() => setShowFilters((v) => !v)}
                aria-expanded={showFilters}
                className={cn(control, "relative flex shrink-0 items-center gap-1.5 px-3 font-medium lg:hidden", (showFilters || activeFilters > 0) && "border-emerald-500 bg-emerald-50 text-emerald-900")}
              >
                <SlidersHorizontal className="size-4" aria-hidden />
                <span className="sr-only sm:not-sr-only">Filters</span>
                {activeFilters > 0 && <span className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-emerald-700 text-[11px] font-bold text-white">{activeFilters}</span>}
              </button>
            </div>
            <div className={cn("grid grid-cols-2 gap-2 lg:contents", !showFilters && "hidden")}>
              {/* Phones and tablets: the views live here instead of the pill row. */}
              <div className="col-span-2 lg:hidden">
                <ToolbarSelect label="Booking views" value={view} active={view !== "all"} onChange={setView} options={views.map((v) => ({ value: v.value, label: `${v.label} (${counts[v.value]})` }))} />
              </div>
              <ToolbarSelect
                label="Source"
                value={source}
                active={source !== "any"}
                onChange={setSource}
                options={[{ value: "any", label: "All sources" }, ...(Object.keys(sourceLabels) as Booking["source"][]).map((s) => ({ value: s, label: sourceLabels[s] }))]}
              />
              <ToolbarSelect
                label="Payment"
                value={pay}
                active={pay !== "any"}
                onChange={setPay}
                options={[
                  { value: "any", label: "Any payment" },
                  { value: "due", label: "Balance due" },
                  { value: "paid", label: "Paid in full" },
                ]}
              />
              <ToolbarSelect label="Sort" value={sort} onChange={setSort} options={(Object.keys(sortLabels) as Sort[]).map((s) => ({ value: s, label: sortLabels[s] }))} />
            </div>
          </div>
        </div>

        {list.length === 0 ? (
          <Empty
            icon={ClipboardList}
            title={filtering ? "No bookings match" : view === "all" ? "No bookings yet" : `Nothing in “${views.find((v) => v.value === view)?.label}”`}
            text={filtering ? "Try another search, or clear the filters." : view === "all" ? "New bookings will show up here." : "Pick another view above."}
          >
            {filtering && (
              <button
                onClick={() => {
                  setQ("");
                  setSource("any");
                  setPay("any");
                }}
                className={cn(abtn.outline, "mt-2")}
              >
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
                  <Link href={detail(b)} className={cn("flex items-center gap-3 px-4 py-3 transition active:bg-emerald-50/60", focusRing, "focus-visible:ring-inset")}>
                    <DateTile b={b} phase={phaseOf(b, now)} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate font-semibold text-neutral-900">{b.customer.name}</p>
                        <span className={cn("inline-flex max-w-[50%] shrink-0 truncate rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset", statusStyles[phaseOf(b, now)])}>{statusLabels[phaseOf(b, now)]}</span>
                      </div>
                      <div className="mt-1 flex items-center justify-between gap-2 text-[13px]">
                        <p className="truncate text-neutral-600">{rangeLabel(b.startHour, b.duration)}</p>
                        <PayShort b={b} />
                      </div>
                    </div>
                    <ChevronRight className="size-4 shrink-0 text-neutral-300" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>

            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[820px] text-sm">
                <thead className="border-b border-neutral-200 bg-neutral-50/80 text-left text-xs uppercase tracking-wide text-neutral-500">
                  <tr>
                    <th className="py-3 pl-4 pr-3 font-medium">Customer</th>
                    <th className="px-3 py-3 font-medium">Slot</th>
                    <th className="px-3 py-3 font-medium">Status</th>
                    <th className="px-3 py-3 font-medium">Payment</th>
                    <th className="py-3 pr-4 text-right font-medium">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {page.rows.map((b) => (
                    <Row key={b.id} b={b} today={today} phase={phaseOf(b, now)} />
                  ))}
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

function Row({ b, today, phase }: { b: Booking; today: string; phase: Phase }) {
  const router = useRouter();
  return (
    <tr onClick={() => router.push(detail(b))} className="group cursor-pointer transition hover:bg-emerald-50/40">
      <td className="py-4 pl-4 pr-3">
        <div className="flex items-center gap-3">
          <Avatar name={b.customer.name} />
          <div className="min-w-0">
            <Link href={detail(b)} onClick={(e) => e.stopPropagation()} className={cn("rounded-sm font-semibold text-neutral-900 hover:text-emerald-800 hover:underline", focusRing)}>
              {b.customer.name}
            </Link>
            <p className="text-[13px] text-neutral-600">
              <span className="font-mono font-semibold text-emerald-800">{b.code}</span> · {sourceLabels[b.source]}
              {b.customer.team && <> · {b.customer.team}</>}
            </p>
          </div>
        </div>
      </td>
      <td className="px-3 py-4">
        <p className="flex flex-wrap items-center gap-1.5 whitespace-nowrap text-neutral-900">
          {dateLabel(b.date, { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
          {b.date === today && b.status !== "cancelled" && <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-xs font-medium text-emerald-800 ring-1 ring-inset ring-emerald-200">Today</span>}
        </p>
        <p className="text-[13px] text-neutral-600">
          {rangeLabel(b.startHour, b.duration)} · {b.duration} hr{b.duration > 1 ? "s" : ""}
        </p>
      </td>
      <td className="px-3 py-4">
        <StatusBadge booking={b} />
      </td>
      <td className="px-3 py-4">
        <PayLine b={b} />
      </td>
      <td className="py-4 pr-4">
        <div className="flex items-center justify-end gap-2">
          <RowAction b={b} phase={phase} />
          <ChevronRight className="size-4 text-neutral-400 transition group-hover:translate-x-0.5 group-hover:text-emerald-700" aria-hidden />
        </div>
      </td>
    </tr>
  );
}

const tileTones: Record<Phase, string> = {
  pending: "bg-sky-50 text-sky-700",
  booked: "bg-emerald-50 text-emerald-700",
  playing: "bg-lime-100 text-lime-800",
  played: "bg-neutral-100 text-neutral-500",
  cancelled: "bg-rose-50 text-rose-600",
};

/** Phone list: match day as a small calendar tile, tinted by status so the list scans at a glance. */
function DateTile({ b, phase }: { b: Booking; phase: Phase }) {
  return (
    <span aria-hidden className={cn("flex size-11 shrink-0 flex-col items-center justify-center rounded-xl leading-none", tileTones[phase])}>
      <span className="text-[17px] font-bold tabular-nums">{Number(b.date.slice(8))}</span>
      <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide">{dateLabel(b.date, { month: "short" })}</span>
    </span>
  );
}

function PayShort({ b }: { b: Booking }) {
  const due = dueOf(b);
  if (due > 0) return <span className="shrink-0 font-medium tabular-nums text-rose-700">{taka(due)} due</span>;
  return <span className="shrink-0 tabular-nums text-neutral-500">{taka(b.total)}</span>;
}

/** Total and one plain line on what's owed. */
function PayLine({ b }: { b: Booking }) {
  const due = dueOf(b);
  const paid = paidOf(b);
  const advance = b.payments.find((p) => p.kind === "advance");
  const [text, tone] =
    b.status === "cancelled"
      ? [paid > 0 ? `${taka(paid)} kept` : "No charge", "text-neutral-600"]
      : due === 0
        ? ["Paid in full", "text-emerald-700"]
        : paid > 0
          ? [`${taka(due)} due`, "text-rose-700"]
          : ["Not paid", "text-rose-700"];
  return (
    <div className="whitespace-nowrap">
      <p className="font-semibold tabular-nums text-neutral-900">{taka(b.total)}</p>
      <p className={cn("text-[13px] font-medium tabular-nums", tone)}>
        {text}
        {b.status === "pending" && advance && <span className="font-normal text-neutral-500"> · {payLabels[advance.method]} advance</span>}
      </p>
    </div>
  );
}

const actionBase = cn("inline-flex h-8 items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 text-[13px] font-semibold shadow-sm transition active:scale-[0.98]", focusRing);
const actionTones = {
  confirm: cn(actionBase, "bg-emerald-600 text-white hover:bg-emerald-700"),
  collect: cn(actionBase, "border border-neutral-300 bg-white text-neutral-800 shadow-none hover:border-emerald-400 hover:text-emerald-800"),
};

/** The one thing the desk most likely wants to do next: verify an online advance, or take the rest at the ground. */
function RowAction({ b, phase }: { b: Booking; phase: Phase }) {
  const router = useRouter();
  const stop = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };
  if (phase === "pending")
    return (
      <button
        type="button"
        onClick={(e) => {
          stop(e);
          setBookingStatus(b.id, "confirmed");
          toast.success(`${b.code} confirmed`);
        }}
        className={actionTones.confirm}
      >
        <BadgeCheck className="size-4" aria-hidden /> Confirm
      </button>
    );
  // The balance is paid at the ground, so collecting is offered once the game has started.
  if ((phase === "playing" || phase === "played") && dueOf(b) > 0)
    return (
      <button
        type="button"
        onClick={(e) => {
          stop(e);
          router.push(`${detail(b)}?do=pay`);
        }}
        className={actionTones.collect}
      >
        <Wallet className="size-4" aria-hidden /> Collect
      </button>
    );
  return null;
}
