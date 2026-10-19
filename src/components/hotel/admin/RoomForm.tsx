"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { FormProvider, useFieldArray, useForm, type FieldPath } from "react-hook-form";
import { ArrowLeft, CheckCircle2, ChevronDown, Circle, Loader2, Minus, Plus, Trash2, X } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/src/components/ui/dropdown-menu";
import { deleteUnit, newRoomTypeId, newUnitId, roomRating, saveRoomType, saveUnit, useHotelDB } from "@/src/lib/hotel-store/store";
import { taka } from "@/src/lib/hotel-store/format";
import type { RoomTypeRecord, RoomUnit } from "@/src/lib/hotel-store/types";
import { cn } from "@/src/lib/utils";
import { Disclosure } from "./booking-form/parts";
import FacilityPicker from "./room-form/FacilityPicker";
import {
  BED_TYPES,
  SIZE_UNITS,
  defaultValues,
  findIssues,
  floorFromNumber,
  floorLabel,
  formatBeds,
  formatSize,
  guestNightly,
  nextNumber,
  toNumber,
  type FieldName,
  type FormValues,
  type Issue,
  type Photo,
} from "./room-form/model";
import { ctl, described, Field, FieldError, focusRing, Section } from "./room-form/parts";
import PhotoManager, { readyPhoto } from "./room-form/PhotoManager";
import RoomPreview, { type PreviewStatus } from "./room-form/RoomPreview";
import { ADMIN, Card, Empty, hbtn, textareaClass } from "./ui";

/** `+next` saves, then clears the form for the next room. */
type Intent = "draft" | "save" | "draft+next" | "save+next";

const fieldNames: Record<FieldName, string> = {
  number: "Room number",
  floor: "Floor",
  name: "Room name",
  description: "Description",
  beds: "Beds",
  sizeValue: "Room size",
  sizeUnit: "Room size",
  capacity: "Maximum occupancy",
  amenities: "Facilities",
  price: "Nightly rate",
  originalPrice: "Comparison price",
  showCompare: "Comparison price",
  highlight: "Website badge",
  active: "Website visibility",
  outOfService: "Room operational status",
  oosReason: "Room operational status",
  shareDetails: "Shared details",
  photos: "Photos",
};
const photoKey = (photos: Photo[]) => photos.map((p) => p.src).join("|");

/** One form for adding or editing a single room and everything guests see about it. */
export default function RoomForm({ id }: { id?: string }) {
  const db = useHotelDB();
  const unit = id ? db.units.find((u) => u.id === id) : undefined;
  if (id && !unit) {
    return (
      <Card>
        <Empty icon={X} title="Room not found">
          <Link href={`${ADMIN}/rooms`} className={hbtn.outline}>
            Back to rooms
          </Link>
        </Empty>
      </Card>
    );
  }
  return <Editor unit={unit} type={unit && db.roomTypes.find((t) => t.id === unit.typeId)} />;
}

function Editor({ unit, type }: { unit?: RoomUnit; type?: RoomTypeRecord }) {
  const db = useHotelDB();
  const router = useRouter();
  const siblings = unit ? db.units.filter((u) => u.typeId === unit.typeId && u.id !== unit.id).sort((a, b) => a.number.localeCompare(b.number, undefined, { numeric: true })) : [];
  const isDraft = !unit || !!type?.draft;

  const methods = useForm<FormValues>({ defaultValues: defaultValues(type, unit) });
  const { register, control, watch, setValue, getValues, setError, clearErrors, setFocus, reset, formState } = methods;
  const { errors } = formState;
  const beds = useFieldArray({ control, name: "beds" });
  const v = watch();

  const [photos, setPhotos] = useState<Photo[]>(() => (type?.images ?? []).map(readyPhoto));
  const [savedPhotos, setSavedPhotos] = useState(() => photoKey(photos));
  const [photoError, setPhotoError] = useState<string>();
  const [saving, setSaving] = useState<Intent | null>(null);
  const savingRef = useRef(false);
  const dirty = formState.isDirty || photoKey(photos) !== savedPhotos;

  // Editing a field clears its error; the rest stay until the next save.
  useEffect(() => {
    const sub = watch((_, { name }) => {
      if (name) clearErrors(name.split(".")[0] as FieldPath<FormValues>);
    });
    return () => sub.unsubscribe();
  }, [watch, clearErrors]);
  useEffect(() => setPhotoError(undefined), [photos]);

  // A new room's floor follows its number (109 → floor 1) until staff set the floor themselves.
  const [floorTouched, setFloorTouched] = useState(!!unit);
  const suggestedFloor = floorFromNumber(v.number.trim());
  useEffect(() => {
    if (!floorTouched && suggestedFloor !== undefined) setValue("floor", String(suggestedFloor), { shouldDirty: true });
  }, [floorTouched, suggestedFloor, setValue]);

  // Warn before a reload, closing the tab, or following any in-app link with unsaved changes.
  useEffect(() => {
    if (!dirty) return;
    const onUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a || a.target === "_blank" || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      const to = new URL(a.href, location.href);
      if (to.origin !== location.origin || to.pathname === location.pathname) return;
      if (!confirm("Leave without saving? Your changes to this room will be lost.")) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    window.addEventListener("beforeunload", onUnload);
    document.addEventListener("click", onClick, true);
    return () => {
      window.removeEventListener("beforeunload", onUnload);
      document.removeEventListener("click", onClick, true);
    };
  }, [dirty]);

  const issues = useMemo(() => findIssues(v, photos, db, unit?.id), [v, photos, db, unit?.id]);
  const missing = issues.filter((i) => i.required);
  const dupe = issues.find((i) => i.field === "number" && v.number.trim())?.message;
  const status: PreviewStatus = missing.length ? "draft" : v.active ? "published" : "hidden";

  const price = toNumber(v.price);
  const { serviceFeeRate, vatRate } = db.settings;
  const err = (f: keyof FormValues) => errors[f]?.message as string | undefined;

  const focusField = (field: FieldName) => {
    if (field === "photos") {
      const el = document.getElementById("field-photos");
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      el?.focus({ preventScroll: true });
      return;
    }
    const target = field === "beds" ? "beds.0.type" : field === "showCompare" ? "originalPrice" : field;
    try {
      setFocus(target as FieldPath<FormValues>, { shouldSelect: false });
      document.activeElement?.scrollIntoView({ behavior: "smooth", block: "center" });
    } catch {
      /* field not mounted */
    }
  };

  const showIssues = (list: Issue[]) => {
    clearErrors();
    const seen = new Set<FieldName>();
    for (const i of list) {
      if (seen.has(i.field)) continue;
      seen.add(i.field);
      if (i.field === "photos") setPhotoError(i.message);
      else setError(i.field, { type: "manual", message: i.message });
    }
    focusField(list[0].field);
  };

  const persist = (values: FormValues, draft: boolean) => {
    const rate = toNumber(values.price);
    const was = toNumber(values.originalPrice);
    const details = {
      name: values.name.trim(),
      highlight: values.highlight.trim(),
      description: values.description.trim(),
      beds: formatBeds(values.beds),
      size: formatSize(values),
      capacity: toNumber(values.capacity) || 0,
      price: rate > 0 ? rate : 0,
      originalPrice: values.showCompare && was > rate ? was : rate > 0 ? rate : 0,
      amenities: values.amenities,
      images: photos.filter((p) => p.status === "ready").map((p) => p.src),
      active: values.active,
      draft,
    };
    // Every new room gets its own listing. Older rooms that still share one can split off when edited.
    const typeId = unit && (values.shareDetails || !siblings.length) ? unit.typeId : newRoomTypeId(db, details.name || `room-${values.number.trim()}`);
    if (unit && unit.typeId !== typeId && db.bookings.some((b) => ["pending", "confirmed", "checked-in"].includes(b.status) && b.unitIds.includes(unit.id))) {
      return { ok: false as const, error: `Room ${values.number} has upcoming bookings — apply the changes to rooms ${siblings.map((u) => u.number).join(", ")} too, or move the bookings first.` };
    }
    const t = saveRoomType({ id: typeId, ...details, ...roomRating(db, typeId) });
    if (!t.ok) return t;
    return saveUnit({
      id: unit?.id ?? newUnitId(),
      number: values.number.trim(),
      floor: toNumber(values.floor),
      typeId,
      housekeeping: unit?.housekeeping ?? "clean",
      outOfService: values.outOfService,
      oosReason: values.outOfService ? values.oosReason.trim() || undefined : undefined,
      note: unit?.note,
    });
  };

  const submit = async (intent: Intent) => {
    if (savingRef.current) return;
    const values = getValues();
    const all = findIssues(values, photos, db, unit?.id);
    const asDraft = intent.startsWith("draft");
    const blocking = asDraft ? all.filter((i) => !i.required) : all;
    if (blocking.length) {
      showIssues(blocking);
      toast.error(blocking.length === 1 ? blocking[0].message : `${new Set(blocking.map((i) => i.field)).size} fields need attention — see the messages in red.`);
      return;
    }
    savingRef.current = true;
    setSaving(intent);
    try {
      // Let the "Saving…" state paint before the synchronous store write.
      await new Promise((r) => setTimeout(r, 250));
      const r = persist(values, asDraft);
      if (!r.ok) {
        if (/already exists/.test(r.error)) showIssues([{ field: "number", message: r.error }]);
        toast.error(r.error);
        return;
      }
      const n = r.value.number;
      const what = asDraft ? "saved as a draft" : !values.active ? "saved (hidden from website)" : unit && !type?.draft ? "saved — the website is updated" : "published";
      if (intent.endsWith("+next")) {
        const next = /^\d+$/.test(n) ? String(Math.max(Number(nextNumber(db, r.value.floor)), Number(n) + 1)) : "";
        setFloorTouched(false);
        reset({ ...defaultValues(), number: next, floor: String(r.value.floor) });
        setPhotos([]);
        setSavedPhotos("");
        toast.success(`Room ${n} ${what}. Ready for the next room.`);
        window.scrollTo({ top: 0, behavior: "smooth" });
        setTimeout(() => setFocus("number", { shouldSelect: true }), 50);
        return;
      }
      reset(values);
      setSavedPhotos(photoKey(photos));
      toast.success(`Room ${n} ${what}.`);
      router.push(`${ADMIN}/rooms/${r.value.id}`);
    } finally {
      savingRef.current = false;
      setSaving(null);
    }
  };

  const remove = () => {
    if (!unit || !confirm(`Delete room ${unit.number}? Past bookings keep their history.`)) return;
    const r = deleteUnit(unit.id);
    if (!r.ok) return toast.error(r.error);
    reset(getValues());
    setSavedPhotos(photoKey(photos));
    toast.success("Room deleted");
    router.push(`${ADMIN}/rooms`);
  };

  const primaryLabel = unit && !type?.draft ? "Save changes" : v.active ? "Save & publish" : "Save room";
  const busy = saving !== null;
  const spinner = (...i: Intent[]) => saving !== null && i.includes(saving) && <Loader2 className="size-4 animate-spin" aria-hidden />;

  return (
    <FormProvider {...methods}>
      <form onSubmit={(e) => e.preventDefault()} noValidate aria-busy={busy} className="[&_:is(input,select,textarea,button)]:scroll-mb-24">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href={unit ? `${ADMIN}/rooms/${unit.id}` : `${ADMIN}/rooms`}
              aria-label={unit ? "Back to room" : "Back to rooms"}
              className={cn("flex size-10 shrink-0 items-center justify-center rounded-md border border-neutral-300 bg-white text-neutral-700 transition hover:border-sky-400 hover:text-sky-700", focusRing)}
            >
              <ArrowLeft className="size-4" />
            </Link>
            <div className="min-w-0">
              <h1 className="flex flex-wrap items-center gap-2 text-xl font-bold text-neutral-900">
                {unit ? `Edit room ${unit.number}` : "Add a room"}
                {type?.draft && <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-900 ring-1 ring-inset ring-amber-300">Draft</span>}
              </h1>
              <p className="text-sm text-neutral-600">
                {unit ? `${floorLabel(unit.floor)} · ${type?.name || "No name yet"}` : "Fill in what you have — you can save a draft and finish later."}
              </p>
            </div>
          </div>
          {unit && (
            <button type="button" onClick={remove} disabled={busy} className={hbtn.danger}>
              <Trash2 className="size-4" /> Delete room
            </button>
          )}
        </div>

        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_380px]">
          <div className="min-w-0 space-y-5">
            <Section id="room" title="Room details">
              {siblings.length > 0 && (
                <label className="mb-4 flex items-start gap-2.5 rounded-md bg-sky-50 px-3 py-2.5 text-sm text-sky-950">
                  <input type="checkbox" {...register("shareDetails")} className="mt-0.5 size-4 accent-sky-600" />
                  <span>
                    Apply changes to rooms {siblings.map((u) => u.number).join(", ")} too
                    <span className="block text-xs text-sky-900">
                      {v.shareDetails ? "They currently have the same details as this room." : `Only room ${unit?.number} changes; it gets its own details from now on.`}
                    </span>
                  </span>
                </label>
              )}

              <div className="grid grid-cols-2 items-start gap-4">
                <Field id="number" label="Room number" required error={err("number") ?? dupe}>
                  <input {...register("number")} {...described("number", err("number") ?? dupe)} autoComplete="off" inputMode="text" placeholder="e.g. 109" className={ctl(!!(err("number") ?? dupe))} />
                </Field>
                <Field
                  id="floor"
                  label="Floor"
                  required
                  error={err("floor")}
                  hint={!unit && !floorTouched && suggestedFloor !== undefined ? `Suggested from room ${v.number.trim()} — you can change it` : undefined}
                >
                  <input
                    {...register("floor", { onChange: () => setFloorTouched(true) })}
                    {...described("floor", err("floor"), !unit && !floorTouched && suggestedFloor !== undefined)}
                    inputMode="numeric"
                    placeholder="e.g. 1"
                    className={ctl(!!err("floor"))}
                  />
                </Field>
              </div>

              <Field id="name" label="Room name" required error={err("name")} hint="What guests see on the website." className="mt-4">
                <input {...register("name")} {...described("name", err("name"), true)} autoComplete="off" maxLength={60} placeholder="e.g. Deluxe Sea View" className={ctl(!!err("name"))} />
              </Field>

              <Field id="description" label="Short description" className="mt-4">
                <textarea
                  {...register("description")}
                  {...described("description")}
                  rows={3}
                  maxLength={300}
                  placeholder="e.g. Bright room on the first floor with a private balcony facing the sea."
                  className={cn(textareaClass, "border-neutral-300 text-neutral-900")}
                />
              </Field>

              <fieldset className="mt-4" aria-describedby={err("beds") ? "beds-error" : undefined}>
                <legend className="mb-1.5 flex items-baseline gap-1 text-sm font-medium text-neutral-800">
                  Beds
                  <span className="text-rose-600" aria-hidden>
                    *
                  </span>
                </legend>
                <ul className="space-y-2">
                  {beds.fields.map((f, i) => {
                    const qty = Number(v.beds[i]?.qty) || 1;
                    const current = v.beds[i]?.type ?? "";
                    const options = current && !BED_TYPES.includes(current) ? [...BED_TYPES, current] : BED_TYPES;
                    return (
                      <li key={f.id} className="flex items-center gap-2">
                        <select
                          {...register(`beds.${i}.type`)}
                          aria-label={`Bed ${i + 1} type`}
                          aria-invalid={err("beds") && !current ? true : undefined}
                          className={cn(ctl(!!err("beds") && !current), "min-w-0 flex-1 pr-8")}
                        >
                          <option value="">Choose bed type</option>
                          {options.map((o) => (
                            <option key={o} value={o}>
                              {o}
                            </option>
                          ))}
                        </select>
                        <div className="flex h-10 shrink-0 items-center rounded-md border border-neutral-300 bg-white" role="group" aria-label={`Bed ${i + 1} quantity`}>
                          <button
                            type="button"
                            onClick={() => setValue(`beds.${i}.qty`, Math.max(1, qty - 1), { shouldDirty: true })}
                            disabled={qty <= 1}
                            aria-label="Fewer"
                            className={cn("flex size-9 items-center justify-center rounded-l-md text-neutral-700 hover:bg-neutral-100 disabled:opacity-30", focusRing)}
                          >
                            <Minus className="size-4" />
                          </button>
                          <span className="w-7 text-center text-sm font-semibold tabular-nums text-neutral-900" aria-live="polite">
                            {qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => setValue(`beds.${i}.qty`, Math.min(9, qty + 1), { shouldDirty: true })}
                            disabled={qty >= 9}
                            aria-label="More"
                            className={cn("flex size-9 items-center justify-center rounded-r-md text-neutral-700 hover:bg-neutral-100 disabled:opacity-30", focusRing)}
                          >
                            <Plus className="size-4" />
                          </button>
                        </div>
                        {beds.fields.length > 1 && (
                          <button type="button" onClick={() => beds.remove(i)} aria-label={`Remove bed ${i + 1}`} className={cn(hbtn.iconDanger, "size-10", focusRing)}>
                            <Trash2 className="size-4" />
                          </button>
                        )}
                      </li>
                    );
                  })}
                </ul>
                {beds.fields.length < 4 && (
                  <button type="button" onClick={() => beds.append({ type: "", qty: 1 })} className={cn("mt-2 inline-flex items-center gap-1.5 rounded text-sm font-medium text-sky-700 hover:text-sky-800", focusRing)}>
                    <Plus className="size-4" /> Add another bed
                  </button>
                )}
                <FieldError id="beds-error" message={err("beds")} />
              </fieldset>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Field id="sizeValue" label="Room size" error={err("sizeValue")}>
                  <div className="flex">
                    <input
                      {...register("sizeValue")}
                      {...described("sizeValue", err("sizeValue"))}
                      inputMode="decimal"
                      placeholder="e.g. 350"
                      className={cn(ctl(!!err("sizeValue")), "rounded-r-none")}
                    />
                    <select {...register("sizeUnit")} aria-label="Size unit" className={cn(ctl(), "w-24 shrink-0 rounded-l-none border-l-0")}>
                      {SIZE_UNITS.map((u) => (
                        <option key={u} value={u}>
                          {u}
                        </option>
                      ))}
                    </select>
                  </div>
                </Field>
                <Field id="capacity" label="Maximum occupancy" required error={err("capacity")}>
                  <div className="relative">
                    <input
                      {...register("capacity")}
                      {...described("capacity", err("capacity"))}
                      inputMode="numeric"
                      placeholder="e.g. 2"
                      className={cn(ctl(!!err("capacity")), "pr-16")}
                    />
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-neutral-500">guests</span>
                  </div>
                </Field>
              </div>

              <Disclosure title="Additional details" summary={v.highlight.trim() ? `Badge: ${v.highlight.trim()}` : "Website badge"} className="mt-5">
                <Field id="highlight" label="Website badge" className="sm:max-w-sm">
                  <input {...register("highlight")} {...described("highlight")} maxLength={24} placeholder="e.g. Best value" className={ctl()} />
                </Field>
              </Disclosure>
            </Section>

            <Section id="photos" title="Photos" sub="The main photo is shown first on the website.">
              <PhotoManager photos={photos} setPhotos={setPhotos} error={photoError} />
            </Section>

            <Section id="facilities" title="Facilities" sub="Tap what this room has. Search or add anything else.">
              <FacilityPicker value={v.amenities} onChange={(a) => setValue("amenities", a, { shouldDirty: true })} />
            </Section>

            <Section id="visibility" title="Website & operational status">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-md border border-neutral-200 p-3.5">
                  <label className="flex cursor-pointer items-start justify-between gap-3">
                    <span>
                      <span className="block text-sm font-medium text-neutral-900">Show on website</span>
                      <span className="mt-0.5 block text-xs text-neutral-600">{v.active ? "Guests can see and book it online." : "Hidden from guests. Staff can still book it at the desk."}</span>
                    </span>
                    <input type="checkbox" role="switch" {...register("active")} className="peer sr-only" />
                    <span
                      aria-hidden
                      className="relative mt-0.5 h-6 w-11 shrink-0 rounded-full bg-neutral-300 transition peer-checked:bg-sky-600 peer-focus-visible:ring-2 peer-focus-visible:ring-sky-500 peer-focus-visible:ring-offset-2 after:absolute after:left-0.5 after:top-0.5 after:size-5 after:rounded-full after:bg-white after:shadow after:transition peer-checked:after:translate-x-5"
                    />
                  </label>
                </div>

                <fieldset className="rounded-md border border-neutral-200 p-3.5" aria-describedby={err("outOfService") ? "outOfService-error" : undefined}>
                  <legend className="sr-only">Room operational status</legend>
                  <p className="text-sm font-medium text-neutral-900">Room operational status</p>
                  <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2">
                    {[
                      { value: false, label: "In service" },
                      { value: true, label: "Out of service" },
                    ].map((o) => (
                      <label key={o.label} className="flex cursor-pointer items-center gap-2 text-sm text-neutral-800">
                        <input
                          type="radio"
                          name="operationalStatus"
                          checked={v.outOfService === o.value}
                          onChange={() => setValue("outOfService", o.value, { shouldDirty: true })}
                          className="size-4 accent-sky-600"
                        />
                        {o.label}
                      </label>
                    ))}
                  </div>
                  <p className="mt-1.5 text-xs text-neutral-600">{v.outOfService ? "Can’t be booked by anyone, online or at the desk — use for repairs or renovation." : "Ready for guests. Whether it’s free on a given date is checked when you make a booking."}</p>
                  {v.outOfService && (
                    <input {...register("oosReason")} aria-label="Reason (optional)" maxLength={80} placeholder="Reason (optional), e.g. AC repair" className={cn(ctl(), "mt-2")} />
                  )}
                  <FieldError id="outOfService-error" message={err("outOfService")} />
                </fieldset>
              </div>
            </Section>
          </div>

          {/* Clears the 64px admin header; scrolls on its own when taller than the space above the footer. */}
          <aside className="min-w-0 space-y-5 lg:sticky lg:top-20 lg:-m-1 lg:max-h-[calc(100dvh-10rem)] lg:overflow-y-auto lg:overscroll-contain lg:p-1" aria-label="Pricing and preview">
            <Section id="pricing" title="Pricing">
              <Field id="price" label="Nightly rate" required error={err("price")}>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-neutral-700">৳</span>
                  <input
                    {...register("price")}
                    {...described("price", err("price"))}
                    inputMode="decimal"
                    autoComplete="off"
                    placeholder="2,400"
                    className={cn(ctl(!!err("price")), "pl-7 text-base font-semibold tabular-nums")}
                  />
                </div>
              </Field>
              <p className="mt-2 rounded-md bg-neutral-50 px-3 py-2 text-xs leading-relaxed text-neutral-700">
                Taxes not included. {serviceFeeRate}% service charge and {vatRate}% VAT are added at checkout
                {price > 0 && (
                  <>
                    {" "}
                    — guests pay <b className="font-semibold text-neutral-900">{taka(guestNightly(price, db.settings))}</b> per night
                  </>
                )}
                .
              </p>

              {v.showCompare ? (
                <Field id="originalPrice" label="Comparison price" error={err("originalPrice")} hint="A real regular price you’ve charged before. Shown crossed out." className="mt-4">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-neutral-700">৳</span>
                      <input
                        {...register("originalPrice")}
                        {...described("originalPrice", err("originalPrice"), true)}
                        inputMode="decimal"
                        placeholder="3,000"
                        className={cn(ctl(!!err("originalPrice")), "pl-7 tabular-nums")}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setValue("showCompare", false, { shouldDirty: true });
                        setValue("originalPrice", "", { shouldDirty: true });
                      }}
                      aria-label="Remove comparison price"
                      className={cn(hbtn.icon, "size-10", focusRing)}
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                </Field>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setValue("showCompare", true, { shouldDirty: true });
                    setTimeout(() => setFocus("originalPrice"), 0);
                  }}
                  className={cn("mt-3 inline-flex items-center gap-1.5 rounded text-sm font-medium text-sky-700 hover:text-sky-800", focusRing)}
                >
                  <Plus className="size-4" /> Add comparison price
                </button>
              )}
            </Section>

            <Card className="p-4 sm:p-5">
              <h2 className="mb-3 text-base font-semibold text-neutral-900">Website preview</h2>
              <RoomPreview v={v} photos={photos} status={status} />
              <div className="mt-4" aria-live="polite">
                {missing.length ? (
                  <>
                    <p className="text-sm font-medium text-neutral-900">To publish, add:</p>
                    <ul className="mt-1.5 space-y-1">
                      {missing.map((m) => (
                        <li key={m.field}>
                          <button type="button" onClick={() => focusField(m.field)} className={cn("flex items-center gap-2 rounded text-sm text-neutral-700 hover:text-sky-700", focusRing)}>
                            <Circle className="size-3.5 text-neutral-400" aria-hidden />
                            {fieldNames[m.field]}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <p className="flex items-center gap-2 text-sm font-medium text-emerald-800">
                    <CheckCircle2 className="size-4" aria-hidden />
                    {v.active ? "Ready to publish" : "Ready to save — hidden from website"}
                  </p>
                )}
              </div>
            </Card>
          </aside>
        </div>

        {/* In normal flow, so it rests below the last field at the end of the page instead of covering it. */}
        <div className="sticky bottom-0 z-20 -mx-4 mt-6 border-t border-neutral-200 bg-white px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-4px_12px_-6px_rgb(0_0_0/0.08)] sm:-mx-6 sm:px-6 xl:-mx-8 xl:px-8">
          <div className="flex items-center justify-end gap-2">
            <Link href={unit ? `${ADMIN}/rooms/${unit.id}` : `${ADMIN}/rooms`} className={cn(hbtn.outline, "border-transparent px-3", !unit && "hidden sm:inline-flex", focusRing)}>
              Cancel
            </Link>
            {isDraft && (
              <button type="button" onClick={() => submit("draft")} disabled={busy} className={cn(hbtn.outline, "flex-1 border-neutral-300 px-3 sm:flex-none sm:px-4", focusRing)}>
                {spinner("draft", "draft+next")} Save draft
              </button>
            )}
            <div className="flex flex-1 sm:flex-none">
              <button type="button" onClick={() => submit("save")} disabled={busy} className={cn(hbtn.primary, "flex-1 whitespace-nowrap px-3 sm:px-4", !unit && "rounded-r-none", focusRing)}>
                {spinner("save", "save+next")} {saving === "save" || saving === "save+next" ? "Saving…" : primaryLabel}
              </button>
              {!unit && (
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger asChild>
                    <button type="button" disabled={busy} aria-label="More save options" className={cn(hbtn.primary, "rounded-l-none border-l border-sky-400 px-2.5", focusRing)}>
                      <ChevronDown className="size-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent side="top" align="end" className="w-[min(18rem,calc(100vw-2rem))] bg-white">
                    <DropdownMenuItem onSelect={() => submit("save+next")} className="flex-col items-start gap-0.5 py-2">
                      <span className="font-medium text-neutral-900">{v.active ? "Publish, then add another" : "Save (hidden), then add another"}</span>
                      <span className="text-xs text-neutral-600">{v.active ? "Goes live on the website, then opens a blank form." : "Staff can book it; not shown on the website."}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => submit("draft+next")} className="flex-col items-start gap-0.5 py-2">
                      <span className="font-medium text-neutral-900">Save draft, then add another</span>
                      <span className="text-xs text-neutral-600">Not on the website and can’t be booked yet.</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="sm:hidden" />
                    <DropdownMenuItem asChild className="sm:hidden">
                      <Link href={`${ADMIN}/rooms`}>Cancel</Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>
      </form>
    </FormProvider>
  );
}
