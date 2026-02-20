import { BadRequestException } from '@nestjs/common';

/**
 * Extracts field dependencies from a formula expression
 * @param expression - The formula expression object with blocks array
 * @returns Array of dbFieldNames that the expression depends on
 */
export function extractDependenciesFromExpression(expression: any): string[] {
  if (!expression || !expression.blocks || !Array.isArray(expression.blocks)) {
    throw new BadRequestException('Invalid expression format');
  }

  const dependencies = new Set<string>();

  // Iterate through all blocks
  expression.blocks.forEach((block: any) => {
    // Check if block is a field
    if (block.type === 'FIELDS' && block.tableData?.dbFieldName) {
      dependencies.add(block.tableData.dbFieldName);
    }
  });

  return Array.from(dependencies);
}
