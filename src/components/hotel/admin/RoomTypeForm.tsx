"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { ArrowLeft, ArrowLeftRight, Plus, Trash2, X } from "lucide-react";
import { amenityIcons } from "@/src/components/hotel/HotelDetails/AmenitiesGrid";
import { roomDiscount } from "@/src/data/hotels";
import { taka } from "@/src/lib/hotel-store/format";
import { deleteRoomType, newRoomTypeId, saveRoomType, useHotelDB } from "@/src/lib/hotel-store/store";
import type { RoomTypeRecord } from "@/src/lib/hotel-store/types";
import { cn } from "@/src/lib/utils";
import ImageInput from "./ImageInput";
import { ADMIN, Card, Empty, Field, hbtn, inputClass, Switch, textareaClass } from "./ui";

const suggestedAmenities = Object.keys(amenityIcons);

export default function RoomTypeForm({ id }: { id?: string }) {
  const db = useHotelDB();
  const router = useRouter();
  const existing = id ? db.roomTypes.find((t) => t.id === id) : undefined;
  const [form, setForm] = useState<RoomTypeRecord>(
    existing ?? {
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
    }
  );
  const [amenity, setAmenity] = useState("");

  if (id && !existing) {
    return (
      <Card>
        <Empty icon={X} title="Room type not found">
          <Link href={`${ADMIN}/room-types`} className={hbtn.outline}>
            Back
          </Link>
        </Empty>
      </Card>
    );
  }

  const set = <K extends keyof RoomTypeRecord>(k: K, v: RoomTypeRecord[K]) => setForm((f) => ({ ...f, [k]: v }));
  const addAmenity = (a: string) => {
    const v = a.trim();
    if (v && !form.amenities.includes(v)) set("amenities", [...form.amenities, v]);
    setAmenity("");
  };
  const moveImage = (i: number, dir: -1 | 1) => {
    const list = [...form.images];
    const j = i + dir;
    if (j < 0 || j >= list.length) return;
    [list[i], list[j]] = [list[j], list[i]];
    set("images", list);
  };

  const submit = () => {
    const record = { ...form, id: form.id || newRoomTypeId(db, form.name), originalPrice: form.originalPrice || form.price };
    const r = saveRoomType(record);
    if (!r.ok) return toast.error(r.error);
    toast.success(existing ? "Room type saved — the website is updated" : `${record.name} created. Add its physical rooms next.`);
    router.push(`${ADMIN}/room-types`);
  };

  return (
    <div>
      <Link href={`${ADMIN}/room-types`} className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-sky-700">
        <ArrowLeft className="size-4" /> Room types
      </Link>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-neutral-900">{existing ? `Edit ${existing.name}` : "New room type"}</h1>
        <div className="flex gap-2">
          {existing && (
            <button
              onClick={() => {
                if (!confirm(`Delete ${existing.name}?`)) return;
                const r = deleteRoomType(existing.id);
                if (!r.ok) return toast.error(r.error);
                toast.success("Room type deleted");
                router.push(`${ADMIN}/room-types`);
              }}
              className={hbtn.danger}
            >
              <Trash2 className="size-4" /> Delete
            </button>
          )}
          <button onClick={submit} className={hbtn.primary}>
            {existing ? "Save changes" : "Create room type"}
          </button>
        </div>
      </div>

      <div className="mt-6 grid items-start gap-6 xl:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <Card>
            <h2 className="font-semibold text-neutral-900">Details</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Name">
                <input value={form.name} onChange={(e) => set("name", e.target.value)} className={inputClass} placeholder="e.g. Deluxe Sea View Room" />
              </Field>
              <Field label="Card label" hint="Short badge on the room card">
                <input value={form.highlight} onChange={(e) => set("highlight", e.target.value)} className={inputClass} placeholder="e.g. Most popular" />
              </Field>
              <Field label="Description" className="sm:col-span-2">
                <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={3} className={textareaClass} />
              </Field>
              <Field label="Beds">
                <input value={form.beds} onChange={(e) => set("beds", e.target.value)} className={inputClass} placeholder="e.g. 1 King Bed" />
              </Field>
              <Field label="Size">
                <input value={form.size} onChange={(e) => set("size", e.target.value)} className={inputClass} placeholder="e.g. 350 sq ft" />
              </Field>
              <Field label="Sleeps (guests per room)">
                <input type="number" min={1} value={form.capacity} onChange={(e) => set("capacity", Number(e.target.value))} className={inputClass} />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Rating">
                  <input type="number" min={1} max={5} step={0.1} value={form.rating} onChange={(e) => set("rating", Number(e.target.value))} className={inputClass} />
                </Field>
                <Field label="Reviews">
                  <input type="number" min={0} value={form.reviewsCount} onChange={(e) => set("reviewsCount", Number(e.target.value))} className={inputClass} />
                </Field>
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="font-semibold text-neutral-900">Photos</h2>
            <p className="text-xs text-neutral-500">The first photo is the cover. Uploads are resized to keep the demo fast.</p>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {form.images.map((src, i) => (
                <div key={`${i}-${src.slice(-24)}`} className="group relative aspect-[4/3] overflow-hidden rounded-md bg-neutral-100">
                  {/* eslint-disable-next-line @next/next/no-img-element -- admin preview */}
                  <img src={src} alt="" className="size-full object-cover" />
                  {i === 0 && <span className="absolute left-2 top-2 rounded-md bg-sky-600 px-2 py-0.5 text-[10px] font-semibold text-white">Cover</span>}
                  <div className="absolute inset-x-0 bottom-0 flex justify-between bg-gradient-to-t from-black/60 p-1.5 opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100">
                    <button onClick={() => moveImage(i, -1)} disabled={i === 0} aria-label="Move earlier" className="rounded-md bg-white/90 p-1 text-neutral-700 disabled:opacity-40">
                      <ArrowLeftRight className="size-3.5" />
                    </button>
                    <button onClick={() => set("images", form.images.filter((_, j) => j !== i))} aria-label="Remove photo" className="rounded-md bg-white/90 p-1 text-rose-600">
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <ImageInput onAdd={(src) => setForm((f) => ({ ...f, images: [...f.images, src] }))} />
            </div>
          </Card>

          <Card>
            <h2 className="font-semibold text-neutral-900">In the room</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {form.amenities.map((a) => (
                <span key={a} className="flex items-center gap-1 rounded-md bg-sky-50 px-3 py-1 text-xs font-medium text-sky-800">
                  {a}
                  <button onClick={() => set("amenities", form.amenities.filter((x) => x !== a))} aria-label={`Remove ${a}`}>
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
              <button onClick={() => addAmenity(amenity)} className={hbtn.outline}>
                <Plus className="size-4" />
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {suggestedAmenities
                .filter((a) => !form.amenities.includes(a))
                .slice(0, 16)
                .map((a) => (
                  <button key={a} onClick={() => addAmenity(a)} className="rounded-md border border-dashed border-neutral-300 px-2.5 py-0.5 text-xs text-neutral-500 hover:border-sky-400 hover:text-sky-700">
                    + {a}
                  </button>
                ))}
            </div>
          </Card>
        </div>

        <div className="space-y-6 xl:sticky xl:top-24">
          <Card>
            <h2 className="font-semibold text-neutral-900">Pricing</h2>
            <div className="mt-4 space-y-3">
              <Field label="Price per night (BDT)">
                <input type="number" min={0} value={form.price || ""} onChange={(e) => set("price", Number(e.target.value))} className={inputClass} />
              </Field>
              <Field label="Was price (BDT)" hint="Shown struck through; leave equal for no discount">
                <input type="number" min={0} value={form.originalPrice || ""} onChange={(e) => set("originalPrice", Number(e.target.value))} className={inputClass} />
              </Field>
              {roomDiscount(form) > 0 && (
                <p className="rounded-md bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-600">
                  Website shows −{roomDiscount(form)}% · saves {taka(form.originalPrice - form.price)}
                </p>
              )}
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="font-semibold text-neutral-900">Show on website</h2>
                <p className="text-xs text-neutral-500">Hidden types can still be booked by staff.</p>
              </div>
              <Switch checked={form.active} onChange={() => set("active", !form.active)} label="Show on website" />
            </div>
          </Card>
          {form.images[0] && (
            <Card className={cn("overflow-hidden p-0")}>
              {/* eslint-disable-next-line @next/next/no-img-element -- preview */}
              <img src={form.images[0]} alt="" className="aspect-[4/3] w-full object-cover" />
              <div className="p-4">
                <p className="font-bold text-neutral-900">{form.name || "Room name"}</p>
                <p className="mt-1 line-clamp-2 text-sm text-neutral-600">{form.description || "Description"}</p>
                <p className="mt-3 text-lg font-semibold">
                  {taka(form.price)} <span className="text-xs font-normal text-neutral-500">/night</span>
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
