import { forwardRef } from "react";
import { Mode, ViewPort } from "@oute/oute-ds.core.constants";
import QuestionHeader from "../QuestionHeader";
import AnswerSection from "../AnswerSection";
import { cn } from "@/lib/utils";
import { canRefreshQuestion } from "../../utils/helpers";
import { Lock } from "lucide-react";
import type {
  IAnswers,
  IAllNodes,
  ITheme,
  INode,
  IAnswerValue,
} from "../../types";

interface QuestionItemProps {
  error?: string;
  node: INode;
  answers?: IAnswers;
  variables?: Record<string, unknown>;
  onChange: (value: unknown, options?: unknown) => Promise<void>;
  isMapped?: boolean;
  onMapToggle?: (params: { node: INode; value: boolean }) => void;
  onNodeRefresh?: (nodeId: string) => Promise<void>;
  theme?: ITheme;
  value?: IAnswerValue;
  id: string;
  allNodes?: IAllNodes;
  loading?: boolean;
  isDisabled?: boolean;
  disabledReason?: string;
}

const QuestionItem = forwardRef<unknown, QuestionItemProps>(
  (
    {
      error = "",
      node,
      answers = {},
      variables = {},
      onChange,
      isMapped = false,
      onMapToggle,
      onNodeRefresh,
      theme = {},
      value,
      id,
      allNodes = {},
      loading = false,
      isDisabled = false,
      disabledReason = "",
    },
    ref
  ) => {
    const question = node?.config;
    const isError = Boolean(error);
    const isRequired = question?.settings?.required;
    const canRefresh = canRefreshQuestion(question, allNodes);
    const description = question?.description;

    return (
      <div
        id={node?.id}
        className={cn(
          "flex flex-col py-2.5 transition-colors duration-150",
          isDisabled && "opacity-60"
        )}
      >
        <QuestionHeader
          id={`${id}-question-section`}
          allNodes={allNodes}
          isRequired={isRequired || false}
          theme={theme}
          onMapToggle={onMapToggle}
          onNodeRefresh={onNodeRefresh}
          isMapped={isMapped}
          node={node}
          description={description}
        />

        <div className="mt-1.5">
          {isDisabled ? (
            <div
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-md",
                "bg-muted/40 border border-border/20",
                "text-sm text-muted-foreground"
              )}
            >
              <Lock className="h-3.5 w-3.5 shrink-0" />
              <span>
                {disabledReason || "Waiting for previous field to be configured"}
              </span>
            </div>
          ) : (
            <AnswerSection
              ref={ref}
              viewPort={ViewPort.MOBILE}
              isCreator={false}
              type={question?.type}
              question={question}
              theme={theme}
              value={value}
              onChange={onChange}
              error={error}
              mode={Mode.CLASSIC}
              variables={variables}
              answers={answers}
              isMapActive={isMapped}
              id={`${id}-answer-section`}
              onRefresh={onNodeRefresh ? () => onNodeRefresh(node?.id) : undefined}
              showRefreshButton={canRefresh}
              loading={loading}
            />
          )}
        </div>

        {isError && !isDisabled && (
          <div
            data-testid={`${id}-error`}
            className={cn(
              "mt-2 text-sm text-destructive flex items-center gap-1.5"
            )}
          >
            <span className="shrink-0">!</span>
            <span>{error}</span>
          </div>
        )}
      </div>
    );
  }
);

QuestionItem.displayName = "QuestionItem";

export default QuestionItem;
