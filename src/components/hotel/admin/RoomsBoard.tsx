"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { BedDouble, Brush, Sparkles, Wrench } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { can } from "@/src/lib/hotel-store/auth";
import { dateLabel, housekeepingLabels, relativeDay, taka, todayKey } from "@/src/lib/hotel-store/format";
import { checkInBooking, dueOf, setHousekeeping, setOutOfService, unitToday, useCurrentStaff, useHotelDB } from "@/src/lib/hotel-store/store";
import type { Housekeeping, RoomUnit } from "@/src/lib/hotel-store/types";
import { cn } from "@/src/lib/utils";
import { ADMIN, AdminHeader, Pills, hbtn } from "./ui";

type Filter = "all" | "occupied" | "vacant" | "arriving" | "departing" | "dirty" | "oos";

const hkTone: Record<Housekeeping, string> = {
  clean: "bg-emerald-50 text-emerald-700",
  inspected: "bg-sky-50 text-sky-700",
  dirty: "bg-amber-100 text-amber-800",
};

export default function RoomsBoard() {
  const db = useHotelDB();
  const staff = useCurrentStaff();
  const params = useSearchParams();
  const today = todayKey();
  const initial = params.get("filter") as Filter | null;
  const [filter, setFilter] = useState<Filter>(initial ?? "all");
  const canManage = can(staff?.role, "rooms.manage");

  const info = new Map(db.units.map((u) => [u.id, unitToday(db, u.id, today)]));
  const state = (u: RoomUnit) => {
    const i = info.get(u.id)!;
    if (u.outOfService) return "oos" as const;
    if (i.departing) return "departing" as const;
    if (i.occupant) return "occupied" as const;
    if (i.arrival) return "arriving" as const;
    return "vacant" as const;
  };
  const tests: Record<Filter, (u: RoomUnit) => boolean> = {
    all: () => true,
    occupied: (u) => state(u) === "occupied" || state(u) === "departing",
    vacant: (u) => state(u) === "vacant",
    arriving: (u) => state(u) === "arriving",
    departing: (u) => state(u) === "departing",
    dirty: (u) => u.housekeeping === "dirty" && !u.outOfService,
    oos: (u) => u.outOfService,
  };
  const count = (f: Filter) => db.units.filter(tests[f]).length;
  const floors = [...new Set(db.units.map((u) => u.floor))].sort((a, b) => a - b);

  const styles = {
    occupied: { card: "border-emerald-300 bg-emerald-50/50", chip: "bg-emerald-600 text-white", label: "Occupied" },
    departing: { card: "border-orange-300 bg-orange-50/50", chip: "bg-orange-500 text-white", label: "Due out" },
    arriving: { card: "border-sky-300 bg-sky-50/50", chip: "bg-sky-600 text-white", label: "Arriving" },
    vacant: { card: "border-neutral-200 bg-white", chip: "bg-neutral-100 text-neutral-600", label: "Vacant" },
    oos: { card: "border-dashed border-neutral-300 bg-neutral-100/70", chip: "bg-neutral-700 text-white", label: "Out of service" },
  };

  return (
    <div>
      <AdminHeader title="Rooms board" subtitle={`${dateLabel(today, "EEEE, dd MMM")} · who is in which room right now`} />

      <div className="mb-5">
        <Pills
          value={filter}
          onChange={setFilter}
          options={[
            { value: "all", label: "All rooms", count: count("all") },
            { value: "occupied", label: "Occupied", count: count("occupied") },
            { value: "arriving", label: "Arriving", count: count("arriving") },
            { value: "departing", label: "Due out", count: count("departing") },
            { value: "vacant", label: "Vacant", count: count("vacant") },
            { value: "dirty", label: "Needs cleaning", count: count("dirty") },
            { value: "oos", label: "Out of service", count: count("oos") },
          ]}
        />
      </div>

      <div className="space-y-8">
        {floors.map((floor) => {
          const units = db.units.filter((u) => u.floor === floor && tests[filter](u));
          if (!units.length) return null;
          return (
            <section key={floor}>
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">Floor {floor}</h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                {units.map((u) => {
                  const s = state(u);
                  const st = styles[s];
                  const i = info.get(u.id)!;
                  const b = i.occupant ?? i.arrival;
                  const type = db.roomTypes.find((t) => t.id === u.typeId);
                  const due = b ? dueOf(b) : 0;
                  return (
                    <article key={u.id} className={cn("flex flex-col rounded-2xl border p-4 transition", st.card)}>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-2xl font-bold leading-none text-neutral-900">{u.number}</p>
                          <p className="mt-1 truncate text-xs text-neutral-500">{type?.name ?? "Unknown type"}</p>
                        </div>
                        <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide", st.chip)}>{st.label}</span>
                      </div>

                      <div className="mt-3 min-h-14 flex-1">
                        {b ? (
                          <Link href={`${ADMIN}/bookings/${b.id}`} className="block rounded-xl bg-white/80 p-2.5 ring-1 ring-black/5 transition hover:ring-sky-300">
                            <p className="truncate text-sm font-semibold text-neutral-900">{b.guest.name}</p>
                            <p className="text-xs text-neutral-500">
                              {b.code} · {dateLabel(b.checkIn, "dd MMM")} → {dateLabel(b.checkOut, "dd MMM")} · {b.adults + b.children} guest{b.adults + b.children > 1 ? "s" : ""}
                            </p>
                            {due > 0 && <p className="mt-0.5 text-xs font-semibold text-rose-600">{taka(due)} due</p>}
                          </Link>
                        ) : u.outOfService ? (
                          <p className="flex items-center gap-1.5 text-sm text-neutral-600">
                            <Wrench className="size-4" /> {u.oosReason || "Maintenance"}
                          </p>
                        ) : (
                          <p className="text-xs text-neutral-500">
                            {i.next ? (
                              <>
                                Next: <b className="text-neutral-700">{i.next.guest.name}</b> · {relativeDay(i.next.checkIn)}
                              </>
                            ) : (
                              "No upcoming bookings assigned"
                            )}
                          </p>
                        )}
                      </div>

                      <div className="mt-3 flex items-center justify-between gap-2">
                        <DropdownMenu modal={false}>
                          <DropdownMenuTrigger className={cn("flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium outline-none", hkTone[u.housekeeping])}>
                            {u.housekeeping === "dirty" ? <Brush className="size-3" /> : <Sparkles className="size-3" />}
                            {housekeepingLabels[u.housekeeping]}
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" className="rounded-xl">
                            <DropdownMenuLabel className="text-xs">Housekeeping</DropdownMenuLabel>
                            {(Object.keys(housekeepingLabels) as Housekeeping[]).map((hk) => (
                              <DropdownMenuItem key={hk} onSelect={() => setHousekeeping(u.id, hk)} className="cursor-pointer">
                                {housekeepingLabels[hk]}
                              </DropdownMenuItem>
                            ))}
                            {canManage && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="cursor-pointer"
                                  onSelect={() => {
                                    if (u.outOfService) {
                                      setOutOfService(u.id, false);
                                      toast.success(`Room ${u.number} back in service`);
                                      return;
                                    }
                                    const reason = prompt(`Take room ${u.number} out of service — reason:`, "Maintenance");
                                    if (reason === null) return;
                                    const r = setOutOfService(u.id, true, reason);
                                    if (!r.ok) toast.error(r.error);
                                  }}
                                >
                                  <Wrench /> {u.outOfService ? "Put back in service" : "Take out of service"}
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>

                        {s === "arriving" && i.arrival && (
                          <button
                            onClick={() => {
                              const r = checkInBooking(i.arrival!.id);
                              if (r.ok) toast.success(`${i.arrival!.guest.name} checked in to ${u.number}`);
                              else toast.error(r.error);
                            }}
                            className={cn(hbtn.small, "border-sky-200 text-sky-700")}
                          >
                            Check in
                          </button>
                        )}
                        {s === "departing" && i.occupant && (
                          <Link href={`${ADMIN}/bookings/${i.occupant.id}`} className={hbtn.small}>
                            Check out
                          </Link>
                        )}
                        {s === "vacant" && can(staff?.role, "bookings.manage") && (
                          <Link href={`${ADMIN}/bookings/new?type=${u.typeId}&unit=${u.id}`} className={hbtn.small}>
                            <BedDouble className="size-3.5" /> Walk-in
                          </Link>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
