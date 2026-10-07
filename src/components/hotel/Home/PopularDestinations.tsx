import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";
import { destinations } from "@/src/data/hotelHome";
import SectionHeading from "./SectionHeading";

export default function PopularDestinations() {
  return (
    <section className="container py-10">
      <SectionHeading
        title="Popular Destinations"
        subtitle="Handpicked places travellers love across Bangladesh."
        href="/hotel-management/search"
      />

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {destinations.map((dest) => (
          <Link
            key={dest.name}
            href={`/hotel-management/search?location=${encodeURIComponent(dest.name)}`}
            className="group relative aspect-[3/4] overflow-hidden rounded-2xl bg-neutral-200 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
          >
            <img
              src={dest.image}
              alt={dest.name}
              className="absolute inset-0 size-full object-cover transition duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/85 via-neutral-950/20 to-transparent" />

            <span className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full bg-white/20 text-white opacity-0 backdrop-blur-md transition group-hover:opacity-100">
              <ArrowUpRight className="size-4" />
            </span>

            <div className="absolute inset-x-0 bottom-0 p-4 text-white">
              <p className="flex items-center gap-1 text-base font-bold md:text-lg">
                <MapPin className="size-4 shrink-0 text-amber-400" />
                {dest.name}
              </p>
              <p className="mt-0.5 line-clamp-1 text-xs text-white/80">{dest.tagline}</p>
              <span className="mt-2 inline-block rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-semibold backdrop-blur-sm">
                {dest.properties}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
