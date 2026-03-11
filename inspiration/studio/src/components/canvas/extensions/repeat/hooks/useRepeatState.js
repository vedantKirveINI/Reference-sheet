import { useState, useCallback, useMemo } from "react";
import { REPEAT_COUNT_MIN, REPEAT_COUNT_MAX } from "../constants";

export const useRepeatState = (initialData = {}) => {
  const [repeatCount, setRepeatCount] = useState(
    initialData.repeatCount !== undefined && initialData.repeatCount !== null
      ? initialData.repeatCount
      : 5
  );
  const [outputSchema, setOutputSchema] = useState(
    initialData.output?.schema ?? initialData.output_schema ?? null
  );

  const updateState = useCallback((updates) => {
    if (updates.repeatCount !== undefined) {
      setRepeatCount(updates.repeatCount);
    }
    if (updates.output?.schema !== undefined) setOutputSchema(updates.output.schema);
    else if (updates.outputSchema !== undefined) setOutputSchema(updates.outputSchema);
  }, []);

  const validation = useMemo(() => {
    const errors = [];
    if (!repeatCount || repeatCount < REPEAT_COUNT_MIN) {
      errors.push("Enter how many times to repeat");
    } else if (repeatCount > REPEAT_COUNT_MAX) {
      errors.push(`Repeat count cannot exceed ${REPEAT_COUNT_MAX}`);
    }
    return {
      isValid: errors.length === 0,
      errors,
    };
  }, [repeatCount]);

  const getData = useCallback(() => {
    return {
      loopMode: "count",
      repeatCount,
      output: { schema: outputSchema },
      modeBadge: `${repeatCount}× repeat`,
    };
  }, [repeatCount, outputSchema]);

  const getError = useCallback(() => {
    return validation.errors;
  }, [validation]);

  return {
    repeatCount,
    outputSchema,
    setOutputSchema,
    updateState,
    validation,
    getData,
    getError,
  };
};
