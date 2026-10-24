"use client";

import Link from "next/link";
import { BedDouble, ImageOff, Users } from "lucide-react";
import { taka } from "@/src/lib/hotel-store/format";
import { useT } from "@/src/lib/hotel-store/i18n";
import { cn } from "@/src/lib/utils";
import { ADMIN } from "../ui";
import type { Row } from "./model";
import { EditButton, HousekeepingChip, OosReason, RoomMenu, TonightChip, WebChip } from "./parts";

export function Thumb({ row, className }: { row: Row; className?: string }) {
  const tr = useT();
  const src = row.t?.images[0];
  return (
    <div className={cn("shrink-0 overflow-hidden rounded-md bg-neutral-100", className)}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element -- admin thumbnail
        <img src={src} alt="" loading="lazy" className={cn("size-full object-cover", row.tonight === "oos" && "grayscale")} />
      ) : (
        <div className="flex size-full items-center justify-center text-neutral-400">
          <ImageOff className="size-5" aria-label={tr("No photo")} />
        </div>
      )}
    </div>
  );
}

export function Price({ row }: { row: Row }) {
  const tr = useT();
  const p = row.t?.price ?? 0;
  return (
    <p className="whitespace-nowrap text-sm tabular-nums">
      <b className="font-bold text-neutral-900">{p > 0 ? taka(p) : "৳—"}</b> <span className="text-xs text-neutral-500">/ {tr("night")}</span>
    </p>
  );
}

export function RoomCard({ row }: { row: Row }) {
  const tr = useT();
  const { u, t, web, tonight, missing } = row;
  return (
    <article className="flex flex-col gap-2 rounded-md border border-neutral-200 bg-white p-3 transition hover:border-sky-300 hover:shadow-sm hover:shadow-neutral-900/5">
      <div className="flex items-start gap-3">
        <Thumb row={row} className="size-14" />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-base font-semibold leading-tight text-neutral-900">
              <Link
                href={`${ADMIN}/rooms/${u.id}`}
                className="rounded-sm outline-none hover:text-sky-700 hover:underline hover:underline-offset-2 focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
              >
                {tr("Room")} {u.number}
              </Link>
            </h3>
            <Price row={row} />
          </div>
          <p className={cn("mt-0.5 truncate text-sm", t?.name ? "text-neutral-700" : "italic text-neutral-500")} title={t?.name}>
            {t?.name || tr("No name yet")}
          </p>
          <p className="mt-1 flex items-center gap-3 text-[13px] text-neutral-600">
            <span className="flex min-w-0 items-center gap-1">
              <BedDouble className="size-3.5 shrink-0 text-neutral-500" aria-hidden /> <span className="truncate">{t?.beds || tr("Beds not set")}</span>
            </span>
            {t && t.capacity > 0 && (
              // Just the icon and number on the card; the full wording stays for screen readers and on hover.
              <span className="flex shrink-0 items-center gap-1" title={tr(t.capacity === 1 ? "Up to {n} guest" : "Up to {n} guests", { n: t.capacity })}>
                <Users className="size-3.5 text-neutral-500" aria-hidden />
                <span aria-hidden>{t.capacity}</span>
                <span className="sr-only">{tr(t.capacity === 1 ? "Up to {n} guest" : "Up to {n} guests", { n: t.capacity })}</span>
              </span>
            )}
          </p>
        </div>
      </div>

      <div className="mt-auto flex flex-wrap items-center gap-x-2 gap-y-2">
        <div className="flex min-w-0 flex-wrap items-center gap-1.5">
          {/* Published is the normal state, so phones only flag hidden and draft rooms. */}
          <WebChip web={web} className={cn(web === "published" && "max-sm:hidden")} />
          <TonightChip tonight={tonight} />
          <HousekeepingChip row={row} />
        </div>
        <div className="ml-auto flex shrink-0 items-center gap-1.5">
          <EditButton row={row} />
          <RoomMenu row={row} />
        </div>
        {tonight === "oos" && <OosReason reason={u.oosReason} className="basis-full" />}
        {web === "draft" && missing.length > 0 && (
          <p className="basis-full truncate text-[13px] text-neutral-600" title={missing.map((m) => tr(m)).join(", ")}>
            {tr("Missing")}: {missing.map((m) => tr(m)).join(", ")}
          </p>
        )}
      </div>
    </article>
  );
}
