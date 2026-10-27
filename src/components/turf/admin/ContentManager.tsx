"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";
import { turfImages } from "@/src/lib/turf-store/seed";
import { groundOf, saveContent, saveSettings, updateCourt, useTurfDB } from "@/src/lib/turf-store/store";
import type { Service, SiteContent, TurfDB } from "@/src/lib/turf-store/types";
import { useT } from "@/src/lib/turf-store/i18n";
import { cn } from "@/src/lib/utils";
import { abtn, AddButton, Field, Group, inputClass, SaveBar, Tabs, textareaClass, ToolbarSelect } from "./ui";

type Tab = "venue" | "hero" | "ground" | "services" | "about";

/** Splits "7-a-side · 180 × 90 ft" into its parts so staff edit plain fields, not the format string. */
function splitSize(size: string) {
  const [format = "", dims = ""] = size.split(" · ");
  const [length = "", width = ""] = dims.replace(/ ft$/, "").split(" × ");
  return { format, length, width };
}

/** Everything this page edits, gathered from the three places it lives in the store. */
function draftOf(db: TurfDB) {
  const g = groundOf(db);
  return {
    content: db.content,
    venue: { venueName: db.settings.venueName, phone: db.settings.phone, address: db.settings.address },
    ground: g ? { name: g.name, image: g.image, surface: g.surface, players: g.players, features: g.features, ...splitSize(g.size) } : null,
  };
}
type Draft = ReturnType<typeof draftOf>;

const move = <T,>(xs: T[], i: number, dir: -1 | 1) => {
  const next = [...xs];
  [next[i], next[i + dir]] = [next[i + dir], next[i]];
  return next;
};

function RowTools({ i, length, onMove, onRemove }: { i: number; length: number; onMove: (dir: -1 | 1) => void; onRemove: () => void }) {
  const t = useT();
  return (
    <span className="flex shrink-0 gap-0.5">
      <button type="button" onClick={() => onMove(-1)} disabled={i === 0} aria-label={t("Move up")} className={abtn.icon}>
        <ArrowUp className="size-4" />
      </button>
      <button type="button" onClick={() => onMove(1)} disabled={i === length - 1} aria-label={t("Move down")} className={abtn.icon}>
        <ArrowDown className="size-4" />
      </button>
      <button type="button" onClick={onRemove} aria-label={t("Remove")} className={abtn.iconDanger}>
        <Trash2 className="size-4" />
      </button>
    </span>
  );
}

/** A numbered row card: fields on the left (stacked on phones), order and delete on the right. */
function ListRow({ n, children, tools }: { n: number; children: React.ReactNode; tools: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-2.5 sm:flex sm:items-start sm:gap-2 sm:p-2">
      <div className="mb-2 flex items-center justify-between sm:contents">
        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-xs font-semibold text-neutral-600 sm:order-first sm:mt-2">{n}</span>
        <div className="sm:order-last sm:mt-1">{tools}</div>
      </div>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

/** Picks from the stock venue photos and the gallery, so an uploaded gallery photo can be used here too. */
function PhotoPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const t = useT();
  const { gallery } = useTurfDB();
  const photos = [...new Set([...turfImages, ...gallery.map((g) => g.src)])];
  return (
    <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-8">
      {photos.map((src, i) => (
        <button
          type="button"
          key={src}
          aria-label={t("Use photo {n}", { n: i + 1 })}
          aria-pressed={value === src}
          onClick={() => onChange(src)}
          className={cn("overflow-hidden rounded-md ring-2 ring-offset-2 transition", value === src ? "ring-emerald-600" : "ring-transparent hover:ring-neutral-300")}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- admin preview */}
          <img src={src} alt="" className="aspect-[4/3] w-full object-cover" />
        </button>
      ))}
    </div>
  );
}

export default function ContentManager() {
  const t = useT();
  const db = useTurfDB();
  const [tab, setTab] = useState<Tab>("venue");
  const [draft, setDraft] = useState<Draft>(() => draftOf(db));
  const saved = draftOf(db);
  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);
  const c = draft.content;
  const g = draft.ground;
  const setContent = <K extends keyof SiteContent>(k: K, v: SiteContent[K]) => setDraft((d) => ({ ...d, content: { ...d.content, [k]: v } }));
  const setVenue = (k: keyof Draft["venue"], v: string) => setDraft((d) => ({ ...d, venue: { ...d.venue, [k]: v } }));
  const setGround = (patch: Partial<NonNullable<Draft["ground"]>>) => setDraft((d) => ({ ...d, ground: d.ground && { ...d.ground, ...patch } }));
  const setService = (i: number, patch: Partial<Service>) => setContent("services", c.services.map((s, j) => (j === i ? { ...s, ...patch } : s)));

  const save = () => {
    if (!c.heroTitle.trim()) return toast.error(t("The hero headline can't be empty"));
    if (!draft.venue.venueName.trim() || !draft.venue.phone.trim()) return toast.error(t("Venue name and phone are required"));
    if (g && !g.name.trim()) return toast.error(t("The ground needs a name"));
    const trim = <T extends Record<string, unknown>>(o: T) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, typeof v === "string" ? v.trim() : v])) as T;
    // Keep the cleaned copy as the draft so the bar reads "All changes saved" afterwards.
    const clean: Draft = {
      content: { ...c, services: c.services.filter((s) => s.title.trim()) },
      venue: trim(draft.venue),
      ground: g && { ...trim(g), features: g.features.map((f) => f.trim()).filter(Boolean) },
    };
    saveContent(clean.content);
    saveSettings(clean.venue);
    const ground = groundOf(db);
    if (clean.ground && ground) {
      const { format, length, width, ...rest } = clean.ground;
      updateCourt(ground.id, { ...rest, size: [format, length && width ? `${length} × ${width} ft` : ""].filter(Boolean).join(" · ") });
    }
    setDraft(clean);
    toast.success(t("Content saved — the site shows it right away"));
  };

  const sections: { value: Tab; label: string; count?: number }[] = [
    { value: "venue", label: "Venue info" },
    { value: "hero", label: "Homepage hero" },
    ...(g ? [{ value: "ground" as const, label: "The ground", count: g.features.length }] : []),
    { value: "services", label: "Services", count: c.services.length },
    { value: "about", label: "About" },
  ];

  return (
    <div>
      <section className="rounded-md border border-neutral-200 bg-white">
        {/* Phones: the sections as one dropdown, so none hide off-screen. */}
        <div className="border-b border-neutral-100 p-3 sm:hidden">
          <ToolbarSelect label="Section" value={tab} onChange={setTab} options={sections.map((s) => ({ value: s.value, label: s.label }))} />
        </div>
        <div className="hidden sm:block">
          <Tabs value={tab} onChange={setTab} tabs={sections} />
        </div>

        <div className="p-3 sm:p-6">
          {tab === "venue" && (
            <div className="grid gap-3 sm:gap-4">
              <Group title="Basics">
                <Field label="Venue name">
                  <input value={draft.venue.venueName} onChange={(e) => setVenue("venueName", e.target.value)} className={inputClass} />
                </Field>
                <Field label="Address" className="mt-3">
                  <input value={draft.venue.address} onChange={(e) => setVenue("address", e.target.value)} className={inputClass} />
                </Field>
              </Group>
              <Group title="Contact">
                <Field label="Phone" hint="Also the bKash/Nagad number">
                  <input value={draft.venue.phone} onChange={(e) => setVenue("phone", e.target.value)} className={inputClass} />
                </Field>
              </Group>
            </div>
          )}

          {tab === "hero" && (
            <div className="grid gap-3 sm:gap-4">
              <Group title="Text">
                <Field label="Headline">
                  <textarea value={c.heroTitle} onChange={(e) => setContent("heroTitle", e.target.value)} rows={2} className={textareaClass} />
                </Field>
                <Field label="Intro" className="mt-3">
                  <textarea value={c.heroText} onChange={(e) => setContent("heroText", e.target.value)} rows={3} className={textareaClass} />
                </Field>
              </Group>
              <Group title="Background photo">
                <PhotoPicker value={c.heroImage} onChange={(v) => setContent("heroImage", v)} />
              </Group>
            </div>
          )}

          {tab === "ground" && g && (
            <div className="grid gap-3 sm:gap-4">
              <Group title="Basics">
                <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
                  <Field label="Name">
                    <input value={g.name} onChange={(e) => setGround({ name: e.target.value })} className={inputClass} />
                  </Field>
                  <Field label="Surface">
                    <input value={g.surface} onChange={(e) => setGround({ surface: e.target.value })} placeholder={t("Artificial grass")} className={inputClass} />
                  </Field>
                </div>
              </Group>
              <Group title="Size">
                <div className="grid gap-3 sm:grid-cols-4 sm:gap-4">
                  <Field label="Format">
                    <input value={g.format} onChange={(e) => setGround({ format: e.target.value })} placeholder={t("7-a-side")} className={inputClass} />
                  </Field>
                  <Field label="Players">
                    <input value={g.players} onChange={(e) => setGround({ players: e.target.value })} placeholder={t("10–14 players")} className={inputClass} />
                  </Field>
                  <Field label="Length (ft)">
                    <input value={g.length} inputMode="numeric" onChange={(e) => setGround({ length: e.target.value.replace(/\D/g, "") })} className={inputClass} />
                  </Field>
                  <Field label="Width (ft)">
                    <input value={g.width} inputMode="numeric" onChange={(e) => setGround({ width: e.target.value.replace(/\D/g, "") })} className={inputClass} />
                  </Field>
                </div>
              </Group>
              <Group title="Facilities">
                <div className="space-y-2">
                  {g.features.map((f, i) => (
                    <ListRow
                      key={i}
                      n={i + 1}
                      tools={<RowTools i={i} length={g.features.length} onMove={(d) => setGround({ features: move(g.features, i, d) })} onRemove={() => setGround({ features: g.features.filter((_, j) => j !== i) })} />}
                    >
                      <input value={f} onChange={(e) => setGround({ features: g.features.map((x, j) => (j === i ? e.target.value : x)) })} className={inputClass} />
                    </ListRow>
                  ))}
                  <AddButton onClick={() => setGround({ features: [...g.features, ""] })}>{t("Add facility")}</AddButton>
                </div>
              </Group>
              <Group title="Photo">
                <PhotoPicker value={g.image} onChange={(v) => setGround({ image: v })} />
              </Group>
            </div>
          )}

          {tab === "services" && (
            <div className="space-y-2">
              {c.services.map((s, i) => (
                <ListRow
                  key={i}
                  n={i + 1}
                  tools={<RowTools i={i} length={c.services.length} onMove={(d) => setContent("services", move(c.services, i, d))} onRemove={() => setContent("services", c.services.filter((_, j) => j !== i))} />}
                >
                  <div className="grid gap-2 sm:grid-cols-2">
                    <input aria-label={t("Service name")} value={s.title} onChange={(e) => setService(i, { title: e.target.value })} placeholder={t("Service name")} className={inputClass} />
                    <input
                      aria-label={t("Short detail")}
                      value={s.detail}
                      onChange={(e) => setService(i, { detail: e.target.value })}
                      placeholder={s.online ? t("Empty shows the hourly price") : t("e.g. Coach on request")}
                      className={inputClass}
                    />
                    <textarea aria-label={t("Description")} value={s.text} onChange={(e) => setService(i, { text: e.target.value })} rows={2} placeholder={t("Description")} className={cn(textareaClass, "sm:col-span-2")} />
                    <label className="flex items-center gap-2 text-sm text-neutral-700 sm:col-span-2">
                      <input type="checkbox" checked={s.online} onChange={(e) => setService(i, { online: e.target.checked })} className="size-4 accent-emerald-700" />
                      {t("Booked online")}
                    </label>
                  </div>
                </ListRow>
              ))}
              <AddButton onClick={() => setContent("services", [...c.services, { title: "", text: "", detail: "", online: false }])}>{t("Add service")}</AddButton>
            </div>
          )}

          {tab === "about" && (
            <Group title="About section">
              <Field label="Headline">
                <textarea value={c.aboutTitle} onChange={(e) => setContent("aboutTitle", e.target.value)} rows={2} className={textareaClass} />
              </Field>
              <Field label="Text" className="mt-3">
                <textarea value={c.aboutText} onChange={(e) => setContent("aboutText", e.target.value)} rows={5} className={textareaClass} />
              </Field>
            </Group>
          )}
        </div>

        <SaveBar dirty={dirty} onSave={save} onDiscard={() => setDraft(saved)} />
      </section>
    </div>
  );
}
