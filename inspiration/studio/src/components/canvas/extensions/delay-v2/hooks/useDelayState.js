import { useState, useCallback, useMemo, useEffect, useRef } from "react";

export const useDelayState = (initialData = {}) => {
  const [name, setName] = useState(initialData.name || "Delay");
  const [delayTime, setDelayTime] = useState(
    initialData.delayTime || { type: "fx", blocks: [{ type: "PRIMITIVES", value: "1000" }] }
  );
  const [outputSchema, setOutputSchema] = useState(initialData.output_schema || null);
  
  const prevInitialDataRef = useRef(initialData);
  
  useEffect(() => {
    const prevData = prevInitialDataRef.current;
    const hasDelayTimeChanged = JSON.stringify(prevData?.delayTime) !== JSON.stringify(initialData?.delayTime);
    const hasNameChanged = prevData?.name !== initialData?.name;
    
    if (hasDelayTimeChanged || hasNameChanged) {
      if (hasNameChanged && initialData.name) {
        setName(initialData.name);
      }
      if (hasDelayTimeChanged && initialData.delayTime) {
        setDelayTime(initialData.delayTime);
      }
      prevInitialDataRef.current = initialData;
    }
  }, [initialData]);

  const updateState = useCallback((updates) => {
    if (updates.name !== undefined) setName(updates.name);
    if (updates.delayTime !== undefined) setDelayTime(updates.delayTime);
  }, []);

  const validation = useMemo(() => {
    const errors = [];
    
    const hasValue = delayTime?.blocks?.some(
      (block) => block.value && block.value.toString().trim() !== ""
    );
    
    if (!hasValue) {
      errors.push("Delay duration is required");
    } else {
      const primitiveBlocks = delayTime?.blocks?.filter(
        (block) => block.type === "PRIMITIVES" && block.value
      );
      const hasInvalidNumber = primitiveBlocks?.some((block) => {
        const num = parseFloat(block.value);
        return isNaN(num) || num < 0;
      });
      
      if (hasInvalidNumber) {
        errors.push("Delay must be a positive number");
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }, [delayTime]);

  const getData = useCallback(() => {
    return {
      name,
      delayTime,
      output_schema: outputSchema,
    };
  }, [name, delayTime, outputSchema]);

  const getError = useCallback(() => {
    return validation.errors;
  }, [validation]);

  return {
    name,
    setName,
    delayTime,
    setDelayTime,
    outputSchema,
    setOutputSchema,
    validation,
    getData,
    getError,
    updateState,
  };
};
