"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { differenceInCalendarDays } from "date-fns";
import { toast } from "react-toastify";
import {
  AlertCircle,
  BedDouble,
  Building2,
  ChevronDown,
  CreditCard,
  Globe2,
  IdCard,
  Loader2,
  Lock,
  Plane,
  Plus,
  Smartphone,
  UserRound,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/src/lib/redux/hooks";
import { clearSelection, setLastBookingId } from "@/src/lib/redux/features/hotelBooking/hotelBookingSlice";
import { getBookingHistory, reservationsFromHistory, saveBooking } from "@/src/lib/hotelBookingHistory";
import { availableRooms, getRoomById, hotel } from "@/src/data/hotels";
import { countries, getCountry } from "@/src/data/countries";
import type { CurrencyCode } from "@/src/lib/currency";
import BookingSummary from "./BookingSummary";
import {
  guestInfoValidationSchema,
  titles,
  type GuestInfoFormType,
} from "./schema/GuestInfoSchema";

const newBookingId = () => `TW-${Date.now().toString().slice(-8)}`;

const arrivalOptions = [
  "Not sure yet",
  "Before 12:00 PM (early check-in request)",
  "12:00 PM – 2:00 PM",
  "2:00 PM – 4:00 PM",
  "4:00 PM – 6:00 PM",
  "6:00 PM – 9:00 PM",
  "After 9:00 PM",
];

const quickRequests = ["Early check-in", "Late check-out", "High floor", "Extra bed", "Baby cot", "Quiet room"];

const paymentChoices = [
  { value: "hotel", label: "Pay at hotel", hint: "Cash or card on arrival", icon: Building2, logos: [] },
  {
    value: "card",
    label: "Card",
    hint: "Visa, Mastercard",
    icon: CreditCard,
    logos: ["/payments/visa.svg", "/payments/mastercard.svg"],
  },
  {
    value: "wallet",
    label: "Mobile wallet",
    hint: "Bangladesh wallets",
    icon: Smartphone,
    logos: ["/payments/bkash.webp", "/payments/nagad.webp", "/payments/rocket.webp"],
  },
] as const;

const control =
  "h-11 w-full rounded-xl border border-neutral-200 bg-white px-3.5 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-100 aria-[invalid=true]:border-rose-300 aria-[invalid=true]:focus:ring-rose-100";

function Section({
  step,
  icon: Icon,
  title,
  subtitle,
  children,
}: {
  step: number;
  icon: typeof UserRound;
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-neutral-200/80 bg-white p-5 shadow-sm md:p-6">
      <div className="flex items-start gap-3">
        <span className="relative flex size-10 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
          <Icon className="size-5" />
          <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-sky-600 text-[10px] font-bold text-white">
            {step}
          </span>
        </span>
        <div>
          <h2 className="font-bold text-neutral-900">{title}</h2>
          {subtitle && <p className="mt-0.5 text-sm text-neutral-500">{subtitle}</p>}
        </div>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Field({
  label,
  htmlFor,
  error,
  hint,
  optional,
  className,
  children,
}: {
  label: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  optional?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="text-sm font-medium text-neutral-800">
        {label}
        {optional && <span className="font-normal text-neutral-400"> (optional)</span>}
      </label>
      <div className="mt-1.5">{children}</div>
      {error ? (
        <p className="mt-1.5 flex items-center gap-1 text-xs text-rose-600">
          <AlertCircle className="size-3.5 shrink-0" /> {error}
        </p>
      ) : (
        hint && <p className="mt-1.5 text-xs text-neutral-500">{hint}</p>
      )}
    </div>
  );
}

function SelectBox({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`relative ${className}`}>
      {children}
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
    </div>
  );
}

export default function GuestInfoForm() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const selection = useAppSelector((state) => state.hotelBooking.selection);
  const [confirming, setConfirming] = useState(false);
  const [currencyOverride, setCurrencyOverride] = useState<CurrencyCode | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<GuestInfoFormType>({
    resolver: yupResolver(guestInfoValidationSchema),
    defaultValues: {
      title: "Mr",
      country: "BD",
      phoneCountry: "BD",
      idType: "nid",
      arrivalTime: "",
      airportPickup: false,
      note: "",
      paymentMethod: "hotel",
      acceptTerms: false,
    },
  });

  if (!selection) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-neutral-200 bg-white p-10 text-center">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
          <BedDouble className="size-6" />
        </span>
        <p className="font-semibold text-neutral-900">No room selected yet</p>
        <p className="text-sm text-neutral-500">Pick a room and your dates to start a booking.</p>
        <Link
          href="/hotel-management/rooms"
          className="mt-1 rounded-xl bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-sky-700"
        >
          Browse rooms
        </Link>
      </div>
    );
  }

  const country = watch("country");
  const phoneCountry = watch("phoneCountry");
  const idType = watch("idType");
  const isLocal = country === "BD";
  const currency = currencyOverride ?? getCountry(country)?.currency ?? "USD";
  const airport = hotel.nearby.find((place) => place.type === "airport");

  const checkIn = new Date(selection.checkIn!);
  const checkOut = new Date(selection.checkOut!);
  const nights = Math.max(1, differenceInCalendarDays(checkOut, checkIn));
  const subtotal = selection.pricePerNight * nights * selection.rooms;
  const serviceFee = Math.round(subtotal * 0.03);
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + serviceFee + tax;

  const addRequest = (request: string) => {
    const current = getValues("note").trim();
    if (current.toLowerCase().includes(request.toLowerCase())) return;
    setValue("note", current ? `${current}, ${request}` : request);
  };

  const onSubmit = async (data: GuestInfoFormType) => {
    setConfirming(true);

    // Real-time availability check simulation before final confirmation
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Re-check against the hotel's reservations and bookings already made in this browser.
    const room = getRoomById(selection.roomId);
    if (room) {
      const free = availableRooms(room, checkIn, checkOut, reservationsFromHistory(getBookingHistory(), room.id));
      if (free < selection.rooms) {
        setConfirming(false);
        toast.error(
          free === 0
            ? "Sorry — this room was just booked for your dates. Please choose other dates."
            : `Sorry — only ${free} of this room ${free === 1 ? "is" : "are"} left for your dates.`
        );
        return;
      }
    }

    const dial = data.phoneCountry === "OTHER" ? data.customDial.replace(/^\+/, "") : getCountry(data.phoneCountry)?.dial;
    const localNumber = data.phone.replace(/[\s()-]/g, "").replace(/^0/, "");
    const bookingId = newBookingId();

    saveBooking({
      bookingId,
      roomId: selection.roomId,
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
      guest: {
        name: `${data.title} ${data.firstName} ${data.lastName}`,
        email: data.email,
        phone: `+${dial} ${localNumber}`,
        note: data.note,
        country: data.country === "OTHER" ? data.otherCountry : getCountry(data.country)?.name,
        idType: data.idType as "nid" | "passport",
        idNumber: data.idNumber,
        arrivalTime: data.arrivalTime,
        airportPickup: data.airportPickup,
      },
      paymentMethod: data.paymentMethod as "hotel" | "card" | "wallet",
      createdAt: new Date().toISOString(),
    });

    dispatch(setLastBookingId(bookingId));
    dispatch(clearSelection());

    toast.success(`Booking confirmed! Confirmation sent to ${data.email}.`);
    router.push(`/hotel-management/booking-success?bookingId=${bookingId}`);
  };

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[1fr_400px]">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        <Section step={1} icon={UserRound} title="Who's checking in?" subtitle="Use the name on your ID or passport.">
          <div className="grid gap-4 sm:grid-cols-[110px_1fr_1fr]">
            <Field label="Title" htmlFor="title">
              <SelectBox>
                <select id="title" className={`${control} appearance-none pr-9`} {...register("title")}>
                  {titles.map((title) => (
                    <option key={title}>{title}</option>
                  ))}
                </select>
              </SelectBox>
            </Field>
            <Field label="First name" htmlFor="firstName" error={errors.firstName?.message}>
              <input
                id="firstName"
                autoComplete="given-name"
                placeholder="e.g. Tamim"
                aria-invalid={Boolean(errors.firstName)}
                className={control}
                {...register("firstName")}
              />
            </Field>
            <Field label="Last name" htmlFor="lastName" error={errors.lastName?.message}>
              <input
                id="lastName"
                autoComplete="family-name"
                placeholder="e.g. Rahman"
                aria-invalid={Boolean(errors.lastName)}
                className={control}
                {...register("lastName")}
              />
            </Field>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field
              label="Email"
              htmlFor="email"
              error={errors.email?.message}
              hint="We'll send your confirmation here."
            >
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                aria-invalid={Boolean(errors.email)}
                className={control}
                {...register("email")}
              />
            </Field>
            <Field label="Country of residence" htmlFor="country" error={errors.country?.message}>
              <SelectBox>
                <select
                  id="country"
                  autoComplete="country"
                  className={`${control} appearance-none pr-9`}
                  {...register("country", {
                    onChange: (e) => {
                      const code = e.target.value as string;
                      if (code !== "OTHER") setValue("phoneCountry", code);
                      setValue("idType", code === "BD" ? "nid" : "passport");
                      setCurrencyOverride(null);
                    },
                  })}
                >
                  {countries.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.name}
                    </option>
                  ))}
                  <option value="OTHER">Other country…</option>
                </select>
              </SelectBox>
            </Field>
          </div>

          {country === "OTHER" && (
            <Field label="Your country" htmlFor="otherCountry" error={errors.otherCountry?.message} className="mt-4">
              <input
                id="otherCountry"
                placeholder="e.g. Brazil"
                aria-invalid={Boolean(errors.otherCountry)}
                className={control}
                {...register("otherCountry")}
              />
            </Field>
          )}

          <Field
            label="Mobile number"
            htmlFor="phone"
            error={errors.customDial?.message ?? errors.phone?.message}
            hint={isLocal ? "Bangladeshi mobile, e.g. 01712345678" : "Include your area code. WhatsApp works best for international guests."}
            className="mt-4"
          >
            <div className="flex gap-2">
              <SelectBox className="w-32 shrink-0 sm:w-48">
                <select
                  aria-label="Country code"
                  className={`${control} appearance-none pr-9`}
                  {...register("phoneCountry")}
                >
                  {countries.map((c) => (
                    <option key={c.code} value={c.code}>
                      +{c.dial} {c.name}
                    </option>
                  ))}
                  <option value="OTHER">Other code…</option>
                </select>
              </SelectBox>
              {phoneCountry === "OTHER" && (
                <input
                  aria-label="Dialling code"
                  placeholder="+971"
                  aria-invalid={Boolean(errors.customDial)}
                  className={`${control} w-20`}
                  {...register("customDial")}
                />
              )}
              <input
                id="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel-national"
                placeholder={phoneCountry === "BD" ? "01XXXXXXXXX" : "Phone number"}
                aria-invalid={Boolean(errors.phone)}
                className={`${control} min-w-0 flex-1`}
                {...register("phone")}
              />
            </div>
          </Field>
        </Section>

        <Section
          step={2}
          icon={IdCard}
          title="Identification"
          subtitle="Optional now — it speeds up check-in. Bring the same document with you."
        >
          {!isLocal && (
            <div className="mb-4 flex gap-2.5 rounded-2xl bg-sky-50 p-3 text-sm text-sky-900">
              <Globe2 className="mt-0.5 size-4 shrink-0 text-sky-600" />
              <p>
                <span className="font-semibold">International guests:</span> please bring your passport (and
                visa, if required) to check-in.
              </p>
            </div>
          )}

          {isLocal && (
            <div className="mb-4 inline-flex rounded-full bg-neutral-100 p-1 text-sm font-medium" role="radiogroup">
              {(["nid", "passport"] as const).map((type) => (
                <label
                  key={type}
                  className="cursor-pointer rounded-full px-4 py-1.5 text-neutral-600 transition has-[:checked]:bg-white has-[:checked]:font-semibold has-[:checked]:text-sky-700 has-[:checked]:shadow-sm"
                >
                  <input type="radio" value={type} className="sr-only" {...register("idType")} />
                  {type === "nid" ? "National ID (NID)" : "Passport"}
                </label>
              ))}
            </div>
          )}

          <Field
            label={idType === "nid" ? "NID number" : "Passport number"}
            htmlFor="idNumber"
            optional
            error={errors.idNumber?.message}
          >
            <input
              id="idNumber"
              placeholder={idType === "nid" ? "10, 13 or 17 digits" : "e.g. A01234567"}
              aria-invalid={Boolean(errors.idNumber)}
              className={`${control} uppercase placeholder:normal-case`}
              {...register("idNumber")}
            />
          </Field>
        </Section>

        <Section step={3} icon={Plane} title="Arrival & requests" subtitle="Requests aren't guaranteed, but we'll do our best.">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Estimated arrival time" htmlFor="arrivalTime" optional>
              <SelectBox>
                <select id="arrivalTime" className={`${control} appearance-none pr-9`} {...register("arrivalTime")}>
                  {arrivalOptions.map((option) => (
                    <option key={option} value={option === "Not sure yet" ? "" : option}>
                      {option}
                    </option>
                  ))}
                </select>
              </SelectBox>
            </Field>

            {airport && (
              <label className="flex cursor-pointer items-start gap-3 self-end rounded-xl border border-neutral-200 p-3 transition has-[:checked]:border-sky-400 has-[:checked]:bg-sky-50/60">
                <input type="checkbox" className="mt-0.5 size-4 accent-sky-600" {...register("airportPickup")} />
                <span>
                  <span className="block text-sm font-semibold text-neutral-900">Request airport pickup</span>
                  <span className="block text-xs text-neutral-500">
                    From {airport.name} ({airport.distance}). We&rsquo;ll confirm the price.
                  </span>
                </span>
              </label>
            )}
          </div>

          <Field label="Special requests" htmlFor="note" optional className="mt-4">
            <div className="mb-2 flex flex-wrap gap-1.5">
              {quickRequests.map((request) => (
                <button
                  key={request}
                  type="button"
                  onClick={() => addRequest(request)}
                  className="flex items-center gap-1 rounded-full border border-neutral-200 px-3 py-1 text-xs font-medium text-neutral-600 transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700"
                >
                  <Plus className="size-3" /> {request}
                </button>
              ))}
            </div>
            <textarea
              id="note"
              rows={3}
              placeholder="Anything else we should know?"
              className={`${control} h-auto py-3`}
              {...register("note")}
            />
          </Field>
        </Section>

        <Section step={4} icon={CreditCard} title="How would you like to pay?" subtitle="Your total is charged in BDT.">
          <div className="grid gap-3 sm:grid-cols-3">
            {paymentChoices.map(({ value, label, hint, icon: Icon, logos }) => (
              <label
                key={value}
                className="flex cursor-pointer flex-col gap-2 rounded-2xl border border-neutral-200 p-4 transition hover:border-sky-200 has-[:checked]:border-sky-500 has-[:checked]:bg-sky-50/60 has-[:checked]:ring-2 has-[:checked]:ring-sky-100"
              >
                <span className="flex items-center justify-between">
                  <span className="flex size-9 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                    <Icon className="size-4.5" />
                  </span>
                  <input type="radio" value={value} className="size-4 accent-sky-600" {...register("paymentMethod")} />
                </span>
                <span>
                  <span className="block text-sm font-semibold text-neutral-900">{label}</span>
                  <span className="block text-xs text-neutral-500">{hint}</span>
                </span>
                {logos.length > 0 && (
                  <span className="flex flex-wrap gap-1">
                    {logos.map((logo) => (
                      <span
                        key={logo}
                        className="flex h-6 w-10 items-center justify-center rounded-md border border-neutral-100 bg-white px-1"
                      >
                        <Image src={logo} alt="" width={40} height={24} className="max-h-4 w-auto object-contain" />
                      </span>
                    ))}
                  </span>
                )}
              </label>
            ))}
          </div>
        </Section>

        <div className="rounded-3xl border border-neutral-200/80 bg-white p-5 shadow-sm md:p-6">
          <label className="flex cursor-pointer items-start gap-3 text-sm text-neutral-700">
            <input type="checkbox" className="mt-0.5 size-4 accent-sky-600" {...register("acceptTerms")} />
            <span>
              I agree to the{" "}
              <Link
                href={`/hotel-management/rooms/${selection.roomId}#policies`}
                target="_blank"
                className="font-semibold text-sky-700 hover:underline"
              >
                house rules and cancellation policy
              </Link>
              , and confirm the guest details are correct.
            </span>
          </label>
          {errors.acceptTerms && (
            <p className="mt-2 flex items-center gap-1 text-xs text-rose-600">
              <AlertCircle className="size-3.5" /> {errors.acceptTerms.message}
            </p>
          )}

          <button
            type="submit"
            disabled={confirming}
            className="mt-5 flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-sky-600 text-base font-semibold text-white shadow-lg shadow-sky-600/25 transition hover:bg-sky-700 disabled:opacity-70"
          >
            {confirming ? (
              <>
                <Loader2 className="size-5 animate-spin" /> Confirming your booking…
              </>
            ) : (
              <>
                <Lock className="size-4" /> Confirm booking · BDT {total.toLocaleString()}
              </>
            )}
          </button>
          <p className="mt-2 text-center text-xs text-neutral-500">Instant confirmation by email.</p>
        </div>
      </form>

      <aside className="order-first lg:sticky lg:top-24 lg:order-none">
        <BookingSummary
          selection={selection}
          checkIn={checkIn}
          checkOut={checkOut}
          nights={nights}
          subtotal={subtotal}
          serviceFee={serviceFee}
          tax={tax}
          total={total}
          currency={currency}
          onCurrencyChange={setCurrencyOverride}
        />
      </aside>
    </div>
  );
}
