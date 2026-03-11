import { useState, useCallback, useMemo, useEffect } from "react";

const extractVariables = (blocks) => {
  if (!blocks || !Array.isArray(blocks)) return [];

  const variables = [];
  blocks.forEach((block) => {
    if (block.type === "PROPERTY" && block.value) {
      const varName = block.value.replace(/^\{\{|\}\}$/g, "").trim();
      if (varName && !variables.includes(varName)) {
        variables.push(varName);
      }
    }
  });
  return variables;
};

export const useTransformerState = (initialData = {}) => {
  const [name, setName] = useState(initialData.name || "Transformer");
  const [content, setContent] = useState(
    initialData.content || { type: "fx", blocks: [] }
  );
  const [testValues, setTestValues] = useState(initialData.testValues || {});
  const [evaluatedResult, setEvaluatedResult] = useState(null);
  const [evaluationError, setEvaluationError] = useState(null);
  const [outputSchema, setOutputSchema] = useState(() => {
    return structuredClone(initialData.output)
  });


  const detectedVariables = useMemo(() => {
    return extractVariables(content?.blocks);
  }, [content]);

  useEffect(() => {
    setTestValues((prev) => {
      const newTestValues = { ...prev };
      detectedVariables.forEach((varName) => {
        if (!(varName in newTestValues)) {
          newTestValues[varName] = "";
        }
      });
      Object.keys(newTestValues).forEach((key) => {
        if (!detectedVariables.includes(key)) {
          delete newTestValues[key];
        }
      });
      return newTestValues;
    });
  }, [detectedVariables]);

  const updateTestValue = useCallback((varName, value) => {
    setTestValues((prev) => ({
      ...prev,
      [varName]: value,
    }));
  }, []);

  const evaluateExpression = useCallback(() => {
    if (!content?.blocks || content.blocks.length === 0) {
      setEvaluatedResult(null);
      setEvaluationError(null);
      return;
    }

    try {
      let result = "";
      content.blocks.forEach((block) => {
        if (block.type === "PRIMITIVES") {
          result += block.value || "";
        } else if (block.type === "PROPERTY") {
          const varName = block.value?.replace(/^\{\{|\}\}$/g, "").trim();
          if (varName && testValues[varName] !== undefined && testValues[varName] !== "") {
            result += testValues[varName];
          } else {
            result += block.value || "";
          }
        } else if (block.value) {
          result += block.value;
        }
      });

      setEvaluatedResult(result);
      setEvaluationError(null);
    } catch (error) {
      setEvaluationError(error.message);
      setEvaluatedResult(null);
    }
  }, [content, testValues]);

  useEffect(() => {
    evaluateExpression();
  }, [evaluateExpression]);

  const updateState = useCallback((updates) => {
    if (updates.name !== undefined) setName(updates.name);
    if (updates.content !== undefined) setContent(updates.content);
  }, []);

  const updateOutputSchema = useCallback((schema) => {
    setOutputSchema({ schema })
  }, []);

  const validation = useMemo(() => {
    const errors = [];

    const hasValue = content?.blocks?.some(
      (block) => block.value && block.value.toString().trim() !== ""
    );

    if (!hasValue) {
      errors.push("Transformation expression is required");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }, [content]);

  const getData = useCallback(() => {
    return {
      name,
      content,
      testValues,
      output: outputSchema,
    };
  }, [name, content, testValues, outputSchema]);

  const getError = useCallback(() => {
    return validation.errors;
  }, [validation]);

  return {
    name,
    setName,
    content,
    setContent,
    testValues,
    updateTestValue,
    detectedVariables,
    evaluatedResult,
    evaluationError,
    outputSchema,
    updateOutputSchema,
    validation,
    getData,
    getError,
    updateState,
  };
};
