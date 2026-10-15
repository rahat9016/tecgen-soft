"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { FormProvider, useController, useForm, type Resolver } from "react-hook-form";
import type { StylesConfig } from "react-select";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { ArrowLeft, BadgeDollarSign, ChevronLeft, ChevronRight, GripVertical, ImagePlus, DoorOpen, Images, Link2, ListChecks, Loader2, Plus, Sparkles, Star, Trash2, X } from "lucide-react";
import ControlledInputField from "@/src/components/shared/FromController/ControlledInputField";
import ControlledMultiSelectField from "@/src/components/shared/FromController/ControlledMultiSelectField";
import ControlledSelectField from "@/src/components/shared/FromController/ControlledSelectField";
import ControlledSwitchField from "@/src/components/shared/FromController/ControlledSwitchField";
import ControlledTextareaField from "@/src/components/shared/FromController/ControlledTextareaField";
import { amenityIcons } from "@/src/components/hotel/HotelDetails/AmenitiesGrid";
import { deleteUnit, newRoomTypeId, roomRating, newUnitId, saveRoomType, saveUnit, useHotelDB } from "@/src/lib/hotel-store/store";
import type { HotelDB, RoomTypeRecord } from "@/src/lib/hotel-store/types";
import { cn } from "@/src/lib/utils";
import { compressImage } from "./ImageInput";
import { ADMIN, Card, Empty, hbtn, inputClass, labelClass, textareaClass } from "./ui";

const NEW = "__new";
// "AC" and "AC Rooms" etc. are older duplicates kept for existing data; offer one of each.
const amenityOptions = Object.keys(amenityIcons)
  .filter((a) => !["AC Rooms", "Free Breakfast"].includes(a))
  .sort((x, y) => x.localeCompare(y))
  .map((a) => ({ label: a, value: a }));
const floorLabel = (f: number) => (f === 0 ? "Ground" : `Floor ${f}`);

/** The next unused number on a floor, e.g. 207 when 201–206 exist. */
function nextNumber(db: HotelDB, floor: number) {
  const nums = db.units.filter((u) => u.floor === floor).map((u) => Number(u.number)).filter(Number.isFinite);
  return String(nums.length ? Math.max(...nums) + 1 : (floor || 0) * 100 + 1);
}

const num = (label: string) =>
  yup
    .number()
    .transform((v, raw) => (raw === "" || raw === null ? undefined : v))
    .typeError(`${label} must be a number`);

const schema = yup.object({
  floor: num("Floor").required().min(0, "Floor can't be negative"),
  number: yup.string().trim().required("Enter a room number"),
  copyFrom: yup.string().default(NEW),
  name: yup.string().trim().required("Enter a room name"),
  highlight: yup.string().default(""),
  description: yup.string().default(""),
  beds: yup.string().default(""),
  size: yup.string().default(""),
  capacity: num("Max guests").required("Enter how many guests can stay").min(1, "At least 1 guest"),
  price: num("Price").required("Enter the price per night").min(1, "Enter the price per night"),
  originalPrice: num("Regular price")
    .min(0)
    .default(0)
    .test("gte", "Regular price should be higher than the price per night", function (v) {
      return !v || v >= this.parent.price;
    }),
  amenities: yup.array(yup.string().required()).default([]),
  images: yup.array(yup.mixed<File | string>().required()).default([]),
  active: yup.boolean().default(true),
});
type FormValues = yup.InferType<typeof schema>;

const listingFields = (t?: RoomTypeRecord) => ({
  copyFrom: t?.id ?? NEW,
  name: t?.name ?? "",
  highlight: t?.highlight ?? "",
  description: t?.description ?? "",
  beds: t?.beds ?? "",
  size: t?.size ?? "",
  capacity: t?.capacity ?? 2,
  price: t?.price ?? 0,
  originalPrice: t?.originalPrice ?? 0,
  amenities: t?.amenities ?? ["Free WiFi", "AC"],
  images: t?.images ?? [],
  active: t?.active ?? true,
});

/** Room 208 is on floor 2; anything that isn't a 3+ digit number gives no hint. */
const floorFromNumber = (number: string) => {
  const n = Number(number);
  return Number.isInteger(n) && n >= 100 ? Math.floor(n / 100) : undefined;
};

type Opt = { label: string; value: string };
const selectStyles: StylesConfig<Opt, true> = {
  control: (base, s) => ({
    ...base,
    minHeight: 40,
    borderRadius: 6,
    fontSize: 14,
    borderColor: s.isFocused ? "#0ea5e9" : "#e5e5e5",
    boxShadow: s.isFocused ? "0 0 0 2px #e0f2fe" : "none",
    "&:hover": { borderColor: s.isFocused ? "#0ea5e9" : "#d4d4d4" },
  }),
  placeholder: (base) => ({ ...base, color: "#a3a3a3" }),
  multiValue: (base) => ({ ...base, backgroundColor: "#f0f9ff", borderRadius: 6 }),
  multiValueLabel: (base) => ({ ...base, color: "#075985", fontWeight: 500, fontSize: 12, padding: "3px 6px" }),
  multiValueRemove: (base) => ({ ...base, color: "#0369a1", borderRadius: 6, "&:hover": { backgroundColor: "#e0f2fe", color: "#0c4a6e" } }),
  menu: (base) => ({ ...base, zIndex: 30, fontSize: 14 }),
};

function Section({ icon: Icon, title, sub, children, className }: { icon: React.ComponentType<{ className?: string }>; title: string; sub?: string; children: React.ReactNode; className?: string }) {
  return (
    <Card className={cn("p-0", className)}>
      <div className="flex items-center gap-3 border-b border-neutral-100 px-5 py-4">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-sky-50 text-sky-600">
          <Icon className="size-4.5" />
        </span>
        <div>
          <h2 className="font-semibold text-neutral-900">{title}</h2>
          {sub && <p className="text-xs text-neutral-500">{sub}</p>}
        </div>
      </div>
      <div className="p-5">{children}</div>
    </Card>
  );
}

function Label({ text, hint, className, children }: { text: string; hint?: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={className}>
      <span className={labelClass}>{text}</span>
      {children}
      {hint && <span className="mt-1 block text-[11px] text-neutral-400">{hint}</span>}
    </div>
  );
}

const MAX_PHOTOS = 12;
type Photo = File | string;

/** The room's photos: upload, drag or use the arrows to reorder, and make any photo the main one. */
function PhotoManager({ name }: { name: "images" }) {
  const { field, fieldState } = useController<{ images: Photo[] }, "images">({ name });
  const photos: Photo[] = useMemo(() => field.value ?? [], [field.value]);
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragFrom, setDragFrom] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);

  const srcs = useMemo(() => photos.map((p) => (p instanceof File ? URL.createObjectURL(p) : p)), [photos]);
  useEffect(() => () => srcs.forEach((s) => s.startsWith("blob:") && URL.revokeObjectURL(s)), [srcs]);

  const move = (from: number, to: number) => {
    if (from === to || to < 0 || to >= photos.length) return;
    const list = [...photos];
    const [item] = list.splice(from, 1);
    list.splice(to, 0, item);
    field.onChange(list);
  };
  const remove = (i: number) => field.onChange(photos.filter((_, j) => j !== i));
  const full = photos.length >= MAX_PHOTOS;

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {srcs.map((src, i) => (
          <div
            key={`${i}-${src}`}
            draggable
            onDragStart={() => setDragFrom(i)}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(i);
            }}
            onDragLeave={() => setDragOver((o) => (o === i ? null : o))}
            onDrop={(e) => {
              e.preventDefault();
              if (dragFrom !== null) move(dragFrom, i);
              setDragFrom(null);
              setDragOver(null);
            }}
            onDragEnd={() => {
              setDragFrom(null);
              setDragOver(null);
            }}
            className={cn(
              "group relative aspect-4/3 cursor-grab overflow-hidden rounded-md bg-neutral-100 ring-2 ring-transparent transition active:cursor-grabbing",
              i === 0 && "ring-sky-500",
              dragOver === i && dragFrom !== i && "ring-sky-300 ring-offset-2",
              dragFrom === i && "opacity-40"
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- admin preview */}
            <img src={src} alt={`Photo ${i + 1}`} draggable={false} className="size-full object-cover" />
            <span className="absolute left-2 top-2 flex items-center gap-1 rounded-md bg-black/55 px-1.5 py-0.5 text-[11px] font-semibold text-white">
              <GripVertical className="size-3" /> {i + 1}
            </span>
            {i === 0 && <span className="absolute bottom-10 left-2 rounded-md bg-sky-600 px-2 py-0.5 text-[11px] font-semibold text-white">Main photo</span>}
            <button
              type="button"
              onClick={() => remove(i)}
              aria-label={`Remove photo ${i + 1}`}
              className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-md bg-white/90 text-rose-600 shadow-sm transition hover:bg-white"
            >
              <Trash2 className="size-3.5" />
            </button>
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-linear-to-t from-black/70 to-transparent p-2">
              <button
                type="button"
                onClick={() => move(i, i - 1)}
                disabled={i === 0}
                aria-label="Move left"
                className="flex size-7 items-center justify-center rounded-md bg-white/90 text-neutral-700 transition hover:bg-white disabled:opacity-30"
              >
                <ChevronLeft className="size-4" />
              </button>
              {i > 0 && (
                <button type="button" onClick={() => move(i, 0)} className="flex h-7 items-center gap-1 rounded-md bg-white/90 px-2 text-[11px] font-semibold text-sky-700 transition hover:bg-white">
                  <Star className="size-3" /> Make main
                </button>
              )}
              <button
                type="button"
                onClick={() => move(i, i + 1)}
                disabled={i === photos.length - 1}
                aria-label="Move right"
                className="flex size-7 items-center justify-center rounded-md bg-white/90 text-neutral-700 transition hover:bg-white disabled:opacity-30"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        ))}
        {!full && (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex aspect-4/3 flex-col items-center justify-center gap-1.5 rounded-md border-2 border-dashed border-neutral-200 text-sm font-medium text-neutral-500 transition hover:border-sky-300 hover:bg-sky-50/50 hover:text-sky-700"
          >
            <ImagePlus className="size-6" />
            Upload photos
            <span className="text-[11px] font-normal text-neutral-400">
              {photos.length}/{MAX_PHOTOS}
            </span>
          </button>
        )}
      </div>
      {photos.length > 1 && <p className="mt-2 text-xs text-neutral-400">Drag photos or use the arrows to change the order.</p>}
      {fieldState.error && <p className="mt-1 text-xs text-rose-500">{fieldState.error.message}</p>}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []).slice(0, MAX_PHOTOS - photos.length);
          e.target.value = "";
          if (files.length) field.onChange([...photos, ...files]);
        }}
      />
    </div>
  );
}

/** Paste a link to add it to the photo list. */
function PhotoLink({ onAdd }: { onAdd: (src: string) => void }) {
  const [url, setUrl] = useState("");
  const add = () => {
    const v = url.trim();
    if (!/^https?:\/\/\S+$/i.test(v)) return toast.error("Paste a full image link starting with https://");
    onAdd(v);
    setUrl("");
  };
  return (
    <div className="flex gap-2">
      <div className="relative flex-1">
        <Link2 className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder="Or paste a photo link (https://…)"
          className={cn(inputClass, "pl-9")}
        />
      </div>
      <button type="button" onClick={add} className={hbtn.outline}>
        <Plus className="size-4" /> Add
      </button>
    </div>
  );
}

/** One form for a physical room and everything guests see about it. Rooms of the same kind share their listing. */
export default function RoomForm({ id, kind }: { id?: string; kind?: string }) {
  const db = useHotelDB();
  const router = useRouter();
  const unit = id ? db.units.find((u) => u.id === id) : undefined;
  const floors = [...new Set(db.units.map((u) => u.floor))].sort((a, b) => a - b);
  const [saving, setSaving] = useState(false);

  const methods = useForm<FormValues>({
    resolver: yupResolver(schema) as Resolver<FormValues>,
    defaultValues: (() => {
      const floor = unit?.floor ?? floors[0] ?? 1;
      return {
        floor,
        number: unit?.number ?? nextNumber(db, floor),
        ...listingFields(db.roomTypes.find((t) => t.id === (unit?.typeId ?? kind))),
      };
    })(),
  });
  const { setValue, getValues, reset, handleSubmit, setError } = methods;
  const v = methods.watch();

  // A new room's floor follows its number (208 → floor 2) until staff set the floor themselves.
  useEffect(() => {
    const floor = floorFromNumber(v.number ?? "");
    if (!unit && floor !== undefined && !methods.getFieldState("floor").isDirty) setValue("floor", floor);
  }, [v.number, unit, methods, setValue]);

  // Picking "Same as …" loads that listing; picking "New" clears it.
  const lastCopy = useRef(v.copyFrom);
  useEffect(() => {
    if (v.copyFrom === lastCopy.current) return;
    lastCopy.current = v.copyFrom;
    reset({ ...getValues(), ...listingFields(db.roomTypes.find((t) => t.id === v.copyFrom)) });
  }, [v.copyFrom, db.roomTypes, getValues, reset]);


  if (id && !unit) {
    return (
      <Card>
        <Empty icon={X} title="Room not found">
          <Link href={`${ADMIN}/room-types`} className={hbtn.outline}>
            Back
          </Link>
        </Empty>
      </Card>
    );
  }


  const onSubmit = async (data: FormValues) => {
    if (db.units.some((u) => u.number === data.number && u.id !== unit?.id)) {
      return setError("number", { message: `Room ${data.number} already exists` });
    }
    const typeId = data.copyFrom !== NEW ? data.copyFrom : newRoomTypeId(db, data.name);
    if (unit && unit.typeId !== typeId && db.bookings.some((b) => ["pending", "confirmed", "checked-in"].includes(b.status) && b.unitIds.includes(unit.id))) {
      return toast.error(`Room ${data.number} has upcoming bookings — move them before changing its listing.`);
    }

    setSaving(true);
    try {
      const images = await Promise.all(data.images.map((img) => (img instanceof File ? compressImage(img) : img)));
      const t = saveRoomType({
        id: typeId,
        name: data.name,
        highlight: data.highlight,
        description: data.description,
        beds: data.beds,
        size: data.size,
        capacity: data.capacity,
        // Shown on the website from published guest reviews; kept here only for the record's shape.
        ...roomRating(db, typeId),
        price: data.price,
        originalPrice: data.originalPrice || data.price,
        amenities: data.amenities,
        images,
        active: data.active,
      });
      if (!t.ok) return toast.error(t.error);
      const r = saveUnit({
        id: unit?.id ?? newUnitId(),
        number: data.number,
        floor: data.floor,
        typeId,
        housekeeping: unit?.housekeeping ?? "clean",
        // Maintenance is managed from the Rooms board.
        outOfService: unit?.outOfService ?? false,
        oosReason: unit?.oosReason,
        note: unit?.note,
      });
      if (!r.ok) return toast.error(r.error);
      toast.success(unit ? `Room ${data.number} saved — the website is updated` : `Room ${data.number} added to ${floorLabel(r.value.floor)}`);
      router.push(`${ADMIN}/room-types/${r.value.id}`);
    } catch {
      toast.error("One of the photos couldn't be read.");
    } finally {
      setSaving(false);
    }
  };

  const remove = () => {
    if (!unit || !confirm(`Delete room ${unit.number}? Past bookings keep their history.`)) return;
    const r = deleteUnit(unit.id);
    if (!r.ok) return toast.error(r.error);
    toast.success("Room deleted");
    router.push(`${ADMIN}/room-types`);
  };

  const saveLabel = unit ? "Save room" : "Add room";

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Card className="flex flex-wrap items-center justify-between gap-4 p-5">
          <div className="flex items-center gap-4">
            <Link
              href={unit ? `${ADMIN}/room-types/${unit.id}` : `${ADMIN}/room-types`}
              aria-label={unit ? "Back to room" : "Back to rooms"}
              className="flex size-10 shrink-0 items-center justify-center rounded-md border border-neutral-200 text-neutral-500 transition hover:border-sky-300 hover:text-sky-700"
            >
              <ArrowLeft className="size-4" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-neutral-900">{unit ? `Room ${unit.number}` : "Add a room"}</h1>
              <p className="mt-0.5 text-sm text-neutral-500">{unit ? `${floorLabel(unit.floor)} · ${v.name || "No listing"}` : "Set where it is, what guests see, and the price."}</p>
            </div>
          </div>
          <div className="flex gap-2">
            {unit && (
              <button type="button" onClick={remove} className={hbtn.danger}>
                <Trash2 className="size-4" /> Delete
              </button>
            )}
            <button type="submit" disabled={saving} className={hbtn.primary}>
              {saving ? <Loader2 className="size-4 animate-spin" /> : !unit && <Plus className="size-4" />} {saveLabel}
            </button>
          </div>
        </Card>

        <div className="mt-6 grid items-start gap-6 xl:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <Section icon={DoorOpen} title="Room details" sub="The room number and where it is.">
              <div className="grid gap-4 sm:grid-cols-[1fr_1fr_2fr]">
                <Label text="Room number">
                  <ControlledInputField name="number" placeholder="e.g. 208" className={inputClass} />
                </Label>
                <Label text="Floor" hint={unit ? undefined : "Filled in from the room number"}>
                  <ControlledInputField name="floor" type="number" className={inputClass} />
                </Label>
                <Label text="Type of room" hint="Rooms of the same type share the name, photos and price.">
                  <ControlledSelectField
                    name="copyFrom"
                    className={inputClass}
                    options={[
                      ...db.roomTypes.map((t) => ({ label: t.name, value: t.id })),
                      { label: "+ New type of room", value: NEW },
                    ]}
                  />
                </Label>
              </div>
            </Section>

            <Section icon={Sparkles} title="Room info for guests" sub="This is what guests see on the website.">
              <div className="grid gap-4 sm:grid-cols-2">
                <Label text="Room name">
                  <ControlledInputField name="name" placeholder="e.g. Deluxe Sea View Room" className={inputClass} />
                </Label>
                <Label text="Tag (optional)" hint="Small label on the room photo">
                  <ControlledInputField name="highlight" placeholder="e.g. Best value" className={inputClass} />
                </Label>
                <Label text="About this room" className="sm:col-span-2">
                  <ControlledTextareaField name="description" placeholder="e.g. A cosy room facing the garden, great for couples." className={cn(textareaClass, "h-28")} />
                </Label>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                <Label text="Bed type" className="col-span-2">
                  <ControlledInputField name="beds" placeholder="e.g. 1 King Bed" className={inputClass} />
                </Label>
                <Label text="Room size">
                  <ControlledInputField name="size" placeholder="e.g. 350 sq ft" className={inputClass} />
                </Label>
                <Label text="Max guests">
                  <ControlledInputField name="capacity" type="number" className={inputClass} />
                </Label>
              </div>
            </Section>

            <Section icon={Images} title="Photos" sub="The first photo is the main one guests see.">
              <PhotoManager name="images" />
              <div className="mt-4 border-t border-dashed border-neutral-200 pt-4">
                <PhotoLink onAdd={(src) => setValue("images", [...(getValues("images") ?? []), src], { shouldDirty: true })} />
              </div>
            </Section>

            <Section icon={ListChecks} title="Facilities" sub="Type to search. Not in the list? Type it and press Enter to add it.">
              <ControlledMultiSelectField name="amenities" valueType="string" options={amenityOptions} styles={selectStyles} placeholder="Search facilities, e.g. WiFi, TV, Sea View…" />
            </Section>
          </div>

          <div className="space-y-6 xl:sticky xl:top-24">
            <Section icon={BadgeDollarSign} title="Price">
              <div className="space-y-4">
                <Label text="Price per night (৳)">
                  <ControlledInputField name="price" type="number" placeholder="0" className={inputClass} />
                </Label>
                <Label text="Regular price (৳, optional)" hint="Add a higher price to show a discount.">
                  <ControlledInputField name="originalPrice" type="number" placeholder="0" className={inputClass} />
                </Label>
              </div>
              <div className="-mx-5 mt-5 border-t border-neutral-100 px-5 pt-4">
                <ControlledSwitchField name="active" label="Show on website" description="Turn off to hide it from guests. Staff can still book it." />
              </div>
            </Section>
          </div>
        </div>
      </form>
    </FormProvider>
  );
}
