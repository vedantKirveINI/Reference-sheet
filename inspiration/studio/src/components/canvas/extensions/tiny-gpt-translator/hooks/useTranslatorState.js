import { useState, useCallback, useMemo } from "react";
import { cloneDeep } from "lodash-es";
import { getTranslatorTemplateById } from "../templates/presets";

export const useTranslatorState = (initialData = {}) => {
  const isNewNode = !initialData.templateId && !initialData.isFromScratch;
  const [selectedTemplateId, setSelectedTemplateId] = useState(
    initialData.templateId || null
  );
  const [isFromScratch, setIsFromScratch] = useState(
    initialData.isFromScratch || isNewNode
  );
  
  const [inputText, setInputText] = useState(cloneDeep(initialData.inputText) || null);
  const [sourceLanguage, setSourceLanguage] = useState(initialData.sourceLanguage || "auto");
  const [targetLanguage, setTargetLanguage] = useState(initialData.targetLanguage || "en");
  const [tone, setTone] = useState(initialData.tone || "neutral");
  const [additionalInstructions, setAdditionalInstructions] = useState(
    initialData.additionalInstructions || ""
  );
  const [outputSchema, setOutputSchema] = useState(
    cloneDeep(initialData.outputSchema) || [
      { key: "translated_text", type: "string", description: "The translated text" },
      { key: "detected_language", type: "string", description: "Source language detected" },
    ]
  );

  const selectTemplate = useCallback((templateId) => {
    setSelectedTemplateId(templateId);
    setIsFromScratch(false);
    const template = getTranslatorTemplateById(templateId);
    if (template) {
      setTone(template.defaults.tone);
      setSourceLanguage(template.defaults.sourceLanguage);
      setTargetLanguage(template.defaults.targetLanguage);
      setOutputSchema(cloneDeep(template.outputSchema));
    }
  }, []);

  const startFromScratch = useCallback(() => {
    setSelectedTemplateId(null);
    setIsFromScratch(true);
    setInputText(null);
    setSourceLanguage("auto");
    setTargetLanguage("en");
    setTone("neutral");
    setAdditionalInstructions("");
    setOutputSchema([
      { key: "translated_text", type: "string", description: "The translated text" },
      { key: "detected_language", type: "string", description: "Source language detected" },
    ]);
  }, []);

  const updateInputText = useCallback((blocks) => {
    setInputText({ type: "fx", blocks });
  }, []);

  const hasInitialised = selectedTemplateId !== null || isFromScratch;

  const validation = useMemo(() => {
    const errors = {};
    
    const hasInputText = inputText?.blocks?.length > 0;
    const hasTargetLanguage = targetLanguage && targetLanguage !== "";
    const hasOutput = outputSchema.length > 0 && outputSchema[0]?.key;

    if (!hasInputText) {
      errors.inputText = "Enter the text you want to translate";
    }
    if (!hasTargetLanguage) {
      errors.targetLanguage = "Select a target language";
    }
    if (!hasOutput) {
      errors.output = "Define at least one output field";
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }, [inputText, targetLanguage, outputSchema]);

  const getData = useCallback(() => {
    const template = selectedTemplateId ? getTranslatorTemplateById(selectedTemplateId) : null;
    
    return {
      templateId: selectedTemplateId,
      isFromScratch,
      inputText,
      sourceLanguage,
      targetLanguage,
      tone,
      additionalInstructions,
      outputSchema,
      persona: template?.role || {
        type: "fx",
        blocks: [{ type: "text", value: `You are a professional translator. Translate with a ${tone} tone from ${sourceLanguage === 'auto' ? 'the detected language' : sourceLanguage} to ${targetLanguage}.` }],
      },
      query: template?.task || {
        type: "fx",
        blocks: [{ type: "text", value: "Translate the following text:\n\n" }],
      },
      format: outputSchema,
    };
  }, [
    selectedTemplateId,
    isFromScratch,
    inputText,
    sourceLanguage,
    targetLanguage,
    tone,
    additionalInstructions,
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
    inputText,
    sourceLanguage,
    targetLanguage,
    tone,
    additionalInstructions,
    outputSchema,
    validation,
    selectTemplate,
    startFromScratch,
    updateInputText,
    setSourceLanguage,
    setTargetLanguage,
    setTone,
    setAdditionalInstructions,
    setOutputSchema,
    getData,
    getError,
  };
};
