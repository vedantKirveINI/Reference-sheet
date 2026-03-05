import { useState, useCallback, useMemo } from "react";
import { AGENT_TEMPLATES } from "../constants";

export const useAgentNodeState = (initialData = {}) => {
  const isNewNode = !initialData._templateId && !initialData._isFromScratch && !initialData.selectedAgent;
  const [agentName, setAgentName] = useState(initialData.agentName || "");
  const [agentDescription, setAgentDescription] = useState(initialData.agentDescription || "");
  const [selectedAgent, setSelectedAgent] = useState(initialData.selectedAgent || null);
  const [agentConfig, setAgentConfig] = useState(initialData.agentConfig || {});
  const [inputMapping, setInputMapping] = useState(
    initialData.inputMapping || { type: "fx", blocks: [{ type: "PRIMITIVES", value: "" }] }
  );
  const [selectedTemplateId, setSelectedTemplateId] = useState(
    initialData._templateId || null
  );
  const [isFromScratch, setIsFromScratch] = useState(
    initialData._isFromScratch || isNewNode
  );
  const [outputSchema, setOutputSchema] = useState(initialData.output_schema || null);

  const hasInitialised = Boolean(selectedTemplateId || isFromScratch || initialData.selectedAgent);

  const selectTemplate = useCallback((templateId) => {
    const template = AGENT_TEMPLATES.find((t) => t.id === templateId);
    if (template) {
      setSelectedTemplateId(templateId);
      setIsFromScratch(false);
      setAgentConfig(template.defaults.agentConfig);
      setInputMapping(template.defaults.inputMapping);
    }
  }, []);

  const startFromScratch = useCallback(() => {
    setSelectedTemplateId(null);
    setIsFromScratch(true);
    setAgentConfig({});
    setInputMapping({ type: "fx", blocks: [{ type: "PRIMITIVES", value: "" }] });
  }, []);

  const validation = useMemo(() => {
    const errors = [];
    
    if (!selectedAgent) {
      errors.push("Please select an agent");
    }

    const hasInputMapping = inputMapping?.blocks?.some(
      (block) => block.value && block.value.trim() !== ""
    );
    
    if (!hasInputMapping) {
      errors.push("Input mapping is required");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }, [selectedAgent, inputMapping]);

  const getData = useCallback(() => {
    return {
      agentName,
      agentDescription,
      selectedAgent,
      agentConfig,
      inputMapping,
      asset_id: selectedAgent?._id || selectedAgent?.id,
      version_id: null,
      output_schema: outputSchema,
      _templateId: selectedTemplateId,
      _isFromScratch: isFromScratch,
    };
  }, [agentName, agentDescription, selectedAgent, agentConfig, inputMapping, outputSchema, selectedTemplateId, isFromScratch]);

  const getError = useCallback(() => {
    return validation.errors;
  }, [validation]);

  return {
    agentName,
    setAgentName,
    agentDescription,
    setAgentDescription,
    selectedAgent,
    setSelectedAgent,
    agentConfig,
    setAgentConfig,
    inputMapping,
    setInputMapping,
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
