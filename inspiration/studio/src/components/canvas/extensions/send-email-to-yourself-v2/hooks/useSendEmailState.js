import { useState, useCallback, useMemo, useEffect } from "react";
import { EMAIL_TEMPLATES, getEmailTemplateById } from "../constants";
import userServices from "../../../services/userSdkServices";

const normalizeFxBlocks = (value) => {
  if (!value)
    return { type: "fx", blocks: [{ type: "PRIMITIVES", value: "" }] };
  if (value.type === "fx" && Array.isArray(value.blocks)) return value;
  if (typeof value === "string") {
    return { type: "fx", blocks: [{ type: "PRIMITIVES", value }] };
  }
  return { type: "fx", blocks: [{ type: "PRIMITIVES", value: "" }] };
};

const hasValidFxContent = (fxValue) => {
  if (!fxValue?.blocks || !Array.isArray(fxValue.blocks)) return false;
  return fxValue.blocks.some((block) => {
    if (block.type === "PRIMITIVES") {
      return block.value && block.value.trim() !== "";
    }
    return block.type && block.value;
  });
};

export const useSendEmailState = (initialData = {}) => {
  const isNewNode =
    !initialData._templateId &&
    !initialData._isFromScratch &&
    !initialData.subject;
  const [name, setName] = useState(
    initialData.name || "Send Email to Yourself",
  );
  const [priority, setPriority] = useState(initialData.priority || "NORMAL");
  const [subject, setSubject] = useState(
    normalizeFxBlocks(initialData.subject),
  );
  const [body, setBody] = useState(normalizeFxBlocks(initialData.body));
  const [selectedTemplateId, setSelectedTemplateId] = useState(
    initialData._templateId || null,
  );
  const [isFromScratch, setIsFromScratch] = useState(
    initialData._isFromScratch || isNewNode,
  );
  const [outputSchema, setOutputSchema] = useState(
    initialData.output_schema || null,
  );
  const [user, setUser] = useState(null);
  const [touched, setTouched] = useState({});

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await userServices.getUser();
        setUser(res?.result);
      } catch (e) {}
    };
    fetchUser();
  }, []);

  const hasInitialised = Boolean(
    selectedTemplateId || isFromScratch || initialData.subject,
  );

  const touchField = useCallback((fieldName) => {
    setTouched((prev) => ({ ...prev, [fieldName]: true }));
  }, []);

  const markAllTouched = useCallback(() => {
    setTouched({
      subject: true,
      body: true,
      priority: true,
    });
  }, []);

  const applySelectedTemplate = useCallback((templateId) => {
    const template = getEmailTemplateById(templateId);
    if (template) {
      setSelectedTemplateId(templateId);
      setIsFromScratch(false);
      setPriority(template.defaults.priority);
      setSubject(normalizeFxBlocks(template.defaults.subject));
      setBody(normalizeFxBlocks(template.defaults.body));
      setTouched({});
    }
  }, []);

  const startFromScratch = useCallback(() => {
    setSelectedTemplateId(null);
    setIsFromScratch(true);
    setPriority("NORMAL");
    setSubject({ type: "fx", blocks: [{ type: "PRIMITIVES", value: "" }] });
    setBody({ type: "fx", blocks: [{ type: "PRIMITIVES", value: "" }] });
    setTouched({});
  }, []);

  const updateSubject = useCallback(
    (blocks) => {
      setSubject({ type: "fx", blocks });
      touchField("subject");
    },
    [touchField],
  );

  const updateBody = useCallback(
    (blocks) => {
      setBody({ type: "fx", blocks });
      touchField("body");
    },
    [touchField],
  );

  const updateOutputSchema = useCallback((schema) => {
    setOutputSchema(schema);
  }, []);

  const validation = useMemo(() => {
    const errors = {};

    if (!hasValidFxContent(subject)) {
      errors.subject = "Subject is required";
    }

    const touchedErrors = {};
    Object.keys(errors).forEach((key) => {
      if (touched[key]) {
        touchedErrors[key] = errors[key];
      }
    });

    return {
      errors,
      touchedErrors,
      isValid: Object.keys(errors).length === 0,
    };
  }, [subject, touched]);

  const getData = useCallback(() => {
    return {
      name,
      priority,
      subject,
      body,
      to: {
        type: "fx",
        blocks: [
          {
            type: "PRIMITIVES",
            value: user?.email_id || "",
          },
        ],
      },
      output_schema: outputSchema,
      _templateId: selectedTemplateId,
      _isFromScratch: isFromScratch,
    };
  }, [
    name,
    priority,
    subject,
    body,
    user,
    outputSchema,
    selectedTemplateId,
    isFromScratch,
  ]);

  const getError = useCallback(() => {
    const errorMessages = {
      0: [],
      1: [],
      2: [],
    };

    if (!hasInitialised) {
      errorMessages[0].push("Please select a template or start from scratch");
    }

    if (validation.errors.subject) {
      errorMessages[1].push(validation.errors.subject);
    }

    return errorMessages;
  }, [hasInitialised, validation]);

  return {
    name,
    setName,
    priority,
    setPriority,
    subject,
    setSubject,
    updateSubject,
    body,
    setBody,
    updateBody,
    selectedTemplateId,
    isFromScratch,
    hasInitialised,
    applySelectedTemplate,
    startFromScratch,
    outputSchema,
    setOutputSchema,
    updateOutputSchema,
    user,
    validation,
    touched,
    touchField,
    markAllTouched,
    getData,
    getError,
  };
};
