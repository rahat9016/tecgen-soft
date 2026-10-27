"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { BadgeCheck, ReceiptText, Wallet } from "lucide-react";
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
const th = "px-3 py-3 font-medium first:pl-4 last:pr-4";
const td = "px-3 py-3.5 first:pl-4 last:pr-4";
const href = (b: Booking) => `${ADMIN}/bookings/${b.id}`;

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
    <div className="mx-auto max-w-[1600px] space-y-3 sm:space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <MoneyCard label="Collected today" value={net(todays.map((x) => x.p))} hint="Net of refunds" icon="wallet" tone="green" index={0} />
        <MoneyCard label="This month" value={net(month.map((x) => x.p))} hint={`${month.length} transactions`} icon="calendar" tone="sky" index={1} />
        <MoneyCard label="Balance to collect" value={owing.reduce((s, b) => s + dueOf(b), 0)} hint={`${owing.length} booking${owing.length === 1 ? "" : "s"}`} icon="bill" tone="rose" index={2} />
        <MoneyCard label="Advances to verify" value={pending.reduce((s, b) => s + paidOf(b), 0)} hint={`${pending.length} online booking${pending.length === 1 ? "" : "s"}`} icon="vault" tone="violet" index={3} />
      </div>

      <div className={tableCardClass}>
        <Tabs
          value={tab}
          onChange={setTab}
          tabs={[
            { value: "transactions", label: "Transactions", count: txns.length },
            { value: "due", label: "Balance due", count: dues.length },
            { value: "verify", label: "To verify", count: verify.length, dot: "bg-violet-500" },
          ]}
        />
        <div className="flex flex-col gap-2 border-b border-neutral-100 p-3 sm:p-4 lg:flex-row lg:items-center">
          <SearchInput value={q} onChange={setQ} placeholder={tab === "transactions" ? "Search name, code or TrxID" : "Search name, phone or code"} className="lg:max-w-sm" />
          {tab === "transactions" && (
            <div className="grid grid-cols-3 gap-2 lg:ml-auto lg:flex">
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
            <Empty icon={Wallet} title="No payments match" text="Try another period or clear the filters." />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-sm">
                  <thead className="border-b border-neutral-200 bg-neutral-50/80 text-left text-xs uppercase tracking-wide text-neutral-500">
                    <tr>
                      <th className={th}>Date</th>
                      <th className={th}>Booking</th>
                      <th className={th}>Type</th>
                      <th className={th}>Method</th>
                      <th className={th}>Reference</th>
                      <th className={cn(th, "text-right")}>Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {txPage.rows.map(({ p, b }) => (
                      <tr key={p.id} onClick={() => router.push(href(b))} className="cursor-pointer transition hover:bg-emerald-50/40">
                        <td className={cn(td, "whitespace-nowrap text-neutral-700")}>{formatDateTime(p.at)}</td>
                        <td className={td}>
                          <Link href={href(b)} onClick={(e) => e.stopPropagation()} className="font-mono font-semibold text-emerald-800 hover:underline">
                            {b.code}
                          </Link>
                          <p className="text-xs text-neutral-600">{b.customer.name}</p>
                        </td>
                        <td className={td}>
                          <span className={cn("rounded px-2 py-0.5 text-xs font-semibold", kindBadge[p.kind])}>{kindLabels[p.kind]}</span>
                          {b.status === "pending" && p.kind === "advance" && <span className="ml-1.5 text-[11px] font-medium text-violet-700">Unverified</span>}
                        </td>
                        <td className={td}>{payLabels[p.method]}</td>
                        <td className={cn(td, "font-mono text-xs text-neutral-600")}>{p.ref ? `TrxID ${p.ref}` : "—"}</td>
                        <td className={cn(td, "text-right font-semibold tabular-nums", p.kind === "refund" ? "text-violet-700" : "text-neutral-900")}>
                          {p.kind === "refund" ? "−" : ""}
                          {taka(p.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-end border-t border-neutral-100 px-4 py-2.5 text-sm text-neutral-600">
                Net for this list&nbsp;<b className="tabular-nums text-neutral-900">{taka(net(txns.map((x) => x.p)))}</b>
              </div>
              <Pager {...txPage} noun="payments" />
            </>
          ))}

        {tab === "due" &&
          (dues.length === 0 ? (
            <Empty icon={ReceiptText} title="Nothing owed" text="Every balance is settled." />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-sm">
                  <thead className="border-b border-neutral-200 bg-neutral-50/80 text-left text-xs uppercase tracking-wide text-neutral-500">
                    <tr>
                      <th className={th}>Booking</th>
                      <th className={th}>Slot</th>
                      <th className={th}>Status</th>
                      <th className={cn(th, "text-right")}>Total</th>
                      <th className={cn(th, "text-right")}>Paid</th>
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
                          <p className="font-semibold text-neutral-900">{b.customer.name}</p>
                          <p className="text-xs text-neutral-600">
                            <span className="font-mono font-semibold text-emerald-800">{b.code}</span> · {b.customer.phone || "—"}
                          </p>
                        </td>
                        <td className={td}>
                          <p>{dateLabel(b.date)}</p>
                          <p className="text-xs text-neutral-600">{rangeLabel(b.startHour, b.duration)}</p>
                        </td>
                        <td className={td}>
                          <StatusBadge booking={b} />
                        </td>
                        <td className={cn(td, "text-right tabular-nums")}>{taka(b.total)}</td>
                        <td className={cn(td, "text-right tabular-nums")}>{taka(paidOf(b))}</td>
                        <td className={cn(td, "text-right font-semibold tabular-nums text-rose-700")}>{taka(dueOf(b))}</td>
                        <td className={cn(td, "text-right")}>
                          <Link href={`${href(b)}?do=pay`} onClick={(e) => e.stopPropagation()} className={abtn.small}>
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
            <Empty icon={BadgeCheck} title="All caught up" text="No online advances are waiting to be checked." />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-sm">
                  <thead className="border-b border-neutral-200 bg-neutral-50/80 text-left text-xs uppercase tracking-wide text-neutral-500">
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
                        <tr key={b.id} className="transition hover:bg-emerald-50/40">
                          <td className={td}>
                            <Link href={href(b)} className="font-semibold text-neutral-900 hover:text-emerald-800 hover:underline">
                              {b.customer.name}
                            </Link>
                            <p className="text-xs text-neutral-600">
                              <span className="font-mono font-semibold text-emerald-800">{b.code}</span> · {b.customer.phone}
                            </p>
                          </td>
                          <td className={td}>
                            <p>{dateLabel(b.date)}</p>
                            <p className="text-xs text-neutral-600">{rangeLabel(b.startHour, b.duration)}</p>
                          </td>
                          <td className={td}>
                            <p>{adv ? payLabels[adv.method] : "—"}</p>
                            {adv?.ref && <p className="font-mono text-xs text-neutral-600">TrxID {adv.ref}</p>}
                          </td>
                          <td className={cn(td, "text-right font-semibold tabular-nums")}>
                            {taka(adv?.amount ?? 0)}
                            <p className="text-xs font-normal text-neutral-500">of {taka(b.advanceDue)} required</p>
                          </td>
                          <td className={cn(td, "text-right")}>
                            <div className="flex justify-end gap-2">
                              <Link href={href(b)} className={abtn.small}>
                                Review
                              </Link>
                              <button
                                onClick={() => {
                                  setBookingStatus(b.id, "confirmed");
                                  toast.success(`${b.code} confirmed`);
                                }}
                                className={cn(abtn.small, "border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-700 hover:text-white")}
                              >
                                <BadgeCheck className="size-3.5" /> Confirm
                              </button>
                            </div>
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
