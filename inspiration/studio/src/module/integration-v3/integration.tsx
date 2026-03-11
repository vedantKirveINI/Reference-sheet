import { memo, useEffect, useRef } from "react";
import QuestionList from "./components/QuestionList";
import AdditionalSettingsAccordion from "./components/AdditionalSettingsAccordion";
import { useIntegrationRunner } from "./hooks/useIntegrationRunner";
import IntegrationLoader from "./components/IntegrationLoader";
import type {
  IConfigs,
  INodeTheme,
  ITheme,
  IAnswers,
  IPipelineItem,
  IAllNodes,
  INode,
} from "./types";

const MemorizedLoader = memo(IntegrationLoader);

export interface IIntegrationProps {
  theme: ITheme;
  initialAnswers: IAnswers;
  initialPipeline: IPipelineItem[];
  allNodes: IAllNodes;
  annotation: string;
  onSuccess: (stagedAnswers: IAnswers, stagedPipeline: IPipelineItem[], configs: IConfigs) => void;
  variables: Record<string, unknown>;
  workspaceId: string;
  projectId: string;
  assetId: string;
  canvasId: string;
  _id: string;
  configs?: IConfigs;
  nodeTheme?: INodeTheme;
  onAnswerUpdate?: (updatedAnswers: IAnswers) => void;
  onStateChange?: (state: {
    advancedFields: IPipelineItem[];
    allNodes: IAllNodes;
    answers: IAnswers;
    variables: Record<string, unknown>;
    configs: IConfigs;
    annotation: string;
    onContinue: () => void;
    setConfig: (key: string, value: unknown) => void;
    onAnswerChange: (params: { node: INode; value: unknown; options?: unknown }) => Promise<void>;
  }) => void;
}

const Integration = ({
  theme,
  initialAnswers,
  initialPipeline,
  allNodes,
  annotation,
  onSuccess,
  variables,
  workspaceId,
  projectId,
  assetId,
  canvasId,
  _id,
  configs: initialConfigs = {},
  onAnswerUpdate,
  onStateChange,
}: IIntegrationProps) => {
  

  const {
    answers,
    pipeline,
    loading,
    advancedFields,
    initialLoading,
    showAdvancedSettings,
    onContinue,
    onAnswerChange,
    onMapToggle,
    onNodeRefresh,
    setShowAdvancedSettings,
    setConfig,
    configs,
    setQuestionRef,
  } = useIntegrationRunner({
    initialAnswers,
    initialPipeline,
    allNodes,
    variables,
    onSuccess,
    _id,
    assetId,
    canvasId,
    projectId,
    workspaceId,
    initialConfigs,
    onAnswerUpdate,
  });

  const onStateChangeRef = useRef(onStateChange);
  onStateChangeRef.current = onStateChange;

  useEffect(() => {
    const notify = onStateChangeRef.current;
    if (notify) {
      notify({
        advancedFields,
        allNodes,
        answers,
        variables,
        configs,
        annotation,
        onContinue,
        setConfig,
        onAnswerChange: onAnswerChange as (params: { node: INode; value: unknown; options?: unknown }) => Promise<void>,
      });
    }
  }, [
    advancedFields,
    answers,
    pipeline,
  ]);

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[200px]">
        <MemorizedLoader message="Loading integration..." height="3rem" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 flex-1">
      <QuestionList
        pipeline={pipeline}
        allNodes={allNodes}
        onNodeRefresh={onNodeRefresh}
        onMapToggle={onMapToggle as (params: { node: INode; value: boolean }) => void}
        answers={answers}
        onAnswerChange={onAnswerChange as (params: { node: INode; value: unknown; options?: unknown }) => Promise<void>}
        variables={variables}
        theme={theme}
        loading={loading}
        setQuestionRef={setQuestionRef}
      />
      <AdditionalSettingsAccordion
        advancedFields={advancedFields}
        allNodes={allNodes}
        answers={answers}
        variables={variables}
        configs={configs}
        setConfig={setConfig}
        onAnswerChange={onAnswerChange as (params: { node: INode; value: unknown; options?: unknown }) => Promise<void>}
        onNodeRefresh={onNodeRefresh}
        annotation={annotation}
        theme={theme}
        loading={loading}
      />
    </div>
  );
};

Integration.displayName = "IntegrationV3";

export { Integration };
