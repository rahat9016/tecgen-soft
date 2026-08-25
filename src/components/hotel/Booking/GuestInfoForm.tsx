"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { differenceInCalendarDays, format } from "date-fns";
import { toast } from "react-toastify";
import { Loader2 } from "lucide-react";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";
import { Label } from "@/src/components/ui/label";
import { Button } from "@/src/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/src/lib/redux/hooks";
import { clearSelection, setLastBookingId } from "@/src/lib/redux/features/hotelBooking/hotelBookingSlice";
import { saveBooking } from "@/src/lib/hotelBookingHistory";
import {
  guestInfoValidationSchema,
  type GuestInfoFormType,
} from "./schema/GuestInfoSchema";

export default function GuestInfoForm() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const selection = useAppSelector((state) => state.hotelBooking.selection);
  const [confirming, setConfirming] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GuestInfoFormType>({
    resolver: yupResolver(guestInfoValidationSchema),
  });

  if (!selection) {
    return (
      <div className="rounded-xl border border-neutral-100 bg-white p-6 text-center text-sm text-neutral-500">
        No room selected yet.{" "}
        <a href="/hotel-management" className="text-sky-700 hover:underline">
          Browse hotels
        </a>{" "}
        to start a booking.
      </div>
    );
  }

  const checkIn = new Date(selection.checkIn!);
  const checkOut = new Date(selection.checkOut!);
  const nights = Math.max(1, differenceInCalendarDays(checkOut, checkIn));
  const subtotal = selection.pricePerNight * nights * selection.rooms;
  const serviceFee = Math.round(subtotal * 0.03);
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + serviceFee + tax;

  const onSubmit = async (data: GuestInfoFormType) => {
    setConfirming(true);

    // Real-time availability check simulation before final confirmation
    await new Promise((resolve) => setTimeout(resolve, 800));

    const bookingId = `TW-${Date.now().toString().slice(-8)}`;

    saveBooking({
      bookingId,
      hotelSlug: selection.hotelSlug,
      hotelName: selection.hotelName,
      hotelLocation: selection.hotelLocation,
      hotelImage: selection.hotelImage,
      roomName: selection.roomName,
      checkIn: selection.checkIn!,
      checkOut: selection.checkOut!,
      nights,
      adults: selection.adults,
      children: selection.children,
      rooms: selection.rooms,
      pricePerNight: selection.pricePerNight,
      subtotal,
      serviceFee,
      tax,
      total,
      guest: { name: data.fullName, email: data.email, phone: data.phone, note: data.note },
      createdAt: new Date().toISOString(),
    });

    dispatch(setLastBookingId(bookingId));
    dispatch(clearSelection());

    toast.success(`Booking confirmed! Confirmation sent to ${data.email} & ${data.phone}.`);
    router.push(`/hotel-management/booking-success?bookingId=${bookingId}`);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 lg:col-span-2">
        <div className="rounded-xl border border-neutral-100 bg-white p-5">
          <h2 className="font-semibold text-neutral-900">Guest Information</h2>

          <div className="mt-4 space-y-4">
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" className="mt-1" placeholder="e.g. Tamim Rahman" {...register("fullName")} />
              {errors.fullName && (
                <p className="mt-1 text-xs text-red-500">{errors.fullName.message}</p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" className="mt-1" placeholder="you@example.com" {...register("email")} />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" className="mt-1" placeholder="01XXXXXXXXX" {...register("phone")} />
                {errors.phone && (
                  <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="note">Special Requests (optional)</Label>
              <Textarea
                id="note"
                className="mt-1"
                rows={3}
                placeholder="Early check-in, extra bed, airport pickup…"
                {...register("note")}
              />
            </div>
          </div>
        </div>

        <Button
          type="submit"
          disabled={confirming}
          className="w-full bg-sky-700 hover:bg-sky-800 sm:w-auto"
        >
          {confirming ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Confirming booking…
            </>
          ) : (
            "Confirm Booking"
          )}
        </Button>
      </form>

      <div className="rounded-xl border border-neutral-100 bg-white p-5">
        <h3 className="font-semibold text-neutral-900">Booking Summary</h3>
        <div className="mt-3 flex items-center gap-3">
          <img
            src={selection.hotelImage}
            alt={selection.hotelName}
            className="size-16 rounded-lg object-cover"
          />
          <div>
            <p className="text-sm font-semibold text-neutral-900">{selection.hotelName}</p>
            <p className="text-xs text-neutral-500">{selection.hotelLocation}</p>
          </div>
        </div>

        <div className="mt-4 space-y-1.5 border-t border-neutral-100 pt-3 text-sm text-neutral-600">
          <div className="flex justify-between">
            <span>Room</span>
            <span className="font-medium text-neutral-900">{selection.roomName}</span>
          </div>
          <div className="flex justify-between">
            <span>Check-in</span>
            <span>{format(checkIn, "dd/MM/yyyy")}</span>
          </div>
          <div className="flex justify-between">
            <span>Check-out</span>
            <span>{format(checkOut, "dd/MM/yyyy")}</span>
          </div>
          <div className="flex justify-between">
            <span>Guests</span>
            <span>
              {selection.adults + selection.children} guests, {selection.rooms} room
              {selection.rooms !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Nights</span>
            <span>{nights}</span>
          </div>
        </div>

        <div className="mt-3 space-y-1.5 border-t border-neutral-100 pt-3 text-sm">
          <div className="flex justify-between text-neutral-600">
            <span>Subtotal</span>
            <span>BDT {subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-neutral-600">
            <span>Service fee</span>
            <span>BDT {serviceFee.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-neutral-600">
            <span>Tax</span>
            <span>BDT {tax.toLocaleString()}</span>
          </div>
          <div className="flex justify-between border-t border-neutral-100 pt-2 text-base font-bold text-neutral-900">
            <span>Total</span>
            <span>BDT {total.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
