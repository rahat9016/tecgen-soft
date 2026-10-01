"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Phone, X } from "lucide-react";
import { useTurfDB } from "@/src/lib/turf-store/store";
import { cn } from "@/src/lib/utils";
import { TurfLogo } from "./ui";

const links = [
  { href: "/turf", label: "Home" },
  { href: "/turf#about", label: "About" },
  { href: "/turf#services", label: "Service" },
  { href: "/turf#courts", label: "Court" },
  { href: "/turf/book", label: "Live Slots" },
  { href: "/turf/my-bookings", label: "My Bookings" },
];

/** Transparent over the home hero, solid green everywhere else. */
export default function TurfHeader() {
  const pathname = usePathname();
  const { settings } = useTurfDB();
  const [open, setOpen] = useState(false);
  const overlay = pathname === "/turf";

  return (
    <header className={cn("z-40 w-full", overlay ? "absolute inset-x-0 top-0" : "sticky top-0 bg-emerald-950")}>
      <div className="mx-auto flex h-20 max-w-7xl items-center gap-4 px-4 md:px-8">
        <Link href="/turf" aria-label="TurfHub home">
          <TurfLogo />
        </Link>

        <nav className="ml-6 hidden items-center gap-1.5 lg:flex">
          {links.map((l) => {
            const active = l.href === pathname;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "rounded-full px-4 py-2 text-sm transition",
                  active ? "bg-white text-emerald-950" : "bg-white/10 text-white ring-1 ring-white/10 backdrop-blur hover:bg-white/20"
                )}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <a
            href={`tel:${settings.phone.replace(/[^+\d]/g, "")}`}
            className="hidden items-center gap-2 rounded-full bg-white py-1 pl-4 pr-1 text-sm font-medium text-emerald-950 sm:flex"
          >
            Contact
            <span className="flex size-8 items-center justify-center rounded-full bg-emerald-800 text-white">
              <Phone className="size-4" />
            </span>
          </a>
          <Link href="/turf/book" className="hidden h-10 items-center rounded-full bg-lime-400 px-5 text-sm font-semibold text-emerald-950 hover:bg-lime-300 md:flex">
            Book now
          </Link>
          <button onClick={() => setOpen((o) => !o)} aria-label="Toggle menu" className="flex size-10 items-center justify-center rounded-full bg-white/10 text-white lg:hidden">
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="mx-4 mb-3 grid gap-1 rounded-2xl bg-emerald-950/95 p-2 ring-1 ring-white/10 backdrop-blur lg:hidden">
          {links.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="rounded-xl px-4 py-3 text-sm text-white hover:bg-white/10">
              {l.label}
            </Link>
          ))}
          <Link href="/turf/admin" onClick={() => setOpen(false)} className="rounded-xl px-4 py-3 text-sm text-lime-300 hover:bg-white/10">
            Admin panel
          </Link>
        </nav>
      )}
    </header>
  );
}
