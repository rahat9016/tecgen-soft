"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Info, Mail, MapPin, MessageSquare, Phone, Plus, Search, X } from "lucide-react";
import { markChatRead, orderDue, sendChat, useGadgetDB } from "@/src/lib/gadget-store/store";
import type { Customer } from "@/src/lib/gadget-store/types";
import { formatDate, formatTaka, formatTime } from "@/src/lib/gadget-store/format";
import ChatConversation from "@/src/components/gadgets/ChatConversation";
import GadgetAvatar from "@/src/components/gadgets/GadgetAvatar";
import { AdminHeader, btn, Drawer } from "@/src/components/gadgets/admin/kit";
import { StatusBadge } from "@/src/components/gadgets/shared";
import { cn } from "@/src/lib/utils";

const quickReplies = [
  "Thanks for reaching out! Let me check that for you.",
  "Yes, 0% EMI up to 12 months is available on EBL, City & BRAC credit cards.",
  "Inside Dhaka delivery takes 24 hours; outside Dhaka 2–4 days.",
  "Please share your order number so I can track it.",
  "Bring your old phone to any outlet for an instant exchange valuation.",
];

/** Time today, otherwise a short date. */
const stamp = (iso: string) =>
  new Date(iso).toDateString() === new Date().toDateString() ? formatTime(iso) : formatDate(iso).replace(/ \d{4}$/, "");

function ChatInbox() {
  const db = useGadgetDB();
  const params = useSearchParams();
  const [selected, setSelected] = useState<string | null>(params.get("c"));
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<"all" | "unread">("all");
  const [infoOpen, setInfoOpen] = useState(false);

  const sorted = useMemo(() => [...db.chats].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)), [db.chats]);
  const unreadCount = sorted.filter((t) => t.adminUnread > 0).length;
  const threads = useMemo(() => {
    const term = q.trim().toLowerCase();
    return sorted.filter(
      (t) =>
        (tab === "all" || t.adminUnread > 0) &&
        (!term || t.customerName.toLowerCase().includes(term) || t.messages.some((m) => m.text.toLowerCase().includes(term)))
    );
  }, [sorted, q, tab]);

  const activeId = selected ?? sorted[0]?.customerId ?? null;
  const thread = db.chats.find((t) => t.customerId === activeId);
  const customer = db.customers.find((c) => c.id === activeId);
  const name = thread?.customerName ?? customer?.name ?? "Customer";

  useEffect(() => {
    if (activeId && thread?.adminUnread) markChatRead(activeId, "admin");
  }, [activeId, thread?.adminUnread]);

  return (
    <>
      <AdminHeader
        title="Customer Chat"
        subtitle="Replies appear instantly in the customer's chat widget (open the store in another tab to try it)."
        actions={
          <div className="flex gap-2 text-xs">
            <span className="rounded-full bg-white px-3 py-1.5 font-medium text-neutral-600 ring-1 ring-neutral-200">
              {sorted.length} conversations
            </span>
            {unreadCount > 0 && (
              <span className="rounded-full bg-orange-500 px-3 py-1.5 font-semibold text-white">{unreadCount} unread</span>
            )}
          </div>
        }
      />

      <div className="grid h-[calc(100dvh-13rem)] min-h-[480px] overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm md:grid-cols-[300px_1fr] xl:grid-cols-[320px_1fr_300px]">
        {/* ── Inbox ── */}
        <aside className={cn("flex min-h-0 flex-col border-neutral-100 md:border-r", selected && "max-md:hidden")}>
          <div className="space-y-3 border-b border-neutral-100 p-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search name or message"
                aria-label="Search conversations"
                className="h-10 w-full rounded-xl border border-neutral-200 bg-neutral-50 pl-9 pr-8 text-sm outline-none transition focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100"
              />
              {q && (
                <button
                  onClick={() => setQ("")}
                  aria-label="Clear search"
                  className="absolute right-1.5 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 rounded-lg bg-neutral-100 p-0.5 text-xs font-medium">
              {(["all", "unread"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  aria-pressed={tab === t}
                  className={cn(
                    "flex items-center justify-center gap-1.5 rounded-md py-1.5 transition",
                    tab === t ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-800"
                  )}
                >
                  {t === "all" ? "All" : "Unread"}
                  {t === "unread" && unreadCount > 0 && (
                    <span className="rounded-full bg-orange-500 px-1.5 text-[10px] font-bold text-white">{unreadCount}</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <ul className="min-h-0 flex-1 overflow-y-auto p-2">
            {threads.map((t) => {
              const last = t.messages[t.messages.length - 1];
              const c = db.customers.find((x) => x.id === t.customerId);
              const active = activeId === t.customerId;
              const unread = t.adminUnread > 0;
              return (
                <li key={t.id}>
                  <button
                    onClick={() => setSelected(t.customerId)}
                    className={cn(
                      "relative flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition",
                      active ? "bg-orange-50 ring-1 ring-orange-200" : "hover:bg-neutral-50"
                    )}
                  >
                    <span className="relative shrink-0">
                      <GadgetAvatar
                        user={{ name: t.customerName, avatar: c?.avatar }}
                        className="size-11 bg-neutral-900 text-sm font-semibold text-white"
                      />
                      {unread && <span className="absolute -right-0.5 -top-0.5 size-3 rounded-full bg-orange-500 ring-2 ring-white" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline justify-between gap-2">
                        <span className={cn("truncate text-sm", unread ? "font-bold text-neutral-900" : "font-medium text-neutral-800")}>
                          {t.customerName}
                        </span>
                        <span className={cn("shrink-0 text-[11px]", unread ? "font-semibold text-orange-600" : "text-neutral-400")}>
                          {stamp(t.updatedAt)}
                        </span>
                      </span>
                      <span className="mt-0.5 flex items-center gap-2">
                        <span className={cn("line-clamp-1 flex-1 text-xs", unread ? "text-neutral-800" : "text-neutral-500")}>
                          {last?.from === "admin" && <span className="text-neutral-400">You: </span>}
                          {last?.text ?? "No messages yet"}
                        </span>
                        {unread && (
                          <span className="rounded-full bg-orange-500 px-1.5 text-[10px] font-bold text-white">{t.adminUnread}</span>
                        )}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
            {threads.length === 0 && (
              <li className="flex flex-col items-center px-6 py-12 text-center text-sm text-neutral-500">
                <MessageSquare className="mb-2 size-7 text-neutral-300" />
                {tab === "unread" ? "You're all caught up." : "No conversations found."}
              </li>
            )}
          </ul>
        </aside>

        {/* ── Conversation ── */}
        <section className={cn("flex min-h-0 flex-col", !selected && "max-md:hidden")}>
          {activeId ? (
            <>
              <div className="flex items-center gap-3 border-b border-neutral-100 px-3 py-3 sm:px-4">
                <button
                  onClick={() => setSelected(null)}
                  className="flex size-9 items-center justify-center rounded-full text-neutral-600 hover:bg-neutral-100 md:hidden"
                  aria-label="Back to conversations"
                >
                  <ArrowLeft className="size-5" />
                </button>
                <GadgetAvatar
                  user={{ name, avatar: customer?.avatar }}
                  className="size-10 shrink-0 bg-neutral-900 text-sm font-semibold text-white"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-neutral-900">{name}</p>
                  <p className="truncate text-xs text-neutral-500">
                    {customer?.phone}
                    {customer?.city && ` · ${customer.city}`}
                  </p>
                </div>
                {customer?.phone && (
                  <a href={`tel:${customer.phone}`} aria-label={`Call ${name}`} className={btn.ghost}>
                    <Phone className="size-4" />
                  </a>
                )}
                <button onClick={() => setInfoOpen(true)} aria-label="Customer details" className={cn(btn.ghost, "xl:hidden")}>
                  <Info className="size-4" />
                </button>
              </div>
              <ChatConversation
                className="flex-1"
                side="admin"
                otherName={name}
                messages={thread?.messages ?? []}
                onSend={(t) => sendChat(activeId, "admin", t)}
                quickReplies={quickReplies}
                emptyText="Start the conversation."
              />
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center text-neutral-400">
              <MessageSquare className="size-8" />
              <p className="mt-2 text-sm">Select a conversation</p>
            </div>
          )}
        </section>

        {/* ── Customer panel (xl) ── */}
        <aside className="hidden min-h-0 overflow-y-auto border-l border-neutral-100 bg-neutral-50/50 xl:block">
          {customer ? <CustomerPanel customer={customer} /> : <p className="p-5 text-sm text-neutral-500">No customer selected.</p>}
        </aside>
      </div>

      {infoOpen && customer && (
        <Drawer open onClose={() => setInfoOpen(false)} title={<p className="text-lg font-bold text-neutral-900">Customer details</p>}>
          <div className="-mx-6 -my-5">
            <CustomerPanel customer={customer} />
          </div>
        </Drawer>
      )}
    </>
  );
}

function CustomerPanel({ customer }: { customer: Customer }) {
  const db = useGadgetDB();
  const orders = db.orders.filter((o) => o.customerId === customer.id);
  const live = orders.filter((o) => o.status !== "cancelled");
  const paid = live.reduce((s, o) => s + o.paid, 0);
  const due = live.reduce((s, o) => s + orderDue(o), 0);

  return (
    <div className="p-5">
      <div className="flex flex-col items-center text-center">
        <GadgetAvatar user={customer} className="size-16 bg-neutral-900 text-xl font-semibold text-white" />
        <p className="mt-3 font-semibold text-neutral-900">{customer.name}</p>
        <p className="text-xs text-neutral-500">Customer since {formatDate(customer.joinedAt)}</p>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2 text-center">
        {[
          { k: "Orders", v: String(orders.length), c: "text-neutral-900" },
          { k: "Paid", v: formatTaka(paid), c: "text-emerald-600" },
          { k: "Due", v: formatTaka(due), c: due ? "text-rose-600" : "text-neutral-400" },
        ].map((x) => (
          <div key={x.k} className="rounded-xl bg-white p-2.5 ring-1 ring-neutral-200">
            <p className={cn("truncate text-sm font-bold tabular-nums", x.c)}>{x.v}</p>
            <p className="text-[10px] uppercase tracking-wide text-neutral-500">{x.k}</p>
          </div>
        ))}
      </div>

      <ul className="mt-5 space-y-2.5 rounded-xl bg-white p-4 text-sm ring-1 ring-neutral-200">
        <li className="flex items-center gap-2.5 text-neutral-700">
          <Phone className="size-4 shrink-0 text-neutral-400" />
          <a href={`tel:${customer.phone}`} className="hover:text-orange-600">
            {customer.phone}
          </a>
        </li>
        {customer.email && (
          <li className="flex items-center gap-2.5 text-neutral-700">
            <Mail className="size-4 shrink-0 text-neutral-400" />
            <a href={`mailto:${customer.email}`} className="truncate hover:text-orange-600">
              {customer.email}
            </a>
          </li>
        )}
        <li className="flex items-start gap-2.5 text-neutral-700">
          <MapPin className="mt-0.5 size-4 shrink-0 text-neutral-400" />
          {customer.address ? `${customer.address}, ${customer.city}` : customer.city}
        </li>
      </ul>

      <Link href={`/gadgets/admin/orders/new?c=${customer.id}`} className={cn(btn.primary, "mt-4 w-full")}>
        <Plus className="size-4" /> New order for {customer.name.split(" ")[0]}
      </Link>

      <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-neutral-400">
        Recent orders{orders.length > 4 && ` (4 of ${orders.length})`}
      </p>
      <ul className="mt-2 space-y-2">
        {orders.slice(0, 4).map((o) => {
          const d = o.status === "cancelled" ? 0 : orderDue(o);
          return (
            <li key={o.id}>
              <Link
                href={`/gadgets/admin/orders/${o.id}`}
                className="flex items-center gap-3 rounded-xl bg-white p-3 text-sm ring-1 ring-neutral-200 transition hover:ring-orange-300"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={o.items[0].image} alt="" className="size-10 shrink-0 rounded-lg bg-neutral-50 object-cover" />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <b className="text-neutral-900">{o.id}</b>
                    <StatusBadge status={o.status} className="text-[10px]" />
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-neutral-500">
                    {formatDate(o.createdAt)} · {formatTaka(o.total)}
                    {d > 0 && <span className="text-rose-600"> · due {formatTaka(d)}</span>}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
        {orders.length === 0 && <li className="rounded-xl bg-white p-4 text-center text-sm text-neutral-500 ring-1 ring-neutral-200">No orders yet.</li>}
      </ul>
    </div>
  );
}

export default function AdminChatPage() {
  return (
    <Suspense>
      <ChatInbox />
    </Suspense>
  );
}
