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
import { createStaffBooking, findGuestMatch, freeUnits, guestStats, suggestUnits, updateGuestProfile, useCurrentStaff, useHotelDB, useHydrated } from "@/src/lib/hotel-store/store";
import type { HotelDB } from "@/src/lib/hotel-store/types";
import { cn } from "@/src/lib/utils";
import GuestSection from "./booking-form/GuestSection";
import { PaymentSection, PricingSection } from "./booking-form/PricingSection";
import { RoomsSection, StaySection } from "./booking-form/StaySection";
import SummaryPanel, { submitLabel } from "./booking-form/SummaryPanel";
import {
  bookingSchema,
  computeStay,
  emptyGuest,
  fieldForStoreError,
  OTHER_REASON,
  sectionOf,
  sectionOrder,
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
  const typeId = params.get("type") ?? db.roomTypes.find((t) => t.active)?.id ?? db.roomTypes[0]?.id ?? "";
  const checkIn = params.get("checkIn") ?? today;
  const checkOut = params.get("checkOut") ?? shiftDay(checkIn, 1);
  const user = db.users.find((u) => u.id === params.get("guest") && u.role === "guest");
  const lastId = user ? guestStats(db, user.id).lastId : undefined;
  return {
    source: "walk-in",
    agentName: "",
    typeId,
    checkIn,
    checkOut,
    rooms: 1,
    adults: 2,
    children: 0,
    rate: db.roomTypes.find((t) => t.id === typeId)?.price ?? "",
    unitIds: params.get("unit") ? [params.get("unit")!] : [],
    guestMode: user ? "returning" : "new",
    userId: user?.id ?? "",
    guest: user
      ? { ...emptyGuest, name: user.name, phone: user.phone, email: user.email, country: user.country ?? "Bangladesh", idType: lastId?.idType ?? "nid", idNumber: lastId?.idNumber ?? "" }
      : emptyGuest,
    updateProfile: false,
    discountKind: "percent",
    discountValue: "",
    discountReason: "",
    discountNote: "",
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
  const [typeId, checkIn, checkOut, rooms, status] = useWatch({ control, name: ["typeId", "checkIn", "checkOut", "rooms", "status"] });
  const v = useWatch({ control }) as BookingFormValues;
  const { quote } = computeStay(db, v);
  const due = Math.max(0, quote.total - Math.min(toNum(v.payAmount), quote.total));

  // A new room type starts at its own rack rate.
  const lastType = useRef(typeId);
  useEffect(() => {
    if (lastType.current === typeId) return;
    lastType.current = typeId;
    const t = db.roomTypes.find((x) => x.id === typeId);
    if (t) setValue("rate", t.price, { shouldDirty: true });
  }, [typeId, db.roomTypes, setValue]);

  // Keep picked rooms that are still free for the stay and top up with the best free ones.
  useEffect(() => {
    const count = Math.max(1, toNum(rooms));
    if (!typeId || !checkIn || !checkOut || checkOut <= checkIn) return setValue("unitIds", []);
    const free = new Set(freeUnits(db, typeId, checkIn, checkOut).map((u) => u.id));
    const keep = getValues("unitIds").filter((id) => free.has(id)).slice(0, count);
    const extra = suggestUnits(db, typeId, checkIn, checkOut, count)
      .filter((id) => !keep.includes(id))
      .slice(0, count - keep.length);
    setValue("unitIds", [...keep, ...extra], { shouldValidate: isSubmitted });
  }, [db, typeId, checkIn, checkOut, rooms, getValues, setValue, isSubmitted]);

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
      const match = findGuestMatch(db, values.guest);
      if (match && confirm(`${match.name} already has a guest profile with this phone or email.\n\nOK — add this booking to their profile\nCancel — keep as a new guest`)) userId = match.id;
    }
    if (values.status === "check-in") {
      const dirty = values.unitIds.map((id) => db.units.find((u) => u.id === id)).filter((u) => u?.housekeeping === "dirty");
      if (dirty.length && !confirm(`Room ${dirty.map((u) => u!.number).join(", ")} is not cleaned yet. Check the guest in anyway?`)) return;
    }

    setSaving(true);
    const discountValue = toNum(values.discountValue);
    const note = values.discountNote.trim();
    const r = createStaffBooking({
      roomTypeId: values.typeId,
      checkIn: values.checkIn,
      checkOut: values.checkOut,
      rooms: toNum(values.rooms),
      adults: toNum(values.adults),
      children: toNum(values.children),
      guest: {
        name: values.guest.name.trim(),
        phone: values.guest.phone.trim(),
        email: values.guest.email.trim(),
        country: values.guest.country.trim() || undefined,
        idType: values.guest.idType,
        idNumber: values.guest.idNumber.trim() || undefined,
        note: values.guest.note.trim() || undefined,
      },
      userId,
      source: values.source,
      agentName: values.source === "agent" ? values.agentName : undefined,
      pricePerNight: toNum(values.rate),
      discount: discountValue > 0 ? { kind: values.discountKind, value: discountValue, reason: values.discountReason === OTHER_REASON ? note : [values.discountReason, note].filter(Boolean).join(" — ") } : undefined,
      unitIds: values.unitIds,
      payment: toNum(values.payAmount) > 0 ? { amount: toNum(values.payAmount), method: values.payMethod, ref: values.payRef.trim() } : undefined,
      checkInNow: values.status === "check-in",
      tentative: values.status === "tentative",
      internalNote: values.internalNote.trim() || undefined,
    });

    if (!r.ok) {
      setSaving(false);
      const field = fieldForStoreError(r.error);
      if (!field) return toast.error(r.error);
      setError(field, { type: "store", message: r.error });
      scrollToSection(sectionOf(field), field);
      return;
    }
    if (user && values.updateProfile) updateGuestProfile(user.id, { name: values.guest.name.trim(), phone: values.guest.phone.trim(), country: values.guest.country.trim() || undefined });

    toast.success(`${r.value.code} created${r.value.status === "checked-in" ? " — guest checked in" : r.value.status === "pending" ? " — on hold until deposit" : ""}`);
    router.push(`${ADMIN}/bookings/${r.value.id}`);
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
            <RoomsSection step={2} />
            <GuestSection step={3} />
            <PricingSection step={4} />
            <PaymentSection step={5} />
          </div>
          <div className="xl:sticky xl:top-24 xl:max-h-[calc(100vh-7rem)] xl:overflow-y-auto">
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
