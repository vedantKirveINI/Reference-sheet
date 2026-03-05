import { useState, useCallback, useMemo } from "react";
import { getDefaultCondition } from "../utils/utils";

const getDefaultStatements = () => [
  {
    id: Date.now(),
    type: "if",
    logicType: "AND",
    conditions: [getDefaultCondition()],
    groups: [],
    isAdvanced: false,
  },
  { id: Date.now() + 5, type: "else" },
];

export const useIfElseV2State = (initialData) => {
  const [statements, setStatements] = useState(() => {
    if (initialData?.conditions?.length > 0) {
      return initialData.conditions;
    }
    return getDefaultStatements();
  });
  const [name, setName] = useState(initialData?.name || "");
  const [outputSchema, setOutputSchema] = useState(
    initialData?.output?.schema || null
  );

  const addElseIf = useCallback(() => {
    setStatements((prev) => [
      ...prev.slice(0, -1),
      {
        id: Date.now(),
        type: "else-if",
        logicType: "AND",
        conditions: [getDefaultCondition()],
        groups: [],
        isAdvanced: false,
      },
      prev[prev.length - 1],
    ]);
  }, []);

  const updateStatement = useCallback((index, newStatement) => {
    setStatements((prev) => {
      const next = [...prev];
      next[index] = { ...newStatement };
      return next;
    });
  }, []);

  const deleteStatement = useCallback((index) => {
    setStatements((prev) => {
      const next = [...prev];
      next.splice(index, 1);
      return next;
    });
  }, []);

  const updateAction = useCallback((statementIndex, action) => {
    setStatements((prev) => {
      const next = [...prev];
      next[statementIndex] = {
        ...next[statementIndex],
        action: !action
          ? next[statementIndex].action || null
          : action,
      };
      return next;
    });
  }, []);

  const validation = useMemo(() => {
    const errors = [];
    let isValid = true;

    const ifStatements = statements.filter((s) => s.type !== "else");
    for (const statement of ifStatements) {
      if (!statement.conditions || statement.conditions.length === 0) {
        errors.push("Each condition block must have at least one condition");
        isValid = false;
        break;
      }
      for (const condition of statement.conditions) {
        if (!condition.variable) {
          errors.push("Select a variable for each condition");
          isValid = false;
          break;
        }
        if (
          condition.operation?.valueInputs?.length > 0 &&
          (!condition.value || condition.value.length === 0)
        ) {
          errors.push("Set a value for each condition");
          isValid = false;
          break;
        }
      }
      if (!isValid) break;
    }

    return { isValid, errors };
  }, [statements]);

  const getData = useCallback(() => {
    return {
      conditions: statements,
      name,
      output: { schema: outputSchema },
    };
  }, [statements, name, outputSchema]);

  const getError = useCallback(() => {
    return validation.isValid ? undefined : validation.errors;
  }, [validation]);

  const updateState = useCallback((updates) => {
    if (updates.name !== undefined) {
      setName(updates.name);
    }
  }, []);

  return {
    statements,
    setStatements,
    name,
    addElseIf,
    updateStatement,
    deleteStatement,
    updateAction,
    validation,
    getData,
    getError,
    updateState,
    outputSchema,
    setOutputSchema,
  };
};
