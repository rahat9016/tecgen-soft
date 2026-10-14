"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import { BedDouble, Eye, EyeOff, Pencil, Plus, Trash2, Users, Wrench } from "lucide-react";
import { housekeepingLabels, shiftDay, taka, todayKey } from "@/src/lib/hotel-store/format";
import { deleteUnit, freeRooms, newUnitId, saveRoomType, saveUnit, unitToday, useHotelDB } from "@/src/lib/hotel-store/store";
import type { RoomUnit } from "@/src/lib/hotel-store/types";
import { cn } from "@/src/lib/utils";
import { ADMIN, AdminHeader, Card, Field, hbtn, inputClass, Modal } from "./ui";

function UnitModal({ unit, onClose }: { unit: RoomUnit | "new"; onClose: () => void }) {
  const db = useHotelDB();
  const existing = unit === "new" ? undefined : unit;
  const [form, setForm] = useState<RoomUnit>(
    existing ?? { id: newUnitId(), number: "", floor: 1, typeId: db.roomTypes[0]?.id ?? "", housekeeping: "clean", outOfService: false }
  );
  const submit = () => {
    const r = saveUnit({ ...form, floor: Number(form.floor) || Number(form.number[0]) || 0 });
    if (!r.ok) return toast.error(r.error);
    toast.success(existing ? `Room ${r.value.number} updated` : `Room ${r.value.number} added`);
    onClose();
  };
  return (
    <Modal open onClose={onClose} title={existing ? `Room ${existing.number}` : "Add a room"}>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Room number">
            <input value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} className={inputClass} placeholder="e.g. 208" autoFocus />
          </Field>
          <Field label="Floor">
            <input type="number" value={form.floor} onChange={(e) => setForm({ ...form, floor: Number(e.target.value) })} className={inputClass} />
          </Field>
        </div>
        <Field label="Room type">
          <select value={form.typeId} onChange={(e) => setForm({ ...form, typeId: e.target.value })} className={inputClass}>
            {db.roomTypes.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Note (optional)">
          <input value={form.note ?? ""} onChange={(e) => setForm({ ...form, note: e.target.value })} className={inputClass} placeholder="e.g. Connecting door to 209" />
        </Field>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.outOfService} onChange={(e) => setForm({ ...form, outOfService: e.target.checked })} className="size-4 accent-sky-600" />
          Out of service
        </label>
        {form.outOfService && <input value={form.oosReason ?? ""} onChange={(e) => setForm({ ...form, oosReason: e.target.value })} className={inputClass} placeholder="Reason, e.g. Bathroom renovation" />}
        <div className="flex justify-between gap-2 pt-1">
          {existing ? (
            <button
              onClick={() => {
                if (!confirm(`Delete room ${existing.number}? Past bookings keep their history.`)) return;
                const r = deleteUnit(existing.id);
                if (!r.ok) return toast.error(r.error);
                toast.success("Room deleted");
                onClose();
              }}
              className={hbtn.danger}
            >
              <Trash2 className="size-4" /> Delete
            </button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <button onClick={onClose} className={hbtn.outline}>
              Cancel
            </button>
            <button onClick={submit} className={hbtn.primary}>
              Save
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default function RoomTypes() {
  const db = useHotelDB();
  const today = todayKey();
  const [unitModal, setUnitModal] = useState<RoomUnit | "new" | null>(null);

  return (
    <div>
      <AdminHeader
        title="Room types & rooms"
        subtitle={`${db.roomTypes.length} room types · ${db.units.length} physical rooms`}
        actions={
          <>
            <button onClick={() => setUnitModal("new")} className={hbtn.outline}>
              <Plus className="size-4" /> Add room
            </button>
            <Link href={`${ADMIN}/room-types/new`} className={hbtn.primary}>
              <Plus className="size-4" /> New room type
            </Link>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
        {db.roomTypes.map((t) => {
          const units = db.units.filter((u) => u.typeId === t.id);
          const tonight = freeRooms(db, t.id, today, shiftDay(today, 1));
          return (
            <Card key={t.id} className={cn("flex flex-col p-0", !t.active && "opacity-70")}>
              <div className="relative aspect-[16/7] overflow-hidden rounded-t-md bg-neutral-100">
                {/* eslint-disable-next-line @next/next/no-img-element -- admin preview */}
                <img src={t.images[0]} alt="" className="size-full object-cover" />
                {!t.active && <span className="absolute left-3 top-3 rounded-md bg-neutral-900/80 px-2.5 py-1 text-xs font-semibold text-white">Hidden from website</span>}
                <span className="absolute right-3 top-3 rounded-md bg-white/90 px-2.5 py-1 text-xs font-semibold text-neutral-800">{t.images.length} photos</span>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate font-semibold text-neutral-900">{t.name}</h2>
                    <p className="text-xs text-neutral-500">
                      {t.beds} · {t.size} · <Users className="inline size-3" /> {t.capacity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold tabular-nums text-neutral-900">{taka(t.price)}</p>
                    {t.originalPrice > t.price && <p className="text-xs text-neutral-400 line-through">{taka(t.originalPrice)}</p>}
                  </div>
                </div>
                <p className="mt-3 text-xs text-neutral-500">
                  {units.length} room{units.length !== 1 ? "s" : ""} · {tonight} free tonight
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {units.map((u) => {
                    const occ = unitToday(db, u.id, today).occupant;
                    return (
                      <button
                        key={u.id}
                        onClick={() => setUnitModal(u)}
                        title={u.outOfService ? `Out of service — ${u.oosReason ?? ""}` : occ ? `Occupied by ${occ.guest.name}` : housekeepingLabels[u.housekeeping]}
                        className={cn(
                          "flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold ring-1 ring-inset transition hover:ring-sky-400",
                          u.outOfService ? "bg-neutral-100 text-neutral-500 ring-neutral-200" : occ ? "bg-emerald-50 text-emerald-800 ring-emerald-200" : "bg-white text-neutral-700 ring-neutral-200"
                        )}
                      >
                        {u.outOfService && <Wrench className="size-3" />}
                        {u.number}
                      </button>
                    );
                  })}
                  {units.length === 0 && <span className="text-xs text-amber-700">No rooms yet — guests can&rsquo;t book this type.</span>}
                </div>
                <div className="mt-auto flex gap-2 pt-4">
                  <Link href={`${ADMIN}/room-types/${t.id}`} className={cn(hbtn.outline, "flex-1")}>
                    <Pencil className="size-4" /> Edit
                  </Link>
                  <button
                    onClick={() => {
                      saveRoomType({ ...t, active: !t.active });
                      toast.success(t.active ? `${t.name} hidden from the website` : `${t.name} is live on the website`);
                    }}
                    className={hbtn.outline}
                    title={t.active ? "Hide from website" : "Show on website"}
                  >
                    {t.active ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>
            </Card>
          );
        })}
        <Link
          href={`${ADMIN}/room-types/new`}
          className="flex min-h-64 flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-neutral-200 text-sm font-medium text-neutral-500 transition hover:border-sky-300 hover:text-sky-700"
        >
          <BedDouble className="size-6" /> Add a room type
        </Link>
      </div>

      {unitModal && <UnitModal unit={unitModal} onClose={() => setUnitModal(null)} />}
    </div>
  );
}
