import cloneDeep from "lodash/cloneDeep";
import isEmpty from "lodash/isEmpty";
import isEqual from "lodash/isEqual";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  checkFurtherNodeDependency,
  getInitialPipeline,
  isControlFlowNode,
  isQuestionNode,
  scrollToNode,
  shouldBreak,
} from "../utils/helpers";
import {
  determineNodeExecutionType,
  executeControlFlowNode,
  executeTransformedNode,
} from "../utils/executeNode";
import { questionsValidation } from "../validation/questions-validation";
import { QuestionType } from "@oute/oute-ds.core.constants";
import type {
  IAnswers,
  IAllNodes,
  IConfigs,
  INode,
  IPipelineItem,
  IIntegrationState,
  IIntegrationActions,
} from "../types";

interface UseIntegrationRunnerParams {
  initialAnswers: IAnswers;
  initialPipeline: IPipelineItem[];
  allNodes: IAllNodes;
  variables: Record<string, unknown>;
  onSuccess: (answers: IAnswers, pipeline: IPipelineItem[], configs: IConfigs) => void;
  _id: string;
  assetId: string;
  canvasId: string;
  projectId: string;
  workspaceId: string;
  initialConfigs: IConfigs;
  onAnswerUpdate?: (answers: IAnswers) => void;
}

export const useIntegrationRunner = ({
  initialAnswers = {},
  initialPipeline = [],
  allNodes,
  variables,
  onSuccess,
  _id,
  assetId,
  canvasId,
  projectId,
  workspaceId,
  initialConfigs = {},
  onAnswerUpdate,
}: UseIntegrationRunnerParams): IIntegrationState & IIntegrationActions => {
  const configsRef = useRef<IConfigs>(initialConfigs);
  const questionRefs = useRef<Record<string, unknown>>({});
  const onAnswerUpdateRef = useRef(onAnswerUpdate);
  onAnswerUpdateRef.current = onAnswerUpdate;
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [configs, setConfigsState] = useState<IConfigs>(initialConfigs);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(
    initialConfigs?.showAdvancedSettings || false
  );
  const [pipeline, setPipeline] = useState<IPipelineItem[]>(
    getInitialPipeline(cloneDeep(initialPipeline), allNodes)
  );
  const [answers, setAnswers] = useState<IAnswers>(cloneDeep(initialAnswers));
  const [advancedFields, setAdvancedFields] = useState<IPipelineItem[]>([]);

  const stagedAnswers = useRef<IAnswers>(cloneDeep(answers));
  const stagedPipeline = useRef<IPipelineItem[]>(cloneDeep(pipeline));

  const setConfig = useCallback((name: string, value: unknown) => {
    configsRef.current = {
      ...configsRef.current,
      [name]: value,
    };
    setConfigsState((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const setQuestionRef = useCallback((nodeId: string, ref: unknown) => {
    questionRefs.current = {
      ...questionRefs.current,
      [nodeId]: ref || null,
    };
  }, []);

  const initAdvancedFields = useCallback(() => {
    const fields = Object.values(allNodes);
    const _advancedFields = fields.filter(
      (field) => field?.config?.settings?.isAdvancedField
    );
    const mappedFields: IPipelineItem[] = _advancedFields.map((field) => ({
      qId: field.id,
    }));
    setAdvancedFields(mappedFields);
  }, [allNodes]);

  const saveStates = useCallback(() => {
    setPipeline([...stagedPipeline.current]);
    setAnswers({ ...stagedAnswers.current });
    onAnswerUpdateRef.current?.(structuredClone(stagedAnswers.current));
  }, []);

  const executeNode = useCallback(
    async ({
      nodeId,
      triggerType,
    }: {
      nodeId: string;
      triggerType: "BY_CLICK" | "BY_CHANGE";
    }): Promise<string[]> => {
      if (isEmpty(nodeId) || allNodes[nodeId]?.type === "IC_WORKFLOW") {
        if (triggerType === "BY_CHANGE") {
          return [];
        }
        onSuccess?.(
          stagedAnswers.current,
          stagedPipeline.current,
          configsRef.current
        );
        return [];
      }

      setLoading(true);
      let _nodeId: string | null = nodeId;
      const addedNodeIds: string[] = [];

      try {
        while (_nodeId) {
          const node = allNodes[_nodeId];
          if (!node) break;

          const executedNodeIds = stagedPipeline.current?.map((item) => item.qId);
          const breakFlow = shouldBreak({
            answers: cloneDeep(stagedAnswers.current),
            node,
            executedNodes: executedNodeIds,
            allNodes,
          });

          if (breakFlow || node?.config?.settings?.isAdvancedField) {
            break;
          }

          if (isControlFlowNode(node)) {
            const executedNodeResponse = (await executeControlFlowNode({
              node,
              answers: stagedAnswers.current,
              allNodes,
              variables,
              _id,
              assetId,
              canvasId,
              projectId,
              workspaceId,
            })) as { result?: unknown; nextNodeId?: string };

            if (!executedNodeResponse?.result) break;

            stagedAnswers.current[_nodeId] = executedNodeResponse.result as IAnswers[string];
            stagedPipeline.current.push({
              qId: _nodeId,
              index: null,
            });

            const nextNode = allNodes[executedNodeResponse.nextNodeId || ""];
            if (nextNode?.type === "IC_WORKFLOW") {
              if (triggerType === "BY_CHANGE") {
                break;
              }
              onSuccess?.(
                stagedAnswers.current,
                stagedPipeline.current,
                configsRef.current
              );
              return addedNodeIds;
            }
            _nodeId = executedNodeResponse.nextNodeId || null;
          }

          if (isQuestionNode(node)) {
            addedNodeIds.push(_nodeId);
            stagedPipeline.current.push({
              qId: _nodeId,
              index: null,
            });

            const nextNodeId = node?.next_node_ids?.[0];
            const nextNode = allNodes[nextNodeId || ""];

            if (nextNode?.type === "IC_WORKFLOW") {
              if (triggerType === "BY_CHANGE") {
                break;
              }
              return addedNodeIds;
            }

            _nodeId = nextNode?.id || null;
          }
        }
        return addedNodeIds;
      } catch (error) {
        console.error("[useIntegrationRunner] executeNode error:", error);
        return addedNodeIds;
      } finally {
        setLoading(false);
        saveStates();
      }
    },
    [allNodes, variables, onSuccess, _id, assetId, canvasId, projectId, workspaceId, saveStates]
  );

  const validateNodes = useCallback(async () => {
    let firstNodeIDWithError: string | null = null;

    for (const pipelineItem of stagedPipeline.current) {
      const nodeId = pipelineItem.qId;
      const node = allNodes[nodeId];

      if (!node || isControlFlowNode(node)) continue;

      stagedAnswers.current[nodeId] = {
        ...stagedAnswers.current[nodeId],
        response: stagedAnswers.current[nodeId]?.response ?? null,
      };

      const questionRef = questionRefs.current[nodeId];
      const error = questionsValidation({
        node,
        answer: stagedAnswers.current,
        ref: questionRef,
      });

      if (error && firstNodeIDWithError === null) {
        firstNodeIDWithError = nodeId;
      }

      stagedAnswers.current[nodeId] = {
        ...stagedAnswers.current[nodeId],
        error: error || "",
      };
      saveStates();
    }
    return { firstNodeIDWithError };
  }, [allNodes, saveStates]);

  const onNext = useCallback(
    async ({ triggerType }: { triggerType: "BY_CLICK" | "BY_CHANGE" }) => {
      if (loading) return;
      setLoading(true);

      const formStatus = await validateNodes();
      if (formStatus.firstNodeIDWithError !== null) {
        scrollToNode(formStatus.firstNodeIDWithError);
        setLoading(false);
        return;
      }

      const lastPipelineItem =
        stagedPipeline.current[stagedPipeline.current.length - 1];
      const lastNode = allNodes[lastPipelineItem?.qId];
      const nodeIdToExecute = lastNode?.next_node_ids?.[0];
      let nodeToExecute = allNodes[nodeIdToExecute || ""];

      while (nodeToExecute?.config?.settings?.isAdvancedField) {
        const next = allNodes[nodeToExecute?.next_node_ids?.[0] || ""];
        nodeToExecute = next;
      }

      const addedNodeIds = await executeNode({
        nodeId: nodeToExecute?.id || "",
        triggerType,
      });

      if (addedNodeIds && addedNodeIds.length > 0) {
        scrollToNode(addedNodeIds[addedNodeIds.length - 1]);
      }
      setLoading(false);
    },
    [loading, validateNodes, allNodes, executeNode]
  );

  const onContinue = useCallback(() => {
    onNext({ triggerType: "BY_CLICK" });
  }, [onNext]);

  const onAnswerChange = useCallback(
    async ({
      node,
      value,
      options,
    }: {
      node: INode;
      value: unknown;
      options?: { executeNode?: boolean };
    }) => {
      const currentValue = stagedAnswers.current[node.id]?.response;
      stagedAnswers.current[node.id] = {
        ...(stagedAnswers.current[node.id] || {}),
        response: value,
        error: "",
      };

      if (!isEqual(currentValue, value)) {
        const slicedPipeline = checkFurtherNodeDependency({
          node,
          allNodes,
          pipeline: cloneDeep(stagedPipeline.current),
        });
        if (slicedPipeline && slicedPipeline.length > 0) {
          stagedPipeline.current = [...slicedPipeline];
        }
      }

      if (options?.executeNode) {
        await onNext({ triggerType: "BY_CHANGE" });
      }
      saveStates();
    },
    [allNodes, onNext, saveStates]
  );

  const onMapToggle = useCallback(
    ({ node, value }: { node: INode; value: boolean }) => {
      const isKeyValueTable =
        node?.config?.type === QuestionType.KEY_VALUE_TABLE;

      stagedAnswers.current[node.id] = {
        ...stagedAnswers.current[node.id],
        isMapped: value,
      };

      if (isKeyValueTable && !value) {
        stagedAnswers.current[node.id] = {
          ...stagedAnswers.current[node.id],
          response: [],
        };
      }

      const _pipeline = checkFurtherNodeDependency({
        node,
        allNodes,
        pipeline: cloneDeep(stagedPipeline.current),
      });

      if (_pipeline) {
        stagedPipeline.current = _pipeline;
      }
      saveStates();
    },
    [allNodes, saveStates]
  );

  const onNodeRefresh = useCallback(
    async (nodeId: string) => {
      if (!nodeId) return;
      const node = allNodes[nodeId];
      const questionRef = questionRefs.current[nodeId] as { refresh?: (answers: IAnswers) => void };
      const usedRefNodes = node?.config?.used_ref_src_ids || [];

      if (usedRefNodes.length === 0) return;

      const triggerNodeId = usedRefNodes.find((refNodeId: string) => {
        const refNode = allNodes[refNodeId];
        return ["HTTP"].includes(refNode?.type);
      });

      const triggerNode = allNodes[triggerNodeId || ""];
      if (!triggerNode) return;

      const transformedNodeType = determineNodeExecutionType(triggerNode);
      const triggerNodeResponse = await executeTransformedNode({
        node: triggerNode,
        type: transformedNodeType,
        answers: stagedAnswers.current,
        allNodes,
        variables,
        _id,
        assetId,
        canvasId,
        projectId,
        workspaceId,
      });

      stagedAnswers.current = {
        ...stagedAnswers.current,
        [triggerNodeId || ""]: {
          ...(triggerNodeResponse?.result || {}),
        },
      };

      questionRef?.refresh?.(stagedAnswers.current);
      saveStates();
    },
    [allNodes, variables, _id, assetId, canvasId, projectId, workspaceId, saveStates]
  );

  const initializePipeline = useCallback(async () => {
    const nodeIds = Object.keys(allNodes);
    const startNodeId = nodeIds[0];

    initAdvancedFields();

    if (pipeline?.length > 0) return;

    await executeNode({ nodeId: startNodeId, triggerType: "BY_CHANGE" });
  }, [allNodes, initAdvancedFields, pipeline?.length, executeNode]);

  useEffect(() => {
    initializePipeline()
      .catch(console.error)
      .finally(() => setInitialLoading(false));
  }, []);

  return {
    answers,
    pipeline,
    advancedFields,
    loading,
    initialLoading,
    showAdvancedSettings,
    configs,
    onContinue,
    onAnswerChange,
    onMapToggle,
    onNodeRefresh,
    setShowAdvancedSettings: useCallback((value: boolean) => {
      setConfig("showAdvancedSettings", value);
      setShowAdvancedSettings(value);
    }, [setConfig]),
    setConfig,
    setQuestionRef,
  };
};
