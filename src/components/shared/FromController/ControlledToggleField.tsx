import { Controller, useFormContext } from "react-hook-form";

interface ControlledToggleFieldProps {
  name: string;
  label?: string;
  required?: boolean;
}

const ControlledToggleField: React.FC<ControlledToggleFieldProps> = ({
  name,
  label,
  required = false,
}) => {
  const { control } = useFormContext();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <div className="flex flex-col gap-2">
          {label && (
            <span className="text-[#666666]">
              {label}
              {required && <span className="text-rose-600">*</span>}
            </span>
          )}
          <label className="cursor-pointer inline-block">
            <div className="relative">
              <input
                type="checkbox"
                id={name}
                className="sr-only peer hidden"
                checked={field.value || false}
                onChange={(e) => field.onChange(e.target.checked)}
              />
              <div className="w-10 h-5 bg-light rounded-full peer-checked:bg-primary transition-colors"></div>
              <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5 "></div>
            </div>
          </label>
        </div>
      )}
    />
  );
};

export default ControlledToggleField;
