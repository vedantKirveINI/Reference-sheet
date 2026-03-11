import React, { useMemo } from "react";
import { CornerDownRight, ChevronDown, X, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";

const MoveToSelector = ({
  value,
  options = [],
  disabledKeys = new Set(),
  onChange,
  onAddNode,
  placeholder = "Select target node...",
  className,
}) => {
  const [open, setOpen] = React.useState(false);

  const selectedNode = useMemo(() => {
    if (!value?.key) return null;
    return options.find((opt) => opt.key === value.key) || value;
  }, [value, options]);

  const handleSelect = (node) => {
    onChange(node);
    setOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange(null);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full h-10 justify-between font-normal",
            "border-gray-200 bg-white hover:bg-gray-50",
            !selectedNode && "text-gray-500",
            className,
          )}
        >
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <CornerDownRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
            {selectedNode ? (
              <div className="flex items-center gap-2 min-w-0">
                {selectedNode._src && (
                  <img
                    src={selectedNode._src}
                    alt=""
                    className="w-5 h-5 flex-shrink-0"
                  />
                )}
                <span className="truncate text-gray-900">
                  {selectedNode.name || selectedNode.key}
                </span>
              </div>
            ) : (
              <span className="text-gray-400">{placeholder}</span>
            )}
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            {selectedNode && (
              <div
                role="button"
                onClick={handleClear}
                className="p-0.5 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </div>
            )}
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search nodes..." className="h-9" />
          <CommandList>
            <CommandEmpty>
              <div className="py-2 text-center text-sm text-gray-500">
                No nodes found
              </div>
            </CommandEmpty>
            <CommandGroup>
              {options.map((node) => {
                const isDisabled =
                  disabledKeys.has(node.key) && node.key !== value?.key;
                return (
                  <CommandItem
                    key={node.key}
                    value={node.name || node.key}
                    onSelect={() => !isDisabled && handleSelect(node)}
                    disabled={isDisabled}
                    className={cn(
                      "flex items-center gap-3 py-2",
                      isDisabled && "opacity-40 cursor-not-allowed",
                    )}
                  >
                    {node._src ? (
                      <img
                        src={node._src}
                        alt=""
                        className="w-6 h-6 rounded-full"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-xs text-gray-500">
                          {(node.name || node.key)?.charAt(0)?.toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="flex flex-col min-w-0">
                      <span className="truncate font-medium">
                        {node.name || node.key}
                      </span>
                      {node.description && (
                        <span className="text-xs text-gray-500 truncate">
                          {node.description}
                        </span>
                      )}
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
            {onAddNode && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => {
                      setOpen(false);
                      onAddNode();
                    }}
                    className="flex items-center gap-3 py-2 text-blue-600 cursor-pointer"
                  >
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                      <Plus className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="font-medium">Add new node</span>
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default MoveToSelector;
