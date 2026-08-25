"use client";

import { cn } from "@/src/lib/utils";
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";
import * as React from "react";

const ToggleGroup = ToggleGroupPrimitive.Root;

const ToggleGroupItem = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Item>
>(({ className, ...props }, ref) => (
  <ToggleGroupPrimitive.Item
    ref={ref}
    className={cn(
      "px-4 py-1.5 text-sm rounded-full transition-colors",
      "data-[state=on]:bg-blue-600 data-[state=on]:text-white",
      "data-[state=off]:bg-white data-[state=off]:text-black",
      className
    )}
    {...props}
  />
));

ToggleGroupItem.displayName = "ToggleGroupItem";

export { ToggleGroup, ToggleGroupItem };
