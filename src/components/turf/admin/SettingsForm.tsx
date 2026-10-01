"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import { hourLabel } from "@/src/lib/turf-store/format";
import { saveSettings, useTurfDB } from "@/src/lib/turf-store/store";
import type { Settings } from "@/src/lib/turf-store/types";
import { inputClass, labelClass, tbtn } from "../ui";

const HOURS = Array.from({ length: 25 }, (_, h) => h);

export default function SettingsForm() {
  const db = useTurfDB();
  const [s, setS] = useState<Settings>(db.settings);
  const set = <K extends keyof Settings>(k: K, v: Settings[K]) => setS((x) => ({ ...x, [k]: v }));
  const num = (k: keyof Settings, min: number, max: number) => ({
    value: s[k] as number,
    type: "number",
    min,
    max,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => set(k, Math.min(max, Math.max(min, Number(e.target.value) || min)) as never),
    className: inputClass,
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (s.closeHour <= s.openHour) return toast.error("Closing time must be after opening time");
        saveSettings(s);
        toast.success("Settings saved — the booking site uses them right away");
      }}
      className="max-w-3xl space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Settings</h1>
        <p className="mt-1 text-sm text-neutral-500">Opening hours, booking rules and advance payment policy.</p>
      </div>

      <section className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-5">
        <h2 className="font-semibold text-neutral-900">Venue</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Venue name</label>
            <input value={s.venueName} onChange={(e) => set("venueName", e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Phone (also the bKash/Nagad number)</label>
            <input value={s.phone} onChange={(e) => set("phone", e.target.value)} className={inputClass} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Address</label>
            <input value={s.address} onChange={(e) => set("address", e.target.value)} className={inputClass} />
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-5">
        <h2 className="font-semibold text-neutral-900">Hours & pricing</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {(
            [
              ["openHour", "Opens at", 0, 23],
              ["closeHour", "Closes at", 1, 24],
              ["peakStartHour", "Peak price from", 0, 24],
            ] as const
          ).map(([k, l, min, max]) => (
            <div key={k}>
              <label className={labelClass}>{l}</label>
              <select value={s[k]} onChange={(e) => set(k, Number(e.target.value))} className={inputClass}>
                {HOURS.filter((h) => h >= min && h <= max).map((h) => (
                  <option key={h} value={h}>
                    {h === 24 ? "Midnight" : hourLabel(h)}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-5">
        <h2 className="font-semibold text-neutral-900">Booking rules</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <label className={labelClass}>Advance required (%)</label>
            <input {...num("advancePercent", 0, 100)} />
          </div>
          <div>
            <label className={labelClass}>Slot hold while paying (min)</label>
            <input {...num("holdMinutes", 2, 60)} />
          </div>
          <div>
            <label className={labelClass}>Max hours per booking</label>
            <input {...num("maxDuration", 1, 6)} />
          </div>
          <div>
            <label className={labelClass}>Book up to (days ahead)</label>
            <input {...num("bookingWindowDays", 1, 60)} />
          </div>
          <div>
            <label className={labelClass}>Online cancel cut-off (hours)</label>
            <input {...num("cancelCutoffHours", 0, 72)} />
          </div>
        </div>
      </section>

      <div className="flex justify-end">
        <button className={tbtn.green}>Save settings</button>
      </div>
    </form>
  );
}
