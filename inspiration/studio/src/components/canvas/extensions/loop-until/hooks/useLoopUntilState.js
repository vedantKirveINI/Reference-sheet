import { useState, useCallback, useMemo } from "react";

export const useLoopUntilState = (initialData = {}) => {
  const [name, setName] = useState(initialData.name || "");
  const [conditionField, setConditionField] = useState(initialData.conditionField || { type: "fx", blocks: [{ type: "PRIMITIVES", value: "" }] });
  const [conditionOperator, setConditionOperator] = useState(initialData.conditionOperator || "equals");
  const [conditionValue, setConditionValue] = useState(initialData.conditionValue || { type: "fx", blocks: [{ type: "PRIMITIVES", value: "" }] });
  const [maxIterations, setMaxIterations] = useState(initialData.maxIterations || 100);
  const [outputSchema, setOutputSchema] = useState(
    initialData.output?.schema ?? initialData.output_schema ?? null
  );

  const updateState = useCallback((updates) => {
    if (updates.name !== undefined) setName(updates.name);
    if (updates.conditionField !== undefined) setConditionField(updates.conditionField);
    if (updates.conditionOperator !== undefined) setConditionOperator(updates.conditionOperator);
    if (updates.conditionValue !== undefined) setConditionValue(updates.conditionValue);
    if (updates.maxIterations !== undefined) setMaxIterations(updates.maxIterations);
    if (updates.output?.schema !== undefined) setOutputSchema(updates.output.schema);
    else if (updates.outputSchema !== undefined) setOutputSchema(updates.outputSchema);
  }, []);

  const hasFormulaContent = useCallback((formulaValue) => {
    if (!formulaValue || !formulaValue.blocks) return false;
    return formulaValue.blocks.some(
      (block) => (block.value && block.value.toString().trim() !== "") || block.type !== "PRIMITIVES"
    );
  }, []);

  const validation = useMemo(() => {
    const errors = [];
    if (!hasFormulaContent(conditionField)) {
      errors.push("Pick a value to check each time");
    }
    if (!["is_true", "is_false", "exists", "not_exists"].includes(conditionOperator)) {
      if (!hasFormulaContent(conditionValue)) {
        errors.push("Pick a value to compare against");
      }
    }
    return {
      isValid: errors.length === 0,
      errors,
    };
  }, [conditionField, conditionOperator, conditionValue, hasFormulaContent]);

  const getData = useCallback(() => {
    return {
      name,
      loopMode: "condition",
      conditionField,
      conditionOperator,
      conditionValue,
      maxIterations,
      output: { schema: outputSchema },
      modeBadge: "Until condition",
    };
  }, [name, conditionField, conditionOperator, conditionValue, maxIterations, outputSchema]);

  const getError = useCallback(() => {
    return validation.errors;
  }, [validation]);

  return {
    name,
    setName,
    conditionField,
    conditionOperator,
    conditionValue,
    maxIterations,
    outputSchema,
    setOutputSchema,
    updateState,
    validation,
    getData,
    getError,
  };
};
