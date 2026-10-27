"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, ClipboardList, Plus, Wallet } from "lucide-react";
import { dateLabel, rangeLabel, sourceLabels, statusLabels, statusStyles, taka, todayYmd } from "@/src/lib/turf-store/format";
import { dueOf, paidOf, phaseOf, startMs, useNow, useTurfDB } from "@/src/lib/turf-store/store";
import type { Booking, Phase } from "@/src/lib/turf-store/types";
import { useT } from "@/src/lib/turf-store/i18n";
import { cn } from "@/src/lib/utils";
import { abtn, ADMIN, Avatar, Empty, focusRing, PageHeader, Pager, SearchInput, StatusBadge, tableCardClass, ToolbarSelect, usePagination, ViewPills } from "./ui";

type View = "all" | "today" | "upcoming" | "past" | "cancelled";

const views: { value: View; label: string; group: number }[] = [
  { value: "all", label: "All", group: 0 },
  { value: "today", label: "Today", group: 0 },
  { value: "upcoming", label: "Upcoming", group: 1 },
  { value: "past", label: "Past", group: 1 },
  { value: "cancelled", label: "Cancelled", group: 1 },
];

function inView(b: Booking, v: View, today: string) {
  const live = b.status !== "cancelled";
  if (v === "today") return live && b.date === today;
  if (v === "upcoming") return live && b.date > today;
  if (v === "past") return live && b.date < today;
  if (v === "cancelled") return !live;
  return true;
}

const detail = (b: Booking) => `${ADMIN}/bookings/${b.id}`;

export default function BookingsList() {
  const t = useT();
  const db = useTurfDB();
  const [view, setView] = useState<View>("all");
  const [q, setQ] = useState("");
  const now = useNow(60_000);
  const today = todayYmd();

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return db.bookings.filter((b) => !term || [b.code, b.customer.name, b.customer.phone, b.customer.team ?? ""].some((v) => v.toLowerCase().includes(term)));
  }, [db.bookings, q]);

  // Games still to come read soonest first; history and "All" show the newest bookings first.
  const ascending = view === "today" || view === "upcoming";
  const list = useMemo(
    () => filtered.filter((b) => inView(b, view, today)).sort((a, b) => (ascending ? startMs(a) - startMs(b) : view === "all" ? b.createdAt.localeCompare(a.createdAt) : startMs(b) - startMs(a))),
    [filtered, view, today, ascending]
  );
  const page = usePagination(list, 15);
  const counts = Object.fromEntries(views.map((v) => [v.value, filtered.filter((b) => inView(b, v.value, today)).length])) as Record<View, number>;
  const filtering = !!q.trim();

  return (
    <div>
      <PageHeader title="Bookings">
        <Link href={`${ADMIN}/bookings/new`} className={abtn.primary}>
          <Plus className="size-4" aria-hidden /> <span className="sm:hidden">{t("New")}</span>
          <span className="hidden sm:inline">{t("New booking")}</span>
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
            views={views.map((v) => ({ ...v, count: v.group === 0 ? counts[v.value] : undefined }))}
          />
        </div>

        <div className="flex flex-col gap-2 border-b border-neutral-100 p-3 sm:flex-row sm:p-4">
          <SearchInput
            value={q}
            onChange={(v) => {
              setQ(v);
              page.setPage(1);
            }}
            placeholder="Search name, phone or code"
          />
          {/* Phones and tablets: the views live here instead of the pill row. */}
          <div className="sm:w-56 lg:hidden">
            <ToolbarSelect
              label="Booking views"
              value={view}
              active={view !== "all"}
              onChange={(v) => {
                setView(v);
                page.setPage(1);
              }}
              options={views.map((v) => ({ value: v.value, label: `${t(v.label)} (${counts[v.value]})` }))}
            />
          </div>
        </div>

        {list.length === 0 ? (
          <Empty
            icon={ClipboardList}
            title={filtering ? "No bookings match" : view === "all" ? "No bookings yet" : t("Nothing in “{view}”", { view: t(views.find((v) => v.value === view)?.label ?? "") })}
            text={filtering ? "Try another search." : view === "all" ? "New bookings will show up here." : "Pick another view."}
          >
            {filtering && (
              <button
                onClick={() => setQ("")}
                className={cn(abtn.outline, "mt-2")}
              >
                {t("Clear search")}
              </button>
            )}
          </Empty>
        ) : (
          <>
            {/* Phones and tablets: one card per booking instead of a squeezed table. */}
            <ul className="divide-y divide-neutral-100 lg:hidden">
              {page.rows.map((b) => (
                <li key={b.id}>
                  <Link href={detail(b)} className={cn("flex items-center gap-3 px-4 py-3 transition active:bg-emerald-50/60", focusRing, "focus-visible:ring-inset")}>
                    <DateTile b={b} phase={phaseOf(b, now)} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate font-semibold text-neutral-900">{b.customer.name}</p>
                        <span className={cn("inline-flex max-w-[50%] shrink-0 truncate rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset", statusStyles[phaseOf(b, now)])}>{t(statusLabels[phaseOf(b, now)])}</span>
                      </div>
                      <div className="mt-1 flex items-center justify-between gap-2 text-[13px]">
                        <p className="truncate text-neutral-600">
                          {dateLabel(b.date, { weekday: "short" })} · {rangeLabel(b.startHour, b.duration)}
                        </p>
                        <PayShort b={b} />
                      </div>
                    </div>
                    <ChevronRight className="size-4 shrink-0 text-neutral-300" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>

            <div className="hidden overflow-x-auto lg:block">
              {/* Proportional column widths so wide screens share the extra space instead of stretching one column. */}
              <table className="w-full min-w-[820px] table-fixed text-sm">
                <colgroup>
                  <col className="w-[32%]" />
                  <col className="w-[22%]" />
                  <col className="w-[16%]" />
                  <col className="w-[14%]" />
                  <col className="w-[16%]" />
                </colgroup>
                <thead className="border-b border-neutral-200 bg-neutral-50 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                  <tr>
                    <th className="py-2.5 pl-4 pr-3">{t("Customer")}</th>
                    <th className="px-3 py-2.5">{t("Slot")}</th>
                    <th className="px-3 py-2.5">{t("Status")}</th>
                    <th className="px-3 py-2.5 text-right">{t("Payment")}</th>
                    <th className="py-2.5 pr-4">
                      <span className="sr-only">{t("Actions")}</span>
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
  const t = useT();
  const router = useRouter();
  return (
    <tr onClick={() => router.push(detail(b))} className="group cursor-pointer transition hover:bg-neutral-50">
      <td className="py-3 pl-4 pr-3">
        <div className="flex items-center gap-3">
          <Avatar name={b.customer.name} />
          <div className="min-w-0">
            <Link href={detail(b)} onClick={(e) => e.stopPropagation()} className={cn("block truncate rounded-sm font-medium text-neutral-900 hover:text-emerald-800", focusRing)}>
              {b.customer.name}
            </Link>
            <p className="truncate text-xs text-neutral-500">
              <span className="font-mono">{b.code}</span> · {t(sourceLabels[b.source])}
            </p>
          </div>
        </div>
      </td>
      <td className="px-3 py-3">
        <p className="flex items-center gap-1.5 whitespace-nowrap text-neutral-900">
          {dateLabel(b.date)}
          {b.date === today && b.status !== "cancelled" && <span className="rounded bg-emerald-50 px-1.5 text-[11px] font-medium text-emerald-700">{t("Today")}</span>}
        </p>
        <p className="whitespace-nowrap text-xs text-neutral-500">
          {rangeLabel(b.startHour, b.duration)} · {t(b.duration > 1 ? "{n} hrs" : "{n} hr", { n: b.duration })}
        </p>
      </td>
      <td className="px-3 py-3">
        <StatusBadge booking={b} />
      </td>
      <td className="px-3 py-3 text-right">
        <PayLine b={b} />
      </td>
      <td className="py-3 pr-4">
        <div className="flex items-center justify-end gap-2">
          <RowAction b={b} phase={phase} />
          <ChevronRight className="size-4 text-neutral-400 transition group-hover:translate-x-0.5 group-hover:text-emerald-700" aria-hidden />
        </div>
      </td>
    </tr>
  );
}

const tileTones: Record<Phase, string> = {
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
  const t = useT();
  const due = dueOf(b);
  if (due > 0) return <span className="shrink-0 font-medium tabular-nums text-rose-700">{t("{amount} due", { amount: taka(due) })}</span>;
  return <span className="shrink-0 tabular-nums text-neutral-500">{taka(b.total)}</span>;
}

/** Total and one plain line on what's owed. */
function PayLine({ b }: { b: Booking }) {
  const t = useT();
  const due = dueOf(b);
  const paid = paidOf(b);
  const [text, tone] =
    b.status === "cancelled"
      ? [paid > 0 ? t("{amount} kept", { amount: taka(paid) }) : t("No charge"), "text-neutral-600"]
      : due === 0
        ? [t("Paid in full"), "text-emerald-700"]
        : paid > 0
          ? [t("{amount} due", { amount: taka(due) }), "text-rose-700"]
          : [t("Not paid"), "text-rose-700"];
  return (
    <div className="whitespace-nowrap">
      <p className="font-medium tabular-nums text-neutral-900">{taka(b.total)}</p>
      <p className={cn("text-xs tabular-nums", tone)}>{text}</p>
    </div>
  );
}

const actionBase = cn("inline-flex h-8 items-center gap-1.5 whitespace-nowrap rounded-full px-3 text-xs font-semibold shadow-sm transition active:scale-[0.98]", focusRing);
const actionTones = {
  collect: cn(actionBase, "border border-neutral-300 bg-white text-neutral-800 shadow-none hover:border-emerald-400 hover:text-emerald-800"),
};

/** The one thing the desk most likely wants to do next: take the rest of the money at the ground. */
function RowAction({ b, phase }: { b: Booking; phase: Phase }) {
  const t = useT();
  const router = useRouter();
  const stop = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };
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
        <Wallet className="size-3.5" aria-hidden /> {t("Collect")}
      </button>
    );
  return null;
}
