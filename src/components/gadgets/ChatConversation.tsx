"use client";

import { useEffect, useRef, useState } from "react";
import { SendHorizontal } from "lucide-react";
import type { ChatMessage } from "@/src/lib/gadget-store/types";
import { formatTime } from "@/src/lib/gadget-store/format";
import { cn } from "@/src/lib/utils";

/** Message list + composer. `side` is who is typing; their bubbles sit on the right. */
export default function ChatConversation({
  messages,
  side,
  onSend,
  quickReplies,
  emptyText = "Say hello — we usually reply within a few minutes.",
  className,
}: {
  messages: ChatMessage[];
  side: "customer" | "admin";
  onSend: (text: string) => void;
  quickReplies?: string[];
  emptyText?: string;
  className?: string;
}) {
  const [text, setText] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  const send = (value: string) => {
    const v = value.trim();
    if (!v) return;
    onSend(v);
    setText("");
  };

  return (
    <div className={cn("flex min-h-0 flex-col", className)}>
      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto bg-neutral-50 p-4" aria-live="polite">
        {messages.length === 0 && <p className="py-8 text-center text-sm text-neutral-400">{emptyText}</p>}
        {messages.map((m) => {
          const mine = m.from === side;
          return (
            <div key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-[80%] rounded-2xl px-3.5 py-2 text-sm",
                  mine ? "rounded-br-md bg-orange-500 text-white" : "rounded-bl-md bg-white text-neutral-800 shadow-sm"
                )}
              >
                <p className="whitespace-pre-wrap break-words">{m.text}</p>
                <p className={cn("mt-0.5 text-right text-[10px]", mine ? "text-white/70" : "text-neutral-400")}>
                  {formatTime(m.at)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      {quickReplies && quickReplies.length > 0 && (
        <div className="flex gap-2 overflow-x-auto border-t border-neutral-100 bg-white px-3 pt-3 [scrollbar-width:none]">
          {quickReplies.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => send(q)}
              className="shrink-0 rounded-full border border-neutral-200 px-3 py-1 text-xs text-neutral-600 hover:border-orange-400 hover:text-orange-600"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(text);
        }}
        className="flex items-center gap-2 border-t border-neutral-100 bg-white p-3"
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message…"
          aria-label="Message"
          className="h-10 flex-1 rounded-full bg-neutral-100 px-4 text-sm outline-none focus:ring-2 focus:ring-orange-200"
        />
        <button
          type="submit"
          aria-label="Send"
          disabled={!text.trim()}
          className="flex size-10 items-center justify-center rounded-full bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-40"
        >
          <SendHorizontal className="size-4" />
        </button>
      </form>
    </div>
  );
}
