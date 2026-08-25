import Link from "next/link";
import { ChevronDown, ClipboardList, User } from "lucide-react";

const navLinks = [
  { label: "Home", href: "/hotel-management" },
  { label: "Hotels", href: "#" },
  { label: "Resorts", href: "#" },
  { label: "Cottages", href: "#" },
  { label: "Tour Packages", href: "#" },
  { label: "Car Rental", href: "#" },
  { label: "Bus Service", href: "#" },
  { label: "Flights", href: "#" },
  { label: "Offers", href: "#" },
];

export default function HotelHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-neutral-100 bg-white print:hidden">
      <div className="container flex items-center justify-between gap-4 py-3">
        <Link href="/hotel-management" className="flex items-center gap-2 shrink-0">
          <span className="text-2xl">🌴</span>
          <span className="flex flex-col leading-none">
            <span className="text-lg font-extrabold text-neutral-900">TripWave</span>
            <span className="text-[10px] font-medium text-neutral-500">
              Hotel &amp; Resort Booking
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-5 text-sm font-medium text-neutral-600 lg:flex">
          {navLinks.map((link, i) => (
            <Link
              key={link.label}
              href={link.href}
              className={
                i === 0
                  ? "border-b-2 border-sky-600 pb-4 -mb-4 text-sky-700"
                  : "hover:text-sky-700"
              }
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          <button className="hidden items-center gap-1 text-sm font-medium text-neutral-700 hover:text-sky-700 sm:flex">
            BDT <ChevronDown className="size-3.5" />
          </button>
          <Link
            href="/hotel-management/my-bookings"
            className="flex size-9 items-center justify-center rounded-full border border-neutral-300 text-neutral-600 hover:border-sky-600 hover:text-sky-700"
            aria-label="My Bookings"
          >
            <ClipboardList className="size-4.5" />
          </Link>
          <Link
            href="/auth/login"
            className="flex size-9 items-center justify-center rounded-full border border-neutral-300 text-neutral-600 hover:border-sky-600 hover:text-sky-700"
            aria-label="Login / Sign Up"
          >
            <User className="size-4.5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
