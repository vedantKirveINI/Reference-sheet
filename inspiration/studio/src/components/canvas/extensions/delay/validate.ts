import {
  registerValidator,
  createValidationResult,
  recommended,
  NodeValidationContext,
  ValidationIssue
} from '../validation/index';

function hasDelayValue(value: unknown): boolean {
  if (!value) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (typeof value === 'object' && value !== null && 'blocks' in value) {
    const blocks = (value as { blocks?: unknown[] }).blocks;
    return Array.isArray(blocks) && blocks.some(
      (b) => b && typeof b === 'object' && 'value' in b && String((b as { value: unknown }).value).trim() !== ''
    );
  }
  return true;
}

export function validateDelay(context: NodeValidationContext) {
  const issues: ValidationIssue[] = [];
  const tfData = context.tfData || {};
  const goData = context.goData || {};

  const duration =
    goData.duration ?? goData.delay ?? goData.time ?? goData.delayTime ??
    tfData.duration ?? tfData.delay ?? tfData.delayTime;
  const hasDuration = duration && hasDelayValue(duration);
  if (!hasDuration) {
    issues.push(recommended(
      'duration',
      'Duration',
      'Set how long to wait before continuing (default may apply)'
    ));
  }

  return createValidationResult(issues);
}

registerValidator('Delay', validateDelay);
registerValidator('DELAY_V2', validateDelay);
