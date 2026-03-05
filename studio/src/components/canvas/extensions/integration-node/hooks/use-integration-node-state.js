import { useCallback, useRef, useState, useEffect } from "react";
import { useNodeData } from "./use-node-data";
import { removeFirstKeyValuePair } from "../utils/remove-first-key-value-pair";
import { MODES } from "../constant/constants";

export const useIntegrationNodeState = ({
  nodeData,
  parentId,
  projectId,
  workspaceId,
  assetId,
  mode = MODES.FILLER,
}) => {
  console.log("[useIntegrationNodeState] Initializing with nodeData:", {
    key: nodeData?.key,
    id: nodeData?.id,
    type: nodeData?.type,
    name: nodeData?.name,
    hasId: !!nodeData?.id,
  });

  const [configureData, setConfigureData] = useState(
    nodeData?.go_data || { flow: {} }
  );
  const [selectedConnection, setSelectedConnection] = useState(
    nodeData?.go_data?.connection || null
  );
  const [isConfigured, setIsConfigured] = useState(
    Boolean(nodeData?.go_data?.state?.pipeline?.length > 0)
  );

  const stagedIntegrationAnswers = useRef(configureData?.state || {});
  const aiPrefillApplied = useRef(false);

  const onAnswerChange = useCallback((updatedAnswers = {}) => {
    stagedIntegrationAnswers.current = updatedAnswers;
  }, []);

  const {
    flow,
    taskGraph,
    annotation,
    loading,
    resourceIds,
    publishResult,
    projectVariables,
  } = useNodeData({
    nodeId: nodeData?.id,
    mode,
    nodeData,
    initialResourceIds: {
      parentId,
      projectId,
      workspaceId,
      assetId,
    },
  });

  useEffect(() => {
    if (publishResult && Object.keys(publishResult).length > 0) {
      console.log("[useIntegrationNodeState] Integration loaded:", {
        nodeId: nodeData?.id,
        nodeKey: nodeData?.key,
        publishResultId: publishResult?._id || publishResult?.id,
        publishResultTitle: publishResult?.title || publishResult?.name,
        hasFlow: !!flow && Object.keys(flow).length > 0,
      });
    }
  }, [publishResult, nodeData?.id, nodeData?.key, flow]);

  useEffect(() => {
    const aiConfig = nodeData?.config;
    if (!aiConfig || typeof aiConfig !== "object") return;
    if (aiPrefillApplied.current) return;
    if (!flow || Object.keys(flow).length === 0) return;
    if (isConfigured) return;

    const aiKeys = Object.entries(aiConfig);
    if (aiKeys.length === 0) return;

    const normalize = (s) => String(s).toLowerCase().replace(/[^a-z0-9]/g, "");

    let matched = false;
    const updatedAnswers = { ...stagedIntegrationAnswers.current };

    for (const [nodeId, node] of Object.entries(flow)) {
      if (!node?.config?.question) continue;
      if (updatedAnswers[nodeId]?.response != null) continue;

      const questionNorm = normalize(node.config.question);
      const nameNorm = node.name ? normalize(node.name) : "";

      for (const [key, value] of aiKeys) {
        if (value == null || value === "") continue;
        const keyNorm = normalize(key);
        if (
          questionNorm.includes(keyNorm) ||
          keyNorm.includes(questionNorm) ||
          (nameNorm && (nameNorm.includes(keyNorm) || keyNorm.includes(nameNorm)))
        ) {
          updatedAnswers[nodeId] = {
            response: value,
            isMapped: false,
          };
          matched = true;
          break;
        }
      }
    }

    if (matched) {
      stagedIntegrationAnswers.current = updatedAnswers;
      aiPrefillApplied.current = true;
      console.log("[useIntegrationNodeState] Applied AI pre-fill to integration answers");
    }
  }, [flow, nodeData?.config, isConfigured]);

  const connectionNode = Object.values(flow || {})[0];
  const flowWithOutConnection = removeFirstKeyValuePair(flow || {});

  const onConnectionChange = useCallback(
    async ({
      connection = {},
      refreshedConfigs = {},
      connectionNodeKey = "",
    }) => {
      setSelectedConnection({
        ...connection,
        id: connection?._id,
      });
      setConfigureData((prev) => {
        const updatedState = {
          ...prev,
          state: {
            ...prev.state,
            [connectionNodeKey]: {
              response: {
                ...refreshedConfigs,
              },
            },
          },
        };
        stagedIntegrationAnswers.current = structuredClone(updatedState.state);
        return updatedState;
      });
    },
    []
  );

  const getInitialAnswers = useCallback(() => {
    return stagedIntegrationAnswers.current;
  }, []);

  const getGoData = useCallback(() => {
    return {
      ...configureData,
      state: {
        ...(configureData?.state || {}),
        ...(stagedIntegrationAnswers.current || {}),
      },
    };
  }, [configureData]);

  const getIntegrationNodeData = useCallback(() => {
    const modifiedConfigureData = {
      ...(configureData || {}),
      flow: {
        ...(configureData?.flow || {}),
        asset_id: nodeData?.id,
        project_id: publishResult?.project_id,
        id: publishResult?._id || publishResult?.id,
      },
      state: {
        ...(configureData?.state || {}),
        ...(stagedIntegrationAnswers.current || {}),
      },
    };
    return { configureData: modifiedConfigureData, selectedConnection };
  }, [
    configureData,
    selectedConnection,
    nodeData?.id,
    publishResult?.project_id,
    publishResult?._id,
    publishResult?.id,
  ]);

  return {
    configureData,
    setConfigureData,
    selectedConnection,
    setSelectedConnection,
    isConfigured,
    setIsConfigured,
    loading,
    flow,
    flowWithOutConnection,
    connectionNode,
    taskGraph,
    annotation,
    resourceIds,
    publishResult,
    projectVariables,
    onConnectionChange,
    getInitialAnswers,
    getGoData,
    getIntegrationNodeData,
    onAnswerChange,
  };
};
