import { memo, useCallback, useMemo } from "react";
import { Editor } from "@src/module/editor";
import { QuestionType } from "@src/module/constants";
import { canRefreshQuestion } from "../../utils/helpers";
import { Refresh } from "../Refresh";
import { MapSwitch } from "../MapSwitch";
import { MAPPABLE_QUESTIONS } from "../../utils/constants";
import type { IAllNodes, ITheme, INode } from "../../types";
import { cn } from "@/lib/utils";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface QuestionHeaderProps {
  theme?: ITheme;
  style?: React.CSSProperties;
  isRequired?: boolean;
  id: string;
  onMapToggle?: (params: { node: INode; value: boolean }) => void;
  onNodeRefresh?: (nodeId: string) => Promise<void>;
  isMapped: boolean;
  node: INode;
  allNodes?: IAllNodes;
  description?: string;
}

const QuestionHeader = ({
  theme = {},
  style = {},
  isRequired = false,
  id,
  onMapToggle,
  onNodeRefresh,
  isMapped,
  node,
  allNodes = {},
  description,
}: QuestionHeaderProps) => {
  const question = node?.config;

  const questionTheme = useMemo(
    () => ({
      fontSize: "13px",
      color: theme?.styles?.questions || "#71717a",
      fontFamily: "Inter",
    }),
    [theme?.styles?.questions]
  );

  const handleNodeRefresh = useCallback(async () => {
    if (onNodeRefresh) {
      await onNodeRefresh(node?.id);
    }
  }, [node?.id, onNodeRefresh]);

  const handleMapToggle = useCallback(
    (checked: boolean) => {
      if (onMapToggle) {
        onMapToggle({
          node,
          value: checked,
        });
      }
    },
    [node, onMapToggle]
  );

  const questionStyle = useMemo(
    () => ({
      fontSize: "13px",
      fontWeight: 500,
      lineHeight: 1.4,
    }),
    []
  );

  const showRefreshButton = canRefreshQuestion(question, allNodes);
  const showMapSwitch =
    MAPPABLE_QUESTIONS.includes(question?.type || "") &&
    question?.settings?.enableMap;

  return (
    <div
      className={cn("flex items-center justify-between gap-2", "min-h-[24px]")}
      style={style}
      data-testid={`question-header-${id}`}
    >
      <div className="flex items-center gap-1.5 min-w-0">
        <Editor
          editable={false}
          value={question?.question || ""}
          theme={questionTheme}
          style={questionStyle}
          enableFXPicker={false}
          testId={`${id}-title`}
        />
        {isRequired && (
          <span className="text-destructive text-xs font-medium shrink-0">
            *
          </span>
        )}
        {description && (
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    "inline-flex items-center justify-center",
                    "w-4 h-4 rounded-full shrink-0",
                    "text-muted-foreground/60 hover:text-muted-foreground",
                    "transition-colors duration-150",
                    "focus:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  )}
                  data-testid={`${id}-info-trigger`}
                >
                  <Info className="h-3.5 w-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                align="start"
                className={cn(
                  "max-w-xs text-xs",
                  "bg-white text-foreground",
                  "border border-border/50 shadow-md",
                  "rounded-md px-3 py-2"
                )}
                sideOffset={4}
              >
                <div
                  dangerouslySetInnerHTML={{ __html: description }}
                  className="prose prose-xs prose-neutral"
                />
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        {showRefreshButton && onNodeRefresh && (
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Refresh onClick={handleNodeRefresh} />
                </span>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                align="center"
                className="max-w-xs text-xs bg-white text-foreground border border-border shadow-md"
                sideOffset={4}
              >
                {question?.type === QuestionType.DROP_DOWN
                  ? "Re-fetch options from source"
                  : "Refresh options"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {showMapSwitch && (
          <MapSwitch
            nodeId={node?.id}
            checked={isMapped}
            onChange={handleMapToggle}
          />
        )}
      </div>
    </div>
  );
};

QuestionHeader.displayName = "QuestionHeader";

export default memo(QuestionHeader);
