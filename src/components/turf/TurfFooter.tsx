"use client";

import Link from "next/link";
import { Clock, MapPin, Phone } from "lucide-react";
import { hourLabel } from "@/src/lib/turf-store/format";
import { useTurfDB } from "@/src/lib/turf-store/store";
import { TurfLogo } from "./ui";

export default function TurfFooter() {
  const { settings, courts } = useTurfDB();
  return (
    <footer className="bg-emerald-950 text-emerald-100/80">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-4 md:px-8">
        <div className="md:col-span-2">
          <TurfLogo className="text-3xl" />
          <p className="mt-4 max-w-sm text-sm leading-relaxed">
            Book premium sports turfs and courts in minutes. Live availability, instant advance payment and a
            confirmed slot — no phone calls, no double bookings.
          </p>
        </div>
        <div>
          <p className="mb-4 text-sm font-semibold text-white">Courts</p>
          <ul className="space-y-2 text-sm">
            {courts.filter((c) => c.active).map((c) => (
              <li key={c.id}>
                <Link href={`/turf/book?court=${c.id}`} className="hover:text-lime-300">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="space-y-3 text-sm">
          <p className="mb-4 font-semibold text-white">Visit us</p>
          <p className="flex gap-2">
            <MapPin className="mt-0.5 size-4 shrink-0 text-lime-400" /> {settings.address}
          </p>
          <p className="flex gap-2">
            <Phone className="mt-0.5 size-4 shrink-0 text-lime-400" /> {settings.phone}
          </p>
          <p className="flex gap-2">
            <Clock className="mt-0.5 size-4 shrink-0 text-lime-400" /> Daily {hourLabel(settings.openHour)} – {hourLabel(settings.closeHour)}
          </p>
          <Link href="/turf/admin" className="inline-block pt-2 text-lime-300 hover:underline">
            Admin panel →
          </Link>
        </div>
      </div>
      <p className="border-t border-white/10 py-5 text-center text-xs text-emerald-100/50">© {new Date().getFullYear()} TurfHub. Demo — data is stored in your browser.</p>
    </footer>
  );
}
