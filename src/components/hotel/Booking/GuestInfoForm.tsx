"use client";

import { useEffect, useId, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Controller,
  FormProvider,
  useForm,
  useFormState,
  useWatch,
} from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { differenceInCalendarDays } from "date-fns";
import { toast } from "react-toastify";
import { BedDouble, ChevronDown, Globe2, Loader2, Lock, ShieldCheck } from "lucide-react";
import ControlledInputField from "@/src/components/shared/FromController/ControlledInputField";
import ControlledSelectField from "@/src/components/shared/FromController/ControlledSelectField";
import ControlledTextareaField from "@/src/components/shared/FromController/ControlledTextareaField";
import ControlledCheckboxField from "@/src/components/shared/FromController/ControlledCheckboxField";
import { useAppDispatch, useAppSelector } from "@/src/lib/redux/hooks";
import {
  clearSelection,
  setLastBookingId,
} from "@/src/lib/redux/features/hotelBooking/hotelBookingSlice";
import { countries, getCountry } from "@/src/data/countries";
import { toDayKey } from "@/src/lib/hotelDates";
import {
  onlinePaymentMethods,
  paymentMethodInfo,
  type OnlinePaymentMethod,
  type PaymentPlan,
} from "@/src/lib/hotelPayment";
import {
  createOnlineBooking,
  quoteStay,
  useCurrentGuest,
  useHotelDB,
  useHotelSite,
} from "@/src/lib/hotel-store/store";
import BookingSummary from "./BookingSummary";
import {
  AIRPORT_PICKUP,
  guestInfoValidationSchema,
  TERMS_ACCEPTED,
  type GuestInfoFormType,
} from "./schema/GuestInfoSchema";

const UNSURE_ARRIVAL = "unsure";

const countryOptions = [
  ...countries.map((c) => ({ label: c.name, value: c.code })),
  { label: "Other country…", value: "OTHER" },
];
const dialOptions = [
  ...countries.map((c) => ({ label: `+${c.dial} ${c.code}`, value: c.code })),
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

const baseRequests = [
  "Early check-in",
  "Late check-out",
  "High floor",
  "Extra bed",
  "Baby cot",
  "Quiet room",
].map((label) => ({
  label,
  value: label,
}));
const termsOptions = [
  { label: "I agree to the house rules and cancellation policy.", value: TERMS_ACCEPTED },
];

// ControlledCheckboxField renders a vertical list; lay its rows out as a 2-column grid of bordered options.
// An odd last option (the longer airport pickup) takes the full row.
const checkboxGridClass =
  "[&>div]:grid [&>div]:grid-cols-2 [&>div]:gap-2 sm:[&>div]:gap-2.5 [&>div>*]:!m-0 [&>div>div:last-child:nth-child(odd)]:col-span-2 [&>div>div]:rounded-md [&>div>div]:border [&>div>div]:border-neutral-200 [&>div>div]:bg-white [&>div>div]:px-3 [&>div>div]:py-2.5 [&>div>div]:transition [&>div>div:has([data-state=checked])]:border-sky-400 [&>div>div:has([data-state=checked])]:bg-sky-50/60 [&_label]:text-[13px] sm:[&_label]:text-sm [&_label]:leading-snug [&_label]:text-neutral-700 [&_[data-state=checked]]:border-sky-600 [&_[data-state=checked]]:bg-sky-600";

// Passed to the shared controlled fields; border colour is left to them so their error state still shows.
const inputClass =
  "h-11 rounded-md px-3.5 shadow-none placeholder:text-neutral-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-100";
const selectClass =
  "h-11 rounded-md px-3.5 focus:border-sky-400 focus:ring-4 focus:ring-sky-100";

/**
 * A numbered card: the number shows where the guest is, the title says what's asked.
 * Optional cards start folded; they open on tap, or by themselves when one of their fields fails validation.
 */
function Section({
  step,
  title,
  collapsible,
  errorFields = [],
  children,
}: {
  step: number;
  title: string;
  collapsible?: boolean;
  errorFields?: (keyof GuestInfoFormType)[];
  children: ReactNode;
}) {
  const [open, setOpen] = useState(!collapsible);
  const { errors } = useFormState<GuestInfoFormType>({ name: errorFields });
  const shown = open || errorFields.some((field) => errors[field]);
  const bodyId = useId();
  const heading = (
    <>
      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-sky-600 text-xs font-bold text-white">
        {step}
      </span>
      {title}
    </>
  );

  return (
    <section className="rounded-md border border-neutral-200/80 bg-white p-4 shadow-sm sm:p-5 md:p-6">
      {collapsible ? (
        <h2>
          <button
            type="button"
            aria-expanded={shown}
            aria-controls={bodyId}
            onClick={() => setOpen(!shown)}
            className="flex w-full items-center gap-2.5 rounded-md text-left font-bold text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
          >
            {heading}
            <ChevronDown
              className={`ml-auto size-5 shrink-0 text-neutral-500 transition-transform ${shown ? "rotate-180" : ""}`}
              aria-hidden
            />
          </button>
        </h2>
      ) : (
        <h2 className="flex items-center gap-2.5 font-bold text-neutral-900">{heading}</h2>
      )}
      {/* Kept mounted while folded so typed values and validation stay intact. */}
      <div id={bodyId} hidden={!shown} className="mt-4">
        {children}
      </div>
    </section>
  );
}

/** Error line for controllers that don't render their own (e.g. ControlledCheckboxField). */
function FieldError({ name }: { name: keyof GuestInfoFormType }) {
  const { errors } = useFormState<GuestInfoFormType>({ name });
  const message = errors[name]?.message;
  return message ? (
    <div className="mt-1 pl-2 text-xs text-rose-500">{String(message)}</div>
  ) : null;
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
        {optional && (
          <span className="font-normal text-neutral-400"> (optional)</span>
        )}
      </p>
      <div className="mt-1.5">{children}</div>
      {hint && !hasError && (
        <p className="mt-1.5 text-xs text-neutral-500">{hint}</p>
      )}
    </div>
  );
}

export default function GuestInfoForm() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const selection = useAppSelector((state) => state.hotelBooking.selection);
  const hotel = useHotelSite();
  const { settings } = useHotelDB();
  const user = useCurrentGuest();
  const [confirming, setConfirming] = useState(false);
  const methodChoices = onlinePaymentMethods
    .filter((value) => settings.onlineMethods[value])
    .map((value) => ({ value, ...paymentMethodInfo[value] }));
  const airport = hotel.nearby.find((place) => place.type === "airport");
  const requestOptions = [
    ...baseRequests,
    ...(airport
      ? [
          {
            label: "Airport pickup (price on request)",
            value: AIRPORT_PICKUP,
          },
        ]
      : []),
  ];

  const methods = useForm<GuestInfoFormType>({
    resolver: yupResolver(guestInfoValidationSchema),
    defaultValues: {
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
      paymentMethod: methodChoices[0]?.value ?? "bkash",
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

  // Signed-in guests don't retype what their account already knows.
  useEffect(() => {
    if (!user || methods.getValues("email")) return;
    const [first, ...rest] = user.name.split(" ");
    setValue("firstName", first ?? "");
    setValue("lastName", rest.join(" "));
    setValue("email", user.email);
    const local = user.phone.replace(/^\+880\s?/, "0").replace(/[\s-]/g, "");
    if (user.phone.startsWith("+880")) setValue("phone", local);
  }, [user, methods, setValue]);

  if (!selection) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-md border border-dashed border-neutral-200 bg-white p-10 text-center">
        <span className="flex size-12 items-center justify-center rounded-md bg-sky-50 text-sky-600">
          <BedDouble className="size-6" />
        </span>
        <p className="font-semibold text-neutral-900">No room selected yet</p>
        <p className="text-sm text-neutral-500">
          Pick a room and your dates to start a booking.
        </p>
        <Link
          href="/hotel-management/rooms"
          className="mt-1 rounded-md bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-sky-700"
        >
          Browse rooms
        </Link>
      </div>
    );
  }

  const isLocal = country === "BD";
  // Only Bangladeshi residents choose between NID and passport; everyone else books with a passport.
  const idKind = isLocal ? idType : "passport";

  const checkIn = new Date(selection.checkIn!);
  const checkOut = new Date(selection.checkOut!);
  const nights = Math.max(1, differenceInCalendarDays(checkOut, checkIn));
  const { subtotal, serviceFee, tax, total, deposit } = quoteStay(
    settings,
    selection.pricePerNight,
    nights,
    selection.rooms
  );
  const plan = (paymentPlan ?? "deposit") as PaymentPlan;
  const dueNow = plan === "full" ? total : deposit;
  const methodLabel = paymentMethodInfo[paymentMethod ?? "bkash"]?.label ?? "";

  const onSubmit = async (data: GuestInfoFormType) => {
    setConfirming(true);
    // DEMO ONLY: no payment gateway is connected. Before going live, send the guest to the bKash/Nagad/Rocket or
    // card gateway (e.g. SSLCommerz) here and only create the booking once the gateway confirms the payment.
    await new Promise((resolve) => setTimeout(resolve, 1200));

    const dial =
      data.phoneCountry === "OTHER"
        ? data.customDial.replace(/^\+/, "")
        : getCountry(data.phoneCountry)?.dial;
    const localNumber = data.phone.replace(/[\s()-]/g, "").replace(/^0/, "");
    const requests = data.requests.filter(
      (request) => request !== AIRPORT_PICKUP
    );
    const note = [...requests, data.note.trim()].filter(Boolean).join(", ");

    // The store re-checks availability against every booking at the moment of saving.
    const result = createOnlineBooking({
      roomTypeId: selection.roomId,
      checkIn: toDayKey(checkIn),
      checkOut: toDayKey(checkOut),
      rooms: selection.rooms,
      adults: selection.adults,
      children: selection.children,
      plan: data.paymentPlan as PaymentPlan,
      method: data.paymentMethod as OnlinePaymentMethod,
      guest: {
        name: `${data.firstName.trim()} ${data.lastName.trim()}`,
        email: data.email.trim(),
        phone: `+${dial} ${localNumber}`,
        note,
        country:
          data.country === "OTHER"
            ? data.otherCountry
            : getCountry(data.country)?.name,
        idType:
          data.country === "BD"
            ? (data.idType as "nid" | "passport")
            : "passport",
        idNumber: data.idNumber.trim().toUpperCase(),
        arrivalTime:
          data.arrivalTime === UNSURE_ARRIVAL ? "" : data.arrivalTime,
        airportPickup: data.requests.includes(AIRPORT_PICKUP),
      },
    });

    if (!result.ok) {
      setConfirming(false);
      toast.error(
        `Sorry — ${result.error} Please choose other dates or another room.`
      );
      return;
    }

    const booking = result.value;
    dispatch(setLastBookingId(booking.code));
    dispatch(clearSelection());
    toast.success(
      booking.status === "pending"
        ? `Payment of BDT ${dueNow.toLocaleString()} received — the hotel will confirm shortly.`
        : `Payment of BDT ${dueNow.toLocaleString()} received — booking confirmed!`
    );
    router.push(`/hotel-management/booking-success?bookingId=${booking.code}`);
  };

  const summary = (
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
    />
  );

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[1fr_400px]">
      <FormProvider {...methods}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="space-y-5"
        >
          <Section step={1} title="Who's checking in?">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="First name">
                <ControlledInputField
                  name="firstName"
                  placeholder="e.g. Tamim"
                  className={inputClass}
                />
              </Field>
              <Field label="Last name">
                <ControlledInputField
                  name="lastName"
                  placeholder="e.g. Rahman"
                  className={inputClass}
                />
              </Field>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Email" name="email">
                <ControlledInputField
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  className={inputClass}
                />
              </Field>
              <Field label="Country of residence">
                <ControlledSelectField
                  name="country"
                  options={countryOptions}
                  className={selectClass}
                />
              </Field>
            </div>

            {country === "OTHER" && (
              <Field label="Your country" className="mt-4">
                <ControlledInputField
                  name="otherCountry"
                  placeholder="e.g. Brazil"
                  className={inputClass}
                />
              </Field>
            )}

            <Field label="Mobile number" name="phone" className="mt-4">
              <div className="flex items-start gap-2">
                <div className="w-32 shrink-0 sm:w-36">
                  <ControlledSelectField
                    name="phoneCountry"
                    options={dialOptions}
                    className={selectClass}
                  />
                </div>
                {phoneCountry === "OTHER" && (
                  <div className="w-24 shrink-0">
                    <ControlledInputField
                      name="customDial"
                      placeholder="+971"
                      className={inputClass}
                    />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <ControlledInputField
                    name="phone"
                    type="tel"
                    placeholder={
                      phoneCountry === "BD" ? "01XXXXXXXXX" : "Number with area code"
                    }
                    className={inputClass}
                  />
                </div>
              </div>
            </Field>
          </Section>

          <Section step={2} title="ID (optional)" collapsible errorFields={["idType", "idNumber"]}>
            {!isLocal && (
              <p className="mb-4 flex gap-2.5 rounded-md bg-sky-50 p-3 text-sm text-sky-900">
                <Globe2 className="mt-0.5 size-4 shrink-0 text-sky-600" />
                Bring your passport (and visa, if needed) to check-in.
              </p>
            )}

            {isLocal && (
              <Controller
                name="idType"
                control={control}
                render={({ field }) => (
                  <div
                    className="mb-4 grid grid-cols-2 rounded-md bg-neutral-100 p-1 text-sm font-medium"
                    role="radiogroup"
                  >
                    {(["nid", "passport"] as const).map((type) => (
                      <button
                        key={type}
                        type="button"
                        role="radio"
                        aria-checked={field.value === type}
                        onClick={() => field.onChange(type)}
                        className={`whitespace-nowrap rounded-md px-2 py-2 text-center transition ${
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

            <Field label={idKind === "nid" ? "NID number" : "Passport number"}>
              <ControlledInputField
                name="idNumber"
                placeholder={
                  idKind === "nid" ? "10, 13 or 17 digits" : "e.g. A01234567"
                }
                className={`${inputClass} uppercase placeholder:normal-case`}
              />
            </Field>
          </Section>

          <Section step={3} title="Arrival & requests" collapsible errorFields={["arrivalTime", "requests", "note"]}>
            <Field
              label="Estimated arrival time"
              optional
              className="sm:max-w-sm"
            >
              <ControlledSelectField
                name="arrivalTime"
                options={arrivalOptions}
                className={selectClass}
              />
            </Field>

            <Field label="Special requests" optional className="mt-5">
              <div className={checkboxGridClass}>
                <ControlledCheckboxField
                  name="requests"
                  options={requestOptions}
                />
              </div>
            </Field>

            <Field label="Anything else?" optional className="mt-4">
              <ControlledTextareaField
                name="note"
                placeholder="e.g. celebrating an anniversary"
                className="h-24 rounded-md bg-white focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
              />
            </Field>
          </Section>

          <Section step={4} title="Payment">
            <Controller
              name="paymentPlan"
              control={control}
              render={({ field }) => (
                <div
                  className="grid gap-3 sm:grid-cols-2"
                  role="radiogroup"
                  aria-label="How much to pay now"
                >
                  {(
                    [
                      {
                        value: "deposit",
                        title: `Pay ${settings.depositRate}% now`,
                        now: deposit,
                        later: total - deposit,
                        badge: "Recommended",
                      },
                      {
                        value: "full",
                        title: "Pay in full now",
                        now: total,
                        later: 0,
                        badge: "",
                      },
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
                        className={`relative flex flex-col rounded-md border p-4 text-left transition ${
                          selected
                            ? "border-sky-500 bg-sky-50/60 ring-2 ring-sky-100"
                            : "border-neutral-200 hover:border-sky-200"
                        }`}
                      >
                        <span className="flex items-center justify-between gap-2">
                          <span className="flex items-center gap-2 text-sm font-bold text-neutral-900">
                            <span
                              className={`flex size-4 shrink-0 items-center justify-center rounded-full border-2 ${
                                selected
                                  ? "border-sky-600"
                                  : "border-neutral-300"
                              }`}
                            >
                              {selected && (
                                <span className="size-2 rounded-full bg-sky-600" />
                              )}
                            </span>
                            {option.title}
                          </span>
                          {option.badge && (
                            <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
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

            <p className="mt-5 text-sm font-medium text-neutral-800">
              Pay with
            </p>
            <Controller
              name="paymentMethod"
              control={control}
              render={({ field }) => (
                <div
                  className="mt-1.5 grid grid-cols-2 gap-2.5 sm:grid-cols-4"
                  role="radiogroup"
                  aria-label="Payment method"
                >
                  {methodChoices.map(({ value, label, logos }) => {
                    const selected = field.value === value;
                    return (
                      <button
                        key={value}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() => field.onChange(value)}
                        className={`flex flex-col items-center gap-2 rounded-md border px-3 py-3.5 text-center transition ${
                          selected
                            ? "border-sky-500 bg-sky-50/60 ring-2 ring-sky-100"
                            : "border-neutral-200 hover:border-sky-200"
                        }`}
                      >
                        <span className="flex h-8 items-center justify-center gap-1.5">
                          {logos.map((logo) => (
                            <Image
                              key={logo}
                              src={logo}
                              alt=""
                              width={56}
                              height={32}
                              className="max-h-7 w-auto object-contain"
                            />
                          ))}
                        </span>
                        <span className="text-sm font-semibold text-neutral-900">
                          {label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            />

            <p className="mt-3 flex items-center gap-2 text-xs text-neutral-600">
              <ShieldCheck className="size-4 shrink-0 text-emerald-600" />
              Secure payment — we never store your card or wallet PIN.
            </p>
          </Section>

          {/* Phones and tablets: guest details come first, then the stay and price just before paying. */}
          <div className="lg:hidden">{summary}</div>

          <div className="rounded-md border border-neutral-200/80 bg-white p-4 shadow-sm sm:p-5 md:p-6">
            <div className="[&_label]:text-sm [&_label]:leading-snug [&_label]:text-neutral-700 [&_[data-state=checked]]:border-sky-600 [&_[data-state=checked]]:bg-sky-600 [&>div>div]:items-start [&_button]:mt-0.5">
              <ControlledCheckboxField
                name="acceptTerms"
                options={termsOptions}
              />
            </div>
            <FieldError name="acceptTerms" />
            <Link
              href={`/hotel-management/rooms/${selection.roomId}#policies`}
              target="_blank"
              className="ml-6 mt-1 inline-block text-xs font-semibold text-sky-700 hover:underline"
            >
              View rules
            </Link>

            <button
              type="submit"
              disabled={confirming}
              className="mt-5 flex h-13 w-full items-center justify-center gap-2 rounded-md bg-sky-600 text-base font-semibold text-white shadow-lg shadow-sky-600/25 transition hover:bg-sky-700 disabled:opacity-70"
            >
              {confirming ? (
                <>
                  <Loader2 className="size-5 animate-spin" /> Processing BDT{" "}
                  {dueNow.toLocaleString()} via {methodLabel}…
                </>
              ) : (
                <>
                  <Lock className="size-4" />{" "}
                  {`Pay BDT ${dueNow.toLocaleString()} & confirm`}
                </>
              )}
            </button>
          </div>
        </form>
      </FormProvider>

      <aside className="hidden lg:sticky lg:top-24 lg:block">{summary}</aside>
    </div>
  );
}
