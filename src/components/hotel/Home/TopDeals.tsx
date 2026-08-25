import Link from "next/link";
import { Heart, Star, ArrowRight } from "lucide-react";
import { hotels } from "@/src/data/hotels";

const badgeColors = ["bg-orange-500", "bg-emerald-600", "bg-emerald-600", "bg-orange-500"];

export default function TopDeals() {
  return (
    <section id="deals" className="container scroll-mt-20 py-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-neutral-900">Top Deals for You</h2>
        <Link href="/hotel-management/search" className="flex items-center gap-1 text-sm font-medium text-sky-700 hover:underline">
          View All Deals <ArrowRight className="size-3.5" />
        </Link>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {hotels.map((hotel, i) => (
          <Link
            key={hotel.slug}
            href={`/hotel-management/hotel/${hotel.slug}`}
            className="overflow-hidden rounded-xl border border-neutral-100 bg-white shadow-sm transition hover:shadow-md"
          >
            <div className="relative">
              <img
                src={hotel.images[0]}
                alt={hotel.name}
                className="aspect-[4/3] w-full object-cover"
              />
              <span
                className={`absolute left-2 top-2 rounded-full ${badgeColors[i % badgeColors.length]} px-2 py-0.5 text-xs font-bold text-white`}
              >
                -{hotel.discount}%
              </span>
              <span className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full bg-white/90 text-neutral-500">
                <Heart className="size-3.5" />
              </span>
              <span className="absolute -bottom-3 left-3 flex items-center gap-1 rounded-full bg-white px-2 py-1 text-xs font-semibold text-neutral-800 shadow">
                <Star className="size-3.5 fill-amber-400 text-amber-400" />
                {hotel.rating}
                <span className="font-normal text-neutral-400">({hotel.reviewsCount})</span>
              </span>
            </div>

            <div className="p-4 pt-5">
              <p className="font-semibold text-neutral-900">{hotel.name}</p>
              <p className="text-xs text-neutral-500">{hotel.location}</p>

              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-base font-bold text-neutral-900">
                  BDT {hotel.price.toLocaleString()}
                </span>
                <span className="text-xs text-neutral-400 line-through">
                  BDT {hotel.originalPrice.toLocaleString()}
                </span>
                <span className="text-xs text-neutral-500">/night</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
