import { useState, useEffect, useMemo } from "react";
import { getPublishedByAssets } from "../utils/get-published-by-asset";
import { ANNOTATIONS } from "../../../../../module/constants";
import { MODES } from "../constant/constants";

export const useNodeData = ({ nodeId, initialResourceIds, mode, nodeData }) => {
  if (mode === MODES.PREVIEW) {
    return {
      flow: nodeData?.flow,
      taskGraph: nodeData?.task_graph,
      annotation: nodeData?.annotation,
      loading: false,
      resourceIds: nodeData?.resourceIds,
      publishResult: nodeData?.result,
      projectVariables: nodeData?.projectVariables,
    };
  }
  const [publishResult, setPublishedResult] = useState({});
  const [loading, setLoading] = useState(true);
  const [resourceIds, setResourceIds] = useState(initialResourceIds);
  const flow = { ...publishResult?.flow };

  const taskGraph = publishResult?.task_graph || [];
  const annotation = publishResult?.annotation || ANNOTATIONS.FC;
  const projectVariables = publishResult?.project_variable || {};

  const resetEventData = () => {
    setPublishedResult({});
    setResourceIds(initialResourceIds);
    setLoading(false);
  };

  useEffect(() => {
    if (!nodeId) {
      console.warn("[useNodeData] No nodeId provided, resetting event data", {
        nodeId,
        mode,
        hasNodeData: !!nodeData,
        nodeDataKey: nodeData?.key,
        nodeDataType: nodeData?.type,
      });
      resetEventData();
      return;
    }
    const fetchPublishedData = async () => {
      try {
        console.log("[useNodeData] Fetching published data for nodeId:", nodeId);
        setLoading(true);
        const data = await getPublishedByAssets(nodeId);
        console.log("[useNodeData] Fetched published data:", {
          nodeId,
          dataId: data?._id || data?.id,
          dataTitle: data?.title || data?.name,
          hasFlow: !!data?.flow && Object.keys(data.flow).length > 0,
          flowKeys: data?.flow ? Object.keys(data.flow) : [],
        });
        setPublishedResult(data);
        setResourceIds((prev) => ({
          ...prev,
          _id: data?._id,
          canvasId: data?.canvas_id,
        }));
      } catch (error) {
        console.error("[useNodeData] Error fetching published data:", {
          nodeId,
          error: error?.message || error,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPublishedData();
  }, [nodeId]);

  return {
    flow,
    taskGraph,
    annotation,
    loading,
    resourceIds,
    publishResult,
    projectVariables,
  };
};
