import { useState, useCallback } from "react";
import { canvasSDKServices } from "@src/components/canvas/services/canvasSDKServices";

export const useToolSchema = () => {
  const [schema, setSchema] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSchema = useCallback(async (tool) => {
    if (!tool) {
      setSchema(null);
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await canvasSDKServices.getBoundsIOOfPublishedCanvas(tool);
      
      if (response?.result) {
        const schemaData = {
          inputs: response.result.start || [],
          outputs: [
            ...(response.result.success || []),
            ...(response.result.failed || []),
          ],
        };
        setSchema(schemaData);
        return schemaData;
      } else {
        setSchema(null);
        return null;
      }
    } catch (err) {
      console.error("Failed to fetch tool schema:", err);
      setError(err?.message || "Failed to load tool schema");
      setSchema(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearSchema = useCallback(() => {
    setSchema(null);
    setError(null);
  }, []);

  return {
    schema,
    loading,
    error,
    fetchSchema,
    clearSchema,
  };
};
