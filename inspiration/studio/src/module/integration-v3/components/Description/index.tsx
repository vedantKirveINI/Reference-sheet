import { memo, useState } from "react";
import { Editor } from "@src/module/editor";
import { ChevronDown, ChevronRight, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface DescriptionProps {
  content: string;
  id: string;
}

const Description = ({ content, id }: DescriptionProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const contentTheme = {
    fontSize: "0.8125rem",
    color: "#64748b",
    fontFamily: "Inter",
  };

  const contentStyle = {
    fontSize: "13px",
    lineHeight: 1.5,
  };

  if (!content) return null;

  return (
    <div className="mt-3 pt-3 border-t border-border/30">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "h-7 px-2 gap-1.5 text-xs font-medium",
          "text-muted-foreground hover:text-foreground",
          "transition-colors duration-150"
        )}
        data-testid={`${id}-toggle`}
      >
        <HelpCircle className="h-3.5 w-3.5" />
        <span>Help & Tips</span>
        {isExpanded ? (
          <ChevronDown className="h-3 w-3 ml-0.5" />
        ) : (
          <ChevronRight className="h-3 w-3 ml-0.5" />
        )}
      </Button>

      <div
        className={cn(
          "overflow-hidden transition-all duration-200 ease-out",
          isExpanded ? "max-h-96 opacity-100 mt-2" : "max-h-0 opacity-0"
        )}
      >
        <div
          className={cn(
            "pl-3 pr-2 py-2 rounded-lg",
            "bg-muted/40 border-l-2 border-primary/30"
          )}
        >
          <Editor
            testId={`${id}-text`}
            editable={false}
            value={content}
            style={contentStyle}
            theme={contentTheme}
          />
        </div>
      </div>
    </div>
  );
};

const MemorizedDescription = memo(Description);

export default MemorizedDescription;
