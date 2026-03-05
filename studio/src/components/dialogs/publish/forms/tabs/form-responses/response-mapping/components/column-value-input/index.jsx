import React, { useMemo, useState } from "react";
import { COLUMN_TYPES } from "../../constants";
import { Input } from "@/components/ui/input";
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
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

const ColumnValueInput = ({
  value,
  columnType,
  questions,
  onChange,
  dataTestId,
}) => {
  const [open, setOpen] = useState(false);
  
  const questionValue = useMemo(
    () => questions?.find((question) => question.key === value),
    [questions, value],
  );

  if (columnType === COLUMN_TYPES.QUESTION) {
    const comboboxOptions = useMemo(() => {
      return (questions || []).map((question) => ({
        value: question.key,
        label: question.question || "",
        option: question,
      }));
    }, [questions]);

    const handleSelect = (selectedValue) => {
      const selectedQuestion = questions?.find((q) => q.key === selectedValue);
      if (selectedQuestion) {
        onChange(selectedQuestion);
      }
      setOpen(false);
    };

    return (
      <div className="flex flex-col gap-0.25 h-full">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              role="combobox"
              aria-expanded={open}
              onClick={(e) => e.stopPropagation()}
              className={cn(
                "h-full justify-between border-none bg-transparent hover:bg-transparent font-normal text-sm p-0 min-h-[32px] w-full",
                !questionValue && "text-muted-foreground"
              )}
              data-testid={`${dataTestId}-question`}
            >
              <span className="truncate flex-1 text-left">
                {questionValue ? questionValue.question : "Select question..."}
              </span>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent 
            className="w-max min-w-[200px] max-w-[min(360px,calc(100vw-2rem))] p-0 z-[999999999]" 
            align="start"
            side="bottom"
            sideOffset={4}
          >
            <Command className="rounded-md">
              <CommandInput placeholder="Search questions..." className="h-9" />
              <CommandList className="max-h-[240px]">
                <CommandEmpty>No question found.</CommandEmpty>
                <CommandGroup className="p-1">
                  {comboboxOptions.map((option) => {
                    const isSelected = value === option.value;
                    return (
                      <CommandItem
                        key={String(option.value)}
                        value={option.label}
                        onSelect={() => handleSelect(option.value)}
                        className="cursor-pointer py-1.5 px-2 text-sm"
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4 shrink-0",
                            isSelected ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <span className="break-words whitespace-normal min-w-0">{option.label}</span>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-0.25 h-full">
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter static value"
        className={cn(
          "h-full border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 p-0 text-sm min-h-[32px]"
        )}
        data-testid={`${dataTestId}-static`}
      />
    </div>
  );
};

export default ColumnValueInput;
