"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import * as React from "react";
import { Controller, useFormContext } from "react-hook-form";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import { Button } from "../../ui/button";
import { cn } from "@/src/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../../ui/command";

type Option = {
  label: string;
  value: string;
};

interface ControlledComboboxSelectProps {
  name: string;
  options: Option[];
  placeholder?: string;
  searchPlaceholder?: string;
  className?: string;
}

const ControlledComboboxSelect: React.FC<ControlledComboboxSelectProps> = ({
  name,
  options,
  placeholder = "Select option...",
  searchPlaceholder = "Search...",
  className,
}) => {
  const { control } = useFormContext();
  const [open, setOpen] = React.useState(false);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => {
        const selected = options.find((opt) => opt.value === field.value);

        return (
          <div className="w-full">
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className={cn(
                    "h-10.5 w-full justify-between font-inter text-sm font-normal file:text-foreground placeholder:text-muted-foreground ",
                    error && "border-rose-500",
                    className
                  )}
                >
                  {selected?.label ?? placeholder}
                  <ChevronsUpDown className="opacity-50" />
                </Button>
              </PopoverTrigger>

              <PopoverContent className="p-0  w-(--radix-popover-trigger-width)">
                <Command>
                  <CommandInput
                    placeholder={searchPlaceholder}
                    className="h-9"
                  />
                  <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>
                    <CommandGroup>
                      {options.map((opt) => (
                        <CommandItem
                          key={opt.value}
                          value={opt.label}
                          onSelect={() => {
                            field.onChange(opt.value);
                            setOpen(false);
                          }}
                        >
                          {opt.label}
                          <Check
                            className={cn(
                              "ml-auto",
                              field.value === opt.value
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            {error && (
              <p className="mt-1 pl-2 text-xs text-rose-500">{error.message}</p>
            )}
          </div>
        );
      }}
    />
  );
};

export default ControlledComboboxSelect;
