"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { roomDiscount } from "@/src/data/hotels";
import { useHotelSite } from "@/src/lib/hotel-store/store";
import SectionHeading from "./SectionHeading";

export default function RoomsSection() {
  const hotel = useHotelSite();
  return (
    <section id="rooms" className="container scroll-mt-24 pb-4 pt-12">
      <SectionHeading
        title="Our Rooms"
        hideSubtitleOnMobile
        subtitle={`From great-value twins to top-floor ocean suites — ${hotel.rooms.length} room types to choose from.`}
        href="/hotel-management/rooms"
        linkLabel="View all rooms"
      />

      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {hotel.rooms.map((room) => {
          const discount = roomDiscount(room);
          return (
            <Link
              key={room.id}
              href={`/hotel-management/rooms/${room.id}`}
              className="group flex flex-col overflow-hidden rounded-md border border-neutral-200/70 bg-white shadow-sm transition hover:-translate-y-1 hover:border-sky-200 hover:shadow-xl"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={room.images[0]}
                  alt={room.name}
                  className="absolute inset-0 size-full object-cover transition duration-500 group-hover:scale-105"
                />
                {discount > 0 && (
                  <span className="absolute left-3 top-3 rounded-md bg-sky-600 px-2.5 py-1 text-xs font-bold text-white shadow-md">
                    -{discount}% OFF
                  </span>
                )}
              </div>

              <div className="flex flex-1 flex-col p-5">
                <h3 className="text-lg font-bold text-neutral-900 transition group-hover:text-sky-700">
                  {room.name}
                </h3>
                <p className="mb-4 mt-2 line-clamp-2 text-sm text-neutral-600">{room.description}</p>


                <div className="mt-auto flex items-end justify-between gap-2 border-t border-neutral-100 pt-4">
                  <div>
                    <p className="text-xs text-neutral-400 line-through">
                      BDT {room.originalPrice.toLocaleString()}
                    </p>
                    <p className="text-xl font-semibold leading-tight text-neutral-900">
                      BDT {room.price.toLocaleString()}
                      <span className="text-xs font-medium text-neutral-500"> /night</span>
                    </p>
                  </div>
                  <span className="flex items-center gap-1 rounded-md bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-sky-600/25 transition group-hover:bg-sky-700">
                    View room <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
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
