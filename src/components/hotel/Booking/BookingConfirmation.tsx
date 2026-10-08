"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { differenceInCalendarDays, format, subDays } from "date-fns";
import { toast } from "react-toastify";
import {
  BadgeCheck,
  BedDouble,
  Building2,
  CalendarPlus,
  Check,
  Clock3,
  Copy,
  Globe2,
  Headphones,
  IdCard,
  LogIn,
  LogOut,
  Mail,
  MapPin,
  MessageSquareText,
  Moon,
  Navigation,
  Plane,
  Printer,
  SearchX,
  Smartphone,
  StickyNote,
  UserRound,
  Users,
  Wallet,
} from "lucide-react";
import type { BookingRecord } from "@/src/lib/hotelBookingHistory";
import { useBookingHistory } from "@/src/lib/useBookingHistory";
import { hotel } from "@/src/data/hotels";
import { parseCheckTimes } from "@/src/components/hotel/HotelDetails/PoliciesSection";
import { bookingPayment } from "@/src/lib/hotelPayment";
import BookingSteps from "./BookingSteps";
import PrintableInvoice, { invoiceNumber } from "./PrintableInvoice";

// Show only the last 4 characters of an ID on screen and on the printed invoice.
const maskId = (id: string) => (id.length > 4 ? `•••• ${id.slice(-4)}` : id);

const noopSubscribe = () => () => {};

// Print/Save-as-PDF uses the document title as the file name, so swap it for the invoice number while printing.
function printWithTitle(title: string) {
  const previousTitle = document.title;
  document.title = title;
  window.print();
  document.title = previousTitle;
}

/** Builds an .ics file so the stay can be added to Google/Apple/Outlook calendars. */
function downloadCalendarFile(
  booking: BookingRecord,
  checkInTime?: string,
  checkOutTime?: string
) {
  const toIcsTime = (date: Date, time?: string) => {
    const match = time?.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    let hours = match ? Number(match[1]) % 12 : 0;
    if (match?.[3].toUpperCase() === "PM") hours += 12;
    return `${format(date, "yyyyMMdd")}T${String(hours).padStart(2, "0")}${match ? match[2] : "00"}00`;
  };
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//TripWave//Hotel Booking//EN",
    "BEGIN:VEVENT",
    `UID:${booking.bookingId}@tripwave`,
    `DTSTAMP:${format(new Date(), "yyyyMMdd'T'HHmmss")}`,
    `DTSTART:${toIcsTime(new Date(booking.checkIn), checkInTime)}`,
    `DTEND:${toIcsTime(new Date(booking.checkOut), checkOutTime)}`,
    `SUMMARY:Stay at ${booking.hotelName} — ${booking.roomName}`,
    `LOCATION:${hotel.address.replace(/,/g, "\\,")}`,
    `DESCRIPTION:Booking ID ${booking.bookingId}. Hotel phone ${hotel.phone}.`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  const url = URL.createObjectURL(
    new Blob([lines.join("\r\n")], { type: "text/calendar" })
  );
  const link = Object.assign(document.createElement("a"), {
    href: url,
    download: `${booking.bookingId}.ics`,
  });
  link.click();
  URL.revokeObjectURL(url);
}

function Card({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: typeof BedDouble;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-neutral-200/80 bg-white p-5 shadow-sm md:p-6">
      <h2 className="flex items-center gap-2 font-bold text-neutral-900">
        <span className="flex size-8 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
          <Icon className="size-4" />
        </span>
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default function BookingConfirmation({
  bookingId,
}: {
  bookingId: string;
}) {
  const history = useBookingHistory();
  // Bookings live in this browser's storage, so wait for the client before deciding "not found".
  const hydrated = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false
  );
  if (!hydrated) return null;

  const booking = history.find((b) => b.bookingId === bookingId);
  if (!booking) {
    return (
      <div className="container py-16">
        <div className="mx-auto flex max-w-md flex-col items-center gap-3 rounded-3xl border border-dashed border-neutral-200 bg-white p-10 text-center">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-500">
            <SearchX className="size-6" />
          </span>
          <p className="font-semibold text-neutral-900">
            We couldn&rsquo;t find this booking
          </p>
          <p className="text-sm text-neutral-500">
            Bookings are saved in the browser they were made in. Check your
            confirmation email for the details.
          </p>
          <Link
            href="/hotel-management/my-bookings"
            className="mt-1 text-sm font-semibold text-sky-700 hover:underline"
          >
            View my bookings
          </Link>
        </div>
      </div>
    );
  }

  const { guest } = booking;
  const checkIn = new Date(booking.checkIn);
  const checkOut = new Date(booking.checkOut);
  const times = parseCheckTimes(hotel.policies);
  const freeCancellation = hotel.policies.some((p) =>
    p.toLowerCase().includes("free cancellation")
  );
  const payment = bookingPayment(booking);
  const nameParts = guest.name.split(" ");
  const firstName = nameParts.length > 2 ? nameParts[1] : nameParts[0];
  const isInternational = Boolean(
    guest.country && guest.country !== "Bangladesh"
  );
  const daysToGo = differenceInCalendarDays(checkIn, new Date());
  const phoneDisplay = hotel.phone.replace(/^\+880(\d{4})(\d+)$/, "+880 $1-$2");
  const directions = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(hotel.address)}`;

  const guestDetails = [
    { icon: UserRound, label: "Lead guest", value: guest.name },
    { icon: Mail, label: "Email", value: guest.email },
    { icon: Smartphone, label: "Phone", value: guest.phone },
    guest.country && { icon: Globe2, label: "Country", value: guest.country },
    guest.idNumber && {
      icon: IdCard,
      label: guest.idType === "nid" ? "NID" : "Passport",
      value: maskId(guest.idNumber.toUpperCase()),
    },
    guest.arrivalTime && {
      icon: Clock3,
      label: "Arrival",
      value: guest.arrivalTime,
    },
    guest.airportPickup && {
      icon: Plane,
      label: "Airport pickup",
      value: "Requested — we'll confirm the price",
    },
    guest.note && { icon: StickyNote, label: "Requests", value: guest.note },
  ].filter(Boolean) as { icon: typeof Mail; label: string; value: string }[];

  const nextSteps = [
    ...(payment.balance > 0 && payment.paid > 0
      ? [
          {
            icon: Wallet,
            title: `Pay BDT ${payment.balance.toLocaleString()} at check-in`,
            text: "Settle the remaining balance at the front desk by cash, card or mobile wallet.",
          },
        ]
      : []),
    {
      icon: Mail,
      title: "Check your inbox",
      text: `Your confirmation and invoice are on their way to ${guest.email}.`,
    },
    {
      icon: IdCard,
      title: isInternational ? "Bring your passport" : "Bring a photo ID",
      text: isInternational
        ? "We'll need your passport (and visa, if required) at check-in."
        : "Your NID or passport is needed at the front desk.",
    },
    {
      icon: LogIn,
      title: `Arrive from ${times?.checkIn ?? "check-in time"}`,
      text: guest.arrivalTime
        ? `We've noted your arrival at ${guest.arrivalTime}.`
        : "Let us know your arrival time if you can — we'll have the room ready.",
    },
  ];

  const copyBookingId = async () => {
    try {
      await navigator.clipboard.writeText(booking.bookingId);
      toast.success("Booking ID copied");
    } catch {
      toast.error("Couldn't copy — please note it down");
    }
  };

  const actionClass =
    "flex flex-col items-center gap-1.5 rounded-2xl border border-neutral-200 bg-white px-2 py-3 text-xs font-semibold text-neutral-700 transition hover:border-sky-200 hover:text-sky-700";

  return (
    <>
      <PrintableInvoice booking={booking} />
      <div className="container py-8 md:py-10 print:hidden">
        <div className="mx-auto max-w-6xl">
          <div>
            <BookingSteps current={3} />
          </div>

          {/* Success banner */}
          <div className="relative mt-6 overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 via-teal-500 to-sky-600 p-6 text-white shadow-xl shadow-emerald-600/20 md:p-8">
            <div className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-white/10" />
            <div className="pointer-events-none absolute -bottom-24 right-40 size-56 rounded-full bg-white/10" />

            <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-4">
                <span className="relative flex size-14 shrink-0 items-center justify-center rounded-2xl bg-white text-emerald-600 shadow-lg">
                  <span className="absolute inset-0 animate-ping rounded-2xl bg-white/40 [animation-iteration-count:2]" />
                  <Check className="relative size-7" strokeWidth={3} />
                </span>
                <div>
                  <p className="text-sm font-medium text-white/80">
                    Booking confirmed
                  </p>
                  <h1 className="mt-0.5 text-2xl font-extrabold md:text-3xl">
                    You&rsquo;re all set, {firstName}!
                  </h1>
                  <p className="mt-1 max-w-xl text-sm text-white/90">
                    Your {booking.roomName} at {booking.hotelName} is reserved
                    {daysToGo > 0
                      ? ` — ${daysToGo} day${daysToGo !== 1 ? "s" : ""} to go.`
                      : "."}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-white/25 bg-white/15 p-4 backdrop-blur-md md:min-w-64">
                <p className="text-xs font-medium uppercase tracking-wider text-white/75">
                  Booking ID
                </p>
                <div className="mt-1 flex items-center justify-between gap-3">
                  <p className="font-mono text-xl font-bold tracking-wide">
                    {booking.bookingId}
                  </p>
                  <button
                    type="button"
                    onClick={copyBookingId}
                    aria-label="Copy booking ID"
                    className="flex size-9 items-center justify-center rounded-xl bg-white/20 transition hover:bg-white/30"
                  >
                    <Copy className="size-4" />
                  </button>
                </div>
                <p className="mt-1 text-xs text-white/75">
                  Booked{" "}
                  {format(new Date(booking.createdAt), "dd MMM yyyy, h:mm a")}
                </p>
              </div>
            </div>

            <div className="relative mt-5 flex flex-wrap gap-2 text-xs font-medium">
              <span className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 backdrop-blur-sm">
                <Mail className="size-3.5" /> Confirmation sent to {guest.email}
              </span>
              <span className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 backdrop-blur-sm">
                <MessageSquareText className="size-3.5" /> SMS sent to{" "}
                {guest.phone}
              </span>
              {payment.paid > 0 && (
                <span className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 backdrop-blur-sm">
                  <BadgeCheck className="size-3.5" /> BDT{" "}
                  {payment.paid.toLocaleString()} paid via{" "}
                  {payment.method.label}
                </span>
              )}
            </div>
          </div>

          <div className="mt-6 grid items-start gap-5 lg:grid-cols-[1fr_380px] lg:gap-6">
            <div className="contents lg:block lg:space-y-5">
              {/* Stay */}
              <section className="order-1 overflow-hidden rounded-3xl border border-neutral-200/80 bg-white shadow-sm">
                <div className="grid sm:grid-cols-[220px_1fr]">
                  <div className="relative h-48 sm:h-full">
                    <img
                      src={booking.hotelImage}
                      alt={booking.roomName}
                      className="absolute inset-0 size-full object-cover"
                    />
                  </div>
                  <div className="p-5 md:p-6">
                    <p className="text-xs font-semibold uppercase tracking-wider text-sky-600">
                      Your stay
                    </p>
                    <h2 className="mt-1 text-xl font-bold text-neutral-900">
                      {booking.roomName}
                    </h2>
                    <p className="mt-1 flex items-start gap-1.5 text-sm text-neutral-600">
                      <MapPin className="mt-0.5 size-4 shrink-0 text-sky-600" />
                      {booking.hotelName} &middot; {hotel.address}
                    </p>

                    <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-stretch gap-2">
                      <div className="rounded-2xl bg-neutral-50 p-3">
                        <p className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                          <LogIn className="size-3.5" /> Check-in
                        </p>
                        <p className="mt-1 text-sm font-bold text-neutral-900">
                          {format(checkIn, "EEE, dd MMM yyyy")}
                        </p>
                        {times && (
                          <p className="text-xs text-neutral-500">
                            From {times.checkIn}
                          </p>
                        )}
                      </div>
                      <span className="flex items-center">
                        <span className="flex items-center gap-1 rounded-full bg-sky-600 px-2.5 py-1 text-xs font-bold text-white">
                          <Moon className="size-3" /> {booking.nights}
                        </span>
                      </span>
                      <div className="rounded-2xl bg-neutral-50 p-3">
                        <p className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                          <LogOut className="size-3.5" /> Check-out
                        </p>
                        <p className="mt-1 text-sm font-bold text-neutral-900">
                          {format(checkOut, "EEE, dd MMM yyyy")}
                        </p>
                        {times && (
                          <p className="text-xs text-neutral-500">
                            Until {times.checkOut}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-neutral-600">
                      <span className="flex items-center gap-1.5">
                        <Users className="size-4 text-neutral-400" />
                        {booking.adults} adult{booking.adults !== 1 ? "s" : ""}
                        {booking.children > 0 &&
                          `, ${booking.children} child${booking.children !== 1 ? "ren" : ""}`}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <BedDouble className="size-4 text-neutral-400" />
                        {booking.rooms} room{booking.rooms !== 1 ? "s" : ""}{" "}
                        &middot; {booking.nights} night
                        {booking.nights !== 1 ? "s" : ""}
                      </span>
                    </div>

                    {freeCancellation && (
                      <p className="mt-4 flex items-start gap-2 rounded-2xl bg-emerald-50 p-3 text-sm text-emerald-800">
                        <BadgeCheck className="mt-0.5 size-4 shrink-0" />
                        <span>
                          <span className="font-semibold">
                            Free cancellation
                          </span>{" "}
                          until {format(subDays(checkIn, 1), "EEE, dd MMM")}
                          {times ? `, ${times.checkIn}` : ""}.
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              </section>

              <div className="order-3">
                <Card title="Guest details" icon={UserRound}>
                  <dl className="grid gap-4 sm:grid-cols-2">
                    {guestDetails.map(({ icon: Icon, label, value }) => (
                      <div key={label} className="flex items-start gap-2.5">
                        <Icon className="mt-0.5 size-4 shrink-0 text-sky-600" />
                        <div className="min-w-0">
                          <dt className="text-xs text-neutral-500">{label}</dt>
                          <dd className="break-words text-sm font-medium text-neutral-900">
                            {value}
                          </dd>
                        </div>
                      </div>
                    ))}
                  </dl>
                </Card>
              </div>

              <div className="order-4">
                <Card title="What happens next" icon={Clock3}>
                  <ol className="space-y-4">
                    {nextSteps.map(({ icon: Icon, title, text }, i) => (
                      <li key={title} className="flex gap-3">
                        <span className="relative flex size-9 shrink-0 items-center justify-center rounded-xl bg-neutral-50 text-sky-600 ring-1 ring-neutral-200">
                          <Icon className="size-4" />
                          <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-sky-600 text-[10px] font-bold text-white">
                            {i + 1}
                          </span>
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-neutral-900">
                            {title}
                          </p>
                          <p className="text-sm text-neutral-500">{text}</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                  <a
                    href={`tel:${hotel.phone}`}
                    className="mt-5 flex items-center gap-3 rounded-2xl border border-neutral-200 p-3 text-sm transition hover:border-sky-200 hover:bg-sky-50/50"
                  >
                    <Headphones className="size-5 shrink-0 text-sky-600" />
                    <span>
                      <span className="block font-semibold text-neutral-900">
                        Need to change something?
                      </span>
                      <span className="block text-neutral-500">
                        Call us 24/7 on {phoneDisplay} and quote{" "}
                        {booking.bookingId}.
                      </span>
                    </span>
                  </a>
                </Card>
              </div>
            </div>

            {/* Invoice */}
            <aside className="order-2 space-y-4 lg:sticky lg:top-24 lg:order-none">
              <section
                id="invoice"
                className="rounded-3xl border border-neutral-200/80 bg-white p-5 shadow-xl shadow-neutral-900/5 md:p-6"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-neutral-900">Invoice</p>
                    <p className="text-xs text-neutral-500">
                      #{booking.bookingId}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      payment.fullyPaid
                        ? "bg-emerald-600 text-white"
                        : payment.paid > 0
                          ? "bg-sky-800 text-white"
                          : "bg-sky-50 text-sky-800"
                    }`}
                  >
                    {payment.status}
                  </span>
                </div>

                <div className="mt-5 space-y-2.5 text-sm">
                  <div className="flex justify-between gap-3 text-neutral-600">
                    <span>
                      BDT {booking.pricePerNight.toLocaleString()} &times;{" "}
                      {booking.nights} night
                      {booking.nights !== 1 ? "s" : ""}
                      {booking.rooms > 1 && ` × ${booking.rooms} rooms`}
                    </span>
                    <span className="shrink-0">
                      BDT {booking.subtotal.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-neutral-600">
                    <span>Service fee (3%)</span>
                    <span>BDT {booking.serviceFee.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-neutral-600">
                    <span>VAT (5%)</span>
                    <span>BDT {booking.tax.toLocaleString()}</span>
                  </div>
                  <div className="flex items-end justify-between border-t border-dashed border-neutral-200 pt-3">
                    <span className="font-bold text-neutral-900">Total</span>
                    <span className="text-2xl font-extrabold text-neutral-900">
                      BDT {booking.total.toLocaleString()}
                    </span>
                  </div>
                  {payment.paid > 0 && (
                    <div className="flex justify-between font-medium text-emerald-700">
                      <span>Paid via {payment.method.label}</span>
                      <span>− BDT {payment.paid.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between rounded-xl bg-sky-50 px-3 py-2.5">
                    <span className="font-bold text-sky-900">
                      {payment.balance > 0
                        ? "Balance due at check-in"
                        : "Balance due"}
                    </span>
                    <span className="font-bold text-sky-900">
                      BDT {payment.balance.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-3 rounded-2xl bg-neutral-50 p-3 text-sm">
                  <span className="flex h-9 min-w-12 shrink-0 items-center justify-center gap-1 rounded-xl bg-white px-1.5 shadow-sm">
                    {payment.method.logos.length > 0 ? (
                      payment.method.logos.map((logo) => (
                        // eslint-disable-next-line @next/next/no-img-element -- small local logos
                        <img
                          key={logo}
                          src={logo}
                          alt=""
                          className="max-h-6 w-auto"
                        />
                      ))
                    ) : (
                      <Building2 className="size-4 text-sky-600" />
                    )}
                  </span>
                  <div>
                    <p className="font-semibold text-neutral-900">
                      {payment.method.label}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {`${payment.status} · charged in BDT`}
                    </p>
                  </div>
                </div>

                <p className="mt-4 text-xs text-neutral-500">
                  Billed to {guest.name} &middot; {guest.email}
                </p>
              </section>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() =>
                    printWithTitle(
                      `${invoiceNumber(booking.bookingId)} - ${hotel.name}`
                    )
                  }
                  className={actionClass}
                >
                  <Printer className="size-5" /> Invoice
                </button>
                <button
                  type="button"
                  onClick={() =>
                    downloadCalendarFile(
                      booking,
                      times?.checkIn,
                      times?.checkOut
                    )
                  }
                  className={actionClass}
                >
                  <CalendarPlus className="size-5" /> Calendar
                </button>
                <a
                  href={directions}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={actionClass}
                >
                  <Navigation className="size-5" /> Directions
                </a>
              </div>

              <div className="flex flex-col gap-2">
                <Link
                  href="/hotel-management/my-bookings"
                  className="flex h-12 items-center justify-center rounded-2xl bg-sky-600 text-sm font-semibold text-white shadow-lg shadow-sky-600/25 transition hover:bg-sky-700"
                >
                  View my bookings
                </Link>
                <Link
                  href="/hotel-management"
                  className="flex h-11 items-center justify-center rounded-2xl text-sm font-semibold text-neutral-600 transition hover:bg-neutral-100"
                >
                  Back to home
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </>
  );
}
