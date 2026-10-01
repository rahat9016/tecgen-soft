"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import { Pencil, Plus, Star } from "lucide-react";
import { Modal, Switch } from "@/src/components/gadgets/admin/kit";
import { sportLabels, taka, todayYmd } from "@/src/lib/turf-store/format";
import { freeSlots, newCourtId, occupies, saveCourt, startMs, useNow, useTurfDB } from "@/src/lib/turf-store/store";
import type { Court, Sport } from "@/src/lib/turf-store/types";
import { cn } from "@/src/lib/utils";
import { inputClass, labelClass, SportIcon, tbtn } from "../ui";

const IMAGES = ["field", "boots", "cricket", "cricket2", "badminton", "tennis", "tennis2", "basketball", "night-match", "kickoff", "kids", "stadium", "night"].map(
  (n) => `/turf/${n}.webp`
);

export default function CourtsManager() {
  const db = useTurfDB();
  const now = useNow(30_000);
  const [editing, setEditing] = useState<Court | null>(null);
  const today = todayYmd();

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Courts</h1>
          <p className="mt-1 text-sm text-neutral-500">Prices, photos and availability. Turning a court off hides it from the booking site immediately.</p>
        </div>
        <button
          onClick={() =>
            setEditing({
              id: newCourtId(db),
              name: "",
              sport: "football",
              surface: "",
              indoor: false,
              size: "",
              image: IMAGES[0],
              price: 1500,
              peakPrice: 2000,
              players: "",
              rating: 5,
              active: true,
              features: [],
              description: "",
            })
          }
          className={tbtn.green}
        >
          <Plus className="size-4" /> Add court
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {db.courts.map((c) => {
          const future = db.bookings.filter((b) => b.courtId === c.id && occupies(b) && startMs(b) > now).length;
          return (
            <article key={c.id} className={cn("overflow-hidden rounded-2xl border bg-white", c.active ? "border-neutral-200" : "border-dashed border-neutral-300 opacity-70")}>
              <div className="relative aspect-[16/9]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c.image} alt="" className="size-full object-cover" />
                <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs font-medium">
                  <SportIcon sport={c.sport} className="size-3.5 text-emerald-700" /> {sportLabels[c.sport]}
                </span>
                <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 text-xs font-semibold">
                  <Star className="size-3 fill-amber-400 text-amber-400" /> {c.rating}
                </span>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-neutral-900">{c.name}</p>
                    <p className="truncate text-xs text-neutral-500">
                      {c.indoor ? "Indoor" : "Outdoor"} · {c.size}
                    </p>
                  </div>
                  <Switch
                    checked={c.active}
                    label={`${c.name} accepting bookings`}
                    onChange={() => {
                      saveCourt({ ...c, active: !c.active });
                      toast.success(c.active ? `${c.name} hidden from booking` : `${c.name} open for booking`);
                    }}
                  />
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  {[
                    ["Off-peak", taka(c.price)],
                    ["Peak", taka(c.peakPrice)],
                    ["Free today", c.active ? String(freeSlots(db, c, today, now)) : "—"],
                  ].map(([k, v]) => (
                    <div key={k} className="rounded-xl bg-neutral-50 py-2">
                      <p className="text-[11px] text-neutral-500">{k}</p>
                      <p className="text-sm font-semibold text-neutral-900">{v}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-xs text-neutral-500">{future} upcoming booking{future === 1 ? "" : "s"}</p>
                  <button onClick={() => setEditing(c)} className={tbtn.outline}>
                    <Pencil className="size-3.5" /> Edit
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing && db.courts.some((c) => c.id === editing.id) ? "Edit court" : "Add court"} wide>
        {editing && <CourtForm key={editing.id} court={editing} onDone={() => setEditing(null)} />}
      </Modal>
    </div>
  );
}

function CourtForm({ court, onDone }: { court: Court; onDone: () => void }) {
  const [c, setC] = useState(court);
  const [features, setFeatures] = useState(court.features.join(", "));
  const set = <K extends keyof Court>(k: K, v: Court[K]) => setC((x) => ({ ...x, [k]: v }));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!c.name.trim()) return toast.error("Court name is required");
        if (c.price <= 0 || c.peakPrice <= 0) return toast.error("Prices must be above zero");
        saveCourt({ ...c, name: c.name.trim(), features: features.split(",").map((f) => f.trim()).filter(Boolean) });
        toast.success("Court saved");
        onDone();
      }}
      className="space-y-4"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Name *</label>
          <input value={c.name} onChange={(e) => set("name", e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Sport</label>
          <select value={c.sport} onChange={(e) => set("sport", e.target.value as Sport)} className={inputClass}>
            {Object.entries(sportLabels).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Surface</label>
          <input value={c.surface} onChange={(e) => set("surface", e.target.value)} className={inputClass} placeholder="Artificial grass" />
        </div>
        <div>
          <label className={labelClass}>Size / format</label>
          <input value={c.size} onChange={(e) => set("size", e.target.value)} className={inputClass} placeholder="7-a-side · 180 × 90 ft" />
        </div>
        <div>
          <label className={labelClass}>Off-peak price / hr</label>
          <input value={c.price} inputMode="numeric" onChange={(e) => set("price", Number(e.target.value.replace(/\D/g, "")))} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Peak price / hr</label>
          <input value={c.peakPrice} inputMode="numeric" onChange={(e) => set("peakPrice", Number(e.target.value.replace(/\D/g, "")))} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Players</label>
          <input value={c.players} onChange={(e) => set("players", e.target.value)} className={inputClass} placeholder="10–14 players" />
        </div>
        <label className="flex items-center gap-2 self-end pb-3 text-sm text-neutral-700">
          <input type="checkbox" checked={c.indoor} onChange={(e) => set("indoor", e.target.checked)} className="accent-emerald-700" /> Indoor / roofed
        </label>
      </div>
      <div>
        <label className={labelClass}>Features (comma separated)</label>
        <input value={features} onChange={(e) => setFeatures(e.target.value)} className={inputClass} placeholder="Floodlights, Changing room" />
      </div>
      <div>
        <label className={labelClass}>Description</label>
        <textarea value={c.description} onChange={(e) => set("description", e.target.value)} rows={2} className={cn(inputClass, "h-auto py-2.5")} />
      </div>
      <div>
        <p className={labelClass}>Photo</p>
        <div className="grid grid-cols-5 gap-2 sm:grid-cols-7">
          {IMAGES.map((src) => (
            <button type="button" key={src} onClick={() => set("image", src)} className={cn("overflow-hidden rounded-lg ring-2", c.image === src ? "ring-emerald-600" : "ring-transparent")}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="aspect-square w-full object-cover" />
            </button>
          ))}
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onDone} className={tbtn.outline}>
          Cancel
        </button>
        <button className={tbtn.green}>Save court</button>
      </div>
    </form>
  );
}
