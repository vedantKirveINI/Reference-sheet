import { memo, useMemo } from "react";
import { isControlFlowNode, getQuestionDependencyState } from "../../utils/helpers";
import QuestionItem from "../QuestionItem";
import IntegrationLoader from "../IntegrationLoader";
import { cn } from "@/lib/utils";
import type {
  IAnswers,
  IAllNodes,
  IPipelineItem,
  ITheme,
  INode,
} from "../../types";

interface QuestionListProps {
  pipeline: IPipelineItem[];
  allNodes: IAllNodes;
  onNodeRefresh: (nodeId: string) => Promise<void>;
  onMapToggle: (params: { node: INode; value: boolean }) => void;
  answers: IAnswers;
  onAnswerChange: (params: {
    node: INode;
    value: unknown;
    options?: unknown;
  }) => Promise<void>;
  variables: Record<string, unknown>;
  theme: ITheme;
  loading: boolean;
  setQuestionRef: (nodeId: string, ref: unknown) => void;
}

const MemorizedLoader = memo(IntegrationLoader);

const QuestionList = ({
  pipeline,
  allNodes,
  onNodeRefresh,
  onMapToggle,
  answers,
  onAnswerChange,
  variables,
  theme,
  loading,
  setQuestionRef,
}: QuestionListProps) => {
  const handleChange = async (
    value: unknown,
    options: unknown = {},
    nodeId: string
  ) => {
    await onAnswerChange({
      node: allNodes[nodeId],
      value,
      options,
    });
  };

  const renderQuestions = (items: IPipelineItem[], idPrefix: string) => {
    const validItems = items?.filter?.(
      (item) => !isControlFlowNode(allNodes[item?.qId]) && allNodes[item?.qId]
    );

    return validItems?.map?.((item, index) => {
      const node = allNodes[item?.qId];
      const nodeId = node?.id;
      const isLast = index === validItems.length - 1;
      const depState = getQuestionDependencyState(node, allNodes, answers);

      return (
        <div
          key={nodeId}
          className={cn(!isLast && "border-b border-border/30")}
        >
          <QuestionItem
            ref={(ref) => setQuestionRef(nodeId, ref)}
            allNodes={allNodes}
            error={answers[nodeId]?.error || ""}
            node={node}
            id={`${idPrefix}-${index}`}
            answers={answers}
            variables={variables}
            onChange={async (value: unknown, options = {}) => {
              await handleChange(value, options, nodeId);
            }}
            isMapped={answers[nodeId]?.isMapped || false}
            onMapToggle={onMapToggle}
            onNodeRefresh={onNodeRefresh}
            theme={theme}
            value={answers[nodeId]}
            loading={loading}
            isDisabled={depState.isDisabled}
            disabledReason={depState.disabledReason}
          />
        </div>
      );
    });
  };

  const filteredPipeline = useMemo(
    () =>
      pipeline?.filter(
        (item) =>
          !isControlFlowNode(allNodes[item?.qId]) &&
          !allNodes[item?.qId]?.config?.settings?.isAdvancedField
      ),
    [pipeline, allNodes]
  );

  return (
    <div className="flex flex-col">
      {renderQuestions(filteredPipeline, "integration-question")}

      {loading && (
        <MemorizedLoader message="Processing..." className="py-4" />
      )}
    </div>
  );
};

export default memo(QuestionList);
