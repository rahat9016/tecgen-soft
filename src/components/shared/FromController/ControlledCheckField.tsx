import { Controller, useFormContext } from "react-hook-form";
import { Checkbox } from "../../ui/checkbox";
import { Label } from "../../ui/label";

interface ControlledCheckFieldProps {
  name: string;
  label: string;
}

export function ControlledCheckField({
  name,
  label,
}: ControlledCheckFieldProps) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id={name}
              checked={!!field.value}
              onCheckedChange={(checked) => field.onChange(!!checked)}
            />
            <Label htmlFor={name} className="text-[#666666] cursor-pointer">
              {label}
            </Label>
          </div>
          {error?.message && (
            <div className="text-rose-500 text-xs mt-1 pl-2">
              {error?.message}
            </div>
          )}
        </div>
      )}
    />
  );
}
