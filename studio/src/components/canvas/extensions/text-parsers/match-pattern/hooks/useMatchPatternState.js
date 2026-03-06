import { useState, useCallback, useMemo } from "react";

export const hasPatternContent = (pattern) => {
  if (!pattern) return false;
  if (pattern.blocks && Array.isArray(pattern.blocks)) {
    return pattern.blocks.some(
      (b) => (b.value != null && b.value !== "") || (b.text != null && b.text !== "")
    );
  }
  return false;
};

export const useMatchPatternState = (initialData = {}) => {
  const [globalMatch, setGlobalMatch] = useState(
    initialData?.globalMatch ?? false
  );
  const [caseSensitive, setCaseSensitive] = useState(
    initialData?.caseSensitive ?? false
  );
  const [multiline, setMultiline] = useState(initialData?.multiline ?? false);
  const [singleline, setSingleline] = useState(
    initialData?.singleline ?? false
  );
  const [continueExecutionIfNoMatch, setContinueExecutionIfNoMatch] =
    useState(initialData?.continueExecutionIfNoMatch ?? false);
  const [pattern, setPattern] = useState(initialData?.pattern ?? { type: "fx", blocks: [] });
  const [text, setText] = useState(initialData?.text ?? { type: "fx", blocks: [] });
  const [selectedTemplateId, setSelectedTemplateId] = useState(
    initialData?.selectedTemplateId ?? null
  );

  const validation = useMemo(() => {
    const hasPattern = hasPatternContent(pattern);
    return {
      isValid: hasPattern,
      hasPattern,
    };
  }, [pattern]);

  const getData = useCallback(() => {
    return {
      globalMatch,
      caseSensitive,
      multiline,
      singleline,
      continueExecutionIfNoMatch,
      pattern,
      text,
      selectedTemplateId,
    };
  }, [
    globalMatch,
    caseSensitive,
    multiline,
    singleline,
    continueExecutionIfNoMatch,
    pattern,
    text,
    selectedTemplateId,
  ]);

  const getError = useCallback(() => {
    if (!validation.isValid) {
      return { pattern: ["Pattern is required to run test"] };
    }
    return {};
  }, [validation.isValid]);

  const updateState = useCallback((updates) => {
    if (updates.globalMatch !== undefined) setGlobalMatch(updates.globalMatch);
    if (updates.caseSensitive !== undefined)
      setCaseSensitive(updates.caseSensitive);
    if (updates.multiline !== undefined) setMultiline(updates.multiline);
    if (updates.singleline !== undefined) setSingleline(updates.singleline);
    if (updates.continueExecutionIfNoMatch !== undefined)
      setContinueExecutionIfNoMatch(updates.continueExecutionIfNoMatch);
    if (updates.pattern !== undefined) setPattern(updates.pattern);
    if (updates.text !== undefined) setText(updates.text);
    if (updates.selectedTemplateId !== undefined)
      setSelectedTemplateId(updates.selectedTemplateId);
  }, []);

  return {
    globalMatch,
    setGlobalMatch,
    caseSensitive,
    setCaseSensitive,
    multiline,
    setMultiline,
    singleline,
    setSingleline,
    continueExecutionIfNoMatch,
    setContinueExecutionIfNoMatch,
    pattern,
    setPattern,
    text,
    setText,
    selectedTemplateId,
    setSelectedTemplateId,
    validation,
    getData,
    getError,
    updateState,
  };
};
