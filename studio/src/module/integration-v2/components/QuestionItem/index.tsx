import { forwardRef, useMemo } from "react";
import { Mode, ViewPort } from "@oute/oute-ds.core.constants";
import QuestionHeader from "../QuestionHeader";
import AnswerSection from "../answer-section";
import Description from "../Description";
import { canRefreshQuestion } from "../../utils/helpers";
import type { IAnswers, IAllNodes, ITheme, INode, IAnswerValue } from "../../types";

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
    },
    ref
  ) => {
    const question = node?.config;
    const isError = Boolean(error);
    const isRequired = question?.settings?.required;
    const canRefresh = canRefreshQuestion(question, allNodes);

    const containerStyle = useMemo(
      () => ({
        width: "100%",
      }),
      []
    );

    return (
      <div
        id={node?.id}
        className="flex flex-col gap-2 p-4 rounded-lg border border-border/50 bg-card"
      >
        <QuestionHeader
          id={`${id}-question-section`}
          allNodes={allNodes}
          isRequired={isRequired || false}
          theme={theme}
          style={containerStyle}
          onMapToggle={onMapToggle}
          onNodeRefresh={onNodeRefresh}
          isMapped={isMapped}
          node={node}
        />

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
          style={{ width: "100%" }}
          id={`${id}-answer-section`}
          onRefresh={
            onNodeRefresh ? () => onNodeRefresh(node?.id) : undefined
          }
          showRefreshButton={canRefresh}
        />

        {isError && (
          <div
            data-testid={`${id}-error`}
            className="text-sm text-destructive mt-1"
          >
            {error}
          </div>
        )}

        {question?.description && (
          <Description
            content={question.description}
            id={`${id}-description`}
          />
        )}
      </div>
    );
  }
);

QuestionItem.displayName = "QuestionItem";

export default QuestionItem;
