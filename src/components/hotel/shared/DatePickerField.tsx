"use client";

import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/src/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/src/components/ui/popover";

export default function DatePickerField({
  label,
  value,
  onChange,
  disabledBefore,
  open,
  onOpenChange,
}: {
  label: string;
  value: Date | null;
  onChange: (date: Date | null) => void;
  disabledBefore?: Date;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = open ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  return (
    <div>
      <label className="text-xs font-medium text-neutral-500">{label}</label>
      <Popover open={isOpen} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="mt-1 flex h-9 w-full items-center gap-1.5 rounded-md border border-neutral-200 bg-transparent px-3 text-left text-sm"
          >
            <CalendarIcon className="size-3.5 shrink-0 text-neutral-400" />
            <span className={value ? "text-neutral-900" : "text-neutral-400"}>
              {value ? format(value, "dd/MM/yyyy") : "dd/mm/yyyy"}
            </span>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value ?? undefined}
            onSelect={(date) => {
              onChange(date ?? null);
              setOpen(false);
            }}
            disabled={disabledBefore ? { before: disabledBefore } : undefined}
            autoFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
