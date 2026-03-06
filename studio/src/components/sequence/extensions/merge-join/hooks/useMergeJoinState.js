import { useState, useCallback, useMemo } from "react";

export const useMergeJoinState = (initialData = {}) => {
  const [name, setName] = useState(initialData.name || "Merge");
  const [mergeType, setMergeType] = useState(initialData.mergeType || "wait_for_all");
  const [outputSchema, setOutputSchema] = useState(initialData.output_schema || null);

  const updateState = useCallback((updates) => {
    if (updates.name !== undefined) setName(updates.name);
    if (updates.mergeType !== undefined) setMergeType(updates.mergeType);
  }, []);

  const validation = useMemo(() => {
    const errors = [];
    return {
      isValid: errors.length === 0,
      errors,
    };
  }, []);

  const getData = useCallback(() => {
    return {
      name,
      mergeType,
      output_schema: outputSchema,
    };
  }, [name, mergeType, outputSchema]);

  const getError = useCallback(() => {
    return validation.errors;
  }, [validation]);

  return {
    name,
    setName,
    mergeType,
    setMergeType,
    outputSchema,
    setOutputSchema,
    validation,
    getData,
    getError,
    updateState,
  };
};
