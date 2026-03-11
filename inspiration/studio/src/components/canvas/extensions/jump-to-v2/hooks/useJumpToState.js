import { useState, useCallback, useMemo } from "react";

export const useJumpToState = (initialData = {}) => {
  const [name, setName] = useState(initialData.name || "");
  const [targetNodeId, setTargetNodeId] = useState(initialData.jump_to_id || null);
  const [messageContent, setMessageContent] = useState(
    initialData.message_content || { type: "fx", blocks: [{ type: "PRIMITIVES", value: "" }] }
  );

  const updateState = useCallback((updates) => {
    if (updates.name !== undefined) setName(updates.name);
    if (updates.targetNodeId !== undefined) setTargetNodeId(updates.targetNodeId);
    if (updates.messageContent !== undefined) setMessageContent(updates.messageContent);
  }, []);

  const validation = useMemo(() => {
    const errors = [];
    
    if (!targetNodeId) {
      errors.push("Target node is required");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }, [targetNodeId]);

  const getData = useCallback(() => {
    return {
      name,
      jump_to_id: targetNodeId,
      message_content: messageContent,
    };
  }, [name, targetNodeId, messageContent]);

  const getError = useCallback(() => {
    return validation.errors;
  }, [validation]);

  return {
    name,
    setName,
    targetNodeId,
    setTargetNodeId,
    messageContent,
    setMessageContent,
    updateState,
    validation,
    getData,
    getError,
  };
};
