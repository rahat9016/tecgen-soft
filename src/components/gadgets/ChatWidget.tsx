"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { MessageCircle, X } from "lucide-react";
import { markChatRead, sendChat, useGadgetDB, useHydrated } from "@/src/lib/gadget-store/store";
import ChatConversation from "./ChatConversation";

export default function ChatWidget() {
  const db = useGadgetDB();
  const hydrated = useHydrated();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const thread = db.chats.find((t) => t.customerId === db.currentUserId);
  const unread = thread?.customerUnread ?? 0;

  useEffect(() => {
    if (open && unread) markChatRead(db.currentUserId, "customer");
  }, [open, unread, db.currentUserId]);

  // The messages page already shows the full conversation.
  if (!hydrated || pathname.startsWith("/gadgets/account/messages")) return null;

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3">
      {open && (
        <div className="flex h-[480px] max-h-[calc(100vh-120px)] w-[340px] max-w-[calc(100vw-40px)] flex-col overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-2xl">
          <div className="flex items-center gap-3 bg-neutral-900 px-4 py-3 text-white">
            <span className="flex size-9 items-center justify-center rounded-full bg-orange-500 font-bold">g</span>
            <div className="flex-1">
              <p className="text-sm font-semibold">gadgethub support</p>
              <p className="flex items-center gap-1.5 text-xs text-white/70">
                <span className="size-2 rounded-full bg-emerald-400" /> Online · replies in minutes
              </p>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close chat">
              <X className="size-5" />
            </button>
          </div>
          <ChatConversation
            className="flex-1"
            side="customer"
            messages={thread?.messages ?? []}
            onSend={(t) => sendChat(db.currentUserId, "customer", t)}
            quickReplies={["Where is my order?", "Is EMI available?", "Exchange my old phone", "Pre-order info"]}
          />
        </div>
      )}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close chat" : "Chat with us"}
        className="relative flex size-14 items-center justify-center rounded-full bg-orange-500 text-white shadow-xl shadow-orange-500/30 transition hover:scale-105"
      >
        {open ? <X className="size-6" /> : <MessageCircle className="size-6" />}
        {!open && unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex size-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold">
            {unread}
          </span>
        )}
      </button>
    </div>
  );
}
