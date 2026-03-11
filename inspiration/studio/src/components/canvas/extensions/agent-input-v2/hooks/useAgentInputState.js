import { useState, useCallback, useMemo } from "react";
import { AGENT_INPUT_TEMPLATES } from "../constants";

export const useAgentInputState = (initialData = {}) => {
  const isNewNode = !initialData._templateId && !initialData._isFromScratch && (!initialData.inputs || initialData.inputs.length === 0);
  const [inputs, setInputs] = useState(initialData.inputs || []);
  const [selectedTemplateId, setSelectedTemplateId] = useState(
    initialData._templateId || null
  );
  const [isFromScratch, setIsFromScratch] = useState(
    initialData._isFromScratch || isNewNode
  );
  const [outputSchema, setOutputSchema] = useState(initialData.output_schema || null);

  const hasInitialised = Boolean(selectedTemplateId || isFromScratch || (initialData.inputs && initialData.inputs.length > 0));

  const selectTemplate = useCallback((templateId) => {
    const template = AGENT_INPUT_TEMPLATES.find((t) => t.id === templateId);
    if (template) {
      setSelectedTemplateId(templateId);
      setIsFromScratch(false);
      setInputs(template.defaults.inputs);
    }
  }, []);

  const startFromScratch = useCallback(() => {
    setSelectedTemplateId(null);
    setIsFromScratch(true);
    setInputs([{ name: "", type: "text", description: "", required: false, validation: null }]);
  }, []);

  const addInput = useCallback(() => {
    setInputs((prev) => [
      ...prev,
      { name: "", type: "text", description: "", required: false, validation: null },
    ]);
  }, []);

  const updateInput = useCallback((index, field, value) => {
    setInputs((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  }, []);

  const removeInput = useCallback((index) => {
    setInputs((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const validation = useMemo(() => {
    const errors = [];
    
    if (inputs.length === 0) {
      errors.push("At least one input is required");
    }

    inputs.forEach((input, index) => {
      if (!input.name || input.name.trim() === "") {
        errors.push(`Input ${index + 1}: Name is required`);
      }
    });

    const names = inputs.map((i) => i.name?.trim()).filter(Boolean);
    const uniqueNames = new Set(names);
    if (names.length !== uniqueNames.size) {
      errors.push("Input names must be unique");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }, [inputs]);

  const getData = useCallback(() => {
    return {
      inputs,
      output_schema: outputSchema,
      _templateId: selectedTemplateId,
      _isFromScratch: isFromScratch,
    };
  }, [inputs, outputSchema, selectedTemplateId, isFromScratch]);

  const getError = useCallback(() => {
    return validation.errors;
  }, [validation]);

  return {
    inputs,
    setInputs,
    selectedTemplateId,
    isFromScratch,
    hasInitialised,
    selectTemplate,
    startFromScratch,
    addInput,
    updateInput,
    removeInput,
    outputSchema,
    setOutputSchema,
    validation,
    getData,
    getError,
  };
};
