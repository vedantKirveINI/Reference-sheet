import { useState, useCallback, useMemo } from "react";
import { START_TEMPLATES } from "../constants";

export const useStartState = (initialData = {}) => {
  const isNewNode = !initialData._templateId && !initialData._isFromScratch && !initialData.startType;
  const [name, setName] = useState(initialData.name || "Start");
  const [startType, setStartType] = useState(initialData.startType || "manual");
  const [variables, setVariables] = useState(initialData.variables || []);
  const [inputSchema, setInputSchema] = useState(initialData.inputSchema || null);
  const [selectedTemplateId, setSelectedTemplateId] = useState(
    initialData._templateId || null
  );
  const [isFromScratch, setIsFromScratch] = useState(
    initialData._isFromScratch || isNewNode
  );
  const [outputSchema, setOutputSchema] = useState(initialData.output_schema || null);

  const hasInitialised = Boolean(selectedTemplateId || isFromScratch || initialData.startType);

  const updateState = useCallback((updates) => {
    if (updates.name !== undefined) setName(updates.name);
    if (updates.startType !== undefined) setStartType(updates.startType);
    if (updates.variables !== undefined) setVariables(updates.variables);
    if (updates.inputSchema !== undefined) setInputSchema(updates.inputSchema);
  }, []);

  const selectTemplate = useCallback((templateId) => {
    const template = START_TEMPLATES.find((t) => t.id === templateId);
    if (template) {
      setSelectedTemplateId(templateId);
      setIsFromScratch(false);
      setStartType(template.defaults.startType);
      setVariables(template.defaults.variables);
      setInputSchema(template.defaults.inputSchema);
    }
  }, []);

  const startFromScratch = useCallback(() => {
    setSelectedTemplateId(null);
    setIsFromScratch(true);
    setStartType("manual");
    setVariables([]);
    setInputSchema(null);
  }, []);

  const addVariable = useCallback((variable) => {
    setVariables((prev) => [...prev, variable]);
  }, []);

  const updateVariable = useCallback((index, variable) => {
    setVariables((prev) => {
      const newVars = [...prev];
      newVars[index] = variable;
      return newVars;
    });
  }, []);

  const removeVariable = useCallback((index) => {
    setVariables((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const validation = useMemo(() => {
    const errors = [];
    return {
      isValid: errors.length === 0,
      errors,
    };
  }, []);

  const getData = useCallback(() => {
    return {
      name,
      startType,
      variables,
      inputSchema,
      output_schema: outputSchema,
      _templateId: selectedTemplateId,
      _isFromScratch: isFromScratch,
    };
  }, [name, startType, variables, inputSchema, outputSchema, selectedTemplateId, isFromScratch]);

  const getError = useCallback(() => {
    return validation.errors;
  }, [validation]);

  return {
    name,
    setName,
    updateState,
    startType,
    setStartType,
    variables,
    setVariables,
    addVariable,
    updateVariable,
    removeVariable,
    inputSchema,
    setInputSchema,
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
  };
};
