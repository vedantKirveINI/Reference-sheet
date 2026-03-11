import { useState, useCallback, useMemo } from "react";
import { cloneDeep } from "lodash-es";
import {
  CONFIGURE_FIELDS,
  getCompanyTemplateById,
} from "../constants";

const createEmptyFxBlocks = () => ({
  type: "fx",
  blocks: [{ type: "PRIMITIVES", value: "" }],
});

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

const hasValidInput = (fxValue) => {
  if (!fxValue?.blocks || !Array.isArray(fxValue.blocks)) return false;
  return fxValue.blocks.some((block) => {
    if (block.type === "PRIMITIVES") {
      return block.value && block.value.trim() !== "";
    }
    return block.type && block.type !== "PRIMITIVES";
  });
};

export const useCompanyEnrichmentState = (initialData = {}) => {
  const isNewNode =
    !initialData._templateId &&
    !initialData._isFromScratch &&
    !initialData.domain;
  const [name, setName] = useState(initialData.name || "Company Enrichment");
  const [domain, setDomain] = useState(normalizeFxBlocks(initialData.domain));
  const [selectedTemplateId, setSelectedTemplateId] = useState(
    initialData._templateId || null,
  );
  const [isFromScratch, setIsFromScratch] = useState(
    initialData._isFromScratch || isNewNode,
  );
  const [outputSchema, setOutputSchema] = useState(
    initialData.output || null,
  );

  const [touched, setTouched] = useState({
    domain: false,
  });

  const [hasViewedInfo, setHasViewedInfo] = useState(
    Boolean(initialData._hasViewedInfo)
  );

  const hasInitialised = Boolean(
    selectedTemplateId ||
    isFromScratch ||
    initialData.domain,
  );

  const markAsViewedInfo = useCallback(() => {
    setHasViewedInfo(true);
  }, []);

  const touchField = useCallback((fieldName) => {
    setTouched((prev) => ({ ...prev, [fieldName]: true }));
  }, []);

  const markAllTouched = useCallback(() => {
    setTouched({
      domain: true,
    });
  }, []);

  const selectTemplate = useCallback((templateId) => {
    const template = getCompanyTemplateById(templateId);
    if (template) {
      setSelectedTemplateId(templateId);
      setIsFromScratch(false);
      setDomain(normalizeFxBlocks(template.defaults.domain));
      setTouched({ domain: false });
    }
  }, []);

  const applySelectedTemplate = useCallback(
    (templateIdOverride) => {
      const targetId = templateIdOverride || selectedTemplateId;
      if (targetId) {
        const template = getCompanyTemplateById(targetId);
        if (template) {
          setDomain(normalizeFxBlocks(template.defaults.domain));
        }
      }
    },
    [selectedTemplateId],
  );

  const startFromScratch = useCallback(() => {
    setSelectedTemplateId(null);
    setIsFromScratch(true);
    setDomain(createEmptyFxBlocks());
    setTouched({ domain: false });
  }, []);

  const updateDomain = useCallback((blocks) => {
    setDomain({ type: "fx", blocks });
  }, []);

  const updateOutputSchema = useCallback((schema) => {
    setOutputSchema({ schema });
  }, []);

  const validation = useMemo(() => {
    const errors = {};
    const touchedErrors = {};

    const hasDomainInput = hasValidInput(domain);

    if (!hasDomainInput) {
      errors.domain = "Company domain is required";
      if (touched.domain) {
        touchedErrors.domain = errors.domain;
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      touchedErrors,
    };
  }, [domain, touched]);

  const getData = useCallback(() => {
    return {
      name,
      domain,
      output: outputSchema,
      _templateId: selectedTemplateId,
      _isFromScratch: isFromScratch,
      _hasViewedInfo: hasViewedInfo,
    };
  }, [
    name,
    domain,
    outputSchema,
    selectedTemplateId,
    isFromScratch,
    hasViewedInfo,
  ]);

  const getError = useCallback(() => {
    const errorMessages = {
      0: [],
      1: [],
      2: [],
    };

    if (validation.errors.domain) {
      errorMessages[1].push(validation.errors.domain);
    }

    return errorMessages;
  }, [validation]);

  return {
    name,
    setName,
    domain,
    setDomain,
    updateDomain,
    selectedTemplateId,
    isFromScratch,
    hasInitialised,
    selectTemplate,
    applySelectedTemplate,
    startFromScratch,
    outputSchema,
    setOutputSchema,
    updateOutputSchema,
    validation,
    touched,
    touchField,
    markAllTouched,
    markAsViewedInfo,
    getData,
    getError,
    configureFields: CONFIGURE_FIELDS,
  };
};
