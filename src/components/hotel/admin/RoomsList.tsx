"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertTriangle, ChevronDown, DoorOpen, FilePen, Plus, RotateCcw, Search, X } from "lucide-react";
import { todayKey } from "@/src/lib/hotel-store/format";
import { useHotelDB, useHydrated } from "@/src/lib/hotel-store/store";
import { useT } from "@/src/lib/hotel-store/i18n";
import { cn } from "@/src/lib/utils";
import { ChoiceGroup, FilterChips, FilterPopover, type FilterChip } from "./filters";
import { RoomCard } from "./rooms-list/RoomCard";
import { roomRows, type Row, type OpsFilter, type WebFilter } from "./rooms-list/model";
import { ADMIN, Card, Empty, hbtn } from "./ui";

const webLabels: Record<WebFilter, string> = { all: "All", published: "Published", hidden: "Hidden", draft: "Draft" };
const opsLabels: Record<OpsFilter, string> = { all: "All", in: "In service", oos: "Out of service" };

const fieldClass = "h-10 rounded-md border border-neutral-300 bg-white text-sm text-neutral-800 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100";

export default function RoomsList() {
  const t = useT();
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
              <RotateCcw className="size-4" /> {t("Retry")}
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
              <Plus className="size-4" /> {t("Add room")}
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
  const floorName = (f: number) => (f === 0 ? t("Ground floor") : t("Floor {n}", { n: f }));
  const chips = [
    floor !== "all" && { key: "floor", label: floorName(Number(floor)), clear: () => setFloor("all") },
    web !== "all" && { key: "web", label: `${t("Website")}: ${t(webLabels[web])}`, clear: () => setWeb("all") },
    ops !== "all" && { key: "ops", label: t(opsLabels[ops]), clear: () => setOps("all") },
  ].filter(Boolean) as FilterChip[];
  const filtered = chips.length > 0 || !!q;
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

  return (
    <div>
      <Header count={rows.length} />

      {drafts > 0 && web !== "draft" && (
        <div className="mb-3 flex items-center justify-between gap-3 rounded-md border border-violet-200 bg-violet-50 px-3 py-2 text-[13px] text-violet-950 sm:mb-4 sm:px-4 sm:text-sm">
          <span className="flex min-w-0 items-center gap-2">
            <FilePen className="size-4 shrink-0" aria-hidden />
            <span className="truncate">{drafts === 1 ? t("1 draft room isn’t bookable yet") : t("{n} draft rooms aren’t bookable yet", { n: drafts })}</span>
          </span>
          <button type="button" onClick={() => setWeb("draft")} className="shrink-0 rounded-sm font-semibold underline underline-offset-2 hover:text-violet-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500">
            {t("Show drafts")}
          </button>
        </div>
      )}

      <div className="sticky top-16 z-10 -mx-4 border-y border-neutral-200 bg-neutral-50/95 px-4 py-2.5 backdrop-blur">
        <div className="flex items-center gap-2">
          <div className="relative min-w-0 flex-1 sm:max-w-80">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-500" aria-hidden />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("Search rooms")}
              aria-label={t("Search room number or name")}
              className={cn(fieldClass, "w-full pl-9 pr-3 placeholder:text-neutral-500")}
            />
          </div>
          <FilterPopover active={chips.length} applyLabel={t("Show {n} rooms", { n: shown.length })} onClear={clear}>
            <ChoiceGroup
              grid
              label="Floor"
              value={floor}
              onChange={setFloor}
              options={[{ value: "all", label: t("All") }, ...allFloors.map((f) => ({ value: String(f), label: f === 0 ? t("Ground floor") : String(f) }))]}
            />
            <ChoiceGroup label="Website" value={web} onChange={setWeb} options={(Object.keys(webLabels) as WebFilter[]).map((v) => ({ value: v, label: t(webLabels[v]) }))} />
            <ChoiceGroup label="Status" value={ops} onChange={setOps} options={(Object.keys(opsLabels) as OpsFilter[]).map((v) => ({ value: v, label: t(opsLabels[v]) }))} />
          </FilterPopover>
        </div>

        {filtered && <FilterChips count={shown.length} chips={chips} onClear={clear} className="mt-2" />}
      </div>

      {shown.length === 0 ? (
        <Card className="mt-4">
          <Empty icon={Search} title="No rooms match these filters" text="Try another room number or name, or clear the filters to see every room.">
            <button type="button" onClick={clear} className={cn(hbtn.outline, "mt-2")}>
              <X className="size-4" /> {t("Clear filters")}
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
                    <span className="text-sm font-semibold text-neutral-900">{floorName(f)}</span>
                    <span className="text-[13px] text-neutral-600">
                      · {t(list.length === 1 ? "{n} room" : "{n} rooms", { n: list.length })}
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

function Header({ count }: { count?: number }) {
  const t = useT();
  return (
    <div className="mb-3 flex items-center justify-between gap-3 rounded-md border border-neutral-200 bg-white px-4 py-3 sm:mb-4 sm:px-5 sm:py-3.5">
      <div className="min-w-0">
        <h1 className="text-xl font-bold text-neutral-900 sm:text-2xl">{t("Rooms")}</h1>
        {/* Phones get the room count only; the longer description waits for more room. */}
        {count !== undefined && <p className="mt-0.5 text-[13px] text-neutral-600 sm:hidden">{t(count === 1 ? "{n} room" : "{n} rooms", { n: count })}</p>}
        <p className="mt-0.5 hidden text-sm text-neutral-600 sm:block">{t("Manage room details, pricing, and website visibility.")}</p>
      </div>
      <Link href={`${ADMIN}/rooms/new`} className={cn(hbtn.primary, "shrink-0")}>
        <Plus className="size-4" /> {t("Add room")}
      </Link>
    </div>
  );
}

function LoadingState() {
  const t = useT();
  return (
    <div aria-busy="true" aria-label={t("Loading rooms")}>
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
