"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, DoorOpen, EyeOff, ImageOff, Pencil, Plus, Search, Users } from "lucide-react";
import { taka, todayKey } from "@/src/lib/hotel-store/format";
import { unitToday, useHotelDB } from "@/src/lib/hotel-store/store";
import type { Booking, RoomTypeRecord, RoomUnit } from "@/src/lib/hotel-store/types";
import { cn } from "@/src/lib/utils";
import { ADMIN, Card, Empty, hbtn, Pills, Select, StatCard } from "./ui";

type Status = "free" | "staying" | "oos";
type Filter = "all" | Status;
type Row = { u: RoomUnit; t?: RoomTypeRecord; occupant?: Booking; status: Status };

const floorLabel = (f: number) => (f === 0 ? "Ground floor" : `Floor ${f}`);
const statusStyles: Record<Status, { label: string; chip: string; dot: string }> = {
  free: { label: "Free tonight", chip: "bg-sky-50 text-sky-700", dot: "bg-sky-500" },
  staying: { label: "Guest staying", chip: "bg-emerald-50 text-emerald-700", dot: "bg-emerald-500" },
  oos: { label: "Not available", chip: "bg-neutral-100 text-neutral-600", dot: "bg-neutral-400" },
};

export default function RoomTypes() {
  const db = useHotelDB();
  const today = todayKey();
  const [filter, setFilter] = useState<Filter>("all");
  const [type, setType] = useState("all");
  const [query, setQuery] = useState("");

  const rows: Row[] = [...db.units]
    .sort((a, b) => a.floor - b.floor || a.number.localeCompare(b.number, undefined, { numeric: true }))
    .map((u) => {
      const occupant = unitToday(db, u.id, today).occupant;
      const status: Status = u.outOfService ? "oos" : occupant ? "staying" : "free";
      return { u, t: db.roomTypes.find((r) => r.id === u.typeId), occupant, status };
    });
  const count = (s: Status) => rows.filter((r) => r.status === s).length;
  const share = (s: Status) => (rows.length ? (count(s) / rows.length) * 100 : 0);

  const q = query.trim().toLowerCase();
  const shown = rows.filter(
    (r) =>
      (filter === "all" || r.status === filter) &&
      (type === "all" || r.u.typeId === type) &&
      (!q || r.u.number.toLowerCase().includes(q) || r.t?.name.toLowerCase().includes(q) || r.occupant?.guest.name.toLowerCase().includes(q))
  );
  const floors = [...new Set(shown.map((r) => r.u.floor))];

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="All rooms" value={rows.length} icon={DoorOpen} tone="neutral" hint={`${db.roomTypes.length} types of room`} />
        <StatCard label="Free tonight" value={count("free")} icon={CheckCircle2} tone="sky" meter={share("free")} />
        <StatCard label="Guest staying" value={count("staying")} icon={Users} tone="green" meter={share("staying")} />
      </div>

      <Card className="mt-6 flex flex-wrap items-center gap-3 p-3">
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search room, guest or type"
            aria-label="Search rooms"
            className="h-9 w-full rounded-md border border-neutral-200 bg-white pl-9 pr-3 text-sm outline-none transition placeholder:text-neutral-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
          />
        </div>
        <Pills
          size="md"
          value={filter}
          onChange={setFilter}
          options={[
            { value: "all", label: "All", count: rows.length },
            { value: "free", label: "Free tonight", count: count("free") },
            { value: "staying", label: "Guest staying", count: count("staying") },
          ]}
        />
        <div className="flex gap-2 sm:ml-auto">
          <Select
            label="Type of room"
            value={type}
            onChange={setType}
            options={[{ value: "all", label: "All types of room" }, ...db.roomTypes.map((t) => ({ value: t.id, label: t.name }))]}
          />
          <Link href={`${ADMIN}/room-types/new`} className={cn(hbtn.primary, "h-9")}>
            <Plus className="size-4" /> Add room
          </Link>
        </div>
      </Card>

      {shown.length === 0 ? (
        <Card className="mt-6">
          <Empty icon={Search} title="No rooms match" text="Try a different search or filter." />
        </Card>
      ) : (
        <div className="mt-6 space-y-8">
          {floors.map((floor) => {
            const list = shown.filter((r) => r.u.floor === floor);
            const free = list.filter((r) => r.status === "free").length;
            return (
              <section key={floor}>
                <div className="mb-3 flex items-baseline gap-2">
                  <h2 className="font-semibold text-neutral-900">{floorLabel(floor)}</h2>
                  <span className="text-xs text-neutral-500">
                    {list.length} room{list.length === 1 ? "" : "s"} · {free} free
                  </span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                  {list.map((r) => (
                    <RoomCard key={r.u.id} {...r} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

function RoomCard({ u, t, occupant, status }: Row) {
  const s = statusStyles[status];
  return (
    <div className="group relative rounded-md border border-neutral-200 bg-white transition hover:border-sky-300 hover:shadow-md hover:shadow-neutral-900/5">
      <Link href={`${ADMIN}/room-types/${u.id}`} className="flex gap-3 p-3">
        <div className="relative size-20 shrink-0 overflow-hidden rounded-md bg-neutral-100">
          {t?.images[0] ? (
            // eslint-disable-next-line @next/next/no-img-element -- admin thumbnail
            <img src={t.images[0]} alt="" className={cn("size-full object-cover transition duration-500 group-hover:scale-105", status === "oos" && "grayscale")} />
          ) : (
            <div className="flex size-full items-center justify-center text-neutral-300">
              <ImageOff className="size-5" />
            </div>
          )}
          {t && !t.active && (
            <span className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 bg-neutral-900/75 py-0.5 text-[10px] font-semibold text-white">
              <EyeOff className="size-2.5" /> Hidden
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1 pr-7">
          <p className="text-lg font-bold leading-tight text-neutral-900">{u.number}</p>
          <p className="truncate text-xs text-neutral-500">{t?.name ?? "No details yet"}</p>
          <p className="mt-1.5 text-sm font-semibold tabular-nums text-neutral-900">
            {t ? taka(t.price) : "—"}
            <span className="text-xs font-normal text-neutral-500"> /night</span>
          </p>
        </div>
      </Link>
      <Link
        href={`${ADMIN}/room-types/${u.id}/edit`}
        aria-label={`Edit room ${u.number}`}
        title="Edit"
        className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-md text-neutral-400 transition hover:bg-sky-50 hover:text-sky-700"
      >
        <Pencil className="size-3.5" />
      </Link>
      <div className="flex items-center justify-between gap-2 border-t border-neutral-100 px-3 py-2 text-xs">
        <span className={cn("flex shrink-0 items-center gap-1.5 rounded-md px-2 py-0.5 font-medium", s.chip)}>
          <span className={cn("size-1.5 rounded-full", s.dot)} /> {s.label}
        </span>
        <span className="flex min-w-0 items-center gap-1 text-neutral-500">
          {status === "staying" && occupant ? (
            <>
              <Users className="size-3 shrink-0" /> <span className="truncate">{occupant.guest.name}</span>
            </>
          ) : (
            t && (
              <>
                <Users className="size-3 shrink-0" /> Sleeps {t.capacity}
              </>
            )
          )}
        </span>
      </div>
    </div>
  );
}
