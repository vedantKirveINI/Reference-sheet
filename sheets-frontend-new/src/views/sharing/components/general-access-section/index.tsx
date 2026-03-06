import { useState } from "react";
import { Check, ChevronDown, ChevronRight, Globe, Lock } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const GENERAL_ACCESS_OPTIONS = [
  {
    value: false,
    label: "Restricted",
    description: "Only people with access can open",
    icon: Lock,
  },
  {
    value: true,
    label: "Anyone with the link",
    description: "Anyone on the internet with the link can view",
    icon: Globe,
  },
] as const;

interface GeneralAccessSectionProps {
  enabled: boolean;
  hasChanges: boolean;
  onToggle: (val: boolean) => void;
}

export function GeneralAccessSection({
  enabled,
  hasChanges,
  onToggle,
}: GeneralAccessSectionProps) {
  const [expanded, setExpanded] = useState(false);
  const isExpanded = expanded || hasChanges;

  return (
    <div>
      <button
        onClick={() => !hasChanges && setExpanded(!expanded)}
        className={`flex w-full items-center justify-between px-5 py-3 text-left transition-colors ${
          hasChanges ? "cursor-default" : "hover:bg-muted/30"
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div
            className={`transition-transform duration-200 ${
              isExpanded ? "rotate-90" : ""
            }`}
          >
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
          {enabled ? (
            <Globe className="h-4 w-4 text-emerald-500" />
          ) : (
            <Lock className="h-4 w-4 text-muted-foreground" />
          )}
          <span className="text-sm font-medium text-foreground">
            General access
          </span>
        </div>

        {!isExpanded && (
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${
              enabled
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {enabled ? (
              <>
                <Globe className="h-3 w-3" />
                Anyone with link
              </>
            ) : (
              <>
                <Lock className="h-3 w-3" />
                Restricted
              </>
            )}
          </span>
        )}
      </button>

      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isExpanded ? "max-h-75 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-4 pb-3">
          <div className="flex items-center gap-3 rounded-xl bg-muted/30 p-3 min-w-0">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
                enabled
                  ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                  : "bg-muted/60 text-muted-foreground"
              }`}
            >
              {enabled ? (
                <Globe className="h-5 w-5" />
              ) : (
                <Lock className="h-5 w-5" />
              )}
            </div>

            <div className="flex-1 min-w-0 overflow-hidden">
              <div className="text-sm font-medium text-foreground truncate">
                {enabled ? "Anyone with the link" : "Restricted"}
              </div>
              <div className="text-xs text-muted-foreground leading-relaxed truncate">
                {enabled
                  ? "Anyone on the internet with the link can view"
                  : "Only people with access can open"}
              </div>
            </div>

            <div className="relative shrink-0 flex items-center gap-1.5">
              {hasChanges && (
                <span className="inline-flex h-1.5 w-1.5 rounded-full bg-amber-400" />
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-all hover:text-foreground hover:bg-muted"
                  >
                    {enabled ? "Anyone" : "Restricted"}
                    <ChevronDown className="h-3 w-3" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-65 p-1">
                  {GENERAL_ACCESS_OPTIONS.map((opt) => {
                    const Icon = opt.icon;
                    const isSelected = enabled === opt.value;
                    return (
                      <DropdownMenuItem
                        key={String(opt.value)}
                        onSelect={() => {
                          onToggle(opt.value);
                        }}
                        className={`flex items-start gap-3 rounded-lg px-3 py-2.5 text-left ${
                          isSelected
                            ? "bg-primary text-primary-foreground hover:bg-primary/90"
                            : "text-foreground"
                        }`}
                      >
                        <Icon className="h-4 w-4 shrink-0 mt-0.5" />
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium">
                            {opt.label}
                          </div>
                          <div
                            className={`text-xs mt-0.5 ${
                              isSelected
                                ? "text-primary-foreground/80"
                                : "text-muted-foreground"
                            }`}
                          >
                            {opt.description}
                          </div>
                        </div>
                        {isSelected && (
                          <Check className="h-4 w-4 shrink-0" />
                        )}
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

