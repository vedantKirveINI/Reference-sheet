import { useState, useCallback, useMemo } from "react";
import { WEBHOOK_TEMPLATES, getDefaultState } from "../constants";

export const useWebhookState = (initialData = {}) => {
  const isNewNode = !initialData._templateId && !initialData._isFromScratch && !initialData.webhookUrl;
  const [state, setState] = useState(() => ({
    ...getDefaultState(),
    ...initialData,
    _isFromScratch: initialData._isFromScratch || isNewNode,
  }));

  const hasInitialised = Boolean(
    state._templateId || state._isFromScratch || initialData.webhookUrl
  );

  const selectTemplate = useCallback((templateId) => {
    const template = WEBHOOK_TEMPLATES.find((t) => t.id === templateId);
    if (template) {
      setState((prev) => ({
        ...prev,
        ...template.defaults,
        _templateId: templateId,
        _isFromScratch: false,
      }));
    }
  }, []);

  const startFromScratch = useCallback(() => {
    setState((prev) => ({
      ...prev,
      _templateId: null,
      _isFromScratch: true,
    }));
  }, []);

  const updateState = useCallback((updates) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  const setOutputSchema = useCallback((schema) => {
    setState((prev) => ({ ...prev, output_schema: schema }));
  }, []);

  const validation = useMemo(() => {
    const errors = [];

    if (state.verifySignature && !state.signatureSecret) {
      errors.push("Signature secret is required when verification is enabled");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }, [state.verifySignature, state.signatureSecret]);

  const getData = useCallback(() => {
    return { ...state };
  }, [state]);

  const getError = useCallback(() => {
    return validation.errors;
  }, [validation]);

  return {
    ...state,
    hasInitialised,
    selectTemplate,
    startFromScratch,
    updateState,
    setOutputSchema,
    validation,
    getData,
    getError,
  };
};
