import { MapPin, ArrowRight } from "lucide-react";
import { destinations } from "@/src/data/hotelHome";

export default function PopularDestinations() {
  return (
    <section className="container py-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-neutral-900">Popular Destinations</h2>
        <a href="#" className="flex items-center gap-1 text-sm font-medium text-sky-700 hover:underline">
          View All <ArrowRight className="size-3.5" />
        </a>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
        {destinations.map((dest) => (
          <a key={dest.name} href="#" className="group">
            <div className="overflow-hidden rounded-xl">
              <img
                src={dest.image}
                alt={dest.name}
                className="aspect-square w-full object-cover transition group-hover:scale-105"
              />
            </div>
            <div className="mt-2 flex items-center gap-1 text-sm font-semibold text-neutral-900">
              <MapPin className="size-3.5 text-sky-600" />
              {dest.name}
            </div>
            <p className="text-xs text-neutral-500">{dest.properties}</p>
          </a>
        ))}
      </div>
    </section>
  );
}
