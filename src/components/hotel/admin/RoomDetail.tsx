"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, BedDouble, Building2, CalendarDays, CheckCircle2, Eye, EyeOff, ImageOff, Layers, Maximize2, Pencil, Star, Users, X } from "lucide-react";
import { amenityIcons } from "@/src/components/hotel/HotelDetails/AmenitiesGrid";
import { dateLabel, rangeLabel, taka, todayKey } from "@/src/lib/hotel-store/format";
import { roomRating, unitToday, useHotelDB } from "@/src/lib/hotel-store/store";
import { cn } from "@/src/lib/utils";
import { ADMIN, Card, Empty, hbtn, linkClass, StatusBadge } from "./ui";

const floorLabel = (f: number) => (f === 0 ? "Ground floor" : `Floor ${f}`);

function Panel({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <Card className={cn("p-0", className)}>
      <h2 className="border-b border-neutral-100 px-5 py-3.5 font-semibold text-neutral-900">{title}</h2>
      <div className="p-5">{children}</div>
    </Card>
  );
}

function Fact({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 rounded-md border border-neutral-100 bg-neutral-50/60 p-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-white text-sky-600 shadow-sm">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] text-neutral-500">{label}</p>
        <p className="truncate text-sm font-semibold text-neutral-900">{value || "—"}</p>
      </div>
    </div>
  );
}

/** Read-only view of one room: photos, what guests see, and who is in it. */
export default function RoomDetail({ id }: { id: string }) {
  const db = useHotelDB();
  const [photo, setPhoto] = useState(0);
  const unit = db.units.find((u) => u.id === id);

  if (!unit) {
    return (
      <Card>
        <Empty icon={X} title="Room not found">
          <Link href={`${ADMIN}/rooms`} className={hbtn.outline}>
            Back
          </Link>
        </Empty>
      </Card>
    );
  }

  const today = todayKey();
  const t = db.roomTypes.find((r) => r.id === unit.typeId);
  const { occupant } = unitToday(db, unit.id, today);
  const rating = t ? roomRating(db, t.id) : { rating: 0, reviewsCount: 0 };
  const sameType = t ? db.units.filter((u) => u.typeId === t.id && u.id !== unit.id) : [];
  const upcoming = db.bookings
    .filter((b) => b.unitIds.includes(unit.id) && ["pending", "confirmed"].includes(b.status) && b.checkOut > today)
    .sort((a, b) => a.checkIn.localeCompare(b.checkIn))
    .slice(0, 5);
  const images = t?.images ?? [];
  const main = images[Math.min(photo, images.length - 1)];

  const status = unit.outOfService
    ? { label: "Not available", className: "bg-neutral-100 text-neutral-600", icon: X }
    : occupant
      ? { label: "Guest staying", className: "bg-emerald-600 text-white", icon: Users }
      : { label: "Free tonight", className: "bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-200", icon: CheckCircle2 };

  return (
    <div>
      <Card className="flex flex-wrap items-center justify-between gap-4 p-5">
        <div className="flex items-center gap-4">
          <Link
            href={`${ADMIN}/rooms`}
            aria-label="Back to rooms"
            className="flex size-10 shrink-0 items-center justify-center rounded-md border border-neutral-200 text-neutral-500 transition hover:border-sky-300 hover:text-sky-700"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold text-neutral-900">Room {unit.number}</h1>
              <span className={cn("flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold", status.className)}>
                <status.icon className="size-3" /> {status.label}
              </span>
            </div>
            <p className="mt-0.5 text-sm text-neutral-500">
              {floorLabel(unit.floor)}
              {t && ` · ${[t.beds, `sleeps ${t.capacity}`].filter(Boolean).join(" · ")}`}
            </p>
          </div>
        </div>
        <Link href={`${ADMIN}/rooms/${unit.id}/edit`} className={hbtn.primary}>
          <Pencil className="size-4" /> Edit room
        </Link>
      </Card>

      <div className="mt-6 grid items-start gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <Card className="overflow-hidden p-0">
            <div className="relative aspect-video bg-neutral-100">
              {main ? (
                // eslint-disable-next-line @next/next/no-img-element -- admin preview
                <img src={main} alt={t?.name ?? ""} className={cn("size-full object-cover", t && !t.active && "grayscale")} />
              ) : (
                <div className="flex size-full flex-col items-center justify-center gap-2 text-sm text-neutral-400">
                  <ImageOff className="size-8" /> No photos yet
                </div>
              )}
              {t?.highlight && <span className="absolute left-4 top-4 rounded-md bg-sky-600 px-2.5 py-1 text-xs font-semibold text-white">{t.highlight}</span>}
              {images.length > 0 && (
                <span className="absolute bottom-4 right-4 rounded-md bg-black/55 px-2 py-1 text-xs font-medium text-white">
                  {Math.min(photo, images.length - 1) + 1} / {images.length}
                </span>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto p-3">
                {images.map((src, i) => (
                  <button
                    key={`${i}-${src}`}
                    type="button"
                    onClick={() => setPhoto(i)}
                    aria-label={`Show photo ${i + 1}`}
                    className={cn("h-16 w-24 shrink-0 overflow-hidden rounded-md ring-2 transition", i === photo ? "ring-sky-500" : "ring-transparent opacity-70 hover:opacity-100")}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element -- thumbnail */}
                    <img src={src} alt="" className="size-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </Card>

          <Panel title="Room info">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <Fact icon={BedDouble} label="Bed type" value={t?.beds} />
              <Fact icon={Maximize2} label="Room size" value={t?.size} />
              <Fact icon={Users} label="Max guests" value={t ? `${t.capacity} guests` : undefined} />
              <Fact icon={Layers} label="Floor" value={floorLabel(unit.floor)} />
            </div>
            {t?.description && <p className="mt-5 text-sm leading-relaxed text-neutral-600">{t.description}</p>}
          </Panel>

          <Panel title={`Facilities${t?.amenities.length ? ` (${t.amenities.length})` : ""}`}>
            {t?.amenities.length ? (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {t.amenities.map((a) => {
                  const Icon = amenityIcons[a] ?? CheckCircle2;
                  return (
                    <span key={a} className="flex items-center gap-2 rounded-md border border-neutral-100 px-3 py-2 text-sm text-neutral-700">
                      <Icon className="size-4 shrink-0 text-sky-600" /> {a}
                    </span>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-neutral-400">No facilities added yet.</p>
            )}
          </Panel>
        </div>

        <div className="space-y-6 xl:sticky xl:top-24">
          <Panel title="Price">
            <p className="text-3xl font-bold tabular-nums text-neutral-900">
              {t ? taka(t.price) : "—"}
              <span className="text-sm font-normal text-neutral-500"> /night</span>
            </p>
            {t && t.originalPrice > t.price && (
              <p className="mt-1 text-sm text-neutral-500">
                Regular price <span className="line-through">{taka(t.originalPrice)}</span>
              </p>
            )}
            <div className="mt-4 space-y-2.5 border-t border-neutral-100 pt-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-neutral-500">Website</span>
                {t?.active ? (
                  <span className="flex items-center gap-1 font-medium text-emerald-700">
                    <Eye className="size-4" /> Shown
                  </span>
                ) : (
                  <span className="flex items-center gap-1 font-medium text-neutral-500">
                    <EyeOff className="size-4" /> Hidden
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-500">Guest rating</span>
                <span className="flex items-center gap-1 font-medium text-neutral-800">
                  <Star className="size-4 fill-amber-400 text-amber-400" />
                  {rating.reviewsCount ? `${rating.rating} (${rating.reviewsCount} reviews)` : "No reviews yet"}
                </span>
              </div>
            </div>
          </Panel>

          <Panel title="Today">
            {unit.outOfService ? (
              <p className="text-sm text-neutral-600">This room can&rsquo;t be booked right now.</p>
            ) : occupant ? (
              <div className="text-sm">
                <p className="font-medium text-neutral-900">{occupant.guest.name}</p>
                <p className="text-neutral-500">Leaving {dateLabel(occupant.checkOut)}</p>
                <Link href={`${ADMIN}/bookings/${occupant.id}`} className={cn(linkClass, "mt-2 inline-block text-sm")}>
                  View booking {occupant.code}
                </Link>
              </div>
            ) : (
              <p className="text-sm text-neutral-600">No guest in this room right now.</p>
            )}
          </Panel>

          <Panel title="Upcoming bookings">
            {upcoming.length ? (
              <ul className="-my-2 divide-y divide-neutral-100">
                {upcoming.map((b) => (
                  <li key={b.id}>
                    <Link href={`${ADMIN}/bookings/${b.id}`} className="flex items-center justify-between gap-3 py-2.5 text-sm transition hover:text-sky-700">
                      <span className="min-w-0">
                        <span className="block truncate font-medium text-neutral-900">{b.guest.name}</span>
                        <span className="flex items-center gap-1 text-xs text-neutral-500">
                          <CalendarDays className="size-3" /> {rangeLabel(b.checkIn, b.checkOut)}
                        </span>
                      </span>
                      <StatusBadge status={b.status} />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-neutral-400">No upcoming bookings for this room.</p>
            )}
          </Panel>

          {sameType.length > 0 && (
            <Panel title="Rooms with the same details">
              <div className="flex flex-wrap gap-1.5">
                {sameType.map((u) => (
                  <Link
                    key={u.id}
                    href={`${ADMIN}/rooms/${u.id}`}
                    className="flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold text-neutral-700 ring-1 ring-inset ring-neutral-200 transition hover:text-sky-700 hover:ring-sky-400"
                  >
                    <Building2 className="size-3 text-neutral-400" /> {u.number}
                  </Link>
                ))}
              </div>
            </Panel>
          )}
        </div>
      </div>
    </div>
  );
}
