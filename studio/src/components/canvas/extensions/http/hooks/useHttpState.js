import { useState, useCallback, useMemo } from "react";
import {
  getDefaultState,
  HTTP_TEMPLATES,
  BODY_TYPES,
  AUTH_TYPES,
  CONTENT_TYPE_HEADER,
  CONTENT_TYPES,
  METHOD_BODY_DEFAULTS,
  BINARY_SOURCE_UPLOAD,
  BINARY_SOURCE_FORMULA,
  FORM_DATA_ROW_TYPE_TEXT,
  FORM_DATA_ROW_TYPE_FILE,
} from "../constants";
import { generateUUID } from "@/lib/utils";
import { convertFieldsToJson } from "@src/module/input-grid-v3/input-grid/utils";

const createFxValue = (text = "") => ({
  type: "fx",
  blocks: text ? [{ type: "PRIMITIVES", value: text }] : [],
  text: text || "",
  blockStr: text || "",
});

const createEmptyRow = () => ({
  key: "",
  value: createFxValue(""),
  valueStr: "",
  rowid: generateUUID(),
  expand: false,
});

const normalizeAuthType = (authType) => {
  if (!authType) return AUTH_TYPES.NONE;
  const lower = String(authType).toLowerCase();
  if (lower === "basic") return AUTH_TYPES.BASIC;
  if (lower === "bearer") return AUTH_TYPES.BEARER;
  // Legacy: api_key was removed; treat as no auth
  if (lower === "api_key" || lower === "apikey") return AUTH_TYPES.NONE;
  return AUTH_TYPES.NONE;
};

const normalizeRawSubType = (subType) => {
  if (!subType) return "json";
  const lower = String(subType).toLowerCase();
  if (["json", "text", "xml", "html", "javascript"].includes(lower)) {
    return lower;
  }
  return "json";
};

const normalizeFormDataRows = (rows) => {
  if (!Array.isArray(rows)) return rows;
  return rows.map((row) => {
    if (row?.fileType === true) {
      const urlVal =
        typeof row.value === "string"
          ? row.value
          : typeof row.valueStr === "string"
            ? row.valueStr
            : "";
      return {
        ...row,
        type: FORM_DATA_ROW_TYPE_FILE,
        fileType: undefined,
        value: urlVal,
        valueStr: urlVal,
        fileData: row.fileData ?? null,
      };
    }
    if (row?.type === undefined || row?.type === null) {
      return {
        ...row,
        type: FORM_DATA_ROW_TYPE_TEXT,
      };
    }
    return row;
  });
};

const normalizeIncomingData = (data) => {
  if (!data) return data;

  const normalized = { ...data };

  if (normalized.authorization) {
    normalized.authorization = {
      ...normalized.authorization,
      type: normalizeAuthType(normalized.authorization.type),
    };
  }

  if (normalized.body) {
    normalized.body = { ...normalized.body };
    if (normalized.body.sub_type) {
      normalized.body.sub_type = normalizeRawSubType(normalized.body.sub_type);
    }
    if (
      normalized.body.type === BODY_TYPES.FORM_DATA &&
      Array.isArray(normalized.body.data)
    ) {
      normalized.body.data = normalizeFormDataRows(normalized.body.data);
    }
    if (normalized.body.type === BODY_TYPES.RAW && normalized.body.sub_type === "json") {
      const emptyFx = { type: "fx", blocks: [], text: "" };
      if (!normalized.body.jsonInputMode) {
        if (Array.isArray(normalized.body.data)) {
          normalized.body.jsonInputMode = "grid";
          normalized.body.jsonGridData = normalized.body.data;
          normalized.body.jsonFxData = normalized.body.jsonFxData || emptyFx;
        } else if (normalized.body.data?.type === "fx") {
          normalized.body.jsonInputMode = "raw";
          normalized.body.jsonFxData = normalized.body.data;
          normalized.body.jsonGridData = normalized.body.jsonGridData || [];
        } else {
          normalized.body.jsonInputMode = "grid";
          normalized.body.jsonGridData = [];
          normalized.body.jsonFxData = emptyFx;
        }
      }
      if (!normalized.body.jsonGridData) {
        normalized.body.jsonGridData = Array.isArray(normalized.body.data) ? normalized.body.data : [];
      }
      if (!normalized.body.jsonFxData) {
        normalized.body.jsonFxData = normalized.body.data?.type === "fx" ? normalized.body.data : emptyFx;
      }
      if (normalized.body.data?.type !== "fx") {
        normalized.body.data = normalized.body.jsonFxData;
      }
    }
  }

  return normalized;
};

export const JSON_INPUT_MODES = {
  GRID: "grid",
  RAW: "raw",
};

export const useHttpState = (initialData = {}) => {
  const normalizedInitialData = normalizeIncomingData(initialData);
  
  const hasExplicitInit = Boolean(
    normalizedInitialData?._isFromScratch || normalizedInitialData?._templateId
  );
  
  const hasLegacyConfig = !hasExplicitInit && normalizedInitialData && (
    normalizedInitialData.url?.blocks?.length > 0 ||
    normalizedInitialData.url?.text ||
    (normalizedInitialData.method && normalizedInitialData.method !== "GET") ||
    (normalizedInitialData.headers && normalizedInitialData.headers.length > 0) ||
    (normalizedInitialData.query_params && normalizedInitialData.query_params.length > 0) ||
    (normalizedInitialData.body?.type && normalizedInitialData.body.type !== BODY_TYPES.NONE) ||
    normalizedInitialData.body?.data ||
    (normalizedInitialData.authorization?.type && normalizedInitialData.authorization.type !== AUTH_TYPES.NONE) ||
    (normalizedInitialData.path_variable?.data && normalizedInitialData.path_variable.data.length > 0) ||
    normalizedInitialData.output?.schema
  );

  const [state, setState] = useState(() => {
    if (hasExplicitInit) {
      return {
        ...getDefaultState(),
        ...normalizedInitialData,
        _isFromScratch: Boolean(normalizedInitialData._isFromScratch),
        _templateId: normalizedInitialData._templateId ?? null,
      };
    }
    if (hasLegacyConfig) {
      return {
        ...getDefaultState(),
        ...normalizedInitialData,
        _isFromScratch: true,
        _templateId: null,
      };
    }
    return getDefaultState();
  });

  const [preservedAuthData, setPreservedAuthData] = useState(() => ({
    [AUTH_TYPES.BASIC]: normalizedInitialData?.authorization?.type === AUTH_TYPES.BASIC 
      ? normalizedInitialData.authorization.data 
      : [
          { key: "username", value: createFxValue(""), valueStr: "" },
          { key: "password", value: createFxValue(""), valueStr: "" },
        ],
    [AUTH_TYPES.BEARER]: normalizedInitialData?.authorization?.type === AUTH_TYPES.BEARER
      ? normalizedInitialData.authorization.data
      : [{ key: "token", value: createFxValue(""), valueStr: "" }],
  }));

  const hasInitialised = Boolean(state._isFromScratch) || Boolean(state._templateId);

  const updateState = useCallback((updates) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  const setUrl = useCallback((urlData) => {
    updateState({ url: urlData });
  }, [updateState]);

  const setMethod = useCallback((method) => {
    const defaults = METHOD_BODY_DEFAULTS[method];
    const updates = { method };

    if (!defaults.showBody) {
      updates.body = { type: BODY_TYPES.NONE, data: null, sub_type: null };
    } else if (defaults.defaultBodyType === BODY_TYPES.RAW) {
      const currentBody = state.body;
      if (currentBody?.type === BODY_TYPES.NONE) {
        updates.body = {
          type: BODY_TYPES.RAW,
          data: { type: "fx", blocks: [], text: "" },
          sub_type: defaults.defaultRawType || "json",
        };
        const hasContentType = state.headers.some(
          (h) => h.key?.toLowerCase() === CONTENT_TYPE_HEADER.toLowerCase()
        );
        if (!hasContentType) {
          updates.headers = [
            ...state.headers,
            {
              key: CONTENT_TYPE_HEADER,
              value: createFxValue(CONTENT_TYPES.JSON),
              valueStr: CONTENT_TYPES.JSON,
              rowid: generateUUID(),
              autoGenerated: true,
            },
          ];
        }
      }
    }

    updateState(updates);
  }, [updateState, state.body, state.headers]);

  const setHeaders = useCallback((headers) => {
    updateState({ headers });
  }, [updateState]);

  const setQueryParams = useCallback((query_params) => {
    updateState({ query_params });
  }, [updateState]);

  const setBody = useCallback((body) => {
    updateState({ body });
  }, [updateState]);

  const setJsonInputMode = useCallback((mode) => {
    setState((prev) => {
      if (prev.body?.type !== BODY_TYPES.RAW || prev.body?.sub_type !== "json") return prev;
      const currentMode = prev.body?.jsonInputMode || JSON_INPUT_MODES.GRID;
      if (currentMode === mode) return prev;
      const updatedBody = { ...prev.body, jsonInputMode: mode };
      if (currentMode === JSON_INPUT_MODES.RAW) {
        updatedBody.jsonFxData = prev.body?.data?.type === "fx"
          ? prev.body.data
          : (prev.body?.jsonFxData || { type: "fx", blocks: [], text: "" });
      } else if (currentMode === JSON_INPUT_MODES.GRID) {
        updatedBody.jsonGridData = prev.body?.jsonGridData || [];
      }
      if (mode === JSON_INPUT_MODES.RAW) {
        updatedBody.data = updatedBody.jsonFxData || { type: "fx", blocks: [], text: "" };
      } else if (mode === JSON_INPUT_MODES.GRID) {
        updatedBody.data = updatedBody.jsonFxData || { type: "fx", blocks: [], text: "" };
      }
      return { ...prev, body: updatedBody };
    });
  }, []);

  const setJsonGridData = useCallback((gridData) => {
    setState((prev) => ({
      ...prev,
      body: { ...prev.body, jsonGridData: gridData },
    }));
  }, []);

  const setBodyType = useCallback((bodyType) => {
    setState((prev) => {
      let newBody = { type: bodyType, data: null, sub_type: null };

      if (bodyType === BODY_TYPES.RAW) {
        const prevFxData = prev.body?.type === BODY_TYPES.RAW ? (prev.body?.jsonFxData || prev.body?.data) : null;
        newBody.data = prevFxData?.type === "fx" ? prevFxData : { type: "fx", blocks: [], text: "" };
        newBody.sub_type = "json";
        newBody.jsonInputMode = prev.body?.jsonInputMode || JSON_INPUT_MODES.GRID;
        newBody.jsonGridData = prev.body?.jsonGridData || [];
        newBody.jsonFxData = prevFxData?.type === "fx" ? prevFxData : { type: "fx", blocks: [], text: "" };
      } else if (
        bodyType === BODY_TYPES.FORM_DATA ||
        bodyType === BODY_TYPES.URL_ENCODED
      ) {
        newBody.data = [];
      } else if (bodyType === BODY_TYPES.BINARY) {
        newBody.binarySource = BINARY_SOURCE_UPLOAD;
        newBody.binaryFxData = null;
        if (prev.body?.type === BODY_TYPES.BINARY) {
          if (prev.body?.binarySource === BINARY_SOURCE_FORMULA && prev.body?.binaryFxData) {
            newBody.binarySource = BINARY_SOURCE_FORMULA;
            newBody.binaryFxData = prev.body.binaryFxData;
          } else if (prev.body?.data) {
            newBody.data = prev.body.data;
          }
        }
      }

      const updates = { body: newBody };
      if (bodyType === BODY_TYPES.BINARY) {
        const contentType = newBody.data?.fileType || CONTENT_TYPES.BINARY;
        const headers = [...(prev.headers || [])];
        const contentTypeLower = CONTENT_TYPE_HEADER.toLowerCase();
        const idx = headers.findIndex(
          (h) => h.key?.toLowerCase() === contentTypeLower
        );
        const newRow = {
          key: CONTENT_TYPE_HEADER,
          value: createFxValue(contentType),
          valueStr: contentType,
          rowid: generateUUID(),
          autoGenerated: true,
        };
        if (idx !== -1) {
          headers[idx] = { ...headers[idx], ...newRow };
        } else {
          headers.unshift(newRow);
        }
        updates.headers = headers;
      }
      return { ...prev, ...updates };
    });
  }, []);

  const upsertContentTypeHeader = useCallback((contentType) => {
    setState((prev) => {
      const headers = [...(prev.headers || [])];
      const contentTypeLower = CONTENT_TYPE_HEADER.toLowerCase();
      const autoGenIndex = headers.findIndex(
        (h) => h.key?.toLowerCase() === contentTypeLower && h?.autoGenerated
      );
      const anyContentTypeIndex = headers.findIndex(
        (h) => h.key?.toLowerCase() === contentTypeLower
      );

      const newRow = {
        key: CONTENT_TYPE_HEADER,
        value: createFxValue(contentType),
        valueStr: contentType,
        rowid: generateUUID(),
        autoGenerated: true,
      };

      if (autoGenIndex !== -1) {
        headers[autoGenIndex] = { ...headers[autoGenIndex], ...newRow };
      } else if (anyContentTypeIndex !== -1) {
        headers[anyContentTypeIndex] = { ...headers[anyContentTypeIndex], ...newRow };
      } else {
        headers.unshift(newRow);
      }
      return { ...prev, headers };
    });
  }, []);

  const setBinaryData = useCallback(
    (binaryData) => {
      setState((prev) => {
        const newBody = {
          type: BODY_TYPES.BINARY,
          data: binaryData,
          sub_type: null,
          binarySource: BINARY_SOURCE_UPLOAD,
          binaryFxData: null,
        };
        return { ...prev, body: newBody };
      });
      if (binaryData) {
        upsertContentTypeHeader(binaryData.fileType || CONTENT_TYPES.BINARY);
      }
    },
    [upsertContentTypeHeader]
  );

  const setBinaryFxData = useCallback((fxPayload) => {
    setState((prev) => {
      const newBody = {
        type: BODY_TYPES.BINARY,
        data: null,
        sub_type: null,
        binarySource: BINARY_SOURCE_FORMULA,
        binaryFxData: fxPayload || { type: "fx", blocks: [], text: "" },
      };
      return { ...prev, body: newBody };
    });
  }, []);

  const setRawSubType = useCallback((subType) => {
    setState((prev) => {
      const normalized = normalizeRawSubType(subType);
      const updatedBody = { ...prev.body, sub_type: normalized };
      if (normalized === "json") {
        updatedBody.jsonInputMode = prev.body?.jsonInputMode || JSON_INPUT_MODES.GRID;
        updatedBody.jsonGridData = prev.body?.jsonGridData || [];
        updatedBody.jsonFxData = prev.body?.jsonFxData || prev.body?.data || { type: "fx", blocks: [], text: "" };
      }
      return { ...prev, body: updatedBody };
    });
  }, []);

  const setAuthorization = useCallback((authorization) => {
    if (authorization?.data && authorization?.type !== AUTH_TYPES.NONE) {
      setPreservedAuthData((prev) => ({
        ...prev,
        [authorization.type]: authorization.data,
      }));
    }
    updateState({ authorization });
  }, [updateState]);

  const setAuthType = useCallback((authType) => {
    const normalizedType = normalizeAuthType(authType);
    
    if (state.authorization?.data && state.authorization?.type !== AUTH_TYPES.NONE) {
      setPreservedAuthData((prev) => ({
        ...prev,
        [state.authorization.type]: state.authorization.data,
      }));
    }

    let newAuth = { type: normalizedType, data: null };

    if (normalizedType === AUTH_TYPES.BASIC) {
      newAuth.data = preservedAuthData[AUTH_TYPES.BASIC] || [
        { key: "username", value: createFxValue(""), valueStr: "" },
        { key: "password", value: createFxValue(""), valueStr: "" },
      ];
    } else if (normalizedType === AUTH_TYPES.BEARER) {
      newAuth.data = preservedAuthData[AUTH_TYPES.BEARER] || [
        { key: "token", value: createFxValue(""), valueStr: "" },
      ];
    }

    updateState({ authorization: newAuth });
  }, [updateState, state.authorization, preservedAuthData]);

  const setOutputSchema = useCallback((schema) => {
    updateState({ output: { schema } });
  }, [updateState]);

  const selectTemplate = useCallback((templateId) => {
    const template = HTTP_TEMPLATES.find((t) => t.id === templateId);
    if (template && template.defaults) {
      setState({
        ...getDefaultState(),
        ...template.defaults,
        _templateId: templateId,
        _isFromScratch: false,
      });
    }
  }, []);

  const startFromScratch = useCallback(() => {
    setState({
      ...getDefaultState(),
      _isFromScratch: true,
      _templateId: null,
    });
  }, []);

  const applyCurlData = useCallback((curlData) => {
    const normalized = normalizeIncomingData(curlData);
    setState({
      ...getDefaultState(),
      ...normalized,
      _isFromScratch: true,
      _templateId: "curl-import",
    });
  }, []);

  const getError = useCallback(() => {
    const errors = { 0: [], 1: [], 2: [] };

    if (!hasInitialised) {
      errors[0].push("Please select a template or start from scratch");
    }

    const urlHasContent = state.url?.blocks?.length > 0 || state.url?.text;
    if (hasInitialised && !urlHasContent) {
      errors[1].push("URL is required");
    }

    return errors;
  }, [hasInitialised, state.url]);

  const getData = useCallback(() => {
    const errorObj = getError();
    const errorsArray = Object.values(errorObj).reduce(
      (acc, errs) => [...acc, ...errs],
      []
    );

    const bodyOutput = { ...state.body };
    if (bodyOutput.type === BODY_TYPES.RAW && bodyOutput.sub_type === "json") {
      if (bodyOutput.jsonInputMode === JSON_INPUT_MODES.GRID) {
        const raw = bodyOutput.jsonGridData || [];
        let fieldsToConvert = raw;
        if (
          raw.length === 1 &&
          raw[0].type === "Object" &&
          (raw[0].key === "" || !raw[0].key)
        ) {
          const inner = raw[0].schema || raw[0].value;
          if (Array.isArray(inner)) fieldsToConvert = inner;
        }
        try {
          const jsonObj = convertFieldsToJson(fieldsToConvert, true);
          bodyOutput.data = createFxValue(JSON.stringify(jsonObj));
        } catch (err) {
          bodyOutput.data = createFxValue("{}");
        }
      }
    }

    console.log("=== [useHttpState.getData] Authorization Debug ===");
    console.log("state.authorization:", JSON.stringify(state.authorization, null, 2));
    console.log("state.authorization.type:", state.authorization?.type);
    console.log("state.authorization.data:", JSON.stringify(state.authorization?.data, null, 2));
    if (state.authorization?.type === "bearer") {
      const tokenItem = state.authorization?.data?.find(d => d.key === "token");
      console.log("Bearer token item:", JSON.stringify(tokenItem, null, 2));
      console.log("Bearer token blocks:", JSON.stringify(tokenItem?.value?.blocks, null, 2));
      console.log("Bearer token valueStr:", tokenItem?.valueStr);
    }
    console.log("=== End Authorization Debug ===");

    const data = {
      method: state.method,
      url: state.url,
      headers: state.headers,
      query_params: state.query_params,
      body: bodyOutput,
      authorization: state.authorization,
      output: state.output,
      path_variable: state.path_variable || { data: [] },
      _templateId: state._templateId,
      _isFromScratch: state._isFromScratch,
      errors: errorsArray,
    };
    if (state.name !== undefined) {
      data.name = state.name;
    }
    return data;
  }, [
    state.method,
    state.url,
    state.headers,
    state.query_params,
    state.body,
    state.authorization,
    state.output,
    state.path_variable,
    state._templateId,
    state._isFromScratch,
    state.name,
    getError,
  ]);

  const validation = useMemo(() => {
    const urlHasContent = state.url?.blocks?.length > 0 || state.url?.text;
    return {
      isValid: hasInitialised && urlHasContent,
      hasUrl: urlHasContent,
    };
  }, [hasInitialised, state.url]);

  const showBody = useMemo(() => {
    return METHOD_BODY_DEFAULTS[state.method]?.showBody ?? false;
  }, [state.method]);

  return {
    ...state,
    hasInitialised,
    validation,
    showBody,

    updateState,
    setUrl,
    setMethod,
    setHeaders,
    setQueryParams,
    setBody,
    setBodyType,
    setBinaryData,
    setBinaryFxData,
    setRawSubType,
    setJsonInputMode,
    setJsonGridData,
    setAuthorization,
    setAuthType,
    setOutputSchema,

    selectTemplate,
    startFromScratch,
    applyCurlData,

    getData,
    getError,
  };
};
