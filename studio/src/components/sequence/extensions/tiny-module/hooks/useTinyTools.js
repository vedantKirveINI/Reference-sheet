import { useState, useEffect, useCallback } from "react";
import assetSDKServices from "@src/components/canvas/services/assetSDKServices";

export const useTinyTools = (workspaceId) => {
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTools = useCallback(async () => {
    console.log("[useTinyTools] Fetching tools for workspaceId:", workspaceId);
    
    if (!workspaceId) {
      console.log("[useTinyTools] No workspaceId provided, skipping fetch");
      setTools([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const query = {
        workspace_id: workspaceId,
        annotation: "TOOL",
        sort_by: "edited_at",
        sort_type: "desc",
      };

      const res = await assetSDKServices.getFlatList(query);
      
      console.log("[useTinyTools] API Response:", res);
      console.log("[useTinyTools] Tools found:", res?.result?.length || 0);
      console.log("[useTinyTools] Tools data:", res?.result);
      
      if (res?.result) {
        setTools(res.result);
      } else {
        setTools([]);
      }
    } catch (err) {
      console.error("Failed to fetch TinyTools:", err);
      setError(err?.message || "Failed to load tools");
      setTools([]);
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    fetchTools();
  }, [fetchTools]);

  return {
    tools,
    loading,
    error,
    refetch: fetchTools,
  };
};
