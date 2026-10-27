"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import { hourLabel } from "@/src/lib/turf-store/format";
import { groundOf, saveSettings, updateCourt, useTurfDB } from "@/src/lib/turf-store/store";
import type { Settings, TurfDB } from "@/src/lib/turf-store/types";
import { useT } from "@/src/lib/turf-store/i18n";
import { cn } from "@/src/lib/utils";
import { Field, Group, inputClass, SaveBar, Tabs } from "./ui";

type Tab = "hours" | "rules";

// Venue name, phone and address are edited on the Content page.
const RULE_KEYS = ["openHour", "closeHour", "peakStartHour", "advancePercent", "holdMinutes", "maxDuration", "bookingWindowDays", "cancelCutoffHours"] as const;
type Rules = Pick<Settings, (typeof RULE_KEYS)[number]>;

function draftOf(db: TurfDB) {
  const g = groundOf(db);
  return {
    rules: Object.fromEntries(RULE_KEYS.map((k) => [k, db.settings[k]])) as Rules,
    price: g?.price ?? 0,
    peakPrice: g?.peakPrice ?? 0,
  };
}
type Draft = ReturnType<typeof draftOf>;

const HOURS = Array.from({ length: 25 }, (_, h) => h);

/** Number input with a unit on the right, as on the hotel settings page. */
function UnitInput({ value, onChange, min, max, unit }: { value: number; onChange: (n: number) => void; min: number; max: number; unit: string }) {
  const t = useT();
  return (
    <div className="relative">
      <input type="number" min={min} max={max} value={value} onChange={(e) => onChange(Math.min(max, Math.max(min, Number(e.target.value) || min)))} className={cn(inputClass, "pr-14")} />
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-500">{t(unit)}</span>
    </div>
  );
}

export default function SettingsForm() {
  const t = useT();
  const db = useTurfDB();
  const ground = groundOf(db);
  const [tab, setTab] = useState<Tab>("hours");
  const [draft, setDraft] = useState<Draft>(() => draftOf(db));
  const saved = draftOf(db);
  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);
  const r = draft.rules;
  const set = <K extends keyof Rules>(k: K, v: Rules[K]) => setDraft((d) => ({ ...d, rules: { ...d.rules, [k]: v } }));

  const save = () => {
    if (r.closeHour <= r.openHour) return toast.error(t("Closing time must be after opening time"));
    if (ground && (draft.price <= 0 || draft.peakPrice <= 0)) return toast.error(t("Prices must be above zero"));
    saveSettings(r);
    if (ground) updateCourt(ground.id, { price: draft.price, peakPrice: draft.peakPrice });
    toast.success(t("Settings saved — the booking site uses them right away"));
  };

  const hourSelect = (k: "openHour" | "closeHour" | "peakStartHour", min: number, max: number) => (
    <select value={r[k]} onChange={(e) => set(k, Number(e.target.value))} className={inputClass}>
      {HOURS.filter((h) => h >= min && h <= max).map((h) => (
        <option key={h} value={h}>
          {h === 24 ? t("Midnight") : hourLabel(h)}
        </option>
      ))}
    </select>
  );

  return (
    <div>
      <section className="rounded-md border border-neutral-200 bg-white">
        <Tabs
          value={tab}
          onChange={setTab}
          tabs={[
            { value: "hours", label: "Hours & prices" },
            { value: "rules", label: "Booking rules" },
          ]}
        />
        <div className="p-3 sm:p-6">
          {tab === "hours" && (
            <div className="grid gap-3 sm:gap-4">
              <Group title="Opening hours">
                <div className="grid gap-3 sm:grid-cols-3 sm:gap-4">
                  <Field label="Opens at">{hourSelect("openHour", 0, 23)}</Field>
                  <Field label="Closes at">
                    {hourSelect("closeHour", 1, 24)}
                  </Field>
                  <Field label="Peak price from">{hourSelect("peakStartHour", 0, 24)}</Field>
                </div>
              </Group>
              {ground && (
                <Group title="Price per hour">
                  <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
                    <Field label="Off-peak">
                      <UnitInput value={draft.price} min={0} max={100000} unit="৳ / hr" onChange={(price) => setDraft((d) => ({ ...d, price }))} />
                    </Field>
                    <Field label="Peak">
                      <UnitInput value={draft.peakPrice} min={0} max={100000} unit="৳ / hr" onChange={(peakPrice) => setDraft((d) => ({ ...d, peakPrice }))} />
                    </Field>
                  </div>
                </Group>
              )}
            </div>
          )}

          {tab === "rules" && (
            <div className="grid gap-3 sm:gap-4">
              <Group title="Online booking">
                <div className="grid gap-3 sm:grid-cols-3 sm:gap-4">
                  <Field label="Book up to">
                    <UnitInput value={r.bookingWindowDays} min={1} max={180} unit="days" onChange={(v) => set("bookingWindowDays", v)} />
                  </Field>
                  <Field label="Longest booking">
                    <UnitInput value={r.maxDuration} min={1} max={6} unit="hours" onChange={(v) => set("maxDuration", v)} />
                  </Field>
                  <Field label="Hold while paying">
                    <UnitInput value={r.holdMinutes} min={2} max={60} unit="min" onChange={(v) => set("holdMinutes", v)} />
                  </Field>
                </div>
              </Group>
              <Group title="Advance & refunds">
                <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
                  <Field label="Advance">
                    <UnitInput value={r.advancePercent} min={0} max={100} unit="%" onChange={(v) => set("advancePercent", v)} />
                  </Field>
                  <Field label="Full refund if cancelled" hint="Before kick-off; later cancellations keep the money by default">
                    <UnitInput value={r.cancelCutoffHours} min={0} max={72} unit="hrs before" onChange={(v) => set("cancelCutoffHours", v)} />
                  </Field>
                </div>
              </Group>
            </div>
          )}
        </div>
        <SaveBar dirty={dirty} onSave={save} onDiscard={() => setDraft(saved)} />
      </section>
    </div>
  );
}
