import {
  registerValidator,
  createValidationResult,
  required,
  recommended,
  NodeValidationContext,
  ValidationIssue
} from '../../validation/index';

export function validateFindOneSheetRecord(context: NodeValidationContext) {
  const issues: ValidationIssue[] = [];
  const tfData = context.tfData || {};
  const goData = context.goData || {};
  const config = tfData.config || {};

  const asset = tfData.asset || config.asset || goData.asset;
  if (!asset) {
    issues.push(required(
      'asset',
      'Sheet',
      'Select a sheet to find a record from'
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

  const filter = tfData.filter || config.filter || goData.filter || tfData.lookupField || config.lookupField;
  if (!filter) {
    issues.push(recommended(
      'filter',
      'Filter/Lookup',
      'Add a filter to identify the specific record'
    ));
  }

  return createValidationResult(issues);
}

registerValidator('FIND_ONE_SHEET_RECORD_V2', validateFindOneSheetRecord);
