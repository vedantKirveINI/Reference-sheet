import {
  registerValidator,
  createValidationResult,
  required,
  NodeValidationContext,
  ValidationIssue
} from '../validation/index';

/**
 * For Each (list mode) boot data shape:
 * - listSource: { type: "fx", blocks: [single block at index 0] }
 * - The only block is at blocks[0]; it may have variableData.type === "array".
 */
export function validateForEach(context: NodeValidationContext) {
  const issues: ValidationIssue[] = [];
  const goData = context.goData || {};
  const listSource = goData.listSource;
  const blocks = listSource?.blocks;

  const block = Array.isArray(blocks) && blocks.length > 0 ? blocks[0] : null;
  if (!block) {
    issues.push(required(
      'collection',
      'Collection',
      'Select the list or array to loop through'
    ));
    return createValidationResult(issues);
  }

  const variableData = block.variableData;
  if (!variableData || variableData.type !== 'array') {
    issues.push(required(
      'collection',
      'Collection',
      'Select a list or array to loop through'
    ));
  }

  return createValidationResult(issues);
}

registerValidator('FOR_EACH', validateForEach);
