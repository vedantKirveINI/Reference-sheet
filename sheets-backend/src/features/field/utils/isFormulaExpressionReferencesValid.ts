import { BadRequestException } from '@nestjs/common';
import { field } from '@prisma/client';
import { ComputedFieldMetaDTO } from '../DTO/computed-field-meta.dto';

export function isFormulaExpressionReferencesValid(
  expression: any,
  allFields: field[],
): boolean {
  if (!expression || !expression.blocks || !Array.isArray(expression.blocks)) {
    return false;
  }

  for (const block of expression.blocks) {
    if (block.type === 'FIELDS' && block?.tableData && block?.tableData?.id) {
      const field: field | undefined = allFields.find(
        (field) => field.id === block?.tableData?.id,
      );

      if (!field) {
        throw new BadRequestException(
          `Field "${block?.tableData?.name}" referenced in the formula does not exist`,
        );
      }

      if (field.type === 'FORMULA') {
        if ((field.computedFieldMeta as ComputedFieldMetaDTO).hasError) {
          throw new BadRequestException(
            `Formula field "${field.name}" has an error and cannot be used in expressions`,
          );
        }
      }
    }
  }

  return true; // No error
}
