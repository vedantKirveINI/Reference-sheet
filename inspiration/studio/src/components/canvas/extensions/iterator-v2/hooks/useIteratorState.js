import { useState, useCallback, useMemo } from "react";
import { ITERATOR_TEMPLATES } from "../constants";

export const useIteratorState = (initialData = {}) => {
  const isNewNode = !initialData._templateId && !initialData._isFromScratch && !initialData.content;
  const [name, setName] = useState(initialData.name || "");
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

  const selectTemplate = useCallback((templateId) => {
    const template = ITERATOR_TEMPLATES.find((t) => t.id === templateId);
    if (template) {
      setSelectedTemplateId(templateId);
      setIsFromScratch(false);
      setContent(template.defaults.content);
    }
  }, []);

  const startFromScratch = useCallback(() => {
    setSelectedTemplateId(null);
    setIsFromScratch(true);
    setContent({ type: "fx", blocks: [{ type: "PRIMITIVES", value: "" }] });
  }, []);

  const updateState = useCallback((updates) => {
    if (updates.name !== undefined) setName(updates.name);
    if (updates.content !== undefined) setContent(updates.content);
    if (updates.selectedTemplateId !== undefined) setSelectedTemplateId(updates.selectedTemplateId);
    if (updates.isFromScratch !== undefined) setIsFromScratch(updates.isFromScratch);
    if (updates.outputSchema !== undefined) setOutputSchema(updates.outputSchema);
  }, []);

  const validation = useMemo(() => {
    const errors = [];
    
    const hasContent = content?.blocks?.some(
      (block) => (block.value && block.value.trim() !== "") || block.type !== "PRIMITIVES"
    );
    
    if (!hasContent) {
      errors.push("Array input is required");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }, [content]);

  const getData = useCallback(() => {
    return {
      name,
      content,
      output_schema: outputSchema,
      _templateId: selectedTemplateId,
      _isFromScratch: isFromScratch,
    };
  }, [name, content, outputSchema, selectedTemplateId, isFromScratch]);

  const getError = useCallback(() => {
    return validation.errors;
  }, [validation]);

  return {
    name,
    setName,
    content,
    setContent,
    selectedTemplateId,
    isFromScratch,
    hasInitialised,
    selectTemplate,
    startFromScratch,
    outputSchema,
    setOutputSchema,
    updateState,
    validation,
    getData,
    getError,
  };
};
