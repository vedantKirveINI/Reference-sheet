import {
  registerValidator,
  createValidationResult,
  required,
  recommended,
  NodeValidationContext,
  ValidationIssue
} from '../validation/index';

export function validateIntegration(context: NodeValidationContext) {
  const issues: ValidationIssue[] = [];
  const tfData = context.tfData || {};
  const goData = context.goData || {};

  const connection = goData.connectionId || goData.connection || tfData.connectionId || tfData.connection;
  if (!connection) {
    issues.push(required(
      'connection',
      'Connection',
      'Select an integration connection to use'
    ));
  }

  if (connection) {
    const flow = goData.flow || tfData.flow;
    if (!flow) {
      issues.push(recommended(
        'flow',
        'Action',
        'Choose an action to perform with this integration'
      ));
    }
  }

  return createValidationResult(issues);
}

registerValidator('Integration', validateIntegration);
