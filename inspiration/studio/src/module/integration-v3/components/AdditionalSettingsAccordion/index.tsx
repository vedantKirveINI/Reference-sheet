import { memo, lazy, Suspense, useRef, useCallback } from "react";
import { Settings, Clock, Loader2 } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { Editor } from "@src/module/editor";
import { Mode, ViewPort } from "@src/module/constants";
import AnswerSection from "../AnswerSection";
import { canRefreshQuestion } from "../../utils/helpers";
import type {
  IAnswers,
  IAllNodes,
  IConfigs,
  IPipelineItem,
  INode,
  ITheme,
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
  <div className="flex flex-col gap-1.5 py-3">
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
  answers: IAnswers;
  variables: Record<string, unknown>;
  onAnswerChange: (params: {
    node: INode;
    value: unknown;
    options?: unknown;
  }) => Promise<void>;
  onNodeRefresh?: (nodeId: string) => Promise<void>;
  theme?: ITheme;
  loading?: boolean;
  allNodes: IAllNodes;
}

const AdvancedQuestionItem = memo(
  ({
    node,
    answers,
    variables,
    onAnswerChange,
    onNodeRefresh,
    theme = {},
    loading = false,
    allNodes,
  }: AdvancedQuestionItemProps) => {
    const question = node?.config;
    const questionLabel = question?.question || "Field";
    const description = question?.description;
    const nodeId = node?.id;
    const answerValue = answers[nodeId];
    const canRefresh = canRefreshQuestion(question, allNodes);

    const handleChange = (value: unknown, options?: unknown) => {
      onAnswerChange({ node, value, options });
    };

    return (
      <SettingField
        icon={Settings}
        label={questionLabel}
        description={description}
        testId={`advanced-question-${nodeId}`}
      >
        <AnswerSection
          viewPort={ViewPort.MOBILE}
          isCreator={false}
          type={question?.type}
          question={question}
          theme={theme}
          value={answerValue}
          onChange={handleChange}
          error={answerValue?.error || ""}
          mode={Mode.CLASSIC}
          variables={variables}
          answers={answers}
          isMapActive={answerValue?.isMapped || false}
          id={`additional-settings-answer-${nodeId}`}
          onRefresh={
            onNodeRefresh ? () => onNodeRefresh(nodeId) : undefined
          }
          showRefreshButton={canRefresh}
          loading={loading}
        />
      </SettingField>
    );
  }
);

AdvancedQuestionItem.displayName = "AdvancedQuestionItem";

interface AdditionalSettingsAccordionProps {
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
  onNodeRefresh?: (nodeId: string) => Promise<void>;
  annotation: string;
  theme?: ITheme;
  loading?: boolean;
  className?: string;
}

const AdditionalSettingsAccordion = ({
  advancedFields,
  allNodes,
  answers,
  variables,
  configs,
  setConfig,
  onAnswerChange,
  onNodeRefresh,
  annotation,
  theme = {},
  loading = false,
  className,
}: AdditionalSettingsAccordionProps) => {
  const hasAdvancedFields = advancedFields.length > 0;
  const showAccordion = hasAdvancedFields || annotation === "ACTION";

  if (!showAccordion) {
    return null;
  }

  const handleScheduleChange = (content: unknown[]) => {
    setConfig("scheduleAt", content?.length ? { type: "fx", blocks: content } : undefined);
  };

  const totalSettingsCount = advancedFields.length + 1;

  const accordionItemRef = useRef<HTMLDivElement>(null);

  const handleAccordionValueChange = useCallback((value: string | undefined) => {
    if (value === "additional-settings") {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          accordionItemRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
          });
        });
      });
    }
  }, []);

  return (
    <div className={cn("mt-4 border-t border-border/40", className)}>
      <Accordion type="single" collapsible className="w-full" onValueChange={handleAccordionValueChange}>
        <AccordionItem ref={accordionItemRef} value="additional-settings" className="border-b-0">
          <AccordionTrigger className="py-3 hover:no-underline">
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">
                Additional Settings
              </span>
              <span className="text-xs text-muted-foreground/70">
                ({totalSettingsCount})
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-1 divide-y divide-border/30">
              {hasAdvancedFields &&
                advancedFields.map((item) => {
                  const node = allNodes[item?.qId];
                  if (!node) return null;
                  const nodeId = node.id;

                  return (
                    <AdvancedQuestionItem
                      key={nodeId}
                      node={node}
                      answers={answers}
                      variables={variables}
                      onAnswerChange={onAnswerChange}
                      onNodeRefresh={onNodeRefresh}
                      theme={theme}
                      loading={loading}
                      allNodes={allNodes}
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
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

AdditionalSettingsAccordion.displayName = "AdditionalSettingsAccordion";

export default memo(AdditionalSettingsAccordion);
