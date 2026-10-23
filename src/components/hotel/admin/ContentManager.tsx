"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import {
  ArrowDown,
  ArrowUp,
  Building2,
  Images,
  ListChecks,
  MapPin,
  Plus,
  ScrollText,
  Sparkles,
  Trash2,
  ChevronDown,
  SlidersHorizontal,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { useT } from "@/src/lib/hotel-store/i18n";
import { saveContent, useHotelDB } from "@/src/lib/hotel-store/store";
import type { Content, NearbyPlace } from "@/src/lib/hotel-store/types";
import { cn } from "@/src/lib/utils";
import ImageInput from "./ImageInput";
import { ADMIN, Field, hbtn, inputClass, Tabs, textareaClass } from "./ui";

type Tab = "hotel" | "home" | "facilities" | "why" | "policies" | "nearby";

const move = <T,>(list: T[], i: number, dir: -1 | 1) => {
  const j = i + dir;
  if (j < 0 || j >= list.length) return list;
  const next = [...list];
  [next[i], next[j]] = [next[j], next[i]];
  return next;
};

function RowTools({
  i,
  length,
  onMove,
  onRemove,
}: {
  i: number;
  length: number;
  onMove: (dir: -1 | 1) => void;
  onRemove: () => void;
}) {
  const t = useT();
  return (
    <span className="flex shrink-0 gap-0.5">
      <button
        type="button"
        onClick={() => onMove(-1)}
        disabled={i === 0}
        aria-label={t("Move up")}
        className={`${hbtn.icon} disabled:opacity-30`}
      >
        <ArrowUp className="size-4" />
      </button>
      <button
        type="button"
        onClick={() => onMove(1)}
        disabled={i === length - 1}
        aria-label={t("Move down")}
        className={`${hbtn.icon} disabled:opacity-30`}
      >
        <ArrowDown className="size-4" />
      </button>
      <button
        type="button"
        onClick={onRemove}
        aria-label={t("Remove")}
        className={hbtn.iconDanger}
      >
        <Trash2 className="size-4" />
      </button>
    </span>
  );
}

/** A numbered row card: fields on the left (stacked on phones), order and delete on the right. */
function ListRow({ n, children, tools }: { n: number; children: React.ReactNode; tools: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-2.5 sm:flex sm:items-center sm:gap-2 sm:p-2">
      {/* Phones: number and tools on a small top row, fields full width below. */}
      <div className="mb-2 flex items-center justify-between sm:contents">
        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-xs font-semibold text-neutral-600 sm:order-first">{n}</span>
        <div className="sm:order-last">{tools}</div>
      </div>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

function AddButton({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-neutral-300 py-2.5 text-sm font-medium text-sky-700 transition hover:border-sky-400 hover:bg-sky-50"
    >
      <Plus className="size-4" /> {children}
    </button>
  );
}

function StringList({
  items,
  onChange,
  placeholder,
}: {
  items: string[];
  onChange: (v: string[]) => void;
  placeholder: string;
}) {
  const t = useT();
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <ListRow
          key={i}
          n={i + 1}
          tools={
            <RowTools
              i={i}
              length={items.length}
              onMove={(d) => onChange(move(items, i, d))}
              onRemove={() => onChange(items.filter((_, j) => j !== i))}
            />
          }
        >
          <input
            value={item}
            onChange={(e) =>
              onChange(items.map((x, j) => (j === i ? e.target.value : x)))
            }
            className={inputClass}
          />
        </ListRow>
      ))}
      <AddButton onClick={() => onChange([...items, ""])}>
        {t(placeholder)}
      </AddButton>
    </div>
  );
}

/** Small titled group of fields inside a section. */
function Group({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  const t = useT();
  return (
    <fieldset
      className={cn(
        "rounded-lg border border-neutral-200 p-3 sm:p-4",
        className
      )}
    >
      <legend className="-ml-1 px-1 text-xs font-semibold uppercase tracking-wide text-neutral-500">
        {t(title)}
      </legend>
      {children}
    </fieldset>
  );
}

export default function ContentManager() {
  const t = useT();
  const db = useHotelDB();
  const [tab, setTab] = useState<Tab>("hotel");
  const [draft, setDraft] = useState<Content>(db.content);
  const dirty = JSON.stringify(draft) !== JSON.stringify(db.content);
  const set = <K extends keyof Content>(k: K, v: Content[K]) =>
    setDraft((d) => ({ ...d, [k]: v }));
  const hotel = draft.hotel;
  const setHotel = (k: keyof Content["hotel"], v: string | number) =>
    set("hotel", { ...hotel, [k]: v });

  const save = () => {
    saveContent({
      ...draft,
      whyChoose: draft.whyChoose.map((s) => s.trim()).filter(Boolean),
      policies: draft.policies.map((s) => s.trim()).filter(Boolean),
      facilities: draft.facilities.filter((f) => f.name.trim()),
      nearby: draft.nearby.filter((n) => n.name.trim()),
    });
    toast.success(t("Saved — the website is updated live"));
  };

  const sections: {
    value: Tab;
    label: string;
    hint: string;
    icon: React.ComponentType<{ className?: string }>;
    count?: number;
  }[] = [
    {
      value: "hotel",
      label: "Hotel info",
      hint: "Name, contact details and the description guests read.",
      icon: Building2,
    },
    {
      value: "home",
      label: "Homepage hero",
      hint: "The big headline and photo slideshow at the top of the homepage.",
      icon: Images,
    },
    {
      value: "facilities",
      label: "Facilities",
      hint: "Shown in the Hotel Facilities section and on every room page. Known names get a matching icon (e.g. “Free WiFi”, “Swimming Pool”, “Gym”).",
      icon: Sparkles,
      count: draft.facilities.length,
    },
    {
      value: "why",
      label: "Why choose us",
      hint: "Bullet points beside the guest reviews on the homepage.",
      icon: ListChecks,
      count: draft.whyChoose.length,
    },
    {
      value: "policies",
      label: "House rules",
      hint: "Rules guests see before they book.",
      icon: ScrollText,
      count: draft.policies.length,
    },
    {
      value: "nearby",
      label: "Nearby",
      hint: "The first place is used in the location headline. The airport entry powers the airport-pickup option at checkout.",
      icon: MapPin,
      count: draft.nearby.length,
    },
  ];

  return (
    <div>
      <section className="min-w-0 rounded-md border border-neutral-200 bg-white">
        {/* Phones: a section picker button instead of a long sideways tab strip. */}
        <div className="border-b border-neutral-100 p-3 sm:hidden">
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger
              className={cn(
                hbtn.outline,
                "h-10 w-full justify-start gap-2 px-3"
              )}
            >
              <SlidersHorizontal className="size-4 shrink-0 text-sky-600" />
              <span className="truncate font-semibold text-neutral-900">
                {t(sections.find((x) => x.value === tab)!.label)}
              </span>
              <ChevronDown className="ml-auto size-4 shrink-0 text-neutral-500" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              sideOffset={6}
              className="w-[min(18rem,calc(100vw-2rem))] rounded-md"
            >
              {sections.map((sec) => (
                <DropdownMenuItem
                  key={sec.value}
                  onSelect={() => setTab(sec.value)}
                  className="cursor-pointer py-2.5"
                >
                  <sec.icon
                    className={cn(
                      "size-4",
                      sec.value === tab ? "text-sky-600" : "text-neutral-400"
                    )}
                  />
                  <span
                    className={cn(
                      sec.value === tab && "font-semibold text-sky-800"
                    )}
                  >
                    {t(sec.label)}
                  </span>
                  {sec.count !== undefined && (
                    <span className="ml-auto text-xs tabular-nums text-neutral-500">
                      {sec.count}
                    </span>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="hidden sm:block">
          <Tabs
            value={tab}
            onChange={setTab}
            tabs={sections.map((sec) => ({
              value: sec.value,
              label: sec.label,
              count: sec.count,
            }))}
          />
        </div>

        <div className="p-3 sm:p-6">
          {tab === "hotel" && (
            <div className="grid gap-3 sm:gap-4">
              <Group title="Basics">
                <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
                  <Field label="Hotel name">
                    <input
                      value={hotel.name}
                      onChange={(e) => setHotel("name", e.target.value)}
                      className={inputClass}
                    />
                  </Field>
                  <Field label="City / area">
                    <input
                      value={hotel.location}
                      onChange={(e) => setHotel("location", e.target.value)}
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Address" className="sm:col-span-2">
                    <input
                      value={hotel.address}
                      onChange={(e) => setHotel("address", e.target.value)}
                      className={inputClass}
                    />
                  </Field>
                </div>
              </Group>
              <Group title="Contact">
                <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
                  <Field
                    label="Phone"
                    hint="International format, e.g. +8801880982822"
                  >
                    <input
                      value={hotel.phone}
                      onChange={(e) => setHotel("phone", e.target.value)}
                      inputMode="tel"
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Email">
                    <input
                      value={hotel.email}
                      onChange={(e) => setHotel("email", e.target.value)}
                      type="email"
                      className={inputClass}
                    />
                  </Field>
                  <Field
                    label="WhatsApp number"
                    hint="Digits only; leave empty to hide the chat button"
                    className="sm:col-span-2"
                  >
                    <input
                      value={hotel.whatsapp}
                      onChange={(e) => setHotel("whatsapp", e.target.value)}
                      inputMode="numeric"
                      className={inputClass}
                    />
                  </Field>
                </div>
              </Group>
              <Group title="About & reviews">
                <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
                  <Field label="Guest rating" hint="Out of 5">
                    <input
                      type="number"
                      step={0.1}
                      min={1}
                      max={5}
                      value={hotel.rating}
                      onChange={(e) =>
                        setHotel("rating", Number(e.target.value))
                      }
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Review count">
                    <input
                      type="number"
                      min={0}
                      value={hotel.reviewsCount}
                      onChange={(e) =>
                        setHotel("reviewsCount", Number(e.target.value))
                      }
                      className={inputClass}
                    />
                  </Field>
                  <Field label="About the hotel" className="sm:col-span-2">
                    <textarea
                      value={hotel.description}
                      onChange={(e) => setHotel("description", e.target.value)}
                      rows={5}
                      className={textareaClass}
                    />
                  </Field>
                </div>
              </Group>
            </div>
          )}

          {tab === "home" && (
            <div className="space-y-4">
              <Group title="Headline">
                <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
                  <Field label="Headline">
                    <input
                      value={draft.hero.title}
                      onChange={(e) =>
                        set("hero", { ...draft.hero, title: e.target.value })
                      }
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Highlighted line">
                    <input
                      value={draft.hero.highlight}
                      onChange={(e) =>
                        set("hero", {
                          ...draft.hero,
                          highlight: e.target.value,
                        })
                      }
                      className={inputClass}
                    />
                  </Field>
                </div>
              </Group>
              <Group title="Slideshow">
                <p className="-mt-1 mb-3 text-xs text-neutral-500">
                  {t(
                    "Wide landscape photos work best (1920px+). Slides rotate every 6 seconds."
                  )}
                </p>
                <div className="space-y-2">
                  {draft.hero.slides.map((slide, i) => (
                    <div
                      key={slide.id}
                      className="flex flex-col gap-2 rounded-lg border border-neutral-200 p-2 sm:flex-row sm:items-center sm:gap-3"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element -- admin preview */}
                      <img
                        src={slide.src}
                        alt=""
                        className="aspect-16/7 w-full shrink-0 rounded-md object-cover sm:h-14 sm:w-24 sm:aspect-auto"
                      />
                      <div className="flex min-w-0 flex-1 items-center gap-2">
                        <input
                          value={slide.alt}
                          onChange={(e) =>
                            set("hero", {
                              ...draft.hero,
                              slides: draft.hero.slides.map((s) =>
                                s.id === slide.id
                                  ? { ...s, alt: e.target.value }
                                  : s
                              ),
                            })
                          }
                          placeholder={t(
                            "Describe the photo (for screen readers)"
                          )}
                          className={inputClass}
                        />
                        <RowTools
                          i={i}
                          length={draft.hero.slides.length}
                          onMove={(d) =>
                            set("hero", {
                              ...draft.hero,
                              slides: move(draft.hero.slides, i, d),
                            })
                          }
                          onRemove={() =>
                            set("hero", {
                              ...draft.hero,
                              slides: draft.hero.slides.filter(
                                (s) => s.id !== slide.id
                              ),
                            })
                          }
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3">
                  <ImageInput
                    onAdd={(src) =>
                      setDraft((d) => ({
                        ...d,
                        hero: {
                          ...d.hero,
                          slides: [
                            ...d.hero.slides,
                            {
                              id: `s${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`,
                              src,
                              alt: "",
                            },
                          ],
                        },
                      }))
                    }
                  />
                </div>
              </Group>
            </div>
          )}

          {tab === "facilities" && (
            <div className="space-y-2">
              {draft.facilities.map((f, i) => (
                <ListRow
                  key={i}
                  n={i + 1}
                  tools={
                    <RowTools
                      i={i}
                      length={draft.facilities.length}
                      onMove={(d) =>
                        set("facilities", move(draft.facilities, i, d))
                      }
                      onRemove={() =>
                        set(
                          "facilities",
                          draft.facilities.filter((_, j) => j !== i)
                        )
                      }
                    />
                  }
                >
                  <div className="grid gap-2 sm:grid-cols-[14rem_minmax(0,1fr)]">
                    <input
                      value={f.name}
                      onChange={(e) =>
                        set(
                          "facilities",
                          draft.facilities.map((x, j) =>
                            j === i ? { ...x, name: e.target.value } : x
                          )
                        )
                      }
                      placeholder={t("Facility")}
                      className={cn(inputClass, "font-medium")}
                    />
                    <input
                      value={f.detail}
                      onChange={(e) =>
                        set(
                          "facilities",
                          draft.facilities.map((x, j) =>
                            j === i ? { ...x, detail: e.target.value } : x
                          )
                        )
                      }
                      placeholder={t("One-line detail")}
                      className={inputClass}
                    />
                  </div>
                </ListRow>
              ))}
              <AddButton
                onClick={() =>
                  set("facilities", [
                    ...draft.facilities,
                    { name: "", detail: "" },
                  ])
                }
              >
                {t("Add facility")}
              </AddButton>
            </div>
          )}

          {tab === "why" && (
            <div>
              <StringList
                items={draft.whyChoose}
                onChange={(v) => set("whyChoose", v)}
                placeholder="Add a reason"
              />
            </div>
          )}

          {tab === "policies" && (
            <div>
              <p className="mb-3 rounded-lg bg-sky-50 p-3 text-xs text-sky-900">
                {t(
                  "Check-in/out times and the free-cancellation rule are generated from Settings so they always match what the booking system enforces."
                )}{" "}
                <Link
                  href={`${ADMIN}/settings`}
                  className="font-semibold underline"
                >
                  {t("Open Settings")}
                </Link>
              </p>
              <StringList
                items={draft.policies}
                onChange={(v) => set("policies", v)}
                placeholder="Add a house rule"
              />
            </div>
          )}

          {tab === "nearby" && (
            <div className="space-y-2">
              {draft.nearby.map((n, i) => (
                <ListRow
                  key={i}
                  n={i + 1}
                  tools={
                    <RowTools
                      i={i}
                      length={draft.nearby.length}
                      onMove={(d) => set("nearby", move(draft.nearby, i, d))}
                      onRemove={() =>
                        set(
                          "nearby",
                          draft.nearby.filter((_, j) => j !== i)
                        )
                      }
                    />
                  }
                >
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-[minmax(0,1fr)_7rem_8rem]">
                    <input
                      value={n.name}
                      onChange={(e) =>
                        set(
                          "nearby",
                          draft.nearby.map((x, j) =>
                            j === i ? { ...x, name: e.target.value } : x
                          )
                        )
                      }
                      placeholder={t("Place")}
                      className={cn(
                        inputClass,
                        "col-span-2 font-medium sm:col-span-1"
                      )}
                    />
                    <input
                      value={n.distance}
                      onChange={(e) =>
                        set(
                          "nearby",
                          draft.nearby.map((x, j) =>
                            j === i ? { ...x, distance: e.target.value } : x
                          )
                        )
                      }
                      placeholder={t("e.g. 3 km")}
                      className={inputClass}
                    />
                    <select
                      value={n.type}
                      onChange={(e) =>
                        set(
                          "nearby",
                          draft.nearby.map((x, j) =>
                            j === i
                              ? {
                                  ...x,
                                  type: e.target.value as NearbyPlace["type"],
                                }
                              : x
                          )
                        )
                      }
                      aria-label={t("Type")}
                      className={inputClass}
                    >
                      <option value="beach">{t("Beach")}</option>
                      <option value="temple">{t("Landmark")}</option>
                      <option value="airport">{t("Airport")}</option>
                      <option value="park">{t("Park")}</option>
                    </select>
                  </div>
                </ListRow>
              ))}
              <AddButton
                onClick={() =>
                  set("nearby", [
                    ...draft.nearby,
                    { name: "", distance: "", type: "beach" },
                  ])
                }
              >
                {t("Add place")}
              </AddButton>
            </div>
          )}
        </div>

        {/* Save bar: always at the bottom of the editor; it turns blue once something has changed. */}
        <div
          className={cn(
            "sticky bottom-0 flex items-center justify-between gap-2 rounded-b-md border-t px-3 py-2.5 backdrop-blur sm:px-6 sm:py-3",
            dirty
              ? "border-sky-200 bg-sky-50/95"
              : "border-neutral-100 bg-white/95"
          )}
        >
          <p
            className={cn(
              "min-w-0 truncate text-[13px] sm:text-sm",
              dirty ? "font-medium text-sky-900" : "text-neutral-500"
            )}
          >
            {dirty ? t("You have unsaved changes.") : t("All changes saved")}
          </p>
          <div className="flex shrink-0 gap-2">
            {dirty && (
              <button
                onClick={() => setDraft(db.content)}
                className={cn(hbtn.outline, "bg-white")}
              >
                {t("Discard")}
              </button>
            )}
            <button onClick={save} disabled={!dirty} className={hbtn.primary}>
              <span className="sm:hidden">{t("Save")}</span>
              <span className="hidden sm:inline">{t("Save changes")}</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
