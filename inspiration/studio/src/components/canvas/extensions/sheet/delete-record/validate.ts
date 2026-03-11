import {
  registerValidator,
  createValidationResult,
  required,
  NodeValidationContext,
  ValidationIssue
} from '../../validation/index';

export function validateDeleteSheetRecord(context: NodeValidationContext) {
  const issues: ValidationIssue[] = [];
  const tfData = context.tfData || {};
  const goData = context.goData || {};
  const config = tfData.config || {};

  const asset = tfData.asset || config.asset || goData.asset;
  if (!asset) {
    issues.push(required(
      'asset',
      'Sheet',
      'Select a sheet to delete records from'
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

  const recordIdentifier = tfData.filter || config.filter || goData.filter ||
    tfData.lookupField || config.lookupField || goData.lookupField ||
    tfData.recordId || config.recordId || goData.recordId;
  if (!recordIdentifier) {
    issues.push(required(
      'recordId',
      'Record identifier',
      'Specify which record to delete'
    ));
  }

  return createValidationResult(issues);
}

registerValidator('DELETE_SHEET_RECORD', validateDeleteSheetRecord);
