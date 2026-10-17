"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { FormProvider, useForm, useWatch, type FieldErrors, type Resolver } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { ArrowLeft, Loader2 } from "lucide-react";
import { discountLimit } from "@/src/lib/hotel-store/auth";
import { shiftDay, taka, todayKey } from "@/src/lib/hotel-store/format";
import { createStaffBookings, findGuestMatch, freeUnits, guestStats, suggestUnits, updateGuestProfile, useCurrentStaff, useHotelDB, useHydrated } from "@/src/lib/hotel-store/store";
import type { HotelDB } from "@/src/lib/hotel-store/types";
import { cn } from "@/src/lib/utils";
import GuestSection from "./booking-form/GuestSection";
import PaymentSection from "./booking-form/PaymentSection";
import { StaySection } from "./booking-form/StaySection";
import SummaryPanel, { submitLabel } from "./booking-form/SummaryPanel";
import {
  bookingSchema,
  computeStay,
  composeGuest,
  emptyCommission,
  emptyGuest,
  guestFromUser,
  fieldForStoreError,
  newLine,
  OTHER_REASON,
  payNowOf,
  sectionOf,
  sectionOrder,
  splitPayment,
  toNum,
  type BookingFormValues,
} from "./booking-form/schema";
import { ADMIN, Card, hbtn, Loader } from "./ui";

/** Field paths with an error, e.g. ["checkIn", "guest.phone"]. */
const errorPaths = (e: FieldErrors, prefix = ""): string[] =>
  Object.entries(e).flatMap(([k, v]) => {
    if (!v || typeof v !== "object") return [];
    const path = prefix ? `${prefix}.${k}` : k;
    return "message" in v && typeof v.message === "string" ? [path] : errorPaths(v as FieldErrors, path);
  });

const scrollToSection = (section: string, field?: string) => {
  document.getElementById(`bf-${section}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  if (field) (document.querySelector(`[name="${field}"]`) as HTMLElement | null)?.focus({ preventScroll: true });
};

function initialValues(db: HotelDB, params: URLSearchParams): BookingFormValues {
  const today = todayKey();
  const type = db.roomTypes.find((t) => t.id === params.get("type")) ?? db.roomTypes.find((t) => t.active) ?? db.roomTypes[0];
  const checkIn = params.get("checkIn") ?? today;
  const checkOut = params.get("checkOut") ?? shiftDay(checkIn, 1);
  const user = db.users.find((u) => u.id === params.get("guest") && u.role === "guest");
  const lastId = user ? guestStats(db, user.id).lastId : undefined;
  return {
    source: "walk-in",
    commission: emptyCommission,
    checkIn,
    checkOut,
    lines: type ? [newLine(type, params.get("unit") ? [params.get("unit")!] : [])] : [],
    adults: 2,
    children: 0,
    guestMode: user ? "returning" : "new",
    userId: user?.id ?? "",
    guest: user ? guestFromUser(user, lastId) : emptyGuest,
    updateProfile: false,
    discountKind: "percent",
    discountValue: "",
    discountReason: "",
    discountNote: "",
    payPlan: "none",
    payAmount: "",
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

  // The resolver reads live availability, so it always sees the latest data.
  const dbRef = useRef(db);
  useEffect(() => {
    dbRef.current = db;
  }, [db]);
  const resolver = useCallback<Resolver<BookingFormValues>>(
    (values, ctx, opts) => (yupResolver(bookingSchema, { context: { db: dbRef.current, limit } }) as unknown as Resolver<BookingFormValues>)(values, ctx, opts),
    [limit]
  );

  const methods = useForm<BookingFormValues>({ resolver, defaultValues: initialValues(db, params), mode: "onTouched", shouldFocusError: false });
  const { control, getValues, setValue, setError, handleSubmit, formState } = methods;
  const { isDirty, isSubmitted } = formState;
  const [checkIn, checkOut, lines, status] = useWatch({ control, name: ["checkIn", "checkOut", "lines", "status"] });
  const v = useWatch({ control }) as BookingFormValues;
  const { quote } = computeStay(db, v);
  const due = quote.total - payNowOf(v, quote);

  // For each room type keep picked rooms that are still free and top up with the best free ones (clean first).
  const lineKey = (lines ?? []).map((l) => `${l.typeId}:${l.rooms}`).join("|");
  useEffect(() => {
    const valid = !!checkIn && !!checkOut && checkOut > checkIn;
    getValues("lines").forEach((l, i) => {
      const count = Math.max(1, toNum(l.rooms));
      if (!valid) return setValue(`lines.${i}.unitIds`, []);
      const free = new Set(freeUnits(db, l.typeId, checkIn, checkOut).map((u) => u.id));
      const keep = l.unitIds.filter((id) => free.has(id)).slice(0, count);
      const extra = suggestUnits(db, l.typeId, checkIn, checkOut, count)
        .filter((id) => !keep.includes(id))
        .slice(0, count - keep.length);
      const next = [...keep, ...extra];
      if (next.join() !== l.unitIds.join()) setValue(`lines.${i}.unitIds`, next, { shouldValidate: isSubmitted });
    });
  }, [db, lineKey, checkIn, checkOut, getValues, setValue, isSubmitted]);

  // Check-in now only makes sense for a stay starting today.
  useEffect(() => {
    if (status === "check-in" && checkIn !== todayKey()) setValue("status", "confirmed");
  }, [checkIn, status, setValue]);

  // Warn before a reload or tab close loses unsaved details.
  useEffect(() => {
    if (!isDirty) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [isDirty]);

  const leave = () => {
    if (isDirty && !confirm("Discard this booking? The details you entered will be lost.")) return;
    router.push(`${ADMIN}/bookings`);
  };

  const onInvalid = (errors: FieldErrors<BookingFormValues>) => {
    const paths = errorPaths(errors).sort((a, b) => sectionOrder.indexOf(sectionOf(a)) - sectionOrder.indexOf(sectionOf(b)));
    if (!paths.length) return;
    scrollToSection(sectionOf(paths[0]), paths[0]);
    toast.error(paths.length > 1 ? `${paths.length} fields need attention` : "One field needs attention");
  };

  const onValid = (values: BookingFormValues) => {
    if (saving) return;
    const user = values.userId ? db.users.find((u) => u.id === values.userId) : undefined;
    if (user?.status === "blocked" && !confirm(`${user.name} is blocked${user.note ? ` — ${user.note}` : ""}.\n\nBook anyway?`)) return;

    let userId = user?.id;
    if (!user) {
      const match = findGuestMatch(db, composeGuest(values.guest));
      if (match && confirm(`${match.name} already has a guest profile with this phone or email.\n\nOK — add this booking to their profile\nCancel — keep as a new guest`)) userId = match.id;
    }
    if (values.status === "check-in") {
      const dirty = values.lines.flatMap((l) => l.unitIds).map((id) => db.units.find((u) => u.id === id)).filter((u) => u?.housekeeping === "dirty");
      if (dirty.length && !confirm(`Room ${dirty.map((u) => u!.number).join(", ")} is not cleaned yet. Check the guest in anyway?`)) return;
    }

    setSaving(true);
    const stay = computeStay(db, values);
    const pays = splitPayment(values, stay.lines);
    const note = values.discountNote.trim();
    const reason = values.discountReason === OTHER_REASON ? note : [values.discountReason, note].filter(Boolean).join(" — ");
    const guest = composeGuest(values.guest);
    const c = values.commission;
    // One linked booking per room type; the party, discount and payment are shared out between them.
    const r = createStaffBookings(
      stay.lines.map((l, i) => ({
        roomTypeId: l.line.typeId,
        checkIn: values.checkIn,
        checkOut: values.checkOut,
        rooms: l.rooms,
        adults: l.adults,
        children: l.children,
        guest,
        userId,
        source: values.source,
        agentName: values.source === "agent" ? c.name : undefined,
        commission: l.commission > 0 ? { to: values.source === "agent" ? "agency" : c.to, name: c.name, phone: c.phone, kind: c.kind, value: c.kind === "percent" ? toNum(c.value) : l.commission } : undefined,
        pricePerNight: l.rate,
        discount: l.discount && l.discount.value > 0 ? { ...l.discount, reason } : undefined,
        unitIds: l.line.unitIds,
        payment: pays[i] > 0 ? { amount: pays[i], method: values.payMethod, ref: values.payRef.trim() } : undefined,
        checkInNow: values.status === "check-in",
        tentative: values.status === "tentative",
        internalNote: values.internalNote.trim() || undefined,
      }))
    );

    if (!r.ok) {
      setSaving(false);
      const field = fieldForStoreError(r.error);
      if (!field) {
        toast.error(r.error);
        return scrollToSection("stay");
      }
      setError(field, { type: "store", message: r.error });
      scrollToSection(sectionOf(field), field);
      return;
    }
    if (user && values.updateProfile) updateGuestProfile(user.id, { name: guest.name, phone: guest.phone, country: guest.country });

    const [first] = r.value;
    toast.success(
      `${r.value.map((b) => b.code).join(", ")} created${first.status === "checked-in" ? " — guest checked in" : first.status === "pending" ? " — on hold until deposit" : ""}`
    );
    router.push(`${ADMIN}/bookings/${first.id}`);
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onValid, onInvalid)} noValidate className="pb-4">
        <Card className="flex flex-wrap items-center justify-between gap-4 p-5">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={leave}
              aria-label="Back to bookings"
              className="flex size-10 shrink-0 items-center justify-center rounded-md border border-neutral-200 text-neutral-500 transition hover:border-sky-300 hover:text-sky-700"
            >
              <ArrowLeft className="size-4" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-neutral-900">New booking</h1>
              <p className="mt-0.5 text-sm text-neutral-500">Walk-in, phone or agent reservation — the website handles online bookings.</p>
            </div>
          </div>
          <div className="hidden gap-2 sm:flex">
            <Link
              href={`${ADMIN}/bookings`}
              onClick={(e) => {
                e.preventDefault();
                leave();
              }}
              className={hbtn.outline}
            >
              Cancel
            </Link>
            <button type="submit" disabled={saving} className={hbtn.primary}>
              {saving && <Loader2 className="size-4 animate-spin" />}
              {submitLabel(status)}
            </button>
          </div>
        </Card>

        <div className="mt-6 grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
          <div className="min-w-0 space-y-6">
            <StaySection step={1} />
            <GuestSection step={2} />
            <PaymentSection step={3} />
          </div>
          <div className="xl:sticky xl:top-24">
            <SummaryPanel saving={saving} />
          </div>
        </div>

        {/* Phones and tablets: total and submit always in reach. */}
        <div className="sticky bottom-0 z-20 mt-6 flex items-center justify-between gap-3 rounded-md border border-neutral-200 bg-white/95 p-3 shadow-lg backdrop-blur xl:hidden">
          <div className="text-sm">
            <p className="font-bold tabular-nums text-neutral-900">{taka(quote.total)}</p>
            <p className={cn("text-xs", due ? "text-amber-700" : "text-emerald-700")}>{due ? `${taka(due)} due` : "Fully paid"}</p>
          </div>
          <button type="submit" disabled={saving} className={cn(hbtn.primary, "h-11")}>
            {saving && <Loader2 className="size-4 animate-spin" />}
            {submitLabel(status)}
          </button>
        </div>
      </form>
    </FormProvider>
  );
}
