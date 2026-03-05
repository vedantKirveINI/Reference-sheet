import {
  registerValidator,
  createValidationResult,
  required,
  NodeValidationContext,
  ValidationIssue
} from '../../validation/index';

export function validateFindAllSheetRecord(context: NodeValidationContext) {
  const issues: ValidationIssue[] = [];
  const tfData = context.tfData || {};
  const goData = context.goData || {};
  const config = tfData.config || {};

  const asset = tfData.asset || config.asset || goData.asset;
  if (!asset) {
    issues.push(required(
      'asset',
      'Sheet',
      'Select a sheet to search records from'
    ));
  }

  const subSheet = tfData.subSheet || config.subSheet || goData.subSheet;
  if (!subSheet) {
    issues.push(required(
      'subSheet',
      'Table/Sheet',
      'Choose which table within the sheet'
    ));
  }

  return createValidationResult(issues);
}

registerValidator('FIND_ALL_SHEET_RECORD_V2', validateFindAllSheetRecord);
