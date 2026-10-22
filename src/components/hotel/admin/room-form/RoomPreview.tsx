"use client";

import { BedDouble, ImageIcon, Maximize, Users } from "lucide-react";
import { taka } from "@/src/lib/hotel-store/format";
import { cn } from "@/src/lib/utils";
import { facilityLabel, formatBeds, formatSize, toNumber, type FormValues, type Photo } from "./model";

export type PreviewStatus = "draft" | "published" | "hidden";

const statusStyle: Record<PreviewStatus, { label: string; className: string }> = {
  draft: { label: "Draft", className: "bg-violet-50 text-violet-800 ring-violet-200" },
  published: { label: "Published", className: "bg-emerald-100 text-emerald-900 ring-emerald-300" },
  hidden: { label: "Hidden from website", className: "bg-neutral-100 text-neutral-800 ring-neutral-300" },
};

/** Roughly how the room card looks on the website, updated as staff type. */
export default function RoomPreview({ v, photos, status }: { v: FormValues; photos: Photo[]; status: PreviewStatus }) {
  const main = photos.find((p) => p.status !== "error");
  const price = toNumber(v.price);
  const was = toNumber(v.originalPrice);
  const beds = formatBeds(v.beds);
  const size = formatSize(v);
  const cap = toNumber(v.capacity);
  const s = statusStyle[status];

  return (
    <div className="overflow-hidden rounded-md border border-neutral-200 bg-white">
      <div className="relative aspect-16/10 bg-neutral-100">
        {main ? (
          // eslint-disable-next-line @next/next/no-img-element -- live preview of local photos
          <img src={main.src} alt="" className="size-full object-cover" />
        ) : (
          <div className="flex size-full flex-col items-center justify-center gap-1 text-sm text-neutral-500">
            <ImageIcon className="size-7" aria-hidden />
            Main photo appears here
          </div>
        )}
        {v.highlight.trim() && <span className="absolute left-2.5 top-2.5 rounded bg-white px-2 py-0.5 text-xs font-semibold text-sky-800 shadow-sm">{v.highlight.trim()}</span>}
        <span className={cn("absolute right-2.5 top-2.5 rounded px-2 py-0.5 text-xs font-semibold ring-1 ring-inset", s.className)}>{s.label}</span>
      </div>
      <div className="space-y-2.5 p-4">
        <h3 className={cn("text-base font-semibold leading-snug", v.name.trim() ? "text-neutral-900" : "text-neutral-400")}>{v.name.trim() || "Room name"}</h3>
        <ul className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-neutral-700">
          <li className="flex items-center gap-1">
            <BedDouble className="size-3.5 text-neutral-500" aria-hidden />
            {beds || "Beds"}
          </li>
          <li className="flex items-center gap-1">
            <Users className="size-3.5 text-neutral-500" aria-hidden />
            {cap > 0 ? `Up to ${cap} ${cap === 1 ? "guest" : "guests"}` : "Guests"}
          </li>
          {size && (
            <li className="flex items-center gap-1">
              <Maximize className="size-3.5 text-neutral-500" aria-hidden />
              {size}
            </li>
          )}
        </ul>
        {v.amenities.length > 0 && (
          <p className="text-xs text-neutral-600">
            {v.amenities.slice(0, 4).map(facilityLabel).join(" · ")}
            {v.amenities.length > 4 && ` · +${v.amenities.length - 4} more`}
          </p>
        )}
        <div className="flex items-baseline gap-2 border-t border-neutral-100 pt-2.5">
          <span className={cn("text-lg font-bold tabular-nums", price > 0 ? "text-neutral-900" : "text-neutral-400")}>{price > 0 ? taka(price) : "৳—"}</span>
          {v.showCompare && was > price && price > 0 && <span className="text-sm tabular-nums text-neutral-500 line-through">{taka(was)}</span>}
          <span className="text-xs text-neutral-600">/ night</span>
        </div>
      </div>
    </div>
  );
}
