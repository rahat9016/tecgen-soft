"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { BedDouble, ChevronDown, DoorOpen, Eye, EyeOff, ImageOff, LayoutGrid, Maximize2, Pencil, Plus, Trash2, Users, Wrench } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/src/components/ui/dropdown-menu";
import { housekeepingLabels, shiftDay, taka, todayKey } from "@/src/lib/hotel-store/format";
import { deleteUnit, freeRooms, newUnitId, saveRoomType, saveUnit, unitToday, useHotelDB } from "@/src/lib/hotel-store/store";
import type { HotelDB, Housekeeping, RoomUnit } from "@/src/lib/hotel-store/types";
import { cn } from "@/src/lib/utils";
import { ADMIN, AdminHeader, Card, Field, hbtn, inputClass, Modal, Switch } from "./ui";

const floorLabel = (f: number) => (f === 0 ? "Ground" : `Floor ${f}`);

/** The next unused number on a floor, e.g. 207 when 201–206 exist. */
function nextNumber(db: HotelDB, floor: number) {
  const nums = db.units.filter((u) => u.floor === floor).map((u) => Number(u.number)).filter(Number.isFinite);
  return String(nums.length ? Math.max(...nums) + 1 : (floor || 0) * 100 + 1);
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-neutral-900">
        <span className="flex size-5 items-center justify-center rounded-md bg-sky-600 text-[11px] font-bold text-white">{n}</span>
        {title}
      </h3>
      {children}
    </section>
  );
}

function UnitModal({ unit, typeId, onClose }: { unit?: RoomUnit; typeId?: string; onClose: () => void }) {
  const db = useHotelDB();
  const floors = [...new Set(db.units.map((u) => u.floor))].sort((a, b) => a - b);
  const [form, setForm] = useState<RoomUnit>(() => {
    if (unit) return unit;
    const floor = floors[0] ?? 1;
    return { id: newUnitId(), number: nextNumber(db, floor), floor, typeId: typeId ?? db.roomTypes[0]?.id ?? "", housekeeping: "clean", outOfService: false };
  });
  const [newFloor, setNewFloor] = useState(false);
  const occupant = unit ? unitToday(db, unit.id).occupant : undefined;
  const type = db.roomTypes.find((t) => t.id === form.typeId);

  // A new room follows the chosen floor's numbering until the number is typed by hand.
  const pickFloor = (floor: number) => setForm((f) => ({ ...f, floor, number: unit ? f.number : nextNumber(db, floor) }));

  const submit = () => {
    if (form.outOfService && !unit?.outOfService && occupant) return toast.error(`${occupant.guest.name} is staying in this room — move them first.`);
    const r = saveUnit({ ...form, oosReason: form.outOfService ? form.oosReason : undefined });
    if (!r.ok) return toast.error(r.error);
    toast.success(unit ? `Room ${r.value.number} updated` : `Room ${r.value.number} added to ${floorLabel(r.value.floor)}`);
    onClose();
  };

  return (
    <Modal open wide onClose={onClose} title={unit ? `Room ${unit.number}` : "Add a room"}>
      <div className="space-y-6">
        <Step n={1} title="Which floor?">
          <div className="flex flex-wrap gap-2">
            {floors.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => {
                  setNewFloor(false);
                  pickFloor(f);
                }}
                className={cn(
                  "rounded-md border px-3.5 py-2 text-sm font-medium transition",
                  !newFloor && form.floor === f ? "border-sky-600 bg-sky-600 text-white" : "border-neutral-200 bg-white text-neutral-700 hover:border-sky-300"
                )}
              >
                {floorLabel(f)}
                <span className={cn("ml-1.5 text-xs", !newFloor && form.floor === f ? "text-white/80" : "text-neutral-400")}>{db.units.filter((u) => u.floor === f).length}</span>
              </button>
            ))}
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
          {newFloor && (
            <Field label="Floor number" className="mt-3 max-w-40">
              <input type="number" min={0} value={form.floor} onChange={(e) => pickFloor(Number(e.target.value))} className={inputClass} />
            </Field>
          )}
        </Step>

        <Step n={2} title="Room number & type">
          <div className="grid gap-3 sm:grid-cols-[10rem_1fr]">
            <Field label="Room number">
              <input value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} className={inputClass} placeholder="e.g. 208" />
            </Field>
            <Field label="Room type">
              <select value={form.typeId} onChange={(e) => setForm({ ...form, typeId: e.target.value })} className={inputClass}>
                {db.roomTypes.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} — {taka(t.price)}/night
                  </option>
                ))}
              </select>
            </Field>
          </div>
          {type && (
            <div className="mt-3 flex items-center gap-3 rounded-md border border-neutral-100 bg-neutral-50 p-2.5">
              {type.images[0] ? (
                // eslint-disable-next-line @next/next/no-img-element -- admin preview
                <img src={type.images[0]} alt="" className="h-14 w-20 shrink-0 rounded-md object-cover" />
              ) : (
                <span className="flex h-14 w-20 shrink-0 items-center justify-center rounded-md bg-neutral-200 text-neutral-400">
                  <ImageOff className="size-5" />
                </span>
              )}
              <div className="min-w-0 text-xs text-neutral-600">
                <p className="truncate text-sm font-semibold text-neutral-900">{type.name}</p>
                <p className="mt-0.5">
                  {[type.beds, type.size, `Sleeps ${type.capacity}`].filter(Boolean).join(" · ")}
                </p>
              </div>
              <p className="ml-auto shrink-0 text-sm font-bold tabular-nums text-neutral-900">{taka(type.price)}</p>
            </div>
          )}
        </Step>

        <Step n={3} title="Condition">
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(housekeepingLabels) as Housekeeping[]).map((h) => (
              <button
                key={h}
                type="button"
                onClick={() => setForm({ ...form, housekeeping: h })}
                className={cn(
                  "rounded-md border px-3 py-2 text-sm font-medium transition",
                  form.housekeeping === h ? "border-sky-600 bg-sky-50 text-sky-800" : "border-neutral-200 text-neutral-600 hover:border-sky-300"
                )}
              >
                {housekeepingLabels[h]}
              </button>
            ))}
          </div>
          <div className="mt-3 rounded-md border border-neutral-200 p-3">
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
        </Step>

        <Step n={4} title="Note (optional)">
          <input value={form.note ?? ""} onChange={(e) => setForm({ ...form, note: e.target.value })} className={inputClass} placeholder="e.g. Connecting door to 209, sea-facing balcony" />
        </Step>

        <div className="flex justify-between gap-2 border-t border-neutral-100 pt-4">
          {unit ? (
            <button
              onClick={() => {
                if (!confirm(`Delete room ${unit.number}? Past bookings keep their history.`)) return;
                const r = deleteUnit(unit.id);
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
              {unit ? "Save room" : `Add room ${form.number}`.trim()}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

function AddOption({ icon: Icon, title, text, onSelect }: { icon: React.ComponentType<{ className?: string }>; title: string; text: string; onSelect: () => void }) {
  return (
    <DropdownMenuItem onSelect={onSelect} className="cursor-pointer items-start gap-3 rounded-md p-2.5">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-sky-50 text-sky-600">
        <Icon className="size-4" />
      </span>
      <span>
        <span className="block text-sm font-semibold text-neutral-900">{title}</span>
        <span className="block text-xs text-neutral-500">{text}</span>
      </span>
    </DropdownMenuItem>
  );
}

export default function RoomTypes() {
  const db = useHotelDB();
  const router = useRouter();
  const today = todayKey();
  const [modal, setModal] = useState<{ unit?: RoomUnit; typeId?: string } | null>(null);

  return (
    <div>
      <AdminHeader
        title="Room types & rooms"
        subtitle={`${db.roomTypes.length} room types · ${db.units.length} rooms`}
        actions={
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger className={hbtn.primary}>
              <Plus className="size-4" /> Add new <ChevronDown className="size-4 opacity-80" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" sideOffset={8} className="w-72 rounded-md p-1.5">
              <AddOption
                icon={DoorOpen}
                title="Room"
                text="A room number, e.g. 208, under an existing type."
                onSelect={() => setModal({})}
              />
              <AddOption
                icon={LayoutGrid}
                title="Room type"
                text="A new kind of room guests can book, with photos and price."
                onSelect={() => router.push(`${ADMIN}/room-types/new`)}
              />
            </DropdownMenuContent>
          </DropdownMenu>
        }
      />

      <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
        {db.roomTypes.map((t) => {
          const units = db.units.filter((u) => u.typeId === t.id);
          const free = freeRooms(db, t.id, today, shiftDay(today, 1));
          return (
            <Card key={t.id} className="group flex flex-col overflow-hidden p-0">
              <div className="relative aspect-video overflow-hidden bg-neutral-100">
                {t.images[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element -- admin preview
                  <img src={t.images[0]} alt="" className={cn("size-full object-cover transition duration-500 group-hover:scale-105", !t.active && "grayscale")} />
                ) : (
                  <div className="flex size-full items-center justify-center text-neutral-300">
                    <ImageOff className="size-8" />
                  </div>
                )}
                <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent" />
                {!t.active && <span className="absolute left-3 top-3 rounded-md bg-neutral-900/80 px-2 py-1 text-xs font-semibold text-white">Hidden from website</span>}
                <div className="absolute inset-x-4 bottom-3 flex items-end justify-between gap-3 text-white">
                  <h2 className="truncate text-lg font-semibold">{t.name}</h2>
                  <p className="shrink-0 text-lg font-bold tabular-nums">
                    {taka(t.price)}
                    <span className="text-xs font-normal text-white/70"> /night</span>
                  </p>
                </div>
              </div>

              <div className="flex flex-1 flex-col p-5">
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-600">
                  {t.beds && (
                    <span className="flex items-center gap-1">
                      <BedDouble className="size-3.5 text-neutral-400" /> {t.beds}
                    </span>
                  )}
                  {t.size && (
                    <span className="flex items-center gap-1">
                      <Maximize2 className="size-3.5 text-neutral-400" /> {t.size}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Users className="size-3.5 text-neutral-400" /> Sleeps {t.capacity}
                  </span>
                </div>

                <div className="mt-4 flex items-center justify-between text-xs">
                  <span className="font-semibold text-neutral-800">
                    {units.length} room{units.length === 1 ? "" : "s"}
                  </span>
                  <span className="text-neutral-500">
                    <span className="font-semibold text-emerald-700">{free}</span> free tonight
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {units.map((u) => {
                    const occ = unitToday(db, u.id, today).occupant;
                    return (
                      <button
                        key={u.id}
                        onClick={() => setModal({ unit: u })}
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
                  <button
                    onClick={() => setModal({ typeId: t.id })}
                    className="flex items-center gap-1 rounded-md border border-dashed border-neutral-300 px-2 py-1 text-xs font-medium text-neutral-500 transition hover:border-sky-400 hover:text-sky-700"
                  >
                    <Plus className="size-3" /> Add room
                  </button>
                </div>
                {units.length === 0 && <p className="mt-2 text-xs text-amber-700">No rooms yet — guests can&rsquo;t book this type.</p>}

                <div className="mt-auto flex gap-2 pt-5">
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
                    aria-label={t.active ? "Hide from website" : "Show on website"}
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

      {modal && <UnitModal unit={modal.unit} typeId={modal.typeId} onClose={() => setModal(null)} />}
    </div>
  );
}
