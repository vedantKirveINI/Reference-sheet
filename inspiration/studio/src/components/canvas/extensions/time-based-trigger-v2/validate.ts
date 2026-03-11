import {
  registerValidator,
  createValidationResult,
  required,
  NodeValidationContext,
  ValidationIssue
} from '../validation/index';

export function validateTimeBasedTrigger(context: NodeValidationContext) {
  const issues: ValidationIssue[] = [];
  const tfData = context.tfData || {};
  const goData = context.goData || {};

  const schedule = goData.schedule || goData.cron || goData.scheduleType || tfData.schedule || tfData.cron || tfData.scheduleType;
  if (!schedule) {
    issues.push(required(
      'schedule',
      'Schedule',
      'Set when this workflow should run (e.g., every hour, daily)'
    ));
  }

  return createValidationResult(issues);
}

registerValidator('TIME_BASED_TRIGGER_V2', validateTimeBasedTrigger);
