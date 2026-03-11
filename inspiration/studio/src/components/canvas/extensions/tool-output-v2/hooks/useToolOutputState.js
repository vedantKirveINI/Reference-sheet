import { useState, useCallback, useMemo } from "react";
import { TOOL_OUTPUT_TEMPLATES } from "../constants";

export const useToolOutputState = (initialData = {}) => {
  const isNewNode = !initialData._templateId && !initialData._isFromScratch && !initialData.outputs?.length;
  const [outputs, setOutputs] = useState(
    initialData.outputs || [
      {
        name: "",
        type: "STRING",
        description: "",
        value: { type: "fx", blocks: [{ type: "PRIMITIVES", value: "" }] },
        format: "raw",
      },
    ]
  );
  const [selectedTemplateId, setSelectedTemplateId] = useState(
    initialData._templateId || null
  );
  const [isFromScratch, setIsFromScratch] = useState(
    initialData._isFromScratch || isNewNode
  );
  const [outputSchema, setOutputSchema] = useState(initialData.output_schema || null);

  const hasInitialised = Boolean(selectedTemplateId || isFromScratch || initialData.outputs?.length);

  const selectTemplate = useCallback((templateId) => {
    const template = TOOL_OUTPUT_TEMPLATES.find((t) => t.id === templateId);
    if (template) {
      setSelectedTemplateId(templateId);
      setIsFromScratch(false);
      setOutputs(template.defaults.outputs);
    }
  }, []);

  const startFromScratch = useCallback(() => {
    setSelectedTemplateId(null);
    setIsFromScratch(true);
    setOutputs([
      {
        name: "",
        type: "STRING",
        description: "",
        value: { type: "fx", blocks: [{ type: "PRIMITIVES", value: "" }] },
        format: "raw",
      },
    ]);
  }, []);

  const addOutput = useCallback(() => {
    setOutputs((prev) => [
      ...prev,
      {
        name: "",
        type: "STRING",
        description: "",
        value: { type: "fx", blocks: [{ type: "PRIMITIVES", value: "" }] },
        format: "raw",
      },
    ]);
  }, []);

  const removeOutput = useCallback((index) => {
    setOutputs((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const updateOutput = useCallback((index, field, value) => {
    setOutputs((prev) =>
      prev.map((output, i) =>
        i === index ? { ...output, [field]: value } : output
      )
    );
  }, []);

  const validation = useMemo(() => {
    const errors = [];
    
    const hasValidOutput = outputs.some(
      (output) => output.name && output.name.trim() !== ""
    );
    
    if (!hasValidOutput) {
      errors.push("At least one output with a name is required");
    }

    const duplicateNames = outputs
      .map((o) => o.name?.trim())
      .filter((name, index, arr) => name && arr.indexOf(name) !== index);
    
    if (duplicateNames.length > 0) {
      errors.push(`Duplicate output names: ${duplicateNames.join(", ")}`);
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
    removeOutput,
    updateOutput,
    outputSchema,
    setOutputSchema,
    validation,
    getData,
    getError,
  };
};
