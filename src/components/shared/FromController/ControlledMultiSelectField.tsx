import { useRef } from "react";
import { Controller, useFormContext } from "react-hook-form";
import type { GroupBase, StylesConfig } from "react-select";
import CreatableSelect from "react-select/creatable";

type Option = { label: string; value: string };
interface ControlledMultiSelectFieldProps {
  name: string;
  options: Option[];
  placeholder?: string;
  className?: string;
  /** "number" (default) stores numeric ids; "string" stores the values as typed, including created ones. */
  valueType?: "number" | "string";
  styles?: StylesConfig<Option, true, GroupBase<Option>>;
}

const ControlledMultiSelectField: React.FC<ControlledMultiSelectFieldProps> = ({
  name,
  options,
  placeholder,
  valueType = "number",
  styles,
}) => {
  const { control } = useFormContext();
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div className={`relative w-full `} ref={containerRef}>
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState: { error } }) =>
          valueType === "string" ? (
            <>
              <CreatableSelect
                isMulti
                instanceId={name}
                styles={styles}
                closeMenuOnSelect={false}
                formatCreateLabel={(input) => `Add "${input}"`}
                noOptionsMessage={() => "Nothing found — type to add your own"}
                options={options}
                value={((field.value ?? []) as string[]).map((v) => ({
                  label: options.find((o) => o.value === v)?.label ?? v,
                  value: v,
                }))}
                placeholder={placeholder || "Select options"}
                onChange={(selected) => {
                  field.onChange(selected.map((opt) => opt.value));
                }}
                onCreateOption={(inputValue) => {
                  const v = inputValue.trim();
                  if (v && !(field.value ?? []).includes(v)) {
                    field.onChange([...(field.value ?? []), v]);
                  }
                }}
              />
              {error && (
                <div className="text-rose-500 text-xs mt-1 pl-2">
                  {error.message}
                </div>
              )}
            </>
          ) : (
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
          )
        }
      />
    </div>
  );
};

export default ControlledMultiSelectField;
