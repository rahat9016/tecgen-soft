"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Phone, X } from "lucide-react";
import { useTurfDB } from "@/src/lib/turf-store/store";
import { useT } from "@/src/lib/turf-store/i18n";
import { cn } from "@/src/lib/utils";
import { LanguageSwitch, TurfLogo } from "./ui";

const links = [
  { href: "/turf", label: "Home" },
  { href: "/turf#how-it-works", label: "How it works" },
  { href: "/turf#ground", label: "The Ground" },
  { href: "/turf#gallery", label: "Gallery" },
  { href: "/turf/my-bookings", label: "My Bookings" },
];

/** Pages whose own dark top section runs behind the floating glass header; others get a solid header bar. */
const DARK_TOP = ["/turf", "/turf/my-bookings"];

/** Floating glass bar fixed over the page; turns more opaque once the page scrolls. */
export default function TurfHeader() {
  const pathname = usePathname();
  const { settings } = useTurfDB();
  const t = useT();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const glass = DARK_TOP.includes(pathname);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* Over dark heroes it floats as glass; on light pages it is a solid full-width bar. */}
      <header className={glass ? "fixed inset-x-0 top-0 z-40 px-3 pt-3 md:px-6" : "sticky top-0 z-40 bg-emerald-950"}>
        <div
          className={cn(
            "mx-auto flex max-w-7xl items-center gap-4 transition-all duration-300",
            !glass
              ? "h-20 px-4 md:px-8"
              : scrolled
                ? "bg-emerald-950/75 shadow-lg shadow-black/20 ring-white/15 backdrop-blur-xl backdrop-saturate-150"
                : // Home starts fully clear over the hero; the bar appears once the page scrolls.
                  pathname === "/turf"
                  ? "bg-transparent ring-transparent"
                  : "bg-white/[0.06] ring-white/15 backdrop-blur-xl backdrop-saturate-150",
            glass && "h-16 rounded-2xl px-3 ring-1 md:px-4"
          )}
        >
          <Link href="/turf" aria-label={t("TurfHub home")}>
            <TurfLogo />
          </Link>

          <nav className="ml-4 hidden items-center gap-1 lg:flex">
            {links.map((l) => {
              const active = l.href === pathname;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm transition",
                    active ? "bg-white text-emerald-950" : "text-white/80 hover:bg-white/10 hover:text-white"
                  )}
                >
                  {t(l.label)}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <LanguageSwitch dark />
            <a
              href={`tel:${settings.phone.replace(/[^+\d]/g, "")}`}
              className="hidden items-center gap-2 rounded-full bg-white py-1 pl-4 pr-1 text-sm font-medium text-emerald-950 sm:flex"
            >
              {t("Contact")}
              <span className="flex size-8 items-center justify-center rounded-full bg-emerald-800 text-white">
                <Phone className="size-4" />
              </span>
            </a>
            <Link
              href="/turf/book"
              className="hidden h-10 items-center rounded-full bg-lime-400 px-5 text-sm font-semibold text-emerald-950 hover:bg-lime-300 md:flex"
            >
              {t("Book now")}
            </Link>
            <button
              onClick={() => setOpen((o) => !o)}
              aria-label={t("Toggle menu")}
              className="flex size-10 items-center justify-center rounded-full bg-white/10 text-white lg:hidden"
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>

        {/* Floats below the bar so opening it never changes the header's height or pushes the page down. */}
        {open && (
          <nav
            className={cn(
              "absolute top-full mx-auto mt-2 grid max-w-7xl gap-1 rounded-2xl bg-emerald-950/95 p-2 shadow-xl shadow-black/30 ring-1 ring-white/15 backdrop-blur-xl lg:hidden",
              glass ? "inset-x-3 md:inset-x-6" : "inset-x-3"
            )}
          >
            {links.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="rounded-xl px-4 py-3 text-sm text-white hover:bg-white/10">
                {t(l.label)}
              </Link>
            ))}
            <Link href="/turf/admin" onClick={() => setOpen(false)} className="rounded-xl px-4 py-3 text-sm text-lime-300 hover:bg-white/10">
              {t("Admin panel")}
            </Link>
          </nav>
        )}
      </header>
      {open && <div aria-hidden onClick={() => setOpen(false)} className="fixed inset-0 z-30 bg-black/40 lg:hidden" />}
    </>
  );
}
