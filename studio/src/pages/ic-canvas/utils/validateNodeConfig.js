import {
  HTTP_TYPE,
  INTEGRATION_TYPE,
  TINY_GPT_TYPE,
  TINY_GPT_RESEARCHER_TYPE,
  TINY_GPT_WRITER_TYPE,
  TINY_GPT_ANALYZER_TYPE,
  TINY_GPT_CREATIVE_TYPE,
  TINY_GPT_SUMMARIZER_TYPE,
  TINY_GPT_TRANSLATOR_TYPE,
  TINY_GPT_LEARNING_TYPE,
  TINY_GPT_CONSULTANT_TYPE,
  TRANSFORMER_TYPE,
  TRANSFORMER_TYPE_V3,
  FORMULA_FX_TYPE,
  SEND_EMAIL_TO_YOURSELF_TYPE,
  WEBHOOK_TYPE,
  WEBHOOK_TYPE_V2,
  TRIGGER_SETUP_TYPE,
  CREATE_TYPE,
  READ_TYPE,
  UPDATE_TYPE,
  DELETE_TYPE,
  EXECUTE_TYPE,
  FIND_ALL_TYPE,
  FIND_ONE_TYPE,
  CREATE_RECORD_V2_TYPE,
  UPDATE_RECORD_V2_TYPE,
  DELETE_V2_TYPE,
  EXECUTE_V2_TYPE,
  FIND_ALL_V2_TYPE,
  FIND_ONE_V2_TYPE,
  CREATE_SHEET_RECORD_TYPE,
  UPDATE_SHEET_RECORD_TYPE,
  UPDATE_SHEET_RECORDS_TYPE,
  FIND_ALL_SHEET_RECORD_TYPE,
  FIND_ONE_SHEET_RECORD_TYPE,
  DELETE_SHEET_RECORD_TYPE,
  PERSON_ENRICHMENT_TYPE,
  PERSON_ENRICHMENT_V2_TYPE,
  COMPANY_ENRICHMENT_TYPE,
  COMPANY_ENRICHMENT_V2_TYPE,
  EMAIL_ENRICHMENT_TYPE,
  EMAIL_ENRICHMENT_V2_TYPE,
  CONNECTION_SETUP_TYPE,
  CONNECTION_SETUP_V2_TYPE,
} from "@src/components/canvas/extensions/constants/types";
import "@src/components/canvas/extensions/validation/validators";
import { validateNode, hasValidator } from "@src/components/canvas/extensions/validation/registry";

const hasFxContent = (fxValue) => {
  if (!fxValue) return false;
  if (typeof fxValue === 'string') return fxValue.trim().length > 0;
  if (fxValue.text && fxValue.text.trim().length > 0) return true;
  if (fxValue.blocks && fxValue.blocks.length > 0) return true;
  if (Array.isArray(fxValue) && fxValue.length > 0) {
    return fxValue.some((b) => b.value && String(b.value).trim() !== '');
  }
  return false;
};

/** HTTP node body is { type, data, jsonFxData, ... }; payload lives in body.data or body.jsonFxData. */
const hasRequestBodyContent = (body) => {
  if (!body || typeof body !== 'object') return false;
  if (body.type === 'none' || !body.type) return false;
  if (body.type === 'raw') {
    const data = body.data || body.jsonFxData;
    return hasFxContent(data);
  }
  if (body.type === 'form-data' || body.type === 'url_encoded') {
    return Array.isArray(body.data) && body.data.length > 0;
  }
  if (body.type === 'binary') {
    return !!(body.data || (body.binaryFxData?.blocks?.length > 0));
  }
  return false;
};

const GPT_TYPES = [
  TINY_GPT_TYPE,
  TINY_GPT_RESEARCHER_TYPE,
  TINY_GPT_WRITER_TYPE,
  TINY_GPT_ANALYZER_TYPE,
  TINY_GPT_CREATIVE_TYPE,
  TINY_GPT_SUMMARIZER_TYPE,
  TINY_GPT_TRANSLATOR_TYPE,
  TINY_GPT_LEARNING_TYPE,
  TINY_GPT_CONSULTANT_TYPE,
];

const DB_TYPES = [
  CREATE_TYPE,
  READ_TYPE,
  UPDATE_TYPE,
  DELETE_TYPE,
  EXECUTE_TYPE,
  FIND_ALL_TYPE,
  FIND_ONE_TYPE,
  CREATE_RECORD_V2_TYPE,
  UPDATE_RECORD_V2_TYPE,
  DELETE_V2_TYPE,
  EXECUTE_V2_TYPE,
  FIND_ALL_V2_TYPE,
  FIND_ONE_V2_TYPE,
];

const SHEET_TYPES = [
  CREATE_SHEET_RECORD_TYPE,
  UPDATE_SHEET_RECORD_TYPE,
  UPDATE_SHEET_RECORDS_TYPE,
  FIND_ALL_SHEET_RECORD_TYPE,
  FIND_ONE_SHEET_RECORD_TYPE,
  DELETE_SHEET_RECORD_TYPE,
];

const ENRICHMENT_TYPES = [
  PERSON_ENRICHMENT_TYPE,
  PERSON_ENRICHMENT_V2_TYPE,
  COMPANY_ENRICHMENT_TYPE,
  COMPANY_ENRICHMENT_V2_TYPE,
  EMAIL_ENRICHMENT_TYPE,
  EMAIL_ENRICHMENT_V2_TYPE,
];

function hasBeenTouched(goData) {
  if (!goData) return false;
  if (goData.last_updated) return true;
  if (goData._isFromScratch || goData._templateId) return true;
  if (goData.connectionId || goData.connection) return true;
  if (goData.url || goData.prompt || goData.systemPrompt) return true;
  if (goData.expression || goData.formula) return true;
  if (goData.subject || goData.body) return true;
  const keys = Object.keys(goData);
  return keys.length > 0;
}

function getStructuredValidation(nodeData) {
  const type = nodeData?.type;
  if (!type || !hasValidator(type)) return null;

  try {
    const context = {
      nodeKey: String(nodeData.key || ''),
      nodeType: type,
      nodeName: nodeData.text || nodeData.name || '',
      tfData: nodeData.tf_data || nodeData.tfData || {},
      goData: nodeData.go_data || {},
    };
    const result = validateNode(context);
    if (result && result.issues && result.issues.length > 0) {
      return result.issues;
    }
  } catch (e) {
    // Structured validation failed, fall through to legacy
  }
  return null;
}

export function validateNodeConfig(nodeData) {
  const goData = nodeData?.go_data;
  const type = nodeData?.type;
  const errors = [];
  const warnings = [];

  if (!hasBeenTouched(goData)) {
    return { errors, warnings, validationIssues: null };
  }

  // Always run current validation; do not short-circuit on existing errors so that
  // re-validation after save (e.g. enrichment with mapped inputs) can clear the error icon.
  const validationIssues = getStructuredValidation(nodeData);

  if (validationIssues && validationIssues.length > 0) {
    const structuredErrors = validationIssues.filter(i => i.severity === 'error');
    const structuredWarnings = validationIssues.filter(i => i.severity === 'warning');
    return {
      errors: structuredErrors.map(i => i.message),
      warnings: structuredWarnings.map(i => i.message),
      validationIssues,
    };
  }

  if (type === HTTP_TYPE) {
    const hasUrl = hasFxContent(goData.url);
    if (!hasUrl) {
      errors.push("API endpoint URL is missing — enter the URL this step should call");
    }
    const method = (goData.method || '').toUpperCase();
    if (method && ['POST', 'PUT', 'PATCH'].includes(method)) {
      if (!hasRequestBodyContent(goData.body) && !hasFxContent(goData.payload)) {
        warnings.push(`${method} request has no body — most ${method} requests need data to send`);
      }
    }
  } else if (type === INTEGRATION_TYPE) {
    if (!goData.connectionId && !goData.connection) {
      if (goData.integration && goData.integrationEvent) {
        errors.push("Connect your account to activate this trigger");
      } else {
        errors.push("No integration connected — select an integration to use this step");
      }
    } else {
      const flow = goData.flow;
      if (!flow || (typeof flow === 'object' && Object.keys(flow).length === 0)) {
        warnings.push("Integration is connected but no action is selected — choose what this step should do");
      }
    }
  } else if (GPT_TYPES.includes(type)) {
    const hasPrompt = hasFxContent(goData.prompt) || hasFxContent(goData.query);
    const hasSystemPrompt = hasFxContent(goData.systemPrompt) || hasFxContent(goData.persona);
    if (!hasPrompt && !hasSystemPrompt) {
      errors.push("AI prompt is empty — write instructions for what the AI should do");
    }
  } else if (type === TRANSFORMER_TYPE || type === TRANSFORMER_TYPE_V3 || type === FORMULA_FX_TYPE) {
    const contentBlocks = goData.content?.blocks || goData.content;
    if (!hasFxContent(goData.expression) && !hasFxContent(goData.formula) && !hasFxContent(contentBlocks)) {
      errors.push("No expression defined — write a formula or expression to transform your data");
    }
  } else if (type === SEND_EMAIL_TO_YOURSELF_TYPE) {
    if (!hasFxContent(goData.subject)) {
      errors.push("Email subject is missing — add a subject line for the notification");
    }
    if (!hasFxContent(goData.body)) {
      errors.push("Email body is empty — write the content you want to receive");
    }
  } else if (DB_TYPES.includes(type)) {
    if (!goData.connection && !goData.connectionId) {
      errors.push("No database connected — select a database connection for this step");
    }
    if (type === EXECUTE_TYPE || type === EXECUTE_V2_TYPE) {
      if (!hasFxContent(goData.query) && !hasFxContent(goData.sql)) {
        errors.push("No query defined — write the SQL or database query to run");
      }
    }
    if (!goData.table && !goData.collection && type !== EXECUTE_TYPE && type !== EXECUTE_V2_TYPE) {
      warnings.push("No table selected — choose which table or collection to work with");
    }
  } else if (SHEET_TYPES.includes(type)) {
    if (!goData.connection && !goData.connectionId && !goData.asset) {
      errors.push("No sheet selected — choose a sheet to work with");
    }
  } else if (ENRICHMENT_TYPES.includes(type)) {
    const hasLegacyInput =
      hasFxContent(goData.input) || hasFxContent(goData.inputs) || hasFxContent(goData.email);
    const hasPersonInput =
      hasFxContent(goData.fullName) && hasFxContent(goData.domain);
    const hasCompanyInput =
      hasFxContent(goData.domain) || hasFxContent(goData.companyName);
    const hasEmailInput =
      hasFxContent(goData.domain) && hasFxContent(goData.fullName);
    const isPerson =
      type === PERSON_ENRICHMENT_TYPE || type === PERSON_ENRICHMENT_V2_TYPE;
    const isCompany =
      type === COMPANY_ENRICHMENT_TYPE || type === COMPANY_ENRICHMENT_V2_TYPE;
    const isEmail =
      type === EMAIL_ENRICHMENT_TYPE || type === EMAIL_ENRICHMENT_V2_TYPE;
    const hasValidInput =
      hasLegacyInput ||
      (isPerson && hasPersonInput) ||
      (isCompany && hasCompanyInput) ||
      (isEmail && hasEmailInput);
    if (!hasValidInput) {
      errors.push("No input provided — add an email, domain, or name to look up");
    }
  } else if (type === CONNECTION_SETUP_TYPE || type === CONNECTION_SETUP_V2_TYPE) {
    if (!goData.connectionId && !goData.connection) {
      errors.push("No connection selected — choose or create a connection to use");
    }
  } else if (type === WEBHOOK_TYPE || type === WEBHOOK_TYPE_V2) {
  } else if (type === TRIGGER_SETUP_TYPE) {
    if (!goData.triggerType) {
      warnings.push("No trigger type selected — choose how this workflow should start");
    }
  }

  return { errors, warnings, validationIssues: null };
}

const TYPES_REQUIRING_CONFIG = new Set([
  HTTP_TYPE,
  INTEGRATION_TYPE,
  ...GPT_TYPES,
  TRANSFORMER_TYPE,
  TRANSFORMER_TYPE_V3,
  FORMULA_FX_TYPE,
  SEND_EMAIL_TO_YOURSELF_TYPE,
  ...DB_TYPES,
  ...SHEET_TYPES,
  ...ENRICHMENT_TYPES,
  CONNECTION_SETUP_TYPE,
  CONNECTION_SETUP_V2_TYPE,
]);

export function validateNodeForRun(nodeData) {
  const goData = nodeData?.go_data;
  const type = nodeData?.type;

  if (!hasBeenTouched(goData) && type && TYPES_REQUIRING_CONFIG.has(type)) {
    return {
      errors: ["This step hasn't been configured yet — open it and set it up before running"],
      warnings: [],
      validationIssues: null,
    };
  }

  return validateNodeConfig(nodeData);
}
