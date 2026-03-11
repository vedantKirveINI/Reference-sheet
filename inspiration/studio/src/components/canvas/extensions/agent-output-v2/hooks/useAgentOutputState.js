import { useState, useCallback, useMemo } from "react";
import { AGENT_OUTPUT_TEMPLATES } from "../constants";

export const useAgentOutputState = (initialData = {}) => {
  const isNewNode = !initialData._templateId && !initialData._isFromScratch && (!initialData.outputs || initialData.outputs.length === 0);
  const [outputs, setOutputs] = useState(initialData.outputs || []);
  const [selectedTemplateId, setSelectedTemplateId] = useState(
    initialData._templateId || null
  );
  const [isFromScratch, setIsFromScratch] = useState(
    initialData._isFromScratch || isNewNode
  );
  const [outputSchema, setOutputSchema] = useState(initialData.output_schema || null);

  const hasInitialised = Boolean(selectedTemplateId || isFromScratch || (initialData.outputs && initialData.outputs.length > 0));

  const selectTemplate = useCallback((templateId) => {
    const template = AGENT_OUTPUT_TEMPLATES.find((t) => t.id === templateId);
    if (template) {
      setSelectedTemplateId(templateId);
      setIsFromScratch(false);
      setOutputs(template.defaults.outputs);
    }
  }, []);

  const startFromScratch = useCallback(() => {
    setSelectedTemplateId(null);
    setIsFromScratch(true);
    setOutputs([{
      name: "",
      type: "text",
      value: { type: "fx", blocks: [{ type: "PRIMITIVES", value: "" }] },
      format: "raw",
    }]);
  }, []);

  const addOutput = useCallback(() => {
    setOutputs((prev) => [
      ...prev,
      {
        name: "",
        type: "text",
        value: { type: "fx", blocks: [{ type: "PRIMITIVES", value: "" }] },
        format: "raw",
      },
    ]);
  }, []);

  const updateOutput = useCallback((index, field, value) => {
    setOutputs((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  }, []);

  const removeOutput = useCallback((index) => {
    setOutputs((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const validation = useMemo(() => {
    const errors = [];
    
    if (outputs.length === 0) {
      errors.push("At least one output is required");
    }

    outputs.forEach((output, index) => {
      if (!output.name || output.name.trim() === "") {
        errors.push(`Output ${index + 1}: Name is required`);
      }
    });

    const names = outputs.map((o) => o.name?.trim()).filter(Boolean);
    const uniqueNames = new Set(names);
    if (names.length !== uniqueNames.size) {
      errors.push("Output names must be unique");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }, [outputs]);

  const getData = useCallback(() => {
    return {
      outputs,
      output_schema: outputSchema,
      _templateId: selectedTemplateId,
      _isFromScratch: isFromScratch,
    };
  }, [outputs, outputSchema, selectedTemplateId, isFromScratch]);

  const getError = useCallback(() => {
    return validation.errors;
  }, [validation]);

  return {
    outputs,
    setOutputs,
    selectedTemplateId,
    isFromScratch,
    hasInitialised,
    selectTemplate,
    startFromScratch,
    addOutput,
    updateOutput,
    removeOutput,
    outputSchema,
    setOutputSchema,
    validation,
    getData,
    getError,
  };
};
