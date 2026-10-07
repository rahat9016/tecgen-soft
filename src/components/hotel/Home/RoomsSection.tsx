import Link from "next/link";
import { ArrowRight, BedDouble, CheckCircle2, Maximize, Users } from "lucide-react";
import { hotel, roomDiscount } from "@/src/data/hotels";
import { amenityIcons } from "@/src/components/hotel/HotelDetails/AmenitiesGrid";
import SectionHeading from "./SectionHeading";

export default function RoomsSection() {
  return (
    <section id="rooms" className="container scroll-mt-24 pb-4 pt-12">
      <SectionHeading
        title="Our Rooms"
        subtitle="Sea-view rooms for couples, families and everyone in between."
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
              className="group flex flex-col overflow-hidden rounded-2xl border border-neutral-200/70 bg-white shadow-sm transition hover:-translate-y-1 hover:border-sky-200 hover:shadow-xl"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={room.images[0]}
                  alt={room.name}
                  className="absolute inset-0 size-full object-cover transition duration-500 group-hover:scale-105"
                />
                {discount > 0 && (
                  <span className="absolute left-3 top-3 rounded-full bg-rose-600 px-2.5 py-1 text-xs font-bold text-white shadow-md">
                    -{discount}% OFF
                  </span>
                )}
              </div>

              <div className="flex flex-1 flex-col p-5">
                <h3 className="text-lg font-bold text-neutral-900 transition group-hover:text-sky-700">
                  {room.name}
                </h3>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-600">
                  <span className="flex items-center gap-1">
                    <Maximize className="size-3.5 text-neutral-400" /> {room.size}
                  </span>
                  <span className="flex items-center gap-1">
                    <BedDouble className="size-3.5 text-neutral-400" /> {room.beds}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="size-3.5 text-neutral-400" /> {room.capacity} guests
                  </span>
                </div>
                <p className="mt-3 line-clamp-2 text-sm text-neutral-600">{room.description}</p>

                <ul className="mb-4 mt-3 flex flex-wrap gap-x-3 gap-y-1">
                  {room.amenities.slice(0, 4).map((amenity) => {
                    const Icon = amenityIcons[amenity] ?? CheckCircle2;
                    return (
                      <li key={amenity} className="flex items-center gap-1 text-[11px] text-neutral-600">
                        <Icon className="size-3.5 text-sky-600" />
                        {amenity}
                      </li>
                    );
                  })}
                </ul>

                <div className="mt-auto flex items-end justify-between gap-2 border-t border-neutral-100 pt-4">
                  <div>
                    <p className="text-xs text-neutral-400 line-through">
                      BDT {room.originalPrice.toLocaleString()}
                    </p>
                    <p className="text-xl font-extrabold leading-tight text-neutral-900">
                      BDT {room.price.toLocaleString()}
                      <span className="text-xs font-medium text-neutral-500"> /night</span>
                    </p>
                  </div>
                  <span className="flex items-center gap-1 rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-sky-600/25 transition group-hover:bg-sky-700">
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
