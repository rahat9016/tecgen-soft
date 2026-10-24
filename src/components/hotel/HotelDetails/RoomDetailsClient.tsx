"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { BadgeCheck, BedDouble, Coffee, DoorOpen, MapPin, Maximize, Phone, Share2, Users } from "lucide-react";
import { availableRooms, type Hotel, type RoomType } from "@/src/data/hotels";
import { parseDayKey, toDayKey } from "@/src/lib/hotelDates";
import { useAppDispatch } from "@/src/lib/redux/hooks";
import { setSelection } from "@/src/lib/redux/features/hotelBooking/hotelBookingSlice";
import type { GuestsRoomsValue } from "@/src/components/hotel/shared/GuestsRoomsField";
import Gallery from "./Gallery";
import AmenitiesGrid from "./AmenitiesGrid";
import OtherRooms from "./OtherRooms";
import ReviewsSection from "./ReviewsSection";
import PoliciesSection from "./PoliciesSection";
import LocationCard from "@/src/components/hotel/shared/LocationCard";
import BookingSidebar from "./BookingSidebar";

const sections = [
  { id: "overview", label: "Overview" },
  { id: "amenities", label: "Amenities" },
  { id: "reviews", label: "Reviews" },
  { id: "policies", label: "Policies" },
  { id: "location", label: "Location" },
];

export default function RoomDetailsClient({ hotel, room }: { hotel: Hotel; room: RoomType }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();

  const [checkIn, setCheckIn] = useState<Date | null>(() => parseDayKey(searchParams.get("checkIn")));
  const [checkOut, setCheckOut] = useState<Date | null>(() => parseDayKey(searchParams.get("checkOut")));
  const [guests, setGuests] = useState<GuestsRoomsValue>({
    adults: Number(searchParams.get("adults") ?? Math.min(2, room.capacity)),
    children: Number(searchParams.get("children") ?? 0),
    rooms: Number(searchParams.get("rooms") ?? 1),
  });
  const [activeSection, setActiveSection] = useState(sections[0].id);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length) setActiveSection(visible[0].target.id);
      },
      { rootMargin: "-140px 0px -60% 0px" }
    );
    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const photos = [
    ...room.images.map((src) => ({ src, title: room.name, subtitle: `${room.beds} · ${room.size}` })),
    ...hotel.images.map((src) => ({ src, title: hotel.name, subtitle: "Hotel & facilities" })),
  ];
  const cancellationPolicy = hotel.policies.find((p) => p.toLowerCase().includes("free cancellation"));
  const breakfast = room.amenities.some((a) => a.toLowerCase().includes("breakfast"));
  const otherRooms = hotel.rooms.filter((r) => r.id !== room.id);

  // Free rooms per type for the chosen dates (null until both dates are set), live from every booking in the store.
  const hasDates = Boolean(checkIn && checkOut && checkOut > checkIn);
  const availabilityFor = (r: RoomType) => (hasDates ? availableRooms(r, checkIn!, checkOut!) : null);
  const available = availabilityFor(room);
  const unavailable = available !== null && available < guests.rooms;

  // Carry the current dates and party to the rooms list and other room pages.
  const query = new URLSearchParams({
    ...(checkIn && { checkIn: toDayKey(checkIn) }),
    ...(checkOut && { checkOut: toDayKey(checkOut) }),
    adults: String(guests.adults),
    children: String(guests.children),
    rooms: String(guests.rooms),
  }).toString();

  // Just the values: the icons say what each one is, and the label stays for screen readers.
  const specs = [
    { icon: Maximize, label: "Room size", value: room.size },
    { icon: BedDouble, label: "Beds", value: room.beds },
    { icon: Users, label: "Sleeps", value: `${room.capacity} guests` },
  ];

  // Check-in time and distances live in Policies and Location, so they aren't repeated here.
  const facts = [
    available !== null && {
      icon: DoorOpen,
      text: available === 0 ? "Fully booked" : `${available} left for your dates`,
      tone: available === 0 || unavailable ? "text-rose-700 bg-rose-50" : "text-sky-700 bg-sky-50",
    },
    cancellationPolicy && { icon: BadgeCheck, text: "Free cancellation", tone: "text-emerald-700 bg-emerald-50" },
    breakfast && { icon: Coffee, text: "Breakfast included", tone: "text-emerald-700 bg-emerald-50" },
  ].filter(Boolean) as { icon: typeof Users; text: string; tone: string }[];

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: `${room.name} · ${hotel.name}`, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard");
      }
    } catch {
      // Share sheet dismissed — nothing to do.
    }
  };

  const handleBookNow = () => {
    if (!checkIn || !checkOut) return;
    dispatch(
      setSelection({
        hotelSlug: hotel.slug,
        hotelName: hotel.name,
        hotelLocation: hotel.location,
        hotelImage: room.images[0],
        roomId: room.id,
        roomName: room.name,
        pricePerNight: room.price,
        checkIn: checkIn.toISOString(),
        checkOut: checkOut.toISOString(),
        adults: guests.adults,
        children: guests.children,
        rooms: guests.rooms,
      })
    );
    router.push("/hotel-management/book");
  };

  return (
    <div className="container pb-28 pt-6 lg:pb-10">
      <Gallery photos={photos} />

      <nav className="sticky top-16 z-20 -mx-4 mt-4 border-b border-neutral-200/70 bg-white/90 px-4 backdrop-blur-xl md:top-18">
        <div className="flex gap-1 overflow-x-auto [scrollbar-width:none]">
          {sections.map(({ id, label }) => (
            <a
              key={id}
              href={`#${id}`}
              className={`shrink-0 border-b-2 px-3 py-3 text-[13px] font-semibold transition sm:px-4 sm:text-sm ${
                activeSection === id
                  ? "border-sky-600 text-sky-700"
                  : "border-transparent text-neutral-500 hover:text-neutral-900"
              }`}
            >
              {label}
            </a>
          ))}
        </div>
      </nav>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="min-w-0 space-y-10">
          <section id="overview" className="scroll-mt-36">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h1 className="text-2xl font-bold text-neutral-900 md:text-3xl">{room.name}</h1>
                <a
                  href="#location"
                  className="mt-1.5 flex min-w-0 items-center gap-1.5 text-sm text-neutral-600 transition hover:text-sky-700"
                >
                  <MapPin className="size-4 shrink-0 text-sky-600" />
                  <span className="truncate">{hotel.address}</span>
                </a>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={handleShare}
                  aria-label="Share this room"
                  className="flex size-10 items-center justify-center rounded-full border border-neutral-200 text-neutral-600 transition hover:border-sky-200 hover:text-sky-700"
                >
                  <Share2 className="size-4" />
                </button>
                <a
                  href={`tel:${hotel.phone}`}
                  aria-label="Call the hotel"
                  className="flex size-10 items-center justify-center rounded-full border border-neutral-200 text-neutral-600 transition hover:border-sky-200 hover:text-sky-700"
                >
                  <Phone className="size-4" />
                </a>
              </div>
            </div>

            <ul className="mt-4 flex flex-wrap gap-2">
              {specs.map(({ icon: Icon, label, value }) => (
                <li
                  key={label}
                  className="flex items-center gap-2 rounded-md border border-neutral-200/70 bg-white px-3 py-2 text-sm font-semibold text-neutral-900"
                >
                  <Icon className="size-4 text-sky-600" aria-hidden />
                  <span className="sr-only">{label}:</span>
                  {value}
                </li>
              ))}
            </ul>

            {facts.length > 0 && (
              <ul className="mt-3 flex flex-wrap gap-2">
                {facts.map(({ icon: Icon, text, tone }) => (
                  <li
                    key={text}
                    className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold ${tone}`}
                  >
                    <Icon className="size-3.5" />
                    {text}
                  </li>
                ))}
              </ul>
            )}

            <p className="mt-4 text-[15px] leading-relaxed text-neutral-700">{room.description}</p>
          </section>

          <section id="amenities" className="scroll-mt-36">
            <h2 className="text-xl font-bold text-neutral-900">In your room</h2>
            <div className="mt-4">
              <AmenitiesGrid amenities={room.amenities} />
            </div>

            <h3 className="mt-8 text-base font-bold text-neutral-900">Hotel facilities</h3>
            <ul className="mt-3 flex flex-wrap gap-2">
              {hotel.amenities.map((amenity) => (
                <li
                  key={amenity}
                  className="rounded-md bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-700"
                >
                  {amenity}
                </li>
              ))}
            </ul>
          </section>

          {otherRooms.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-neutral-900">Other rooms</h2>
              <div className="mt-4">
                <OtherRooms
                  rooms={otherRooms}
                  query={query}
                  availability={Object.fromEntries(otherRooms.map((r) => [r.id, availabilityFor(r)]))}
                  roomsNeeded={guests.rooms}
                />
              </div>
            </section>
          )}

          <section id="reviews" className="scroll-mt-36">
            <ReviewsSection reviews={hotel.reviews} rating={hotel.rating} reviewsCount={hotel.reviewsCount} />
          </section>

          <section id="policies" className="scroll-mt-36">
            <h2 className="text-xl font-bold text-neutral-900">House Rules &amp; Policies</h2>
            <div className="mt-4">
              <PoliciesSection policies={hotel.policies} />
            </div>
          </section>

          <section id="location" className="scroll-mt-36">
            <h2 className="text-xl font-bold text-neutral-900">Location &amp; Nearby</h2>
            <div className="mt-4">
              <LocationCard hotel={hotel} />
            </div>
          </section>
        </div>

        <div>
          <BookingSidebar
            room={room}
            available={available}
            checkIn={checkIn}
            checkOut={checkOut}
            onCheckInChange={setCheckIn}
            onCheckOutChange={setCheckOut}
            guests={guests}
            onGuestsChange={setGuests}
            onBookNow={handleBookNow}
            cancellationPolicy={cancellationPolicy}
          />
        </div>
      </div>

      <div
        data-booking-bar
        className="fixed inset-x-0 bottom-0 z-40 border-t border-neutral-200/70 bg-white/95 px-4 py-3 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] backdrop-blur-xl lg:hidden"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-xs text-neutral-500">{room.name}</p>
            {unavailable ? (
              <p className="text-sm font-bold text-rose-600">Not available for your dates</p>
            ) : (
              <p className="text-lg font-extrabold text-neutral-900">
                BDT {room.price.toLocaleString()}
                <span className="text-xs font-medium text-neutral-500"> /night</span>
              </p>
            )}
          </div>
          <a
            href="#booking"
            className={`shrink-0 rounded-md px-5 py-3 text-sm font-semibold text-white shadow-lg ${
              unavailable ? "bg-neutral-900" : "bg-sky-600 shadow-sky-600/25"
            }`}
          >
            {unavailable ? "Change dates" : hasDates ? "Review & book" : "Select dates"}
          </a>
        </div>
      </div>
    </div>
  );
}
