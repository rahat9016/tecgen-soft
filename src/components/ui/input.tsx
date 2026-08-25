import * as React from "react";

import { cn } from "@/src/lib/utils";

interface IInputProps extends React.ComponentProps<"input"> {
  showErrorMessage?: boolean;
  error?: string;
}
const Input = React.forwardRef<HTMLInputElement, IInputProps>(
  ({ className, type, showErrorMessage, error, ...props }, ref) => {
    return (
      <div className="w-full">
        <input
          type={type}
          className={cn(
            `flex h-11 w-full rounded-md border border-light-silver bg-white px-3 py-1 text-base transition-colors file:border-0 focus:outline-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 md:text-sm ${
              error
                ? "border border-rose-500"
                : "focus:ring-light-silver focus:border-light-silver"
            }`,
            className
          )}
          ref={ref}
          {...props}
        />
        {showErrorMessage && error && (
          <div className="text-rose-500 text-xs mt-1 pl-2">{error}</div>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
