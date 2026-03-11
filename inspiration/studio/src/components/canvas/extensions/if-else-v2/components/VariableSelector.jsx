import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import {
  SchemaList,
  processNodeVariablesForSchemaList,
} from "@/components/formula-fx/src";
import { icons } from "@/components/icons";
import InfoTooltip from "./InfoTooltip";
import { calculateCharacterLimits } from "../utils/utils";

const VariableSelector = ({
  variables,
  selectedVariable,
  onChange = () => {},
}) => {
  const [current, setCurrent] = useState(selectedVariable || {});
  const anchorRef = useRef();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [characterLimits, setCharacterLimits] = useState({
    startChars: 45,
    endChars: 20,
  });

  const nodeVariables = variables?.NODE || [];

  const processedNodes = useMemo(
    () => processNodeVariablesForSchemaList(nodeVariables),
    [nodeVariables],
  );

  const filteredNodes = useMemo(() => {
    if (!searchQuery.trim()) return processedNodes;
    const q = searchQuery.toLowerCase();
    return processedNodes.filter((node) => {
      const name = (
        node?.name ||
        node?.description ||
        node?.label ||
        ""
      ).toLowerCase();
      if (name.includes(q)) return true;
      const schema = node?.schema || [];
      return schema.some((field) =>
        (field?.label || field?.key || "").toLowerCase().includes(q),
      );
    });
  }, [processedNodes, searchQuery]);

  const handleSelect = useCallback(
    (block) => {
      setCurrent(block);
      onChange(block);
      setOpen(false);
      setSearchQuery("");
    },
    [onChange],
  );

  const handleClear = useCallback(
    (e) => {
      e.stopPropagation();
      setCurrent({});
      onChange(null);
    },
    [onChange],
  );

  const displayText = useMemo(() => {
    if (!current || Object.keys(current).length === 0) return "";
    const raw = current.value || current.subType || "";
    if (
      raw.length <=
      characterLimits.startChars + characterLimits.endChars + 5
    ) {
      return raw;
    }
    return `${raw.slice(0, characterLimits.startChars)} ... ${raw.slice(-characterLimits.endChars)}`;
  }, [current, characterLimits]);

  useEffect(() => {
    const updateLimits = () => {
      if (anchorRef.current) {
        const containerWidth = anchorRef.current.offsetWidth;
        const limits = calculateCharacterLimits(containerWidth);
        setCharacterLimits(limits);
      }
    };
    updateLimits();
    window.addEventListener("resize", updateLimits);
    return () => window.removeEventListener("resize", updateLimits);
  }, []);

  useEffect(() => {
    if (selectedVariable && Object.keys(selectedVariable).length > 0) {
      const nodeId = selectedVariable?.variableData?.nodeId;
      const node = nodeVariables.find(
        (n) => n.key === nodeId || n.key === String(nodeId),
      );
      if (node) {
        setCurrent((prev) => ({
          ...prev,
          ...selectedVariable,
          subType: selectedVariable.subType || selectedVariable.value,
          value: selectedVariable.value || selectedVariable.subType,
          variableData: {
            ...selectedVariable?.variableData,
            nodeName:
              node?.description ||
              node?.name ||
              selectedVariable?.variableData?.nodeName,
          },
        }));
      } else {
        setCurrent((prev) => ({
          ...prev,
          ...selectedVariable,
          error: true,
          errorMessage: `Node ${selectedVariable?.variableData?.nodeName} not found. Please check incoming nodes.`,
        }));
      }
    } else {
      setCurrent({});
    }
  }, [nodeVariables, selectedVariable]);

  useEffect(() => {
    if (anchorRef.current && Object.keys(current).length > 0) {
      const containerWidth = anchorRef.current.offsetWidth;
      const limits = calculateCharacterLimits(containerWidth);
      setCharacterLimits(limits);
    }
  }, [current]);

  const hasSelection = current && Object.keys(current).length > 0;
  const selectedBlockId = hasSelection
    ? current.value || current.subType
    : null;

  return (
    <div className="flex gap-2 items-center w-full min-w-0">
      <div className="flex-1 min-w-0 w-full max-w-full">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <div
              ref={anchorRef}
              style={{ width: "100%" }}
              className={cn(
                "w-full min-w-0 flex items-center justify-between gap-2 px-3 py-2 border rounded-md bg-white cursor-pointer transition-colors h-9",
                open && "ring-2 ring-gray-800 border-gray-800",
                !hasSelection && "border-gray-200 hover:border-gray-300",
                current.error && "border-red-300 bg-red-50/30",
              )}
              data-testid="condition-variable"
            >
              {hasSelection ? (
                <span className="flex-1 min-w-0 truncate text-sm text-gray-900 leading-none">
                  {displayText}
                </span>
              ) : (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center justify-between w-full text-left">
                        <span className="text-sm text-gray-400">
                          Select variable
                        </span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      Select a variable to check its value against a condition
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              <div className="flex items-center flex-shrink-0 gap-1.5">
                {hasSelection && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="p-0.5 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600"
                    aria-label="Clear selection"
                    data-testid="condition-variable-clear"
                  >
                    <span className="text-xs font-bold leading-none">✕</span>
                  </button>
                )}
                <icons.chevronRight
                  className={cn(
                    "w-4 h-4 text-gray-400 transition-transform",
                    open ? "-rotate-90" : "rotate-90",
                  )}
                />
              </div>
            </div>
          </PopoverTrigger>
          <PopoverContent
            className="p-0 w-[var(--radix-popover-trigger-width)] min-w-[280px]"
            align="start"
            sideOffset={4}
          >
            <div className="p-3.5 bg-white rounded-md">
              <div className="relative mb-3.5 w-full">
                <icons.search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <Input
                  placeholder="Find fields"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8 w-full pl-8 text-sm border-gray-200"
                  autoFocus
                />
              </div>
              <div className="overflow-y-auto max-h-[16rem] min-h-[6rem]">
                {filteredNodes.length === 0 ? (
                  <div className="flex items-center justify-center h-24 px-4">
                    <p className="text-sm text-gray-500">
                      No incoming nodes found. Connect a node to see variables.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {filteredNodes.map((node, index) => (
                      <SchemaList
                        key={`${node.key}_${index}`}
                        node={node}
                        parentKey={node.key}
                        onClick={handleSelect}
                        selectedBlockId={selectedBlockId}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <InfoTooltip
        content={
          <span className="text-xs text-white">
            Select a variable to check its value against a condition
          </span>
        }
      />
    </div>
  );
};

export default VariableSelector;
