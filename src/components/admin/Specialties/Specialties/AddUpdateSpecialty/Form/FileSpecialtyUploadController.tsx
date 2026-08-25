import { cn } from "@/src/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { FileText } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { toast } from "react-toastify";
export const SUPPORTED_FORMATS = [
  "image/jpg",
  "image/webp",
  "image/svg+xml",
  "image/jpeg",
  "image/png",
  "image/heic",
  "image/heif",
];

interface FileSpecialtyUploadControllerProps {
  name: string;
  className?: string;
  imgClassName?: string;
  initialUrl?: string;
  label?: string;
}

export function FileSpecialtyUploadController({
  name,
  label,
  className,
  imgClassName,
}: FileSpecialtyUploadControllerProps) {
  const { control, getValues } = useFormContext();
  const initialUrl = getValues(name);

  const getErrorFromPath = (
    errors: unknown,
    path: string
  ): string | undefined => {
    const keys = path.replace(/\[(\d+)\]/g, ".$1").split(".");

    let current: unknown = errors;

    for (const key of keys) {
      if (current === null || current === undefined) {
        return undefined;
      }
      current = (current as Record<string, unknown>)[key];
    }

    const message = (current as { message?: string } | undefined)?.message;
    return message;
  };

  const [touched, setTouched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <Controller
      name={name}
      control={control}
      defaultValue={null}
      render={({ field, fieldState, formState: { errors } }) => {
        const nestedPathError = getErrorFromPath(errors, name);
        const errorMessage = fieldState.error?.message || nestedPathError;
        const fileValue = field.value ?? null;
        // detect image
        const isImage =
          fileValue instanceof File
            ? fileValue.type.startsWith("image/")
            : typeof fileValue === "string"
              ? /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(fileValue)
              : !touched && initialUrl
                ? /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(initialUrl)
                : false;

        // preview url
        const preview =
          fileValue instanceof File
            ? URL.createObjectURL(fileValue)
            : typeof fileValue === "string"
              ? fileValue
              : !touched
                ? initialUrl
                : null;

        const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          const file = e.target.files?.[0];
          if (!file) return;

          setTouched(true);
          setIsLoading(true);

          // small delay for UX animation
          setTimeout(() => {
            field.onChange(file);
            setIsLoading(false);
          }, 400);
        };

        const handleDelete = () => {
          setTouched(true);
          field.onChange(null);
          toast.success("Image removed successfully", {
            position: "bottom-left",
          });
        };

        const renderFileIcon = () => {
          if (fileValue instanceof File) {
            if (fileValue.type === "application/pdf") {
              return <FileText className="w-10 h-10 text-rose-600" />;
            }
            if (
              fileValue.type.includes("word") ||
              fileValue.name.endsWith(".doc") ||
              fileValue.name.endsWith(".docx")
            ) {
              return <FileText className="w-10 h-10 text-blue-600" />;
            }
          }

          if (typeof fileValue === "string") {
            if (fileValue.endsWith(".pdf")) {
              return <FileText className="w-10 h-10 text-rose-600" />;
            }
            if (fileValue.endsWith(".doc") || fileValue.endsWith(".docx")) {
              return <FileText className="w-10 h-10 text-blue-600" />;
            }
          }

          return (
            <Image src="/icons/file.svg" alt="File" width={40} height={40} />
          );
        };

        return (
          <div className="w-full">
            <div
              className={cn(
                `relative w-full h-100 ${preview ? "" : "border"}  border-dashed border-light-silver bg-[#F7F7F7] rounded-lg hover:border-dashboard-primary`,
                className
              )}
            >
              <label
                htmlFor={`${name}-file`}
                className="flex items-center justify-center h-full cursor-pointer select-none"
              >
                <AnimatePresence mode="wait">
                  {/* LOADING */}
                  {isLoading && (
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
                  )}

                  {/* PREVIEW */}
                  {!isLoading && preview && (
                    <motion.div
                      key="preview"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="relative w-full h-full"
                    >
                      {/* Delete */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDelete();
                        }}
                        className="
                        absolute top-6 right-6 w-11 h-11 rounded-full flex items-center justify-center z-10 border border-white/40 bg-white/30 backdrop-blur-md
                        hover:bg-white/40 transition cursor-pointer"
                      >
                        <Image
                          src="/icons/delete.svg"
                          width={16}
                          height={16}
                          alt="Close"
                        />
                      </button>

                      {isImage ? (
                        <Image
                          src={preview}
                          alt="Preview"
                          fill
                          className={cn(
                            "object-cover rounded-lg ",
                            imgClassName
                          )}
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full">
                          {renderFileIcon()}
                          <p className="text-xs mt-2 truncate max-w-[90%]">
                            {fileValue instanceof File
                              ? fileValue.name
                              : "File selected"}
                          </p>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* UPLOAD */}
                  {!isLoading && !preview && (
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
                        {label || "Upload Cover image"}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {!preview && (
                  <input
                    id={`${name}-file`}
                    type="file"
                    accept={SUPPORTED_FORMATS.join(",")}
                    className="hidden"
                    onChange={handleFileChange}
                  />
                )}
              </label>
            </div>
            {errorMessage && (
              <div className=" z-20">
                <p className="text-rose-500 text-xs bg-white/90 rounded px-2 py-1 leading-4">
                  {errorMessage}
                </p>
              </div>
            )}
          </div>
        );
      }}
    />
  );
}
