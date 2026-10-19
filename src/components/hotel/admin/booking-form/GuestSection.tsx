"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  useController,
  useFormContext,
  useFormState,
  useWatch,
} from "react-hook-form";
import {
  AlertTriangle,
  Ban,
  Check,
  ExternalLink,
  IdCard,
  UserCheck,
  X,
} from "lucide-react";
import { countries } from "@/src/data/countries";
import { dateLabel, initials, taka } from "@/src/lib/hotel-store/format";
import {
  findGuestMatch,
  guestStats,
  useHotelDB,
} from "@/src/lib/hotel-store/store";
import type { User } from "@/src/lib/hotel-store/types";
import { cn } from "@/src/lib/utils";
import { ADMIN, hbtn, inputClass, textareaClass } from "../ui";
import {
  Disclosure,
  FieldError,
  fieldLabel,
  focusRing,
  FormField,
  Section,
  Segmented,
  Stepper,
  useErrorClass,
} from "./parts";
import {
  arrivalOptions,
  composeGuest,
  computeStay,
  emptyGuest,
  guestFromUser,
  MAX_EXTRA_BEDS,
  requestOptions,
  type BookingFormValues,
} from "./schema";

/** Digits after the country code and trunk 0, so "01712…", "+880 1712…" and "8801712…" compare equal. */
const localDigits = (p: string) =>
  p.replace(/\D/g, "").replace(/^880/, "").replace(/^0/, "");

export default function GuestSection({ step }: { step: number }) {
  const db = useHotelDB();
  const { control, register, setValue, getValues } =
    useFormContext<BookingFormValues>();
  const { isSubmitted, errors } = useFormState({ control });
  const v = useWatch({ control }) as BookingFormValues;
  const { guest, userId, status } = v;
  const [dismissed, setDismissed] = useState<string[]>([]);
  const user = userId ? db.users.find((u) => u.id === userId) : undefined;
  const checkingIn = status === "check-in";
  const opts = { shouldDirty: true, shouldValidate: isSubmitted };
  const err = {
    fullName: useErrorClass("guest.fullName"),
    phone: useErrorClass("guest.phone"),
    customDial: useErrorClass("guest.customDial"),
    email: useErrorClass("guest.email"),
  };

  // Returning guests surface as the number is typed; a typed email that's on file counts too.
  const typed = localDigits(guest.phone);
  const matches = useMemo(() => {
    if (user) return [];
    const byPhone =
      typed.length >= 4
        ? db.users.filter(
            (u) => u.role === "guest" && localDigits(u.phone).startsWith(typed)
          )
        : [];
    const byEmail = guest.email.trim()
      ? findGuestMatch(db, { email: guest.email, phone: "" })
      : undefined;
    return [
      ...byPhone,
      ...(byEmail && !byPhone.includes(byEmail) ? [byEmail] : []),
    ]
      .filter((u) => !dismissed.includes(u.id))
      .slice(0, 3);
  }, [db, typed, guest.email, user, dismissed]);

  const pick = (u: User) => {
    const { arrivalTime, requests, note } = getValues("guest");
    setValue("guestMode", "returning", opts);
    setValue("userId", u.id, opts);
    // Keep what was already noted about this stay; fill the rest from their profile.
    setValue(
      "guest",
      {
        ...guestFromUser(u, guestStats(db, u.id).lastId),
        arrivalTime,
        requests,
        note,
      },
      opts
    );
    setValue("updateProfile", false);
  };

  const clearPick = () => {
    const { phone, phoneCountry, arrivalTime, requests, note } =
      getValues("guest");
    if (user) setDismissed((d) => [...d, user.id]);
    setValue("guestMode", "new", opts);
    setValue("userId", "", opts);
    setValue(
      "guest",
      { ...emptyGuest, phone, phoneCountry, arrivalTime, requests, note },
      opts
    );
  };

  const composed = composeGuest(guest);
  const changed = user
    ? [
        composed.name !== user.name.trim() && "name",
        localDigits(composed.phone) !== localDigits(user.phone) && "phone",
        (composed.country ?? "") !== (user.country ?? "") && "country",
      ].filter((x): x is string => !!x)
    : [];

  const guestErrors = (errors.guest ?? {}) as Record<string, unknown>;
  const extraHasError =
    ["country", "otherCountry", "idNumber"].some((k) => k in guestErrors) &&
    !checkingIn;

  return (
    <Section
      id="guest"
      step={step}
      title="Guest details"
      sub={
        user
          ? undefined
          : "Type the mobile number first — returning guests appear automatically"
      }
    >
      <div className="grid gap-4 md:grid-cols-2">
        <FormField label="Mobile number" name="guest.phone">
          <div className="flex gap-2">
            <select
              {...register("guest.phoneCountry")}
              aria-label="Country code"
              className={cn(inputClass, "w-[92px] shrink-0 px-2")}
            >
              {countries.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} +{c.dial}
                </option>
              ))}
              <option value="OTHER">Other</option>
            </select>
            {guest.phoneCountry === "OTHER" && (
              <input
                {...register("guest.customDial")}
                placeholder="+971"
                aria-label="Dial code"
                className={cn(inputClass, "w-20 shrink-0", err.customDial)}
              />
            )}
            <input
              {...register("guest.phone")}
              type="tel"
              inputMode="tel"
              placeholder={
                guest.phoneCountry === "BD" ? "01712 345678" : "Phone number"
              }
              autoComplete="off"
              autoFocus
              className={cn(inputClass, "min-w-0 tabular-nums", err.phone)}
            />
          </div>
          <FieldError name="guest.customDial" />
        </FormField>

        <FormField label="Full name" name="guest.fullName">
          <input
            {...register("guest.fullName")}
            placeholder="e.g. Tamim Rahman"
            autoComplete="off"
            className={cn(inputClass, "min-w-0", err.fullName)}
          />
        </FormField>
      </div>

      {matches.length > 0 && (
        <div
          aria-live="polite"
          className="mt-3 overflow-hidden rounded-md border border-sky-200 bg-sky-50/50"
        >
          <p className="border-b border-sky-100 px-3.5 py-2 text-xs font-semibold text-sky-900">
            {matches.length === 1
              ? "Existing guest found"
              : `${matches.length} existing guests found`}
          </p>
          <ul className="divide-y divide-sky-100">
            {matches.map((u) => {
              const s = guestStats(db, u.id);
              return (
                <li
                  key={u.id}
                  className="flex flex-wrap items-center gap-3 px-3.5 py-2.5"
                >
                  <Avatar name={u.name} blocked={u.status === "blocked"} />
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-1.5 text-sm font-medium text-neutral-900">
                      {u.name}
                      {u.status === "blocked" && <Tag tone="rose">Blocked</Tag>}
                      {s.inHouse && <Tag tone="emerald">In house</Tag>}
                    </span>
                    <span className="block truncate text-xs text-neutral-600">
                      {u.phone}
                      {u.email && ` · ${u.email}`} ·{" "}
                      {s.stays
                        ? `${s.stays} stay${s.stays > 1 ? "s" : ""}, last ${dateLabel(s.last!, "d MMM yyyy")}`
                        : "No stays yet"}
                    </span>
                  </span>
                  <span className="flex gap-1.5">
                    {/* Keep focus in the phone field: a blur would validate it and shift this button mid-click. */}
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => pick(u)}
                      className={cn(
                        hbtn.small,
                        "border-sky-300 text-sky-800",
                        focusRing
                      )}
                    >
                      <UserCheck className="size-3.5" /> Use this guest
                    </button>
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => setDismissed((d) => [...d, u.id])}
                      aria-label={`Not ${u.name}`}
                      className={cn(hbtn.icon, focusRing)}
                    >
                      <X className="size-4" />
                    </button>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {user && <GuestCard user={user} onClear={clearPick} />}

      <div className="mt-4 grid gap-4">
        <FormField
          label={
            <>
              Email{" "}
              <span className="font-normal text-neutral-500">(optional)</span>
            </>
          }
          name="guest.email"
        >
          <input
            {...register("guest.email")}
            type="email"
            placeholder="guest@example.com"
            autoComplete="off"
            className={cn(inputClass, err.email)}
          />
        </FormField>
        {user && changed.length > 0 && (
          <label className="flex items-start gap-2 self-end rounded-md bg-sky-50 px-3 py-2.5 text-sm text-sky-900">
            <input
              type="checkbox"
              {...register("updateProfile")}
              className="mt-0.5 size-4 accent-sky-600"
            />
            <span>
              Also update {user.name.split(" ").slice(-1)[0]}&rsquo;s profile
              with the new {changed.join(" and ")}
            </span>
          </label>
        )}
      </div>

      {checkingIn && (
        <div className="mt-4 rounded-md border border-neutral-200 bg-neutral-50/60 p-3.5">
          <p className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-neutral-900">
            <IdCard className="size-4 text-neutral-500" /> Identification
          </p>
          <IdFields />
        </div>
      )}

      <div className="mt-4 space-y-2.5">
        <Disclosure
          title="Additional guest details"
          summary={[
            countryName(guest.country, guest.otherCountry),
            !checkingIn && guest.idNumber && `ID ${guest.idNumber}`,
          ]
            .filter(Boolean)
            .join(" · ")}
          forceOpen={extraHasError}
        >
          <div className="grid gap-4">
            <FormField label="Country of residence" name="guest.country">
              <select
                {...register("guest.country", {
                  // Picking a country pre-fills its dialling code.
                  onChange: (e) =>
                    e.target.value !== "OTHER" &&
                    setValue("guest.phoneCountry", e.target.value),
                })}
                className={inputClass}
              >
                {countries.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
                <option value="OTHER">Other country…</option>
              </select>
            </FormField>
            {guest.country === "OTHER" && (
              <FormField label="Country name" name="guest.otherCountry">
                <input
                  {...register("guest.otherCountry")}
                  placeholder="e.g. Brazil"
                  className={inputClass}
                />
              </FormField>
            )}
          </div>
          {!checkingIn && (
            <div className="mt-4">
              <p className="mb-2 text-xs font-medium text-neutral-600">
                Identification (optional now, needed at check-in)
              </p>
              <IdFields />
            </div>
          )}
        </Disclosure>

        <ArrivalAndRequests />
      </div>
    </Section>
  );
}

const countryName = (code: string, other: string) =>
  code === "OTHER"
    ? other.trim()
    : countries.find((c) => c.code === code)?.name;

function IdFields() {
  const { control, register, setValue } = useFormContext<BookingFormValues>();
  const [country, idType] = useWatch({
    control,
    name: ["guest.country", "guest.idType"],
  });
  const local = country === "BD";
  const idKind = local ? idType : "passport";
  const errId = useErrorClass("guest.idNumber");
  return (
    <div className="grid gap-4 sm:grid-cols-[auto_minmax(0,1fr)]">
      {local && (
        <FormField label="Document">
          <Segmented
            label="ID document"
            value={idType}
            onChange={(t) => setValue("guest.idType", t, { shouldDirty: true })}
            options={[
              { value: "nid", label: "NID" },
              { value: "passport", label: "Passport" },
            ]}
            className="h-10"
          />
        </FormField>
      )}
      <FormField
        label={idKind === "nid" ? "NID number" : "Passport number"}
        name="guest.idNumber"
      >
        <input
          {...register("guest.idNumber")}
          placeholder={
            idKind === "nid" ? "10, 13 or 17 digits" : "e.g. A01234567"
          }
          autoComplete="off"
          className={cn(
            inputClass,
            "uppercase tabular-nums placeholder:normal-case",
            errId
          )}
        />
      </FormField>
    </div>
  );
}

/** Wishes the desk will try to meet, kept apart from paid extras that go on the bill. */
function ArrivalAndRequests() {
  const db = useHotelDB();
  const { control, register } = useFormContext<BookingFormValues>();
  const v = useWatch({ control }) as BookingFormValues;
  const requests = useController({ control, name: "guest.requests" }).field;
  const picked: string[] = requests.value ?? [];
  const { extraBeds, extraBedRate, extras, nights } = computeStay(db, v);
  const rateErr = useErrorClass("extraBedRate");
  const summary = [
    v.guest.arrivalTime && `Arrives ${v.guest.arrivalTime.split(" (")[0]}`,
    picked.length > 0 &&
      `${picked.length} request${picked.length > 1 ? "s" : ""}`,
    extraBeds > 0 && `${extraBeds} extra bed${extraBeds > 1 ? "s" : ""}`,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <Disclosure title="Arrival, requests & extras" summary={summary}>
      {v.status !== "check-in" && (
        <FormField label="Estimated arrival" className="mb-4 sm:max-w-xs">
          <select {...register("guest.arrivalTime")} className={inputClass}>
            <option value="">Not sure yet</option>
            {arrivalOptions.map((a) => (
              <option key={a}>{a}</option>
            ))}
          </select>
        </FormField>
      )}

      <p className={fieldLabel}>Requests</p>
      {/* Chips stretch to fill each row, spaced edge to edge. */}
      <div className="flex flex-wrap justify-between gap-1.5">
        {requestOptions.map((r) => {
          const on = picked.includes(r);
          return (
            <button
              key={r}
              type="button"
              role="checkbox"
              aria-checked={on}
              onClick={() =>
                requests.onChange(
                  on ? picked.filter((x) => x !== r) : [...picked, r]
                )
              }
              className={cn(
                "inline-flex h-8 flex-auto items-center gap-1.5 whitespace-nowrap rounded-md border px-2.5 text-[13px] transition",
                on
                  ? "border-sky-500 bg-sky-50 text-sky-900"
                  : "border-neutral-200 text-neutral-700 hover:border-sky-300",
                focusRing
              )}
            >
              <span
                className={cn(
                  "flex size-3.5 items-center justify-center rounded-sm border",
                  on
                    ? "border-sky-600 bg-sky-600 text-white"
                    : "border-neutral-400"
                )}
              >
                {on && <Check className="size-3" />}
              </span>
              {r}
            </button>
          );
        })}
      </div>
      <textarea
        {...register("guest.note")}
        rows={2}
        placeholder="Other requests, e.g. anniversary, allergies"
        className={cn(textareaClass, "mt-2.5")}
      />

      <div className="mt-4 rounded-md border border-neutral-200 p-3">
        <p className="mb-2 flex flex-wrap items-baseline justify-between gap-2 text-[13px] font-medium text-neutral-800">
          Paid extras{" "}
          <span className="text-xs font-normal text-neutral-600">
            Added to the bill
          </span>
        </p>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-sm text-neutral-800">
            Extra bed
            <span className="mt-1 flex items-center gap-1.5 text-xs text-neutral-600">
              <span className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-2 flex items-center text-neutral-500">
                  ৳
                </span>
                <input
                  type="number"
                  min={0}
                  step={50}
                  inputMode="numeric"
                  {...register("extraBedRate")}
                  aria-label="Extra bed price per bed per night"
                  className={cn(
                    inputClass,
                    "h-8 w-24 pl-5 text-sm tabular-nums",
                    rateErr
                  )}
                />
              </span>
              per bed / night
            </span>
          </span>
          <span className="flex items-center gap-3">
            <span className="w-28">
              <Stepper
                name="extraBeds"
                label="extra beds"
                min={0}
                max={MAX_EXTRA_BEDS}
                size="sm"
              />
            </span>
            <span
              className={cn(
                "w-20 text-right text-sm font-semibold tabular-nums",
                extras ? "text-neutral-900" : "text-neutral-400"
              )}
            >
              {taka(extras)}
            </span>
          </span>
        </div>
        {extraBeds > 0 && nights > 0 && (
          <p className="mt-1.5 text-xs text-neutral-600">
            {extraBeds} × {taka(extraBedRate)} × {nights} night
            {nights > 1 ? "s" : ""} = {taka(extras)}
          </p>
        )}
        <FieldError name="extraBeds" />
        <FieldError name="extraBedRate" />
      </div>
    </Disclosure>
  );
}

function Tag({
  tone,
  children,
}: {
  tone: "rose" | "emerald" | "sky" | "neutral";
  children: React.ReactNode;
}) {
  const tones = {
    rose: "bg-rose-100 text-rose-800",
    emerald: "bg-emerald-100 text-emerald-800",
    sky: "bg-sky-100 text-sky-800",
    neutral: "bg-neutral-100 text-neutral-700",
  };
  return (
    <span
      className={cn(
        "rounded px-1.5 py-0.5 text-[11px] font-semibold",
        tones[tone]
      )}
    >
      {children}
    </span>
  );
}

function Avatar({ name, blocked }: { name: string; blocked?: boolean }) {
  return (
    <span
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
        blocked ? "bg-rose-100 text-rose-800" : "bg-sky-100 text-sky-800"
      )}
    >
      {initials(name)}
    </span>
  );
}

/** The guest picked from their profile: history and anything the desk should know before booking. */
function GuestCard({ user, onClear }: { user: User; onClear: () => void }) {
  const db = useHotelDB();
  const s = guestStats(db, user.id);
  const blocked = user.status === "blocked";
  return (
    <div
      className={cn(
        "mt-3 rounded-md border px-3.5 py-3",
        blocked
          ? "border-rose-200 bg-rose-50/60"
          : "border-emerald-200 bg-emerald-50/40"
      )}
    >
      <div className="flex flex-wrap items-center gap-3">
        <Avatar name={user.name} blocked={blocked} />
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-1.5 text-sm font-semibold text-neutral-900">
            <Check className="size-4 text-emerald-700" /> Using profile:{" "}
            {user.name}
            <Tag tone="sky">{s.stays ? "Returning" : "Has profile"}</Tag>
            {s.inHouse && <Tag tone="emerald">In house now</Tag>}
          </p>
          <p className="text-xs text-neutral-600">
            {s.stays} stay{s.stays !== 1 ? "s" : ""} · {s.nights} night
            {s.nights !== 1 ? "s" : ""} · {taka(s.spent)} paid
            {s.last && ` · last ${dateLabel(s.last, "d MMM yyyy")}`}
          </p>
        </div>
        <div className="flex gap-1.5">
          <Link
            href={`${ADMIN}/users?guest=${user.id}`}
            target="_blank"
            className={cn(hbtn.small, focusRing)}
          >
            Profile <ExternalLink className="size-3" />
          </Link>
          <button
            type="button"
            onClick={onClear}
            className={cn(hbtn.small, focusRing)}
          >
            Not this guest
          </button>
        </div>
      </div>

      {(blocked || s.noShows > 0 || s.upcoming.length > 0 || user.note) && (
        <div className="mt-2.5 space-y-1 border-t border-neutral-200/70 pt-2.5 text-xs">
          {blocked && (
            <p className="flex items-center gap-1.5 font-medium text-rose-800">
              <Ban className="size-3.5" /> Blocked guest — you&rsquo;ll be asked
              to confirm before booking.
            </p>
          )}
          {s.noShows > 0 && (
            <p className="flex items-center gap-1.5 text-amber-800">
              <AlertTriangle className="size-3.5" /> {s.noShows} no-show
              {s.noShows > 1 ? "s" : ""} — consider collecting a deposit.
            </p>
          )}
          {s.upcoming.length > 0 && (
            <p className="text-neutral-700">
              Already booked:{" "}
              {s.upcoming.slice(0, 3).map((b, i) => (
                <span key={b.id}>
                  {i > 0 && ", "}
                  <Link
                    href={`${ADMIN}/bookings/${b.id}`}
                    target="_blank"
                    className="font-medium text-sky-700 hover:underline"
                  >
                    {b.code}
                  </Link>{" "}
                  ({dateLabel(b.checkIn, "d MMM yyyy")})
                </span>
              ))}{" "}
              — check this isn&rsquo;t a double booking.
            </p>
          )}
          {user.note && (
            <p className="rounded bg-white px-2 py-1.5 text-neutral-700 ring-1 ring-neutral-200">
              Staff note: {user.note}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
