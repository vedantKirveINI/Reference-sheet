import { useState, useCallback, useMemo } from "react";
import { cloneDeep } from "lodash-es";
import {
  CONFIGURE_FIELDS,
  getEmailTemplateById,
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

export const useEmailEnrichmentState = (initialData = {}) => {
  const hasExistingData = initialData.domain || initialData.fullName;
  const isNewNode =
    !initialData._templateId &&
    !initialData._isFromScratch &&
    !hasExistingData;
  const [name, setName] = useState(initialData.name || "Email Enrichment");
  const [domain, setDomain] = useState(normalizeFxBlocks(initialData.domain));
  const [fullName, setFullName] = useState(normalizeFxBlocks(initialData.fullName));
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
    fullName: false,
  });

  const [hasViewedInfo, setHasViewedInfo] = useState(
    Boolean(initialData._hasViewedInfo)
  );

  const hasInitialised = Boolean(
    selectedTemplateId ||
    isFromScratch ||
    initialData.domain ||
    initialData.fullName,
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
      fullName: true,
    });
  }, []);

  const selectTemplate = useCallback((templateId) => {
    const template = getEmailTemplateById(templateId);
    if (template) {
      setSelectedTemplateId(templateId);
      setIsFromScratch(false);
      setDomain(normalizeFxBlocks(template.defaults.domain));
      setFullName(normalizeFxBlocks(template.defaults.fullName));
      setTouched({ domain: false, fullName: false });
    }
  }, []);

  const applySelectedTemplate = useCallback(
    (templateIdOverride) => {
      const targetId = templateIdOverride || selectedTemplateId;
      if (targetId) {
        const template = getEmailTemplateById(targetId);
        if (template) {
          setDomain(normalizeFxBlocks(template.defaults.domain));
          setFullName(normalizeFxBlocks(template.defaults.fullName));
        }
      }
    },
    [selectedTemplateId],
  );

  const startFromScratch = useCallback(() => {
    setSelectedTemplateId(null);
    setIsFromScratch(true);
    setDomain(createEmptyFxBlocks());
    setFullName(createEmptyFxBlocks());
    setTouched({ domain: false, fullName: false });
  }, []);

  const updateDomain = useCallback((blocks) => {
    setDomain({ type: "fx", blocks });
  }, []);

  const updateFullName = useCallback((blocks) => {
    setFullName({ type: "fx", blocks });
  }, []);

  const updateOutputSchema = useCallback((schema) => {
    setOutputSchema({ schema });
  }, []);

  const validation = useMemo(() => {
    const errors = {};
    const touchedErrors = {};

    const hasDomainInput = hasValidInput(domain);
    const hasFullNameInput = hasValidInput(fullName);

    if (!hasDomainInput) {
      errors.domain = "Company domain is required";
      if (touched.domain) {
        touchedErrors.domain = errors.domain;
      }
    }
    if (!hasFullNameInput) {
      errors.fullName = "Person's full name is required";
      if (touched.fullName) {
        touchedErrors.fullName = errors.fullName;
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      touchedErrors,
    };
  }, [domain, fullName, touched]);

  const getData = useCallback(() => {
    return {
      name,
      domain,
      fullName,
      output: outputSchema,
      _templateId: selectedTemplateId,
      _isFromScratch: isFromScratch,
      _hasViewedInfo: hasViewedInfo,
    };
  }, [name, domain, fullName, outputSchema, selectedTemplateId, isFromScratch, hasViewedInfo]);

  const getError = useCallback(() => {
    const errorMessages = {
      0: [],
      1: [],
      2: [],
    };

    if (validation.errors.domain) {
      errorMessages[1].push(validation.errors.domain);
    }
    if (validation.errors.fullName) {
      errorMessages[1].push(validation.errors.fullName);
    }

    return errorMessages;
  }, [validation]);

  return {
    name,
    setName,
    domain,
    setDomain,
    updateDomain,
    fullName,
    setFullName,
    updateFullName,
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
