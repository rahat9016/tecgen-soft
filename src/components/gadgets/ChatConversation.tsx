"use client";

import { useEffect, useRef, useState } from "react";
import { SendHorizontal, X, Zap } from "lucide-react";
import type { ChatMessage } from "@/src/lib/gadget-store/types";
import { formatDate, formatTime } from "@/src/lib/gadget-store/format";
import { cn } from "@/src/lib/utils";
import GadgetAvatar from "./GadgetAvatar";

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
  otherAvatar,
  className,
}: {
  messages: ChatMessage[];
  side: "customer" | "admin";
  onSend: (text: string) => void;
  quickReplies?: string[];
  emptyText?: string;
  /** Name of the other party; shows an initial avatar beside their message groups. */
  otherName?: string;
  /** Optional photo for the other party's avatar. */
  otherAvatar?: string;
  className?: string;
}) {
  const [text, setText] = useState("");
  const [showQuick, setShowQuick] = useState(false);
  // Short replies fit as chips; long canned answers go in a panel and are inserted for editing.
  const chips =
    !!quickReplies?.length && quickReplies.every((q) => q.length <= 32);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Scroll only the message list; scrollIntoView would also scroll clipped ancestors and shift the layout.
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  // Grow the composer with its content, up to ~5 lines.
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
    el.style.overflowY = el.scrollHeight > 120 ? "auto" : "hidden";
  }, [text]);

  const send = (value: string) => {
    const v = value.trim();
    if (!v) return;
    onSend(v);
    setText("");
    inputRef.current?.focus();
  };

  return (
    <div className={cn("flex min-h-0 min-w-0 flex-col", className)}>
      <div
        ref={listRef}
        className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden bg-neutral-50 px-3 py-4 sm:px-5"
        aria-live="polite"
      >
        <div className="mx-auto max-w-3xl">
          {messages.length === 0 && (
            <p className="py-10 text-center text-sm text-neutral-400">
              {emptyText}
            </p>
          )}
          {messages.map((m, i) => {
            const prev = messages[i - 1];
            const next = messages[i + 1];
            const newDay = !prev || dayKey(prev.at) !== dayKey(m.at);
            const firstOfGroup = newDay || prev?.from !== m.from;
            const lastOfGroup =
              !next || next.from !== m.from || dayKey(next.at) !== dayKey(m.at);
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
                <div
                  className={cn(
                    "flex items-end gap-2",
                    mine ? "justify-end" : "justify-start",
                    firstOfGroup ? "mt-3" : "mt-1"
                  )}
                >
                  {!mine && otherName && (
                    <span
                      className={cn("shrink-0", !lastOfGroup && "invisible")}
                      aria-hidden
                    >
                      <GadgetAvatar
                        user={{ name: otherName, avatar: otherAvatar }}
                        className="size-7 bg-neutral-200 text-[11px] font-bold text-neutral-600"
                      />
                    </span>
                  )}
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-3.5 py-2 text-sm sm:max-w-[70%]",
                      mine
                        ? "bg-orange-500 text-white"
                        : "bg-white text-neutral-800 shadow-sm ring-1 ring-neutral-100",
                      lastOfGroup && (mine ? "rounded-br-md" : "rounded-bl-md")
                    )}
                  >
                    <p className="whitespace-pre-wrap wrap-break-word leading-relaxed">
                      {m.text}
                    </p>
                    <p
                      className={cn(
                        "mt-0.5 text-right text-[10px]",
                        mine ? "text-white/70" : "text-neutral-400"
                      )}
                    >
                      {formatTime(m.at)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="min-w-0 border-t border-neutral-100 bg-white">
        {chips && quickReplies && (
          <div className="relative">
            <div className="flex gap-2 overflow-x-auto px-3 pt-3 [scrollbar-width:none] sm:px-4">
              <Zap
                className="mt-1.5 size-3.5 shrink-0 text-orange-500"
                aria-hidden
              />
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
            <span
              className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-linear-to-l from-white"
              aria-hidden
            />
          </div>
        )}

        {!chips && quickReplies && showQuick && (
          <div className="border-b border-neutral-100 bg-neutral-50/70 p-3 sm:px-4">
            <div className="mb-2 flex items-center justify-between">
              <p className="flex items-center gap-1.5 text-xs font-semibold text-neutral-700">
                <Zap className="size-3.5 text-orange-500" /> Quick replies
              </p>
              <button
                type="button"
                onClick={() => setShowQuick(false)}
                aria-label="Close quick replies"
                className="flex size-6 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-200 hover:text-neutral-700"
              >
                <X className="size-3.5" />
              </button>
            </div>
            <ul className="grid max-h-44 gap-1.5 overflow-y-auto sm:grid-cols-2">
              {quickReplies.map((q) => (
                <li key={q}>
                  <button
                    type="button"
                    onClick={() => {
                      setText(q);
                      setShowQuick(false);
                      inputRef.current?.focus();
                    }}
                    className="h-full w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-left text-xs leading-relaxed text-neutral-700 transition hover:border-orange-300 hover:bg-orange-50"
                  >
                    {q}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(text);
          }}
          className="flex items-end gap-2 p-3 sm:px-4"
        >
          {!chips && quickReplies && (
            <button
              type="button"
              onClick={() => setShowQuick((v) => !v)}
              aria-label="Quick replies"
              aria-expanded={showQuick}
              className={cn(
                "flex size-10 shrink-0 items-center justify-center rounded-full transition",
                showQuick
                  ? "bg-orange-100 text-orange-600"
                  : "text-neutral-500 hover:bg-neutral-100 hover:text-orange-600"
              )}
            >
              <Zap className="size-4" />
            </button>
          )}
          <textarea
            ref={inputRef}
            rows={1}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (
                e.key === "Enter" &&
                !e.shiftKey &&
                !e.nativeEvent.isComposing
              ) {
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
