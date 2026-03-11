import questionDataTypeMapping from "@src/module/input-grid-v2/constant/questionDataTypeMapping";
import {
  getSheetTypeDisplayName,
  convertApplicationTypeToSDKType,
} from "../../sheetTypeMapping";
import { createComplexValueFromSubFields } from "../../sheetRecordUtils";

/**
 * Get field metadata (type mapping, display name, icon)
 * @param {Object} params
 * @param {Object} params.field - The field object
 * @returns {Object} - Metadata object with sdkType, displayName, iconUrl, schema
 */
export function getFieldMetadata({ field }) {
  const sdkType = convertApplicationTypeToSDKType(field.type);
  const fieldTypeUpper = String(field.type || "").toUpperCase();
  const typeMapping = questionDataTypeMapping[fieldTypeUpper] || {};
  const displayName = typeMapping.alias || getSheetTypeDisplayName(field.type);
  const iconUrl = field.icon || typeMapping.icon || "";

  return {
    sdkType,
    displayName,
    iconUrl,
    schema: typeMapping.schema || [],
  };
}

/**
 * Create a subField value object
 * @param {Object} params
 * @param {Array} params.blocks - The blocks array
 * @param {string} params.blockStr - The block string
 * @returns {Object} - SubField value object
 */
export function createSubFieldValue({ blocks, blockStr }) {
  return {
    type: "fx",
    blocks: blocks,
    blockStr: blockStr,
  };
}

/**
 * Create a record item from a field
 * @param {Object} params
 * @param {Object} params.field - The field object
 * @param {Object} params.value - The value object (with blocks and blockStr)
 * @param {Object} [params.subFields] - Optional subFields object
 * @param {Object} [params.complexSchema] - Optional complex schema for subFields
 * @returns {Object} - Record item object
 */
export function createRecordItemFromField({ field, value, subFields = undefined, complexSchema = null }) {
  const metadata = getFieldMetadata({ field });
  const existingSubFields = subFields;

  const recordItem = {
    isChecked: true,
    id: field.id,
    key: field.name,
    fieldId: field.id,
    fieldFormat: field.fieldFormat || "",
    type: metadata.sdkType,
    dbFieldType: field.dbFieldType,
    dbFieldName: field.dbFieldName,
    field: field.id || field.dbFieldName,
    isValueMode: true,
    value: value,
    alias: metadata.displayName,
    icon: metadata.iconUrl,
    schema: metadata.schema,
    path: [field.name],
  };

  if (existingSubFields !== undefined) {
    recordItem.subFields = existingSubFields;
  }

  // If we have subFields and complexSchema, serialize the value
  if (subFields && complexSchema) {
    recordItem.value = createComplexValueFromSubFields(subFields, complexSchema);
  }

  return recordItem;
}

