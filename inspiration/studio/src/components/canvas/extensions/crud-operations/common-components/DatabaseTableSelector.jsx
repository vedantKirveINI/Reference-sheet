import * as React from "react";
import { useState, useEffect } from "react";
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
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown, Table } from "lucide-react";

const DatabaseTableSelector = ({
  tables = [],
  value = null,
  onChange = () => {},
  disabled = false,
  loading = false,
  placeholder = "Select a table...",
  themeColor = "#336791",
}) => {
  const [open, setOpen] = useState(false);

  const handleSelect = (table) => {
    onChange(null, table);
    setOpen(false);
  };

  const selectedTable = value;
  const tableId = selectedTable?._id || selectedTable?.table_id || selectedTable?.id;

  useEffect(() => {
    if (tables.length > 1 && !selectedTable) {
      setOpen(true);
    }
  }, [tables, selectedTable]);

  const getColumnCount = (table) => {
    if (table?.columns?.length) {
      return `${table.columns.length} column${table.columns.length !== 1 ? "s" : ""}`;
    }
    if (table?.fields?.length) {
      return `${table.fields.length} field${table.fields.length !== 1 ? "s" : ""}`;
    }
    if (table?.schema?.length) {
      return `${table.schema.length} column${table.schema.length !== 1 ? "s" : ""}`;
    }
    return null;
  };

  if (loading) {
    return (
      <div className="h-10 rounded-xl bg-gray-100 animate-pulse" />
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className={cn(
              "w-full justify-between rounded-xl bg-white border border-gray-200 h-10 px-3",
              "hover:bg-gray-50 transition-colors",
              !selectedTable && "text-gray-500",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            <div className="flex items-center gap-2 truncate">
              <Table className="h-4 w-4 shrink-0 text-gray-400" />
              <span className="truncate font-medium">
                {selectedTable?.name || placeholder}
              </span>
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent 
          className="w-[var(--radix-popover-trigger-width)] p-0 rounded-xl shadow-lg border border-gray-200" 
          align="start"
        >
          <Command>
            <CommandInput placeholder="Search tables..." className="h-10" />
            <CommandList>
              <CommandEmpty>No tables found.</CommandEmpty>
              <CommandGroup>
                {tables.map((table) => {
                  const optionId = table?._id || table?.table_id || table?.id || table?.name;
                  const isSelected = tableId === optionId || selectedTable?.name === table?.name;
                  const columnCount = getColumnCount(table);
                  
                  return (
                    <CommandItem
                      key={optionId}
                      value={table?.name}
                      onSelect={() => handleSelect(table)}
                      className={cn(
                        "flex items-center justify-between px-3 py-2.5 cursor-pointer rounded-lg mx-1 my-0.5",
                        "hover:bg-gray-50 transition-colors"
                      )}
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Table className="h-4 w-4 shrink-0 text-gray-400" />
                        <div className="flex flex-col items-start gap-0.5 min-w-0">
                          <span className="font-medium text-gray-900 truncate">
                            {table?.name}
                          </span>
                          {columnCount && (
                            <span className="text-xs text-gray-500">
                              {columnCount}
                            </span>
                          )}
                        </div>
                      </div>
                      <Check
                        className={cn(
                          "h-4 w-4 shrink-0 ml-2",
                          isSelected ? "opacity-100" : "opacity-0"
                        )}
                        style={{ color: themeColor }}
                      />
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
    </Popover>
  );
};

export default DatabaseTableSelector;
