"use client";

import { useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardList } from "lucide-react";
import HotelProfileMenu from "./HotelProfileMenu";

const navLinks = [
  { label: "Home", href: "/hotel-management" },
  { label: "Hotels", href: "#" },
  { label: "Resorts", href: "#" },
  { label: "Cottages", href: "#" },
  { label: "Offers", href: "#" },
];

const subscribeToScroll = (onChange: () => void) => {
  window.addEventListener("scroll", onChange, { passive: true });
  return () => window.removeEventListener("scroll", onChange);
};

// Height comes from --hotel-header-h (set in the hotel layout) so the home hero can slide under it.
export default function HotelHeader() {
  const scrolled = useSyncExternalStore(
    subscribeToScroll,
    () => window.scrollY > 8,
    () => false
  );
  // Home floats a rounded glass bar over the photo hero; other pages get an always-on full-width bar.
  const isHome = usePathname() === "/hotel-management";
  const onDark = isHome && !scrolled;

  const glass = "bg-white/80 backdrop-blur-2xl backdrop-saturate-[1.8]";
  const fade =
    "transition-[background-color,border-color,box-shadow,backdrop-filter] duration-300";

  return (
    <header
      className={`sticky top-0 z-30 print:hidden ${
        isHome ? "h-(--hotel-header-h) pt-3 md:pt-4" : "h-16 md:h-18"
      }`}
    >
      <div
        className={
          isHome
            ? "h-full"
            : `h-full border-b border-neutral-200/70 shadow-sm ${glass}`
        }
      >
        <div className="container h-full">
          <div
            className={
              isHome
                ? `flex h-full items-center justify-between gap-4 rounded-2xl border px-3 md:px-5 ${fade} ${
                    scrolled
                      ? `border-white/60 shadow-[0_8px_32px_rgba(15,23,42,0.12),inset_0_1px_0_rgba(255,255,255,0.8)] ${glass}`
                      : "border-transparent bg-transparent"
                  }`
                : "flex h-full items-center justify-between gap-4"
            }
          >
            <Link
              href="/hotel-management"
              className="relative shrink-0"
              aria-label="TripWave home"
            >
              <Image
                src="/TripWaveLogo.webp"
                alt="TripWave — Hotel & Resort Booking"
                width={614}
                height={192}
                loading="eager"
                className={`h-10 w-auto transition-opacity duration-300 md:h-12 ${
                  onDark ? "opacity-0" : "opacity-100"
                }`}
              />
              <Image
                src="/TripWaveLogo-light.webp"
                alt=""
                aria-hidden
                width={614}
                height={192}
                loading="eager"
                className={`absolute inset-0 h-10 w-auto transition-opacity duration-300 md:h-12 ${
                  onDark ? "opacity-100" : "opacity-0"
                }`}
              />
            </Link>

            <nav
              className={`hidden items-center gap-1 text-sm font-medium transition-colors lg:flex ${
                onDark ? "text-white/90" : "text-neutral-700"
              }`}
            >
              {navLinks.map((link, i) => {
                const active = i === 0;
                const tone = onDark
                  ? active
                    ? "bg-white/15 font-semibold text-white"
                    : "hover:bg-white/10 hover:text-white"
                  : active
                    ? "bg-sky-600/10 font-semibold text-sky-700"
                    : "hover:bg-white/70 hover:text-sky-700";
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    className={`rounded-full px-4 py-2 transition ${tone}`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            <div className="flex shrink-0 items-center gap-2 md:gap-3">
              <Link
                href="/hotel-management/my-bookings"
                className={`flex size-10 items-center justify-center rounded-full border transition ${
                  onDark
                    ? "border-white/30 bg-white/10 text-white hover:bg-white/20"
                    : "border-neutral-900/10 bg-white/60 text-neutral-700 hover:bg-white/80 hover:text-sky-700"
                }`}
                aria-label="My Bookings"
              >
                <ClipboardList className="size-4.5" />
              </Link>
              <HotelProfileMenu onDark={onDark} />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
