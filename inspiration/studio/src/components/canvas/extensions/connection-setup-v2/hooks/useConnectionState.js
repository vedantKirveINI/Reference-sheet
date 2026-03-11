import { useState, useCallback, useMemo } from "react";
import { CONNECTION_TEMPLATES } from "../constants";

export const useConnectionState = (initialData = {}) => {
  const isNewNode = !initialData._templateId && !initialData._isFromScratch && !initialData.connectionType;
  const [connectionType, setConnectionType] = useState(initialData.connectionType || "API_KEY");
  const [connectionName, setConnectionName] = useState(
    initialData.connectionName || { type: "fx", blocks: [{ type: "PRIMITIVES", value: "" }] }
  );
  const [apiKey, setApiKey] = useState(
    initialData.apiKey || { type: "fx", blocks: [{ type: "PRIMITIVES", value: "" }] }
  );
  const [apiKeyHeader, setApiKeyHeader] = useState(
    initialData.apiKeyHeader || { type: "fx", blocks: [{ type: "PRIMITIVES", value: "Authorization" }] }
  );
  const [username, setUsername] = useState(
    initialData.username || { type: "fx", blocks: [{ type: "PRIMITIVES", value: "" }] }
  );
  const [password, setPassword] = useState(
    initialData.password || { type: "fx", blocks: [{ type: "PRIMITIVES", value: "" }] }
  );
  const [customHeaders, setCustomHeaders] = useState(initialData.customHeaders || []);
  const [selectedTemplateId, setSelectedTemplateId] = useState(
    initialData._templateId || null
  );
  const [isFromScratch, setIsFromScratch] = useState(
    initialData._isFromScratch || isNewNode
  );
  const [outputSchema, setOutputSchema] = useState(initialData.output_schema || null);
  const [testStatus, setTestStatus] = useState(null);

  const hasInitialised = Boolean(selectedTemplateId || isFromScratch || initialData.connectionType);

  const selectTemplate = useCallback((templateId) => {
    const template = CONNECTION_TEMPLATES.find((t) => t.id === templateId);
    if (template) {
      setSelectedTemplateId(templateId);
      setIsFromScratch(false);
      setConnectionType(template.defaults.connectionType);
      setConnectionName(template.defaults.connectionName);
    }
  }, []);

  const startFromScratch = useCallback(() => {
    setSelectedTemplateId(null);
    setIsFromScratch(true);
    setConnectionType("API_KEY");
    setConnectionName({ type: "fx", blocks: [{ type: "PRIMITIVES", value: "" }] });
  }, []);

  const validation = useMemo(() => {
    const errors = [];

    const hasName = connectionName?.blocks?.some(
      (block) => block.value && block.value.trim() !== ""
    );

    if (!hasName) {
      errors.push("Connection name is required");
    }

    if (connectionType === "API_KEY") {
      const hasApiKey = apiKey?.blocks?.some(
        (block) => block.value && block.value.trim() !== ""
      );
      if (!hasApiKey) {
        errors.push("API key is required");
      }
    }

    if (connectionType === "BASIC") {
      const hasUsername = username?.blocks?.some(
        (block) => block.value && block.value.trim() !== ""
      );
      if (!hasUsername) {
        errors.push("Username is required");
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }, [connectionName, connectionType, apiKey, username]);

  const testConnection = useCallback(() => {
    setTestStatus("testing");
    setTimeout(() => {
      setTestStatus("success");
    }, 1500);
  }, []);

  const getData = useCallback(() => {
    return {
      connectionType,
      connectionName,
      apiKey,
      apiKeyHeader,
      username,
      password,
      customHeaders,
      output_schema: outputSchema,
      _templateId: selectedTemplateId,
      _isFromScratch: isFromScratch,
    };
  }, [connectionType, connectionName, apiKey, apiKeyHeader, username, password, customHeaders, outputSchema, selectedTemplateId, isFromScratch]);

  const getError = useCallback(() => {
    return validation.errors;
  }, [validation]);

  return {
    connectionType,
    setConnectionType,
    connectionName,
    setConnectionName,
    apiKey,
    setApiKey,
    apiKeyHeader,
    setApiKeyHeader,
    username,
    setUsername,
    password,
    setPassword,
    customHeaders,
    setCustomHeaders,
    selectedTemplateId,
    isFromScratch,
    hasInitialised,
    selectTemplate,
    startFromScratch,
    outputSchema,
    setOutputSchema,
    testStatus,
    testConnection,
    validation,
    getData,
    getError,
  };
};
