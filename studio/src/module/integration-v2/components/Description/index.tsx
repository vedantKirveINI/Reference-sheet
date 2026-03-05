import { memo, useState } from "react";
import { Editor } from "@src/module/editor";
import { ChevronDown, ChevronRight, Lightbulb } from "lucide-react";

interface DescriptionProps {
  content: string;
  id: string;
}

const Description = ({ content, id }: DescriptionProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const contentTheme = {
    fontSize: "0.75rem",
    color: "#64748b",
    fontFamily: "Inter",
  };

  const contentStyle = {
    fontSize: "12px",
    lineHeight: 1.4,
  };

  if (!content) return null;

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        data-testid={`${id}-toggle`}
      >
        <Lightbulb className="h-3.5 w-3.5" />
        <span className="font-medium">Help</span>
        {isExpanded ? (
          <ChevronDown className="h-3 w-3" />
        ) : (
          <ChevronRight className="h-3 w-3" />
        )}
      </button>
      
      {isExpanded && (
        <div className="mt-1.5 pl-5 text-xs text-muted-foreground">
          <Editor
            testId={`${id}-text`}
            editable={false}
            value={content}
            style={contentStyle}
            theme={contentTheme}
          />
        </div>
      )}
    </div>
  );
};

const MemorizedDescription = memo(Description);

export default MemorizedDescription;
