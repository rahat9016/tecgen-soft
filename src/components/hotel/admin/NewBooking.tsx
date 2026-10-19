"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import {
  FormProvider,
  useForm,
  useWatch,
  type FieldErrors,
  type Resolver,
} from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  ArrowLeft,
  CircleCheck,
  Eye,
  Loader2,
  Plus,
  Printer,
} from "lucide-react";
import PrintableInvoice, {
  printWithTitle,
} from "@/src/components/hotel/Booking/PrintableInvoice";
import { discountLimit } from "@/src/lib/hotel-store/auth";
import {
  dateLabel,
  shiftDay,
  taka,
  todayKey,
} from "@/src/lib/hotel-store/format";
import {
  createStaffBookings,
  findGuestMatch,
  guestStats,
  suggestUnits,
  updateGuestProfile,
  useCurrentStaff,
  useHotelDB,
  useHydrated,
} from "@/src/lib/hotel-store/store";
import type { Booking, HotelDB } from "@/src/lib/hotel-store/types";
import { cn } from "@/src/lib/utils";
import GuestSection from "./booking-form/GuestSection";
import PaymentSection from "./booking-form/PaymentSection";
import { focusRing } from "./booking-form/parts";
import { RoomsSection } from "./booking-form/RoomsSection";
import { StaySection } from "./booking-form/StaySection";
import SummaryPanel, { submitLabel } from "./booking-form/SummaryPanel";
import {
  bookingSchema,
  computeStay,
  composeGuest,
  emptyCommission,
  emptyGuest,
  EXTRA_BED_RATE,
  fieldForStoreError,
  guestFromUser,
  newLine,
  OTHER_REASON,
  planAmountOf,
  receivedOf,
  sectionOf,
  sectionOrder,
  splitAmount,
  toNum,
  type BookingFormValues,
} from "./booking-form/schema";
import { ADMIN, Card, hbtn, Loader } from "./ui";

/** Field paths with an error, e.g. ["checkIn", "guest.phone"]. */
const errorPaths = (e: FieldErrors, prefix = ""): string[] =>
  Object.entries(e).flatMap(([k, v]) => {
    if (!v || typeof v !== "object") return [];
    const path = prefix ? `${prefix}.${k}` : k;
    return "message" in v && typeof v.message === "string"
      ? [path]
      : errorPaths(v as FieldErrors, path);
  });

const scrollToSection = (section: string, field?: string) => {
  document
    .getElementById(`bf-${section}`)
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
  if (field)
    (document.querySelector(`[name="${field}"]`) as HTMLElement | null)?.focus({
      preventScroll: true,
    });
};

function initialValues(
  db: HotelDB,
  params: URLSearchParams
): BookingFormValues {
  const today = todayKey();
  // A specific room, or a kind of room that gets the best free number.
  const unit = db.units.find((u) => u.id === params.get("unit"));
  const type = db.roomTypes.find(
    (t) => t.id === (unit?.typeId ?? params.get("type"))
  );
  const checkIn = params.get("checkIn") ?? today;
  const checkOut = params.get("checkOut") ?? shiftDay(checkIn, 1);
  const user = db.users.find(
    (u) => u.id === params.get("guest") && u.role === "guest"
  );
  const lastId = user ? guestStats(db, user.id).lastId : undefined;
  return {
    source: "walk-in",
    commission: emptyCommission,
    checkIn,
    checkOut,
    lines: type ? [newLine(type, unit ? [unit.id] : [])] : [],
    adults: 2,
    children: 0,
    guestMode: user ? "returning" : "new",
    userId: user?.id ?? "",
    guest: user ? guestFromUser(user, lastId) : emptyGuest,
    updateProfile: false,
    extraBeds: 0,
    extraBedRate: EXTRA_BED_RATE,
    discountKind: "amount",
    discountValue: "",
    discountReason: "",
    discountNote: "",
    payPlan: "none",
    payAmount: "",
    payCollected: false,
    payMethod: "cash",
    payRef: "",
    status: checkIn === today ? "check-in" : "confirmed",
    internalNote: "",
  };
}

export default function NewBooking() {
  // Wait for the browser copy of the data so URL presets (guest, room) resolve against it.
  return useHydrated() ? <NewBookingForm /> : <Loader />;
}

function NewBookingForm() {
  const db = useHotelDB();
  const staff = useCurrentStaff();
  const router = useRouter();
  const params = useSearchParams();
  const limit = discountLimit(staff?.role);
  const [saving, setSaving] = useState(false);
  const [created, setCreated] = useState<Booking[] | null>(null);
  const [conflict, setConflict] = useState("");
  // Blocks a second submit before React re-renders the disabled button.
  const submitting = useRef(false);

  // The resolver reads live availability, so it always sees the latest data.
  const dbRef = useRef(db);
  useEffect(() => {
    dbRef.current = db;
  }, [db]);
  // The resolver hands its second argument to yup as `context` (it ignores schema-option context).
  const resolver = useCallback<Resolver<BookingFormValues>>(
    (values, _ctx, opts) =>
      (yupResolver(bookingSchema) as unknown as Resolver<BookingFormValues>)(
        values,
        { db: dbRef.current, limit },
        opts
      ),
    [limit]
  );

  const methods = useForm<BookingFormValues>({
    resolver,
    defaultValues: initialValues(db, params),
    mode: "onTouched",
    shouldFocusError: false,
  });
  const {
    control,
    getValues,
    setValue,
    setError,
    handleSubmit,
    formState,
    reset,
  } = methods;
  const { isDirty, isSubmitted } = formState;
  const [checkIn, checkOut, lines, status] = useWatch({
    control,
    name: ["checkIn", "checkOut", "lines", "status"],
  });
  const v = useWatch({ control }) as BookingFormValues;
  const stay = computeStay(db, v);
  const due = stay.total - receivedOf(v, stay);

  // Staff pick room numbers themselves and those are never swapped behind their back — validation flags a clash.
  // A line without a number gets the best free one, unless it's held for later (not possible when checking in now).
  const lineKey = (lines ?? [])
    .map((l) => `${l.typeId}:${l.unitIds.join()}:${l.assignLater}`)
    .join("|");
  useEffect(() => {
    const valid = !!checkIn && !!checkOut && checkOut > checkIn;
    const now = status === "check-in";
    const o = { shouldValidate: isSubmitted };
    const all = getValues("lines");
    const used = all.flatMap((x) => x.unitIds);
    all.forEach((l, i) => {
      if (now && l.assignLater) setValue(`lines.${i}.assignLater`, false);
      if (!valid || l.unitIds.length || (l.assignLater && !now)) return;
      const ready = (id: string) =>
        db.units.find((u) => u.id === id)?.housekeeping !== "dirty";
      const pick = suggestUnits(db, l.typeId, checkIn, checkOut, Infinity).find(
        (id) => !used.includes(id) && (!now || ready(id))
      );
      if (pick) {
        setValue(`lines.${i}.unitIds`, [pick], o);
        used.push(pick);
      }
    });
  }, [
    db,
    lineKey,
    checkIn,
    checkOut,
    status,
    getValues,
    setValue,
    isSubmitted,
  ]);

  // Check-in now only makes sense for a stay starting today.
  useEffect(() => {
    if (status === "check-in" && checkIn !== todayKey())
      setValue("status", "confirmed");
  }, [checkIn, status, setValue]);

  // A conflict note is about the rooms as they were; any room change answers it.
  useEffect(() => setConflict(""), [lineKey, checkIn, checkOut]);

  // Warn before a reload or tab close loses unsaved details.
  useEffect(() => {
    if (!isDirty || created) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [isDirty, created]);

  const leave = () => {
    if (
      isDirty &&
      !confirm("Discard this booking? The details you entered will be lost.")
    )
      return;
    router.push(`${ADMIN}/bookings`);
  };

  const onInvalid = (errors: FieldErrors<BookingFormValues>) => {
    const paths = errorPaths(errors).sort(
      (a, b) =>
        sectionOrder.indexOf(sectionOf(a)) - sectionOrder.indexOf(sectionOf(b))
    );
    if (!paths.length) return;
    scrollToSection(sectionOf(paths[0]), paths[0]);
    toast.error(
      paths.length > 1
        ? `${paths.length} fields need attention`
        : "One field needs attention"
    );
  };

  const onValid = (values: BookingFormValues) => {
    const user = values.userId
      ? db.users.find((u) => u.id === values.userId)
      : undefined;
    if (
      user?.status === "blocked" &&
      !confirm(
        `${user.name} is blocked${user.note ? ` — ${user.note}` : ""}.\n\nBook anyway?`
      )
    )
      return;

    let userId = user?.id;
    if (!user) {
      const match = findGuestMatch(db, composeGuest(values.guest));
      if (
        match &&
        confirm(
          `${match.name} already has a guest profile with this phone or email.\n\nOK — add this booking to their profile\nCancel — keep as a new guest`
        )
      )
        userId = match.id;
    }

    const s = computeStay(db, values);
    // Paid extras sit on the first booking's folio; the payment is shared by what each folio owes.
    const dues = s.groups.map(
      (g, i) => g.quote.total + (i === 0 ? s.extras : 0)
    );
    const pays = splitAmount(receivedOf(values, s), dues);
    const requested = !values.payCollected ? planAmountOf(values, s) : 0;
    const note = values.discountNote.trim();
    const reason =
      values.discountReason === OTHER_REASON
        ? note
        : [values.discountReason, note].filter(Boolean).join(" — ");
    const guest = composeGuest(values.guest);
    const c = values.commission;
    const agent = values.source === "agent";
    const internalNote = [
      requested > 0 &&
        `${values.payPlan === "deposit" ? "Deposit" : "Payment"} of ${taka(requested)} requested — not yet received`,
      values.internalNote.trim(),
    ]
      .filter(Boolean)
      .join("\n");
    // One booking per room type and rate holding all its rooms; different types become linked bookings
    // that share out the party, discount and payment.
    const r = createStaffBookings(
      s.groups.map((g, i) => ({
        roomTypeId: g.typeId,
        checkIn: values.checkIn,
        checkOut: values.checkOut,
        rooms: g.rooms,
        adults: g.adults,
        children: g.children,
        guest,
        userId,
        source: values.source,
        agentName: agent ? c.name : undefined,
        commission:
          agent && g.commission > 0
            ? {
                to: "agency",
                name: c.name,
                phone: c.phone,
                kind: c.kind,
                value: c.kind === "percent" ? toNum(c.value) : g.commission,
              }
            : undefined,
        pricePerNight: g.rate,
        discount:
          g.discount && g.discount.value > 0
            ? { ...g.discount, reason }
            : undefined,
        unitIds: g.unitIds,
        assignLater: g.assignLater,
        charges:
          i === 0 && s.extras > 0
            ? [
                {
                  category: "extra-bed" as const,
                  description: `Extra bed × ${s.extraBeds} (${taka(s.extraBedRate)} × ${s.nights} night${s.nights > 1 ? "s" : ""})`,
                  amount: s.extras,
                },
              ]
            : undefined,
        payment:
          pays[i] > 0
            ? {
                amount: pays[i],
                method: values.payMethod,
                ref: values.payRef.trim(),
              }
            : undefined,
        checkInNow: values.status === "check-in",
        tentative: values.status === "tentative",
        internalNote: (i === 0 && internalNote) || undefined,
      }))
    );

    if (!r.ok) {
      const field = fieldForStoreError(r.error);
      if (field === "lines") {
        setConflict(r.error);
        setError("lines", { type: "store", message: r.error });
        return scrollToSection("rooms");
      }
      if (!field) {
        toast.error(r.error);
        return scrollToSection("stay");
      }
      setError(field, { type: "store", message: r.error });
      scrollToSection(sectionOf(field), field);
      return;
    }
    if (user && values.updateProfile)
      updateGuestProfile(user.id, {
        name: guest.name,
        phone: guest.phone,
        country: guest.country,
      });
    setCreated(r.value);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting.current) return;
    submitting.current = true;
    setSaving(true);
    try {
      await handleSubmit(onValid, onInvalid)(e);
    } finally {
      submitting.current = false;
      setSaving(false);
    }
  };

  if (created) {
    return (
      <BookingCreated
        bookings={created}
        onAnother={() => {
          reset(initialValues(db, new URLSearchParams()));
          setCreated(null);
        }}
      />
    );
  }

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={submit}
        noValidate
        aria-busy={saving}
        className="pb-24 lg:pb-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={leave}
              aria-label="Back to bookings"
              className={cn(hbtn.outline, "size-9 px-0", focusRing)}
            >
              <ArrowLeft className="size-4" />
            </button>
            <div>
              <h1 className="text-lg font-semibold text-neutral-900">
                New booking
              </h1>
              <p className="text-[13px] text-neutral-600">
                Walk-in, phone or agent reservation
              </p>
            </div>
          </div>
          <Link
            href={`${ADMIN}/bookings`}
            onClick={(e) => {
              e.preventDefault();
              leave();
            }}
            className={cn(hbtn.outline, "h-9", focusRing)}
          >
            Cancel
          </Link>
        </div>

        <div className="mt-4 grid items-start gap-4 lg:grid-cols-[minmax(0,7fr)_minmax(300px,3fr)]">
          <div className="min-w-0 space-y-4">
            <StaySection step={1} />
            <RoomsSection step={2} conflict={conflict} />
            <GuestSection step={3} />
            <PaymentSection step={4} />
          </div>
          {/* Phones and tablets: the summary follows the form. */}
          <div className="lg:sticky lg:top-20">
            <SummaryPanel saving={saving} />
          </div>
        </div>

        {/* Phones and tablets: total and submit always in reach. */}
        <div className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-between gap-3 border-t border-neutral-200 bg-white/95 px-4 py-2.5 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] backdrop-blur lg:hidden">
          <div className="min-w-0 text-sm">
            <p className="font-bold tabular-nums text-neutral-900">
              {taka(stay.total)}
            </p>
            <p
              className={cn(
                "text-xs font-medium",
                due > 0 ? "text-amber-800" : "text-emerald-700"
              )}
            >
              {due > 0 ? `${taka(due)} due` : "Fully paid"}
            </p>
          </div>
          <button
            type="submit"
            disabled={saving}
            className={cn(hbtn.primary, "h-11", focusRing)}
          >
            {saving && <Loader2 className="size-4 animate-spin" />}
            {saving ? "Saving…" : submitLabel(status)}
          </button>
        </div>
      </form>
    </FormProvider>
  );
}

/** Shown in place of the form once the booking is saved: the booking ID and what to do next. */
function BookingCreated({
  bookings,
  onAnother,
}: {
  bookings: Booking[];
  onAnother: () => void;
}) {
  const db = useHotelDB();
  const [first] = bookings;
  const checkedIn = first.status === "checked-in";
  const total = bookings.reduce(
    (s, b) => s + b.total + b.charges.reduce((n, c) => n + c.amount, 0),
    0
  );
  const paid = bookings.reduce(
    (s, b) => s + b.payments.reduce((n, p) => n + p.amount, 0),
    0
  );
  const rooms = bookings.flatMap((b) =>
    b.unitIds
      .map((id) => db.units.find((u) => u.id === id)?.number)
      .filter(Boolean)
  );

  const unassigned = bookings.reduce(
    (n, b) => n + b.rooms - b.unitIds.length,
    0
  );

  return (
    <>
      <div className="print:hidden">
        <Card className="mx-auto mt-6 max-w-xl p-6 text-center">
          <CircleCheck className="mx-auto size-10 text-emerald-600" />
          <h1 className="mt-3 text-lg font-semibold text-neutral-900">
            {checkedIn
              ? "Booking created and guest checked in"
              : "Booking created"}
          </h1>
          <p className="mt-1 text-sm text-neutral-600">
            {first.guest.name} · {dateLabel(first.checkIn, "d MMM yyyy")} →{" "}
            {dateLabel(first.checkOut, "d MMM yyyy")}
          </p>
          <p className="mt-4 text-xs font-medium text-neutral-600">
            Booking ID
          </p>
          <p className="text-2xl font-bold tracking-wide text-neutral-900">
            {bookings.map((b) => b.code).join(", ")}
          </p>
          <dl className="mx-auto mt-4 grid max-w-sm grid-cols-3 gap-2 text-sm">
            {[
              [
                "Rooms",
                [rooms.join(", "), unassigned > 0 && `${unassigned} to assign`]
                  .filter(Boolean)
                  .join(" + "),
              ],
              ["Total", taka(total)],
              ["Balance", taka(Math.max(0, total - paid))],
            ].map(([k, val]) => (
              <div key={k} className="rounded-md bg-neutral-50 px-2 py-2">
                <dt className="text-xs text-neutral-600">{k}</dt>
                <dd className="font-semibold tabular-nums text-neutral-900">
                  {val}
                </dd>
              </div>
            ))}
          </dl>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Link
              href={`${ADMIN}/bookings/${first.id}`}
              className={cn(hbtn.primary, focusRing)}
            >
              <Eye className="size-4" /> View booking
            </Link>
            <button
              type="button"
              onClick={() =>
                printWithTitle(`${first.code} - ${db.content.hotel.name}`)
              }
              className={cn(hbtn.outline, focusRing)}
            >
              <Printer className="size-4" /> Print confirmation
            </button>
            <button
              type="button"
              onClick={onAnother}
              className={cn(hbtn.outline, focusRing)}
            >
              <Plus className="size-4" /> New booking
            </button>
          </div>
        </Card>
      </div>
      {bookings.map((b) => (
        <PrintableInvoice
          key={b.id}
          booking={db.bookings.find((x) => x.id === b.id) ?? b}
          db={db}
        />
      ))}
    </>
  );
}
