import React, { useMemo } from "react";
import { CornerDownRight, ChevronDown, X, Plus, StopCircle } from "lucide-react";
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
import { CANVAS_MODE, CANVAS_MODES } from "@src/module/constants/canvasConstants";

const Action = ({
  index,
  availableNodes,
  selectedAction,
  statementType,
  onChange = () => {},
  onAddNode = () => {},
  addEndNodeInElse,
}) => {
  const [open, setOpen] = React.useState(false);

  const selectedNode = useMemo(() => {
    if (!selectedAction) return null;
    return availableNodes?.find((node) => node.key === selectedAction) || null;
  }, [selectedAction, availableNodes]);

  const handleSelect = (node) => {
    onChange(node.key);
    setOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange(null);
  };

  const showEndNodeOption =
    statementType === "else" && CANVAS_MODE() === CANVAS_MODES.WC_CANVAS;

  return (
    <div className="flex flex-col gap-2 w-full">
      {statementType !== "else" && (
        <span className="text-sm font-medium text-gray-700">Then jump to</span>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            data-testid={`then-jump-to-node-${index}`}
            className={cn(
              "w-full h-10 justify-between font-normal",
              "border-gray-200 bg-white hover:bg-gray-50",
              !selectedNode && "text-gray-500 border-red-300"
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
                      className="w-5 h-5 rounded-full flex-shrink-0"
                    />
                  )}
                  <span className="truncate text-gray-900">
                    {selectedNode.description || selectedNode.name || selectedNode.key}
                  </span>
                </div>
              ) : (
                <span className="text-gray-400">Select target node...</span>
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
        <PopoverContent className="w-[300px] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search nodes..." className="h-9" />
            <CommandList>
              <CommandEmpty>
                <div className="py-2 text-center text-sm text-gray-500">
                  No nodes found
                </div>
              </CommandEmpty>
              <CommandGroup>
                {availableNodes?.map((node) => {
                  const isDisabled = node.disabled && node.key !== selectedAction;
                  return (
                    <CommandItem
                      key={node.key}
                      value={node.description || node.name || node.key}
                      onSelect={() => !isDisabled && handleSelect(node)}
                      disabled={isDisabled}
                      className={cn(
                        "flex items-center gap-3 py-2",
                        isDisabled && "opacity-40 cursor-not-allowed"
                      )}
                    >
                      {node._src ? (
                        <img
                          src={node._src}
                          alt=""
                          className="w-6 h-6 rounded-full flex-shrink-0"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs text-gray-500">
                            {(node.description || node.name || node.key)?.charAt(0)?.toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div className="flex flex-col min-w-0">
                        <span className="truncate font-medium">
                          {node.description || node.name || node.key}
                        </span>
                      </div>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup>
                <CommandItem
                  onSelect={() => {
                    setOpen(false);
                    onAddNode();
                  }}
                  className="flex items-center gap-3 py-2 text-blue-600 cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Plus className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="font-medium">Add new node</span>
                </CommandItem>
                {showEndNodeOption && (
                  <CommandItem
                    onSelect={() => {
                      setOpen(false);
                      addEndNodeInElse(index);
                    }}
                    className="flex items-center gap-3 py-2 text-gray-600 cursor-pointer"
                  >
                    <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <StopCircle className="w-4 h-4 text-gray-500" />
                    </div>
                    <span className="font-medium">End Node</span>
                  </CommandItem>
                )}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {!selectedNode && (
        <p className="text-xs text-red-400">Please select an action</p>
      )}
    </div>
  );
};

export default Action;
