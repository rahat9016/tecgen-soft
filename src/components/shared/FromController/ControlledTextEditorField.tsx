"use client";

import { Controller, useFormContext } from "react-hook-form";
import TextEditor from "../text-editor/TextEditor";

interface ControlledTextEditorFieldProps {
  name: string;
  label?: string;
  className?: string;
  disabled?: boolean;
}

export default function ControlledTextEditorField({
  name,
  className,
}: ControlledTextEditorFieldProps) {
  const { control } = useFormContext();
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        return (
          <TextEditor
            value={field.value || ""}
            onChange={(value: string) => field.onChange(value)}
            error={fieldState.error}
            className={className}
          />
        );
      }}
    />
  );
}
