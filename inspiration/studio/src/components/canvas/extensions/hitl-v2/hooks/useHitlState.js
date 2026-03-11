import { useState, useCallback, useMemo } from "react";
import { HITL_V2_TEMPLATES, TEMPLATE_BUTTONS } from "../constants";

export const useHitlState = (initialData = {}) => {
  // Support both legacy and new data structures
  const isNewNode = !initialData._templateId && !initialData._isFromScratch && !initialData.title && !initialData.template_type;
  
  // Legacy fields
  const [stepName, setStepName] = useState(initialData.step_name || "");
  // Initialize template_type from existing data (prioritize template_type over _templateId)
  const [templateType, setTemplateType] = useState(() => {
    if (initialData.template_type) {
      return initialData.template_type;
    }
    // Map new template IDs to legacy template types if needed
    if (initialData._templateId) {
      const templateTypeMap = {
        "approval-request": "approval",
        "data-review": "categorization",
        "manual-input": "escalation",
      };
      return templateTypeMap[initialData._templateId] || "";
    }
    return "";
  });
  
  // Name (node name)
  const [name, setName] = useState(initialData.name || "Human-in-the-Loop");
  
  // Instructions (for backend - maps to hitlConfig.description)
  const [instructions, setInstructions] = useState(
    initialData.instructions || { type: "fx", blocks: [] }
  );
  
  // Summary content - legacy structure: { value: { type: "fx", blocks: [] }, editable: boolean, type: "text" }
  const [summaryContent, setSummaryContent] = useState(() => {
    if (initialData.summary_content) {
      return initialData.summary_content;
    }
    if (initialData.summaryContent) {
      // Convert new format to legacy format
      return {
        value: initialData.summaryContent,
        editable: false,
        type: "text",
      };
    }
    return {
      value: { type: "fx", blocks: [] },
      editable: false,
      type: "text",
    };
  });
  
  // Buttons - initialize based on template_type if available
  const [buttons, setButtons] = useState(() => {
    if (initialData.buttons?.length > 0) {
      return initialData.buttons;
    }
    // Set buttons based on template_type (legacy behavior)
    const templateTypeToUse = initialData.template_type || 
      (initialData._templateId ? {
        "approval-request": "approval",
        "data-review": "categorization",
        "manual-input": "escalation",
      }[initialData._templateId] : null);
    
    if (templateTypeToUse && TEMPLATE_BUTTONS[templateTypeToUse]) {
      return TEMPLATE_BUTTONS[templateTypeToUse];
    }
    // Default to approval buttons
    return [
      { label: "Approve", value: "Approve", color: "green" },
      { label: "Reject", value: "Reject", color: "red" },
    ];
  });
  
  // Timeout (for backend - maps to hitlConfig.timeout/timeoutUnit)
  const [timeout, setTimeout] = useState(() => {
    if (initialData.timeout) {
      return initialData.timeout;
    }
    // Convert legacy fallback format
    if (initialData.fallback?.enabled) {
      return {
        enabled: true,
        duration: initialData.fallback.timeout_duration || 30,
        unit: initialData.fallback.timeout_unit || "minutes",
      };
    }
    return { enabled: false, duration: 24, unit: "hours" };
  });
  
  // Fallback (legacy structure)
  const [fallback, setFallback] = useState(() => {
    if (initialData.fallback) {
      return initialData.fallback;
    }
    return {
      enabled: false,
      timeout_duration: 30,
      timeout_unit: "minutes",
      action: "auto_trigger",
      fallback_value: "",
    };
  });
  
  // Branding (legacy structure)
  const [branding, setBranding] = useState(() => {
    if (initialData.branding) {
      return initialData.branding;
    }
    return {
      logo_url: "",
      logo_details: {},
      primary_color: "#1A73E8",
      accent_color: "#F4B400",
    };
  });
  
  // Files (legacy structure)
  const [files, setFiles] = useState(initialData.files || []);
  
  // Template tracking (for UI)
  const [selectedTemplateId, setSelectedTemplateId] = useState(
    initialData._templateId || null
  );
  const [isFromScratch, setIsFromScratch] = useState(
    initialData._isFromScratch || isNewNode
  );
  
  // Output schema
  const [outputSchema, setOutputSchema] = useState(
    initialData.output_schema || null
  );

  const hasInitialised = Boolean(
    selectedTemplateId || isFromScratch || initialData.title || templateType
  );

  const selectTemplate = useCallback((templateId) => {
    const template = HITL_V2_TEMPLATES.find((t) => t.id === templateId);
    if (template) {
      setSelectedTemplateId(templateId);
      setIsFromScratch(false);
      // Map template ID to legacy template_type
      const templateTypeMap = {
        "approval-request": "approval",
        "data-review": "categorization",
        "manual-input": "escalation",
      };
      const legacyType = templateTypeMap[templateId] || "approval";
      handleTemplateTypeChange(legacyType);
      setTitle(template.defaults.title);
      setInstructions(template.defaults.instructions);
      setSummaryContent({
        value: template.defaults.summaryContent,
        editable: false,
        type: "text",
      });
      setTimeout(template.defaults.timeout);
      // Update fallback timeout if enabled
      if (template.defaults.timeout.enabled) {
        setFallback((prev) => ({
          ...prev,
          enabled: true,
          timeout_duration: template.defaults.timeout.duration,
          timeout_unit: template.defaults.timeout.unit,
        }));
      }
    }
  }, []);

  const startFromScratch = useCallback(() => {
    setSelectedTemplateId(null);
    setIsFromScratch(true);
    setTemplateType("");
    setTitle({ type: "fx", blocks: [] });
    setInstructions({ type: "fx", blocks: [] });
    setSummaryContent({
      value: { type: "fx", blocks: [] },
      editable: false,
      type: "text",
    });
    setButtons([
      { label: "Approve", value: "approve", color: "green" },
      { label: "Reject", value: "reject", color: "red" },
    ]);
    setTimeout({ enabled: false, duration: 24, unit: "hours" });
    setFallback({
      enabled: false,
      timeout_duration: 30,
      timeout_unit: "minutes",
      action: "auto_trigger",
      fallback_value: "",
    });
  }, []);

  // Handle template type change (legacy compatibility)
  const handleTemplateTypeChange = useCallback((newTemplateType) => {
    setTemplateType(newTemplateType);
    if (newTemplateType && TEMPLATE_BUTTONS[newTemplateType]) {
      // Set buttons based on template type (legacy behavior)
      setButtons(TEMPLATE_BUTTONS[newTemplateType]);
      // Reset fallback value when template changes
      setFallback((prev) => ({
        ...prev,
        fallback_value: "",
      }));
    }
  }, []);

  const addButton = useCallback(() => {
    setButtons((prev) => [
      ...prev,
      { label: "", value: "", color: "gray" },
    ]);
  }, []);

  const updateButton = useCallback((index, field, value) => {
    setButtons((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: value,
        ...(field === "label" ? { value: value.toLowerCase().replace(/\s+/g, "_") } : {}),
      };
      return updated;
    });
  }, []);

  const removeButton = useCallback((index) => {
    setButtons((prev) => {
      if (prev.length <= 2) return prev;
      return prev.filter((_, i) => i !== index);
    });
  }, []);


  const validation = useMemo(() => {
    const errors = [];

    // Template type validation (required for initialization)
    if (!templateType) {
      errors.push("Template type is required");
    }

    // Instructions validation (for backend)
    const hasInstructions = instructions?.blocks?.some(
      (block) => block.value && block.value.trim() !== ""
    );
    if (!hasInstructions) {
      errors.push("Instructions are required");
    }

    // Summary content validation (legacy structure)
    const hasSummaryContent = summaryContent?.value?.blocks?.some(
      (block) => block.value && block.value.trim() !== ""
    );
    if (!hasSummaryContent) {
      errors.push("Summary content is required");
    }

    // Button validation
    const hasValidButtons = buttons.every(
      (btn) => btn.label && btn.label.trim() !== "" && btn.value && btn.value.trim() !== ""
    );
    if (!hasValidButtons) {
      errors.push("All buttons must have labels and values");
    }

    if (buttons.length < 2) {
      errors.push("At least 2 buttons are required");
    }

    // Fallback validation
    if (fallback?.enabled && fallback?.action === "auto_trigger" && !fallback?.fallback_value) {
      errors.push("Fallback button is required when auto-trigger is enabled");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }, [templateType, instructions, summaryContent, buttons, fallback]);

  const updateState = useCallback((updates) => {
    if (updates.name !== undefined) setName(updates.name);
    if (updates.step_name !== undefined) setStepName(updates.step_name);
    if (updates.template_type !== undefined) {
      setTemplateType(updates.template_type);
      handleTemplateTypeChange(updates.template_type);
    }
    if (updates.instructions !== undefined) setInstructions(updates.instructions);
    if (updates.summaryContent !== undefined) setSummaryContent(updates.summaryContent);
    if (updates.summary_content !== undefined) setSummaryContent(updates.summary_content);
    if (updates.buttons !== undefined) setButtons(updates.buttons);
    if (updates.timeout !== undefined) setTimeout(updates.timeout);
    if (updates.fallback !== undefined) setFallback(updates.fallback);
    if (updates.branding !== undefined) setBranding(updates.branding);
    if (updates.files !== undefined) setFiles(updates.files);
  }, [handleTemplateTypeChange]);

  const getData = useCallback(() => {
    // Return data in legacy-compatible format for backend
    return {
      name,
      step_name: stepName,
      template_type: templateType,
      instructions,
      summary_content: summaryContent, // Legacy structure
      summaryContent, // New structure (for UI)
      buttons,
      timeout,
      fallback,
      branding,
      files,
      output_schema: outputSchema,
      _templateId: selectedTemplateId,
      _isFromScratch: isFromScratch,
    };
  }, [
    name,
    stepName,
    templateType,
    instructions,
    summaryContent,
    buttons,
    timeout,
    fallback,
    branding,
    files,
    outputSchema,
    selectedTemplateId,
    isFromScratch,
  ]);

  const getError = useCallback(() => {
    return validation.errors;
  }, [validation]);

  return {
    name,
    setName,
    stepName,
    setStepName,
    templateType,
    setTemplateType,
    handleTemplateTypeChange,
    instructions,
    setInstructions,
    summaryContent,
    setSummaryContent,
    buttons,
    setButtons,
    addButton,
    updateButton,
    removeButton,
    timeout,
    setTimeout,
    fallback,
    setFallback,
    branding,
    setBranding,
    files,
    setFiles,
    selectedTemplateId,
    setSelectedTemplateId,
    isFromScratch,
    setIsFromScratch,
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
