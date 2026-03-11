import { useState, useCallback, useMemo } from "react";
import { cloneDeep } from "lodash-es";
import {
  CONFIGURE_FIELDS,
  getPersonTemplateById,
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

export const usePersonEnrichmentState = (initialData = {}) => {
  const isNewNode =
    !initialData._templateId &&
    !initialData._isFromScratch &&
    !initialData.fullName;
  const [name, setName] = useState(initialData.name || "");
  const [fullName, setFullName] = useState(normalizeFxBlocks(initialData.fullName));
  const [domain, setDomain] = useState(normalizeFxBlocks(initialData.domain));
  const [linkedinUrl, setLinkedinUrl] = useState(
    normalizeFxBlocks(initialData.linkedinUrl),
  );
  const [selectedTemplateId, setSelectedTemplateId] = useState(
    initialData._templateId || null,
  );
  const [isFromScratch, setIsFromScratch] = useState(
    initialData._isFromScratch || isNewNode,
  );
  const [outputSchema, setOutputSchema] = useState(
    cloneDeep(initialData.output),
  );

  const [touched, setTouched] = useState({
    fullName: false,
    domain: false,
    linkedinUrl: false,
  });

  const [hasViewedInfo, setHasViewedInfo] = useState(
    Boolean(initialData._hasViewedInfo)
  );

  const hasInitialised = Boolean(
    selectedTemplateId || isFromScratch || initialData.fullName,
  );

  const markAsViewedInfo = useCallback(() => {
    setHasViewedInfo(true);
  }, []);

  const touchField = useCallback((fieldName) => {
    setTouched((prev) => ({ ...prev, [fieldName]: true }));
  }, []);

  const markAllTouched = useCallback(() => {
    setTouched({
      fullName: true,
      domain: true,
      linkedinUrl: true,
    });
  }, []);

  const selectTemplate = useCallback((templateId) => {
    const template = getPersonTemplateById(templateId);
    if (template) {
      setSelectedTemplateId(templateId);
      setIsFromScratch(false);
      setFullName(normalizeFxBlocks(template.defaults.fullName));
      setDomain(normalizeFxBlocks(template.defaults.domain));
      setLinkedinUrl(normalizeFxBlocks(template.defaults.linkedinUrl));
      setTouched({
        fullName: false,
        domain: false,
        linkedinUrl: false,
      });
    }
  }, []);

  const applySelectedTemplate = useCallback(
    (templateIdOverride) => {
      const targetId = templateIdOverride || selectedTemplateId;
      if (targetId) {
        const template = getPersonTemplateById(targetId);
        if (template) {
          setFullName(normalizeFxBlocks(template.defaults.fullName));
          setDomain(normalizeFxBlocks(template.defaults.domain));
          setLinkedinUrl(normalizeFxBlocks(template.defaults.linkedinUrl));
        }
      }
    },
    [selectedTemplateId],
  );

  const startFromScratch = useCallback(() => {
    setSelectedTemplateId(null);
    setIsFromScratch(true);
    setFullName(createEmptyFxBlocks());
    setDomain(createEmptyFxBlocks());
    setLinkedinUrl(createEmptyFxBlocks());
    setTouched({
      fullName: false,
      domain: false,
      linkedinUrl: false,
    });
  }, []);

  const updateFullName = useCallback((blocks) => {
    setFullName({ type: "fx", blocks });
  }, []);

  const updateDomain = useCallback((blocks) => {
    setDomain({ type: "fx", blocks });
  }, []);

  const updateLinkedinUrl = useCallback((blocks) => {
    setLinkedinUrl({ type: "fx", blocks });
  }, []);

  const updateOutputSchema = useCallback((schema) => {
    setOutputSchema({ schema });
  }, []);

  const validation = useMemo(() => {
    const errors = {};
    const touchedErrors = {};

    const hasFullNameInput = hasValidInput(fullName);
    const hasDomainInput = hasValidInput(domain);

    if (!hasFullNameInput) {
      errors.fullName = "Person's full name is required";
      if (touched.fullName) {
        touchedErrors.fullName = errors.fullName;
      }
    }
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
  }, [fullName, domain, touched]);

  const getData = useCallback(() => {
    return {
      name,
      fullName,
      domain,
      linkedinUrl,
      output: outputSchema,
      _templateId: selectedTemplateId,
      _isFromScratch: isFromScratch,
      _hasViewedInfo: hasViewedInfo,
    };
  }, [
    name,
    fullName,
    domain,
    linkedinUrl,
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

    if (validation.errors.fullName) errorMessages[1].push(validation.errors.fullName);
    if (validation.errors.domain) errorMessages[1].push(validation.errors.domain);

    return errorMessages;
  }, [validation]);

  return {
    name,
    setName,
    fullName,
    setFullName,
    updateFullName,
    domain,
    setDomain,
    updateDomain,
    linkedinUrl,
    setLinkedinUrl,
    updateLinkedinUrl,
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
