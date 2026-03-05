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
  return false;
}

export function validateSendEmailToYourself(context: NodeValidationContext) {
  const issues: ValidationIssue[] = [];
  const tfData = context.tfData || {};
  const goData = context.goData || {};

  const subject = goData.subject || tfData.subject;
  if (!hasFxContent(subject)) {
    issues.push(required(
      'subject',
      'Subject',
      'Add a subject line for the notification email'
    ));
  }

  const body = goData.body || tfData.body;
  if (!hasFxContent(body)) {
    issues.push(required(
      'body',
      'Body',
      'Write the email content you want to receive'
    ));
  }

  return createValidationResult(issues);
}

registerValidator('SELF_EMAIL', validateSendEmailToYourself);
