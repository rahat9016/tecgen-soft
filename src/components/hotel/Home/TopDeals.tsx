import Link from "next/link";
import { ArrowRight, CheckCircle2, MapPin, Star } from "lucide-react";
import { hotels } from "@/src/data/hotels";
import { amenityIcons } from "@/src/components/hotel/HotelDetails/AmenitiesGrid";
import { ratingLabel } from "@/src/components/hotel/shared/ratingLabel";
import SectionHeading from "./SectionHeading";

export default function TopDeals() {
  return (
    <section id="deals" className="container scroll-mt-24 py-10">
      <SectionHeading
        title="Top Deals for You"
        subtitle="Limited-time prices on our top-rated stays."
        href="/hotel-management/search?sort=price"
        linkLabel="View all deals"
      />

      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {hotels.map((hotel) => {
          const savings = hotel.originalPrice - hotel.price;
          return (
            <Link
              key={hotel.slug}
              href={`/hotel-management/hotel/${hotel.slug}`}
              className="group flex flex-col overflow-hidden rounded-2xl border border-neutral-200/70 bg-white shadow-sm transition hover:-translate-y-1 hover:border-sky-200 hover:shadow-xl"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={hotel.images[0]}
                  alt={hotel.name}
                  className="absolute inset-0 size-full object-cover transition duration-500 group-hover:scale-105"
                />
                <span className="absolute left-3 top-3 rounded-full bg-rose-600 px-2.5 py-1 text-xs font-bold text-white shadow-md">
                  -{hotel.discount}% OFF
                </span>
                <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-neutral-800 backdrop-blur-sm">
                  {hotel.category}
                </span>
              </div>

              <div className="flex flex-1 flex-col p-4">
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="flex items-center gap-1 rounded-md bg-sky-700 px-1.5 py-0.5 font-bold text-white">
                    <Star className="size-3 fill-white" /> {hotel.rating.toFixed(1)}
                  </span>
                  <span className="font-semibold text-neutral-800">{ratingLabel(hotel.rating)}</span>
                  <span className="text-neutral-400">&middot; {hotel.reviewsCount} reviews</span>
                </div>

                <h3 className="mt-2 font-bold text-neutral-900 transition group-hover:text-sky-700">
                  {hotel.name}
                </h3>
                <p className="mt-0.5 flex items-center gap-1 text-xs text-neutral-500">
                  <MapPin className="size-3.5" /> {hotel.location}
                </p>

                <ul className="mb-4 mt-3 flex flex-wrap gap-x-3 gap-y-1">
                  {hotel.amenities.slice(0, 3).map((amenity) => {
                    const Icon = amenityIcons[amenity] ?? CheckCircle2;
                    return (
                      <li key={amenity} className="flex items-center gap-1 text-[11px] text-neutral-600">
                        <Icon className="size-3.5 text-sky-600" />
                        {amenity}
                      </li>
                    );
                  })}
                </ul>

                <div className="mt-auto flex items-end justify-between gap-2 border-t border-neutral-100 pt-3">
                  <div>
                    <p className="text-xs text-neutral-400 line-through">
                      BDT {hotel.originalPrice.toLocaleString()}
                    </p>
                    <p className="text-lg font-extrabold leading-tight text-neutral-900">
                      BDT {hotel.price.toLocaleString()}
                      <span className="text-xs font-medium text-neutral-500"> /night</span>
                    </p>
                    <p className="mt-0.5 text-[11px] font-semibold text-emerald-700">
                      You save BDT {savings.toLocaleString()}
                    </p>
                  </div>
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-sky-600 text-white shadow-md shadow-sky-600/25 transition group-hover:bg-sky-700">
                    <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
