import {
  registerValidator,
  createValidationResult,
  required,
  NodeValidationContext,
  ValidationIssue
} from '../validation/index';

/** Check if a value has content (string or fx blocks: primitives, variable refs, or other blocks). */
function hasFxContent(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  const obj = value as {
    text?: string;
    blocks?: Array<{
      type?: string;
      value?: string;
      displayValue?: string;
      variableData?: unknown;
      subCategory?: string;
    }>;
  };
  if (obj.text != null && typeof obj.text === 'string') return obj.text.trim().length > 0;
  const blocks = obj.blocks;
  if (!Array.isArray(blocks) || blocks.length === 0) return false;
  return blocks.some((block) => {
    if (block.type === 'PRIMITIVES') {
      return block.value != null && String(block.value).trim() !== '';
    }
    if (block.type != null && block.type !== 'PRIMITIVES') return true;
    if (block.variableData != null) return true;
    if (block.displayValue != null && String(block.displayValue).trim() !== '') return true;
    if (block.subCategory != null && block.subCategory !== 'PRIMITIVES') return true;
    return false;
  });
}

function validatePersonEnrichment(context: NodeValidationContext) {
  const issues: ValidationIssue[] = [];
  const tfData = context.tfData || {};
  const goData = context.goData || {};

  const fullName = goData.fullName ?? tfData.fullName;
  const domain = goData.domain ?? tfData.domain;
  const legacyInput = goData.input || goData.inputs || goData.email ||
    tfData.input || tfData.inputs || tfData.email;

  const hasFullName = hasFxContent(fullName);
  const hasDomain = hasFxContent(domain);
  const hasLegacyInput = hasFxContent(legacyInput);

  if (!hasFullName && !hasLegacyInput) {
    issues.push(required(
      'fullName',
      'Person\'s full name',
      'Provide the person\'s full name for accurate data enrichment'
    ));
  }
  if (!hasDomain && !hasLegacyInput) {
    issues.push(required(
      'domain',
      'Company domain',
      'Provide the company domain to improve search accuracy'
    ));
  }

  return createValidationResult(issues);
}

function validateCompanyEnrichment(context: NodeValidationContext) {
  const issues: ValidationIssue[] = [];
  const tfData = context.tfData || {};
  const goData = context.goData || {};

  const domain = goData.domain ?? tfData.domain;
  const companyName = goData.companyName ?? tfData.companyName;
  const legacyInput = goData.input || goData.inputs ||
    tfData.input || tfData.inputs;

  const hasDomain = hasFxContent(domain);
  const hasCompanyName = hasFxContent(companyName);
  const hasLegacyInput = hasFxContent(legacyInput);

  if (!hasDomain && !hasCompanyName && !hasLegacyInput) {
    issues.push(required(
      'domain',
      'Input data',
      'Provide a company domain or name to look up company details'
    ));
  }

  return createValidationResult(issues);
}

function validateEmailEnrichment(context: NodeValidationContext) {
  const issues: ValidationIssue[] = [];
  const tfData = context.tfData || {};
  const goData = context.goData || {};

  const domain = goData.domain ?? tfData.domain;
  const fullName = goData.fullName ?? tfData.fullName;
  const legacyInput = goData.input || goData.inputs || goData.email ||
    tfData.input || tfData.inputs || tfData.email;

  const hasDomain = hasFxContent(domain);
  const hasFullName = hasFxContent(fullName);
  const hasLegacyInput = hasFxContent(legacyInput);

  if (!hasDomain && !hasLegacyInput) {
    issues.push(required(
      'domain',
      'Company domain',
      'Provide the company domain for email enrichment'
    ));
  }
  if (!hasFullName && !hasLegacyInput) {
    issues.push(required(
      'fullName',
      'Person\'s full name / email',
      'Provide the person\'s full name or email to verify and enrich'
    ));
  }

  return createValidationResult(issues);
}

registerValidator('PERSON_ENRICHMENT', validatePersonEnrichment);
registerValidator('PERSON_ENRICHMENT_V2', validatePersonEnrichment);
registerValidator('COMPANY_ENRICHMENT', validateCompanyEnrichment);
registerValidator('COMPANY_ENRICHMENT_V2', validateCompanyEnrichment);
registerValidator('EMAIL_ENRICHMENT', validateEmailEnrichment);
registerValidator('EMAIL_ENRICHMENT_V2', validateEmailEnrichment);
