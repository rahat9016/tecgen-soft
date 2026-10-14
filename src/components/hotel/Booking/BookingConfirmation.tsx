"use client";

import Link from "next/link";
import { differenceInCalendarDays, format } from "date-fns";
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
import { paymentMethodInfo } from "@/src/lib/hotelPayment";
import { dayOf, statusLabels } from "@/src/lib/hotel-store/format";
import {
  cancellationTerms,
  dueOf,
  folioTotal,
  guestBookings,
  isLive,
  paidOf,
  paymentStatus,
  siteHotel,
  useCurrentGuest,
  useCurrentStaff,
  useHotelDB,
  useHydrated,
  useSession,
} from "@/src/lib/hotel-store/store";
import type { Booking } from "@/src/lib/hotel-store/types";
import BookingSteps from "./BookingSteps";
import PrintableInvoice, { invoiceNumber, printWithTitle } from "./PrintableInvoice";

// Show only the last 4 characters of an ID on screen and on the printed invoice.
const maskId = (id: string) => (id.length > 4 ? `•••• ${id.slice(-4)}` : id);

/** Builds an .ics file so the stay can be added to Google/Apple/Outlook calendars. */
function downloadCalendarFile(
  booking: Booking,
  hotel: { name: string; address: string; phone: string },
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
    `UID:${booking.code}@tripwave`,
    `DTSTAMP:${format(new Date(), "yyyyMMdd'T'HHmmss")}`,
    `DTSTART:${toIcsTime(dayOf(booking.checkIn), checkInTime)}`,
    `DTEND:${toIcsTime(dayOf(booking.checkOut), checkOutTime)}`,
    `SUMMARY:Stay at ${hotel.name} — ${booking.roomName}`,
    `LOCATION:${hotel.address.replace(/,/g, "\\,")}`,
    `DESCRIPTION:Booking ID ${booking.code}. Hotel phone ${hotel.phone}.`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  const url = URL.createObjectURL(
    new Blob([lines.join("\r\n")], { type: "text/calendar" })
  );
  const link = Object.assign(document.createElement("a"), {
    href: url,
    download: `${booking.code}.ics`,
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
    <section className="rounded-md border border-neutral-200/80 bg-white p-5 shadow-sm md:p-6">
      <h2 className="flex items-center gap-2 font-bold text-neutral-900">
        <span className="flex size-8 items-center justify-center rounded-md bg-sky-50 text-sky-600">
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
  const db = useHotelDB();
  const ses = useSession();
  const user = useCurrentGuest();
  const staff = useCurrentStaff();
  // Bookings live in the client store, so wait for it before deciding "not found".
  const hydrated = useHydrated();
  if (!hydrated) return null;

  // Only the guest who booked (or hotel staff) can open a booking.
  const booking = (staff ? db.bookings : guestBookings(db, ses, user)).find((b) => b.code === bookingId);
  if (!booking) {
    return (
      <div className="container py-16">
        <div className="mx-auto flex max-w-md flex-col items-center gap-3 rounded-md border border-dashed border-neutral-200 bg-white p-10 text-center">
          <span className="flex size-12 items-center justify-center rounded-md bg-neutral-100 text-neutral-500">
            <SearchX className="size-6" />
          </span>
          <p className="font-semibold text-neutral-900">
            We couldn&rsquo;t find this booking
          </p>
          <p className="text-sm text-neutral-500">
            {user
              ? "It isn't linked to your account. Check your confirmation email for the details."
              : "Log in with the account you booked with to see it."}
          </p>
          <Link
            href={user ? "/hotel-management/my-bookings" : `/hotel-management/login?next=${encodeURIComponent(`/hotel-management/booking-success?bookingId=${bookingId}`)}`}
            className="mt-1 text-sm font-semibold text-sky-700 hover:underline"
          >
            {user ? "View my bookings" : "Log in"}
          </Link>
        </div>
      </div>
    );
  }

  const { guest } = booking;
  const hotel = siteHotel(db);
  const checkIn = dayOf(booking.checkIn);
  const checkOut = dayOf(booking.checkOut);
  const times = { checkIn: db.settings.checkInTime, checkOut: db.settings.checkOutTime };
  const terms = cancellationTerms(db, booking);
  const freeCancellation = terms.free;
  const roomImage = db.roomTypes.find((t) => t.id === booking.roomTypeId)?.images[0] ?? hotel.images[0];
  const firstPayment = booking.payments.find((p) => p.kind !== "refund" && !p.void);
  const paidStatus = paymentStatus(booking);
  const payment = {
    paid: paidOf(booking),
    balance: dueOf(booking),
    method: paymentMethodInfo[firstPayment?.method ?? "cash"] ?? paymentMethodInfo.cash,
    status: paidStatus.label,
    fullyPaid: isLive(booking) && dueOf(booking) === 0,
  };
  const pending = booking.status === "pending";
  const closed = !isLive(booking);
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
      await navigator.clipboard.writeText(booking.code);
      toast.success("Booking ID copied");
    } catch {
      toast.error("Couldn't copy — please note it down");
    }
  };

  const actionClass =
    "flex flex-col items-center gap-1.5 rounded-md border border-neutral-200 bg-white px-2 py-3 text-xs font-semibold text-neutral-700 transition hover:border-sky-200 hover:text-sky-700";

  return (
    <>
      <PrintableInvoice booking={booking} db={db} />
      <div className="container py-8 md:py-10 print:hidden">
        <div className="mx-auto max-w-6xl">
          <div>
            <BookingSteps current={3} />
          </div>

          {/* Success banner */}
          <div
            className={`relative mt-6 overflow-hidden rounded-md bg-gradient-to-br p-6 text-white shadow-xl md:p-8 ${
              closed
                ? "from-neutral-600 to-neutral-800 shadow-neutral-600/20"
                : pending
                  ? "from-amber-500 via-orange-500 to-sky-600 shadow-amber-600/20"
                  : "from-emerald-500 via-teal-500 to-sky-600 shadow-emerald-600/20"
            }`}
          >
            <div className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-white/10" />
            <div className="pointer-events-none absolute -bottom-24 right-40 size-56 rounded-full bg-white/10" />

            <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-4">
                <span className="relative flex size-14 shrink-0 items-center justify-center rounded-md bg-white text-emerald-600 shadow-lg">
                  <span className="absolute inset-0 animate-ping rounded-md bg-white/40 [animation-iteration-count:2]" />
                  <Check className="relative size-7" strokeWidth={3} />
                </span>
                <div>
                  <p className="text-sm font-medium text-white/80">
                    {pending ? "Booking received" : statusLabels[booking.status]}
                  </p>
                  <h1 className="mt-0.5 text-2xl font-extrabold md:text-3xl">
                    {closed
                      ? `This booking is ${statusLabels[booking.status].toLowerCase()}`
                      : pending
                        ? `Thanks, ${firstName} — almost there!`
                        : booking.status === "checked-out"
                          ? `Thanks for staying, ${firstName}!`
                          : `You’re all set, ${firstName}!`}
                  </h1>
                  <p className="mt-1 max-w-xl text-sm text-white/90">
                    {closed
                      ? booking.cancelReason ?? "No rooms are held for these dates."
                      : pending
                        ? `Your payment is in. ${hotel.name} will confirm your ${booking.roomName} shortly — you'll get a notification.`
                        : `Your ${booking.roomName} at ${hotel.name} is reserved${
                            daysToGo > 0 ? ` — ${daysToGo} day${daysToGo !== 1 ? "s" : ""} to go.` : "."
                          }`}
                  </p>
                </div>
              </div>

              <div className="rounded-md border border-white/25 bg-white/15 p-4 backdrop-blur-md md:min-w-64">
                <p className="text-xs font-medium uppercase tracking-wider text-white/75">
                  Booking ID
                </p>
                <div className="mt-1 flex items-center justify-between gap-3">
                  <p className="font-mono text-xl font-bold tracking-wide">
                    {booking.code}
                  </p>
                  <button
                    type="button"
                    onClick={copyBookingId}
                    aria-label="Copy booking ID"
                    className="flex size-9 items-center justify-center rounded-md bg-white/20 transition hover:bg-white/30"
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
              <span className="flex items-center gap-1.5 rounded-md bg-white/15 px-3 py-1.5 backdrop-blur-sm">
                <Mail className="size-3.5" /> Confirmation sent to {guest.email}
              </span>
              <span className="flex items-center gap-1.5 rounded-md bg-white/15 px-3 py-1.5 backdrop-blur-sm">
                <MessageSquareText className="size-3.5" /> SMS sent to{" "}
                {guest.phone}
              </span>
              {payment.paid > 0 && (
                <span className="flex items-center gap-1.5 rounded-md bg-white/15 px-3 py-1.5 backdrop-blur-sm">
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
              <section className="order-1 overflow-hidden rounded-md border border-neutral-200/80 bg-white shadow-sm">
                <div className="grid sm:grid-cols-[220px_1fr]">
                  <div className="relative h-48 sm:h-full">
                    <img
                      src={roomImage}
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
                      {hotel.name} &middot; {hotel.address}
                    </p>

                    <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-stretch gap-2">
                      <div className="rounded-md bg-neutral-50 p-3">
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
                        <span className="flex items-center gap-1 rounded-md bg-sky-600 px-2.5 py-1 text-xs font-bold text-white">
                          <Moon className="size-3" /> {booking.nights}
                        </span>
                      </span>
                      <div className="rounded-md bg-neutral-50 p-3">
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

                    {freeCancellation && !closed && (
                      <p className="mt-4 flex items-start gap-2 rounded-md bg-emerald-50 p-3 text-sm text-emerald-800">
                        <BadgeCheck className="mt-0.5 size-4 shrink-0" />
                        <span>
                          <span className="font-semibold">
                            Free cancellation
                          </span>{" "}
                          until {format(new Date(terms.freeUntil), "EEE, dd MMM, h:mm a")}. Cancel from My bookings.
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
                        <span className="relative flex size-9 shrink-0 items-center justify-center rounded-md bg-neutral-50 text-sky-600 ring-1 ring-neutral-200">
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
                    className="mt-5 flex items-center gap-3 rounded-md border border-neutral-200 p-3 text-sm transition hover:border-sky-200 hover:bg-sky-50/50"
                  >
                    <Headphones className="size-5 shrink-0 text-sky-600" />
                    <span>
                      <span className="block font-semibold text-neutral-900">
                        Need to change something?
                      </span>
                      <span className="block text-neutral-500">
                        Call us 24/7 on {phoneDisplay} and quote{" "}
                        {booking.code}.
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
                className="rounded-md border border-neutral-200/80 bg-white p-5 shadow-xl shadow-neutral-900/5 md:p-6"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-neutral-900">Invoice</p>
                    <p className="text-xs text-neutral-500">
                      #{booking.code}
                    </p>
                  </div>
                  <span
                    className={`rounded-md px-2.5 py-1 text-xs font-semibold ${
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
                    <span>Service fee ({db.settings.serviceFeeRate}%)</span>
                    <span>BDT {booking.serviceFee.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-neutral-600">
                    <span>VAT ({db.settings.vatRate}%)</span>
                    <span>BDT {booking.tax.toLocaleString()}</span>
                  </div>
                  {booking.charges.map((c) => (
                    <div key={c.id} className="flex justify-between gap-3 text-neutral-600">
                      <span className="truncate">{c.description}</span>
                      <span className="shrink-0">
                        {c.amount < 0 ? "− " : ""}BDT {Math.abs(c.amount).toLocaleString()}
                      </span>
                    </div>
                  ))}
                  <div className="flex items-end justify-between border-t border-dashed border-neutral-200 pt-3">
                    <span className="font-bold text-neutral-900">Total</span>
                    <span className="text-2xl font-extrabold text-neutral-900">
                      BDT {folioTotal(booking).toLocaleString()}
                    </span>
                  </div>
                  {payment.paid > 0 && (
                    <div className="flex justify-between font-medium text-emerald-700">
                      <span>Paid{booking.payments.filter((p) => !p.void).length > 1 ? " (net)" : ` via ${payment.method.label}`}</span>
                      <span>− BDT {payment.paid.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between rounded-md bg-sky-50 px-3 py-2.5">
                    <span className="font-bold text-sky-900">
                      {payment.balance > 0 && booking.status !== "checked-in"
                        ? "Balance due at check-in"
                        : "Balance due"}
                    </span>
                    <span className="font-bold text-sky-900">
                      BDT {payment.balance.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-3 rounded-md bg-neutral-50 p-3 text-sm">
                  <span className="flex h-9 min-w-12 shrink-0 items-center justify-center gap-1 rounded-md bg-white px-1.5 shadow-sm">
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
                      `${invoiceNumber(booking.code)} - ${hotel.name}`
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
                      hotel,
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
                  className="flex h-12 items-center justify-center rounded-md bg-sky-600 text-sm font-semibold text-white shadow-lg shadow-sky-600/25 transition hover:bg-sky-700"
                >
                  View my bookings
                </Link>
                <Link
                  href="/hotel-management"
                  className="flex h-11 items-center justify-center rounded-md text-sm font-semibold text-neutral-600 transition hover:bg-neutral-100"
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
