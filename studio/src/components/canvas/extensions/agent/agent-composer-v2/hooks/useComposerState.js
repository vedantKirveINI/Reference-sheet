import { useState, useCallback, useMemo } from "react";
import { cloneDeep } from "lodash-es";
import { OUTPUT_SCHEMA } from "../constants";

export const useComposerState = (initialData = {}) => {
  const [name, setName] = useState(initialData.name || "");
  const [selectedTemplateId, setSelectedTemplateId] = useState(
    initialData.selectedTemplateId || ""
  );

  const [senderName, setSenderName] = useState(
    initialData.senderName || { type: "fx", blocks: [] }
  );
  const [senderEmail, setSenderEmail] = useState(
    initialData.senderEmail || { type: "fx", blocks: [] }
  );
  const [senderCompany, setSenderCompany] = useState(
    initialData.senderCompany || { type: "fx", blocks: [] }
  );

  const [recipientName, setRecipientName] = useState(
    initialData.recipientName || { type: "fx", blocks: [] }
  );
  const [recipientEmail, setRecipientEmail] = useState(
    initialData.recipientEmail || { type: "fx", blocks: [] }
  );
  const [recipientCompany, setRecipientCompany] = useState(
    initialData.recipientCompany || { type: "fx", blocks: [] }
  );

  const [messageSubject, setMessageSubject] = useState(
    initialData.messageSubject || { type: "fx", blocks: [] }
  );
  const [messageBody, setMessageBody] = useState(
    initialData.messageBody || { type: "fx", blocks: [] }
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

    if (!name?.trim()) {
      errors.name = "Composer name is required";
    }
    if (!selectedTemplateId) {
      errors.selectedTemplateId = "Please select a template";
    }
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

    return {
      errors,
      isInitialiseValid: !errors.name && !errors.selectedTemplateId,
      isConfigureValid:
        !errors.senderCompany &&
        !errors.recipientEmail &&
        !errors.messageSubject &&
        !errors.messageBody,
      isValid: Object.keys(errors).length === 0,
    };
  }, [
    name,
    selectedTemplateId,
    senderCompany,
    recipientEmail,
    messageSubject,
    messageBody,
  ]);

  const hasInitialised = useMemo(() => {
    return !!name?.trim() && !!selectedTemplateId;
  }, [name, selectedTemplateId]);

  const getData = useCallback(() => {
    return {
      name,
      selectedTemplateId,
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
      companyName: senderCompany,
      description: messageBody,
      recipientDescription: recipientCompany,
      emailObjective: messageSubject,
      tone: { type: "fx", blocks: [{ type: "text", value: selectedTone }] },
      languageModel: "gpt-4o-mini",
    };
  }, [
    name,
    selectedTemplateId,
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
    const errorMessages = {
      0: [],
      1: [],
      2: [],
    };

    if (validation.errors.name) errorMessages[0].push(validation.errors.name);
    if (validation.errors.selectedTemplateId)
      errorMessages[0].push(validation.errors.selectedTemplateId);

    if (validation.errors.senderCompany)
      errorMessages[1].push(validation.errors.senderCompany);
    if (validation.errors.recipientEmail)
      errorMessages[1].push(validation.errors.recipientEmail);
    if (validation.errors.messageSubject)
      errorMessages[1].push(validation.errors.messageSubject);
    if (validation.errors.messageBody)
      errorMessages[1].push(validation.errors.messageBody);

    return errorMessages;
  }, [validation]);

  return {
    name,
    selectedTemplateId,
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
    validation,
    hasInitialised,
    setName,
    setSelectedTemplateId,
    updateSenderName,
    updateSenderEmail,
    updateSenderCompany,
    updateRecipientName,
    updateRecipientEmail,
    updateRecipientCompany,
    updateMessageSubject,
    updateMessageBody,
    setSelectedTone,
    setAdditionalContext,
    setOutputSchema,
    getData,
    getError,
  };
};
