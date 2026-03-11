import {
  registerValidator,
  createValidationResult,
  required,
  NodeValidationContext,
  ValidationIssue
} from '../../validation/index';

export function validateCreateSheetRecord(context: NodeValidationContext) {
  const issues: ValidationIssue[] = [];
  const tfData = context.tfData || {};
  const goData = context.goData || {};
  const config = tfData.config || {};

  const asset = tfData.asset || config.asset || goData.asset;
  if (!asset) {
    issues.push(required(
      'asset',
      'Sheet',
      'Select a sheet to save records to'
    ));
  }

  // Check subSheet in multiple possible locations
  const subSheet = tfData.subSheet || config.subSheet || goData.subSheet;
  if (!subSheet) {
    issues.push(required(
      'subSheet',
      'Table/Sheet',
      'Choose which table within the sheet'
    ));
  }

  // Check record/inputs in multiple possible locations
  const record = tfData.record || config.record || goData.record || tfData.inputs || [];

  // Helper to check if a field mapping has an actual value
  const hasActualValue = (r: any): boolean => {
    if (!r) return false;
    const value = r.value;
    if (value === undefined || value === null || value === '') return false;
    // If value is an fx object, check blockStr or blocks
    if (typeof value === 'object' && value !== null) {
      if (value.type === 'fx') {
        const hasBlockStr = value.blockStr && value.blockStr.trim() !== '';
        const hasBlocks = Array.isArray(value.blocks) && value.blocks.length > 0;
        return hasBlockStr || hasBlocks;
      }
      // For other objects, check if they have meaningful content
      return Object.keys(value).length > 0;
    }
    // If value is a string, check it's not empty
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
      'Field mappings',
      'Map at least one column with an actual value from your form'
    ));
  }

  return createValidationResult(issues);
}

registerValidator('CREATE_SHEET_RECORD_V2', validateCreateSheetRecord);
registerValidator('CREATE_SHEET_RECORD_V3', validateCreateSheetRecord);
