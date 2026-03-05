import { useState, useCallback } from "react";
import { SKIP_TYPE } from "../../constants/types";

export const useSkipState = (initialData = {}) => {
  const [name, setName] = useState(initialData.name || "");

  const updateState = useCallback((updates) => {
    if (updates.name !== undefined) setName(updates.name);
  }, []);

  const getData = useCallback(() => {
    return {
      type: SKIP_TYPE,
      name,
    };
  }, [name]);

  const getError = useCallback(() => {
    return [];
  }, []);

  return {
    name,
    setName,
    updateState,
    getData,
    getError,
  };
};
