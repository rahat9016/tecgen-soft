"use client";

import Link from "next/link";
import { ArrowRight, ArrowUpRight, Phone } from "lucide-react";
import { hourLabel } from "@/src/lib/turf-store/format";
import { useHydrated, useNow, useTurfDB } from "@/src/lib/turf-store/store";
import { useT } from "@/src/lib/turf-store/i18n";
import { cn } from "@/src/lib/utils";
import { TurfLogo, tbtn } from "./ui";

const explore = [
  { href: "/turf/book", label: "Book a slot" },
  { href: "/turf#how-it-works", label: "How it works" },
  { href: "/turf#ground", label: "The ground" },
  { href: "/turf/my-bookings", label: "My bookings" },
];

export default function TurfFooter() {
  const { settings } = useTurfDB();
  const t = useT();
  const hydrated = useHydrated();
  const now = useNow(60_000);
  const hour = new Date(now).getHours();
  const open = hydrated && hour >= settings.openHour && hour < settings.closeHour;
  const tel = settings.phone.replace(/[^+\d]/g, "");
  const directions = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.address)}`;

  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-[#021a12] text-emerald-100/70">
      <div className="mx-auto max-w-7xl px-4 pt-16 md:px-8 md:pt-20">
        <div className="grid gap-12 border-b border-white/10 pb-14 sm:grid-cols-3 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="sm:col-span-3 lg:col-span-1">
            <TurfLogo className="text-3xl" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed">{t("One football turf in Bashundhara. Check what's free, pay a small advance, and play.")}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/turf/book" className={tbtn.lime}>
                {t("Book a slot")} <ArrowRight className="size-4" />
              </Link>
              <a href={`tel:${tel}`} className="inline-flex h-11 items-center gap-2 rounded-full px-5 text-sm font-medium text-white ring-1 ring-white/20 transition hover:bg-white/10">
                <Phone className="size-4" /> {t("Call us")}
              </a>
            </div>
          </div>

          <nav aria-label={t("Footer")}>
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-emerald-100/40">{t("Explore")}</p>
            <ul className="mt-5 space-y-3 text-sm">
              {explore.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-white/85 transition hover:text-lime-300">
                    {t(l.label)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-emerald-100/40">{t("Visit")}</p>
            <address className="mt-5 text-sm not-italic leading-relaxed text-white/85">{settings.address}</address>
            <a href={directions} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-lime-300 hover:underline">
              {t("Get directions")} <ArrowUpRight className="size-4" />
            </a>
            <a href={`tel:${tel}`} className="mt-4 block text-sm text-white/85 transition hover:text-lime-300">
              {settings.phone}
            </a>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-emerald-100/40">{t("Hours")}</p>
            <p className="mt-5 text-sm text-white/85">
              {t("Every day, {from} – {to}", { from: hourLabel(settings.openHour), to: hourLabel(settings.closeHour) })}
            </p>
            <p className="mt-3 flex items-center gap-2 text-sm">
              <span className={cn("size-2 rounded-full", !hydrated ? "bg-white/30" : open ? "bg-lime-400" : "bg-rose-400")} />
              {!hydrated ? " " : open ? t("Open now · closes {time}", { time: hourLabel(settings.closeHour) }) : t("Closed · opens {time}", { time: hourLabel(settings.openHour) })}
            </p>
            <p className="mt-3 text-sm">{t("Floodlit after dark.")}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 py-6 text-xs text-emerald-100/50">
          <p>
            © {new Date().getFullYear()} TurfHub · {t("Demo — data is stored in your browser.")}
          </p>
          <Link href="/turf/admin" className="transition hover:text-lime-300">
            {t("Admin panel")}
          </Link>
        </div>
      </div>

      {/* Oversized wordmark bleeding off the bottom edge. */}
      <p aria-hidden className="pointer-events-none -mb-[3vw] select-none text-center text-[17vw] font-extrabold leading-[0.8] tracking-tighter text-white/[0.025]">
        TurfHub
      </p>
    </footer>
  );
}
