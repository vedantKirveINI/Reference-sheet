import { useState, useCallback, useMemo } from "react";
import { cloneDeep } from "lodash-es";
import { getSearchTemplateById } from "../constants";

const createEmptyFxBlocks = () => ({ type: "fx", blocks: [] });

const normalizeFxBlocks = (value) => {
  if (!value) return createEmptyFxBlocks();
  if (typeof value === "string") {
    return { type: "fx", blocks: [{ type: "PRIMITIVES", value }] };
  }
  if (value.type === "fx" && Array.isArray(value.blocks)) {
    return cloneDeep(value);
  }
  return createEmptyFxBlocks();
};

export const useSearchState = (initialData = {}) => {
  const isNewNode = !initialData.templateId && !initialData.isFromScratch && !initialData.searchQuery;
  const [name, setName] = useState(initialData.name || "");
  const [selectedTemplateId, setSelectedTemplateId] = useState(
    initialData.templateId || null
  );
  const [isFromScratch, setIsFromScratch] = useState(
    initialData.isFromScratch || isNewNode
  );

  const [searchQuery, setSearchQuery] = useState(
    normalizeFxBlocks(initialData.searchQuery)
  );
  const [numberOfResults, setNumberOfResults] = useState(
    normalizeFxBlocks(initialData.numberOfResults || "10")
  );
  const [searchFocus, setSearchFocus] = useState(
    initialData.searchFocus || ""
  );
  const [additionalContext, setAdditionalContext] = useState(
    initialData.additionalContext || ""
  );
  const [outputSchema, setOutputSchema] = useState(
    cloneDeep(initialData.output) || []
  );

  const [touched, setTouched] = useState({
    searchQuery: false,
    numberOfResults: false,
  });

  const markFieldTouched = useCallback((fieldName) => {
    setTouched((prev) => ({ ...prev, [fieldName]: true }));
  }, []);

  const markAllTouched = useCallback(() => {
    setTouched({
      searchQuery: true,
      numberOfResults: true,
    });
  }, []);

  const selectTemplate = useCallback((templateId) => {
    setSelectedTemplateId(templateId);
    setIsFromScratch(false);
  }, []);

  const startFromScratch = useCallback(() => {
    setSelectedTemplateId(null);
    setIsFromScratch(true);
    setTouched({
      searchQuery: false,
      numberOfResults: false,
    });
  }, []);

  const applySelectedTemplate = useCallback((templateIdOverride) => {
    const targetId = templateIdOverride || selectedTemplateId;
    if (targetId) {
      const template = getSearchTemplateById(targetId);
      if (template) {
        if (template.defaultFocus) {
          setSearchFocus(template.defaultFocus);
        }
      }
    }
  }, [selectedTemplateId]);

  const updateSearchQuery = useCallback((blocks) => {
    setSearchQuery({ type: "fx", blocks });
  }, []);

  const updateNumberOfResults = useCallback((blocks) => {
    setNumberOfResults({ type: "fx", blocks });
  }, []);

  const updateOutputSchema = useCallback((schema) => {
    setOutputSchema(schema);
  }, []);

  const hasInitialised = selectedTemplateId !== null || isFromScratch;

  const validation = useMemo(() => {
    const errors = {};
    const touchedErrors = {};

    if (!searchQuery?.blocks?.length) {
      errors.searchQuery = "Search query is required";
      if (touched.searchQuery) {
        touchedErrors.searchQuery = "Search query is required";
      }
    }

    if (!numberOfResults?.blocks?.length) {
      errors.numberOfResults = "Number of results is required";
      if (touched.numberOfResults) {
        touchedErrors.numberOfResults = "Number of results is required";
      }
    }

    const isValid = Object.keys(errors).length === 0;

    return {
      isValid,
      errors,
      touchedErrors,
    };
  }, [searchQuery, numberOfResults, touched]);

  const getData = useCallback(() => {
    return {
      name,
      templateId: selectedTemplateId,
      isFromScratch,
      searchQuery,
      numberOfResults,
      searchFocus,
      additionalContext,
      output: outputSchema,
    };
  }, [
    name,
    selectedTemplateId,
    isFromScratch,
    searchQuery,
    numberOfResults,
    searchFocus,
    additionalContext,
    outputSchema,
  ]);

  const getError = useCallback(() => {
    return validation.errors;
  }, [validation.errors]);

  return {
    name,
    setName,
    selectedTemplateId,
    isFromScratch,
    searchQuery,
    numberOfResults,
    searchFocus,
    setSearchFocus,
    additionalContext,
    setAdditionalContext,
    outputSchema,
    touched,
    markFieldTouched,
    markAllTouched,
    selectTemplate,
    startFromScratch,
    applySelectedTemplate,
    updateSearchQuery,
    updateNumberOfResults,
    updateOutputSchema,
    hasInitialised,
    validation,
    getData,
    getError,
  };
};
