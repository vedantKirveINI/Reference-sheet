import { useState, useCallback, useMemo } from "react";
import { TOOL_INPUT_TEMPLATES } from "../constants";

export const useToolInputState = (initialData = {}) => {
  const isNewNode = !initialData._templateId && !initialData._isFromScratch && !initialData.parameters?.length;
  const [parameters, setParameters] = useState(
    initialData.parameters || [
      {
        name: "",
        type: "STRING",
        description: "",
        required: false,
        example: { type: "fx", blocks: [{ type: "PRIMITIVES", value: "" }] },
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

  const hasInitialised = Boolean(selectedTemplateId || isFromScratch || initialData.parameters?.length);

  const selectTemplate = useCallback((templateId) => {
    const template = TOOL_INPUT_TEMPLATES.find((t) => t.id === templateId);
    if (template) {
      setSelectedTemplateId(templateId);
      setIsFromScratch(false);
      setParameters(template.defaults.parameters);
    }
  }, []);

  const startFromScratch = useCallback(() => {
    setSelectedTemplateId(null);
    setIsFromScratch(true);
    setParameters([
      {
        name: "",
        type: "STRING",
        description: "",
        required: false,
        example: { type: "fx", blocks: [{ type: "PRIMITIVES", value: "" }] },
      },
    ]);
  }, []);

  const addParameter = useCallback(() => {
    setParameters((prev) => [
      ...prev,
      {
        name: "",
        type: "STRING",
        description: "",
        required: false,
        example: { type: "fx", blocks: [{ type: "PRIMITIVES", value: "" }] },
      },
    ]);
  }, []);

  const removeParameter = useCallback((index) => {
    setParameters((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const updateParameter = useCallback((index, field, value) => {
    setParameters((prev) =>
      prev.map((param, i) =>
        i === index ? { ...param, [field]: value } : param
      )
    );
  }, []);

  const validation = useMemo(() => {
    const errors = [];
    
    const hasValidParam = parameters.some(
      (param) => param.name && param.name.trim() !== ""
    );
    
    if (!hasValidParam) {
      errors.push("At least one parameter with a name is required");
    }

    const duplicateNames = parameters
      .map((p) => p.name?.trim())
      .filter((name, index, arr) => name && arr.indexOf(name) !== index);
    
    if (duplicateNames.length > 0) {
      errors.push(`Duplicate parameter names: ${duplicateNames.join(", ")}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }, [parameters]);

  const getData = useCallback(() => {
    return {
      parameters,
      output_schema: outputSchema,
      _templateId: selectedTemplateId,
      _isFromScratch: isFromScratch,
    };
  }, [parameters, outputSchema, selectedTemplateId, isFromScratch]);

  const getError = useCallback(() => {
    return validation.errors;
  }, [validation]);

  return {
    parameters,
    setParameters,
    selectedTemplateId,
    isFromScratch,
    hasInitialised,
    selectTemplate,
    startFromScratch,
    addParameter,
    removeParameter,
    updateParameter,
    outputSchema,
    setOutputSchema,
    validation,
    getData,
    getError,
  };
};
