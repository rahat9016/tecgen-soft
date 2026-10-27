"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { BadgeCheck, ChevronRight, ReceiptText, Wallet } from "lucide-react";
import { addDays, dateLabel, formatDateTime, payLabels, rangeLabel, slotTime, taka, todayYmd } from "@/src/lib/turf-store/format";
import { dueOf, paidOf, setBookingStatus, startMs, useTurfDB } from "@/src/lib/turf-store/store";
import type { Booking, PayMethod, Payment } from "@/src/lib/turf-store/types";
import { cn } from "@/src/lib/utils";
import { abtn, ADMIN, Empty, MoneyCard, Pager, SearchInput, StatusBadge, tableCardClass, Tabs, ToolbarSelect, usePagination } from "./ui";

type Tab = "transactions" | "due" | "verify";
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
const plural = (n: number, w: string) => `${n} ${w}${n === 1 ? "" : "s"}`;

function KindTag({ kind }: { kind: Payment["kind"] }) {
  return <span className={cn("rounded px-2 py-0.5 text-xs font-semibold", kindBadge[kind])}>{kindLabels[kind]}</span>;
}

function Amount({ p, className }: { p: Payment; className?: string }) {
  return (
    <span className={cn("font-semibold tabular-nums", p.kind === "refund" ? "text-violet-700" : "text-neutral-900", className)}>
      {p.kind === "refund" ? "−" : ""}
      {taka(p.amount)}
    </span>
  );
}

function ConfirmButton({ b }: { b: Booking }) {
  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setBookingStatus(b.id, "confirmed");
        toast.success(`${b.code} confirmed`);
      }}
      className={cn(abtn.small, "border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-700 hover:text-white")}
    >
      <BadgeCheck className="size-3.5" /> Confirm
    </button>
  );
}

export default function Payments() {
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
  const pending = useMemo(() => db.bookings.filter((b) => b.status === "pending").sort((a, b) => startMs(a) - startMs(b)), [db.bookings]);

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
  const verify = pending.filter((b) => match(b, b.payments[0]?.ref));
  const txPage = usePagination(txns, 20);
  const duePage = usePagination(dues, 20);
  const verifyPage = usePagination(verify, 20);

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <MoneyCard label="Today" value={net(todays.map((x) => x.p))} hint={plural(todays.length, "payment")} icon="wallet" tone="green" index={0} />
        <MoneyCard label="This month" value={net(month.map((x) => x.p))} hint={plural(month.length, "payment")} icon="calendar" tone="sky" index={1} />
        <MoneyCard label="To collect" value={owing.reduce((s, b) => s + dueOf(b), 0)} hint={plural(owing.length, "booking")} icon="bill" tone="rose" index={2} />
        <MoneyCard label="To verify" value={pending.reduce((s, b) => s + paidOf(b), 0)} hint={plural(pending.length, "booking")} icon="vault" tone="violet" index={3} />
      </div>

      <div className={tableCardClass}>
        <Tabs
          value={tab}
          onChange={setTab}
          tabs={[
            { value: "transactions", label: "Transactions", count: txns.length },
            { value: "due", label: "Due", count: dues.length },
            { value: "verify", label: "To verify", count: verify.length },
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
                            {formatDateTime(p.at)} · {payLabels[p.method]}
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
                <table className="w-full min-w-[680px] text-sm">
                  <thead className={thead}>
                    <tr>
                      <th className={th}>Date</th>
                      <th className={th}>Booking</th>
                      <th className={th}>Type</th>
                      <th className={th}>Method</th>
                      <th className={cn(th, "hidden lg:table-cell")}>Reference</th>
                      <th className={cn(th, "text-right")}>Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {txPage.rows.map(({ p, b }) => (
                      <tr key={p.id} onClick={() => router.push(href(b))} className="cursor-pointer transition hover:bg-emerald-50/40">
                        <td className={cn(td, "whitespace-nowrap text-neutral-700")}>{formatDateTime(p.at)}</td>
                        <td className={td}>
                          <p className="font-medium text-neutral-900">{b.customer.name}</p>
                          <p className="font-mono text-xs text-neutral-500">{b.code}</p>
                        </td>
                        <td className={td}>
                          <KindTag kind={p.kind} />
                        </td>
                        <td className={td}>{payLabels[p.method]}</td>
                        <td className={cn(td, "hidden font-mono text-xs text-neutral-600 lg:table-cell")}>{p.ref ?? "—"}</td>
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
                        <Wallet className="size-3.5" /> Collect
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
              <div className={wideTable}>
                <table className="w-full min-w-[680px] text-sm">
                  <thead className={thead}>
                    <tr>
                      <th className={th}>Booking</th>
                      <th className={th}>Slot</th>
                      <th className={cn(th, "hidden lg:table-cell")}>Status</th>
                      <th className={cn(th, "text-right")}>Total</th>
                      <th className={cn(th, "text-right")}>Due</th>
                      <th className={th}>
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {duePage.rows.map((b) => (
                      <tr key={b.id} onClick={() => router.push(href(b))} className="cursor-pointer transition hover:bg-emerald-50/40">
                        <td className={td}>
                          <p className="font-medium text-neutral-900">{b.customer.name}</p>
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
                        <td className={cn(td, "text-right font-semibold tabular-nums text-rose-700")}>{taka(dueOf(b))}</td>
                        <td className={cn(td, "text-right")}>
                          <Link href={`${href(b)}&do=pay`} onClick={(e) => e.stopPropagation()} className={abtn.small}>
                            <Wallet className="size-3.5" /> Collect
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

        {tab === "verify" &&
          (verify.length === 0 ? (
            <Empty icon={BadgeCheck} title="All verified" />
          ) : (
            <>
              <ul className={phoneList}>
                {verifyPage.rows.map((b) => {
                  const adv = b.payments.find((p) => p.kind === "advance");
                  return (
                    <li key={b.id} className={phoneRow}>
                      <Link href={href(b)} className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-neutral-900">{b.customer.name}</p>
                        <p className="mt-1 truncate text-[13px] text-neutral-600">
                          {adv ? payLabels[adv.method] : "—"}
                          {adv?.ref && <span className="font-mono"> · {adv.ref}</span>}
                        </p>
                      </Link>
                      <div className="flex shrink-0 flex-col items-end gap-1.5">
                        <span className="font-semibold tabular-nums">{taka(adv?.amount ?? 0)}</span>
                        <ConfirmButton b={b} />
                      </div>
                    </li>
                  );
                })}
              </ul>
              <div className={wideTable}>
                <table className="w-full min-w-[680px] text-sm">
                  <thead className={thead}>
                    <tr>
                      <th className={th}>Booking</th>
                      <th className={th}>Slot</th>
                      <th className={th}>Paid with</th>
                      <th className={cn(th, "text-right")}>Advance</th>
                      <th className={th}>
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {verifyPage.rows.map((b) => {
                      const adv = b.payments.find((p) => p.kind === "advance");
                      return (
                        <tr key={b.id} onClick={() => router.push(href(b))} className="cursor-pointer transition hover:bg-emerald-50/40">
                          <td className={td}>
                            <p className="font-medium text-neutral-900">{b.customer.name}</p>
                            <p className="font-mono text-xs text-neutral-500">{b.code}</p>
                          </td>
                          <td className={td}>
                            <p className="whitespace-nowrap">{dateLabel(b.date)}</p>
                            <p className="whitespace-nowrap text-xs text-neutral-500">{rangeLabel(b.startHour, b.duration)}</p>
                          </td>
                          <td className={td}>
                            <p>{adv ? payLabels[adv.method] : "—"}</p>
                            {adv?.ref && <p className="font-mono text-xs text-neutral-600">{adv.ref}</p>}
                          </td>
                          <td className={cn(td, "text-right font-semibold tabular-nums")}>{taka(adv?.amount ?? 0)}</td>
                          <td className={cn(td, "text-right")}>
                            <ConfirmButton b={b} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <Pager {...verifyPage} noun="bookings" />
            </>
          ))}
      </div>
    </div>
  );
}
