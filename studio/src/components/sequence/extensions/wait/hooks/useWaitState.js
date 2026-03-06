import { useState, useCallback, useMemo } from "react";
import { DEFAULT_WAIT_STATE, WAIT_TYPES } from "../constants";

export function useWaitState(initialData = {}) {
  const [state, setState] = useState(() => ({
    ...DEFAULT_WAIT_STATE,
    ...initialData,
  }));

  const updateState = useCallback((updates) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  const validation = useMemo(() => {
    const errors = [];

    if (state.waitType === WAIT_TYPES.DURATION) {
      if (!state.durationValue || state.durationValue < 1) {
        errors.push("Duration must be at least 1");
      }
      if (!state.durationUnit) {
        errors.push("Please select a duration unit");
      }
    } else if (state.waitType === WAIT_TYPES.UNTIL) {
      if (!state.untilDate) {
        errors.push("Please select a date");
      }
    } else if (state.waitType === WAIT_TYPES.UNTIL_BEFORE) {
      if (!state.beforeValue || state.beforeValue < 1) {
        errors.push("Duration before must be at least 1");
      }
      if (!state.beforeUnit) {
        errors.push("Please select a duration unit");
      }
      if (!state.referenceDate) {
        errors.push("Please specify a reference date field");
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }, [state]);

  const getData = useCallback(() => {
    return {
      name: state.name,
      waitType: state.waitType,
      durationValue: state.durationValue,
      durationUnit: state.durationUnit,
      untilDate: state.untilDate,
      untilTime: state.untilTime,
      beforeValue: state.beforeValue,
      beforeUnit: state.beforeUnit,
      referenceDate: state.referenceDate,
      excludeWeekends: state.excludeWeekends,
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
