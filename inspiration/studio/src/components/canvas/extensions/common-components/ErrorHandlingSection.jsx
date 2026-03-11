import React, { useState, useCallback, useEffect } from "react";
import { ShieldAlert, ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ERROR_STRATEGIES,
  DEFAULT_ERROR_CONFIG,
  STRATEGY_LABELS,
  STRATEGY_DESCRIPTIONS,
} from "./error-handling-constants";

const FALLBACK_OPTIONS = [
  ERROR_STRATEGIES.STOP,
  ERROR_STRATEGIES.SKIP,
  ERROR_STRATEGIES.CUSTOM_ERROR_FLOW,
];

const ErrorHandlingSection = ({
  errorConfig = DEFAULT_ERROR_CONFIG,
  onChange,
  disabled = false,
  initialOpen = false,
}) => {
  const [isOpen, setIsOpen] = useState(initialOpen);

  useEffect(() => {
    if (initialOpen) {
      setIsOpen(true);
    }
  }, [initialOpen]);

  const config = { ...DEFAULT_ERROR_CONFIG, ...errorConfig };

  const handleChange = useCallback(
    (updates) => {
      if (onChange) {
        onChange({ ...config, ...updates });
      }
    },
    [config, onChange]
  );

  const handleStrategyChange = useCallback(
    (value) => {
      const updates = { strategy: value };
      if (value !== ERROR_STRATEGIES.RETRY) {
        updates.retryCount = DEFAULT_ERROR_CONFIG.retryCount;
        updates.retryDelay = DEFAULT_ERROR_CONFIG.retryDelay;
        updates.retryFallback = DEFAULT_ERROR_CONFIG.retryFallback;
      }
      handleChange(updates);
    },
    [handleChange]
  );

  const handleRetryCountChange = useCallback(
    (e) => {
      const val = Math.min(10, Math.max(1, parseInt(e.target.value, 10) || 1));
      handleChange({ retryCount: val });
    },
    [handleChange]
  );

  const handleRetryDelayChange = useCallback(
    (e) => {
      const val = Math.min(300, Math.max(0, parseInt(e.target.value, 10) || 0));
      handleChange({ retryDelay: val });
    },
    [handleChange]
  );

  const handleRetryFallbackChange = useCallback(
    (value) => {
      handleChange({ retryFallback: value });
    },
    [handleChange]
  );

  return (
    <div className="border-t border-border/60">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger
          className={cn(
            "flex items-center gap-2.5 w-full px-5 py-3.5 text-left transition-colors",
            "hover:bg-muted/50",
            disabled && "opacity-50 pointer-events-none"
          )}
        >
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-muted/80 border border-border/40">
            <ShieldAlert className="w-3.5 h-3.5 text-muted-foreground" />
          </div>
          <span className="text-sm font-medium text-foreground flex-1">
            Error Handling
          </span>
          {isOpen ? (
            <ChevronDown className="w-4 h-4 text-muted-foreground transition-transform" />
          ) : (
            <ChevronRight className="w-4 h-4 text-muted-foreground transition-transform" />
          )}
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-5 pb-5 space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">
                When this node fails...
              </Label>
              <Select
                value={config.strategy}
                onValueChange={handleStrategyChange}
                disabled={disabled}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(ERROR_STRATEGIES).map((strategy) => (
                    <SelectItem key={strategy} value={strategy}>
                      {STRATEGY_LABELS[strategy]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground/80 leading-relaxed">
                {STRATEGY_DESCRIPTIONS[config.strategy]}
              </p>
            </div>

            {config.strategy === ERROR_STRATEGIES.RETRY && (
              <div className="space-y-4 pl-3 border-l-2 border-border/50">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">
                    Number of retries
                  </Label>
                  <Input
                    type="number"
                    min={1}
                    max={10}
                    value={config.retryCount}
                    onChange={handleRetryCountChange}
                    disabled={disabled}
                    className="h-9 text-sm w-32"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">
                    Delay between retries (seconds)
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    max={300}
                    value={config.retryDelay}
                    onChange={handleRetryDelayChange}
                    disabled={disabled}
                    className="h-9 text-sm w-32"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">
                    After all retries fail...
                  </Label>
                  <Select
                    value={config.retryFallback}
                    onValueChange={handleRetryFallbackChange}
                    disabled={disabled}
                  >
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FALLBACK_OPTIONS.map((strategy) => (
                        <SelectItem key={strategy} value={strategy}>
                          {STRATEGY_LABELS[strategy]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground/80 leading-relaxed">
                    {STRATEGY_DESCRIPTIONS[config.retryFallback]}
                  </p>
                </div>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default ErrorHandlingSection;
