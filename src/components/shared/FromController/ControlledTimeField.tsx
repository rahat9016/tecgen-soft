import { cn } from "@/src/lib/utils";
import { useRef } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { Input } from "../../ui/input";

function isHourMinute(value: string) {
  return /^\d{2}:\d{2}$/.test(value);
}

function parseToHoursMinutes(
  dateTime: string | Date | null | undefined
): { hours: number; minutes: number } | null {
  if (!dateTime) return null;

  if (typeof dateTime === "string" && isHourMinute(dateTime)) {
    const [hours, minutes] = dateTime.split(":").map(Number);
    return { hours, minutes };
  }

  const date = new Date(dateTime);
  if (Number.isNaN(date.getTime())) return null;

  return {
    hours: date.getHours(),
    minutes: date.getMinutes(),
  };
}
function formatTime24Hour(dateTime: string | Date | null | undefined) {
  const parsed = parseToHoursMinutes(dateTime);
  if (!parsed) return "";

  const hours = String(parsed.hours).padStart(2, "0");
  const minutes = String(parsed.minutes).padStart(2, "0");
  return `${hours}:${minutes}`;
}

// Combine selected time with today’s date
function combineWithToday(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  const now = new Date();
  now.setHours(hours, minutes, 0, 0);
  return now.toISOString();
}
export function ControlledTimeField({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const { control } = useFormContext();
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <div className={cn("flex items-center gap-2", className)}>
          <Input
            ref={inputRef}
            type="time"
            value={field.value ? formatTime24Hour(field.value) : ""}
            onChange={(e) => {
              const time = e.target.value;
              const fullDateTime = combineWithToday(time);
              field.onChange(fullDateTime);
            }}
            placeholder="HH:MM"
            className="bg-transparent h-full w-full text-secondary-dark text-sm flex items-center"
            onClick={() => inputRef.current?.showPicker?.()}
          />
        </div>
      )}
    />
  );
}
