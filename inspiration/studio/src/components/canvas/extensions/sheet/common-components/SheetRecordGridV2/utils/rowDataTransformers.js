import { getComplexTypeSchema } from "../../sheetRecordUtils";

/**
 * Calculate the count of filled subFields
 * @param {Object} params
 * @param {Object} params.subFields - The subFields object
 * @returns {number} - Count of filled subFields
 */
export function calculateFilledSubFieldCount({ subFields }) {
  return Object.keys(subFields || {}).filter(k => {
    const val = subFields[k];
    return val?.blocks?.length > 0 || val?.blockStr;
  }).length;
}

/**
 * Build a parent row for complex types
 * @param {Object} params
 * @param {Object} params.field - The field object
 * @param {Object} params.recordItem - The record item
 * @param {boolean} params.isCollapsed - Whether the field is collapsed
 * @param {Array} params.complexSchema - The complex schema
 * @returns {Object} - Parent row data
 */
export function buildParentRow({ field, recordItem, isCollapsed, complexSchema }) {
  const filledCount = calculateFilledSubFieldCount({ subFields: recordItem?.subFields });

  return {
    key: field.name,
    fieldId: field.id,
    value: recordItem?.value || [],
    fieldType: field.type || "text",
    required: field.required === true,
    field: field,
    isParent: true,
    isCollapsed: isCollapsed,
    subFieldSchema: complexSchema,
    subFieldValues: recordItem?.subFields || {},
    subFieldCount: complexSchema.length,
    filledSubFieldCount: filledCount,
    isEditable: false,
  };
}

/**
 * Build child rows for complex types
 * @param {Object} params
 * @param {Object} params.field - The field object
 * @param {Object} params.recordItem - The record item
 * @param {Array} params.complexSchema - The complex schema
 * @returns {Array} - Array of child row data
 */
export function buildChildRows({ field, recordItem, complexSchema }) {
  return complexSchema.map((subField, subIndex) => {
    const subFieldValue = recordItem?.subFields?.[subField.key];
    return {
      key: subField.displayKeyName || subField.key,
      fieldId: `${field.id}__${subField.key}`,
      parentFieldId: field.id,
      subFieldKey: subField.key,
      value: subFieldValue?.blocks || [],
      fieldType: subField.type || "String",
      required: false,
      field: field,
      isChild: true,
      isFirstChild: subIndex === 0,
      isLastChild: subIndex === complexSchema.length - 1,
      parentType: field.type,
      isEditable: true,
      subFieldDescription: subField.description,
      subFieldExample: subField.example,
    };
  });
}

/**
 * Build a simple row for non-complex types
 * @param {Object} params
 * @param {Object} params.field - The field object
 * @param {Object} params.recordItem - The record item
 * @returns {Object} - Simple row data
 */
export function buildSimpleRow({ field, recordItem }) {
  const subType = field.type === "YES_NO" ? field?.options?.sub_type : undefined;
  return {
    key: field.name,
    fieldId: field.id,
    value: recordItem?.value?.blocks || [],
    fieldType: field.type || "text",
    required: field.required === true,
    field: field,
    isParent: false,
    isChild: false,
    isEditable: true,
    ...(subType ? { subType } : {}),
  };
}

/**
 * Transform fields and records into row data for the grid
 * @param {Object} params
 * @param {Array} params.fields - Array of field objects
 * @param {Array} params.record - Array of record items
 * @param {Set} params.collapsedFields - Set of collapsed field IDs
 * @returns {Array} - Array of row data objects
 */
export function transformFieldsToRows({ fields, record, collapsedFields }) {
  const rows = [];

  fields.forEach((field) => {
    const recordItem = record.find((r) => r.fieldId === field.id);
    const complexSchema = getComplexTypeSchema(field.type);
    const isCollapsed = collapsedFields.has(field.id);

    if (complexSchema) {
      // Add parent row
      rows.push(buildParentRow({ field, recordItem, isCollapsed, complexSchema }));

      // Add child rows if not collapsed
      if (!isCollapsed) {
        const childRows = buildChildRows({ field, recordItem, complexSchema });
        rows.push(...childRows);
      }
    } else {
      // Add simple row
      rows.push(buildSimpleRow({ field, recordItem }));
    }
  });

  return rows;
}

