import { useState, useCallback, useMemo } from "react";
import { cloneDeep } from "lodash-es";

export const useResearcherState = (initialData = {}) => {
  const [hasStarted, setHasStarted] = useState(
    initialData.hasStarted || false
  );
  const [topic, setTopic] = useState(cloneDeep(initialData.topic) || null);
  const [researchDepth, setResearchDepth] = useState(
    initialData.researchDepth || "moderate"
  );
  const [outputFormat, setOutputFormat] = useState(
    (initialData.outputFormat?.blocks?.[0]?.value) || (typeof initialData.outputFormat === 'string' ? initialData.outputFormat : null) || "summary"
  );
  const [selectedSources, setSelectedSources] = useState(
    initialData.selectedSources || ["academic", "news"]
  );
  const [factCheckLevel, setFactCheckLevel] = useState(
    initialData.factCheckLevel || "medium"
  );
  const [additionalContext, setAdditionalContext] = useState(
    initialData.additionalContext || ""
  );
  const [outputSchema, setOutputSchema] = useState(
    cloneDeep(initialData.outputSchema) || [
      { key: "research_summary", type: "string", description: "Main research findings" },
      { key: "key_points", type: "string", description: "Key points and insights" },
      { key: "sources", type: "string", description: "Source references" },
    ]
  );

  const startResearch = useCallback(() => {
    setHasStarted(true);
  }, []);

  const updateTopic = useCallback((blocks) => {
    setTopic({ type: "fx", blocks });
  }, []);

  const toggleSource = useCallback((sourceId) => {
    setSelectedSources((prev) => {
      if (prev.includes(sourceId)) {
        return prev.filter((id) => id !== sourceId);
      }
      return [...prev, sourceId];
    });
  }, []);

  const validation = useMemo(() => {
    const errors = {};
    
    const hasTopic = topic?.blocks?.length > 0;
    const hasSources = selectedSources.length > 0;

    if (!hasTopic) {
      errors.topic = "Enter a research topic or question";
    }
    if (!hasSources) {
      errors.sources = "Select at least one source type";
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }, [topic, selectedSources]);

  const getData = useCallback(() => {
    const formattedSchema = outputSchema.map(field => ({
      ...field,
      value: field.value || { type: "fx", blocks: [{ type: "PRIMITIVES", value: field.defaultValue || "" }] },
      valueStr: field.valueStr || field.defaultValue || "",
    }));
    return {
      hasStarted,
      topic,
      researchDepth,
      outputFormat,
      selectedSources,
      factCheckLevel,
      additionalContext,
      outputSchema,
      topicSpecification: topic?.blocks?.[0]?.value || "",
      depthOfResearch: researchDepth,
      sourcePreference: {
        preferences: selectedSources,
        otherContent: additionalContext,
      },
      format: formattedSchema,
    };
  }, [
    hasStarted,
    topic,
    researchDepth,
    outputFormat,
    selectedSources,
    factCheckLevel,
    additionalContext,
    outputSchema,
  ]);

  const getError = useCallback(() => {
    if (!validation.isValid) {
      return { 1: ["Please fill all required fields"] };
    }
    return { 1: [] };
  }, [validation]);

  return {
    hasStarted,
    topic,
    researchDepth,
    outputFormat,
    selectedSources,
    factCheckLevel,
    additionalContext,
    outputSchema,
    validation,
    startResearch,
    updateTopic,
    setResearchDepth,
    setOutputFormat,
    setSelectedSources,
    toggleSource,
    setFactCheckLevel,
    setAdditionalContext,
    setOutputSchema,
    getData,
    getError,
  };
};
