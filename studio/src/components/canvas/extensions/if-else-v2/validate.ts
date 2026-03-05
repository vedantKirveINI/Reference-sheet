import {
  registerValidator,
  createValidationResult,
  recommended,
  NodeValidationContext,
  ValidationIssue
} from '../validation/index';

export function validateIfElseV2(context: NodeValidationContext) {
  const issues: ValidationIssue[] = [];
  const tfData = context.tfData || {};
  const goData = context.goData || {};

  const conditions = goData.conditions || tfData.conditions;
  const hasConditions = Array.isArray(conditions) ? conditions.length > 0 : !!conditions;
  if (!hasConditions) {
    issues.push(recommended(
      'conditions',
      'Conditions',
      'Add at least one condition to control the workflow path'
    ));
  }

  return createValidationResult(issues);
}

registerValidator('IFELSE_V2', validateIfElseV2);
