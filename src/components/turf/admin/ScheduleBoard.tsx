"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import { ChevronLeft, ChevronRight, Hourglass, Plus, Wrench, X } from "lucide-react";
import { addDays, dateLabel, formatDuration, hourLabel, slotTime, sportLabels, statusBlock, taka, todayYmd } from "@/src/lib/turf-store/format";
import { dueOf, hoursOf, occupies, removeBlock, useNow, useTurfDB } from "@/src/lib/turf-store/store";
import type { Sport } from "@/src/lib/turf-store/types";
import { cn } from "@/src/lib/utils";
import { Chip, LiveBadge, SportIcon, tbtn } from "../ui";
import BookingDrawer from "./BookingDrawer";
import NewBookingModal, { type SlotDraft } from "./NewBookingModal";

const ROW = 60;

export default function ScheduleBoard() {
  const db = useTurfDB();
  const now = useNow(1000);
  const today = todayYmd();
  const [date, setDate] = useState(today);
  const [sport, setSport] = useState<Sport | "all">("all");
  const [showCancelled, setShowCancelled] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [draft, setDraft] = useState<SlotDraft | null>(null);

  const hours = hoursOf(db.settings);
  const open = db.settings.openHour;
  const courts = db.courts.filter((c) => c.active && (sport === "all" || c.sport === sport));
  const sports = [...new Set(db.courts.filter((c) => c.active).map((c) => c.sport))];

  const dayBookings = db.bookings.filter((b) => b.date === date && courts.some((c) => c.id === b.courtId));
  const live = dayBookings.filter(occupies);
  const bookedHours = live.reduce((s, b) => s + b.duration, 0);
  const capacity = courts.length * hours.length;
  const expected = live.filter((b) => b.status !== "no-show").reduce((s, b) => s + b.total, 0);
  const outstanding = live.reduce((s, b) => s + dueOf(b), 0);

  const dayStart = slotTime(date, open);
  const nowTop = date === today ? ((now - dayStart) / 3600_000) * ROW : -1;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Schedule board</h1>
          <p className="mt-1 text-sm text-neutral-500">Click an empty slot to add a walk-in or block the court. Click a booking to manage it.</p>
        </div>
        <LiveBadge now={now} />
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1">
          <button onClick={() => setDate(addDays(date, -1))} aria-label="Previous day" className={tbtn.icon}>
            <ChevronLeft className="size-4" />
          </button>
          <button onClick={() => setDate(today)} className={cn(tbtn.outline, date === today && "border-emerald-600 text-emerald-800")}>
            Today
          </button>
          <button onClick={() => setDate(addDays(date, 1))} aria-label="Next day" className={tbtn.icon}>
            <ChevronRight className="size-4" />
          </button>
        </div>
        <input type="date" aria-label="Date" value={date} onChange={(e) => e.target.value && setDate(e.target.value)} className="h-10 rounded-full border border-neutral-200 bg-white px-4 text-sm" />
        <p className="text-sm font-medium text-neutral-800">{dateLabel(date, { weekday: "long", day: "numeric", month: "long" })}</p>
        <button onClick={() => setDraft({ courtId: courts[0]?.id ?? "", date, startHour: Math.max(open, new Date().getHours() + 1) })} className={cn(tbtn.green, "ml-auto")}>
          <Plus className="size-4" /> New booking
        </button>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="flex gap-2 overflow-x-auto [scrollbar-width:none]">
          <Chip active={sport === "all"} onClick={() => setSport("all")}>
            All courts
          </Chip>
          {sports.map((s) => (
            <Chip key={s} active={sport === s} onClick={() => setSport(s)}>
              <SportIcon sport={s} className="size-3.5" /> {sportLabels[s]}
            </Chip>
          ))}
        </div>
        <label className="ml-auto flex items-center gap-2 text-sm text-neutral-600">
          <input type="checkbox" checked={showCancelled} onChange={(e) => setShowCancelled(e.target.checked)} className="accent-emerald-700" /> Show cancelled
        </label>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          ["Bookings", String(live.length)],
          ["Utilisation", `${capacity ? Math.round((bookedHours / capacity) * 100) : 0}%`],
          ["Expected revenue", taka(expected)],
          ["Still to collect", taka(outstanding)],
        ].map(([k, v]) => (
          <div key={k} className="rounded-2xl border border-neutral-200 bg-white px-4 py-3">
            <p className="text-xs text-neutral-500">{k}</p>
            <p className="text-lg font-semibold tabular-nums text-neutral-900">{v}</p>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-neutral-200 bg-white">
        <div className="grid min-w-max" style={{ gridTemplateColumns: `64px repeat(${courts.length}, minmax(190px, 1fr))` }}>
          {/* Header */}
          <div className="sticky left-0 z-20 border-b border-r border-neutral-100 bg-white" />
          {courts.map((c) => (
            <div key={c.id} className="flex items-center gap-2 border-b border-r border-neutral-100 px-3 py-3 last:border-r-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={c.image} alt="" className="size-9 rounded-lg object-cover" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-neutral-900">{c.name}</p>
                <p className="flex items-center gap-1 text-[11px] text-neutral-500">
                  <SportIcon sport={c.sport} className="size-3" /> {sportLabels[c.sport]}
                </p>
              </div>
            </div>
          ))}

          {/* Time column */}
          <div className="sticky left-0 z-10 border-r border-neutral-100 bg-white">
            {hours.map((h) => (
              <div key={h} style={{ height: ROW }} className="relative border-b border-neutral-50 pr-2 text-right">
                <span className="relative -top-2 text-[11px] text-neutral-400">{h === open ? "" : hourLabel(h)}</span>
              </div>
            ))}
          </div>

          {courts.map((c) => {
            const items = dayBookings.filter((b) => b.courtId === c.id && (showCancelled || occupies(b)));
            const blocks = db.blocks.filter((b) => b.courtId === c.id && b.date === date);
            const holds = db.holds.filter((h) => h.courtId === c.id && h.date === date && h.expiresAt > now);
            return (
              <div key={c.id} className="relative border-r border-neutral-100 last:border-r-0" style={{ height: hours.length * ROW }}>
                {hours.map((h) => {
                  const past = slotTime(date, h + 1) <= now;
                  return (
                    <button
                      key={h}
                      onClick={() => setDraft({ courtId: c.id, date, startHour: h })}
                      aria-label={`Add booking ${c.name} ${hourLabel(h)}`}
                      style={{ height: ROW }}
                      className={cn("group flex w-full items-center justify-center border-b border-neutral-50 transition hover:bg-emerald-50", past && "bg-neutral-50/70")}
                    >
                      <Plus className="size-4 text-emerald-600 opacity-0 group-hover:opacity-100" />
                    </button>
                  );
                })}

                {blocks.map((bl) => (
                  <div
                    key={bl.id}
                    style={{ top: (bl.startHour - open) * ROW + 2, height: bl.duration * ROW - 4 }}
                    className="absolute inset-x-1.5 flex flex-col justify-between overflow-hidden rounded-xl border border-neutral-300 bg-[repeating-linear-gradient(45deg,#fafafa,#fafafa_8px,#f0f0f0_8px,#f0f0f0_16px)] p-2 text-xs text-neutral-600"
                  >
                    <p className="flex items-center gap-1 font-medium">
                      <Wrench className="size-3.5" /> {bl.reason}
                    </p>
                    <button
                      onClick={() => {
                        if (confirm(`Re-open ${c.name} for ${hourLabel(bl.startHour)} – ${hourLabel(bl.startHour + bl.duration)}?`)) {
                          removeBlock(bl.id);
                          toast.success("Court re-opened");
                        }
                      }}
                      className="flex w-fit items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[11px] ring-1 ring-neutral-200 hover:text-rose-600"
                    >
                      <X className="size-3" /> Remove block
                    </button>
                  </div>
                ))}

                {holds.map((h) => (
                  <div
                    key={h.id}
                    style={{ top: (h.startHour - open) * ROW + 2, height: h.duration * ROW - 4 }}
                    className="pointer-events-none absolute inset-x-1.5 flex items-start gap-1.5 rounded-xl border-2 border-dashed border-amber-400 bg-amber-50/80 p-2 text-xs text-amber-800"
                  >
                    <Hourglass className="mt-px size-3.5 animate-pulse" />
                    <span>
                      Customer paying… <span className="tabular-nums">{formatDuration(h.expiresAt - now)}</span>
                    </span>
                  </div>
                ))}

                {items.map((b) => {
                  const playing = b.status === "checked-in";
                  return (
                    <button
                      key={b.id}
                      onClick={() => setOpenId(b.id)}
                      style={{ top: (b.startHour - open) * ROW + 2, height: b.duration * ROW - 4 }}
                      className={cn(
                        "absolute inset-x-1.5 overflow-hidden rounded-xl border p-2 text-left text-xs shadow-sm transition hover:shadow-md",
                        statusBlock[b.status],
                        b.status === "cancelled" && "opacity-60 line-through",
                        playing && "ring-2 ring-lime-500"
                      )}
                    >
                      <p className="truncate font-semibold">{b.customer.team ?? b.customer.name}</p>
                      <p className="truncate opacity-80">
                        {hourLabel(b.startHour)} – {hourLabel(b.startHour + b.duration)} · {b.code}
                      </p>
                      {b.duration > 1 && (
                        <p className="mt-1 truncate opacity-80">
                          {b.status === "pending" ? "⏳ Verify advance" : dueOf(b) > 0 ? `Due ${taka(dueOf(b))}` : "Paid"}
                        </p>
                      )}
                    </button>
                  );
                })}

                {nowTop >= 0 && nowTop <= hours.length * ROW && (
                  <div className="pointer-events-none absolute inset-x-0 z-10 h-0.5 bg-rose-500" style={{ top: nowTop }}>
                    <span className="absolute -left-1 -top-[3px] size-2 rounded-full bg-rose-500" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-4 text-xs text-neutral-500">
        {[
          ["Awaiting verification", statusBlock.pending],
          ["Confirmed", statusBlock.confirmed],
          ["Playing now", statusBlock["checked-in"]],
          ["Completed", statusBlock.completed],
          ["No-show", statusBlock["no-show"]],
        ].map(([l, c]) => (
          <span key={l} className="flex items-center gap-1.5">
            <span className={cn("size-3 rounded border", c)} /> {l}
          </span>
        ))}
        <span className="flex items-center gap-1.5">
          <span className="size-3 rounded border-2 border-dashed border-amber-400" /> Customer paying
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-0.5 w-4 bg-rose-500" /> Now
        </span>
      </div>

      <BookingDrawer id={openId} onClose={() => setOpenId(null)} />
      <NewBookingModal draft={draft} onClose={() => setDraft(null)} />
    </div>
  );
}
