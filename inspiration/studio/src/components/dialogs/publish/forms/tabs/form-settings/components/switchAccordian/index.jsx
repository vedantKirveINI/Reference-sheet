import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const FormSwitch = ({
  id,
  label,
  description,
  isChecked,
  onChange,
  children,
  dataTestId,
  className,
  icon: Icon,
  tooltip,
}) => {
  return (
    <div
      className={cn("flex flex-col w-full py-4 relative gap-4", className)}
      data-testid={dataTestId ? `${dataTestId}-container` : ""}
    >
      <div className="flex gap-3 items-center w-full">
        <div
          className="flex flex-col gap-1 cursor-pointer focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 focus-visible:rounded flex-1 min-w-0"
          onClick={() => onChange({ target: { checked: !isChecked } })}
        >
          <div className="flex items-center gap-2 w-full">
            {Icon && (
              <div className="flex items-center justify-center w-5 h-5 rounded-md bg-muted shrink-0">
                <Icon className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
            )}
            <div className="flex items-center gap-1.5 flex-1 min-w-0">
              <Label
                htmlFor={id}
                className="font-medium cursor-pointer text-foreground break-words"
                data-testid={dataTestId ? `${dataTestId}-label` : ""}
              >
                {label}
              </Label>
              {tooltip && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        className="cursor-help shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <svg
                          className="w-3.5 h-3.5 text-muted-foreground"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-[250px]">
                      <p className="text-xs">{tooltip}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>
          {description && (
            <p
              className="text-sm text-muted-foreground break-words"
              data-testid={dataTestId ? `${dataTestId}-description` : ""}
            >
              {description}
            </p>
          )}
        </div>
        <Switch
          id={id}
          checked={isChecked}
          onCheckedChange={(checked) => onChange({ target: { checked } })}
          data-testid={dataTestId ? `${dataTestId}-switch` : ""}
          className="shrink-0"
        />
      </div>

      {isChecked && children && (
        <div data-testid={dataTestId ? `${dataTestId}-content` : ""}>
          {children}
        </div>
      )}
    </div>
  );
};

export default FormSwitch;
