import { useState, useCallback, useMemo } from "react";
import { cloneDeep } from "lodash-es";
import { getConsultantTemplateById } from "../templates/presets";

export const useConsultantState = (initialData = {}) => {
  const isNewNode = !initialData.templateId && !initialData.isFromScratch;
  const [selectedTemplateId, setSelectedTemplateId] = useState(
    initialData.templateId || null
  );
  const [isFromScratch, setIsFromScratch] = useState(
    initialData.isFromScratch || isNewNode
  );
  
  const [context, setContext] = useState(cloneDeep(initialData.context) || null);
  const [consultationType, setConsultationType] = useState(initialData.consultationType || "strategic");
  const [outputFormat, setOutputFormat] = useState((initialData.outputFormat?.blocks?.[0]?.value) || (typeof initialData.outputFormat === 'string' ? initialData.outputFormat : null) || "executive-summary");
  const [additionalRequirements, setAdditionalRequirements] = useState(initialData.additionalRequirements || "");
  const [outputSchema, setOutputSchema] = useState(
    cloneDeep(initialData.outputSchema) || []
  );

  const selectTemplate = useCallback((templateId) => {
    setSelectedTemplateId(templateId);
    setIsFromScratch(false);
    const template = getConsultantTemplateById(templateId);
    if (template) {
      setConsultationType(template.defaults.consultationType);
      setOutputFormat(template.defaults.outputFormat);
      setOutputSchema(cloneDeep(template.outputSchema));
    }
  }, []);

  const startFromScratch = useCallback(() => {
    setSelectedTemplateId(null);
    setIsFromScratch(true);
    setContext(null);
    setConsultationType("strategic");
    setOutputFormat("executive-summary");
    setAdditionalRequirements("");
    setOutputSchema([
      { key: "analysis", type: "string", description: "Analysis and recommendations" },
    ]);
  }, []);

  const updateContext = useCallback((blocks) => {
    setContext({ type: "fx", blocks });
  }, []);

  const hasInitialised = selectedTemplateId !== null || isFromScratch;

  const validation = useMemo(() => {
    const errors = {};
    
    const hasContext = context?.blocks?.length > 0;
    const hasOutput = outputSchema.length > 0 && outputSchema[0]?.key;

    if (!hasContext) {
      errors.context = "Describe the situation or context for consultation";
    }
    if (!hasOutput) {
      errors.output = "Define at least one output field";
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }, [context, outputSchema]);

  const getData = useCallback(() => {
    const template = selectedTemplateId ? getConsultantTemplateById(selectedTemplateId) : null;
    const formattedSchema = outputSchema.map(field => ({
      ...field,
      value: field.value || { type: "fx", blocks: [{ type: "PRIMITIVES", value: field.defaultValue || "" }] },
      valueStr: field.valueStr || field.defaultValue || "",
    }));
    return {
      templateId: selectedTemplateId,
      isFromScratch,
      context,
      consultationType,
      outputFormat,
      additionalRequirements,
      outputSchema,
      persona: template?.role || {
        type: "fx",
        blocks: [{ type: "text", value: `You are an expert consultant providing ${consultationType} advice. Format your response as ${outputFormat}.` }],
      },
      query: template?.task || {
        type: "fx",
        blocks: [{ type: "text", value: "Provide expert consultation on the following situation:\n\n" }],
      },
      format: formattedSchema,
    };
  }, [
    selectedTemplateId,
    isFromScratch,
    context,
    consultationType,
    outputFormat,
    additionalRequirements,
    outputSchema,
  ]);

  const getError = useCallback(() => {
    if (!validation.isValid) {
      return { 1: ["Please fill all required fields"] };
    }
    return { 1: [] };
  }, [validation]);

  return {
    selectedTemplateId,
    isFromScratch,
    hasInitialised,
    context,
    consultationType,
    outputFormat,
    additionalRequirements,
    outputSchema,
    validation,
    selectTemplate,
    startFromScratch,
    updateContext,
    setConsultationType,
    setOutputFormat,
    setAdditionalRequirements,
    setOutputSchema,
    getData,
    getError,
  };
};
