"use client";

import { format } from "date-fns";
import * as React from "react";
import { Controller, useFormContext } from "react-hook-form";

interface ControlledDatePickerProps {
  name: string;
  label?: string;
  placeholder?: string;
  className?: string;
}

const ControlledDatePicker: React.FC<ControlledDatePickerProps> = ({
  name,
  label,
  className,
}) => {
  const { control } = useFormContext();

  return (
    <div className={`flex flex-col gap-2 ${className || ""}`}>
      {label && <label className="text-sm font-medium">{label}</label>}

      <Controller
        name={name}
        control={control}
        render={({ field, fieldState: { error } }) => (
          <>
            <div className="relative">
              <input
                type="date"
                value={
                  field.value ? format(new Date(field.value), "yyyy-MM-dd") : ""
                }
                onChange={(e) => {
                  const value = e.target.value
                    ? new Date(e.target.value).toISOString()
                    : null;
                  field.onChange(value);
                }}
                className={`w-full border rounded-md px-3 py-2 pr-10 text-sm 
                  focus:outline-none focus:ring-2 focus:ring-blue-500 
                  ${error ? "border-red-500" : "border-gray-300"}`}
              />
              {/* <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" /> */}
            </div>

            {error && (
              <p className="text-sm text-red-500 mt-1">{error.message}</p>
            )}
          </>
        )}
      />
    </div>
  );
};

export default ControlledDatePicker;
