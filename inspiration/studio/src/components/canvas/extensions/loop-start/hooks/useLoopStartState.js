import { useState, useCallback, useMemo } from "react";
import { LOOP_MODES } from "../constants";

export const useLoopStartState = (initialData = {}) => {
  const [name, setName] = useState(initialData.name || "");
  const [loopMode, setLoopMode] = useState(initialData.loopMode || LOOP_MODES.LIST);

  const [listSource, setListSource] = useState(
    initialData.listSource || { type: "fx", blocks: [{ type: "PRIMITIVES", value: "" }] }
  );

  const [repeatCount, setRepeatCount] = useState(initialData.repeatCount || 5);

  const [conditionField, setConditionField] = useState(initialData.conditionField || "");
  const [conditionOperator, setConditionOperator] = useState(initialData.conditionOperator || "equals");
  const [conditionValue, setConditionValue] = useState(initialData.conditionValue || "");
  const [maxIterations, setMaxIterations] = useState(initialData.maxIterations || 100);

  const [outputSchema, setOutputSchema] = useState(initialData.output_schema || null);

  const updateState = useCallback((updates) => {
    if (updates.name !== undefined) setName(updates.name);
    if (updates.loopMode !== undefined) setLoopMode(updates.loopMode);
    if (updates.listSource !== undefined) setListSource(updates.listSource);
    if (updates.repeatCount !== undefined) setRepeatCount(updates.repeatCount);
    if (updates.conditionField !== undefined) setConditionField(updates.conditionField);
    if (updates.conditionOperator !== undefined) setConditionOperator(updates.conditionOperator);
    if (updates.conditionValue !== undefined) setConditionValue(updates.conditionValue);
    if (updates.maxIterations !== undefined) setMaxIterations(updates.maxIterations);
    if (updates.outputSchema !== undefined) setOutputSchema(updates.outputSchema);
  }, []);

  const validation = useMemo(() => {
    const errors = [];

    if (loopMode === LOOP_MODES.LIST) {
      const hasContent = listSource?.blocks?.some(
        (block) => (block.value && block.value.trim() !== "") || block.type !== "PRIMITIVES"
      );
      if (!hasContent) {
        errors.push("Choose a list to loop over");
      }
    }

    if (loopMode === LOOP_MODES.COUNT) {
      if (!repeatCount || repeatCount < 1) {
        errors.push("Enter how many times to repeat");
      }
    }

    if (loopMode === LOOP_MODES.CONDITION) {
      if (!conditionField || conditionField.trim() === "") {
        errors.push("Enter a field to check");
      }
      if (!["is_true", "is_false", "exists", "not_exists"].includes(conditionOperator)) {
        if (!conditionValue || conditionValue.trim() === "") {
          errors.push("Enter a value to compare against");
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }, [loopMode, listSource, repeatCount, conditionField, conditionOperator, conditionValue]);

  const getModeBadge = useCallback(() => {
    switch (loopMode) {
      case LOOP_MODES.LIST: return "Over list";
      case LOOP_MODES.COUNT: return `${repeatCount}× repeat`;
      case LOOP_MODES.CONDITION: return "Until condition";
      default: return "";
    }
  }, [loopMode, repeatCount]);

  const getData = useCallback(() => {
    return {
      name,
      loopMode,
      listSource,
      repeatCount,
      conditionField,
      conditionOperator,
      conditionValue,
      maxIterations,
      output_schema: outputSchema,
      modeBadge: getModeBadge(),
    };
  }, [name, loopMode, listSource, repeatCount, conditionField, conditionOperator, conditionValue, maxIterations, outputSchema, getModeBadge]);

  const getError = useCallback(() => {
    return validation.errors;
  }, [validation]);

  return {
    name,
    setName,
    loopMode,
    listSource,
    setListSource,
    repeatCount,
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
    getModeBadge,
  };
};
