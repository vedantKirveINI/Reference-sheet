import { useState, useCallback, useMemo } from "react";
import { AGGREGATOR_TEMPLATES } from "../constants";

export const useArrayAggregatorState = (initialData = {}) => {
  const isNewNode = !initialData._templateId && !initialData._isFromScratch && !initialData.source;
  const [name, setName] = useState(initialData.name || "Array Aggregator");
  const [source, setSource] = useState(initialData.source || null);
  const [mapping, setMapping] = useState(
    initialData.mapping || { type: "fx", blocks: [{ type: "PRIMITIVES", value: "" }] }
  );
  const [selectedTemplateId, setSelectedTemplateId] = useState(
    initialData._templateId || null
  );
  const [isFromScratch, setIsFromScratch] = useState(
    initialData._isFromScratch || isNewNode
  );
  const [outputSchema, setOutputSchema] = useState(initialData.output_schema || null);

  const hasInitialised = Boolean(selectedTemplateId || isFromScratch || initialData.source);

  const updateState = useCallback((updates) => {
    if (updates.name !== undefined) setName(updates.name);
    if (updates.source !== undefined) setSource(updates.source);
    if (updates.mapping !== undefined) setMapping(updates.mapping);
    if (updates._templateId !== undefined) setSelectedTemplateId(updates._templateId);
    if (updates._isFromScratch !== undefined) setIsFromScratch(updates._isFromScratch);
    if (updates.output_schema !== undefined) setOutputSchema(updates.output_schema);
  }, []);

  const selectTemplate = useCallback((templateId) => {
    const template = AGGREGATOR_TEMPLATES.find((t) => t.id === templateId);
    if (template) {
      setSelectedTemplateId(templateId);
      setIsFromScratch(false);
      setSource(template.defaults.source);
      setMapping(template.defaults.mapping);
    }
  }, []);

  const startFromScratch = useCallback(() => {
    setSelectedTemplateId(null);
    setIsFromScratch(true);
    setSource(null);
    setMapping({ type: "fx", blocks: [{ type: "PRIMITIVES", value: "" }] });
  }, []);

  const validation = useMemo(() => {
    const errors = [];
    
    if (!source) {
      errors.push("Source iterator is required");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }, [source]);

  const getData = useCallback(() => {
    return {
      name,
      source,
      mapping,
      output_schema: outputSchema,
      _templateId: selectedTemplateId,
      _isFromScratch: isFromScratch,
    };
  }, [name, source, mapping, outputSchema, selectedTemplateId, isFromScratch]);

  const getError = useCallback(() => {
    return validation.errors;
  }, [validation]);

  return {
    name,
    setName,
    source,
    setSource,
    mapping,
    setMapping,
    selectedTemplateId,
    isFromScratch,
    hasInitialised,
    selectTemplate,
    startFromScratch,
    outputSchema,
    setOutputSchema,
    validation,
    getData,
    getError,
    updateState,
  };
};
