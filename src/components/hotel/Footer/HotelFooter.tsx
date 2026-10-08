import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck,
  Clock3,
  Facebook,
  Instagram,
  Mail,
  MapPin,
  Phone,
  Star,
  Twitter,
  Youtube,
} from "lucide-react";
import { footerLinks, paymentMethods } from "@/src/data/hotelHome";
import { hotel } from "@/src/data/hotels";
import { parseCheckTimes } from "@/src/components/hotel/HotelDetails/PoliciesSection";
import { ratingLabel } from "@/src/components/hotel/shared/ratingLabel";

const socials = [
  { label: "Facebook", icon: Facebook },
  { label: "Instagram", icon: Instagram },
  { label: "Twitter", icon: Twitter },
  { label: "YouTube", icon: Youtube },
];

const headingClass = "text-sm font-semibold uppercase tracking-wider text-white";

// The arrow slides in on hover while the label shifts right to make room for it.
function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="group inline-flex items-center gap-1.5 text-sky-200/80 transition hover:text-white">
      <ArrowRight className="size-3 -translate-x-1 opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100" />
      <span className="-ml-4.5 transition-[margin] group-hover:ml-0">{children}</span>
    </Link>
  );
}

export default function HotelFooter() {
  const times = parseCheckTimes(hotel.policies);
  const phoneDisplay = hotel.phone.replace(/^\+880(\d{4})(\d+)$/, "+880 $1-$2");

  return (
    <footer className="relative mt-16 overflow-hidden bg-gradient-to-b from-sky-950 to-slate-950 text-sky-100 print:hidden">
      {/* Wave edge: the page's white flows into the footer. */}
      <svg
        aria-hidden
        className="absolute inset-x-0 top-0 h-10 w-full text-white md:h-14"
        viewBox="0 0 1440 56"
        preserveAspectRatio="none"
      >
        <path d="M0 0H1440V20C1200 56 960 2 720 26S240 6 0 30Z" fill="currentColor" />
      </svg>
      <div className="pointer-events-none absolute -left-32 top-24 size-96 rounded-full bg-sky-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-0 size-80 rounded-full bg-cyan-400/10 blur-3xl" />

      <div className="container relative grid gap-12 pb-12 pt-20 md:pt-24 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <Image
            src="/TripWaveLogo-light.webp"
            alt="TripWave — Hotel & Resort Booking"
            width={614}
            height={192}
            className="h-14 w-auto"
          />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-sky-200/80">
            {hotel.name} — sea-view rooms on Marine Drive, {hotel.location}. Steps from the
            beach, with breakfast, pool and 24/7 room service.
          </p>

          <div className="mt-5 inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 py-2 pl-2 pr-4 backdrop-blur-sm">
            <span className="flex size-10 items-center justify-center rounded-xl rounded-bl-none bg-sky-500 text-sm font-bold text-white">
              {hotel.rating.toFixed(1)}
            </span>
            <span className="text-sm">
              <span className="flex items-center gap-1 font-semibold text-white">
                {ratingLabel(hotel.rating)}
                <Star className="size-3.5 fill-amber-400 text-amber-400" />
              </span>
              <span className="text-xs text-sky-200/70">{hotel.reviewsCount} guest reviews</span>
            </span>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <Link
              href="/hotel-management/rooms"
              className="flex items-center gap-1.5 rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition hover:bg-sky-400"
            >
              <CalendarCheck className="size-4" /> Book a room
            </Link>
            <a
              href={`tel:${hotel.phone}`}
              className="flex items-center gap-1.5 rounded-xl border border-white/15 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              <Phone className="size-4" /> Call us
            </a>
          </div>

          <div className="mt-6 flex items-center gap-2">
            {socials.map(({ label, icon: Icon }) => (
              <a
                key={label}
                href="#"
                aria-label={label}
                className="flex size-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sky-100 transition hover:-translate-y-0.5 hover:border-sky-400 hover:bg-sky-500 hover:text-white"
              >
                <Icon className="size-4" />
              </a>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 text-sm md:grid-cols-4 lg:col-span-8">
          <div>
            <p className={headingClass}>Explore</p>
            <ul className="mt-4 space-y-2.5">
              {footerLinks.explore.map((link) => (
                <li key={link.label}>
                  <FooterLink href={link.href}>{link.label}</FooterLink>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className={headingClass}>Our Rooms</p>
            <ul className="mt-4 space-y-2.5">
              {hotel.rooms.map((room) => (
                <li key={room.id}>
                  <FooterLink href={`/hotel-management/rooms/${room.id}`}>{room.name}</FooterLink>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className={headingClass}>Support</p>
            <ul className="mt-4 space-y-2.5">
              {footerLinks.support.map((label) => (
                <li key={label}>
                  <FooterLink href="#">{label}</FooterLink>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-2 md:col-span-1">
            <p className={headingClass}>Contact</p>
            <ul className="mt-4 space-y-3 text-sky-200/80">
              <li>
                <a href={`tel:${hotel.phone}`} className="flex items-start gap-2.5 transition hover:text-white">
                  <Phone className="mt-0.5 size-4 shrink-0 text-sky-400" /> {phoneDisplay}
                </a>
              </li>
              <li>
                <a href="mailto:info@tripwave.com" className="flex items-start gap-2.5 transition hover:text-white">
                  <Mail className="mt-0.5 size-4 shrink-0 text-sky-400" /> info@tripwave.com
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 size-4 shrink-0 text-sky-400" /> {hotel.address}
              </li>
              {times && (
                <li className="flex items-start gap-2.5">
                  <Clock3 className="mt-0.5 size-4 shrink-0 text-sky-400" />
                  <span>
                    Check-in {times.checkIn}
                    <br />
                    Check-out {times.checkOut}
                  </span>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>

      <div className="relative border-t border-white/10">
        <div className="container flex flex-col items-center justify-between gap-4 py-5 text-xs text-sky-200/60 md:flex-row">
          <p>© {new Date().getFullYear()} {hotel.name}. All rights reserved.</p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="mr-1">We accept</span>
            {paymentMethods.map((method) => (
              <span
                key={method.name}
                title={method.name}
                className="flex h-10 w-16 items-center justify-center rounded-lg bg-white px-1.5 shadow-sm"
              >
                <Image
                  src={method.logo}
                  alt={method.name}
                  width={64}
                  height={40}
                  className="max-h-7 w-auto object-contain"
                />
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
