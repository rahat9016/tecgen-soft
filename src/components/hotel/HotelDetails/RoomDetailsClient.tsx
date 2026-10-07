"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import {
  BadgeCheck,
  BedDouble,
  Clock3,
  Coffee,
  DoorOpen,
  MapPin,
  Maximize,
  Navigation,
  Phone,
  Share2,
  Users,
} from "lucide-react";
import { availableRooms, type Hotel, type RoomType } from "@/src/data/hotels";
import { parseDayKey, toDayKey } from "@/src/lib/hotelDates";
import { reservationsFromHistory } from "@/src/lib/hotelBookingHistory";
import { useBookingHistory } from "@/src/lib/useBookingHistory";
import { useAppDispatch } from "@/src/lib/redux/hooks";
import { setSelection } from "@/src/lib/redux/features/hotelBooking/hotelBookingSlice";
import type { GuestsRoomsValue } from "@/src/components/hotel/shared/GuestsRoomsField";
import { ratingLabel } from "@/src/components/hotel/shared/ratingLabel";
import Gallery from "./Gallery";
import AmenitiesGrid from "./AmenitiesGrid";
import OtherRooms from "./OtherRooms";
import ReviewsSection from "./ReviewsSection";
import PoliciesSection, { parseCheckTimes } from "./PoliciesSection";
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
  const checkTimes = parseCheckTimes(hotel.policies);
  const cancellationPolicy = hotel.policies.find((p) => p.toLowerCase().includes("free cancellation"));
  const breakfast = room.amenities.some((a) => a.toLowerCase().includes("breakfast"));
  const nearest = hotel.nearby[0];
  const otherRooms = hotel.rooms.filter((r) => r.id !== room.id);

  // Free rooms per type for the chosen dates (null until both dates are set), counting this browser's bookings too.
  const history = useBookingHistory();
  const hasDates = Boolean(checkIn && checkOut && checkOut > checkIn);
  const availabilityFor = (r: RoomType) =>
    hasDates ? availableRooms(r, checkIn!, checkOut!, reservationsFromHistory(history, r.id)) : null;
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

  const specs = [
    { icon: Maximize, label: "Room size", value: room.size },
    { icon: BedDouble, label: "Beds", value: room.beds },
    { icon: Users, label: "Sleeps", value: `Up to ${room.capacity} guests` },
    {
      icon: DoorOpen,
      label: "Your dates",
      value:
        available === null
          ? "Pick dates to check"
          : available === 0
            ? "Fully booked"
            : `${available} of ${room.totalRooms} free`,
      tone:
        available === null
          ? "font-semibold text-neutral-500"
          : available === 0
            ? "text-rose-600"
            : unavailable || available <= 2
              ? "text-amber-700"
              : "text-emerald-700",
    },
  ];

  const facts = [
    cancellationPolicy && { icon: BadgeCheck, text: "Free cancellation", tone: "text-emerald-700 bg-emerald-50" },
    breakfast && { icon: Coffee, text: "Breakfast included", tone: "text-emerald-700 bg-emerald-50" },
    checkTimes && { icon: Clock3, text: `Check-in from ${checkTimes.checkIn}`, tone: "text-sky-700 bg-sky-50" },
    nearest && {
      icon: Navigation,
      text: `${nearest.distance} to ${nearest.name}`,
      tone: "text-sky-700 bg-sky-50",
    },
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
        <div className="flex gap-1 overflow-x-auto">
          {sections.map(({ id, label }) => (
            <a
              key={id}
              href={`#${id}`}
              className={`shrink-0 border-b-2 px-4 py-3 text-sm font-semibold transition ${
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
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <h1 className="text-2xl font-bold text-neutral-900 md:text-3xl">{room.name}</h1>
                <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-neutral-600">
                  <MapPin className="size-4 shrink-0 text-sky-600" />
                  {hotel.name} &middot; {hotel.address}
                  <a href="#location" className="font-semibold text-sky-700 hover:underline">
                    Show on map
                  </a>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href="#reviews"
                  className="flex items-center gap-2.5 rounded-xl border border-neutral-200/70 py-1.5 pl-3 pr-1.5 transition hover:border-sky-200"
                >
                  <span className="text-right">
                    <span className="block text-sm font-bold text-neutral-900">
                      {ratingLabel(hotel.rating)}
                    </span>
                    <span className="block text-xs text-neutral-500">{hotel.reviewsCount} reviews</span>
                  </span>
                  <span className="flex size-10 items-center justify-center rounded-lg rounded-bl-none bg-sky-700 font-bold text-white">
                    {hotel.rating.toFixed(1)}
                  </span>
                </a>
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

            <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
              {specs.map(({ icon: Icon, label, value, tone }) => (
                <div key={label} className="rounded-2xl border border-neutral-200/70 bg-white p-4">
                  <Icon className="size-5 text-sky-600" />
                  <p className="mt-2 text-xs text-neutral-500">{label}</p>
                  <p className={`text-sm font-bold text-neutral-900 ${tone ?? ""}`}>{value}</p>
                </div>
              ))}
            </div>

            {facts.length > 0 && (
              <ul className="mt-4 flex flex-wrap gap-2">
                {facts.map(({ icon: Icon, text, tone }) => (
                  <li
                    key={text}
                    className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${tone}`}
                  >
                    <Icon className="size-3.5" />
                    {text}
                  </li>
                ))}
              </ul>
            )}

            <p className="mt-5 text-[15px] leading-relaxed text-neutral-700">{room.description}</p>
            <p className="mt-3 text-sm leading-relaxed text-neutral-500">{hotel.description}</p>
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
                  className="rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-700"
                >
                  {amenity}
                </li>
              ))}
            </ul>
          </section>

          {otherRooms.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-neutral-900">Other rooms at {hotel.name}</h2>
              <p className="mt-1 text-sm text-neutral-500">Need more space or a different bed setup?</p>
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
            <h2 className="text-xl font-bold text-neutral-900">Guest Reviews</h2>
            <div className="mt-4">
              <ReviewsSection
                reviews={hotel.reviews}
                rating={hotel.rating}
                reviewsCount={hotel.reviewsCount}
              />
            </div>
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
            className={`shrink-0 rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-lg ${
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
