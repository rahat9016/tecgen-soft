"use client";

import { useEffect, useRef, useState } from "react";
import { SendHorizontal, Zap } from "lucide-react";
import type { ChatMessage } from "@/src/lib/gadget-store/types";
import { formatDate, formatTime } from "@/src/lib/gadget-store/format";
import { cn } from "@/src/lib/utils";

const dayKey = (iso: string) => new Date(iso).toDateString();

function dayLabel(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return formatDate(iso);
}

/** Message list + composer. `side` is who is typing; their bubbles sit on the right. */
export default function ChatConversation({
  messages,
  side,
  onSend,
  quickReplies,
  emptyText = "Say hello — we usually reply within a few minutes.",
  otherName,
  className,
}: {
  messages: ChatMessage[];
  side: "customer" | "admin";
  onSend: (text: string) => void;
  quickReplies?: string[];
  emptyText?: string;
  /** Name of the other party; shows an initial avatar beside their message groups. */
  otherName?: string;
  className?: string;
}) {
  const [text, setText] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  // Grow the composer with its content, up to ~5 lines.
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, [text]);

  const send = (value: string) => {
    const v = value.trim();
    if (!v) return;
    onSend(v);
    setText("");
    inputRef.current?.focus();
  };

  return (
    <div className={cn("flex min-h-0 flex-col", className)}>
      <div className="min-h-0 flex-1 overflow-y-auto bg-neutral-50 px-3 py-4 sm:px-5" aria-live="polite">
        {messages.length === 0 && <p className="py-10 text-center text-sm text-neutral-400">{emptyText}</p>}
        {messages.map((m, i) => {
          const prev = messages[i - 1];
          const next = messages[i + 1];
          const newDay = !prev || dayKey(prev.at) !== dayKey(m.at);
          const firstOfGroup = newDay || prev?.from !== m.from;
          const lastOfGroup = !next || next.from !== m.from || dayKey(next.at) !== dayKey(m.at);
          const mine = m.from === side;
          return (
            <div key={m.id}>
              {newDay && (
                <div className="my-4 flex items-center gap-3 first:mt-0">
                  <span className="h-px flex-1 bg-neutral-200" />
                  <span className="rounded-full bg-white px-3 py-0.5 text-[11px] font-medium text-neutral-500 shadow-sm ring-1 ring-neutral-200">
                    {dayLabel(m.at)}
                  </span>
                  <span className="h-px flex-1 bg-neutral-200" />
                </div>
              )}
              <div className={cn("flex items-end gap-2", mine ? "justify-end" : "justify-start", firstOfGroup ? "mt-3" : "mt-1")}>
                {!mine && otherName && (
                  <span
                    className={cn(
                      "flex size-7 shrink-0 items-center justify-center rounded-full bg-neutral-200 text-[11px] font-bold text-neutral-600",
                      !lastOfGroup && "invisible"
                    )}
                    aria-hidden
                  >
                    {otherName[0]}
                  </span>
                )}
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-3.5 py-2 text-sm sm:max-w-[70%]",
                    mine ? "bg-orange-500 text-white" : "bg-white text-neutral-800 shadow-sm ring-1 ring-neutral-100",
                    lastOfGroup && (mine ? "rounded-br-md" : "rounded-bl-md")
                  )}
                >
                  <p className="whitespace-pre-wrap wrap-break-word leading-relaxed">{m.text}</p>
                  <p className={cn("mt-0.5 text-right text-[10px]", mine ? "text-white/70" : "text-neutral-400")}>{formatTime(m.at)}</p>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      <div className="border-t border-neutral-100 bg-white">
        {quickReplies && quickReplies.length > 0 && (
          <div className="relative">
            <div className="flex gap-2 overflow-x-auto px-3 pt-3 [scrollbar-width:none] sm:px-4">
              <Zap className="mt-1.5 size-3.5 shrink-0 text-orange-500" aria-hidden />
              {quickReplies.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => send(q)}
                  title={q}
                  className="max-w-64 shrink-0 truncate rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs text-neutral-600 transition hover:border-orange-400 hover:bg-orange-50 hover:text-orange-600"
                >
                  {q}
                </button>
              ))}
            </div>
            <span className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-linear-to-l from-white" aria-hidden />
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(text);
          }}
          className="flex items-end gap-2 p-3 sm:px-4"
        >
          <textarea
            ref={inputRef}
            rows={1}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault();
                send(text);
              }
            }}
            placeholder="Type a message…"
            aria-label="Message"
            className="max-h-30 min-h-10 flex-1 resize-none rounded-2xl border border-transparent bg-neutral-100 px-4 py-2.5 text-sm leading-5 outline-none transition focus:border-orange-300 focus:bg-white focus:ring-2 focus:ring-orange-100"
          />
          <button
            type="submit"
            aria-label="Send"
            disabled={!text.trim()}
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-orange-500 text-white shadow-md shadow-orange-500/25 transition hover:bg-orange-600 disabled:bg-neutral-200 disabled:text-neutral-400 disabled:shadow-none"
          >
            <SendHorizontal className="size-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
