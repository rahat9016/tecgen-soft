"use client";

import { useState } from "react";
import { useFormContext, useFormState, useWatch } from "react-hook-form";
import { format, startOfToday } from "date-fns";
import {
  Building2,
  CalendarClock,
  CalendarDays,
  Footprints,
  LogIn,
  Phone,
} from "lucide-react";
import { Calendar } from "@/src/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover";
import { parseDayKey, toDayKey } from "@/src/lib/hotelDates";
import { todayKey } from "@/src/lib/hotel-store/format";
import { useT } from "@/src/lib/hotel-store/i18n";
import { cn } from "@/src/lib/utils";
import CommissionPanel from "./CommissionPanel";
import {
  FieldError,
  fieldLabel,
  focusRing,
  FormField,
  Section,
  Segmented,
  Stepper,
} from "./parts";
import type { BookingFormValues } from "./schema";

const longDate = (d: Date) => format(d, "EEE, d MMM yyyy");
const fieldDate = (d: Date) => format(d, "d MMM yyyy");

export function StaySection({ step }: { step: number }) {
  const t = useT();
  const { control, setValue } = useFormContext<BookingFormValues>();
  const { isSubmitted } = useFormState({ control });
  const [source, checkIn, checkOut, status] = useWatch({
    control,
    name: ["source", "checkIn", "checkOut", "status"],
  });
  const opts = { shouldDirty: true, shouldValidate: isSubmitted };
  const isToday = checkIn === todayKey();
  const checkingIn = status === "check-in";

  return (
    <Section
      id="stay"
      step={step}
      title="Stay details"
      aside={
        <Segmented
          label="Booking source"
          value={source}
          onChange={(s) => setValue("source", s, opts)}
          options={[
            { value: "walk-in", label: "Walk-in", icon: Footprints },
            { value: "phone", label: "Phone", icon: Phone },
            { value: "agent", label: "Agent", icon: Building2 },
          ]}
          className="w-full sm:w-auto"
        />
      }
    >
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-[minmax(0,2.4fr)_minmax(0,1fr)_minmax(0,1fr)]">
        <div className="col-span-2 lg:col-span-1">
          <StayDates
            checkIn={checkIn}
            checkOut={checkOut}
            onChange={(ci, co) => {
              const o = { ...opts, shouldTouch: true };
              setValue("checkIn", ci, o);
              setValue("checkOut", co, o);
            }}
          />
          <FieldError name="checkIn" />
          <FieldError name="checkOut" />
        </div>
        <FormField label="Adults" name="adults">
          <Stepper name="adults" label="adults" min={1} max={60} />
        </FormField>
        <FormField label="Children" name="children" hint="Under 12">
          <Stepper name="children" label="children" min={0} max={30} />
        </FormField>
      </div>

      <div className="mt-4 sm:mt-5">
        <span className={fieldLabel}>{t("Arrival")}</span>
        <div
          role="radiogroup"
          aria-label={t("Arrival")}
          className="grid grid-cols-2 gap-2"
        >
          <ArrivalOption
            on={!checkingIn}
            icon={CalendarClock}
            title="Reserve for later"
            text="Hold the rooms. The guest checks in on arrival."
            onClick={() => checkingIn && setValue("status", "confirmed", opts)}
          />
          <ArrivalOption
            on={checkingIn}
            icon={LogIn}
            title="Check in now"
            text={
              isToday
                ? "Guest is at the desk. Needs ready rooms and ID."
                : "Only for stays starting today."
            }
            disabled={!isToday}
            onClick={() => setValue("status", "check-in", opts)}
          />
        </div>
        <FieldError name="status" />
      </div>

      {source === "agent" && <CommissionPanel />}
    </Section>
  );
}

function ArrivalOption({
  on,
  icon: Icon,
  title,
  text,
  disabled,
  onClick,
}: {
  on: boolean;
  icon: typeof LogIn;
  title: string;
  text: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  const t = useT();
  return (
    <button
      type="button"
      role="radio"
      aria-checked={on}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex items-start gap-2.5 rounded-md border px-3 py-2.5 sm:gap-3 sm:px-3.5 sm:py-3 text-left transition disabled:cursor-not-allowed disabled:bg-neutral-50",
        on
          ? "border-sky-500 bg-sky-50 ring-1 ring-sky-500"
          : "border-neutral-200 bg-white hover:border-sky-300",
        focusRing
      )}
    >
      <span
        className={cn(
          "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border-2",
          on ? "border-sky-600" : "border-neutral-300"
        )}
      >
        {on && <span className="size-2 rounded-full bg-sky-600" />}
      </span>
      <span className="min-w-0">
        <span
          className={cn(
            "flex items-center gap-1.5 text-sm font-semibold",
            disabled ? "text-neutral-500" : "text-neutral-900"
          )}
        >
          <Icon className="size-4" /> {t(title)}
        </span>
        <span className="mt-0.5 hidden text-xs text-neutral-600 sm:block">{t(text)}</span>
      </span>
    </button>
  );
}

/** Check-in and check-out as two input-height fields over one range calendar; check-out can't fall on or before check-in. */
function StayDates({
  checkIn,
  checkOut,
  onChange,
}: {
  checkIn: string;
  checkOut: string;
  onChange: (checkIn: string, checkOut: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const { errors } = useFormState<BookingFormValues>();
  const from = parseDayKey(checkIn);
  const to = parseDayKey(checkOut);

  const pick = (day: Date) => {
    // A finished stay, or a click on/before check-in, starts a new selection.
    if (!from || to || day <= from) return onChange(toDayKey(day), "");
    onChange(checkIn, toDayKey(day));
    setOpen(false);
  };

  const t = useT();
  const half = (
    label: string,
    date: Date | null,
    error: boolean,
    active: boolean
  ) => (
    <span className="min-w-0">
      <span className={fieldLabel}>{t(label)}</span>
      <span
        className={cn(
          "flex h-10 items-center gap-2 rounded-md border bg-white px-3 text-sm transition group-hover:border-sky-300",
          error
            ? "border-rose-400"
            : active
              ? "border-sky-500 ring-2 ring-sky-100"
              : "border-neutral-200"
        )}
      >
        <CalendarDays className="size-4 shrink-0 text-neutral-500" />
        <span
          className={cn(
            "truncate",
            date ? "font-medium text-neutral-900" : "text-neutral-500"
          )}
        >
          {date ? fieldDate(date) : t("Select date")}
        </span>
      </span>
    </span>
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={
            from && to
              ? `${t("Stay dates")}: ${longDate(from)} → ${longDate(to)}`
              : t("Choose stay dates")
          }
          className={cn(
            "group grid w-full grid-cols-2 gap-2 rounded-md text-left",
            focusRing
          )}
        >
          {half("Check-in", from, !!errors.checkIn, open && !from)}
          {half("Check-out", to, !!errors.checkOut, open && !!from && !to)}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={8}
        className="w-auto rounded-md p-0 shadow-xl"
      >
        <Calendar
          mode="range"
          numberOfMonths={2}
          selected={{ from: from ?? undefined, to: to ?? undefined }}
          onDayClick={pick}
          disabled={{ before: startOfToday() }}
          defaultMonth={from ?? undefined}
          autoFocus
        />
        <div className="flex items-center justify-between gap-3 border-t border-neutral-100 px-4 py-2.5 text-sm text-neutral-700">
          {!from
            ? t("Select the check-in date")
            : !to
              ? t("Now select the check-out date")
              : `${longDate(from)} → ${longDate(to)}`}
          <button
            type="button"
            onClick={() => setOpen(false)}
            className={cn(
              "rounded-md bg-sky-600 px-3 py-1.5 font-semibold text-white hover:bg-sky-700",
              focusRing
            )}
          >
            {t("Done")}
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
