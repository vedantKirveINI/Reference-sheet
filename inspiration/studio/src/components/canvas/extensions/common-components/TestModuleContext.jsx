import React, { createContext, useContext, useReducer, useCallback, useMemo } from "react";

const TestModuleContext = createContext(null);

const TEST_STATUS = {
  IDLE: "idle",
  INPUT: "input",
  PROCESSING: "processing",
  COMPLETE: "complete",
  ERROR: "error",
};

const initialState = {
  status: TEST_STATUS.IDLE,
  inputs: {},
  outputs: null,
  executionInput: null,
  executionOutput: null,
  executionTime: null,
  validationErrors: [],
  hasPersistedData: false,
};

const testModuleReducer = (state, action) => {
  switch (action.type) {
    case "SET_STATUS":
      return { ...state, status: action.payload };
    case "SET_INPUT_VALUE":
      return {
        ...state,
        inputs: { ...state.inputs, [action.payload.key]: action.payload.value },
      };
    case "SET_INPUTS":
      return { ...state, inputs: action.payload };
    case "SET_OUTPUTS":
      return { ...state, outputs: action.payload };
    case "SET_EXECUTION_INPUT":
      return { ...state, executionInput: action.payload };
    case "SET_EXECUTION_OUTPUT":
      return { ...state, executionOutput: action.payload };
    case "SET_EXECUTION_TIME":
      return { ...state, executionTime: action.payload };
    case "SET_VALIDATION_ERRORS":
      return { ...state, validationErrors: action.payload };
    case "SET_HAS_PERSISTED_DATA":
      return { ...state, hasPersistedData: action.payload };
    case "RESET":
      return { ...initialState };
    case "RESET_RESULTS":
      return {
        ...state,
        outputs: null,
        executionInput: null,
        executionOutput: null,
        executionTime: null,
        status: TEST_STATUS.IDLE,
      };
    default:
      return state;
  }
};

export const TestModuleProvider = ({
  children,
  nodeKey,
  onValidateBeforeTest,
  persistTestData = true,
}) => {
  const [state, dispatch] = useReducer(testModuleReducer, initialState);

  const setStatus = useCallback((status) => {
    dispatch({ type: "SET_STATUS", payload: status });
  }, []);

  const setInputValue = useCallback((key, value) => {
    dispatch({ type: "SET_INPUT_VALUE", payload: { key, value } });
  }, []);

  const setInputs = useCallback((inputs) => {
    dispatch({ type: "SET_INPUTS", payload: inputs });
  }, []);

  const setOutputs = useCallback((outputs) => {
    dispatch({ type: "SET_OUTPUTS", payload: outputs });
  }, []);

  const setExecutionInput = useCallback((input) => {
    dispatch({ type: "SET_EXECUTION_INPUT", payload: input });
  }, []);

  const setExecutionOutput = useCallback((output) => {
    dispatch({ type: "SET_EXECUTION_OUTPUT", payload: output });
  }, []);

  const setExecutionTime = useCallback((time) => {
    dispatch({ type: "SET_EXECUTION_TIME", payload: time });
  }, []);

  const setValidationErrors = useCallback((errors) => {
    dispatch({ type: "SET_VALIDATION_ERRORS", payload: errors });
  }, []);

  const setHasPersistedData = useCallback((hasData) => {
    dispatch({ type: "SET_HAS_PERSISTED_DATA", payload: hasData });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: "RESET" });
  }, []);

  const resetResults = useCallback(() => {
    dispatch({ type: "RESET_RESULTS" });
  }, []);

  const validate = useCallback(() => {
    if (onValidateBeforeTest) {
      const result = onValidateBeforeTest(state.inputs);
      if (!result.valid) {
        setValidationErrors(result.errors || ["Validation failed"]);
        return false;
      }
    }
    setValidationErrors([]);
    return true;
  }, [onValidateBeforeTest, state.inputs, setValidationErrors]);

  const persistInputs = useCallback(() => {
    if (persistTestData && nodeKey) {
      try {
        const storageKey = `test_inputs_${nodeKey}`;
        localStorage.setItem(storageKey, JSON.stringify(state.inputs));
      } catch (e) {
      }
    }
  }, [persistTestData, nodeKey, state.inputs]);

  const loadPersistedInputs = useCallback(() => {
    if (persistTestData && nodeKey) {
      try {
        const storageKey = `test_inputs_${nodeKey}`;
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          const parsed = JSON.parse(stored);
          setInputs(parsed);
          setHasPersistedData(true);
          return parsed;
        }
      } catch (e) {
      }
    }
    return null;
  }, [persistTestData, nodeKey, setInputs, setHasPersistedData]);

  const clearPersistedInputs = useCallback(() => {
    if (nodeKey) {
      try {
        const storageKey = `test_inputs_${nodeKey}`;
        localStorage.removeItem(storageKey);
        setHasPersistedData(false);
      } catch (e) {
      }
    }
  }, [nodeKey, setHasPersistedData]);

  const hasInputs = useMemo(() => {
    return Object.keys(state.inputs).length > 0;
  }, [state.inputs]);

  const isValid = useMemo(() => {
    return state.validationErrors.length === 0;
  }, [state.validationErrors]);

  const value = useMemo(
    () => ({
      ...state,
      TEST_STATUS,
      setStatus,
      setInputValue,
      setInputs,
      setOutputs,
      setExecutionInput,
      setExecutionOutput,
      setExecutionTime,
      setValidationErrors,
      reset,
      resetResults,
      validate,
      persistInputs,
      loadPersistedInputs,
      clearPersistedInputs,
      hasInputs,
      isValid,
    }),
    [
      state,
      setStatus,
      setInputValue,
      setInputs,
      setOutputs,
      setExecutionInput,
      setExecutionOutput,
      setExecutionTime,
      setValidationErrors,
      reset,
      resetResults,
      validate,
      persistInputs,
      loadPersistedInputs,
      clearPersistedInputs,
      hasInputs,
      isValid,
    ]
  );

  return (
    <TestModuleContext.Provider value={value}>
      {children}
    </TestModuleContext.Provider>
  );
};

export const useTestModule = () => {
  const context = useContext(TestModuleContext);
  if (!context) {
    throw new Error("useTestModule must be used within a TestModuleProvider");
  }
  return context;
};

export { TEST_STATUS };
export default TestModuleContext;
