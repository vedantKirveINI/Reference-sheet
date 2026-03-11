import { useState, useCallback, useMemo } from "react";
import { DEFAULT_LOOP_STATE, LOOP_TYPES } from "../constants";

export function useLoopState(initialData = {}) {
  const [state, setState] = useState(() => ({
    ...DEFAULT_LOOP_STATE,
    ...initialData,
  }));

  const updateState = useCallback((updates) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  const validation = useMemo(() => {
    const errors = [];

    if (state.loopType === LOOP_TYPES.COUNT) {
      if (!state.iterationCount || state.iterationCount < 1) {
        errors.push("Iteration count must be at least 1");
      }
      if (state.iterationCount > state.maxIterations) {
        errors.push(`Maximum iterations is ${state.maxIterations}`);
      }
    } else if (state.loopType === LOOP_TYPES.CONDITION) {
      if (!state.conditionField) {
        errors.push("Please specify a condition field");
      }
    }

    if (!state.intervalValue || state.intervalValue < 1) {
      errors.push("Interval must be at least 1");
    }
    if (!state.intervalUnit) {
      errors.push("Please select an interval unit");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }, [state]);

  const getData = useCallback(() => {
    return {
      name: state.name,
      loopType: state.loopType,
      iterationCount: state.iterationCount,
      conditionField: state.conditionField,
      conditionOperator: state.conditionOperator,
      conditionValue: state.conditionValue,
      intervalValue: state.intervalValue,
      intervalUnit: state.intervalUnit,
      excludeWeekends: state.excludeWeekends,
      maxIterations: state.maxIterations,
      pairedNodeId: state.pairedNodeId,
      timeoutValue: state.timeoutValue,
      timeoutUnit: state.timeoutUnit,
      breakConditionField: state.breakConditionField,
      breakConditionOperator: state.breakConditionOperator,
      breakConditionValue: state.breakConditionValue,
      containerColorId: state.containerColorId,
      containerNote: state.containerNote,
      usePathFollowing: state.usePathFollowing,
    };
  }, [state]);

  const getError = useCallback(() => {
    return validation.errors[0] || null;
  }, [validation]);

  return {
    ...state,
    updateState,
    validation,
    getData,
    getError,
  };
}
