import {
  registerValidator,
  createValidationResult,
  required,
  recommended,
  NodeValidationContext,
  ValidationIssue
} from './index';
import { REPEAT_COUNT_MIN, REPEAT_COUNT_MAX } from '../repeat/constants';

function validateLog(context: NodeValidationContext) {
  const issues: ValidationIssue[] = [];
  const tfData = context.tfData || {};
  const goData = context.goData || {};

  // Check for content (used by Log nodes), message, or data
  const hasContent = goData.content || goData.message || goData.data || tfData.message || tfData.data;
  if (!hasContent) {
    issues.push(recommended(
      'content',
      'Message/Data',
      'Add a message or data to log for debugging'
    ));
  }

  return createValidationResult(issues);
}

function validateRepeat(context: NodeValidationContext) {
  const issues: ValidationIssue[] = [];
  const goData = context.goData || {};

  const repeatCount = goData.repeatCount;
  if (repeatCount === undefined || repeatCount === null || repeatCount < REPEAT_COUNT_MIN) {
    issues.push(required(
      'repeatCount',
      'Repeat count',
      `Repeat count must be between ${REPEAT_COUNT_MIN} and ${REPEAT_COUNT_MAX}`
    ));
  } else if (repeatCount > REPEAT_COUNT_MAX) {
    issues.push(required(
      'repeatCount',
      'Repeat count',
      `Repeat count cannot exceed ${REPEAT_COUNT_MAX}`
    ));
  }

  return createValidationResult(issues);
}

function validateLoopUntil(context: NodeValidationContext) {
  const issues: ValidationIssue[] = [];
  const tfData = context.tfData || {};
  const goData = context.goData || {};

  const condition = goData.condition || goData.conditions || tfData.condition || tfData.conditions;
  const hasCondition = Array.isArray(condition) ? condition.length > 0 : !!condition;
  if (!hasCondition) {
    issues.push(required(
      'condition',
      'Stop condition',
      'Define a condition that stops the loop when met'
    ));
  }

  return createValidationResult(issues);
}

registerValidator('LOG', validateLog);
registerValidator('LOG_V2', validateLog);
registerValidator('REPEAT', validateRepeat);
registerValidator('LOOP_UNTIL', validateLoopUntil);
