import { ErrorType } from "@/src/types/common/common";
import { FieldError } from "react-hook-form";

const ErrorMessage = ({ error }: { error?: ErrorType | FieldError }) => {
  if (!error) return null;

  return (
    <div className="text-rose-600 bg-rose-200 text-center py-2 rounded-sm text-sm">
      {"errors" in error
        ? error.errors?.[0]
        : (error.message ?? "Something went wrong!")}
    </div>
  );
};
export default ErrorMessage;
