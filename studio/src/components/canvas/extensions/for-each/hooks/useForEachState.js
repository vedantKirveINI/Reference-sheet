import { useState, useCallback, useMemo } from "react";

export const useForEachState = (initialData = {}) => {
  const [name, setName] = useState(initialData.name || "");
  const [listSource, setListSource] = useState(
    initialData.listSource || { type: "fx", blocks: [{ type: "PRIMITIVES", value: "" }] }
  );
  const [outputSchema, setOutputSchema] = useState(
    initialData.output?.schema ?? initialData.output_schema ?? null
  );

  const updateState = useCallback((updates) => {
    if (updates.name !== undefined) setName(updates.name);
    if (updates.listSource !== undefined) setListSource(updates.listSource);
    if (updates.output?.schema !== undefined) setOutputSchema(updates.output.schema);
    else if (updates.outputSchema !== undefined) setOutputSchema(updates.outputSchema);
  }, []);

  const validation = useMemo(() => {
    const errors = [];
    const hasContent = listSource?.blocks?.some(
      (block) => (block.value && block.value.trim() !== "") || block.type !== "PRIMITIVES"
    );
    if (!hasContent) {
      errors.push("Choose a list to loop over");
    }
    return {
      isValid: errors.length === 0,
      errors,
    };
  }, [listSource]);

  const getData = useCallback(() => {
    return {
      name,
      loopMode: "list",
      listSource,
      output: { schema: outputSchema },
      modeBadge: "For Each",
    };
  }, [name, listSource, outputSchema]);

  const getError = useCallback(() => {
    return validation.errors;
  }, [validation]);

  return {
    name,
    setName,
    listSource,
    setListSource,
    outputSchema,
    setOutputSchema,
    updateState,
    validation,
    getData,
    getError,
  };
};
