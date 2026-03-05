import {
  registerValidator,
  createValidationResult,
  required,
  NodeValidationContext,
  ValidationIssue
} from '../validation/index';

export function validateConnectionSetup(context: NodeValidationContext) {
  const issues: ValidationIssue[] = [];
  const tfData = context.tfData || {};
  const goData = context.goData || {};

  const connection = goData.connectionId || goData.connection ||
    tfData.connectionId || tfData.connection;
  if (!connection) {
    issues.push(required(
      'connection',
      'Connection',
      'Select or create a connection to use'
    ));
  }

  return createValidationResult(issues);
}

registerValidator('Connection Setup', validateConnectionSetup);
registerValidator('CONNECTION_SETUP_V2', validateConnectionSetup);
