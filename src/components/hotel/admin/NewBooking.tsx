"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
import { ArrowLeft, Loader2 } from "lucide-react";
import { discountLimit } from "@/src/lib/hotel-store/auth";
import { shiftDay, taka, todayKey } from "@/src/lib/hotel-store/format";
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
import type { HotelDB } from "@/src/lib/hotel-store/types";
import { useT } from "@/src/lib/hotel-store/i18n";
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
    serviceFeeRate: 0,
    vatRate: 0,
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
  const t = useT();
  const db = useHotelDB();
  const staff = useCurrentStaff();
  const router = useRouter();
  const params = useSearchParams();
  const limit = discountLimit(staff?.role);
  const [saving, setSaving] = useState(false);
  const [created, setCreated] = useState(false);
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
  const { control, getValues, setValue, setError, handleSubmit, formState } =
    methods;
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
    .map((l) => `${l.typeId}:${(l.unitIds ?? []).join()}:${l.assignLater}`)
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
      !confirm(t("Discard this booking? The details you entered will be lost."))
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
        ? t("{n} fields need attention", { n: paths.length })
        : t("One field needs attention")
    );
  };

  const onValid = (values: BookingFormValues) => {
    const user = values.userId
      ? db.users.find((u) => u.id === values.userId)
      : undefined;
    if (
      user?.status === "blocked" &&
      !confirm(
        `${t("{name} is blocked", { name: user.name })}${user.note ? ` — ${user.note}` : ""}.\n\n${t("Book anyway?")}`
      )
    )
      return;

    let userId = user?.id;
    if (!user) {
      const match = findGuestMatch(db, composeGuest(values.guest));
      if (
        match &&
        confirm(
          t("{name} already has a guest profile with this phone or email.\n\nOK — add this booking to their profile\nCancel — keep as a new guest", { name: match.name })
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
        serviceFeeRate: s.serviceFeeRate,
        vatRate: s.vatRate,
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
    // Drop the unsaved-changes guard, then open the new booking.
    setCreated(true);
    toast.success(
      r.value.length > 1
        ? t("{n} bookings created", { n: r.value.length })
        : t("Booking {code} created", { code: r.value[0].code })
    );
    router.replace(`${ADMIN}/bookings/${r.value[0].id}`);
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

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={submit}
        noValidate
        aria-busy={saving}
        className="pb-24 lg:pb-4"
      >
        <Card className="flex items-center gap-3 px-4 py-3 sm:px-5">
          <button
            type="button"
            onClick={leave}
            aria-label={t("Back to bookings")}
            className={cn(hbtn.outline, "size-9 bg-white px-0", focusRing)}
          >
            <ArrowLeft className="size-4" />
          </button>
          <div>
            <h1 className="text-lg font-semibold text-neutral-900">
              {t("New booking")}
            </h1>
            <p className="hidden text-[13px] text-neutral-600 sm:block">
              {t("Walk-in, phone or agent reservation")}
            </p>
          </div>
        </Card>

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
