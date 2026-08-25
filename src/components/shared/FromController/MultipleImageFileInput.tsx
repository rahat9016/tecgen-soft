import { cn } from "@/src/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Controller, FieldError, useFormContext } from "react-hook-form";

export const SUPPORTED_FORMATS = ["image/jpg", "image/jpeg", "image/png"];

interface MultipleImageUploadControllerProps {
  name: string;
  label?: string;
  className?: string;
  imgClassName?: string;
  initialUrls?: string[];
  maxFiles?: number;
}

const isFieldErrorMap = (error: unknown): error is Record<string, FieldError> =>
  typeof error === "object" && error !== null && !("message" in error);

export function MultipleImageUploadController({
  name,
  label,
  className,
  imgClassName,
  initialUrls = [],
  maxFiles,
}: MultipleImageUploadControllerProps) {
  const { control } = useFormContext();
  const [isLoading, setIsLoading] = useState(false);

  const parseFieldErrors = (
    fieldError: FieldError | Record<string, FieldError> | undefined
  ) => {
    if (!fieldError) return { messages: [], indexes: [] };

    if (isFieldErrorMap(fieldError)) {
      return {
        messages: Object.values(fieldError)
          .map((e) => e.message)
          .filter((m): m is string => typeof m === "string"),
        indexes: Object.keys(fieldError).map(Number),
      };
    }

    return {
      messages: fieldError.message ? [fieldError.message] : [],
      indexes: [],
    };
  };

  return (
    <Controller
      name={name}
      control={control}
      defaultValue={initialUrls}
      render={({ field, fieldState }) => {
        const files: (File | string)[] = Array.isArray(field.value)
          ? field.value
          : [];

        const previews = files.map((file) =>
          file instanceof File ? URL.createObjectURL(file) : file
        );

        const { messages, indexes } = parseFieldErrors(fieldState.error);

        const isMaxReached = maxFiles !== undefined && files.length >= maxFiles;

        const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          const selectedFiles = Array.from(e.target.files || []).filter(
            (file) => SUPPORTED_FORMATS.includes(file.type)
          );
          e.target.value = "";
          if (!selectedFiles.length) return;

          const remaining =
            maxFiles === undefined
              ? selectedFiles.length
              : maxFiles - files.length;
          const allowedFiles = selectedFiles.slice(0, Math.max(remaining, 0));
          if (!allowedFiles.length) return;

          setIsLoading(true);
          setTimeout(() => {
            field.onChange([...files, ...allowedFiles]);
            setIsLoading(false);
          }, 300);
        };

        const handleDelete = (index: number) => {
          const updated = files.filter((_, i) => i !== index);
          field.onChange(updated);
        };

        return (
          <div>
            <div className="flex flex-col lg:flex-row items-start gap-4">
              {/* Upload box */}
              <div
                className={cn(
                  "w-full lg:w-44.25 h-39.25 border border-dashed border-light-silver bg-[#F7F7F7] rounded-lg hover:border-dashboard-primary shrink-0",
                  isMaxReached && "opacity-50 hover:border-light-silver",
                  className
                )}
              >
                <label
                  htmlFor={`${name}-upload`}
                  className={cn(
                    "flex items-center justify-center h-full select-none",
                    isMaxReached
                      ? "cursor-not-allowed pointer-events-none"
                      : "cursor-pointer"
                  )}
                >
                  <AnimatePresence mode="wait">
                    {isLoading ? (
                      <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center gap-2"
                      >
                        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        <span className="text-xs text-gray-400">
                          Uploading...
                        </span>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="upload"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center"
                      >
                        <Image
                          width={36}
                          height={36}
                          src="/icons/plus.svg"
                          alt="plus"
                          className="w-4.5 mb-1"
                        />
                        <span className="text-xs text-[#A6A6A6] text-center px-2">
                          {isMaxReached
                            ? `Maximum ${maxFiles} images`
                            : label || "Upload images"}
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <input
                    id={`${name}-upload`}
                    type="file"
                    multiple
                    accept={SUPPORTED_FORMATS.join(",")}
                    className="hidden"
                    disabled={isMaxReached}
                    onChange={handleFileChange}
                  />
                </label>
              </div>

              {/* Preview Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6 gap-2">
                {previews.map((src, index) => (
                  <div
                    key={src + index}
                    className={cn(
                      "relative w-32 lg:w-44.25 h-24 lg:h-39.25 rounded-lg",
                      indexes.includes(index)
                        ? "border-2 border-rose-600"
                        : "border border-light"
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => handleDelete(index)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center z-10"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>

                    <Image
                      src={src}
                      alt={`Preview ${index}`}
                      fill
                      className={cn("object-contain rounded-lg", imgClassName)}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Error */}
            {messages.length > 0 && (
              <p className="text-rose-500 text-xs mt-1 pl-2">{messages[0]}</p>
            )}
          </div>
        );
      }}
    />
  );
}
