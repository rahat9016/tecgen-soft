import { CheckCircle2 } from "lucide-react";
import { hotel } from "@/src/data/hotels";
import { facilityDetails } from "@/src/data/hotelHome";
import { amenityIcons } from "@/src/components/hotel/HotelDetails/AmenitiesGrid";
import SectionHeading from "./SectionHeading";

export default function FacilitiesSection() {
  return (
    <section id="facilities" className="container scroll-mt-24 py-10">
      <SectionHeading
        title="Hotel Facilities"
        subtitle={`Everything included with your stay at ${hotel.name}.`}
      />

      <div className="relative mt-6 overflow-hidden rounded-3xl bg-gradient-to-br from-sky-50 via-white to-amber-50/60 p-3 ring-1 ring-sky-100 md:p-5">
        <div className="pointer-events-none absolute -right-20 -top-20 size-64 rounded-full bg-sky-200/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-16 size-64 rounded-full bg-amber-200/30 blur-3xl" />

        <ul className="relative grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-5">
          {hotel.amenities.map((amenity) => {
            const Icon = amenityIcons[amenity] ?? CheckCircle2;
            return (
              <li
                key={amenity}
                className="group rounded-2xl bg-white/90 p-4 shadow-sm ring-1 ring-neutral-200/60 backdrop-blur-sm transition hover:-translate-y-1 hover:shadow-lg hover:ring-sky-200 md:p-5"
              >
                <span className="flex size-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 transition duration-300 group-hover:bg-sky-600 group-hover:text-white md:size-12">
                  <Icon className="size-5 md:size-6" />
                </span>
                <p className="mt-4 text-sm font-semibold text-neutral-900 md:text-base">{amenity}</p>
                {facilityDetails[amenity] && (
                  <p className="mt-1 text-xs leading-relaxed text-neutral-500">{facilityDetails[amenity]}</p>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
