"use client";

import { useEffect } from "react";
import { markChatRead, sendChat, useGadgetDB } from "@/src/lib/gadget-store/store";
import ChatConversation from "@/src/components/gadgets/ChatConversation";

export default function MessagesPage() {
  const db = useGadgetDB();
  const thread = db.chats.find((t) => t.customerId === db.currentUserId);
  const unread = thread?.customerUnread ?? 0;

  useEffect(() => {
    if (unread) markChatRead(db.currentUserId, "customer");
  }, [unread, db.currentUserId]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-900">Messages</h1>
      <p className="mt-1 text-sm text-neutral-500">Chat with gadgethub support about orders, EMI, exchange or pre-orders.</p>
      <div className="mt-5 overflow-hidden rounded-2xl border border-neutral-100">
        <ChatConversation
          className="h-[520px]"
          side="customer"
          messages={thread?.messages ?? []}
          onSend={(t) => sendChat(db.currentUserId, "customer", t)}
          quickReplies={["Where is my order?", "Is EMI available?", "Exchange my old phone", "Pre-order info"]}
        />
      </div>
    </div>
  );
}
