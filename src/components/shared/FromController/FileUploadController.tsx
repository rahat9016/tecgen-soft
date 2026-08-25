import { cn } from "@/src/lib/utils";
import { isValidUrl } from "@/src/utils/isValidUrl";
import { normalizeImageSrc } from "@/src/utils/normalizeImageSrc";
import { AnimatePresence, motion } from "framer-motion";
import { FileText, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
export const SUPPORTED_FORMATS = [
  "image/jpg",
  "image/webp",
  "image/svg+xml",
  "image/jpeg",
  "image/png",
  "image/heic",
  "image/heif",
];

interface FileUploadControllerProps {
  name: string;
  className?: string;
  imgClassName?: string;
  initialUrl?: string;
  label?: string;
}

export function FileUploadController({
  name,
  label,
  className,
  imgClassName,
}: FileUploadControllerProps) {
  const { control, getValues } = useFormContext();
  const initialUrl = getValues(name);

  const [touched, setTouched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <Controller
      name={name}
      control={control}
      defaultValue={null}
      render={({ field, fieldState }) => {
        const fileValue = field.value ?? null;
        const normalizedFileValue =
          typeof fileValue === "string" ? normalizeImageSrc(fileValue) : "";
        const normalizedInitialValue =
          typeof initialUrl === "string" ? normalizeImageSrc(initialUrl) : "";

        const preview =
          fileValue instanceof File
            ? URL.createObjectURL(fileValue)
            : normalizedFileValue || (!touched ? normalizedInitialValue : "");

        const hasValidPreviewUrl =
          typeof preview === "string" &&
          !!preview &&
          (isValidUrl(preview) || preview.startsWith("/"));

        const imagePathForCheck =
          typeof preview === "string" ? preview.split(/[?#]/)[0] : "";

        // detect image
        const isImage =
          fileValue instanceof File
            ? fileValue.type.startsWith("image/")
            : hasValidPreviewUrl
              ? /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(imagePathForCheck)
              : false;

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

          if (typeof preview === "string") {
            const filePath = preview.split(/[?#]/)[0].toLowerCase();
            if (filePath.endsWith(".pdf")) {
              return <FileText className="w-10 h-10 text-rose-600" />;
            }
            if (filePath.endsWith(".doc") || filePath.endsWith(".docx")) {
              return <FileText className="w-10 h-10 text-blue-600" />;
            }
          }

          return (
            <Image src="/icons/file.svg" alt="File" width={40} height={40} />
          );
        };

        return (
          <div>
            <div className="flex flex-col lg:flex-row items-center gap-4">
              {/* Upload box */}
              <div
                className={cn(
                  "w-44.25 h-39.25 border border-dashed border-light-silver bg-[#F7F7F7] rounded-lg hover:border-dashboard-primary",
                  className
                )}
              >
                <label
                  htmlFor={`${name}-file`}
                  className="flex items-center justify-center h-full cursor-pointer select-none"
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
                          {label || "Upload Cover image"}
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <input
                    id={`${name}-file`}
                    type="file"
                    accept={SUPPORTED_FORMATS.join(",")}
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
              </div>

              {/* Preview */}
              <AnimatePresence>
                {(fileValue instanceof File || hasValidPreviewUrl) && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="relative w-44.25 h-39.25"
                  >
                    <button
                      onClick={handleDelete}
                      type="button"
                      className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center z-10 cursor-pointer"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>

                    {isImage && preview ? (
                      <Image
                        src={preview}
                        width={244}
                        height={132}
                        alt="Preview"
                        className={cn(
                          "w-full h-full object-contain rounded-lg border border-light",
                          imgClassName
                        )}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center border rounded-lg p-3 h-full">
                        {renderFileIcon()}
                        <p className="text-xs mt-1 truncate max-w-50">
                          {fileValue instanceof File
                            ? fileValue.name
                            : "File selected"}
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Error */}
            {fieldState.error && (
              <p className="text-rose-500 text-xs mt-1 pl-2">
                {fieldState.error.message}
              </p>
            )}
          </div>
        );
      }}
    />
  );
}
