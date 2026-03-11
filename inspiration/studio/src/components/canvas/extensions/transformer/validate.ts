import {
  registerValidator,
  createValidationResult,
  required,
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
  if (Array.isArray(fxValue) && fxValue.length > 0) {
    return fxValue.some((b: any) => b.value && String(b.value).trim() !== '');
  }
  return false;
}

export function validateTransformer(context: NodeValidationContext) {
  const issues: ValidationIssue[] = [];
  const tfData = context.tfData || {};
  const goData = context.goData || {};

  const expression = goData.expression || goData.formula || tfData.expression || tfData.formula;
  const contentBlocks = goData.content?.blocks || goData.content;
  const hasContent = hasFxContent(expression) || hasFxContent(contentBlocks);
  if (!hasContent) {
    issues.push(required(
      'expression',
      'Expression/Formula',
      'Write a JavaScript expression to transform your data'
    ));
  }

  return createValidationResult(issues);
}

registerValidator('Transformer', validateTransformer);
registerValidator('TRANSFORMER_V3', validateTransformer);
