"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Star, MapPin, Share2, Phone } from "lucide-react";
import type { Hotel, RoomType } from "@/src/data/hotels";
import { useAppDispatch } from "@/src/lib/redux/hooks";
import { setSelection } from "@/src/lib/redux/features/hotelBooking/hotelBookingSlice";
import type { GuestsRoomsValue } from "@/src/components/hotel/shared/GuestsRoomsField";
import Gallery from "./Gallery";
import AmenitiesGrid from "./AmenitiesGrid";
import RoomList from "./RoomList";
import ReviewsSection from "./ReviewsSection";
import PoliciesSection from "./PoliciesSection";
import NearbySpots from "./NearbySpots";
import MapCard from "./MapCard";
import BookingSidebar from "./BookingSidebar";

export default function HotelDetailsClient({ hotel }: { hotel: Hotel }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();

  const [selectedRoom, setSelectedRoom] = useState<RoomType | null>(null);
  const [checkIn, setCheckIn] = useState<Date | null>(() => {
    const raw = searchParams.get("checkIn");
    return raw ? new Date(raw) : null;
  });
  const [checkOut, setCheckOut] = useState<Date | null>(() => {
    const raw = searchParams.get("checkOut");
    return raw ? new Date(raw) : null;
  });
  const [guests, setGuests] = useState<GuestsRoomsValue>({
    adults: Number(searchParams.get("adults") ?? 2),
    children: Number(searchParams.get("children") ?? 0),
    rooms: Number(searchParams.get("rooms") ?? 1),
  });
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (!selectedRoom) return;
    setChecking(true);
    const timer = setTimeout(() => setChecking(false), 500);
    return () => clearTimeout(timer);
  }, [selectedRoom, checkIn, checkOut]);

  const handleBookNow = () => {
    if (!selectedRoom || !checkIn || !checkOut) return;
    dispatch(
      setSelection({
        hotelSlug: hotel.slug,
        hotelName: hotel.name,
        hotelLocation: hotel.location,
        hotelImage: hotel.images[0],
        roomId: selectedRoom.id,
        roomName: selectedRoom.name,
        pricePerNight: selectedRoom.price,
        checkIn: checkIn.toISOString(),
        checkOut: checkOut.toISOString(),
        adults: guests.adults,
        children: guests.children,
        rooms: guests.rooms,
      })
    );
    router.push(`/hotel-management/hotel/${hotel.slug}/book`);
  };

  return (
    <div className="container py-6">
      <Gallery images={hotel.images} name={hotel.name} />

      <div className="mt-6 grid gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <div>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <span className="rounded-full bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-700">
                  {hotel.category}
                </span>
                <h1 className="mt-2 text-2xl font-bold text-neutral-900">{hotel.name}</h1>
                <p className="mt-1 flex items-center gap-1 text-sm text-neutral-500">
                  <MapPin className="size-4" /> {hotel.address}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 rounded-md bg-emerald-50 px-2.5 py-1.5 text-sm font-semibold text-emerald-700">
                  <Star className="size-4 fill-emerald-600 text-emerald-600" />
                  {hotel.rating} <span className="font-normal">({hotel.reviewsCount})</span>
                </span>
                <button className="flex size-9 items-center justify-center rounded-full border border-neutral-200 text-neutral-500 hover:text-sky-700">
                  <Share2 className="size-4" />
                </button>
                <a
                  href="tel:+8801880982822"
                  className="flex size-9 items-center justify-center rounded-full border border-neutral-200 text-neutral-500 hover:text-sky-700"
                >
                  <Phone className="size-4" />
                </a>
              </div>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-neutral-600">{hotel.description}</p>
          </div>

          <section>
            <h2 className="text-lg font-bold text-neutral-900">Amenities</h2>
            <div className="mt-4">
              <AmenitiesGrid amenities={hotel.amenities} />
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-neutral-900">Choose Your Room</h2>
            <p className="text-sm text-neutral-500">
              Select a room to see live pricing and availability.
            </p>
            <div className="mt-4">
              <RoomList
                rooms={hotel.rooms}
                selectedRoomId={selectedRoom?.id ?? null}
                onSelect={setSelectedRoom}
                checking={checking}
              />
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-neutral-900">Guest Reviews</h2>
            <div className="mt-4">
              <ReviewsSection
                reviews={hotel.reviews}
                rating={hotel.rating}
                reviewsCount={hotel.reviewsCount}
              />
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-neutral-900">Rules &amp; Policies</h2>
            <div className="mt-4">
              <PoliciesSection policies={hotel.policies} />
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-neutral-900">Nearby Tourist Spots</h2>
            <div className="mt-4">
              <NearbySpots nearby={hotel.nearby} />
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-neutral-900">Location</h2>
            <div className="mt-4">
              <MapCard address={hotel.address} />
            </div>
          </section>
        </div>

        <div className="lg:col-span-1">
          <BookingSidebar
            selectedRoom={selectedRoom}
            checkIn={checkIn}
            checkOut={checkOut}
            onCheckInChange={setCheckIn}
            onCheckOutChange={setCheckOut}
            guests={guests}
            onGuestsChange={setGuests}
            onBookNow={handleBookNow}
          />
        </div>
      </div>
    </div>
  );
}
