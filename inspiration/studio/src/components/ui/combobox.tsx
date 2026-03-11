"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface ComboboxOption {
  value: string | number;
  label: string;
  option?: any;
}

export interface ComboboxProps {
  options: ComboboxOption[];
  value?: string | number;
  onValueChange?: (value: string | number) => void;
  searchable?: boolean;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  style?: React.CSSProperties;
}

const Combobox = React.forwardRef<HTMLButtonElement, ComboboxProps>(
  (
    {
      options = [],
      value,
      onValueChange,
      searchable = false,
      placeholder = "Select option...",
      className,
      disabled,
      style,
      ...props
    },
    ref
  ) => {
    const [open, setOpen] = React.useState(false);

    const selectedOption = options.find((option) => option.value === value);

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <div className="w-full block min-w-0">
          <PopoverTrigger asChild>
            <Button
            ref={ref}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full min-w-0 justify-between",
              !value && "text-muted-foreground",
              className
            )}
            disabled={disabled}
            style={style}
            {...props}
          >
            {selectedOption ? selectedOption.label : placeholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        </div>
        <PopoverContent 
          className={cn(
            "w-[var(--radix-popover-trigger-width)] p-0 z-[9999]"
          )} 
          align="start"
        >
          <Command>
            {searchable && <CommandInput placeholder="Search..." />}
            <CommandList>
              <CommandEmpty>No option found.</CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={String(option.value)}
                    value={String(option.value)}
                    onSelect={() => {
                      onValueChange?.(option.value);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === option.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  }
);
Combobox.displayName = "Combobox";

export { Combobox };
