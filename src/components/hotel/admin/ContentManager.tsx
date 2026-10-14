"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import { ArrowDown, ArrowUp, ExternalLink, Plus, Trash2 } from "lucide-react";
import { saveContent, useHotelDB } from "@/src/lib/hotel-store/store";
import type { Content, NearbyPlace } from "@/src/lib/hotel-store/types";
import ImageInput from "./ImageInput";
import { ADMIN, AdminHeader, Card, Field, hbtn, inputClass, Tabs, textareaClass } from "./ui";

type Tab = "hotel" | "home" | "facilities" | "why" | "policies" | "nearby";

const move = <T,>(list: T[], i: number, dir: -1 | 1) => {
  const j = i + dir;
  if (j < 0 || j >= list.length) return list;
  const next = [...list];
  [next[i], next[j]] = [next[j], next[i]];
  return next;
};

function RowTools({ i, length, onMove, onRemove }: { i: number; length: number; onMove: (dir: -1 | 1) => void; onRemove: () => void }) {
  return (
    <span className="flex shrink-0 gap-0.5">
      <button type="button" onClick={() => onMove(-1)} disabled={i === 0} aria-label="Move up" className={`${hbtn.icon} disabled:opacity-30`}>
        <ArrowUp className="size-4" />
      </button>
      <button type="button" onClick={() => onMove(1)} disabled={i === length - 1} aria-label="Move down" className={`${hbtn.icon} disabled:opacity-30`}>
        <ArrowDown className="size-4" />
      </button>
      <button type="button" onClick={onRemove} aria-label="Remove" className={hbtn.iconDanger}>
        <Trash2 className="size-4" />
      </button>
    </span>
  );
}

function StringList({ items, onChange, placeholder }: { items: string[]; onChange: (v: string[]) => void; placeholder: string }) {
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <input value={item} onChange={(e) => onChange(items.map((x, j) => (j === i ? e.target.value : x)))} className={inputClass} />
          <RowTools i={i} length={items.length} onMove={(d) => onChange(move(items, i, d))} onRemove={() => onChange(items.filter((_, j) => j !== i))} />
        </div>
      ))}
      <button type="button" onClick={() => onChange([...items, ""])} className={hbtn.small}>
        <Plus className="size-3.5" /> {placeholder}
      </button>
    </div>
  );
}

export default function ContentManager() {
  const db = useHotelDB();
  const [tab, setTab] = useState<Tab>("hotel");
  const [draft, setDraft] = useState<Content>(db.content);
  const dirty = JSON.stringify(draft) !== JSON.stringify(db.content);
  const set = <K extends keyof Content>(k: K, v: Content[K]) => setDraft((d) => ({ ...d, [k]: v }));
  const hotel = draft.hotel;
  const setHotel = (k: keyof Content["hotel"], v: string | number) => set("hotel", { ...hotel, [k]: v });

  const save = () => {
    saveContent({
      ...draft,
      whyChoose: draft.whyChoose.map((s) => s.trim()).filter(Boolean),
      policies: draft.policies.map((s) => s.trim()).filter(Boolean),
      facilities: draft.facilities.filter((f) => f.name.trim()),
      nearby: draft.nearby.filter((n) => n.name.trim()),
    });
    toast.success("Saved — the website is updated live");
  };

  return (
    <div>
      <AdminHeader
        title="Website content"
        subtitle="Everything guests read on the hotel website. Changes go live as soon as you save."
        actions={
          <>
            <Link href="/hotel-management" target="_blank" className={hbtn.outline}>
              <ExternalLink className="size-4" /> Preview site
            </Link>
            {dirty && (
              <button onClick={() => setDraft(db.content)} className={hbtn.outline}>
                Discard
              </button>
            )}
            <button onClick={save} disabled={!dirty} className={hbtn.primary}>
              Save changes
            </button>
          </>
        }
      />

      <div className="overflow-hidden rounded-md border border-neutral-200 bg-white">
        <Tabs
          value={tab}
          onChange={setTab}
          tabs={[
            { value: "hotel", label: "Hotel info" },
            { value: "home", label: "Homepage hero" },
            { value: "facilities", label: "Facilities", count: draft.facilities.length },
            { value: "why", label: "Why choose us", count: draft.whyChoose.length },
            { value: "policies", label: "House rules", count: draft.policies.length },
            { value: "nearby", label: "Nearby", count: draft.nearby.length },
          ]}
        />
        <div className="p-5 md:p-6">
          {tab === "hotel" && (
            <div className="grid max-w-3xl gap-4 sm:grid-cols-2">
              <Field label="Hotel name">
                <input value={hotel.name} onChange={(e) => setHotel("name", e.target.value)} className={inputClass} />
              </Field>
              <Field label="City / area">
                <input value={hotel.location} onChange={(e) => setHotel("location", e.target.value)} className={inputClass} />
              </Field>
              <Field label="Address" className="sm:col-span-2">
                <input value={hotel.address} onChange={(e) => setHotel("address", e.target.value)} className={inputClass} />
              </Field>
              <Field label="Phone" hint="International format, e.g. +8801880982822">
                <input value={hotel.phone} onChange={(e) => setHotel("phone", e.target.value)} className={inputClass} />
              </Field>
              <Field label="Email">
                <input value={hotel.email} onChange={(e) => setHotel("email", e.target.value)} className={inputClass} />
              </Field>
              <Field label="WhatsApp number" hint="Digits only; leave empty to hide the chat button">
                <input value={hotel.whatsapp} onChange={(e) => setHotel("whatsapp", e.target.value)} className={inputClass} />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Guest rating">
                  <input type="number" step={0.1} min={1} max={5} value={hotel.rating} onChange={(e) => setHotel("rating", Number(e.target.value))} className={inputClass} />
                </Field>
                <Field label="Review count">
                  <input type="number" min={0} value={hotel.reviewsCount} onChange={(e) => setHotel("reviewsCount", Number(e.target.value))} className={inputClass} />
                </Field>
              </div>
              <Field label="About the hotel" className="sm:col-span-2">
                <textarea value={hotel.description} onChange={(e) => setHotel("description", e.target.value)} rows={4} className={textareaClass} />
              </Field>
            </div>
          )}

          {tab === "home" && (
            <div className="space-y-6">
              <div className="grid max-w-3xl gap-4 sm:grid-cols-2">
                <Field label="Headline">
                  <input value={draft.hero.title} onChange={(e) => set("hero", { ...draft.hero, title: e.target.value })} className={inputClass} />
                </Field>
                <Field label="Highlighted line">
                  <input value={draft.hero.highlight} onChange={(e) => set("hero", { ...draft.hero, highlight: e.target.value })} className={inputClass} />
                </Field>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-neutral-900">Slideshow</h3>
                <p className="text-xs text-neutral-500">Wide landscape photos work best (1920px+). Slides rotate every 6 seconds.</p>
                <div className="mt-3 space-y-2">
                  {draft.hero.slides.map((slide, i) => (
                    <div key={slide.id} className="flex items-center gap-3 rounded-md border border-neutral-200 p-2">
                      {/* eslint-disable-next-line @next/next/no-img-element -- admin preview */}
                      <img src={slide.src} alt="" className="h-14 w-24 shrink-0 rounded-md object-cover" />
                      <input
                        value={slide.alt}
                        onChange={(e) => set("hero", { ...draft.hero, slides: draft.hero.slides.map((s) => (s.id === slide.id ? { ...s, alt: e.target.value } : s)) })}
                        placeholder="Describe the photo (for screen readers)"
                        className={inputClass}
                      />
                      <RowTools
                        i={i}
                        length={draft.hero.slides.length}
                        onMove={(d) => set("hero", { ...draft.hero, slides: move(draft.hero.slides, i, d) })}
                        onRemove={() => set("hero", { ...draft.hero, slides: draft.hero.slides.filter((s) => s.id !== slide.id) })}
                      />
                    </div>
                  ))}
                </div>
                <div className="mt-3">
                  <ImageInput onAdd={(src) => setDraft((d) => ({ ...d, hero: { ...d.hero, slides: [...d.hero.slides, { id: `s${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`, src, alt: "" }] } }))} />
                </div>
              </div>
            </div>
          )}

          {tab === "facilities" && (
            <div className="max-w-3xl space-y-2">
              <p className="mb-3 text-xs text-neutral-500">Shown in the Hotel Facilities section and on every room page. Known names get a matching icon (e.g. “Free WiFi”, “Swimming Pool”, “Gym”).</p>
              {draft.facilities.map((f, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input value={f.name} onChange={(e) => set("facilities", draft.facilities.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} placeholder="Facility" className={`${inputClass} w-56 shrink-0`} />
                  <input value={f.detail} onChange={(e) => set("facilities", draft.facilities.map((x, j) => (j === i ? { ...x, detail: e.target.value } : x)))} placeholder="One-line detail" className={inputClass} />
                  <RowTools i={i} length={draft.facilities.length} onMove={(d) => set("facilities", move(draft.facilities, i, d))} onRemove={() => set("facilities", draft.facilities.filter((_, j) => j !== i))} />
                </div>
              ))}
              <button onClick={() => set("facilities", [...draft.facilities, { name: "", detail: "" }])} className={hbtn.small}>
                <Plus className="size-3.5" /> Add facility
              </button>
            </div>
          )}

          {tab === "why" && (
            <div className="max-w-2xl">
              <p className="mb-3 text-xs text-neutral-500">Bullet points beside the guest reviews on the homepage.</p>
              <StringList items={draft.whyChoose} onChange={(v) => set("whyChoose", v)} placeholder="Add a reason" />
            </div>
          )}

          {tab === "policies" && (
            <div className="max-w-2xl">
              <p className="mb-3 rounded-md bg-sky-50 p-3 text-xs text-sky-900">
                Check-in/out times and the free-cancellation rule are generated from{" "}
                <Link href={`${ADMIN}/settings`} className="font-semibold underline">
                  Settings
                </Link>{" "}
                so they always match what the booking system enforces.
              </p>
              <StringList items={draft.policies} onChange={(v) => set("policies", v)} placeholder="Add a house rule" />
            </div>
          )}

          {tab === "nearby" && (
            <div className="max-w-3xl space-y-2">
              {draft.nearby.map((n, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input value={n.name} onChange={(e) => set("nearby", draft.nearby.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} placeholder="Place" className={inputClass} />
                  <input value={n.distance} onChange={(e) => set("nearby", draft.nearby.map((x, j) => (j === i ? { ...x, distance: e.target.value } : x)))} placeholder="e.g. 3 km" className={`${inputClass} w-28 shrink-0`} />
                  <select
                    value={n.type}
                    onChange={(e) => set("nearby", draft.nearby.map((x, j) => (j === i ? { ...x, type: e.target.value as NearbyPlace["type"] } : x)))}
                    className={`${inputClass} w-32 shrink-0`}
                  >
                    <option value="beach">Beach</option>
                    <option value="temple">Landmark</option>
                    <option value="airport">Airport</option>
                    <option value="park">Park</option>
                  </select>
                  <RowTools i={i} length={draft.nearby.length} onMove={(d) => set("nearby", move(draft.nearby, i, d))} onRemove={() => set("nearby", draft.nearby.filter((_, j) => j !== i))} />
                </div>
              ))}
              <button onClick={() => set("nearby", [...draft.nearby, { name: "", distance: "", type: "beach" }])} className={hbtn.small}>
                <Plus className="size-3.5" /> Add place
              </button>
              <p className="pt-2 text-xs text-neutral-500">The first place is used in the location headline. The airport entry powers the airport-pickup option at checkout.</p>
            </div>
          )}
        </div>
      </div>
      {dirty && (
        <Card className="fixed inset-x-4 bottom-4 z-30 flex items-center justify-between gap-3 border-sky-200 bg-sky-50 py-3 shadow-lg lg:left-72">
          <p className="text-sm font-medium text-sky-900">You have unsaved changes.</p>
          <button onClick={save} className={hbtn.primary}>
            Save changes
          </button>
        </Card>
      )}
    </div>
  );
}
