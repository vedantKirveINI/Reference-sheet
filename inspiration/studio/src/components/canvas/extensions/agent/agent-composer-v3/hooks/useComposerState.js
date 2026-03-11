import { useState, useCallback, useMemo } from "react";
import { cloneDeep } from "lodash-es";
import { OUTPUT_SCHEMA, getComposerTemplateById } from "../constants";

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

export const useComposerState = (initialData = {}) => {
  const isNewNode = !initialData.templateId && !initialData.selectedTemplateId && !initialData.isFromScratch && !initialData.senderCompany;
  const [name, setName] = useState(initialData.name || "");
  const [selectedTemplateId, setSelectedTemplateId] = useState(
    initialData.templateId || initialData.selectedTemplateId || null
  );
  const [isFromScratch, setIsFromScratch] = useState(
    initialData.isFromScratch || isNewNode
  );

  const [senderName, setSenderName] = useState(
    normalizeFxBlocks(initialData.senderName)
  );
  const [senderEmail, setSenderEmail] = useState(
    normalizeFxBlocks(initialData.senderEmail)
  );
  const [senderCompany, setSenderCompany] = useState(
    normalizeFxBlocks(initialData.senderCompany || initialData.companyName)
  );

  const [recipientName, setRecipientName] = useState(
    normalizeFxBlocks(initialData.recipientName)
  );
  const [recipientEmail, setRecipientEmail] = useState(
    normalizeFxBlocks(initialData.recipientEmail)
  );
  const [recipientCompany, setRecipientCompany] = useState(
    normalizeFxBlocks(initialData.recipientCompany || initialData.recipientDescription)
  );

  const [messageSubject, setMessageSubject] = useState(
    normalizeFxBlocks(initialData.messageSubject || initialData.emailObjective)
  );
  const [messageBody, setMessageBody] = useState(
    normalizeFxBlocks(initialData.messageBody || initialData.description)
  );

  const [selectedTone, setSelectedTone] = useState(
    initialData.selectedTone || "professional"
  );
  const [additionalContext, setAdditionalContext] = useState(
    initialData.additionalContext || ""
  );

  const [outputSchema, setOutputSchema] = useState(
    cloneDeep(initialData.outputSchema) || cloneDeep(OUTPUT_SCHEMA)
  );

  const [touched, setTouched] = useState({
    senderCompany: false,
    recipientEmail: false,
    messageSubject: false,
    messageBody: false,
  });

  const markFieldTouched = useCallback((fieldName) => {
    setTouched((prev) => ({ ...prev, [fieldName]: true }));
  }, []);

  const markAllTouched = useCallback(() => {
    setTouched({
      senderCompany: true,
      recipientEmail: true,
      messageSubject: true,
      messageBody: true,
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
      senderCompany: false,
      recipientEmail: false,
      messageSubject: false,
      messageBody: false,
    });
  }, []);

  const updateSenderName = useCallback((blocks) => {
    setSenderName({ type: "fx", blocks });
  }, []);

  const updateSenderEmail = useCallback((blocks) => {
    setSenderEmail({ type: "fx", blocks });
  }, []);

  const updateSenderCompany = useCallback((blocks) => {
    setSenderCompany({ type: "fx", blocks });
  }, []);

  const updateRecipientName = useCallback((blocks) => {
    setRecipientName({ type: "fx", blocks });
  }, []);

  const updateRecipientEmail = useCallback((blocks) => {
    setRecipientEmail({ type: "fx", blocks });
  }, []);

  const updateRecipientCompany = useCallback((blocks) => {
    setRecipientCompany({ type: "fx", blocks });
  }, []);

  const updateMessageSubject = useCallback((blocks) => {
    setMessageSubject({ type: "fx", blocks });
  }, []);

  const updateMessageBody = useCallback((blocks) => {
    setMessageBody({ type: "fx", blocks });
  }, []);

  const validation = useMemo(() => {
    const errors = {};

    if (!senderCompany?.blocks?.length) {
      errors.senderCompany = "Sender company is required";
    }
    if (!recipientEmail?.blocks?.length) {
      errors.recipientEmail = "Recipient email is required";
    }
    if (!messageSubject?.blocks?.length) {
      errors.messageSubject = "Message subject is required";
    }
    if (!messageBody?.blocks?.length) {
      errors.messageBody = "Message body is required";
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
  }, [senderCompany, recipientEmail, messageSubject, messageBody, touched]);

  const hasInitialised = useMemo(() => {
    return !!selectedTemplateId || isFromScratch;
  }, [selectedTemplateId, isFromScratch]);

  const getData = useCallback(() => {
    const toneFx =
      typeof selectedTone === "string"
        ? { type: "fx", blocks: [{ type: "PRIMITIVES", value: selectedTone }] }
        : normalizeFxBlocks(selectedTone);
    return {
      name,
      templateId: selectedTemplateId,
      selectedTemplateId,
      isFromScratch,
      senderName,
      senderEmail,
      senderCompany,
      recipientName,
      recipientEmail,
      recipientCompany,
      messageSubject,
      messageBody,
      selectedTone,
      tone: toneFx,
      additionalContext,
      outputSchema,
      companyName: senderCompany,
      description: messageBody,
      recipientDescription: recipientCompany,
      emailObjective: messageSubject,
    };
  }, [
    name,
    selectedTemplateId,
    isFromScratch,
    senderName,
    senderEmail,
    senderCompany,
    recipientName,
    recipientEmail,
    recipientCompany,
    messageSubject,
    messageBody,
    selectedTone,
    additionalContext,
    outputSchema,
  ]);

  const getError = useCallback(() => {
    const errorMessages = [];
    Object.values(validation.errors).forEach((error) => {
      if (error) errorMessages.push(error);
    });
    return errorMessages;
  }, [validation.errors]);

  return {
    name,
    setName,
    selectedTemplateId,
    setSelectedTemplateId,
    isFromScratch,
    senderName,
    senderEmail,
    senderCompany,
    recipientName,
    recipientEmail,
    recipientCompany,
    messageSubject,
    messageBody,
    selectedTone,
    setSelectedTone,
    additionalContext,
    setAdditionalContext,
    outputSchema,
    setOutputSchema,
    touched,
    markFieldTouched,
    markAllTouched,
    selectTemplate,
    startFromScratch,
    updateSenderName,
    updateSenderEmail,
    updateSenderCompany,
    updateRecipientName,
    updateRecipientEmail,
    updateRecipientCompany,
    updateMessageSubject,
    updateMessageBody,
    validation,
    hasInitialised,
    getData,
    getError,
  };
};
