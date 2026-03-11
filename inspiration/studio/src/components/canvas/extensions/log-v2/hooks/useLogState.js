import { useState, useCallback, useMemo } from "react";
import { LOG_TEMPLATES } from "../constants";

export const useLogState = (initialData = {}) => {
  const isNewNode = !initialData._templateId && !initialData._isFromScratch && !initialData.content;
  const [name, setName] = useState(initialData.name || "Log");
  const [logType, setLogType] = useState(initialData.logType || "INFO");
  const [content, setContent] = useState(
    initialData.content || { type: "fx", blocks: [{ type: "PRIMITIVES", value: "" }] }
  );
  const [selectedTemplateId, setSelectedTemplateId] = useState(
    initialData._templateId || null
  );
  const [isFromScratch, setIsFromScratch] = useState(
    initialData._isFromScratch || isNewNode
  );
  const [outputSchema, setOutputSchema] = useState(initialData.output_schema || null);

  const hasInitialised = Boolean(selectedTemplateId || isFromScratch || initialData.content);

  const updateState = useCallback((updates) => {
    if (updates.name !== undefined) setName(updates.name);
    if (updates.logType !== undefined) setLogType(updates.logType);
    if (updates.content !== undefined) setContent(updates.content);
  }, []);

  const selectTemplate = useCallback((templateId) => {
    const template = LOG_TEMPLATES.find((t) => t.id === templateId);
    if (template) {
      setSelectedTemplateId(templateId);
      setIsFromScratch(false);
      setLogType(template.defaults.logType);
      setContent(template.defaults.content);
    }
  }, []);

  const startFromScratch = useCallback(() => {
    setSelectedTemplateId(null);
    setIsFromScratch(true);
    setLogType("INFO");
    setContent({ type: "fx", blocks: [{ type: "PRIMITIVES", value: "" }] });
  }, []);

  const validation = useMemo(() => {
    const errors = [];
    
    const hasContent = content?.blocks?.some(
      (block) => block.value && block.value.trim() !== ""
    );
    
    if (!hasContent) {
      errors.push("Log content is required");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }, [content]);

  const getData = useCallback(() => {
    return {
      label: name,
      name,
      logType,
      content,
      output_schema: outputSchema,
      _templateId: selectedTemplateId,
      _isFromScratch: isFromScratch,
    };
  }, [name, logType, content, outputSchema, selectedTemplateId, isFromScratch]);

  const getError = useCallback(() => {
    return validation.errors;
  }, [validation]);

  return {
    name,
    setName,
    logType,
    setLogType,
    content,
    setContent,
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
