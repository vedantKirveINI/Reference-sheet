import { useState, useCallback, useMemo } from "react";
import { END_TEMPLATES } from "../constants";

export const useEndState = (initialData = {}) => {
  const isNewNode = !initialData._templateId && !initialData._isFromScratch && !initialData.endType;
  const [name, setName] = useState(initialData.name || "");
  const [endType, setEndType] = useState(initialData.endType || "success");
  const [output, setOutput] = useState(
    initialData.output || { type: "fx", blocks: [{ type: "PRIMITIVES", value: "" }] }
  );
  const [message, setMessage] = useState(initialData.message || "");
  const [selectedTemplateId, setSelectedTemplateId] = useState(
    initialData._templateId || null
  );
  const [isFromScratch, setIsFromScratch] = useState(
    initialData._isFromScratch || isNewNode
  );
  const [outputSchema, setOutputSchema] = useState(initialData.output_schema || null);
  const [enableJsonResponse, setEnableJsonResponse] = useState(initialData.enableJsonResponse || false);
  const [statusCode, setStatusCode] = useState(initialData.statusCode || 200);
  const [outputs, setOutputs] = useState(initialData.outputs || []);

  const hasInitialised = Boolean(selectedTemplateId || isFromScratch || initialData.endType);

  const updateState = useCallback((updates) => {
    if (updates.name !== undefined) setName(updates.name);
    if (updates.endType !== undefined) setEndType(updates.endType);
    if (updates.output !== undefined) setOutput(updates.output);
    if (updates.message !== undefined) setMessage(updates.message);
    if (updates.selectedTemplateId !== undefined) setSelectedTemplateId(updates.selectedTemplateId);
    if (updates.isFromScratch !== undefined) setIsFromScratch(updates.isFromScratch);
    if (updates.enableJsonResponse !== undefined) setEnableJsonResponse(updates.enableJsonResponse);
    if (updates.statusCode !== undefined) setStatusCode(updates.statusCode);
    if (updates.outputs !== undefined) setOutputs(updates.outputs);
  }, []);

  const selectTemplate = useCallback((templateId) => {
    const template = END_TEMPLATES.find((t) => t.id === templateId);
    if (template) {
      setSelectedTemplateId(templateId);
      setIsFromScratch(false);
      setEndType(template.defaults.endType);
      setOutput(template.defaults.output);
      setMessage(template.defaults.message);
      setEnableJsonResponse(template.defaults.enableJsonResponse || false);
      setStatusCode(template.defaults.statusCode || 200);
      setOutputs(template.defaults.outputs || []);
    }
  }, []);

  const startFromScratch = useCallback(() => {
    setSelectedTemplateId(null);
    setIsFromScratch(true);
    setEndType("success");
    setOutput({ type: "fx", blocks: [{ type: "PRIMITIVES", value: "" }] });
    setMessage("");
    setEnableJsonResponse(false);
    setStatusCode(200);
    setOutputs([]);
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
      endType,
      output,
      message,
      output_schema: outputSchema,
      _templateId: selectedTemplateId,
      _isFromScratch: isFromScratch,
      enableJsonResponse,
      statusCode,
      outputs,
    };
  }, [name, endType, output, message, outputSchema, selectedTemplateId, isFromScratch, enableJsonResponse, statusCode, outputs]);

  const getError = useCallback(() => {
    return validation.errors;
  }, [validation]);

  return {
    name,
    setName,
    endType,
    setEndType,
    output,
    setOutput,
    message,
    setMessage,
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
    enableJsonResponse,
    setEnableJsonResponse,
    statusCode,
    setStatusCode,
    outputs,
    setOutputs,
  };
};
