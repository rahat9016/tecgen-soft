"use client";

import { Button } from "@/src/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover";
import { Clock } from "lucide-react";
import { Controller, useFormContext } from "react-hook-form";

export function ControlledTimePickerField({
  name,
  placeholder,
}: {
  name: string;
  placeholder?: string;
}) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <div className="flex flex-col">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="justify-start text-left font-normal"
              >
                <Clock className="mr-2 h-4 w-4" />
                {field.value || placeholder || "Select time"}
              </Button>
            </PopoverTrigger>

            <PopoverContent className="p-2">
              {/* <TimePicker
                value={field.value}
                onChange={(val) => field.onChange(val)}
              /> */}
            </PopoverContent>
          </Popover>

          {error?.message && (
            <span className="text-xs text-rose-500 mt-1">{error.message}</span>
          )}
        </div>
      )}
    />
  );
}
