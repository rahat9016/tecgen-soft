"use client";

import Link from "next/link";
import { Brush, CalendarDays, ExternalLink, Eye, EyeOff, MoreHorizontal, Pencil, Wrench } from "lucide-react";
import { toast } from "react-toastify";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { housekeepingLabels } from "@/src/lib/hotel-store/format";
import { saveRoomType, setHousekeeping } from "@/src/lib/hotel-store/store";
import type { Housekeeping } from "@/src/lib/hotel-store/types";
import { cn } from "@/src/lib/utils";
import { ADMIN } from "../ui";
import { tonightStyles, webStyles, type Row, type Tonight, type Web } from "./model";

const chipClass = "inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset";

export function WebChip({ web }: { web: Web }) {
  const s = webStyles[web];
  return (
    <span className={cn(chipClass, s.chip)}>
      <span className={cn("size-1.5 rounded-full", s.dot)} aria-hidden /> {s.label}
    </span>
  );
}

/** Operational status, or tonight's booking state for rooms in service — always with a text label. */
export function TonightChip({ tonight }: { tonight: Tonight }) {
  const s = tonightStyles[tonight];
  return (
    <span className={cn(chipClass, s.chip)}>
      <span className={cn("size-1.5 rounded-full", s.dot)} aria-hidden /> {s.label}
    </span>
  );
}

/** Flags a room that needs cleaning before anyone can check in. */
export function HousekeepingChip({ row }: { row: Row }) {
  if (row.u.housekeeping !== "dirty" || row.tonight === "oos") return null;
  return (
    <span className={cn(chipClass, "bg-amber-50 text-amber-900 ring-amber-300")}>
      <Brush className="size-3" aria-hidden /> {housekeepingLabels.dirty}
    </span>
  );
}

/** Why a room is out of service, shown under its status. */
export function OosReason({ reason, className }: { reason?: string; className?: string }) {
  if (!reason) return null;
  return (
    <p className={cn("flex items-start gap-1.5 text-[13px] leading-snug text-amber-900", className)}>
      <Wrench className="mt-0.5 size-3.5 shrink-0" aria-hidden /> {reason}
    </p>
  );
}

const actionRing = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-1";

export const editClass =
  "inline-flex h-8 items-center justify-center gap-1.5 rounded-md border border-neutral-300 bg-white px-2.5 text-[13px] font-semibold text-neutral-800 transition hover:border-sky-500 hover:bg-sky-50 hover:text-sky-700 " + actionRing;

export function EditButton({ row }: { row: Row }) {
  return (
    <Link href={`${ADMIN}/rooms/${row.u.id}/edit`} className={editClass} aria-label={`Edit room ${row.u.number}`}>
      <Pencil className="size-3.5" aria-hidden />
      Edit
    </Link>
  );
}

/** Secondary actions, including housekeeping. Guest workflows stay on the booking pages. */
export function RoomMenu({ row }: { row: Row }) {
  const { u, t, web, booking } = row;
  const toggle = () => {
    if (!t) return;
    const res = saveRoomType({ ...t, active: !t.active });
    if (res.ok) toast.success(t.active ? `Room ${u.number} hidden from the website` : `Room ${u.number} published`);
    else toast.error(res.error);
  };
  const markHousekeeping = (hk: string) => {
    setHousekeeping(u.id, hk as Housekeeping);
    toast.success(`Room ${u.number} marked ${housekeepingLabels[hk as Housekeeping].toLowerCase()}`);
  };
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger
        aria-label={`More actions for room ${u.number}`}
        className={cn("inline-flex size-8 shrink-0 items-center justify-center rounded-md border border-neutral-300 bg-white text-neutral-700 transition hover:border-sky-500 hover:bg-sky-50 hover:text-sky-700 data-[state=open]:border-sky-500", actionRing)}
      >
        <MoreHorizontal className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={6} className="w-52 rounded-md">
        <DropdownMenuItem asChild className="cursor-pointer">
          <Link href={`${ADMIN}/rooms/${u.id}`}>
            <Eye /> View details
          </Link>
        </DropdownMenuItem>
        {booking && (
          <DropdownMenuItem asChild className="cursor-pointer">
            <Link href={`${ADMIN}/bookings/${booking.id}`}>
              <CalendarDays /> View booking
              <span className="ml-auto text-xs text-neutral-500">{booking.code}</span>
            </Link>
          </DropdownMenuItem>
        )}
        {web === "published" && t && (
          <DropdownMenuItem asChild className="cursor-pointer">
            <Link href={`/hotel-management/rooms/${t.id}`} target="_blank">
              <ExternalLink /> Preview on website
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs text-neutral-500">Housekeeping</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={u.housekeeping} onValueChange={markHousekeeping}>
          {(Object.keys(housekeepingLabels) as Housekeeping[]).map((hk) => (
            <DropdownMenuRadioItem key={hk} value={hk} className="cursor-pointer">
              {housekeepingLabels[hk]}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
        {web !== "draft" && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer" onSelect={toggle}>
              {web === "published" ? (
                <>
                  <EyeOff /> Hide from website
                </>
              ) : (
                <>
                  <Eye /> Publish on website
                </>
              )}
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
