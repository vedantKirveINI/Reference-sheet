import { useState, useCallback, useMemo } from "react";

export const useTinyModuleState = (initialData = {}) => {
  const [name, setName] = useState(initialData.name || "Tiny Module");
  const [moduleId, setModuleId] = useState(initialData.moduleId || "");
  const [selectedTool, setSelectedTool] = useState(initialData.selectedTool || null);
  const [toolSchema, setToolSchema] = useState(initialData.toolSchema || null);
  const [inputMapping, setInputMapping] = useState(
    initialData.inputMapping || []
  );
  const [outputSchema, setOutputSchema] = useState(initialData.output_schema || null);

  const updateState = useCallback((updates) => {
    if (updates.name !== undefined) setName(updates.name);
    if (updates.moduleId !== undefined) setModuleId(updates.moduleId);
    if (updates.inputMapping !== undefined) setInputMapping(updates.inputMapping);
    if (updates.selectedTool !== undefined) setSelectedTool(updates.selectedTool);
    if (updates.toolSchema !== undefined) setToolSchema(updates.toolSchema);
  }, []);

  const selectTool = useCallback((tool, schema) => {
    setModuleId(tool?._id || "");
    setSelectedTool(tool);
    setToolSchema(schema);
    
    if (tool && schema?.inputs?.length > 0) {
      const newMapping = schema.inputs.map((input, index) => ({
        id: `${Date.now()}_${index}`,
        key: input.name || input.key || `param_${index}`,
        type: input.type || "STRING",
        description: input.description || "",
        required: input.required ?? true,
        value: { type: "fx", blocks: [] },
      }));
      setInputMapping(newMapping);
    } else {
      setInputMapping([]);
    }
  }, []);

  const clearTool = useCallback(() => {
    setModuleId("");
    setSelectedTool(null);
    setToolSchema(null);
    setInputMapping([]);
  }, []);

  const addInputMapping = useCallback(() => {
    setInputMapping((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        key: "",
        type: "STRING",
        description: "",
        required: false,
        value: { type: "fx", blocks: [] },
      },
    ]);
  }, []);

  const updateInputMapping = useCallback((id, field, value) => {
    setInputMapping((prev) =>
      prev.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    );
  }, []);

  const removeInputMapping = useCallback((id) => {
    setInputMapping((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const validation = useMemo(() => {
    const errors = [];

    if (!moduleId || moduleId.trim() === "") {
      errors.push("Please select a TinyTool");
    }

    const requiredMappings = inputMapping.filter((m) => m.required);
    const emptyRequired = requiredMappings.filter(
      (m) => !m.value?.blocks?.length
    );
    if (emptyRequired.length > 0) {
      errors.push(`Please fill in required fields: ${emptyRequired.map((m) => m.key).join(", ")}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }, [moduleId, inputMapping]);

  const getData = useCallback(() => {
    return {
      name,
      moduleId,
      selectedTool: selectedTool ? {
        _id: selectedTool._id,
        name: selectedTool.name,
        asset_id: selectedTool.asset_id,
      } : null,
      toolSchema,
      inputMapping,
      output_schema: outputSchema,
    };
  }, [name, moduleId, selectedTool, toolSchema, inputMapping, outputSchema]);

  const getError = useCallback(() => {
    return validation.errors;
  }, [validation]);

  return {
    name,
    setName,
    moduleId,
    setModuleId,
    selectedTool,
    setSelectedTool,
    toolSchema,
    setToolSchema,
    inputMapping,
    setInputMapping,
    selectTool,
    clearTool,
    addInputMapping,
    updateInputMapping,
    removeInputMapping,
    outputSchema,
    setOutputSchema,
    validation,
    getData,
    getError,
    updateState,
  };
};
