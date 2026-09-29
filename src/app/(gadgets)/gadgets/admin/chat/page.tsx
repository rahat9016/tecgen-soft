"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, MessageSquare } from "lucide-react";
import { markChatRead, orderDue, sendChat, useGadgetDB } from "@/src/lib/gadget-store/store";
import { formatDate, formatTaka, formatTime } from "@/src/lib/gadget-store/format";
import ChatConversation from "@/src/components/gadgets/ChatConversation";
import { AdminHeader, SearchInput } from "@/src/components/gadgets/admin/kit";
import { StatusBadge } from "@/src/components/gadgets/shared";
import { cn } from "@/src/lib/utils";

const quickReplies = [
  "Thanks for reaching out! Let me check that for you.",
  "Yes, 0% EMI up to 12 months is available on EBL, City & BRAC credit cards.",
  "Inside Dhaka delivery takes 24 hours; outside Dhaka 2–4 days.",
  "Please share your order number so I can track it.",
  "Bring your old phone to any outlet for an instant exchange valuation.",
];

function ChatInbox() {
  const db = useGadgetDB();
  const params = useSearchParams();
  const [selected, setSelected] = useState<string | null>(params.get("c"));
  const [q, setQ] = useState("");

  const threads = useMemo(() => {
    const term = q.trim().toLowerCase();
    return [...db.chats]
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .filter((t) => !term || t.customerName.toLowerCase().includes(term));
  }, [db.chats, q]);

  const activeId = selected ?? threads[0]?.customerId ?? null;
  const thread = db.chats.find((t) => t.customerId === activeId);
  const customer = db.customers.find((c) => c.id === activeId);
  const orders = db.orders.filter((o) => o.customerId === activeId).slice(0, 4);

  useEffect(() => {
    if (activeId && thread?.adminUnread) markChatRead(activeId, "admin");
  }, [activeId, thread?.adminUnread]);

  return (
    <>
      <AdminHeader title="Customer Chat" subtitle="Replies appear instantly in the customer's chat widget (open the store in another tab to try it)." />
      <div className="grid h-[calc(100vh-220px)] min-h-[520px] overflow-hidden rounded-2xl border border-neutral-200 bg-white md:grid-cols-[300px_1fr] xl:grid-cols-[300px_1fr_280px]">
        <aside className={cn("flex min-h-0 flex-col border-r border-neutral-100", selected && "max-md:hidden")}>
          <div className="border-b border-neutral-100 p-3">
            <SearchInput value={q} onChange={setQ} placeholder="Search conversations" />
          </div>
          <ul className="min-h-0 flex-1 overflow-y-auto">
            {threads.map((t) => {
              const last = t.messages[t.messages.length - 1];
              return (
                <li key={t.id}>
                  <button
                    onClick={() => setSelected(t.customerId)}
                    className={cn(
                      "flex w-full items-start gap-3 border-b border-neutral-50 px-4 py-3 text-left transition",
                      activeId === t.customerId ? "bg-orange-50" : "hover:bg-neutral-50"
                    )}
                  >
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-sm font-semibold text-white">
                      {t.customerName[0]}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span className={cn("truncate text-sm", t.adminUnread ? "font-bold text-neutral-900" : "font-medium text-neutral-800")}>
                          {t.customerName}
                        </span>
                        <span className="shrink-0 text-[11px] text-neutral-400">{formatTime(t.updatedAt)}</span>
                      </span>
                      <span className="flex items-center gap-2">
                        <span className="line-clamp-1 flex-1 text-xs text-neutral-500">
                          {last?.from === "admin" ? "You: " : ""}
                          {last?.text}
                        </span>
                        {t.adminUnread > 0 && (
                          <span className="rounded-full bg-orange-500 px-1.5 text-[10px] font-bold text-white">{t.adminUnread}</span>
                        )}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
            {threads.length === 0 && <li className="p-6 text-center text-sm text-neutral-500">No conversations.</li>}
          </ul>
        </aside>

        <section className={cn("flex min-h-0 flex-col", !selected && "max-md:hidden")}>
          {activeId ? (
            <>
              <div className="flex items-center gap-3 border-b border-neutral-100 px-4 py-3">
                <button onClick={() => setSelected(null)} className="md:hidden" aria-label="Back to conversations">
                  <ArrowLeft className="size-5" />
                </button>
                <div>
                  <p className="font-semibold text-neutral-900">{thread?.customerName ?? customer?.name}</p>
                  <p className="text-xs text-neutral-500">{customer?.phone}</p>
                </div>
              </div>
              <ChatConversation
                className="flex-1"
                side="admin"
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

        <aside className="hidden min-h-0 overflow-y-auto border-l border-neutral-100 p-4 xl:block">
          {customer ? (
            <>
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Customer</p>
              <p className="mt-2 font-semibold text-neutral-900">{customer.name}</p>
              <p className="text-sm text-neutral-600">{customer.phone}</p>
              <p className="text-sm text-neutral-600">{customer.email}</p>
              <p className="mt-1 text-sm text-neutral-600">
                {customer.address}, {customer.city}
              </p>
              <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-neutral-400">Recent orders</p>
              <ul className="mt-2 space-y-2">
                {orders.map((o) => (
                  <li key={o.id}>
                    <Link href={`/gadgets/admin/orders/${o.id}`} className="block rounded-xl border border-neutral-100 p-3 text-sm hover:border-orange-300">
                      <span className="flex items-center justify-between">
                        <b>{o.id}</b>
                        <StatusBadge status={o.status} />
                      </span>
                      <span className="mt-1 block text-xs text-neutral-500">
                        {formatDate(o.createdAt)} · {formatTaka(o.total)}
                        {orderDue(o) > 0 && o.status !== "cancelled" ? ` · due ${formatTaka(orderDue(o))}` : ""}
                      </span>
                    </Link>
                  </li>
                ))}
                {orders.length === 0 && <li className="text-sm text-neutral-500">No orders yet.</li>}
              </ul>
            </>
          ) : (
            <p className="text-sm text-neutral-500">No customer selected.</p>
          )}
        </aside>
      </div>
    </>
  );
}

export default function AdminChatPage() {
  return (
    <Suspense>
      <ChatInbox />
    </Suspense>
  );
}
