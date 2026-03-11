import { memo } from "react";
import { isControlFlowNode } from "../../utils/helpers";
import QuestionItem from "../QuestionItem";
import IntegrationLoader from "../IntegrationLoader";
import { QuestionType } from "@oute/oute-ds.core.constants";
import type {
  IAnswers,
  IAllNodes,
  IConfigs,
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
  advancedFields: IPipelineItem[];
  showAdvancedSettings: boolean;
  configs: IConfigs;
  setConfig: (key: string, value: unknown) => void;
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
  advancedFields,
  showAdvancedSettings,
  configs,
  setConfig,
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

  const renderQuestions = (
    items: IPipelineItem[],
    idPrefix: string
  ) => {
    return items?.map?.((item, index) => {
      const node = allNodes[item?.qId];
      const nodeId = node?.id;

      if (isControlFlowNode(node) || !node) {
        return null;
      }

      return (
        <QuestionItem
          ref={(ref) => setQuestionRef(nodeId, ref)}
          key={nodeId}
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
        />
      );
    });
  };

  const filteredPipeline = pipeline?.filter(
    (item) =>
      !isControlFlowNode(allNodes[item?.qId]) &&
      !allNodes[item?.qId]?.config?.settings?.isAdvancedField
  );

  return (
    <div className="flex flex-col gap-4">
      {renderQuestions(filteredPipeline, "integration-question")}

      {loading && <MemorizedLoader message="Processing..." />}

      {showAdvancedSettings && (
        <>
          {renderQuestions(advancedFields, "integration-advanced-question")}

          <QuestionItem
            key="schedule_at"
            node={{
              id: "schedule_at",
              type: "QUESTION",
              config: {
                question: "Schedule At",
                description: "Please enter time in UTC format",
                type: QuestionType.FORMULA_BAR,
              },
            }}
            id="integration-question-schedule-at"
            answers={answers}
            variables={variables}
            onChange={async (value: unknown) => {
              const scheduleValue = value as { blocks?: unknown[] };
              setConfig(
                "scheduleAt",
                scheduleValue?.blocks?.length ? scheduleValue : undefined
              );
            }}
            theme={theme}
            value={{ response: configs?.scheduleAt }}
            allNodes={allNodes}
          />
        </>
      )}
    </div>
  );
};

export default memo(QuestionList);
