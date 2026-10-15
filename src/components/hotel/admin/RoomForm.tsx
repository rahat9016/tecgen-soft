"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { ArrowLeft, ArrowLeftRight, Info, Plus, Trash2, Wrench, X } from "lucide-react";
import { amenityIcons } from "@/src/components/hotel/HotelDetails/AmenitiesGrid";
import { roomDiscount } from "@/src/data/hotels";
import { housekeepingLabels, taka } from "@/src/lib/hotel-store/format";
import { deleteUnit, newRoomTypeId, newUnitId, saveRoomType, saveUnit, unitToday, useHotelDB } from "@/src/lib/hotel-store/store";
import type { HotelDB, Housekeeping, RoomTypeRecord, RoomUnit } from "@/src/lib/hotel-store/types";
import { cn } from "@/src/lib/utils";
import ImageInput from "./ImageInput";
import { ADMIN, Card, Empty, Field, hbtn, inputClass, Switch, textareaClass } from "./ui";

const suggestedAmenities = Object.keys(amenityIcons);
const NEW = "__new";
const blankDetails: RoomTypeRecord = {
  id: "",
  name: "",
  description: "",
  size: "",
  beds: "",
  capacity: 2,
  price: 0,
  originalPrice: 0,
  highlight: "",
  rating: 4.5,
  reviewsCount: 0,
  amenities: ["Free WiFi", "AC"],
  images: [],
  active: true,
};

const floorLabel = (f: number) => (f === 0 ? "Ground" : `Floor ${f}`);

/** The next unused number on a floor, e.g. 207 when 201–206 exist. */
function nextNumber(db: HotelDB, floor: number) {
  const nums = db.units.filter((u) => u.floor === floor).map((u) => Number(u.number)).filter(Number.isFinite);
  return String(nums.length ? Math.max(...nums) + 1 : (floor || 0) * 100 + 1);
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <Card>
      <h2 className="mb-4 flex items-center gap-2 font-semibold text-neutral-900">
        <span className="flex size-6 items-center justify-center rounded-md bg-sky-600 text-xs font-bold text-white">{n}</span>
        {title}
      </h2>
      {children}
    </Card>
  );
}

/** One form for a physical room and everything guests see about it. Rooms of the same kind share their details. */
export default function RoomForm({ id, kind }: { id?: string; kind?: string }) {
  const db = useHotelDB();
  const router = useRouter();
  const unit = id ? db.units.find((u) => u.id === id) : undefined;
  const floors = [...new Set(db.units.map((u) => u.floor))].sort((a, b) => a - b);

  const [form, setForm] = useState<RoomUnit>(() => {
    if (unit) return unit;
    const floor = floors[0] ?? 1;
    return { id: newUnitId(), number: nextNumber(db, floor), floor, typeId: "", housekeeping: "clean", outOfService: false };
  });
  const [newFloor, setNewFloor] = useState(false);
  const [details, setDetails] = useState<RoomTypeRecord>(() => db.roomTypes.find((t) => t.id === (unit?.typeId ?? kind ?? db.roomTypes[0]?.id)) ?? blankDetails);
  const [amenity, setAmenity] = useState("");

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

  const occupant = unit ? unitToday(db, unit.id).occupant : undefined;
  const sharedWith = details.id ? db.units.filter((u) => u.typeId === details.id && u.id !== form.id) : [];
  const set = <K extends keyof RoomTypeRecord>(k: K, v: RoomTypeRecord[K]) => setDetails((d) => ({ ...d, [k]: v }));
  // A new room follows the chosen floor's numbering; an existing room keeps its number.
  const pickFloor = (floor: number) => setForm((f) => ({ ...f, floor, number: unit ? f.number : nextNumber(db, floor) }));
  const addAmenity = (a: string) => {
    const v = a.trim();
    if (v && !details.amenities.includes(v)) set("amenities", [...details.amenities, v]);
    setAmenity("");
  };
  const moveImage = (i: number, dir: -1 | 1) => {
    const list = [...details.images];
    const j = i + dir;
    if (j < 0 || j >= list.length) return;
    [list[i], list[j]] = [list[j], list[i]];
    set("images", list);
  };

  const submit = () => {
    const number = form.number.trim();
    if (!number) return toast.error("Room number is required.");
    if (db.units.some((u) => u.number === number && u.id !== form.id)) return toast.error(`Room ${number} already exists.`);
    if (form.outOfService && !unit?.outOfService && occupant) return toast.error(`${occupant.guest.name} is staying in this room — move them first.`);
    const record = { ...details, id: details.id || newRoomTypeId(db, details.name), originalPrice: details.originalPrice || details.price };
    if (unit && unit.typeId !== record.id && db.bookings.some((b) => ["pending", "confirmed", "checked-in"].includes(b.status) && b.unitIds.includes(unit.id))) {
      return toast.error(`Room ${number} has upcoming bookings — move them before changing what kind of room it is.`);
    }
    const t = saveRoomType(record);
    if (!t.ok) return toast.error(t.error);
    const r = saveUnit({ ...form, number, typeId: record.id, oosReason: form.outOfService ? form.oosReason : undefined });
    if (!r.ok) return toast.error(r.error);
    toast.success(unit ? `Room ${number} saved — the website is updated` : `Room ${number} added to ${floorLabel(r.value.floor)}`);
    router.push(`${ADMIN}/room-types`);
  };

  return (
    <div>
      <Link href={`${ADMIN}/room-types`} className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-sky-700">
        <ArrowLeft className="size-4" /> Rooms
      </Link>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-neutral-900">{unit ? `Room ${unit.number}` : "Add a room"}</h1>
        <div className="flex gap-2">
          {unit && (
            <button
              onClick={() => {
                if (!confirm(`Delete room ${unit.number}? Past bookings keep their history.`)) return;
                const r = deleteUnit(unit.id);
                if (!r.ok) return toast.error(r.error);
                toast.success("Room deleted");
                router.push(`${ADMIN}/room-types`);
              }}
              className={hbtn.danger}
            >
              <Trash2 className="size-4" /> Delete
            </button>
          )}
          <button onClick={submit} className={hbtn.primary}>
            {unit ? "Save room" : `Add room ${form.number}`.trim()}
          </button>
        </div>
      </div>

      <div className="mt-6 grid items-start gap-6 xl:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <Step n={1} title="Where is the room?">
            <p className="mb-2 text-xs font-medium text-neutral-600">Floor</p>
            <div className="flex flex-wrap gap-2">
              {floors.map((f) => {
                const on = !newFloor && form.floor === f;
                return (
                  <button
                    key={f}
                    type="button"
                    onClick={() => {
                      setNewFloor(false);
                      pickFloor(f);
                    }}
                    className={cn(
                      "rounded-md border px-3.5 py-2 text-sm font-medium transition",
                      on ? "border-sky-600 bg-sky-600 text-white" : "border-neutral-200 bg-white text-neutral-700 hover:border-sky-300"
                    )}
                  >
                    {floorLabel(f)}
                    <span className={cn("ml-1.5 text-xs", on ? "text-white/80" : "text-neutral-400")}>{db.units.filter((u) => u.floor === f).length}</span>
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => {
                  setNewFloor(true);
                  pickFloor((floors.at(-1) ?? 0) + 1);
                }}
                className={cn(
                  "flex items-center gap-1 rounded-md border border-dashed px-3.5 py-2 text-sm font-medium transition",
                  newFloor ? "border-sky-600 bg-sky-50 text-sky-700" : "border-neutral-300 text-neutral-500 hover:border-sky-300 hover:text-sky-700"
                )}
              >
                <Plus className="size-3.5" /> New floor
              </button>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-[10rem_1fr]">
              {newFloor ? (
                <div className="grid grid-cols-2 gap-3 sm:col-span-2 sm:max-w-80">
                  <Field label="Floor number">
                    <input type="number" min={0} value={form.floor} onChange={(e) => pickFloor(Number(e.target.value))} className={inputClass} />
                  </Field>
                  <Field label="Room number">
                    <input value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} className={inputClass} placeholder="e.g. 601" />
                  </Field>
                </div>
              ) : (
                <Field label="Room number">
                  <input value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} className={inputClass} placeholder="e.g. 208" />
                </Field>
              )}
              <div className={cn(newFloor && "sm:col-span-2")}>
                <p className="mb-1 text-xs font-medium text-neutral-600">Condition</p>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.keys(housekeepingLabels) as Housekeeping[]).map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => setForm({ ...form, housekeeping: h })}
                      className={cn(
                        "h-10 rounded-md border px-2 text-sm font-medium transition",
                        form.housekeeping === h ? "border-sky-600 bg-sky-50 text-sky-800" : "border-neutral-200 text-neutral-600 hover:border-sky-300"
                      )}
                    >
                      {housekeepingLabels[h]}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-md border border-neutral-200 p-3">
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-sm font-medium text-neutral-800">
                  <Wrench className="size-4 text-neutral-500" /> Out of service
                </span>
                <Switch checked={form.outOfService} onChange={() => setForm({ ...form, outOfService: !form.outOfService })} label="Out of service" />
              </div>
              {form.outOfService && (
                <input
                  value={form.oosReason ?? ""}
                  onChange={(e) => setForm({ ...form, oosReason: e.target.value })}
                  className={cn(inputClass, "mt-3")}
                  placeholder="Reason, e.g. Bathroom renovation"
                />
              )}
            </div>
            <Field label="Staff note (optional)" className="mt-4">
              <input value={form.note ?? ""} onChange={(e) => setForm({ ...form, note: e.target.value })} className={inputClass} placeholder="e.g. Connecting door to 209" />
            </Field>
          </Step>

          <Step n={2} title="What guests see">
            <Field label="Same as another room?" hint="Pick one to copy its name, photos and price — or start fresh.">
              <select
                value={details.id || NEW}
                onChange={(e) => setDetails(e.target.value === NEW ? blankDetails : (db.roomTypes.find((t) => t.id === e.target.value) ?? blankDetails))}
                className={inputClass}
              >
                {db.roomTypes.map((t) => (
                  <option key={t.id} value={t.id}>
                    Same as {t.name} ({db.units.filter((u) => u.typeId === t.id).map((u) => u.number).join(", ") || "no rooms yet"})
                  </option>
                ))}
                <option value={NEW}>New — fill in the details below</option>
              </select>
            </Field>
            {sharedWith.length > 0 && (
              <p className="mt-3 flex items-start gap-2 rounded-md bg-sky-50 px-3 py-2 text-xs text-sky-800">
                <Info className="mt-px size-3.5 shrink-0" />
                Shared with room{sharedWith.length > 1 ? "s" : ""} {sharedWith.map((u) => u.number).join(", ")}. Changes below update {sharedWith.length > 1 ? "them all" : "both"} and the website listing.
              </p>
            )}

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Name on website">
                <input value={details.name} onChange={(e) => set("name", e.target.value)} className={inputClass} placeholder="e.g. Deluxe Sea View Room" />
              </Field>
              <Field label="Card label" hint="Short badge on the room card">
                <input value={details.highlight} onChange={(e) => set("highlight", e.target.value)} className={inputClass} placeholder="e.g. Most popular" />
              </Field>
              <Field label="Description" className="sm:col-span-2">
                <textarea value={details.description} onChange={(e) => set("description", e.target.value)} rows={3} className={textareaClass} />
              </Field>
              <Field label="Beds">
                <input value={details.beds} onChange={(e) => set("beds", e.target.value)} className={inputClass} placeholder="e.g. 1 King Bed" />
              </Field>
              <Field label="Size">
                <input value={details.size} onChange={(e) => set("size", e.target.value)} className={inputClass} placeholder="e.g. 350 sq ft" />
              </Field>
              <Field label="Sleeps (guests)">
                <input type="number" min={1} value={details.capacity} onChange={(e) => set("capacity", Number(e.target.value))} className={inputClass} />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Rating">
                  <input type="number" min={1} max={5} step={0.1} value={details.rating} onChange={(e) => set("rating", Number(e.target.value))} className={inputClass} />
                </Field>
                <Field label="Reviews">
                  <input type="number" min={0} value={details.reviewsCount} onChange={(e) => set("reviewsCount", Number(e.target.value))} className={inputClass} />
                </Field>
              </div>
            </div>
          </Step>

          <Step n={3} title="Photos">
            <p className="-mt-2 mb-4 text-xs text-neutral-500">The first photo is the cover. Uploads are resized to keep the demo fast.</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {details.images.map((src, i) => (
                <div key={`${i}-${src.slice(-24)}`} className="group relative aspect-[4/3] overflow-hidden rounded-md bg-neutral-100">
                  {/* eslint-disable-next-line @next/next/no-img-element -- admin preview */}
                  <img src={src} alt="" className="size-full object-cover" />
                  {i === 0 && <span className="absolute left-2 top-2 rounded-md bg-sky-600 px-2 py-0.5 text-[10px] font-semibold text-white">Cover</span>}
                  <div className="absolute inset-x-0 bottom-0 flex justify-between bg-gradient-to-t from-black/60 p-1.5 opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100">
                    <button onClick={() => moveImage(i, -1)} disabled={i === 0} aria-label="Move earlier" className="rounded-md bg-white/90 p-1 text-neutral-700 disabled:opacity-40">
                      <ArrowLeftRight className="size-3.5" />
                    </button>
                    <button onClick={() => set("images", details.images.filter((_, j) => j !== i))} aria-label="Remove photo" className="rounded-md bg-white/90 p-1 text-rose-600">
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <ImageInput onAdd={(src) => setDetails((d) => ({ ...d, images: [...d.images, src] }))} />
            </div>
          </Step>

          <Step n={4} title="In the room">
            <div className="flex flex-wrap gap-2">
              {details.amenities.map((a) => (
                <span key={a} className="flex items-center gap-1 rounded-md bg-sky-50 px-3 py-1 text-xs font-medium text-sky-800">
                  {a}
                  <button onClick={() => set("amenities", details.amenities.filter((x) => x !== a))} aria-label={`Remove ${a}`}>
                    <X className="size-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              <input
                value={amenity}
                onChange={(e) => setAmenity(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addAmenity(amenity);
                  }
                }}
                placeholder="Add an amenity"
                className={inputClass}
              />
              <button onClick={() => addAmenity(amenity)} className={hbtn.outline} aria-label="Add amenity">
                <Plus className="size-4" />
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {suggestedAmenities
                .filter((a) => !details.amenities.includes(a))
                .slice(0, 16)
                .map((a) => (
                  <button key={a} onClick={() => addAmenity(a)} className="rounded-md border border-dashed border-neutral-300 px-2.5 py-0.5 text-xs text-neutral-500 hover:border-sky-400 hover:text-sky-700">
                    + {a}
                  </button>
                ))}
            </div>
          </Step>
        </div>

        <div className="space-y-6 xl:sticky xl:top-24">
          <Card>
            <h2 className="font-semibold text-neutral-900">Price</h2>
            <div className="mt-4 space-y-3">
              <Field label="Price per night (BDT)">
                <input type="number" min={0} value={details.price || ""} onChange={(e) => set("price", Number(e.target.value))} className={inputClass} />
              </Field>
              <Field label="Was price (BDT)" hint="Shown struck through; leave equal for no discount">
                <input type="number" min={0} value={details.originalPrice || ""} onChange={(e) => set("originalPrice", Number(e.target.value))} className={inputClass} />
              </Field>
              {roomDiscount(details) > 0 && (
                <p className="rounded-md bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-600">
                  Website shows −{roomDiscount(details)}% · saves {taka(details.originalPrice - details.price)}
                </p>
              )}
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="font-semibold text-neutral-900">Show on website</h2>
                <p className="text-xs text-neutral-500">Hidden rooms can still be booked by staff.</p>
              </div>
              <Switch checked={details.active} onChange={() => set("active", !details.active)} label="Show on website" />
            </div>
          </Card>
          {details.images[0] && (
            <Card className="overflow-hidden p-0">
              {/* eslint-disable-next-line @next/next/no-img-element -- preview */}
              <img src={details.images[0]} alt="" className="aspect-[4/3] w-full object-cover" />
              <div className="p-4">
                <p className="font-bold text-neutral-900">{details.name || "Room name"}</p>
                <p className="mt-1 line-clamp-2 text-sm text-neutral-600">{details.description || "Description"}</p>
                <p className="mt-3 text-lg font-semibold">
                  {taka(details.price)} <span className="text-xs font-normal text-neutral-500">/night</span>
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
