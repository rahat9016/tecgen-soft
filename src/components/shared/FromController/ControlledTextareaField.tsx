import { Controller, useFormContext } from "react-hook-form";
import { Textarea } from "../../ui/textarea";
import { cn } from "@/src/lib/utils";

interface ControlledTextareaFieldProps {
  name: string;
  placeholder?: string;
  className?: string;
}

const ControlledTextareaField: React.FC<ControlledTextareaFieldProps> = ({
  name,
  placeholder,
  className,
}) => {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => {
        return (
          <div>
            <Textarea
              {...field}
              placeholder={placeholder}
              className={cn(
                `h-40 ${
                  error
                    ? "border border-rose-500"
                    : "focus:ring-grayDark focus:border-[#D4D4D4]"
                }  focus:outline-none bg-[#F8F8F8]`,
                className
              )}
            />
            {error && (
              <div className="text-rose-500 text-xs mt-1 pl-2">
                {error.message}
              </div>
            )}
          </div>
        );
      }}
    />
  );
};

export default ControlledTextareaField;
