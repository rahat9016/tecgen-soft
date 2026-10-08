"use client";

import { useEffect, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, FormProvider, useForm, useFormState, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { differenceInCalendarDays } from "date-fns";
import { toast } from "react-toastify";
import {
  BedDouble,
  Globe2,
  IdCard,
  Loader2,
  Lock,
  Plane,
  ShieldCheck,
  UserRound,
  Wallet,
} from "lucide-react";
import ControlledInputField from "@/src/components/shared/FromController/ControlledInputField";
import ControlledSelectField from "@/src/components/shared/FromController/ControlledSelectField";
import ControlledTextareaField from "@/src/components/shared/FromController/ControlledTextareaField";
import ControlledCheckboxField from "@/src/components/shared/FromController/ControlledCheckboxField";
import { useAppDispatch, useAppSelector } from "@/src/lib/redux/hooks";
import { clearSelection, setLastBookingId } from "@/src/lib/redux/features/hotelBooking/hotelBookingSlice";
import { getBookingHistory, reservationsFromHistory, saveBooking } from "@/src/lib/hotelBookingHistory";
import { availableRooms, getRoomById, hotel } from "@/src/data/hotels";
import { countries, getCountry } from "@/src/data/countries";
import type { CurrencyCode } from "@/src/lib/currency";
import {
  amountDueNow,
  DEPOSIT_RATE,
  depositAmount,
  onlinePaymentMethods,
  paymentMethodInfo,
  type OnlinePaymentMethod,
  type PaymentPlan,
} from "@/src/lib/hotelPayment";
import BookingSummary from "./BookingSummary";
import {
  AIRPORT_PICKUP,
  guestInfoValidationSchema,
  TERMS_ACCEPTED,
  titles,
  type GuestInfoFormType,
} from "./schema/GuestInfoSchema";

const newBookingId = () => `TW-${Date.now().toString().slice(-8)}`;

const UNSURE_ARRIVAL = "unsure";

const titleOptions = titles.map((title) => ({ label: title, value: title }));
const countryOptions = [
  ...countries.map((c) => ({ label: c.name, value: c.code })),
  { label: "Other country…", value: "OTHER" },
];
const dialOptions = [
  ...countries.map((c) => ({ label: `+${c.dial} ${c.name}`, value: c.code })),
  { label: "Other code…", value: "OTHER" },
];
const arrivalOptions = [
  { label: "Not sure yet", value: UNSURE_ARRIVAL },
  ...[
    "Before 12:00 PM (early check-in request)",
    "12:00 PM – 2:00 PM",
    "2:00 PM – 4:00 PM",
    "4:00 PM – 6:00 PM",
    "6:00 PM – 9:00 PM",
    "After 9:00 PM",
  ].map((slot) => ({ label: slot, value: slot })),
];

const airport = hotel.nearby.find((place) => place.type === "airport");
const requestOptions = [
  ...["Early check-in", "Late check-out", "High floor", "Extra bed", "Baby cot", "Quiet room"].map((label) => ({
    label,
    value: label,
  })),
  ...(airport
    ? [{ label: `Airport pickup from ${airport.name} (${airport.distance}) — price confirmed later`, value: AIRPORT_PICKUP }]
    : []),
];
const termsOptions = [
  {
    label: "I agree to the house rules and cancellation policy, and confirm the guest details are correct.",
    value: TERMS_ACCEPTED,
  },
];

// ControlledCheckboxField renders a vertical list; lay its rows out as a 2-column grid of bordered options.
const checkboxGridClass =
  "[&>div]:grid [&>div]:gap-2.5 [&>div>*]:!m-0 sm:[&>div]:grid-cols-2 [&>div>div]:rounded-xl [&>div>div]:border [&>div>div]:border-neutral-200 [&>div>div]:bg-white [&>div>div]:px-3 [&>div>div]:py-2.5 [&>div>div]:transition [&>div>div:has([data-state=checked])]:border-sky-400 [&>div>div:has([data-state=checked])]:bg-sky-50/60 [&_label]:text-sm [&_label]:leading-snug [&_label]:text-neutral-700 [&_[data-state=checked]]:border-sky-600 [&_[data-state=checked]]:bg-sky-600";

const methodChoices = onlinePaymentMethods.map((value) => ({ value, ...paymentMethodInfo[value] }));

// Passed to the shared controlled fields; border colour is left to them so their error state still shows.
const inputClass =
  "h-11 rounded-xl px-3.5 shadow-none placeholder:text-neutral-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-100";
const selectClass = "h-11 rounded-xl px-3.5 focus:border-sky-400 focus:ring-4 focus:ring-sky-100";

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

/** Error line for controllers that don't render their own (e.g. ControlledCheckboxField). */
function FieldError({ name }: { name: keyof GuestInfoFormType }) {
  const { errors } = useFormState<GuestInfoFormType>({ name });
  const message = errors[name]?.message;
  return message ? <div className="mt-1 pl-2 text-xs text-rose-500">{String(message)}</div> : null;
}

/** Label + control + hint. Controlled fields render their own error; the hint hides while `name` has one. */
function Field({
  label,
  name,
  hint,
  optional,
  className,
  children,
}: {
  label: string;
  name?: keyof GuestInfoFormType;
  hint?: string;
  optional?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const { errors } = useFormState<GuestInfoFormType>({ name });
  const hasError = Boolean(name && errors[name]);

  return (
    <div className={className}>
      <p className="text-sm font-medium text-neutral-800">
        {label}
        {optional && <span className="font-normal text-neutral-400"> (optional)</span>}
      </p>
      <div className="mt-1.5">{children}</div>
      {hint && !hasError && <p className="mt-1.5 text-xs text-neutral-500">{hint}</p>}
    </div>
  );
}

export default function GuestInfoForm() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const selection = useAppSelector((state) => state.hotelBooking.selection);
  const [confirming, setConfirming] = useState(false);
  const [currencyChoice, setCurrencyChoice] = useState<{ country: string; currency: CurrencyCode } | null>(null);

  const methods = useForm<GuestInfoFormType>({
    resolver: yupResolver(guestInfoValidationSchema),
    defaultValues: {
      title: "Mr",
      firstName: "",
      lastName: "",
      email: "",
      country: "BD",
      otherCountry: "",
      phoneCountry: "BD",
      customDial: "",
      phone: "",
      idType: "nid",
      idNumber: "",
      arrivalTime: UNSURE_ARRIVAL,
      requests: [],
      note: "",
      paymentPlan: "deposit",
      paymentMethod: "bkash",
      acceptTerms: [],
    },
  });
  const { control, handleSubmit, setValue } = methods;
  const [country, phoneCountry, idType, paymentPlan, paymentMethod] = useWatch({
    control,
    name: ["country", "phoneCountry", "idType", "paymentPlan", "paymentMethod"],
  });

  // Changing country of residence pre-fills the dialling code.
  useEffect(() => {
    const subscription = methods.watch((values, { name }) => {
      if (name !== "country") return;
      const code = values.country ?? "BD";
      if (code !== "OTHER") setValue("phoneCountry", code);
    });
    return () => subscription.unsubscribe();
  }, [methods, setValue]);

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

  const isLocal = country === "BD";
  // Only Bangladeshi residents choose between NID and passport; everyone else books with a passport.
  const idKind = isLocal ? idType : "passport";
  const currency =
    currencyChoice?.country === country ? currencyChoice.currency : (getCountry(country)?.currency ?? "USD");

  const checkIn = new Date(selection.checkIn!);
  const checkOut = new Date(selection.checkOut!);
  const nights = Math.max(1, differenceInCalendarDays(checkOut, checkIn));
  const subtotal = selection.pricePerNight * nights * selection.rooms;
  const serviceFee = Math.round(subtotal * 0.03);
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + serviceFee + tax;
  const plan = (paymentPlan ?? "deposit") as PaymentPlan;
  const dueNow = amountDueNow(total, plan);
  const deposit = depositAmount(total);
  const methodLabel = paymentMethodInfo[paymentMethod ?? "bkash"]?.label ?? "";

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
    // DEMO ONLY: no payment gateway is connected. Before going live, send the guest to the bKash/Nagad/Rocket or
    // card gateway (e.g. SSLCommerz) here and only save the booking once the gateway confirms the payment.
    await new Promise((resolve) => setTimeout(resolve, 900));
    const paidNow = amountDueNow(total, data.paymentPlan as PaymentPlan);

    const bookingId = newBookingId();
    const requests = data.requests.filter((request) => request !== AIRPORT_PICKUP);
    const note = [...requests, data.note.trim()].filter(Boolean).join(", ");

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
        note,
        country: data.country === "OTHER" ? data.otherCountry : getCountry(data.country)?.name,
        idType: data.country === "BD" ? (data.idType as "nid" | "passport") : "passport",
        idNumber: data.idNumber.trim().toUpperCase(),
        arrivalTime: data.arrivalTime === UNSURE_ARRIVAL ? "" : data.arrivalTime,
        airportPickup: data.requests.includes(AIRPORT_PICKUP),
      },
      paymentMethod: data.paymentMethod as OnlinePaymentMethod,
      paymentPlan: data.paymentPlan as PaymentPlan,
      amountPaid: paidNow,
      createdAt: new Date().toISOString(),
    });

    dispatch(setLastBookingId(bookingId));
    dispatch(clearSelection());

    toast.success(`Payment of BDT ${paidNow.toLocaleString()} received — booking confirmed!`);
    router.push(`/hotel-management/booking-success?bookingId=${bookingId}`);
  };

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[1fr_400px]">
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
          <Section step={1} icon={UserRound} title="Who's checking in?" subtitle="Use the name on your ID or passport.">
            <div className="grid gap-4 sm:grid-cols-[110px_1fr_1fr]">
              <Field label="Title">
                <ControlledSelectField name="title" options={titleOptions} className={selectClass} />
              </Field>
              <Field label="First name">
                <ControlledInputField name="firstName" placeholder="e.g. Tamim" className={inputClass} />
              </Field>
              <Field label="Last name">
                <ControlledInputField name="lastName" placeholder="e.g. Rahman" className={inputClass} />
              </Field>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Email" name="email" hint="We'll send your confirmation here.">
                <ControlledInputField name="email" type="email" placeholder="you@example.com" className={inputClass} />
              </Field>
              <Field label="Country of residence">
                <ControlledSelectField name="country" options={countryOptions} className={selectClass} />
              </Field>
            </div>

            {country === "OTHER" && (
              <Field label="Your country" className="mt-4">
                <ControlledInputField name="otherCountry" placeholder="e.g. Brazil" className={inputClass} />
              </Field>
            )}

            <Field
              label="Mobile number"
              name="phone"
              hint={
                isLocal
                  ? "Bangladeshi mobile, e.g. 01712345678"
                  : "Include your area code. WhatsApp works best for international guests."
              }
              className="mt-4"
            >
              <div className="flex items-start gap-2">
                <div className="w-32 shrink-0 sm:w-48">
                  <ControlledSelectField name="phoneCountry" options={dialOptions} className={selectClass} />
                </div>
                {phoneCountry === "OTHER" && (
                  <div className="w-24 shrink-0">
                    <ControlledInputField name="customDial" placeholder="+971" className={inputClass} />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <ControlledInputField
                    name="phone"
                    type="tel"
                    placeholder={phoneCountry === "BD" ? "01XXXXXXXXX" : "Phone number"}
                    className={inputClass}
                  />
                </div>
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
              <Controller
                name="idType"
                control={control}
                render={({ field }) => (
                  <div className="mb-4 inline-flex rounded-full bg-neutral-100 p-1 text-sm font-medium" role="radiogroup">
                    {(["nid", "passport"] as const).map((type) => (
                      <button
                        key={type}
                        type="button"
                        role="radio"
                        aria-checked={field.value === type}
                        onClick={() => field.onChange(type)}
                        className={`rounded-full px-4 py-1.5 transition ${
                          field.value === type
                            ? "bg-white font-semibold text-sky-700 shadow-sm"
                            : "text-neutral-600 hover:text-neutral-900"
                        }`}
                      >
                        {type === "nid" ? "National ID (NID)" : "Passport"}
                      </button>
                    ))}
                  </div>
                )}
              />
            )}

            <Field label={idKind === "nid" ? "NID number" : "Passport number"} optional>
              <ControlledInputField
                name="idNumber"
                placeholder={idKind === "nid" ? "10, 13 or 17 digits" : "e.g. A01234567"}
                className={`${inputClass} uppercase placeholder:normal-case`}
              />
            </Field>
          </Section>

          <Section step={3} icon={Plane} title="Arrival & requests" subtitle="Requests aren't guaranteed, but we'll do our best.">
            <Field label="Estimated arrival time" optional className="sm:max-w-sm">
              <ControlledSelectField name="arrivalTime" options={arrivalOptions} className={selectClass} />
            </Field>

            <Field label="Special requests" optional className="mt-5">
              <div className={checkboxGridClass}>
                <ControlledCheckboxField name="requests" options={requestOptions} />
              </div>
            </Field>

            <Field label="Anything else?" optional className="mt-4">
              <ControlledTextareaField
                name="note"
                placeholder="Anything else we should know?"
                className="h-28 rounded-xl bg-white focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
              />
            </Field>
          </Section>

          <Section
            step={4}
            icon={Wallet}
            title="Secure your booking"
            subtitle={`Pay ${DEPOSIT_RATE * 100}% now to confirm your room — the rest is paid at the hotel.`}
          >
            <Controller
              name="paymentPlan"
              control={control}
              render={({ field }) => (
                <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="How much to pay now">
                  {(
                    [
                      {
                        value: "deposit",
                        title: `Pay ${DEPOSIT_RATE * 100}% now`,
                        now: deposit,
                        later: total - deposit,
                        badge: "Recommended",
                      },
                      { value: "full", title: "Pay in full now", now: total, later: 0, badge: "" },
                    ] as const
                  ).map((option) => {
                    const selected = field.value === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() => field.onChange(option.value)}
                        className={`relative flex flex-col rounded-2xl border p-4 text-left transition ${
                          selected
                            ? "border-sky-500 bg-sky-50/60 ring-2 ring-sky-100"
                            : "border-neutral-200 hover:border-sky-200"
                        }`}
                      >
                        <span className="flex items-center justify-between gap-2">
                          <span className="flex items-center gap-2 text-sm font-bold text-neutral-900">
                            <span
                              className={`flex size-4 shrink-0 items-center justify-center rounded-full border-2 ${
                                selected ? "border-sky-600" : "border-neutral-300"
                              }`}
                            >
                              {selected && <span className="size-2 rounded-full bg-sky-600" />}
                            </span>
                            {option.title}
                          </span>
                          {option.badge && (
                            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                              {option.badge}
                            </span>
                          )}
                        </span>
                        <span className="mt-3 text-2xl font-extrabold text-neutral-900">
                          BDT {option.now.toLocaleString()}
                        </span>
                        <span className="text-xs text-neutral-500">
                          {option.later > 0
                            ? `then BDT ${option.later.toLocaleString()} at check-in`
                            : "Nothing to pay at check-in"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            />

            <p className="mt-5 text-sm font-medium text-neutral-800">Pay with</p>
            <Controller
              name="paymentMethod"
              control={control}
              render={({ field }) => (
                <div className="mt-1.5 grid grid-cols-2 gap-2.5 sm:grid-cols-4" role="radiogroup" aria-label="Payment method">
                  {methodChoices.map(({ value, label, detail, logos }) => {
                    const selected = field.value === value;
                    return (
                      <button
                        key={value}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() => field.onChange(value)}
                        className={`flex flex-col items-center gap-2 rounded-2xl border px-3 py-3.5 text-center transition ${
                          selected
                            ? "border-sky-500 bg-sky-50/60 ring-2 ring-sky-100"
                            : "border-neutral-200 hover:border-sky-200"
                        }`}
                      >
                        <span className="flex h-8 items-center justify-center gap-1.5">
                          {logos.map((logo) => (
                            <Image key={logo} src={logo} alt="" width={56} height={32} className="max-h-7 w-auto object-contain" />
                          ))}
                        </span>
                        <span>
                          <span className="block text-sm font-semibold text-neutral-900">{label}</span>
                          <span className="block text-[11px] text-neutral-500">{detail}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            />

            <div className="mt-4 flex gap-2.5 rounded-2xl bg-emerald-50 p-3 text-sm text-emerald-800">
              <ShieldCheck className="mt-0.5 size-4 shrink-0" />
              <p>
                Secure payment in BDT — we never see or store your card number or wallet PIN. Cancel for free up to 24
                hours before check-in and your {plan === "full" ? "payment" : "deposit"} is refunded in full.
              </p>
            </div>
          </Section>

          <div className="rounded-3xl border border-neutral-200/80 bg-white p-5 shadow-sm md:p-6">
            <div className="[&_label]:text-sm [&_label]:leading-snug [&_label]:text-neutral-700 [&_[data-state=checked]]:border-sky-600 [&_[data-state=checked]]:bg-sky-600 [&>div>div]:items-start [&_button]:mt-0.5">
              <ControlledCheckboxField name="acceptTerms" options={termsOptions} />
            </div>
            <FieldError name="acceptTerms" />
            <Link
              href={`/hotel-management/rooms/${selection.roomId}#policies`}
              target="_blank"
              className="ml-6 mt-1 inline-block text-xs font-semibold text-sky-700 hover:underline"
            >
              Read the house rules
            </Link>

            <button
              type="submit"
              disabled={confirming}
              className="mt-5 flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-sky-600 text-base font-semibold text-white shadow-lg shadow-sky-600/25 transition hover:bg-sky-700 disabled:opacity-70"
            >
              {confirming ? (
                <>
                  <Loader2 className="size-5 animate-spin" /> Processing BDT {dueNow.toLocaleString()} via {methodLabel}…
                </>
              ) : (
                <>
                  <Lock className="size-4" /> {`Pay BDT ${dueNow.toLocaleString()} & confirm`}
                </>
              )}
            </button>
            <p className="mt-2 text-center text-xs text-neutral-500">
              {plan === "deposit"
                ? `Remaining BDT ${(total - deposit).toLocaleString()} is paid at the hotel on arrival.`
                : "Paid in full — nothing more to pay at the hotel."}{" "}
              Instant confirmation by email.
            </p>
          </div>
        </form>
      </FormProvider>

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
          dueNow={dueNow}
          plan={plan}
          currency={currency}
          onCurrencyChange={(next) => setCurrencyChoice({ country, currency: next })}
        />
      </aside>
    </div>
  );
}
