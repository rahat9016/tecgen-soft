"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertTriangle, ChevronDown, ChevronsUpDown, DoorOpen, FilePen, Plus, RotateCcw, Search, X } from "lucide-react";
import { todayKey } from "@/src/lib/hotel-store/format";
import { useHotelDB, useHydrated } from "@/src/lib/hotel-store/store";
import { cn } from "@/src/lib/utils";
import { floorLabel } from "./room-form/model";
import { RoomCard } from "./rooms-list/RoomCard";
import { roomRows, type Row, type OpsFilter, type WebFilter } from "./rooms-list/model";
import { ADMIN, Card, Empty, hbtn, Select } from "./ui";

const ghostClass =
  "inline-flex h-10 items-center gap-1.5 rounded-md px-3 text-sm font-medium transition hover:bg-white hover:text-sky-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500";
const fieldClass = "h-10 rounded-md border border-neutral-300 bg-white text-sm text-neutral-800 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100";

export default function RoomsList() {
  const db = useHotelDB();
  const hydrated = useHydrated();
  const today = todayKey();
  const [query, setQuery] = useState("");
  const [floor, setFloor] = useState("all");
  const [web, setWeb] = useState<WebFilter>("all");
  const [ops, setOps] = useState<OpsFilter>("all");
  const [collapsed, setCollapsed] = useState<Set<number>>(new Set());
  const [attempt, setAttempt] = useState(0);

  if (!hydrated) return <LoadingState />;

  let rows: Row[];
  try {
    rows = roomRows(db, today);
  } catch {
    return (
      <>
        <Header />
        <Card>
          <Empty icon={AlertTriangle} title="Couldn’t load rooms" text="Something went wrong reading the room list. Your rooms weren’t changed.">
            <button type="button" onClick={() => setAttempt(attempt + 1)} className={cn(hbtn.outline, "mt-2")}>
              <RotateCcw className="size-4" /> Retry
            </button>
          </Empty>
        </Card>
      </>
    );
  }

  if (rows.length === 0) {
    return (
      <>
        <Header />
        <Card>
          <Empty icon={DoorOpen} title="No rooms yet" text="Add your first room with its number, photos and nightly rate. You can keep it as a draft until it’s ready for the website.">
            <Link href={`${ADMIN}/rooms/new`} className={cn(hbtn.primary, "mt-2")}>
              <Plus className="size-4" /> Add room
            </Link>
          </Empty>
        </Card>
      </>
    );
  }

  const drafts = rows.filter((r) => r.web === "draft").length;
  const allFloors = [...new Set(rows.map((r) => r.u.floor))].sort((a, b) => a - b);

  const q = query.trim().toLowerCase();
  const shown = rows.filter(
    (r) =>
      (web === "all" || r.web === web) &&
      (ops === "all" || (ops === "oos") === r.u.outOfService) &&
      (floor === "all" || r.u.floor === Number(floor)) &&
      (!q || r.u.number.toLowerCase().includes(q) || r.t?.name.toLowerCase().includes(q))
  );
  const floors = allFloors.filter((f) => shown.some((r) => r.u.floor === f));
  const filtered = web !== "all" || ops !== "all" || floor !== "all" || !!q;
  const clear = () => {
    setWeb("all");
    setOps("all");
    setFloor("all");
    setQuery("");
  };
  const toggleFloor = (f: number) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(f)) next.delete(f);
      else next.add(f);
      return next;
    });
  const allCollapsed = floors.length > 0 && floors.every((f) => collapsed.has(f));

  return (
    <div>
      <Header />

      {drafts > 0 && web !== "draft" && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-md border border-violet-200 bg-violet-50 px-4 py-2.5 text-sm text-violet-950">
          <span className="flex items-center gap-2">
            <FilePen className="size-4 shrink-0" aria-hidden />
            {drafts === 1 ? "1 room is a draft" : `${drafts} rooms are drafts`} — not on the website and can’t be booked until finished.
          </span>
          <button type="button" onClick={() => setWeb("draft")} className="rounded-sm font-semibold underline underline-offset-2 hover:text-violet-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500">
            Show drafts
          </button>
        </div>
      )}

      <div className="sticky top-16 z-10 -mx-4 border-y border-neutral-200 bg-neutral-50/95 px-4 py-2.5 backdrop-blur sm:-mx-6 sm:px-6 xl:-mx-8 xl:px-8">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-full sm:w-72 lg:w-80">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-500" aria-hidden />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search room number or name"
              aria-label="Search room number or name"
              className={cn(fieldClass, "w-full pl-9 pr-3 placeholder:text-neutral-500")}
            />
          </div>
          <Select
            label="Floor"
            value={floor}
            onChange={setFloor}
            className={cn(fieldClass, "px-3")}
            options={[{ value: "all", label: "All floors" }, ...allFloors.map((f) => ({ value: String(f), label: floorLabel(f) }))]}
          />
          <Select
            label="Website status"
            value={web}
            onChange={setWeb}
            className={cn(fieldClass, "px-3")}
            options={[
              { value: "all", label: "Website: All" },
              { value: "published", label: "Published" },
              { value: "hidden", label: "Hidden" },
              { value: "draft", label: "Draft" },
            ]}
          />
          <Select
            label="Operational status"
            value={ops}
            onChange={setOps}
            className={cn(fieldClass, "px-3")}
            options={[
              { value: "all", label: "Status: All" },
              { value: "in", label: "In service" },
              { value: "oos", label: "Out of service" },
            ]}
          />
          {filtered && (
            <button type="button" onClick={clear} className={cn(ghostClass, "text-sky-700")}>
              <X className="size-4" aria-hidden /> Clear filters
            </button>
          )}
          <div className="ml-auto flex items-center">
            {floors.length > 1 && (
              <button type="button" onClick={() => setCollapsed(allCollapsed ? new Set() : new Set(allFloors))} className={cn(ghostClass, "text-neutral-700")}>
                <ChevronsUpDown className="size-4" aria-hidden /> {allCollapsed ? "Expand all" : "Collapse all"}
              </button>
            )}
          </div>
        </div>
      </div>

      {shown.length === 0 ? (
        <Card className="mt-4">
          <Empty icon={Search} title="No rooms match these filters" text="Try another room number or name, or clear the filters to see every room.">
            <button type="button" onClick={clear} className={cn(hbtn.outline, "mt-2")}>
              <X className="size-4" /> Clear filters
            </button>
          </Empty>
        </Card>
      ) : (
        <div className="mt-4 space-y-3 @container">
          {floors.map((f) => {
            const list = shown.filter((r) => r.u.floor === f);
            const open = !collapsed.has(f);
            const id = `floor-${f}`;
            return (
              <section key={f} aria-labelledby={`${id}-title`}>
                <h2 id={`${id}-title`}>
                  <button
                    type="button"
                    aria-expanded={open}
                    aria-controls={id}
                    onClick={() => toggleFloor(f)}
                    className="flex h-10 w-full items-center gap-2 rounded-md border border-neutral-200 bg-neutral-100 px-3 text-left transition hover:bg-neutral-200/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
                  >
                    <ChevronDown className={cn("size-4 text-neutral-600 transition-transform", !open && "-rotate-90")} aria-hidden />
                    <span className="text-sm font-semibold text-neutral-900">{floorLabel(f)}</span>
                    <span className="text-[13px] text-neutral-600">
                      · {list.length} {list.length === 1 ? "room" : "rooms"}
                    </span>
                  </button>
                </h2>
                {open && (
                  <div id={id} className="mt-2 grid gap-2.5 @2xl:grid-cols-2 @5xl:grid-cols-3 @7xl:grid-cols-4">
                    {list.map((r) => (
                      <RoomCard key={r.u.id} row={r} />
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Header() {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-md border border-neutral-200 bg-white px-4 py-3.5 sm:px-5">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold text-neutral-900">Rooms</h1>
        <p className="mt-0.5 text-sm text-neutral-600">Manage room details, pricing, and website visibility.</p>
      </div>
      <Link href={`${ADMIN}/rooms/new`} className={hbtn.primary}>
        <Plus className="size-4" /> Add room
      </Link>
    </div>
  );
}

function LoadingState() {
  return (
    <div aria-busy="true" aria-label="Loading rooms">
      <Header />
      <div className="h-12 animate-pulse rounded-md bg-neutral-200/60" />
      <div className="mt-4 grid gap-2.5 md:grid-cols-2 2xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="h-32 animate-pulse rounded-md bg-neutral-200/60" />
        ))}
      </div>
    </div>
  );
}
