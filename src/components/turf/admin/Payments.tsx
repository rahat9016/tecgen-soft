"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, ReceiptText, Undo2, Wallet } from "lucide-react";
import { addDays, dateLabel, formatDateTime, payLabels, rangeLabel, slotTime, taka, todayYmd } from "@/src/lib/turf-store/format";
import { creditOf, dueOf, paidOf, startMs, useNow, useTurfDB } from "@/src/lib/turf-store/store";
import type { Booking, PayMethod, Payment } from "@/src/lib/turf-store/types";
import { useT } from "@/src/lib/turf-store/i18n";
import { cn } from "@/src/lib/utils";
import { abtn, ADMIN, Empty, MoneyCard, Pager, SearchInput, StatusBadge, tableCardClass, Tabs, ToolbarSelect, usePagination } from "./ui";

type Tab = "transactions" | "due" | "refunds";
type Period = "today" | "7" | "30" | "all";
type Kind = "all" | Payment["kind"];

const signed = (p: Payment) => (p.kind === "refund" ? -p.amount : p.amount);
const net = (ps: Payment[]) => ps.reduce((s, p) => s + signed(p), 0);
const kindLabels: Record<Payment["kind"], string> = { advance: "Advance", balance: "Balance", refund: "Refund" };
const kindBadge: Record<Payment["kind"], string> = {
  advance: "bg-sky-50 text-sky-700",
  balance: "bg-emerald-50 text-emerald-700",
  refund: "bg-violet-50 text-violet-700",
};
const th = "px-3 py-2.5 first:pl-4 last:pr-4";
const td = "px-3 py-3 first:pl-4 last:pr-4";
const thead = "border-b border-neutral-200 bg-neutral-50 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-500";
/** Phones get a stacked list; the table starts at tablet width. */
const phoneList = "divide-y divide-neutral-100 md:hidden";
const phoneRow = "flex items-center gap-3 px-4 py-3 transition active:bg-emerald-50/60";
const wideTable = "hidden overflow-x-auto md:block";
// `from` lets the booking page send staff back here rather than to the bookings list.
const href = (b: Booking) => `${ADMIN}/bookings/${b.id}?from=payments`;
/** "2 Nov" and "4:00 pm" on two lines, like the slot column on Bookings. */
const day = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
const time = (iso: string) => new Date(iso).toLocaleTimeString("en-GB", { hour: "numeric", minute: "2-digit", hour12: true });
const rowClass = "cursor-pointer transition hover:bg-neutral-50";

function KindTag({ kind }: { kind: Payment["kind"] }) {
  const t = useT();
  return <span className={cn("inline-block rounded px-1.5 py-0.5 text-[11px] font-semibold", kindBadge[kind])}>{t(kindLabels[kind])}</span>;
}

function Amount({ p, className }: { p: Payment; className?: string }) {
  return (
    <span className={cn("font-medium tabular-nums", p.kind === "refund" ? "text-violet-700" : "text-neutral-900", className)}>
      {p.kind === "refund" ? "−" : ""}
      {taka(p.amount)}
    </span>
  );
}

export default function Payments() {
  const t = useT();
  const count = (n: number, one: string, many: string) => t(n === 1 ? one : many, { n });
  const db = useTurfDB();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("transactions");
  const [period, setPeriod] = useState<Period>("30");
  const [method, setMethod] = useState<"all" | PayMethod>("all");
  const [kind, setKind] = useState<Kind>("all");
  const [q, setQ] = useState("");
  const today = todayYmd();

  const all = useMemo(() => db.bookings.flatMap((b) => b.payments.map((p) => ({ p, b }))).sort((x, y) => y.p.at.localeCompare(x.p.at)), [db.bookings]);
  const owing = useMemo(() => db.bookings.filter((b) => dueOf(b) > 0).sort((a, b) => startMs(a) - startMs(b)), [db.bookings]);
  const now = useNow(60_000);
  // Refunds are given until kick-off, so the soonest games come first.
  const owedBack = useMemo(() => db.bookings.filter((b) => creditOf(b, now) > 0).sort((a, b) => startMs(a) - startMs(b)), [db.bookings, now]);

  const since = (days: number) => slotTime(addDays(today, 1 - days), 0);
  const todays = all.filter((x) => +new Date(x.p.at) >= since(1));
  const month = all.filter((x) => x.p.at.slice(0, 7) === today.slice(0, 7));

  const term = q.trim().toLowerCase();
  const match = (b: Booking, extra = "") => !term || [b.code, b.customer.name, b.customer.phone, extra].some((v) => v.toLowerCase().includes(term));
  const txns = all.filter(
    (x) =>
      (period === "all" || +new Date(x.p.at) >= since(period === "today" ? 1 : Number(period))) &&
      (method === "all" || x.p.method === method) &&
      (kind === "all" || x.p.kind === kind) &&
      match(x.b, x.p.ref)
  );
  const dues = owing.filter((b) => match(b));
  const refunds = owedBack.filter((b) => match(b));
  const txPage = usePagination(txns, 20);
  const duePage = usePagination(dues, 20);
  const refundPage = usePagination(refunds, 20);

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <MoneyCard label="Today" value={net(todays.map((x) => x.p))} hint={count(todays.length, "{n} payment", "{n} payments")} icon="wallet" tone="green" index={0} />
        <MoneyCard label="This month" value={net(month.map((x) => x.p))} hint={count(month.length, "{n} payment", "{n} payments")} icon="calendar" tone="sky" index={1} />
        <MoneyCard label="To collect" value={owing.reduce((s, b) => s + dueOf(b), 0)} hint={count(owing.length, "{n} booking", "{n} bookings")} icon="bill" tone="rose" index={2} />
        <MoneyCard label="To refund" value={owedBack.reduce((s, b) => s + creditOf(b, now), 0)} hint={count(owedBack.length, "{n} booking", "{n} bookings")} icon="refund" tone="violet" index={3} />
      </div>

      <div className={tableCardClass}>
        <Tabs
          value={tab}
          onChange={setTab}
          tabs={[
            { value: "transactions", label: "Transactions", count: txns.length },
            { value: "due", label: "Due", count: dues.length },
            { value: "refunds", label: "Refunds", count: refunds.length, dot: refunds.length ? "bg-violet-500" : undefined },
          ]}
        />
        <div className="flex flex-col gap-2 border-b border-neutral-100 p-3 sm:p-4 lg:flex-row lg:items-center">
          <SearchInput value={q} onChange={setQ} placeholder="Search name, phone or code" className="lg:max-w-sm" />
          {tab === "transactions" && (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:ml-auto lg:flex">
              <div className="max-sm:col-span-2">
                <ToolbarSelect
                  label="Period"
                  value={period}
                  active={period !== "30"}
                  onChange={setPeriod}
                  options={[
                    { value: "today", label: "Today" },
                    { value: "7", label: "Last 7 days" },
                    { value: "30", label: "Last 30 days" },
                    { value: "all", label: "All time" },
                  ]}
                />
              </div>
              <ToolbarSelect
                label="Method"
                value={method}
                active={method !== "all"}
                onChange={setMethod}
                options={[{ value: "all", label: "All methods" }, ...Object.entries(payLabels).map(([value, label]) => ({ value: value as PayMethod, label }))]}
              />
              <ToolbarSelect
                label="Type"
                value={kind}
                active={kind !== "all"}
                onChange={setKind}
                options={[{ value: "all", label: "All types" }, ...(Object.keys(kindLabels) as Payment["kind"][]).map((k) => ({ value: k, label: kindLabels[k] }))]}
              />
            </div>
          )}
        </div>

        {tab === "transactions" &&
          (txns.length === 0 ? (
            <Empty icon={Wallet} title="No payments" />
          ) : (
            <>
              <ul className={phoneList}>
                {txPage.rows.map(({ p, b }) => (
                  <li key={p.id}>
                    <Link href={href(b)} className={phoneRow}>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate font-semibold text-neutral-900">{b.customer.name}</p>
                          <Amount p={p} className="shrink-0" />
                        </div>
                        <div className="mt-1 flex items-center justify-between gap-2 text-[13px] text-neutral-600">
                          <p className="truncate">
                            {formatDateTime(p.at)} · {t(payLabels[p.method])}
                          </p>
                          <KindTag kind={p.kind} />
                        </div>
                      </div>
                      <ChevronRight className="size-4 shrink-0 text-neutral-300" aria-hidden />
                    </Link>
                  </li>
                ))}
              </ul>
              <div className={wideTable}>
                <table className="w-full min-w-[680px] table-fixed text-sm">
                  <colgroup>
                    <col className="w-[16%]" />
                    <col className="w-[26%]" />
                    <col className="w-[13%]" />
                    <col className="w-[13%]" />
                    <col className="hidden w-[18%] lg:table-column" />
                    <col className="w-[14%]" />
                  </colgroup>
                  <thead className={thead}>
                    <tr>
                      <th className={th}>{t("Date")}</th>
                      <th className={th}>{t("Booking")}</th>
                      <th className={th}>{t("Type")}</th>
                      <th className={th}>{t("Method")}</th>
                      <th className={cn(th, "hidden lg:table-cell")}>{t("Reference")}</th>
                      <th className={cn(th, "text-right")}>{t("Amount")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {txPage.rows.map(({ p, b }) => (
                      <tr key={p.id} onClick={() => router.push(href(b))} className={rowClass}>
                        <td className={cn(td, "whitespace-nowrap")}>
                          <p className="text-neutral-900">{day(p.at)}</p>
                          <p className="text-xs text-neutral-500">{time(p.at)}</p>
                        </td>
                        <td className={td}>
                          <p className="truncate font-medium text-neutral-900">{b.customer.name}</p>
                          <p className="font-mono text-xs text-neutral-500">{b.code}</p>
                        </td>
                        <td className={td}>
                          <KindTag kind={p.kind} />
                        </td>
                        <td className={cn(td, "text-neutral-700")}>{t(payLabels[p.method])}</td>
                        <td className={cn(td, "hidden truncate font-mono text-xs text-neutral-500 lg:table-cell")}>{p.ref ?? "—"}</td>
                        <td className={cn(td, "text-right")}>
                          <Amount p={p} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pager {...txPage} noun="payments" />
            </>
          ))}

        {tab === "due" &&
          (dues.length === 0 ? (
            <Empty icon={ReceiptText} title="Nothing due" />
          ) : (
            <>
              <ul className={phoneList}>
                {duePage.rows.map((b) => (
                  <li key={b.id} className={phoneRow}>
                    <Link href={href(b)} className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-neutral-900">{b.customer.name}</p>
                      <p className="mt-1 truncate text-[13px] text-neutral-600">
                        {dateLabel(b.date)} · {rangeLabel(b.startHour, b.duration)}
                      </p>
                    </Link>
                    <div className="flex shrink-0 flex-col items-end gap-1.5">
                      <span className="font-semibold tabular-nums text-rose-700">{taka(dueOf(b))}</span>
                      <Link href={`${href(b)}&do=pay`} className={abtn.small}>
                        <Wallet className="size-3.5" /> {t("Collect")}
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
              <div className={wideTable}>
                <table className="w-full min-w-[680px] table-fixed text-sm">
                  <colgroup>
                    <col className="w-[28%]" />
                    <col className="w-[20%]" />
                    <col className="hidden w-[14%] lg:table-column" />
                    <col className="w-[13%]" />
                    <col className="w-[13%]" />
                    <col className="w-[12%]" />
                  </colgroup>
                  <thead className={thead}>
                    <tr>
                      <th className={th}>{t("Booking")}</th>
                      <th className={th}>{t("Slot")}</th>
                      <th className={cn(th, "hidden lg:table-cell")}>{t("Status")}</th>
                      <th className={cn(th, "text-right")}>{t("Total")}</th>
                      <th className={cn(th, "text-right")}>{t("Due")}</th>
                      <th className={th}>
                        <span className="sr-only">{t("Actions")}</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {duePage.rows.map((b) => (
                      <tr key={b.id} onClick={() => router.push(href(b))} className={rowClass}>
                        <td className={td}>
                          <p className="truncate font-medium text-neutral-900">{b.customer.name}</p>
                          <p className="font-mono text-xs text-neutral-500">{b.code}</p>
                        </td>
                        <td className={td}>
                          <p className="whitespace-nowrap">{dateLabel(b.date)}</p>
                          <p className="whitespace-nowrap text-xs text-neutral-500">{rangeLabel(b.startHour, b.duration)}</p>
                        </td>
                        <td className={cn(td, "hidden lg:table-cell")}>
                          <StatusBadge booking={b} />
                        </td>
                        <td className={cn(td, "text-right tabular-nums")}>{taka(b.total)}</td>
                        <td className={cn(td, "text-right font-medium tabular-nums text-rose-700")}>{taka(dueOf(b))}</td>
                        <td className={cn(td, "text-right")}>
                          <Link href={`${href(b)}&do=pay`} onClick={(e) => e.stopPropagation()} className={abtn.small}>
                            <Wallet className="size-3.5" /> {t("Collect")}
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pager {...duePage} noun="bookings" />
            </>
          ))}

        {tab === "refunds" &&
          (refunds.length === 0 ? (
            <Empty icon={Undo2} title="No refunds owed" />
          ) : (
            <>
              <ul className={phoneList}>
                {refundPage.rows.map((b) => (
                  <li key={b.id} className={phoneRow}>
                    <Link href={href(b)} className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-neutral-900">{b.customer.name}</p>
                      <p className="mt-1 truncate text-[13px] text-neutral-600">
                        {dateLabel(b.date)} · {rangeLabel(b.startHour, b.duration)}
                      </p>
                    </Link>
                    <div className="flex shrink-0 flex-col items-end gap-1.5">
                      <span className="font-semibold tabular-nums text-violet-700">{taka(creditOf(b, now))}</span>
                      <Link href={`${href(b)}&do=refund`} className={abtn.small}>
                        <Undo2 className="size-3.5" /> {t("Refund")}
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
              <div className={wideTable}>
                <table className="w-full min-w-[680px] table-fixed text-sm">
                  <colgroup>
                    <col className="w-[26%]" />
                    <col className="w-[20%]" />
                    <col className="hidden w-[18%] lg:table-column" />
                    <col className="w-[12%]" />
                    <col className="w-[12%]" />
                    <col className="w-[12%]" />
                  </colgroup>
                  <thead className={thead}>
                    <tr>
                      <th className={th}>{t("Booking")}</th>
                      <th className={th}>{t("Slot")}</th>
                      <th className={cn(th, "hidden lg:table-cell")}>{t("Reason")}</th>
                      <th className={cn(th, "text-right")}>{t("Paid")}</th>
                      <th className={cn(th, "text-right")}>{t("To refund")}</th>
                      <th className={th}>
                        <span className="sr-only">{t("Actions")}</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {refundPage.rows.map((b) => (
                      <tr key={b.id} onClick={() => router.push(href(b))} className={rowClass}>
                        <td className={td}>
                          <p className="truncate font-medium text-neutral-900">{b.customer.name}</p>
                          <p className="font-mono text-xs text-neutral-500">{b.code}</p>
                        </td>
                        <td className={td}>
                          <p className="whitespace-nowrap">{dateLabel(b.date)}</p>
                          <p className="whitespace-nowrap text-xs text-neutral-500">{rangeLabel(b.startHour, b.duration)}</p>
                        </td>
                        <td className={cn(td, "hidden truncate text-neutral-600 lg:table-cell")}>{b.status === "cancelled" ? b.cancelReason ?? t("Cancelled") : t("Overpaid")}</td>
                        <td className={cn(td, "text-right tabular-nums")}>{taka(paidOf(b))}</td>
                        <td className={cn(td, "text-right font-medium tabular-nums text-violet-700")}>{taka(creditOf(b, now))}</td>
                        <td className={cn(td, "text-right")}>
                          <Link href={`${href(b)}&do=refund`} onClick={(e) => e.stopPropagation()} className={abtn.small}>
                            <Undo2 className="size-3.5" /> {t("Refund")}
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pager {...refundPage} noun="bookings" />
            </>
          ))}
      </div>
    </div>
  );
}
