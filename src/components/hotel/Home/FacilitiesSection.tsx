import { CheckCircle2 } from "lucide-react";
import { hotel } from "@/src/data/hotels";
import { facilityDetails } from "@/src/data/hotelHome";
import { amenityIcons } from "@/src/components/hotel/HotelDetails/AmenitiesGrid";
import SectionHeading from "./SectionHeading";

/** Soft colour blobs, a faded dot grid and sea waves — gives the glass cards something to blur. */
function FacilitiesBackdrop() {
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-0 size-full"
      viewBox="0 0 1440 720"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <filter id="fac-blur" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="70" />
        </filter>
        <pattern id="fac-dots" width="22" height="22" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1.6" fill="#0c4a6e" fillOpacity="0.07" />
        </pattern>
        <radialGradient id="fac-dots-fade" cx="50%" cy="45%" r="60%">
          <stop offset="0%" stopColor="white" />
          <stop offset="100%" stopColor="black" />
        </radialGradient>
        <mask id="fac-dots-mask">
          <rect width="1440" height="720" fill="url(#fac-dots-fade)" />
        </mask>
        <linearGradient id="fac-wave" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7dd3fc" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.05" />
        </linearGradient>
      </defs>

      <g filter="url(#fac-blur)">
        <circle cx="200" cy="200" r="190" fill="#7dd3fc" fillOpacity="0.28" />
        <circle cx="1220" cy="160" r="210" fill="#bae6fd" fillOpacity="0.3" />
        <circle cx="760" cy="430" r="230" fill="#a5f3fc" fillOpacity="0.22" />
        <circle cx="1320" cy="560" r="150" fill="#bae6fd" fillOpacity="0.25" />
        <circle cx="420" cy="600" r="160" fill="#c7d2fe" fillOpacity="0.2" />
      </g>

      <rect width="1440" height="720" fill="url(#fac-dots)" mask="url(#fac-dots-mask)" />

      <path
        d="M0 610 C 180 570 360 650 540 612 S 900 560 1080 604 S 1320 650 1440 618 V 720 H 0 Z"
        fill="url(#fac-wave)"
      />
      <path
        d="M0 650 C 200 615 380 690 600 652 S 980 610 1180 648 S 1380 680 1440 662"
        fill="none"
        stroke="#38bdf8"
        strokeOpacity="0.18"
        strokeWidth="2"
      />
      <path
        d="M0 684 C 220 655 420 715 640 686 S 1000 650 1220 682 S 1400 705 1440 694"
        fill="none"
        stroke="#0ea5e9"
        strokeOpacity="0.1"
        strokeWidth="2"
      />
    </svg>
  );
}

export default function FacilitiesSection() {
  return (
    <section id="facilities" className="relative mt-10 scroll-mt-24 overflow-hidden bg-white py-14 md:py-20">
      <FacilitiesBackdrop />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white to-transparent" />

      <div className="container relative">
        <SectionHeading
          title="Hotel Facilities"
          subtitle={`Everything included with your stay at ${hotel.name}.`}
        />

        <ul className="mt-8 grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-5">
          {hotel.amenities.map((amenity) => {
            const Icon = amenityIcons[amenity] ?? CheckCircle2;
            return (
              <li
                key={amenity}
                className="group rounded-3xl border border-white/80 bg-white/40 p-4 shadow-[0_8px_32px_rgba(12,74,110,0.08),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-xl backdrop-saturate-150 transition duration-300 hover:-translate-y-1 hover:bg-white/60 hover:shadow-[0_16px_40px_rgba(12,74,110,0.14),inset_0_1px_0_rgba(255,255,255,0.9)] md:p-5"
              >
                <span className="flex size-11 items-center justify-center rounded-2xl bg-white/70 text-sky-600 shadow-sm ring-1 ring-white transition duration-300 group-hover:bg-sky-600 group-hover:text-white group-hover:ring-sky-600 md:size-12">
                  <Icon className="size-5 md:size-6" />
                </span>
                <p className="mt-4 text-sm font-semibold text-neutral-900 md:text-base">{amenity}</p>
                {facilityDetails[amenity] && (
                  <p className="mt-1 text-xs leading-relaxed text-neutral-600">{facilityDetails[amenity]}</p>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
