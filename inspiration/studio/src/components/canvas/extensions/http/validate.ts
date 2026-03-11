import {
  registerValidator,
  createValidationResult,
  required,
  recommended,
  NodeValidationContext,
  ValidationIssue
} from '../validation/index';

function hasFxContent(fxValue: any): boolean {
  if (!fxValue) return false;
  if (typeof fxValue === 'string') return fxValue.trim().length > 0;
  if (fxValue.text && fxValue.text.trim().length > 0) return true;
  if (fxValue.blocks && fxValue.blocks.length > 0) {
    return fxValue.blocks.some((b: any) => b.value && String(b.value).trim() !== '');
  }
  return false;
}

/**
 * HTTP node stores body as { type, data, sub_type, jsonGridData, jsonFxData, ... }.
 * Actual payload is in body.data (raw FX) or body.jsonFxData (raw JSON). This helper
 * checks whether the body has content using that shape so we don't falsely warn
 * when body is set with raw JSON/form-data/binary.
 */
function hasRequestBodyContent(body: any): boolean {
  if (!body || typeof body !== 'object') return false;
  if (body.type === 'none' || !body.type) return false;
  if (body.type === 'raw') {
    const data = body.data || body.jsonFxData;
    return hasFxContent(data);
  }
  if (body.type === 'form-data' || body.type === 'url_encoded') {
    const data = body.data;
    return Array.isArray(data) && data.length > 0;
  }
  if (body.type === 'binary') {
    return !!(body.data || (body.binaryFxData?.blocks?.length > 0));
  }
  return false;
}

export function validateHTTP(context: NodeValidationContext) {
  const issues: ValidationIssue[] = [];
  const tfData = context.tfData || {};
  const goData = context.goData || {};

  const url = goData.url || tfData.url;
  if (!hasFxContent(url)) {
    issues.push(required(
      'url',
      'URL',
      'Enter the API endpoint URL to send requests to'
    ));
  }

  const method = goData.method || tfData.method;
  if (!method) {
    issues.push(recommended(
      'method',
      'HTTP Method',
      'GET will be used by default. Set a method if you need POST, PUT, etc.'
    ));
  }

  if (method && ['POST', 'PUT', 'PATCH'].includes(String(method).toUpperCase())) {
    const body = goData.body || goData.payload || tfData.body || tfData.payload;
    if (!hasRequestBodyContent(body)) {
      issues.push(recommended(
        'body',
        'Request Body',
        'POST/PUT/PATCH requests typically need a request body'
      ));
    }
  }

  return createValidationResult(issues);
}

registerValidator('HTTP', validateHTTP);
