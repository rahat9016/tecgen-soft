import { cn } from "@/src/lib/utils";

export default function InputLabel({
  label,
  required,
  className,
  isOptional,
}: {
  label: string | undefined;
  required?: boolean;
  className?: string;
  isOptional?: boolean;
}) {
  return (
    <div>
      {label && (
        <p
          className={cn(
            `text-secondary-dark text-base mb-1 font-normal`,
            className
          )}
        >
          {label}
          {required && <span className="text-rose-600">*</span>}
          {isOptional && (
            <span className="text-[#BDBDBD] ml-1 text-base font-normal">
              (Optional)
            </span>
          )}
        </p>
      )}
    </div>
  );
}
