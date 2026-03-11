import { useState, useCallback, useMemo } from "react";

const createEmptyAggregateField = () => ({
  key: "",
  value: { type: "fx", blocks: [{ type: "PRIMITIVES", value: "" }] },
  operation: "sum",
});

export const useLoopEndState = (initialData = {}) => {
  const [name, setName] = useState(initialData.name || "Loop End");
  const [source, setSource] = useState(initialData.source || null);
  const [mapping, setMapping] = useState(
    initialData.mapping || { type: "fx", blocks: [{ type: "PRIMITIVES", value: "" }] }
  );
  const [outputSchema, setOutputSchema] = useState(
    initialData.output?.schema ?? initialData.output_schema ?? null
  );
  const [resultMode, setResultMode] = useState(
    initialData.resultMode === "first_match" || initialData.resultMode === "flatten"
      ? "collect_all"
      : initialData.resultMode || "collect_all"
  );
  const [aggregateFields, setAggregateFields] = useState(
    initialData.aggregateFields || [createEmptyAggregateField()]
  );
  const [outputFields, setOutputFields] = useState(initialData.outputFields || []);

  const addAggregateField = useCallback(() => {
    setAggregateFields((prev) => [...prev, createEmptyAggregateField()]);
  }, []);

  const removeAggregateField = useCallback((index) => {
    setAggregateFields((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  const updateAggregateFieldKey = useCallback((index, key) => {
    setAggregateFields((prev) =>
      prev.map((field, i) => (i === index ? { ...field, key } : field))
    );
  }, []);

  const updateAggregateFieldValue = useCallback((index, blocks) => {
    setAggregateFields((prev) =>
      prev.map((field, i) =>
        i === index ? { ...field, value: { type: "fx", blocks } } : field
      )
    );
  }, []);

  const updateAggregateFieldOperation = useCallback((index, operation) => {
    setAggregateFields((prev) =>
      prev.map((field, i) => (i === index ? { ...field, operation } : field))
    );
  }, []);

  const handleOutputFieldsChange = useCallback((data) => {
    setOutputFields(data);
  }, []);

  const updateState = useCallback((updates) => {
    if (updates.name !== undefined) setName(updates.name);
    if (updates.source !== undefined) setSource(updates.source);
    if (updates.mapping !== undefined) setMapping(updates.mapping);
    if (updates.output?.schema !== undefined) setOutputSchema(updates.output.schema);
    else if (updates.output_schema !== undefined) setOutputSchema(updates.output_schema);
    if (updates.resultMode !== undefined) setResultMode(updates.resultMode);
    if (updates.aggregateFields !== undefined) setAggregateFields(updates.aggregateFields);
    if (updates.outputFields !== undefined) setOutputFields(updates.outputFields);
  }, []);

  const hasOutputFields = useCallback((fields) => {
    if (!fields || !Array.isArray(fields)) return false;
    if (fields.length === 0) return false;
    // Handle wrapped format from InputGridV3: [{ type: 'Object', value: [...] }]
    const innerFields = fields[0]?.value || fields[0]?.schema || fields;
    if (!Array.isArray(innerFields)) return false;
    return innerFields.some((f) => f.key && f.key.trim() !== "");
  }, []);

  const hasFormulaContent = useCallback((formulaValue) => {
    if (!formulaValue || !formulaValue.blocks) return false;
    return formulaValue.blocks.some(
      (block) => block.value && block.value.toString().trim() !== ""
    );
  }, []);

  const validation = useMemo(() => {
    const errors = [];

    switch (resultMode) {
      case "collect_all":
        if (!hasOutputFields(outputFields)) {
          errors.push("Define at least one field for your result object");
        }
        break;
      case "aggregate":
        if (!aggregateFields.some((f) => f.key.trim() !== "" && hasFormulaContent(f.value))) {
          errors.push("Add at least one calculation with a name and a value");
        }
        break;
      case "no_output":
        break;
      default:
        break;
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }, [resultMode, aggregateFields, outputFields, hasFormulaContent, hasOutputFields]);

  const getData = useCallback(() => {
    const base = {
      name,
      mapping,
      output: { schema: outputSchema },
      resultMode,
    };

    switch (resultMode) {
      case "collect_all":
        return { ...base, outputFields };
      case "aggregate":
        return { ...base, aggregateFields };
      case "no_output":
        return base;
      default:
        return base;
    }
  }, [name, mapping, outputSchema, resultMode, aggregateFields, outputFields]);

  const getError = useCallback(() => {
    return validation.errors;
  }, [validation]);

  return {
    name,
    setName,
    source,
    setSource,
    mapping,
    setMapping,
    outputSchema,
    setOutputSchema,
    resultMode,
    setResultMode,
    aggregateFields,
    setAggregateFields,
    addAggregateField,
    removeAggregateField,
    updateAggregateFieldKey,
    updateAggregateFieldValue,
    updateAggregateFieldOperation,
    outputFields,
    setOutputFields,
    handleOutputFieldsChange,
    validation,
    getData,
    getError,
    updateState,
  };
};
