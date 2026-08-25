import { useRef } from "react";
import { Controller, useFormContext } from "react-hook-form";
import CreatableSelect from "react-select/creatable";
interface ControlledMultiSelectFieldProps {
  name: string;
  options: { label: string; value: string }[];
  placeholder?: string;
  className?: string;
}

const ControlledMultiSelectField: React.FC<ControlledMultiSelectFieldProps> = ({
  name,
  options,
  placeholder,
}) => {
  const { control } = useFormContext();
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div className={`relative w-full `} ref={containerRef}>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <CreatableSelect
            isMulti
            options={options}
            value={options.filter((opt) =>
              field.value?.includes(Number(opt.value))
            )}
            placeholder={placeholder || "Select options"}
            onChange={(selected) => {
              field.onChange(selected.map((opt) => Number(opt.value)));
            }}
            onCreateOption={(inputValue) => {
              const newOption = {
                label: inputValue,
                value: String(Date.now()),
              };
              field.onChange([...field.value, Number(newOption.value)]);
            }}
          />
        )}
      />
    </div>
  );
};

export default ControlledMultiSelectField;
