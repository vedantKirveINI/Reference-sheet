import { getComplexTypeSchema, createComplexValueFromSubFields } from "../../sheetRecordUtils";
import { createRecordItemFromField, createSubFieldValue } from "./recordItemUtils";

/**
 * Update a subField in an existing record item
 * @param {Object} params
 * @param {string} params.parentFieldId - The parent field ID
 * @param {string} params.subFieldKey - The subField key
 * @param {Object} params.newValue - The new subField value
 * @param {Array} params.fields - Array of field objects
 * @param {Array} params.record - Array of record items
 * @returns {Array} - Updated record array
 */
export function updateSubFieldInRecord({ parentFieldId, subFieldKey, newValue, fields, record }) {
  const parentField = fields.find((f) => f.id === parentFieldId);
  if (!parentField) return record;

  const existingRecord = [...record];
  const existingIndex = existingRecord.findIndex((r) => r.fieldId === parentFieldId);
  const complexSchema = getComplexTypeSchema(parentField.type);

  if (existingIndex >= 0) {
    const existingItem = existingRecord[existingIndex];
    const updatedSubFields = {
      ...existingItem.subFields,
      [subFieldKey]: newValue,
    };

    const serializedValue = createComplexValueFromSubFields(updatedSubFields, complexSchema);

    existingRecord[existingIndex] = {
      ...existingItem,
      subFields: updatedSubFields,
      value: serializedValue,
      isChecked: true,
    };
  } else {
    const newSubFields = {
      [subFieldKey]: newValue,
    };

    const serializedValue = createComplexValueFromSubFields(newSubFields, complexSchema);
    const newRecordItem = createRecordItemFromField({
      field: parentField,
      value: serializedValue,
      subFields: newSubFields,
      complexSchema: complexSchema,
    });

    existingRecord.push(newRecordItem);
  }

  return existingRecord;
}

/**
 * Handle change for a child field (subField of a complex type)
 * @param {Object} params
 * @param {Object} params.rowInfo - The row information
 * @param {Object} params.newData - The new data
 * @param {Array} params.fields - Array of field objects
 * @param {Array} params.record - Array of record items
 * @returns {Array} - Updated record array
 */
export function handleChildFieldChange({ rowInfo, newData, fields, record }) {
  const parentFieldId = rowInfo.parentFieldId;
  const subFieldKey = rowInfo.subFieldKey;
  const parentField = fields.find((f) => f.id === parentFieldId);
  if (!parentField) return record;

  const blocks = newData.value?.value || newData.value || [];
  const blockStr = newData.value?.blockStr || "";
  const newSubFieldValue = createSubFieldValue({ blocks, blockStr });

  return updateSubFieldInRecord({ parentFieldId, subFieldKey, newValue: newSubFieldValue, fields, record });
}

/**
 * Handle change for a simple field (non-complex type)
 * @param {Object} params
 * @param {Object} params.rowInfo - The row information
 * @param {Object} params.newData - The new data
 * @param {Array} params.fields - Array of field objects
 * @param {Array} params.record - Array of record items
 * @returns {Array} - Updated record array
 */
export function handleSimpleFieldChange({ rowInfo, newData, fields, record }) {
  const field = rowInfo.field;
  const existingRecord = [...record];
  const existingIndex = existingRecord.findIndex((r) => r.fieldId === field.id);

  const blocks = newData.value?.value || newData.value || [];
  const blockStr = newData.value?.blockStr || "";
  const value = { type: "fx", blocks: blocks, blockStr: blockStr };

  const existingSubFields = existingIndex >= 0 ? existingRecord[existingIndex].subFields : undefined;
  const newItem = createRecordItemFromField({ field, value, subFields: existingSubFields });

  if (existingIndex >= 0) {
    existingRecord[existingIndex] = { ...existingRecord[existingIndex], ...newItem };
  } else {
    existingRecord.push(newItem);
  }

  return existingRecord;
}

