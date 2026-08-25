"use client";

import * as SwitchPrimitive from "@radix-ui/react-switch";
import * as React from "react";
import { Check, X } from "lucide-react";
import { cn } from "@/src/lib/utils";

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      className={cn(
        "peer inline-flex h-[1.15rem] w-8 items-center rounded-full transition-colors",
        "data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
        "focus-visible:ring-[3px] focus-visible:ring-ring/50",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        className={cn(
          "group relative flex size-4 items-center justify-center rounded-full bg-background shadow",
          "transition-transform data-[state=checked]:translate-x-[calc(100%-2px)]"
        )}
      >
        <Check
          className="
            absolute size-3 text-primary
            opacity-0 scale-75
            transition-all duration-200
            group-data-[state=checked]:opacity-100
            group-data-[state=checked]:scale-100
          "
        />

        <X
          className="
            absolute size-3 text-muted-foreground
            opacity-100 scale-100
            transition-all duration-200
            group-data-[state=checked]:opacity-0
            group-data-[state=checked]:scale-75
          "
        />
      </SwitchPrimitive.Thumb>
    </SwitchPrimitive.Root>
  );
}

export { Switch };
