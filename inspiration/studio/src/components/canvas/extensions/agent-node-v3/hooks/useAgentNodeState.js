import { useState, useCallback, useMemo } from "react";

export const useAgentNodeState = (initialData = {}) => {
  const [name, setName] = useState(initialData.name || "");
  const [selectedAgent, setSelectedAgent] = useState(
    initialData.agent || (initialData.asset_id ? { _id: initialData.asset_id, name: initialData.asset_name } : null)
  );
  const [message, setMessage] = useState(initialData.message || { type: "fx", blocks: [] });
  const [threadId, setThreadId] = useState(initialData.threadId || { type: "fx", blocks: [] });
  const [messageId, setMessageId] = useState(initialData.messageId || { type: "fx", blocks: [] });
  const [outputSchema, setOutputSchema] = useState(initialData.output_schema || null);

  const hasInitialised = Boolean(selectedAgent);

  const onAgentChange = useCallback((agent) => {
    setSelectedAgent(agent);
  }, []);

  const onMessageChange = useCallback((content) => {
    setMessage({
      type: "fx",
      blocks: content,
    });
  }, []);

  const onThreadIdChange = useCallback((content) => {
    setThreadId({
      type: "fx",
      blocks: content,
    });
  }, []);

  const onMessageIdChange = useCallback((content) => {
    setMessageId({
      type: "fx",
      blocks: content,
    });
  }, []);

  const updateState = useCallback((updates) => {
    if (updates.name !== undefined) setName(updates.name);
  }, []);

  const validation = useMemo(() => {
    const errors = [];
    
    if (!selectedAgent) {
      errors.push("Agent selection is required");
    }
    
    if (!message?.blocks?.length) {
      errors.push("Message is required");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }, [selectedAgent, message]);

  const getData = useCallback(() => {
    return {
      name,
      agent: selectedAgent,
      asset_id: selectedAgent?._id || selectedAgent?.id,
      version_id: null,
      message,
      threadId,
      messageId,
      output_schema: outputSchema,
    };
  }, [name, selectedAgent, message, threadId, messageId, outputSchema]);

  const getError = useCallback(() => {
    return validation.errors;
  }, [validation]);

  return {
    name,
    setName,
    selectedAgent,
    setSelectedAgent,
    message,
    setMessage,
    threadId,
    setThreadId,
    messageId,
    setMessageId,
    hasInitialised,
    onAgentChange,
    onMessageChange,
    onThreadIdChange,
    onMessageIdChange,
    updateState,
    outputSchema,
    setOutputSchema,
    validation,
    getData,
    getError,
  };
};
