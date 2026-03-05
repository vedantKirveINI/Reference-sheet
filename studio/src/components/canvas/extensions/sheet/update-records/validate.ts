import {
  registerValidator,
  createValidationResult,
  required,
  NodeValidationContext,
  ValidationIssue
} from '../../validation/index';

export function validateUpdateSheetRecords(context: NodeValidationContext) {
  const issues: ValidationIssue[] = [];
  const tfData = context.tfData || {};
  const goData = context.goData || {};
  const config = tfData.config || {};

  const asset = tfData.asset || config.asset || goData.asset;
  if (!asset) {
    issues.push(required(
      'asset',
      'Sheet',
      'Select a sheet containing the records to update'
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

  const recordId =
    tfData.recordId ||
    tfData.record_id ||
    tfData.lookupField ||
    tfData.rowIdentifier ||
    tfData.filter ||
    tfData.whereClause ||
    config.recordId ||
    config.record_id ||
    config.lookupField ||
    config.rowIdentifier ||
    config.filter ||
    config.whereClause ||
    goData.recordId ||
    goData.record_id ||
    goData.lookupField ||
    goData.rowIdentifier ||
    goData.filter ||
    goData.whereClause;
  if (!recordId) {
    issues.push(required(
      'recordId',
      'Record identifier',
      'Specify which record to update (e.g., by ID or lookup field)'
    ));
  }

  const record = tfData.record || config.record || goData.record || tfData.inputs || [];

  const hasActualValue = (r: any): boolean => {
    if (!r) return false;
    const value = r.value;
    if (value === undefined || value === null || value === '') return false;
    if (typeof value === 'object' && value !== null) {
      if (value.type === 'fx') {
        const hasBlockStr = value.blockStr && value.blockStr.trim() !== '';
        const hasBlocks = Array.isArray(value.blocks) && value.blocks.length > 0;
        return hasBlockStr || hasBlocks;
      }
      return Object.keys(value).length > 0;
    }
    if (typeof value === 'string') {
      return value.trim() !== '';
    }
    return true;
  };

  const hasFieldMappings = Array.isArray(record) && record.length > 0 &&
    record.some(hasActualValue);
  if (!hasFieldMappings) {
    issues.push(required(
      'record',
      'Field updates',
      'Choose at least one field to update with a value'
    ));
  }

  return createValidationResult(issues);
}

registerValidator('UPDATE_ONE_SHEET_RECORD', validateUpdateSheetRecords);
