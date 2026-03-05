import { memo, lazy, Suspense } from "react";
import { Settings, Clock, Loader2 } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Editor } from "@src/module/editor";
import type {
  IAnswers,
  IAllNodes,
  IConfigs,
  IPipelineItem,
  ITheme,
  INode,
} from "../../types";

const FormulaBar = lazy(() =>
  import("@src/components/formula-fx/src").then((module) => ({
    default: module.FormulaBar,
  }))
);

const LABEL_THEME = {
  fontSize: "14px",
  color: "#18181b",
  fontFamily: "Inter",
};

const DESCRIPTION_THEME = {
  fontSize: "12px",
  color: "#71717a",
  fontFamily: "Inter",
};

const LABEL_STYLE = { fontSize: "14px", fontWeight: 500, lineHeight: 1.4 };
const DESCRIPTION_STYLE = { fontSize: "12px", lineHeight: 1.4 };

interface SettingFieldProps {
  icon: React.ElementType;
  label: string;
  description?: string;
  children: React.ReactNode;
  testId?: string;
}

const SettingField = ({
  icon: Icon,
  label,
  description,
  children,
  testId = "setting-field",
}: SettingFieldProps) => (
  <div className="flex flex-col gap-1.5 py-2.5">
    <div className="flex items-center gap-2">
      <Icon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
      <div className="min-w-0 flex-1">
        <Editor
          editable={false}
          value={label || ""}
          theme={LABEL_THEME}
          style={LABEL_STYLE}
          enableFXPicker={false}
          testId={`${testId}-label`}
        />
      </div>
    </div>
    {description && (
      <div className="pl-5.5 ml-0.5 text-muted-foreground">
        <Editor
          editable={false}
          value={description}
          theme={DESCRIPTION_THEME}
          style={DESCRIPTION_STYLE}
          enableFXPicker={false}
          testId={`${testId}-description`}
        />
      </div>
    )}
    <div className="mt-1">{children}</div>
  </div>
);

interface AdvancedQuestionItemProps {
  node: INode;
  value: unknown;
  onChange: (value: unknown) => Promise<void>;
  variables: Record<string, unknown>;
}

const AdvancedQuestionItem = memo(
  ({ node, value, onChange, variables }: AdvancedQuestionItemProps) => {
    const question = node?.config;
    const questionLabel = question?.question || "Field";
    const description = question?.description;

    const handleChange = async (content: unknown[]) => {
      await onChange({ type: "fx", blocks: content });
    };

    return (
      <SettingField
        icon={Settings}
        label={questionLabel}
        description={description}
        testId={`advanced-question-${node?.id}`}
      >
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-3 border rounded-md bg-muted/20">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          }
        >
          <FormulaBar
            isReadOnly={false}
            type="any"
            hideInputBorders={false}
            defaultInputContent={(value as { blocks?: unknown[] })?.blocks || []}
            onInputContentChanged={handleChange}
            variables={variables}
            wrapContent
            slotProps={{
              container: {
                style: {
                  background: "#FFF",
                  border: "1px solid rgba(0, 0, 0, 0.12)",
                  borderRadius: "0.375rem",
                  minHeight: "2.25rem",
                  overflow: "auto",
                },
              },
            }}
          />
        </Suspense>
      </SettingField>
    );
  }
);

AdvancedQuestionItem.displayName = "AdvancedQuestionItem";

interface IntegrationSettingsPopoverProps {
  advancedFields: IPipelineItem[];
  allNodes: IAllNodes;
  answers: IAnswers;
  variables: Record<string, unknown>;
  configs: IConfigs;
  setConfig: (key: string, value: unknown) => void;
  onAnswerChange: (params: {
    node: INode;
    value: unknown;
    options?: unknown;
  }) => Promise<void>;
  theme?: ITheme;
  triggerClassName?: string;
  align?: "start" | "center" | "end";
  side?: "top" | "bottom" | "left" | "right";
}

const IntegrationSettingsPopover = ({
  advancedFields,
  allNodes,
  answers,
  variables,
  configs,
  setConfig,
  onAnswerChange,
  triggerClassName,
  align = "end",
  side = "top",
}: IntegrationSettingsPopoverProps) => {
  const hasAdvancedFields = advancedFields.length > 0;

  const handleScheduleChange = (content: unknown[]) => {
    setConfig("scheduleAt", content?.length ? { type: "fx", blocks: content } : undefined);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "rounded-lg text-muted-foreground hover:text-foreground",
            "hover:bg-black/5 transition-colors p-1.5",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            triggerClassName
          )}
          aria-label="Integration settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align={align}
        side={side}
        sideOffset={8}
        className={cn(
          "p-0",
          "w-[clamp(16rem,80vw,24rem)]",
          "max-h-[70vh] overflow-y-auto"
        )}
      >
        <div className="px-3 py-2.5 border-b border-border/50 sticky top-0 bg-popover z-10">
          <h4 className="text-sm font-semibold text-foreground">Settings</h4>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure advanced options
          </p>
        </div>

        <div className="px-3 py-1 divide-y divide-border/30">
          {hasAdvancedFields &&
            advancedFields.map((item) => {
              const node = allNodes[item?.qId];
              if (!node) return null;
              const nodeId = node.id;
              const answer = answers[nodeId];

              return (
                <AdvancedQuestionItem
                  key={nodeId}
                  node={node}
                  value={answer?.response}
                  onChange={async (value) => {
                    await onAnswerChange({ node, value });
                  }}
                  variables={variables}
                />
              );
            })}

          <SettingField
            icon={Clock}
            label="Schedule At"
            description="Enter time in UTC format"
            testId="schedule-at"
          >
            <Suspense
              fallback={
                <div className="flex items-center justify-center py-3 border rounded-md bg-muted/20">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              }
            >
              <FormulaBar
                isReadOnly={false}
                type="any"
                hideInputBorders={false}
                defaultInputContent={
                  (configs?.scheduleAt as { blocks?: unknown[] })?.blocks || []
                }
                onInputContentChanged={handleScheduleChange}
                variables={variables}
                wrapContent
                slotProps={{
                  container: {
                    style: {
                      background: "#FFF",
                      border: "1px solid rgba(0, 0, 0, 0.12)",
                      borderRadius: "0.375rem",
                      minHeight: "2.25rem",
                      overflow: "auto",
                    },
                  },
                }}
              />
            </Suspense>
          </SettingField>
        </div>
      </PopoverContent>
    </Popover>
  );
};

IntegrationSettingsPopover.displayName = "IntegrationSettingsPopover";

export default memo(IntegrationSettingsPopover);
