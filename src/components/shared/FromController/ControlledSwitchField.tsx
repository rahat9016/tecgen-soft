"use client";

import { cn } from "@/src/lib/utils";
import { Controller, useFormContext } from "react-hook-form";
import { Switch } from "../../ui/switch";

interface ControlledSwitchFieldProps {
  name: string;
  label?: string;
  description?: string;
  className?: string;
}

const ControlledSwitchField: React.FC<ControlledSwitchFieldProps> = ({
  name,
  label,
  description,
  className,
}) => {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      defaultValue={false}
      render={({ field, fieldState: { error } }) => {
        return (
          <div className={cn("flex items-start gap-3", className)}>
            <Switch checked={!!field.value} onCheckedChange={field.onChange} />

            <div className="flex flex-col">
              {label && (
                <label className="text-sm font-medium leading-none cursor-pointer">
                  {label}
                </label>
              )}

              {description && (
                <p className="text-xs text-muted-foreground mt-1">
                  {description}
                </p>
              )}

              {error && (
                <span className="text-xs text-rose-500 mt-1">
                  {error.message}
                </span>
              )}
            </div>
          </div>
        );
      }}
    />
  );
};

export default ControlledSwitchField;
